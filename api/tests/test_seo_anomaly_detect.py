"""
Tests for api/jobs/seo_anomaly_detect.py.

# Spec: docs/architecture/seo-pipeline.md

Offline. BigQuery client stubbed.
"""

from __future__ import annotations

import os
import sys
from typing import Any

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from jobs import seo_anomaly_detect  # noqa: E402
from jobs._config import JobConfig  # noqa: E402


class FakeBQ:
    def __init__(self, rules: list[tuple[str, list[dict[str, Any]]]]) -> None:
        self.rules = rules
        self.queries: list[str] = []
        self.inserts: list[tuple[str, list[dict[str, Any]]]] = []

    def query(self, sql: str):
        self.queries.append(sql)
        for needle, rows in self.rules:
            if needle in sql:
                return _Job(rows)
        return _Job([])

    def insert_rows_json(self, table: str, rows):
        self.inserts.append((table, rows))
        return []


class _Job:
    def __init__(self, rows):
        self._rows = rows

    def result(self):
        return iter(self._rows)


def _cfg() -> JobConfig:
    return JobConfig(
        bigquery_project="cercol",
        bigquery_dataset_gsc="searchconsole",
        bigquery_dataset_seo="cercol_seo",
        google_application_credentials="/fake",
        bing_wmt_api_key=None,
        pagespeed_api_key=None,
        site_url="https://cercol.team/",
    )


def test_ensure_table_runs_once_and_returns_no_error():
    bq = FakeBQ([])
    seo_anomaly_detect._ensure_anomalies_table(bq, "cercol", "cercol_seo")
    assert any("CREATE TABLE IF NOT EXISTS" in q for q in bq.queries)


def test_impressions_branch_skipped_without_gsc():
    bq = FakeBQ([])  # INFORMATION_SCHEMA returns empty
    out = seo_anomaly_detect.detect_impression_anomalies(bq, "cercol", "searchconsole", 30.0)
    assert out == []


def test_impressions_branch_emits_when_gsc_present():
    bq = FakeBQ([
        ("INFORMATION_SCHEMA.TABLES", [{"_": 1}]),
        ("WITH recent", [
            {"url": "https://cercol.team/a/", "recent": 100, "prior": 50, "change_pct": 100.0},
            {"url": "https://cercol.team/b/", "recent": 20, "prior": 80, "change_pct": -75.0},
        ]),
    ])
    out = seo_anomaly_detect.detect_impression_anomalies(bq, "cercol", "searchconsole", 30.0)
    assert len(out) == 2
    assert all(a["signal"] == "impressions_7d" for a in out)


def test_psi_regressions_returns_recent_vs_prior():
    bq = FakeBQ([
        ("WITH ranked", [
            {"url": "https://cercol.team/", "recent": 60, "prior": 90, "change_pct": -33.3},
        ]),
    ])
    out = seo_anomaly_detect.detect_psi_regressions(bq, "cercol", "cercol_seo", 30.0)
    assert len(out) == 1
    assert out[0]["signal"] == "psi_performance_mobile"


def test_run_writes_combined_anomalies():
    bq = FakeBQ([
        ("INFORMATION_SCHEMA.TABLES", [{"_": 1}]),
        ("WITH recent", [
            {"url": "https://x/", "recent": 100, "prior": 50, "change_pct": 100.0},
        ]),
        ("WITH ranked", [
            {"url": "https://y/", "recent": 60, "prior": 90, "change_pct": -33.3},
        ]),
        # CREATE TABLE IF NOT EXISTS matches nothing in rules, default empty.
    ])
    out = seo_anomaly_detect.run(_cfg(), bq_client=bq, threshold_pct=30.0)
    assert out == {"impressions_7d": 1, "psi_performance_mobile": 1}
    # One insert with two rows.
    assert len(bq.inserts) == 1
    table, rows = bq.inserts[0]
    assert table == "cercol.cercol_seo.seo_anomalies"
    assert len(rows) == 2
    # threshold_pct is added to every row.
    assert all(r["threshold_pct"] == 30.0 for r in rows)


def test_run_no_anomalies_no_insert():
    bq = FakeBQ([])  # everything empty
    out = seo_anomaly_detect.run(_cfg(), bq_client=bq, threshold_pct=30.0)
    assert out == {"impressions_7d": 0, "psi_performance_mobile": 0}
    assert bq.inserts == []
