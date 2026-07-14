"""
Server-side Full Moon paywall (ADR 0018, Option A).

Gates the server-dependent Full Moon value surfaces on premium OR is_beta, while
leaving client-side scoring and the free/public flows untouched. No database in
CI, so we drive the endpoints against a fake asyncpg pool (mirrors
test_events.py) and unit-test the shared require_premium dependency directly.

Covered:
  - require_premium: non-entitled -> 403, no sub -> 401, premium -> pass,
    is_beta -> pass (promo accounts keep access).
  - Route wiring: the three gated surfaces depend on require_premium; the
    deliberate non-targets do not.
  - POST /results fullMoon branch: anon/non-entitled refused, premium/is_beta
    persist; free instruments (anon newMoon) stay open.
"""

from __future__ import annotations

import os
import sys
import types

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

os.environ.setdefault("JWT_SECRET", "x" * 48)
os.environ.setdefault("DATABASE_URL", "postgresql://example.invalid/gate_test")

import asyncio  # noqa: E402

from fastapi.testclient import TestClient  # noqa: E402
from fastapi import HTTPException  # noqa: E402
from jose import jwt  # noqa: E402

import deps as deps_module  # noqa: E402
import main as main_module  # noqa: E402


# ── Fakes ────────────────────────────────────────────────────────────────────

class FakeConn:
    """asyncpg-connection stand-in. `profile` is what the premium SELECT returns."""

    def __init__(self, profile=None):
        self.profile = profile
        self.executed: list = []
        self.results_inserted = False

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False

    async def execute(self, query, *args):
        self.executed.append((query, args))
        return "INSERT 0 1"

    async def fetchrow(self, query, *args):
        if "SELECT premium, is_beta FROM profiles" in query:
            return self.profile
        if "INSERT INTO results" in query:
            self.results_inserted = True
            return {"id": "00000000-0000-0000-0000-000000000001"}
        return None

    async def fetch(self, query, *args):
        return []


class FakePool:
    def __init__(self, conn):
        self._conn = conn

    def acquire(self):
        return self._conn


def _install_pool(conn):
    pool = FakePool(conn)
    main_module._pool = pool
    main_module.app.state.pool = pool
    return pool


def _token(sub="user-1"):
    return jwt.encode({"sub": sub, "aud": "authenticated"}, main_module._JWT_SECRET, algorithm="HS256")


def _auth(sub="user-1"):
    return {"Authorization": f"Bearer {_token(sub)}"}


def _client(conn):
    _install_pool(conn)
    # No context manager -> lifespan (and its real DB connect) is skipped.
    return TestClient(main_module.app, raise_server_exceptions=False)


def _run(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


# ── require_premium (shared dependency) ──────────────────────────────────────

def _fake_request(conn):
    pool = FakePool(conn)
    return types.SimpleNamespace(app=types.SimpleNamespace(state=types.SimpleNamespace(pool=pool)))


def test_require_premium_allows_premium():
    conn = FakeConn(profile={"premium": True, "is_beta": False})
    out = _run(deps_module.require_premium(_fake_request(conn), {"sub": "u1"}))
    assert out == {"sub": "u1"}


def test_require_premium_allows_beta():
    conn = FakeConn(profile={"premium": False, "is_beta": True})
    out = _run(deps_module.require_premium(_fake_request(conn), {"sub": "u1"}))
    assert out == {"sub": "u1"}


def test_require_premium_refuses_non_entitled():
    conn = FakeConn(profile={"premium": False, "is_beta": False})
    try:
        _run(deps_module.require_premium(_fake_request(conn), {"sub": "u1"}))
        assert False, "expected 403"
    except HTTPException as e:
        assert e.status_code == 403


def test_require_premium_refuses_missing_profile():
    conn = FakeConn(profile=None)
    try:
        _run(deps_module.require_premium(_fake_request(conn), {"sub": "u1"}))
        assert False, "expected 403"
    except HTTPException as e:
        assert e.status_code == 403


def test_require_premium_401_without_sub():
    conn = FakeConn(profile={"premium": True, "is_beta": True})
    try:
        _run(deps_module.require_premium(_fake_request(conn), {}))
        assert False, "expected 401"
    except HTTPException as e:
        assert e.status_code == 401


# ── Route wiring ─────────────────────────────────────────────────────────────

def _route_dep_names(path: str) -> set[str]:
    for r in main_module.app.routes:
        if getattr(r, "path", "") == path:
            names: set[str] = set()

            def walk(dep):
                for sub in dep.dependencies:
                    names.add(getattr(sub.call, "__name__", type(sub.call).__name__))
                    walk(sub)

            walk(r.dependant)
            return names
    raise AssertionError(f"route not found: {path}")


def test_gated_surfaces_require_premium():
    for path in ("/witness/sessions", "/witness/my-sessions", "/groups/{group_id}/report-data"):
        assert "require_premium" in _route_dep_names(path), path


def test_non_targets_are_not_gated():
    # These must NOT be gated: free/own-data reads and the public witness submit.
    for path in (
        "/me/results",
        "/witness/my-contributions",
        "/witness/session/{token}/complete",
        "/groups",
        "/results",
    ):
        assert "require_premium" not in _route_dep_names(path), path


# ── POST /results fullMoon branch ────────────────────────────────────────────

_FM = {"instrument": "fullMoon", "presence": 3, "bond": 3, "discipline": 3, "depth": 3, "vision": 3}
_NM = {"instrument": "newMoon", "presence": 4, "bond": 4, "discipline": 4, "depth": 4, "vision": 4}


def test_fullmoon_anonymous_is_refused():
    conn = FakeConn(profile=None)
    client = _client(conn)
    resp = client.post("/results", json=_FM)  # no auth header
    assert resp.status_code == 403
    assert conn.results_inserted is False


def test_fullmoon_non_premium_is_refused():
    conn = FakeConn(profile={"premium": False, "is_beta": False})
    client = _client(conn)
    resp = client.post("/results", json=_FM, headers=_auth())
    assert resp.status_code == 403
    assert conn.results_inserted is False


def test_fullmoon_premium_persists():
    conn = FakeConn(profile={"premium": True, "is_beta": False})
    client = _client(conn)
    resp = client.post("/results", json=_FM, headers=_auth())
    assert resp.status_code == 200
    assert conn.results_inserted is True


def test_fullmoon_beta_persists():
    conn = FakeConn(profile={"premium": False, "is_beta": True})
    client = _client(conn)
    resp = client.post("/results", json=_FM, headers=_auth())
    assert resp.status_code == 200
    assert conn.results_inserted is True


def test_free_instrument_anonymous_still_open():
    conn = FakeConn(profile=None)
    client = _client(conn)
    resp = client.post("/results", json=_NM)  # anonymous newMoon
    assert resp.status_code == 200
    assert conn.results_inserted is True


def test_gated_endpoint_refuses_non_premium_end_to_end():
    # A real gated endpoint returns 403 before its body runs for a non-entitled
    # (but authenticated) caller.
    conn = FakeConn(profile={"premium": False, "is_beta": False})
    client = _client(conn)
    resp = client.get("/witness/my-sessions", headers=_auth())
    assert resp.status_code == 403
