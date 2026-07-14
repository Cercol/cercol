"""
Email-verification gating for the beta/premium grant (migration 032).

No database in CI, so we assert on the SQL a recording connection receives:
_find_or_create_user (the magic-link / Google path) must mark the account
email_verified = TRUE, because reaching it means ownership was proven. The
password-signup path deliberately does NOT go through _find_or_create_user, so
it stays unverified until /auth/verify-email flips the flag.
"""

from __future__ import annotations

import asyncio
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

os.environ.setdefault("JWT_SECRET", "x" * 48)

import auth as auth_module  # noqa: E402


class RecordingConn:
    """Records execute() SQL; fetchrow() returns None so the 'new user' branch runs."""

    def __init__(self):
        self.executed: list[str] = []

    async def execute(self, query, *args):
        self.executed.append(query)
        return "INSERT 0 1"

    async def fetchrow(self, query, *args):
        return None


def _run(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


def test_magic_link_new_user_is_marked_verified():
    conn = RecordingConn()
    _run(auth_module._find_or_create_user(conn, "person@example.com"))
    assert any(
        "UPDATE auth_users SET email_verified = TRUE" in q for q in conn.executed
    ), "magic-link/Google account creation must set email_verified = TRUE"


def test_google_new_user_is_marked_verified():
    conn = RecordingConn()
    _run(auth_module._find_or_create_user(conn, "person@example.com", google_id="g-123"))
    assert any(
        "UPDATE auth_users SET email_verified = TRUE" in q for q in conn.executed
    )


def test_verify_email_route_registered():
    paths = {getattr(r, "path", "") for r in auth_module.router.routes}
    assert "/auth/verify-email" in paths
