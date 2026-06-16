"""
Tests for api/jobs/weekly_digest.py and the digest email builder.

# Spec: docs/architecture/seo-pipeline.md  (ROADMAP Phase 17.6.7)

Fully offline: PostgreSQL and BigQuery are stubbed. Exercises week boundaries,
cluster counting, conversion-rate guards, BigQuery gathering + graceful
degradation, the HTML builder (populated and empty), and run() end-to-end with
send disabled.
"""

from __future__ import annotations

import os
import sys
from datetime import datetime, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest  # noqa: E402

from jobs import weekly_digest as wd  # noqa: E402
from jobs._config import JobConfig  # noqa: E402
import emails  # noqa: E402
from scoring import _NORM  # noqa: E402


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


# ── week_bounds ──────────────────────────────────────────────────────────────

def test_week_bounds_covers_prior_full_week():
    # A Monday: the window is the immediately preceding Mon..Mon (exclusive).
    now = datetime(2026, 6, 16, 8, 0, tzinfo=timezone.utc)  # Tue Jun 16
    ws, we, ps, pe = wd.week_bounds(now)
    assert ws == datetime(2026, 6, 8, tzinfo=timezone.utc)   # Mon Jun 8
    assert we == datetime(2026, 6, 15, tzinfo=timezone.utc)  # Mon Jun 15 (exclusive)
    assert ps == datetime(2026, 6, 1, tzinfo=timezone.utc)
    assert pe == ws
    assert wd.week_label(ws, we) == "Jun 08–Jun 14, 2026"


# ── cluster counting ─────────────────────────────────────────────────────────

def _row_for_role_R01() -> dict:
    """Raw scores that yield z = (P+1, B+1, V0, D0, Dep-0.5) == R01 (Dolphin)."""
    return {
        "presence":   _NORM["presence"]["mean"]  + 1.0 * _NORM["presence"]["sd"],
        "bond":       _NORM["bond"]["mean"]       + 1.0 * _NORM["bond"]["sd"],
        "vision":     _NORM["vision"]["mean"],
        "discipline": _NORM["discipline"]["mean"],
        "depth":      _NORM["depth"]["mean"]      - 0.5 * _NORM["depth"]["sd"],
    }


def test_compute_role_counts_maps_and_sorts():
    rows = [_row_for_role_R01(), _row_for_role_R01()]
    counts = wd.compute_role_counts(rows)
    assert counts == [("R01", 2)]


def test_compute_role_counts_empty():
    assert wd.compute_role_counts([]) == []


# ── funnel conversions ───────────────────────────────────────────────────────

def test_build_funnel_guards_zero_denominators():
    f = wd.build_funnel({"page_view": 0, "article_view": 0, "test_start": 0, "cta_click": 0}, 0)
    assert all(rate == "—" for _, rate in f["conversions"])


def test_build_funnel_computes_rates():
    f = wd.build_funnel(
        {"page_view": 100, "article_view": 40, "test_start": 20, "cta_click": 10},
        tests_total=5,
    )
    rates = dict(f["conversions"])
    assert rates["Visits → test starts"] == "20.0%"   # 20/100
    assert rates["Reads → CTA clicks"] == "25.0%"      # 10/40
    assert rates["Starts → completions"] == "25.0%"    # 5/20


# ── BigQuery gathering ───────────────────────────────────────────────────────

class FakeBQResult:
    def __init__(self, rows):
        self._rows = rows

    def result(self):
        return [dict(r) for r in self._rows]


class FakeBQ:
    """Routes by SQL substring to canned row lists."""

    def __init__(self, routes):
        self._routes = routes

    def query(self, sql):
        for needle, rows in self._routes.items():
            if needle in sql:
                return FakeBQResult(rows)
        return FakeBQResult([])


def test_gather_bigquery_none_client_is_pending():
    out = wd.gather_bigquery(_cfg(), None, *wd.week_bounds(datetime(2026, 6, 16, tzinfo=timezone.utc)))
    assert out["seo"]["pending"] is True
    assert out["pagespeed"] == []
    assert out["broken_links"] == []


def test_gather_bigquery_gsc_path():
    bq = FakeBQ({
        "INFORMATION_SCHEMA.TABLES": [{"x": 1}],
        "AS clicks FROM": [{"impressions": 1000, "clicks": 50}],
        "SELECT query, SUM(impressions)": [
            {"query": "big five test", "impressions": 600, "clicks": 30, "pos": 4.2},
        ],
        "WITH cur AS": [{"url": "https://cercol.team/", "before": 9.0, "now": 6.0, "improvement": 3.0}],
        "pagespeed_runs": [{"url": "https://cercol.team/faq", "score": 71, "lcp_ms": 3200}],
        "external_links_status": [
            {"url": "https://dead.example/x", "article_slug": "a", "lang": "en", "status_code": 404},
        ],
    })
    out = wd.gather_bigquery(_cfg(), bq, *wd.week_bounds(datetime(2026, 6, 16, tzinfo=timezone.utc)))
    assert out["seo"]["source"] == "gsc"
    assert out["seo"]["impressions"] == 1000
    assert out["seo"]["top_queries"][0][0] == "big five test"
    assert out["seo"]["movers"][0][3] == 3.0
    assert out["pagespeed"][0][1] == 71
    assert out["broken_links"][0][3] == 404


# ── HTML builder ─────────────────────────────────────────────────────────────

def test_weekly_digest_html_populated():
    data = {
        "week_label": "Jun 08–Jun 14, 2026",
        "kpis": {"signups": (12, 8), "tests": (40, 35), "page_views": (900, 700),
                 "unique_visitors": (300, 250)},
        "instruments": [("New Moon", 25), ("Full Moon", 15)],
        "roles": [("R01", 10), ("R04", 5)],
        "funnel": wd.build_funnel(
            {"page_view": 900, "article_view": 200, "test_start": 60, "cta_click": 30}, 40),
        "top_articles": [("What is Extraversion", 120)],
        "seo": {"source": "gsc", "impressions": 1000, "clicks": 50,
                "top_queries": [("big five test", 600, 30, 4.2)],
                "top_pages": [], "movers": [("https://cercol.team/", 9.0, 6.0, 3.0)],
                "pending": False},
        "pagespeed": [("https://cercol.team/faq", 71, 3200)],
        "broken_links": [("https://dead.example/x", "a", "en", 404)],
        "gsc_lag_note": True,
    }
    html = emails.weekly_digest_html(data)
    assert "Weekly digest" in html
    assert "Dolphin" in html              # role display name
    assert "New Moon" in html             # instrument label
    assert "What is Extraversion" in html
    assert "big five test" in html
    assert "dead.example" in html
    assert "<!DOCTYPE html>" in html      # wrapped in the shared shell


def test_weekly_digest_html_empty_degrades():
    # A completely quiet week must render placeholders, not crash.
    html = emails.weekly_digest_html({"week_label": "—", "kpis": {}})
    assert "No tests completed this week." in html
    assert "No completed tests to cluster." in html
    assert "Search data pending" in html
    assert "No broken external links" in html


# ── run() end-to-end (send disabled) ─────────────────────────────────────────

def test_run_builds_summary_without_sending(monkeypatch):
    async def fake_pg(ws, we, ps, pe):
        return {
            "kpis": {"signups": (3, 1), "tests": (7, 5), "page_views": (50, 40),
                     "unique_visitors": (20, 18)},
            "instruments": [("New Moon", 7)],
            "role_rows": [_row_for_role_R01()],
            "funnel_raw": {"page_view": 50, "article_view": 10, "test_start": 7, "cta_click": 2},
            "tests_total": 7,
            "top_articles": [("slug-x", 9)],
        }

    monkeypatch.setattr(wd, "gather_postgres", fake_pg)
    monkeypatch.setattr(wd, "gather_bigquery",
                        lambda *a, **k: {"seo": {"pending": True}, "pagespeed": [], "broken_links": []})

    summary = wd.run(_cfg(), bq_client=None, send=False)
    assert summary["signups"] == 3
    assert summary["tests"] == 7
    assert summary["clusters"] == 1
    assert summary["broken_links"] == 0
