"""
Tests for api/seo.py.

# Spec: docs/architecture/seo-pipeline.md

Pure unit tests. The BigQuery client is monkeypatched with a stub that
records SQL and returns fixed rows. No real network call.
"""

from __future__ import annotations

import asyncio
import os
import sys
from typing import Any

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import seo  # noqa: E402


class FakeBQ:
    """Stub. Maps SQL substrings to canned rows."""

    def __init__(self, rules: list[tuple[str, list[dict[str, Any]]]]) -> None:
        # Order matters; first match wins.
        self.rules = rules
        self.calls: list[str] = []

    def query(self, sql: str, job_config: Any = None):
        self.calls.append(sql)
        for needle, rows in self.rules:
            if needle in sql:
                return _FakeJob(rows)
        return _FakeJob([])


class _FakeJob:
    def __init__(self, rows):
        self._rows = rows

    def result(self):
        return iter(self._rows)


@pytest.fixture(autouse=True)
def _reset_cache_and_client(monkeypatch):
    """Clear the module-level cache + client before every test."""
    seo.clear_cache()
    monkeypatch.setattr(seo, "_bq_client", None)
    yield
    seo.clear_cache()


def _install_fake_bq(monkeypatch, rules):
    bq = FakeBQ(rules)
    async def _get_fake():
        return bq

    monkeypatch.setattr(seo, "_get_bq", _get_fake)
    return bq


def _run(coro):
    return asyncio.get_event_loop().run_until_complete(coro) if False else asyncio.run(coro)


# ---------------------------------------------------------------------------
# Sources
# ---------------------------------------------------------------------------

def test_sources_aggregates_row_counts(monkeypatch):
    import datetime
    _install_fake_bq(monkeypatch, [
        ("bing_query_stats", [{"n": 0, "last": None}]),
        ("bing_page_stats", [{"n": 0, "last": None}]),
        ("bing_crawl_stats", [{"n": 10, "last": datetime.date(2026, 5, 22)}]),
        ("pagespeed_runs", [{"n": 0, "last": None}]),
        ("crawl_logs", [{"n": 6, "last": datetime.date(2026, 5, 23)}]),
        ("INFORMATION_SCHEMA.TABLES", [{"table_name": "temp_4f77a7d6"}]),
    ])

    async def call():
        return await seo.sources(_={})

    out = _run(call())
    counts = {s["name"]: s["row_count"] for s in out["sources"]}
    assert counts == {
        "bing_query_stats": 0, "bing_page_stats": 0, "bing_crawl_stats": 10,
        "pagespeed_runs": 0, "crawl_logs": 6,
    }
    # bulk_export_ready is True only if any 'searchdata_%' table is listed.
    # Our fixture returned 'temp_4f77a7d6' (matches LIKE 'searchdata_%' would
    # actually be false, but we returned it because the stub matches on the
    # SQL substring; the endpoint trusts the result list).
    assert out["gsc"]["bulk_export_ready"] is True
    assert "temp_4f77a7d6" in out["gsc"]["tables_present"]


def test_sources_handles_completely_empty(monkeypatch):
    _install_fake_bq(monkeypatch, [])  # every query returns []

    async def call():
        return await seo.sources(_={})

    out = _run(call())
    assert all(s["row_count"] == 0 for s in out["sources"])
    assert out["gsc"]["bulk_export_ready"] is False


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

def test_health_flags_data_pending_without_gsc(monkeypatch):
    _install_fake_bq(monkeypatch, [
        ("bing_query_stats", [{"impressions": 0, "clicks": 0}]),
        # INFORMATION_SCHEMA returns nothing, so the GSC branch is skipped.
        ("pagespeed_runs", []),
        ("crawl_logs", [{"bot_name": "googlebot", "hits": 5}]),
    ])

    async def call():
        return await seo.health(_={})

    out = _run(call())
    assert out["data_pending"] is True
    assert out["gsc_28d"]["available"] is False
    assert out["bing_28d"] == {"impressions": 0, "clicks": 0}
    assert out["crawl_7d_by_bot"] == [{"bot": "googlebot", "hits": 5}]


def test_health_uses_gsc_when_available(monkeypatch):
    _install_fake_bq(monkeypatch, [
        # Bing baseline
        ("bing_query_stats", [{"impressions": 100, "clicks": 5}]),
        # GSC INFORMATION_SCHEMA returns a row, so GSC branch fires.
        ("searchdata_url_impression", [{"impressions": 9000, "clicks": 250}]),
        ("INFORMATION_SCHEMA.TABLES", [{"table_name": "searchdata_url_impression"}]),
        ("pagespeed_runs", []),
        ("crawl_logs", []),
    ])

    async def call():
        return await seo.health(_={})

    out = _run(call())
    assert out["data_pending"] is False
    assert out["gsc_28d"]["available"] is True
    assert out["gsc_28d"]["impressions"] == 9000


# ---------------------------------------------------------------------------
# Queries
# ---------------------------------------------------------------------------

def test_queries_prefers_gsc_when_available(monkeypatch):
    _install_fake_bq(monkeypatch, [
        ("INFORMATION_SCHEMA.TABLES", [{"x": 1}]),  # GSC present
        ("searchdata_url_impression", [
            {"query": "big five", "impressions": 100, "clicks": 4, "avg_position": 12.0},
            {"query": "team test", "impressions": 50, "clicks": 1, "avg_position": 15.0},
        ]),
    ])

    async def call():
        return await seo.queries(period_days=28, min_impressions=10, limit=10, _={})

    out = _run(call())
    assert out["source"] == "gsc"
    assert len(out["queries"]) == 2
    assert out["queries"][0]["query"] == "big five"
    assert abs(out["queries"][0]["ctr"] - 4 / 100) < 1e-9


def test_queries_falls_back_to_bing(monkeypatch):
    _install_fake_bq(monkeypatch, [
        # GSC INFORMATION_SCHEMA returns no table.
        ("bing_query_stats", [
            {"query": "fallback", "impressions": 30, "clicks": 0, "avg_position": 20.0},
        ]),
    ])

    async def call():
        return await seo.queries(period_days=28, _={})

    out = _run(call())
    assert out["source"] == "bing"
    assert out["queries"][0]["query"] == "fallback"


def test_queries_data_pending_when_both_empty(monkeypatch):
    _install_fake_bq(monkeypatch, [])  # everything empty

    async def call():
        return await seo.queries(period_days=28, _={})

    out = _run(call())
    assert out["data_pending"] is True
    assert out["queries"] == []


# ---------------------------------------------------------------------------
# Anomalies
# ---------------------------------------------------------------------------

def test_anomalies_data_pending_without_gsc(monkeypatch):
    _install_fake_bq(monkeypatch, [])

    async def call():
        return await seo.anomalies(threshold_pct=30.0, _={})

    out = _run(call())
    assert out["data_pending"] is True
    assert out["anomalies"] == []


def test_anomalies_returns_changed_pages(monkeypatch):
    _install_fake_bq(monkeypatch, [
        ("INFORMATION_SCHEMA.TABLES", [{"x": 1}]),
        ("WITH recent", [
            {"url": "https://cercol.team/blog/x/", "recent": 100, "prior": 50, "change_pct": 100.0},
            {"url": "https://cercol.team/blog/y/", "recent": 20, "prior": 80, "change_pct": -75.0},
        ]),
    ])

    async def call():
        return await seo.anomalies(threshold_pct=30.0, _={})

    out = _run(call())
    assert len(out["anomalies"]) == 2
    assert {a["url"] for a in out["anomalies"]} == {
        "https://cercol.team/blog/x/", "https://cercol.team/blog/y/"
    }


# ---------------------------------------------------------------------------
# Page lifecycle
# ---------------------------------------------------------------------------

def test_lifecycle_pending_without_gsc(monkeypatch):
    _install_fake_bq(monkeypatch, [])

    async def call():
        return await seo.page_lifecycle(slug="about/", _={})

    out = _run(call())
    assert out["data_pending"] is True
    assert out["days"] == []


def test_lifecycle_returns_per_day_rows(monkeypatch):
    import datetime
    _install_fake_bq(monkeypatch, [
        ("INFORMATION_SCHEMA.TABLES", [{"x": 1}]),
        ("data_date", [
            {"data_date": datetime.date(2026, 5, 20), "impressions": 100, "clicks": 5},
            {"data_date": datetime.date(2026, 5, 21), "impressions": 120, "clicks": 6},
        ]),
    ])

    async def call():
        return await seo.page_lifecycle(slug="about/", _={})

    out = _run(call())
    assert len(out["days"]) == 2
    assert out["days"][0]["date"] == "2026-05-20"
    assert out["days"][0]["impressions"] == 100


# ---------------------------------------------------------------------------
# Cache
# ---------------------------------------------------------------------------

def test_require_admin_returns_401_without_credentials():
    """Regression: the admin gate must raise a clean 401 (not a bare
    exception surfacing as a 500) when no bearer credentials are supplied.

    The gate now lives in api/deps.py (Phase 17.8). Its credential
    resolution (get_current_user, which require_admin depends on) declares
    credentials as a FastAPI dependency, so when they are absent it raises
    HTTPException(401). Asserted here against the shared module.
    """
    import deps

    import pytest as _pt
    with _pt.raises(Exception) as exc_info:
        deps.get_current_user(credentials=None)
    # FastAPI HTTPException with 401.
    assert getattr(exc_info.value, "status_code", None) == 401


def test_notfound_from_bigquery_returns_data_pending(monkeypatch):
    """When a BigQuery query raises (e.g. table not yet created by GSC
    bulk export), `_query` must return [] and the endpoint must respond
    with a normal data_pending payload, NOT propagate a 500.
    """
    class RaisingBQ:
        def __init__(self):
            self.calls = 0
        def query(self, sql, job_config=None):
            self.calls += 1
            raise RuntimeError("404 Not found: Table cercol.searchconsole.searchdata_url_impression")
    bq = RaisingBQ()
    async def _get_fake():
        return bq
    monkeypatch.setattr(seo, "_get_bq", _get_fake)

    async def call():
        return await seo.health(_={})

    out = _run(call())
    # Endpoint completed normally.
    assert isinstance(out, dict)
    # data_pending flag is set because all queries returned [].
    assert out.get("data_pending") is True
    # The BigQuery client was actually invoked (sanity).
    assert bq.calls >= 1


def test_cache_short_circuits_second_call(monkeypatch):
    bq = _install_fake_bq(monkeypatch, [
        ("bing_query_stats", [{"impressions": 1, "clicks": 0}]),
        ("INFORMATION_SCHEMA.TABLES", []),
        ("pagespeed_runs", []),
        ("crawl_logs", []),
    ])

    async def call_twice():
        a = await seo.health(_={})
        b = await seo.health(_={})
        return a, b

    a, b = _run(call_twice())
    assert a == b
    # First call ran the queries (4 rules); second hit the cache.
    first_call_count = len(bq.calls)
    assert first_call_count <= 5  # not doubled
