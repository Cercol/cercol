"""
seed_dummy_team.py — inserts a realistic dummy team into Supabase for development.

Usage:
    SUPABASE_URL=https://xxx.supabase.co \\
    SUPABASE_SERVICE_ROLE_KEY=eyJ... \\
    python scripts/seed_dummy_team.py

The script is idempotent: running it twice will not duplicate data.

What it creates:
  - 7 fictional Valencian/Catalan users with auth accounts and profiles
  - 7 Full Moon results (fullMoon instrument), varied OCEAN scores, >= 6 different roles
  - 42 Witness sessions (every user witnesses every other user, 7x6=42)
  - 42 Witness responses, each consistent with the subject's self-report + noise
  - 1 group named 'Grup de prova — La Ventijol' with all 7 users as active members

Role assignments (verified against role-scoring.js CENTROIDS):
  Laia Navarro   → R05 Eagle    (P+ V+)
  Miquel Ferrer  → R03 Elephant (P- B+)
  Carme Blasco   → R12 Badger   (B- V-)
  Arnau Monzó    → R07 Octopus  (P- V+)
  Neus Vilar     → R01 Dolphin  (P+ B+)
  Pau Iborra     → R02 Wolf     (P+ B-)
  Roser Coll     → R10 Bear     (B+ V-)
"""

import os
import random
import sys
import uuid
from datetime import datetime, timezone

from supabase import create_client

# ---------------------------------------------------------------------------
# Config from environment — no defaults, fail immediately if missing
# ---------------------------------------------------------------------------

try:
    SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
    SERVICE_KEY  = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
except KeyError as _missing:
    print(f"ERROR: Required environment variable {_missing} is not set.")
    print("Usage: SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=eyJ... python scripts/seed_dummy_team.py")
    sys.exit(1)

db = create_client(SUPABASE_URL, SERVICE_KEY)

# ---------------------------------------------------------------------------
# Seed data
# ---------------------------------------------------------------------------

GROUP_NAME = "Grup de prova — La Ventijol"
GROUP_ID   = "b9c8d7e6-0000-0000-0000-000000000001"
NOW        = datetime.now(timezone.utc).isoformat()

# Fixed UUIDs so re-runs are idempotent
USERS = [
    {
        "id":              "a1b2c3d4-0001-0000-0000-000000000001",
        "email":           "laia.navarro@ventijol.dev",
        "first_name":      "Laia",
        "last_name":       "Navarro",
        "country":         "ES",
        "native_language": "ca",
        # role: R05 Eagle (P+ V+)
        "scores": {"presence": 4.3, "bond": 3.9, "vision": 4.5, "discipline": 2.9, "depth": 2.5},
    },
    {
        "id":              "a1b2c3d4-0002-0000-0000-000000000002",
        "email":           "miquel.ferrer@ventijol.dev",
        "first_name":      "Miquel",
        "last_name":       "Ferrer",
        "country":         "ES",
        "native_language": "ca",
        # role: R03 Elephant (P- B+)
        "scores": {"presence": 2.0, "bond": 4.8, "vision": 3.5, "discipline": 3.8, "depth": 2.2},
    },
    {
        "id":              "a1b2c3d4-0003-0000-0000-000000000003",
        "email":           "carme.blasco@ventijol.dev",
        "first_name":      "Carme",
        "last_name":       "Blasco",
        "country":         "ES",
        "native_language": "ca",
        # role: R12 Badger (B- V-)
        "scores": {"presence": 3.3, "bond": 2.5, "vision": 2.0, "discipline": 4.5, "depth": 2.5},
    },
    {
        "id":              "a1b2c3d4-0004-0000-0000-000000000004",
        "email":           "arnau.monzo@ventijol.dev",
        "first_name":      "Arnau",
        "last_name":       "Monzó",
        "country":         "ES",
        "native_language": "ca",
        # role: R07 Octopus (P- V+)
        "scores": {"presence": 2.0, "bond": 3.9, "vision": 4.6, "discipline": 2.5, "depth": 3.0},
    },
    {
        "id":              "a1b2c3d4-0005-0000-0000-000000000005",
        "email":           "neus.vilar@ventijol.dev",
        "first_name":      "Neus",
        "last_name":       "Vilar",
        "country":         "ES",
        "native_language": "ca",
        # role: R01 Dolphin (P+ B+)
        "scores": {"presence": 4.5, "bond": 4.7, "vision": 3.8, "discipline": 3.5, "depth": 2.0},
    },
    {
        "id":              "a1b2c3d4-0006-0000-0000-000000000006",
        "email":           "pau.iborra@ventijol.dev",
        "first_name":      "Pau",
        "last_name":       "Iborra",
        "country":         "ES",
        "native_language": "ca",
        # role: R02 Wolf (P+ B-)
        "scores": {"presence": 4.4, "bond": 2.7, "vision": 3.5, "discipline": 4.2, "depth": 3.5},
    },
    {
        "id":              "a1b2c3d4-0007-0000-0000-000000000007",
        "email":           "roser.coll@ventijol.dev",
        "first_name":      "Roser",
        "last_name":       "Coll",
        "country":         "ES",
        "native_language": "ca",
        # role: R10 Bear (B+ V-)
        "scores": {"presence": 3.3, "bond": 4.6, "vision": 2.3, "discipline": 4.5, "depth": 1.9},
    },
]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_witness_user_id_col = None

def _has_witness_user_id():
    """Return True if migration 008 has been applied (witness_user_id column exists)."""
    global _witness_user_id_col
    if _witness_user_id_col is not None:
        return _witness_user_id_col
    try:
        db.table("witness_sessions").select("witness_user_id").limit(1).execute()
        _witness_user_id_col = True
    except Exception:
        _witness_user_id_col = False
    return _witness_user_id_col


def _ensure_groups_table():
    """Check groups table exists; print migration instructions and exit if not."""
    try:
        db.table("groups").select("id").limit(1).execute()
    except Exception as e:
        msg = str(e)
        if "42P01" in msg or "does not exist" in msg.lower() or "not found" in msg.lower():
            ref = SUPABASE_URL.split("//")[-1].split(".")[0]
            print()
            print("  *** MIGRATION REQUIRED ***")
            print("  The 'groups' table does not exist in your Supabase project.")
            print(f"  Apply supabase/migrations/008_witness_identity.sql and")
            print(f"  supabase/migrations/009_groups.sql in the SQL editor:")
            print(f"  https://supabase.com/dashboard/project/{ref}/sql")
            print()
            sys.exit(1)
        raise


def _noisy(value, noise=0.35, lo=1.0, hi=5.0):
    """Add realistic witness noise to a self-report score."""
    v = value + random.gauss(0, noise)
    return round(max(lo, min(hi, v)), 2)

# ---------------------------------------------------------------------------
# Seed steps
# ---------------------------------------------------------------------------

def seed_users():
    print("  Creating auth users and profiles...")
    for u in USERS:
        # Create auth user via Admin API
        try:
            db.auth.admin.create_user({
                "id":            u["id"],
                "email":         u["email"],
                "password":      "ventijol-dev-2026",
                "email_confirm": True,
                "user_metadata": {"first_name": u["first_name"]},
            })
            print(f"    + auth user {u['email']}")
        except Exception as e:
            msg = str(e).lower()
            if "already been registered" in msg or "already exists" in msg or "duplicate" in msg or "422" in msg:
                print(f"    ~ auth user {u['email']} already exists")
            else:
                print(f"    ! failed to create {u['email']}: {e}")
                raise

        # Upsert profile (trigger may create the row, but without name/country)
        try:
            db.table("profiles").upsert({
                "id":              u["id"],
                "first_name":      u["first_name"],
                "last_name":       u["last_name"],
                "country":         u["country"],
                "native_language": u["native_language"],
                "premium":         True,
            }).execute()
        except Exception as e:
            print(f"    ! profile upsert for {u['email']}: {e}")


def seed_results():
    print("  Inserting Full Moon results...")
    for u in USERS:
        existing = (
            db.table("results")
            .select("id")
            .eq("user_id", u["id"])
            .eq("instrument", "fullMoon")
            .limit(1)
            .execute()
        )
        if existing.data:
            print(f"    ~ result for {u['email']} already exists")
            continue

        s = u["scores"]
        db.table("results").insert({
            "user_id":    u["id"],
            "language":   "ca",
            "instrument": "fullMoon",
            "presence":   s["presence"],
            "bond":       s["bond"],
            "vision":     s["vision"],
            "discipline": s["discipline"],
            "depth":      s["depth"],
        }).execute()
        print(f"    + result for {u['email']}")


def seed_witness_sessions():
    print("  Inserting Witness sessions (42 total)...")
    random.seed(42)  # reproducible noise

    has_wuid = _has_witness_user_id()
    if not has_wuid:
        print("    (migration 008 not applied — skipping witness_user_id field)")

    for subject in USERS:
        for witness in USERS:
            if subject["id"] == witness["id"]:
                continue

            # Deterministic token derived from pair (idempotent)
            token_src = f"ventijol-{subject['id'][-4:]}-{witness['id'][-4:]}"
            token = token_src.replace("-", "")[:32].ljust(32, "0")

            existing = (
                db.table("witness_sessions")
                .select("id")
                .eq("token", token)
                .execute()
            )
            if existing.data:
                # Still advance the random state to keep noise reproducible
                for _ in range(5):
                    random.gauss(0, 0.35)
                continue

            session_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, token_src))

            payload = {
                "id":              session_id,
                "subject_id":      subject["id"],
                "subject_display": f"{subject['first_name']} {subject['last_name']}",
                "token":           token,
                "witness_name":    f"{witness['first_name']} {witness['last_name']}",
                "witness_email":   witness["email"],
                "completed_at":    NOW,
            }
            if has_wuid:
                payload["witness_user_id"] = witness["id"]

            try:
                db.table("witness_sessions").insert(payload).execute()
            except Exception as e:
                print(f"    ! session {subject['email']} → {witness['email']}: {e}")
                for _ in range(5):
                    random.gauss(0, 0.35)
                continue

            s = subject["scores"]
            ws = {
                "presence":   _noisy(s["presence"]),
                "bond":       _noisy(s["bond"]),
                "vision":     _noisy(s["vision"]),
                "discipline": _noisy(s["discipline"]),
                "depth":      _noisy(s["depth"]),
            }

            try:
                db.table("witness_responses").insert({
                    "session_id":    session_id,
                    "domain_scores": ws,
                }).execute()
            except Exception as e:
                print(f"    ! response {subject['email']} → {witness['email']}: {e}")

    print("    done.")


def seed_group():
    print(f"  Creating group '{GROUP_NAME}'...")
    _ensure_groups_table()

    existing = (
        db.table("groups")
        .select("id")
        .eq("id", GROUP_ID)
        .execute()
    )
    if not existing.data:
        db.table("groups").insert({
            "id":         GROUP_ID,
            "name":       GROUP_NAME,
            "created_by": USERS[0]["id"],
        }).execute()
        print("    + group created")
    else:
        print("    ~ group already exists")

    for u in USERS:
        existing = (
            db.table("group_members")
            .select("user_id")
            .eq("group_id", GROUP_ID)
            .eq("user_id", u["id"])
            .execute()
        )
        if existing.data:
            continue
        db.table("group_members").insert({
            "group_id":   GROUP_ID,
            "user_id":    u["id"],
            "status":     "active",
            "invited_at": NOW,
            "joined_at":  NOW,
        }).execute()
        print(f"    + member {u['email']}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print(f"\nSeeding dummy team into {SUPABASE_URL}...")
    seed_users()
    seed_results()
    seed_witness_sessions()
    seed_group()
    print(f"\nDone. Group ID: {GROUP_ID}")
    print(f"Visit /groups to see '{GROUP_NAME}'.")
