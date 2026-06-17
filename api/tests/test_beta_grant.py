"""
Beta premium auto-grant in ensure_profile (first ~500 users free).

ensure_profile() must grant premium/is_beta on the ON CONFLICT branch, not only
on a fresh INSERT: registration handlers (auth.py) create the profiles row
first, so the row already exists by the time ensure_profile runs and the INSERT
branch never wins. Before the fix, the grant silently never applied and beta
users were sent to the paywall.

There is no database in CI, so we verify two things without one:
  1. the executed upsert grants premium AND is_beta on conflict (regression
     guard against reverting to "DO UPDATE SET email" only); and
  2. the grant's boolean truth table, replicated in Python from the SQL
     expression, behaves correctly across all states.
"""

from __future__ import annotations

import asyncio
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

os.environ.setdefault("JWT_SECRET", "x" * 48)

import main as main_module  # noqa: E402


class RecordingConn:
    def __init__(self):
        self.executed: list[str] = []

    async def execute(self, query, *args):
        self.executed.append(query)
        return "INSERT 0 1"


def _run(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


def test_conflict_branch_grants_premium_and_beta():
    conn = RecordingConn()
    _run(main_module.ensure_profile(conn, "user-1", "person@example.com"))
    upsert = next(q for q in conn.executed if "INSERT INTO profiles" in q)
    # The conflict branch must touch premium and is_beta, not just email.
    conflict = upsert.split("ON CONFLICT", 1)[1]
    assert "premium" in conflict
    assert "is_beta" in conflict
    # Never silently revoke: each column ORs with its current value.
    assert "profiles.premium OR" in conflict
    assert "profiles.is_beta OR" in conflict
    # The cap is enforced by the remaining-slots subquery.
    assert "COUNT(*) <" in conflict


def _granted(premium: bool, is_beta: bool, slots_remain: bool) -> tuple[bool, bool]:
    """Python mirror of the SQL grant expression for premium and is_beta."""
    grant = (not premium) and (not is_beta) and slots_remain
    return (premium or grant, is_beta or grant)


def test_grant_truth_table():
    # Defectively-denied beta user, slots remain -> granted both.
    assert _granted(False, False, True) == (True, True)
    # Slots exhausted -> stays paywalled.
    assert _granted(False, False, False) == (False, False)
    # Already a beta user -> unchanged, never double-touched.
    assert _granted(True, True, True) == (True, True)
    # Paid customer (premium, not beta): keeps premium, never relabelled beta.
    assert _granted(True, False, True) == (True, False)
    assert _granted(True, False, False) == (True, False)
