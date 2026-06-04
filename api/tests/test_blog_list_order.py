"""GET /blog list ordering (bugfix: NULL published_at must sort last).

# Spec: docs/architecture/backend.md

The list endpoint runs against Postgres in production; these unit tests use a
fake asyncpg pool (no real DB), so they assert the ORDER BY *contract* the
endpoint sends to the database — which is what guarantees the two required
properties:

  (a) rows with NULL published_at sort LAST  -> `published_at DESC NULLS LAST`
  (b) deterministic order among equal/NULL published_at -> `, id DESC`
      (id is the table's UUID PRIMARY KEY: unique and always present)

Before the fix the clause was a bare `ORDER BY published_at DESC`, which on
Postgres places NULLs FIRST (the 25 undated articles surfaced at the top) and
left ties unbroken (unstable order across queries).
"""

from __future__ import annotations

import os
import re
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

os.environ.setdefault("JWT_SECRET", "x" * 48)

from datetime import datetime, timezone  # noqa: E402

from fastapi import FastAPI  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

import blog as blog_module  # noqa: E402


def _row(slug: str, published_at):
    now = datetime(2026, 1, 1, tzinfo=timezone.utc)
    return {
        "slug": slug,
        "status": "published",
        "title": {"en": slug},
        "description": {"en": ""},
        "cover_url": None,
        "author": "Test",
        "published_at": published_at,
        "view_count": 0,
        "category": "general",
        "complexity": "intermediate",
        "languages": ["en"],
    }


class _RecordingConn:
    """Captures the list query and returns the rows exactly as given (the real
    ordering is Postgres's job; here we pin the clause the endpoint emits)."""

    def __init__(self, rows: list[dict]):
        self._rows = rows
        self.queries: list[str] = []

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False

    async def fetch(self, query, *args):
        self.queries.append(query)
        return self._rows


class _RecordingPool:
    def __init__(self, conn: _RecordingConn):
        self._conn = conn

    def acquire(self):
        return self._conn


def _client(rows):
    conn = _RecordingConn(rows)
    app = FastAPI()
    app.include_router(blog_module.router)
    app.state.pool = _RecordingPool(conn)
    return TestClient(app, raise_server_exceptions=False), conn


def _order_by(query: str) -> str:
    m = re.search(r"ORDER BY\s+(.+?)\s*(?:\n|$)", query)
    assert m, f"no ORDER BY found in query: {query!r}"
    return " ".join(m.group(1).split())


def test_list_orders_nulls_last_with_id_tiebreak():
    now = datetime(2026, 1, 1, tzinfo=timezone.utc)
    rows = [_row("dated", now), _row("undated", None)]
    client, conn = _client(rows)

    resp = client.get("/blog")
    assert resp.status_code == 200

    # The clause Postgres uses to put NULL published_at last (a) and break ties
    # deterministically by the UUID primary key (b).
    assert _order_by(conn.queries[-1]) == "published_at DESC NULLS LAST, id DESC"


def test_list_query_is_not_the_old_bare_clause():
    # Regression guard: a bare `published_at DESC` puts NULLs FIRST on Postgres.
    client, conn = _client([_row("a", None)])
    client.get("/blog")
    clause = _order_by(conn.queries[-1])
    assert "NULLS LAST" in clause
    assert clause != "published_at DESC"
