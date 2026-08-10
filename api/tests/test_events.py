"""
POST /events first-party funnel endpoint (SLICE 6).

Exercises the endpoint against a fake asyncpg pool so no real database is
needed (mirrors test_blog_redirects.py):

  - valid event name    -> 200, stored=True, exactly one INSERT executed
  - unknown event name  -> 400, no INSERT
  - events table absent -> 200, stored=False (pre-migration deploy window)
"""

from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

os.environ.setdefault("JWT_SECRET", "x" * 48)

import asyncpg  # noqa: E402
from fastapi import FastAPI  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

import blog as blog_module  # noqa: E402


class FakeConn:
    """Minimal asyncpg-connection stand-in that records INSERTs."""

    def __init__(self, table_exists: bool = True):
        self._table_exists = table_exists
        self.executed: list[tuple] = []

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False

    async def execute(self, query, *args):
        if "INSERT INTO events" in query:
            if not self._table_exists:
                raise asyncpg.exceptions.UndefinedTableError(
                    'relation "events" does not exist'
                )
            self.executed.append((query, args))
            return "INSERT 0 1"
        raise AssertionError(f"unexpected execute: {query}")


class FakePool:
    def __init__(self, conn: FakeConn):
        self._conn = conn

    def acquire(self):
        return self._conn


def _client(table_exists: bool = True):
    conn = FakeConn(table_exists=table_exists)
    app = FastAPI()
    app.include_router(blog_module.router)
    app.state.pool = FakePool(conn)
    return TestClient(app, raise_server_exceptions=False), conn


def test_valid_event_inserts_one_row():
    client, conn = _client()
    resp = client.post("/events", json={"name": "article_view", "slug": "x"})
    assert resp.status_code == 200
    assert resp.json()["stored"] is True
    assert len(conn.executed) == 1


def test_unknown_event_name_is_rejected():
    client, conn = _client()
    resp = client.post("/events", json={"name": "bogus"})
    assert resp.status_code == 400
    assert conn.executed == []


def test_missing_events_table_degrades_to_200():
    client, conn = _client(table_exists=False)
    resp = client.post("/events", json={"name": "test_start", "instrument": "newMoon"})
    assert resp.status_code == 200
    assert resp.json()["stored"] is False


def test_cta_click_carries_anon_id():
    # The frontend now attaches anon_id to every funnel event (not just
    # page_view) so the digest can stitch a visitor across reads -> cta_click.
    # Verify a cta_click with anon_id is accepted and the id reaches the INSERT.
    client, conn = _client()
    resp = client.post(
        "/events",
        json={"name": "cta_click", "slug": "x", "lang": "en", "anon_id": "visitor-123"},
    )
    assert resp.status_code == 200
    assert resp.json()["stored"] is True
    assert len(conn.executed) == 1
    # INSERT args: (name, slug, instrument, lang, path, anon_id) -> anon_id last.
    _query, args = conn.executed[0]
    assert args[-1] == "visitor-123"


# ---------------------------------------------------------------------------
# Automated-client filter
# ---------------------------------------------------------------------------
#
# The digest's visitor and page-view counts are built from this table, and
# the access log for the week of 2026-08-03 showed a large share of the
# traffic was Chrome-Lighthouse (our own PageSpeed runs), Google-NotebookLM
# and Bytespider. Those are accepted and dropped.

# Real strings taken from /var/log/caddy, not invented.
LIGHTHOUSE_UA = (
    "Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36 Chrome-Lighthouse"
)
BYTESPIDER_UA = (
    "Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 (KHTML, like Gecko) "
    "Mobile Safari/537.36 (compatible; Bytespider; https://zhanzhang.toutiao.com/)"
)
HUMAN_UA = (
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 "
    "(KHTML, like Gecko) Version/26.5.2 Mobile/15E148 Safari/604.1"
)
# The same Moto G Power model, without the Lighthouse token: a real phone.
REAL_MOTO_UA = (
    "Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36"
)
# CUBOT is a phone brand whose name contains "bot"; a bare substring match
# on "bot" would delete these readers.
CUBOT_UA = (
    "Mozilla/5.0 (Linux; Android 10; CUBOT_NOTE_20) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36"
)


def _post_ua(ua, name="page_view"):
    client, conn = _client()
    resp = client.post("/events", json={"name": name}, headers={"User-Agent": ua})
    return resp, conn


def test_lighthouse_is_accepted_and_dropped():
    resp, conn = _post_ua(LIGHTHOUSE_UA)
    assert resp.status_code == 200
    assert resp.json()["stored"] is False
    assert conn.executed == []


def test_notebooklm_is_dropped():
    resp, conn = _post_ua("Google-NotebookLM")
    assert resp.json()["stored"] is False
    assert conn.executed == []


def test_bytespider_is_dropped():
    resp, conn = _post_ua(BYTESPIDER_UA)
    assert resp.json()["stored"] is False
    assert conn.executed == []


def test_a_real_reader_is_still_stored():
    resp, conn = _post_ua(HUMAN_UA)
    assert resp.json()["stored"] is True
    assert len(conn.executed) == 1


def test_the_same_phone_without_lighthouse_is_a_reader():
    # It is the Chrome-Lighthouse token that identifies the PageSpeed run,
    # not the device it emulates. Filtering the device would delete every
    # real Moto G Power visitor.
    resp, conn = _post_ua(REAL_MOTO_UA)
    assert resp.json()["stored"] is True
    assert len(conn.executed) == 1


def test_a_phone_brand_containing_bot_is_not_a_bot():
    resp, conn = _post_ua(CUBOT_UA)
    assert resp.json()["stored"] is True
    assert len(conn.executed) == 1


def test_missing_user_agent_is_treated_as_a_reader():
    client, conn = _client()
    resp = client.post("/events", json={"name": "page_view"})
    assert resp.json()["stored"] is True
    assert len(conn.executed) == 1
