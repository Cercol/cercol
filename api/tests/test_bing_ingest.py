"""
Tests for api/jobs/bing_ingest.py.

# Spec: docs/architecture/seo-pipeline.md

All tests are offline. No real Bing API call, no real BigQuery call.
The HTTP layer is mocked via httpx.MockTransport; the BigQuery client
is a hand-rolled stub that records queries and inserts.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Any

import httpx
import pytest

# Match the existing pattern in api/tests/test_scoring.py: add api/ to
# sys.path so the top-level `jobs` package resolves under that root.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from jobs import bing_ingest  # noqa: E402
from jobs._config import JobConfig, MissingSecret  # noqa: E402


FIXTURES = Path(__file__).parent / "fixtures" / "bing"


def _load(name: str) -> dict[str, Any]:
    return json.loads((FIXTURES / name).read_text())


def _make_cfg(**overrides: Any) -> JobConfig:
    base = dict(
        bigquery_project="cercol",
        bigquery_dataset_gsc="searchconsole",
        bigquery_dataset_seo="cercol_seo",
        google_application_credentials="/fake/path.json",
        bing_wmt_api_key="EXAMPLE_KEY",
        pagespeed_api_key=None,
        site_url="https://cercol.team/",
    )
    base.update(overrides)
    return JobConfig(**base)


class FakeBQ:
    """Stub for the BigQuery client. Records every call for assertions."""

    def __init__(self) -> None:
        self.queries: list[str] = []
        self.inserts: list[tuple[str, list[dict[str, Any]]]] = []

    def query(self, sql: str):
        self.queries.append(sql)
        return self  # The real client returns a Job; .result() chains.

    def result(self):
        return None

    def insert_rows_json(self, table: str, rows: list[dict[str, Any]]):
        self.inserts.append((table, rows))
        return []  # No errors.


# ---------------------------------------------------------------------------
# Pure parsing
# ---------------------------------------------------------------------------

class TestParse:
    def test_query_stats(self):
        rows = bing_ingest.parse_query_stats(_load("query_stats_ok.json"))
        assert len(rows) == 2
        assert rows[0].query == "EXAMPLE cercol big five team"
        assert rows[0].impressions == 142
        assert rows[0].clicks == 3
        assert rows[0].avg_position == 8.4
        # Date 1716163200000 ms = 2024-05-20 UTC.
        assert rows[0].date == "2024-05-20"

    def test_page_stats_handles_null_position(self):
        rows = bing_ingest.parse_page_stats(_load("page_stats_ok.json"))
        assert len(rows) == 2
        assert rows[1].avg_position is None

    def test_crawl_stats(self):
        rows = bing_ingest.parse_crawl_stats(_load("crawl_stats_ok.json"))
        assert len(rows) == 2
        assert rows[0].crawled_pages == 312
        assert rows[1].date == "2024-05-21"

    def test_normalise_date_iso(self):
        assert bing_ingest._normalise_date("2024-05-20T00:00:00") == "2024-05-20"

    def test_normalise_date_passthrough(self):
        assert bing_ingest._normalise_date("2024-05-20") == "2024-05-20"


# ---------------------------------------------------------------------------
# HTTP fetch with retries
# ---------------------------------------------------------------------------

class TestFetch:
    def _mock(self, handler):
        transport = httpx.MockTransport(handler)
        return httpx.Client(transport=transport)

    def test_ok_on_first_try(self):
        payload = _load("query_stats_ok.json")

        def handler(request: httpx.Request) -> httpx.Response:
            assert "GetQueryStats" in str(request.url)
            return httpx.Response(200, json=payload)

        with self._mock(handler) as http:
            got = bing_ingest._fetch(http, "GetQueryStats", "k", "https://x/")
        assert got == payload

    def test_retries_on_500_then_succeeds(self, monkeypatch):
        # Avoid sleeping in tests.
        monkeypatch.setattr(bing_ingest.time, "sleep", lambda *_: None)

        attempts = {"n": 0}
        payload = _load("query_stats_ok.json")

        def handler(request: httpx.Request) -> httpx.Response:
            attempts["n"] += 1
            if attempts["n"] < 3:
                return httpx.Response(500, json={"error": "boom"})
            return httpx.Response(200, json=payload)

        with self._mock(handler) as http:
            got = bing_ingest._fetch(http, "GetQueryStats", "k", "https://x/")
        assert attempts["n"] == 3
        assert got == payload

    def test_retries_on_rate_limit(self, monkeypatch):
        monkeypatch.setattr(bing_ingest.time, "sleep", lambda *_: None)
        attempts = {"n": 0}
        payload = _load("query_stats_ok.json")

        def handler(request: httpx.Request) -> httpx.Response:
            attempts["n"] += 1
            if attempts["n"] == 1:
                return httpx.Response(429, json={})
            return httpx.Response(200, json=payload)

        with self._mock(handler) as http:
            got = bing_ingest._fetch(http, "GetQueryStats", "k", "https://x/")
        assert attempts["n"] == 2
        assert got == payload

    def test_gives_up_after_max_retries(self, monkeypatch):
        monkeypatch.setattr(bing_ingest.time, "sleep", lambda *_: None)

        def handler(request: httpx.Request) -> httpx.Response:
            return httpx.Response(503, json={})

        with self._mock(handler) as http:
            with pytest.raises(httpx.HTTPStatusError):
                bing_ingest._fetch(http, "GetQueryStats", "k", "https://x/")


# ---------------------------------------------------------------------------
# End-to-end run with mocked HTTP + mocked BigQuery
# ---------------------------------------------------------------------------

class TestRun:
    def test_full_run_writes_three_tables(self, monkeypatch):
        monkeypatch.setattr(bing_ingest.time, "sleep", lambda *_: None)

        responses = {
            "GetQueryStats": _load("query_stats_ok.json"),
            "GetPageStats": _load("page_stats_ok.json"),
            "GetCrawlStats": _load("crawl_stats_ok.json"),
        }

        def handler(request: httpx.Request) -> httpx.Response:
            for method, payload in responses.items():
                if method in str(request.url):
                    return httpx.Response(200, json=payload)
            return httpx.Response(404)

        cfg = _make_cfg()
        bq = FakeBQ()
        with httpx.Client(transport=httpx.MockTransport(handler)) as http:
            counts = bing_ingest.run(cfg, http=http, bq_client=bq)

        assert counts == {
            "bing_query_stats": 2,
            "bing_page_stats": 2,
            "bing_crawl_stats": 2,
        }
        # Three DELETEs (one per table), three insert_rows_json calls.
        assert sum(1 for q in bq.queries if q.startswith("DELETE FROM")) == 3
        tables_written = {t for t, _ in bq.inserts}
        assert tables_written == {
            "cercol.cercol_seo.bing_query_stats",
            "cercol.cercol_seo.bing_page_stats",
            "cercol.cercol_seo.bing_crawl_stats",
        }

    def test_missing_secret_raises(self):
        cfg = _make_cfg(bing_wmt_api_key=None)
        with pytest.raises(MissingSecret):
            bing_ingest.run(cfg, http=httpx.Client(), bq_client=FakeBQ())
