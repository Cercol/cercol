"""
Tests for api/jobs/pagespeed_ingest.py.

# Spec: docs/architecture/seo-pipeline.md

All tests offline. No real PSI call, no real BigQuery call.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Any

import httpx
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from jobs import pagespeed_ingest  # noqa: E402
from jobs._config import JobConfig, MissingSecret  # noqa: E402


FIXTURES = Path(__file__).parent / "fixtures" / "pagespeed"


def _load(name: str) -> dict[str, Any]:
    return json.loads((FIXTURES / name).read_text())


def _make_cfg(**overrides: Any) -> JobConfig:
    base = dict(
        bigquery_project="cercol",
        bigquery_dataset_gsc="searchconsole",
        bigquery_dataset_seo="cercol_seo",
        google_application_credentials="/fake/path.json",
        bing_wmt_api_key=None,
        pagespeed_api_key="EXAMPLE_PSI_KEY",
        site_url="https://cercol.team/",
    )
    base.update(overrides)
    return JobConfig(**base)


class FakeBQ:
    """Stub BigQuery client."""

    def __init__(self, query_rows: list[dict[str, Any]] | Exception | None = None) -> None:
        self._query_rows = query_rows or []
        self.queries: list[str] = []
        self.inserts: list[tuple[str, list[dict[str, Any]]]] = []

    def query(self, sql: str):
        self.queries.append(sql)
        if isinstance(self._query_rows, Exception):
            raise self._query_rows
        return self

    def result(self):
        return iter(self._query_rows)

    def insert_rows_json(self, table: str, rows: list[dict[str, Any]]):
        self.inserts.append((table, rows))
        return []


# ---------------------------------------------------------------------------
# parse_psi
# ---------------------------------------------------------------------------

class TestParsePsi:
    def test_extracts_lab_and_field_metrics(self):
        payload = _load("psi_mobile_ok.json")
        row = pagespeed_ingest.parse_psi(
            payload, "https://cercol.team/", "mobile", "2026-05-22T08:00:00+00:00"
        )
        assert row.url == "https://cercol.team/"
        assert row.device == "mobile"
        assert row.lcp_ms == 2350
        assert row.fcp_ms == 1450
        assert row.cls == 0.03
        assert row.ttfb_ms == 220
        # Field metrics (CrUX) come from loadingExperience.metrics.
        assert row.fid_ms == 18
        assert row.inp_ms == 120
        # Scores converted from 0..1 to 0..100.
        assert row.performance_score == 82
        assert row.accessibility_score == 97
        assert row.seo_score == 100
        assert row.best_practices_score == 92
        assert row.run_date == "2026-05-22"

    def test_handles_missing_audits_gracefully(self):
        row = pagespeed_ingest.parse_psi(
            {"lighthouseResult": {"audits": {}, "categories": {}}, "loadingExperience": {}},
            "https://x/", "mobile", "2026-05-22T08:00:00+00:00",
        )
        assert row.lcp_ms is None
        assert row.performance_score is None
        assert row.cls is None


# ---------------------------------------------------------------------------
# select_top_urls
# ---------------------------------------------------------------------------

class TestSelectTopUrls:
    def test_returns_gsc_ranked(self):
        bq = FakeBQ(query_rows=[
            {"url": "https://cercol.team/blog/x/", "impressions": 999},
            {"url": "https://cercol.team/", "impressions": 800},
        ])
        urls = pagespeed_ingest.select_top_urls(bq, _make_cfg(), top_n=2)
        assert urls == [
            "https://cercol.team/blog/x/",
            "https://cercol.team/",
        ]
        assert any("searchdata_url_impression" in q for q in bq.queries)

    def test_falls_back_to_seed_when_gsc_empty(self):
        bq = FakeBQ(query_rows=[])
        urls = pagespeed_ingest.select_top_urls(bq, _make_cfg())
        assert urls == list(pagespeed_ingest.SEED_URLS)

    def test_falls_back_on_query_exception(self):
        bq = FakeBQ(query_rows=RuntimeError("permission denied"))
        urls = pagespeed_ingest.select_top_urls(bq, _make_cfg())
        assert urls == list(pagespeed_ingest.SEED_URLS)


# ---------------------------------------------------------------------------
# _fetch_psi retries
# ---------------------------------------------------------------------------

class TestFetch:
    def test_retries_on_429(self, monkeypatch):
        monkeypatch.setattr(pagespeed_ingest.time, "sleep", lambda *_: None)
        attempts = {"n": 0}
        payload = _load("psi_mobile_ok.json")

        def handler(request: httpx.Request) -> httpx.Response:
            attempts["n"] += 1
            if attempts["n"] == 1:
                return httpx.Response(429, json={})
            return httpx.Response(200, json=payload)

        with httpx.Client(transport=httpx.MockTransport(handler)) as http:
            got = pagespeed_ingest._fetch_psi(http, "https://x/", "mobile", "k")
        assert attempts["n"] == 2
        assert got == payload

    def test_gives_up_after_max_retries(self, monkeypatch):
        monkeypatch.setattr(pagespeed_ingest.time, "sleep", lambda *_: None)

        def handler(request: httpx.Request) -> httpx.Response:
            return httpx.Response(500, json={})

        with httpx.Client(transport=httpx.MockTransport(handler)) as http:
            with pytest.raises(httpx.HTTPStatusError):
                pagespeed_ingest._fetch_psi(http, "https://x/", "mobile", "k")


# ---------------------------------------------------------------------------
# Full run
# ---------------------------------------------------------------------------

class TestRun:
    def test_full_run_writes_one_row_per_url_per_device(self, monkeypatch):
        monkeypatch.setattr(pagespeed_ingest.time, "sleep", lambda *_: None)
        payload = _load("psi_mobile_ok.json")

        def handler(request: httpx.Request) -> httpx.Response:
            return httpx.Response(200, json=payload)

        cfg = _make_cfg()
        bq = FakeBQ()
        urls = ["https://cercol.team/", "https://cercol.team/science/"]
        with httpx.Client(transport=httpx.MockTransport(handler)) as http:
            counts = pagespeed_ingest.run(cfg, http=http, bq_client=bq, urls=urls)

        assert counts == {"pagespeed_runs": 4}  # 2 URLs * 2 devices.
        assert len(bq.inserts) == 1
        target_table, rows = bq.inserts[0]
        assert target_table == "cercol.cercol_seo.pagespeed_runs"
        assert len(rows) == 4
        # Both devices represented.
        assert {r["device"] for r in rows} == {"mobile", "desktop"}

    def test_missing_psi_key_raises(self):
        cfg = _make_cfg(pagespeed_api_key=None)
        with pytest.raises(MissingSecret):
            pagespeed_ingest.run(cfg, http=httpx.Client(), bq_client=FakeBQ(), urls=["x"])

    def test_no_urls_returns_zero(self):
        cfg = _make_cfg()
        bq = FakeBQ(query_rows=[])
        # urls explicit empty list, bypasses select_top_urls.
        counts = pagespeed_ingest.run(cfg, http=httpx.Client(), bq_client=bq, urls=[])
        assert counts == {"pagespeed_runs": 0}
        # SEED_URLS fallback not used because urls=[] is explicit.
        assert bq.inserts == []
