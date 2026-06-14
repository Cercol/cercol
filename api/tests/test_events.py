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
