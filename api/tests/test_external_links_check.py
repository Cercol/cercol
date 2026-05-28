"""
Tests for api/jobs/external_links_check.py.

# Spec: docs/architecture/seo-pipeline.md

Fully offline: the HTTP client and BigQuery client are stubs. Exercises
the broken/flaky classification and the end-to-end run() snapshot
(article fetch -> external-link extraction -> probe -> rows).
"""

from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest  # noqa: E402

from jobs import external_links_check as elc  # noqa: E402
from jobs._config import JobConfig  # noqa: E402


def _cfg() -> JobConfig:
    return JobConfig(
        bigquery_project="cercol",
        bigquery_dataset_gsc="searchconsole",
        bigquery_dataset_seo="cercol_seo",
        google_application_credentials=None,
        bing_wmt_api_key=None,
        pagespeed_api_key=None,
        site_url="https://cercol.team/",
    )


@pytest.mark.parametrize(
    "code,expected",
    [(None, True), (404, True), (200, False), (403, False), (429, False), (500, False), (503, False)],
)
def test_classify_broken(code, expected):
    assert elc.classify_broken(code) is expected


class FakeResponse:
    def __init__(self, status_code=200, json_data=None):
        self.status_code = status_code
        self._json = json_data or {}

    def raise_for_status(self):
        if self.status_code >= 400:
            raise RuntimeError(f"HTTP {self.status_code}")

    def json(self):
        return self._json


class FakeHTTP:
    """Stub httpx.Client. Routes by URL substring."""

    def __init__(self, listing, articles, head_status):
        self._listing = listing
        self._articles = articles
        self._head_status = head_status  # dict url -> code

    def get(self, url, timeout=None):
        if url.endswith("/blog"):
            return FakeResponse(200, self._listing)
        slug = url.rsplit("/", 1)[-1]
        if slug in self._articles:
            return FakeResponse(200, {"content": self._articles[slug]})
        return FakeResponse(404, {})

    def head(self, url, timeout=None, follow_redirects=False):
        return FakeResponse(self._head_status.get(url, 200))


class FakeBQ:
    def __init__(self):
        self.inserts = []

    def insert_rows_json(self, table, rows):
        self.inserts.append((table, rows))
        return []

    def query(self, sql):
        raise RuntimeError("no prior data")


def test_run_collects_probes_and_writes_snapshot():
    listing = [{"slug": "a"}, {"slug": "b"}]
    articles = {
        # 'a' links one good external and one 404; 'b' links the same good one.
        "a": {"en": "See [ok](https://good.example/x) and [bad](https://dead.example/y)."},
        "b": {"en": "Again [ok](https://good.example/x)."},
    }
    head_status = {"https://good.example/x": 200, "https://dead.example/y": 404}
    http = FakeHTTP(listing, articles, head_status)
    bq = FakeBQ()

    counts = elc.run(_cfg(), http_client=http, bq_client=bq, send_digest=False)

    assert counts["links"] == 3          # ok(a) + bad(a) + ok(b)
    assert counts["unique_urls"] == 2
    assert counts["broken"] == 1
    # One insert batch with all rows; the dead URL is flagged broken.
    table, rows = bq.inserts[0]
    assert table.endswith(".external_links_status")
    broken_rows = [r for r in rows if r["broken"]]
    assert len(broken_rows) == 1
    assert broken_rows[0]["url"] == "https://dead.example/y"
    assert broken_rows[0]["status_code"] == 404


def test_run_skips_internal_links():
    listing = [{"slug": "a"}]
    articles = {"a": {"en": "internal [x](/blog/other) only, plus [ext](https://e.example/z)."}}
    http = FakeHTTP(listing, articles, {"https://e.example/z": 200})
    bq = FakeBQ()
    counts = elc.run(_cfg(), http_client=http, bq_client=bq, send_digest=False)
    # Only the external link is recorded.
    assert counts["links"] == 1
    assert counts["unique_urls"] == 1
