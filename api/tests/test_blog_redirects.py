"""
GET /blog/<slug> redirect behaviour (Phase 17.10, link integrity).

# Spec: docs/architecture/seo-pipeline.md

Exercises the blog detail endpoint against a fake asyncpg pool so no real
database is needed:

  - live slug                  -> 200
  - dead slug with redirect    -> 308, Location: /blog/<slug_new>
  - dead slug, no redirect     -> 404
  - redirect to a missing slug -> 404 (single hop; chains/cycles cannot loop)
  - redirects table absent     -> 404 (defensive, pre-migration deploy window)
"""

from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

os.environ.setdefault("JWT_SECRET", "x" * 48)

import asyncpg  # noqa: E402
from datetime import datetime, timezone  # noqa: E402

import pytest  # noqa: E402
from fastapi import FastAPI  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

import blog as blog_module  # noqa: E402


def _live_row(slug: str) -> dict:
    now = datetime(2026, 1, 1, tzinfo=timezone.utc)
    return {
        "slug": slug,
        "status": "published",
        "title": {"en": slug},
        "description": {"en": ""},
        "content": {"en": "body"},
        "cover_url": None,
        "author": "Test",
        "published_at": now,
        "created_at": now,
        "updated_at": now,
        "view_count": 0,
        "category": "general",
        "complexity": "intermediate",
    }


class FakeConn:
    """Minimal asyncpg-connection stand-in driven by query-string sniffing."""

    def __init__(self, live: set[str], redirects: dict[str, str], table_exists: bool):
        self._live = live
        self._redirects = redirects
        self._table_exists = table_exists

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False

    async def fetchrow(self, query, *args):
        if "FROM blog_posts" in query and "WHERE slug" in query:
            slug = args[0]
            return _live_row(slug) if slug in self._live else None
        raise AssertionError(f"unexpected fetchrow: {query}")

    async def fetchval(self, query, *args):
        if "FROM blog_slug_redirects" in query:
            if not self._table_exists:
                raise asyncpg.exceptions.UndefinedTableError("relation does not exist")
            return self._redirects.get(args[0])
        if "SELECT 1 FROM blog_posts" in query:
            return 1 if args[0] in self._live else None
        raise AssertionError(f"unexpected fetchval: {query}")


class FakePool:
    def __init__(self, conn: FakeConn):
        self._conn = conn

    def acquire(self):
        return self._conn


def _client(live, redirects, table_exists=True) -> TestClient:
    app = FastAPI()
    app.include_router(blog_module.router)
    app.state.pool = FakePool(FakeConn(set(live), dict(redirects), table_exists))
    return TestClient(app, raise_server_exceptions=False)


def test_live_slug_returns_200():
    client = _client(live={"alpha"}, redirects={})
    resp = client.get("/blog/alpha", follow_redirects=False)
    assert resp.status_code == 200
    assert resp.json()["slug"] == "alpha"


def test_dead_slug_with_redirect_returns_308():
    client = _client(live={"beta"}, redirects={"alpha": "beta"})
    resp = client.get("/blog/alpha", follow_redirects=False)
    assert resp.status_code == 308
    assert resp.headers["location"] == "/blog/beta"


def test_dead_slug_without_redirect_returns_404():
    client = _client(live={"beta"}, redirects={})
    resp = client.get("/blog/ghost", follow_redirects=False)
    assert resp.status_code == 404


def test_redirect_to_missing_target_returns_404():
    # alpha -> beta, but beta is not a live post: do not 308 to a dead page.
    client = _client(live=set(), redirects={"alpha": "beta"})
    resp = client.get("/blog/alpha", follow_redirects=False)
    assert resp.status_code == 404


def test_cycle_does_not_loop():
    # A -> B and B -> A, neither is a live post. One hop, target missing,
    # so the endpoint answers 404 without following the cycle.
    client = _client(live=set(), redirects={"a": "b", "b": "a"})
    resp = client.get("/blog/a", follow_redirects=False)
    assert resp.status_code == 404


def test_missing_redirects_table_degrades_to_404():
    client = _client(live={"beta"}, redirects={}, table_exists=False)
    resp = client.get("/blog/ghost", follow_redirects=False)
    assert resp.status_code == 404
