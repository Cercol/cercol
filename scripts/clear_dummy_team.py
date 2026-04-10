"""
clear_dummy_team.py — removes all seed data created by seed_dummy_team.py.

Usage:
    SUPABASE_URL=https://xxx.supabase.co \\
    SUPABASE_SERVICE_ROLE_KEY=eyJ... \\
    python scripts/clear_dummy_team.py

This script is safe to run multiple times (idempotent).
It deletes: group members, group, witness responses, witness sessions,
results, profiles, and auth users for the 7 seed users.
"""

import os
import sys

from supabase import create_client

# ---------------------------------------------------------------------------
# Config from environment — no defaults, fail immediately if missing
# ---------------------------------------------------------------------------

try:
    SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
    SERVICE_KEY  = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
except KeyError as _missing:
    print(f"ERROR: Required environment variable {_missing} is not set.")
    print("Usage: SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=eyJ... python scripts/clear_dummy_team.py")
    sys.exit(1)

db = create_client(SUPABASE_URL, SERVICE_KEY)

GROUP_ID = "b9c8d7e6-0000-0000-0000-000000000001"

USER_IDS = [
    "a1b2c3d4-0001-0000-0000-000000000001",
    "a1b2c3d4-0002-0000-0000-000000000002",
    "a1b2c3d4-0003-0000-0000-000000000003",
    "a1b2c3d4-0004-0000-0000-000000000004",
    "a1b2c3d4-0005-0000-0000-000000000005",
    "a1b2c3d4-0006-0000-0000-000000000006",
    "a1b2c3d4-0007-0000-0000-000000000007",
]

if __name__ == "__main__":
    print(f"\nClearing dummy team from {SUPABASE_URL}...")

    print("  Removing group members...")
    try:
        db.table("group_members").delete().eq("group_id", GROUP_ID).execute()
    except Exception as e:
        print(f"    ! {e}")

    print("  Removing group...")
    try:
        db.table("groups").delete().eq("id", GROUP_ID).execute()
    except Exception as e:
        print(f"    ! {e}")

    for uid in USER_IDS:
        # Witness responses (via sessions where this user is the subject)
        try:
            sessions = (
                db.table("witness_sessions")
                .select("id")
                .eq("subject_id", uid)
                .execute()
            )
            for s in sessions.data:
                db.table("witness_responses").delete().eq("session_id", s["id"]).execute()
        except Exception as e:
            print(f"    ! witness responses for {uid}: {e}")

        # Witness sessions (as subject or witness)
        for col in ("subject_id", "witness_user_id"):
            try:
                db.table("witness_sessions").delete().eq(col, uid).execute()
            except Exception:
                pass  # column may not exist if migration 008 not applied

        try:
            db.table("results").delete().eq("user_id", uid).execute()
        except Exception as e:
            print(f"    ! results for {uid}: {e}")

        try:
            db.table("profiles").delete().eq("id", uid).execute()
        except Exception as e:
            print(f"    ! profile for {uid}: {e}")

        print(f"  Removing auth user {uid}...")
        try:
            db.auth.admin.delete_user(uid)
        except Exception as e:
            msg = str(e).lower()
            if "not found" not in msg and "404" not in msg:
                print(f"    ! {e}")

    print("\nDone. All seed data removed.")
