"""
Tests for api/jobs/crawl_log_parser.py.

# Spec: docs/architecture/seo-pipeline.md

All offline. The parser reads from a fixture file under
api/tests/fixtures/crawl/. The BigQuery client is a stub.
"""

from __future__ import annotations

import json
import os
import shutil
import sys
from pathlib import Path

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from jobs import crawl_log_parser  # noqa: E402
from jobs._config import JobConfig  # noqa: E402


FIXTURE = Path(__file__).parent / "fixtures" / "crawl" / "sample_access.jsonl"


def _make_cfg() -> JobConfig:
    return JobConfig(
        bigquery_project="cercol",
        bigquery_dataset_gsc="searchconsole",
        bigquery_dataset_seo="cercol_seo",
        google_application_credentials=None,
        bing_wmt_api_key=None,
        pagespeed_api_key=None,
        site_url="https://cercol.team/",
    )


class FakeBQ:
    def __init__(self) -> None:
        self.inserts: list[tuple[str, list[dict]]] = []

    def insert_rows_json(self, table, rows):
        self.inserts.append((table, rows))
        return []


# ---------------------------------------------------------------------------
# classify_bot
# ---------------------------------------------------------------------------

class TestClassifyBot:
    @pytest.mark.parametrize("ua,expected", [
        ("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)", "googlebot"),
        ("Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)", "bingbot"),
        ("Mozilla/5.0 (compatible; DuckDuckBot/1.1; +http://duckduckgo.com/duckduckbot.html)", "duckduckbot"),
        ("GPTBot/1.0", "gptbot"),
        ("Mozilla/5.0 (compatible; ClaudeBot/1.0; +https://anthropic.com/claudebot)", "claudebot"),
        ("Mozilla/5.0 (X11; Linux) Chrome/120.0.0.0", None),
        (None, None),
        ("", None),
    ])
    def test_recognises_known_bots_and_rejects_browsers(self, ua, expected):
        assert crawl_log_parser.classify_bot(ua) == expected


# ---------------------------------------------------------------------------
# parse_log_line
# ---------------------------------------------------------------------------

class TestParseLine:
    def test_googlebot_hit(self):
        line = json.dumps({
            "level": "info",
            "ts": 1748044800.123,
            "logger": "http.log.access",
            "request": {
                "host": "api.cercol.team",
                "method": "GET",
                "uri": "/blog",
                "remote_ip": "192.0.2.1",
                "headers": {"User-Agent": ["Googlebot/2.1"]},
            },
            "duration": 0.018,
            "size": 12345,
            "status": 200,
        })
        row = crawl_log_parser.parse_log_line(line)
        assert row is not None
        assert row.bot_name == "googlebot"
        assert row.path == "/blog"
        assert row.status == 200
        assert row.duration_ms == 18  # 0.018 s * 1000
        assert row.bytes_sent == 12345
        # Epoch 1748044800 seconds = 2025-05-24 00:00:00 UTC.
        assert row.ts_date == "2025-05-24"

    def test_drops_non_crawler_ua(self):
        line = json.dumps({
            "ts": 1748044800.0,
            "logger": "http.log.access",
            "request": {
                "host": "api.cercol.team", "method": "GET", "uri": "/blog",
                "headers": {"User-Agent": ["Mozilla/5.0 Chrome/120"]},
            },
            "status": 200,
        })
        assert crawl_log_parser.parse_log_line(line) is None

    def test_drops_non_access_logger(self):
        line = json.dumps({
            "ts": 1748044800.0,
            "logger": "http.log.error",
            "request": {"headers": {"User-Agent": ["Googlebot"]}},
        })
        assert crawl_log_parser.parse_log_line(line) is None

    def test_drops_malformed_json(self):
        assert crawl_log_parser.parse_log_line("not json") is None

    def test_drops_empty_line(self):
        assert crawl_log_parser.parse_log_line("") is None
        assert crawl_log_parser.parse_log_line("   \n") is None


# ---------------------------------------------------------------------------
# Stateful iter_new_lines + state file management
# ---------------------------------------------------------------------------

class TestStateAndIteration:
    def test_first_run_reads_everything(self, tmp_path):
        log_path = tmp_path / "access.log"
        shutil.copy(FIXTURE, log_path)
        state_path = tmp_path / "state.json"

        lines = list(crawl_log_parser.iter_new_lines(log_path, state_path))
        assert len(lines) == 6  # all 6 lines of the fixture

        # State got written.
        st = json.loads(state_path.read_text())
        assert st["offset"] > 0
        assert st["inode"] > 0

    def test_second_run_with_no_new_data_reads_nothing(self, tmp_path):
        log_path = tmp_path / "access.log"
        shutil.copy(FIXTURE, log_path)
        state_path = tmp_path / "state.json"

        # First run consumes all.
        list(crawl_log_parser.iter_new_lines(log_path, state_path))
        # Second run, nothing new.
        lines = list(crawl_log_parser.iter_new_lines(log_path, state_path))
        assert lines == []

    def test_second_run_picks_up_appended_lines(self, tmp_path):
        log_path = tmp_path / "access.log"
        shutil.copy(FIXTURE, log_path)
        state_path = tmp_path / "state.json"

        list(crawl_log_parser.iter_new_lines(log_path, state_path))
        with log_path.open("a", encoding="utf-8") as f:
            f.write(json.dumps({
                "logger": "http.log.access",
                "ts": 1748044900.0,
                "request": {
                    "host": "api.cercol.team", "method": "GET", "uri": "/x",
                    "headers": {"User-Agent": ["Bingbot/2.0"]},
                },
                "status": 200,
            }) + "\n")

        new = list(crawl_log_parser.iter_new_lines(log_path, state_path))
        assert len(new) == 1
        assert "Bingbot" in new[0]

    def test_rotation_resets_offset(self, tmp_path):
        log_path = tmp_path / "access.log"
        shutil.copy(FIXTURE, log_path)
        state_path = tmp_path / "state.json"

        list(crawl_log_parser.iter_new_lines(log_path, state_path))
        # Simulate rotation: remove and recreate the file (new inode).
        log_path.unlink()
        shutil.copy(FIXTURE, log_path)

        lines = list(crawl_log_parser.iter_new_lines(log_path, state_path))
        # New inode triggers full re-read.
        assert len(lines) == 6


# ---------------------------------------------------------------------------
# End-to-end run with mocked BigQuery
# ---------------------------------------------------------------------------

class TestRun:
    def test_full_run_inserts_crawler_hits_only(self, tmp_path):
        log_path = tmp_path / "access.log"
        shutil.copy(FIXTURE, log_path)
        state_path = tmp_path / "state.json"

        cfg = _make_cfg()
        bq = FakeBQ()
        counts = crawl_log_parser.run(
            cfg, bq_client=bq, log_path=log_path, state_path=state_path
        )

        # Fixture has 5 crawler lines (googlebot, bingbot, browser-skip,
        # duckduckbot, gptbot, debug-skip) -> 4 crawler hits.
        assert counts == {"crawl_logs": 4}
        assert len(bq.inserts) == 1
        table, rows = bq.inserts[0]
        assert table == "cercol.cercol_seo.crawl_logs"
        bots = {r["bot_name"] for r in rows}
        assert bots == {"googlebot", "bingbot", "duckduckbot", "gptbot"}

    def test_run_with_no_log_file_returns_zero(self, tmp_path):
        cfg = _make_cfg()
        bq = FakeBQ()
        counts = crawl_log_parser.run(
            cfg, bq_client=bq,
            log_path=tmp_path / "does-not-exist.log",
            state_path=tmp_path / "state.json",
        )
        assert counts == {"crawl_logs": 0}
        assert bq.inserts == []
