"""
Google OAuth name persistence (_find_or_create_user).

Exercises the helper against a fake asyncpg connection so no real database is
needed (mirrors test_events.py). Verifies that the name extracted from the
Google profile reaches the profiles upsert, that empty names become NULL, and
that the upsert uses COALESCE so a later login never overwrites an edited name.
"""

from __future__ import annotations

import asyncio
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

os.environ.setdefault("JWT_SECRET", "x" * 48)

import auth as auth_module  # noqa: E402


class FakeConn:
    """Records execute() calls; returns no existing user (new sign-up)."""

    def __init__(self):
        self.executed: list[tuple] = []

    async def fetchrow(self, query, *args):
        return None  # no existing auth_user → new-user path

    async def execute(self, query, *args):
        self.executed.append((query, args))
        return "INSERT 0 1"

    def profiles_upsert(self):
        for query, args in self.executed:
            if "INSERT INTO profiles" in query:
                return query, args
        raise AssertionError("no profiles upsert was executed")


def _run(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


def test_google_name_reaches_profiles_upsert():
    conn = FakeConn()
    _run(auth_module._find_or_create_user(
        conn, "Ada@Example.com", google_id="g-123",
        first_name="Ada", last_name="Lovelace",
    ))
    query, args = conn.profiles_upsert()
    # args: (id, email, first_name, last_name)
    assert args[1] == "ada@example.com"
    assert args[2] == "Ada"
    assert args[3] == "Lovelace"
    # Must not overwrite an edited name on a later login.
    assert "COALESCE(profiles.first_name" in query
    assert "COALESCE(profiles.last_name" in query


def test_empty_google_name_becomes_null():
    conn = FakeConn()
    _run(auth_module._find_or_create_user(
        conn, "nobody@example.com", google_id="g-456",
        first_name="   ", last_name="",
    ))
    _query, args = conn.profiles_upsert()
    assert args[2] is None
    assert args[3] is None


def test_no_name_args_default_to_null():
    # Password / magic-link callers pass no name at all.
    conn = FakeConn()
    _run(auth_module._find_or_create_user(conn, "plain@example.com"))
    _query, args = conn.profiles_upsert()
    assert args[2] is None
    assert args[3] is None
