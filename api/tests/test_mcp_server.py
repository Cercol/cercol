"""
Tests for api/seo_mcp/server.py SQL safety and tool functions.

# Spec: docs/architecture/seo-pipeline.md

The FastMCP wrapping itself is not exercised here (no fastmcp dep
required for these tests). The pure tool functions and the SQL
guard are the security-critical pieces.
"""

from __future__ import annotations

import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from seo_mcp import server  # noqa: E402


# ---------------------------------------------------------------------------
# SQL safety
# ---------------------------------------------------------------------------

class TestValidateSql:
    @pytest.mark.parametrize("sql", [
        "SELECT * FROM `cercol.cercol_seo.bing_crawl_stats`",
        "select 1 from `cercol.cercol_seo.crawl_logs`",
        "WITH a AS (SELECT 1 FROM `cercol.searchconsole.searchdata_url_impression`) SELECT * FROM a",
    ])
    def test_accepts_safe_select(self, sql):
        server._validate_sql(sql)  # does not raise

    @pytest.mark.parametrize("sql,reason", [
        ("DROP TABLE `cercol.cercol_seo.bing_query_stats`", "DROP"),
        ("UPDATE `cercol.cercol_seo.bing_query_stats` SET clicks = 0", "UPDATE"),
        ("DELETE FROM `cercol.cercol_seo.bing_query_stats` WHERE 1=1", "DELETE"),
        ("INSERT INTO `cercol.cercol_seo.bing_query_stats` VALUES (...)", "INSERT"),
        ("CREATE TABLE `cercol.cercol_seo.x` (a INT64)", "CREATE"),
        ("ALTER TABLE `cercol.cercol_seo.x` ADD COLUMN b INT64", "ALTER"),
        ("GRANT SELECT ON cercol_seo.x TO user", "GRANT"),
        ("SELECT 1; SELECT 2", "multi-statement"),
        ("CALL my_proc()", "CALL"),
    ])
    def test_rejects_unsafe(self, sql, reason):
        with pytest.raises(ValueError):
            server._validate_sql(sql)

    def test_rejects_missing_allowed_dataset(self):
        with pytest.raises(ValueError):
            server._validate_sql("SELECT 1")

    def test_allows_query_with_word_containing_forbidden_substring(self):
        # 'updated_at' contains 'update' but as a substring, not a token.
        # The token-boundary check must allow this.
        server._validate_sql(
            "SELECT updated_at FROM `cercol.cercol_seo.bing_crawl_stats` "
            "WHERE updated_at IS NOT NULL"
        )


# ---------------------------------------------------------------------------
# Tool functions (monkeypatch _bq + _run_select)
# ---------------------------------------------------------------------------

class FakeBQ:
    def __init__(self, rules):
        self.rules = rules
        self.queries = []

    def query(self, sql):
        self.queries.append(sql)
        for needle, rows in self.rules:
            if needle in sql:
                return _Job(rows)
        return _Job([])


class _Job:
    def __init__(self, rows):
        self._rows = rows

    def result(self):
        return iter(self._rows)


@pytest.fixture(autouse=True)
def _reset_client(monkeypatch):
    monkeypatch.setattr(server, "_client", None)
    yield


def _install(monkeypatch, rules):
    bq = FakeBQ(rules)
    monkeypatch.setattr(server, "_bq", lambda: bq)
    return bq


def test_seo_anomalies_returns_rows(monkeypatch):
    _install(monkeypatch, [
        ("seo_anomalies", [
            {"signal": "impressions_7d", "subject": "https://x/", "change_pct": 100.0},
        ]),
    ])
    out = server.tool_seo_anomalies(limit=10)
    assert out["row_count"] == 1
    assert out["rows"][0]["signal"] == "impressions_7d"


def test_seo_quick_wins(monkeypatch):
    _install(monkeypatch, [
        ("searchdata_url_impression", [
            {"query": "big five", "impressions": 100, "clicks": 4, "avg_position": 12.5},
        ]),
    ])
    out = server.tool_seo_quick_wins(min_impressions=50, limit=10)
    assert out["row_count"] == 1
    assert out["rows"][0]["query"] == "big five"


def test_seo_compare_periods(monkeypatch):
    _install(monkeypatch, [
        ("WITH recent", [
            {
                "recent_impressions": 1000, "recent_clicks": 30,
                "prior_impressions": 700, "prior_clicks": 20,
                "impressions_change_pct": 42.85,
            },
        ]),
    ])
    out = server.tool_seo_compare_periods(recent_days=7, prior_days=7)
    assert out["recent_impressions"] == 1000
    assert out["prior_clicks"] == 20


def test_seo_query_rejects_write(monkeypatch):
    _install(monkeypatch, [])
    with pytest.raises(ValueError):
        server.tool_seo_query("DELETE FROM `cercol.cercol_seo.crawl_logs`")


def test_seo_query_applies_limit(monkeypatch):
    bq = _install(monkeypatch, [
        ("cercol_seo.crawl_logs", [{"x": 1}]),
    ])
    server.tool_seo_query(
        "SELECT * FROM `cercol.cercol_seo.crawl_logs`", limit=5
    )
    # The injected LIMIT must end up in the query passed to the client.
    last_sql = bq.queries[-1]
    assert "LIMIT 5" in last_sql


def test_seo_sources_status(monkeypatch):
    _install(monkeypatch, [
        ("bing_query_stats", [{"n": 0, "last": None}]),
        ("crawl_logs", [{"n": 6, "last": "2026-05-23"}]),
        # Other tables match on default empty.
        ("INFORMATION_SCHEMA.TABLES", [{"table_name": "searchdata_url_impression"}]),
    ])
    out = server.tool_seo_sources_status()
    assert "bing_query_stats" in out["sources"]
    assert out["gsc_tables"] == ["searchdata_url_impression"]
