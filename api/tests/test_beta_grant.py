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
    # The grant is now gated on a verified email (migration 032). Both the fresh
    # INSERT and the ON CONFLICT branch must consult auth_users.email_verified.
    assert "email_verified" in upsert.split("ON CONFLICT", 1)[0]
    assert "email_verified" in conflict


def test_verified_gate_present_in_both_ensure_profile_branches():
    # Email branch (above) and the no-email branch must both gate on verification.
    conn = RecordingConn()
    _run(main_module.ensure_profile(conn, "user-2", None))
    upsert = next(q for q in conn.executed if "INSERT INTO profiles" in q)
    assert "email_verified" in upsert
    assert "COUNT(*) <" in upsert  # slot cap still present alongside the gate


def _granted(premium: bool, is_beta: bool, slots_remain: bool, verified: bool) -> tuple[bool, bool]:
    """Python mirror of the SQL grant expression for premium and is_beta.

    Mirrors: NOT premium AND NOT is_beta AND slots_remain AND email_verified.
    """
    grant = (not premium) and (not is_beta) and slots_remain and verified
    return (premium or grant, is_beta or grant)


def test_grant_truth_table():
    # Verified, defectively-denied beta user, slots remain -> granted both.
    assert _granted(False, False, True, True) == (True, True)
    # Slots exhausted -> stays paywalled even when verified.
    assert _granted(False, False, False, True) == (False, False)
    # Already a beta user -> unchanged, never double-touched.
    assert _granted(True, True, True, True) == (True, True)
    # Paid customer (premium, not beta): keeps premium, never relabelled beta.
    assert _granted(True, False, True, True) == (True, False)
    assert _granted(True, False, False, True) == (True, False)


def test_unverified_never_claims_a_slot():
    # The slot-farming close: an unverified account never gets the grant, even
    # with slots free. It becomes eligible only once its email is verified.
    assert _granted(False, False, True, False) == (False, False)
    assert _granted(False, False, True, True) == (True, True)
    # Verification never revokes a paid customer's premium.
    assert _granted(True, False, True, False) == (True, False)
