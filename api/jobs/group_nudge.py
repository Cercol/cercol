"""Email a group owner whose team stalled partway through setting up.

# Spec: docs/decisions/0019-witness-instrument-scoring.md

A team arrives, everyone takes Full Moon, they read the report a few times,
and then nothing. That is the observed pattern, not a hypothesis: the first
real team on Cercol did exactly that, and the Witness round, which is the
only thing that produces self-observer agreement data, has never been run by
anyone outside the seed.

Nobody is going to discover the round on their own. /witness-setup has two
page views in the product's entire history. So this job writes to the person
who can start it, once, after NUDGE_AFTER_DAYS, with the actual state of
their team rather than a generic reminder.

Only the owner is emailed. The five other members joined because their
manager asked them to, and the round already emails each of them when it
starts, so the owner pressing one button is the whole mechanism.

Run manually (debug, sends real email):  python -m jobs.group_nudge
Dry run:                                 python -m jobs.group_nudge --dry-run
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
import sys
from datetime import datetime, timedelta, timezone

import asyncpg

from emails import send_group_nudge

log = logging.getLogger("cercol.group_nudge")

# Long enough that a team which is merely slow is not chased, short enough
# that the manager still remembers deciding to do this.
NUDGE_AFTER_DAYS = int(os.getenv("GROUP_NUDGE_AFTER_DAYS", "15"))


async def gather(conn, after_days: int) -> list[dict]:
    """Groups old enough to have stalled, that are not finished, not nudged.

    "Finished" means every active member has completed Full Moon AND has at
    least MIN_WITNESSES_FOR_REPORT completed witness sessions. Two, not one:
    with a single witness the aggregate is that named person's answer and the
    server will not release it, so a member with one witness has no result
    and the team is not done.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(days=after_days)
    rows = await conn.fetch(
        """
        SELECT g.id, g.name, g.created_at, g.created_at < $1 AS due,
               p.email                AS owner_email,
               p.first_name           AS owner_first_name,
               p.native_language      AS owner_lang,
               COUNT(*) FILTER (WHERE m.status = 'active')                 AS members,
               COUNT(*) FILTER (WHERE m.status = 'pending')                AS pending,
               COUNT(*) FILTER (WHERE m.status = 'active' AND r.id IS NOT NULL) AS completed_fullmoon,
               COUNT(*) FILTER (WHERE m.status = 'active' AND w.n >= 2)    AS have_witnesses
          FROM groups g
          JOIN profiles p ON p.id = g.created_by
          JOIN group_members m ON m.group_id = g.id
          LEFT JOIN LATERAL (
              SELECT id FROM results
               WHERE user_id = m.user_id AND instrument = 'fullMoon' AND NOT is_seed
               LIMIT 1
          ) r ON true
          LEFT JOIN LATERAL (
              -- Completed, not merely created, and at least
              -- MIN_WITNESSES_FOR_REPORT of them: a member with one finished
              -- witness still has no releasable result, so the team is not
              -- done. Mirrors the gate in main.py and FullMoonResultsPage.
              SELECT count(*) AS n FROM witness_sessions
               WHERE subject_id = m.user_id AND NOT is_seed
                 AND completed_at IS NOT NULL
          ) w ON true
         WHERE g.nudged_at IS NULL
           AND NOT g.is_seed
         GROUP BY g.id, g.name, g.created_at, p.email, p.first_name, p.native_language
        """,
        cutoff,
    )
    # A group is finished when every active member has both a Full Moon result
    # and at least one witness. Anything short of that is worth an email.
    incomplete = [
        dict(r) for r in rows
        if r["members"] > 0
        and not (r["completed_fullmoon"] == r["members"] and r["have_witnesses"] == r["members"])
    ]

    # One email per owner, not one per group. The first dry run against
    # production proposed writing three times to the same person, because a
    # mistyped invitation had left two abandoned groups behind the one they
    # actually use.
    #
    # Which one the email is about is decided across ALL of an owner's
    # incomplete groups, not only the ones already past the threshold. That
    # matters because the threshold is a date and groups are created days
    # apart. This owner has a one-member group from 28 July and their real
    # six-member team from 30 July. Filtering by the cutoff before choosing
    # sent them, on the 12th, an email about the abandoned one-member group,
    # marked the other two suppressed, and never mentioned the actual team.
    # Simulated at a lowered threshold against production, which is how the
    # ordering was caught: at five days it chose the one-member group, at
    # four days it chose the six-member one.
    #
    # So: any group past the threshold makes the owner due, and the email
    # then describes the largest group they have.
    return choose_per_owner(incomplete)


def choose_per_owner(incomplete: list[dict]) -> list[dict]:
    """At most one group per owner: the largest, once any of theirs is due."""
    by_owner: dict[str, list[dict]] = {}
    for row in incomplete:
        by_owner.setdefault(row["owner_email"], []).append(row)
    chosen = []
    for rows_for_owner in by_owner.values():
        if not any(r["due"] for r in rows_for_owner):
            continue
        rows_for_owner.sort(key=lambda r: (r["members"], r["created_at"]), reverse=True)
        best, rest = rows_for_owner[0], rows_for_owner[1:]
        # Suppress every one of them, including any not yet past the
        # threshold. Otherwise the owner is written to again when the next
        # one comes due, which is the duplicate this dedup exists to stop.
        best["suppress_ids"] = [r["id"] for r in rest]
        chosen.append(best)
    return chosen


def build_status(row: dict) -> dict:
    """The team's state, in the terms the email speaks."""
    members = row["members"]
    return {
        "group_name":  row["name"],
        "members":     members,
        "pending":     row["pending"],
        "completed":   row["completed_fullmoon"],
        "missing_test": members - row["completed_fullmoon"],
        "with_witnesses": row["have_witnesses"],
        "no_witnesses":   members - row["have_witnesses"],
        "days":        (datetime.now(timezone.utc) - row["created_at"]).days,
    }


async def run(dry_run: bool = False) -> list[dict]:
    conn = await asyncpg.connect(dsn=os.environ["DATABASE_URL"])
    await conn.set_type_codec("jsonb", encoder=json.dumps, decoder=json.loads,
                              schema="pg_catalog")
    sent = []
    try:
        for row in await gather(conn, NUDGE_AFTER_DAYS):
            status = build_status(row)
            sent.append({"group": row["name"], "owner": row["owner_email"], **status})
            if dry_run:
                continue
            try:
                await send_group_nudge(
                    owner_email = row["owner_email"],
                    owner_name  = row["owner_first_name"] or "",
                    status      = status,
                    group_id    = str(row["id"]),
                    lang        = row["owner_lang"] or "en",
                )
            except Exception as exc:
                # One bad address must not stop the rest, and must not mark
                # the group as nudged either.
                log.error("nudge failed for %s: %s", row["owner_email"], exc)
                continue
            # Mark the group emailed, and the owner's other stalled groups
            # suppressed, so they are not picked up on the next run.
            await conn.execute(
                "UPDATE groups SET nudged_at = now() WHERE id = ANY($1::uuid[])",
                [row["id"], *row.get("suppress_ids", [])],
            )
    finally:
        await conn.close()
    return sent


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    dry = "--dry-run" in sys.argv
    sent = asyncio.run(run(dry_run=dry))
    verb = "would nudge" if dry else "nudged"
    log.info("%s %d group(s)", verb, len(sent))
    for s in sent:
        log.info("  %s (%s): %d members, %d without a test, %d without a witness, %d days old",
                 s["group"], s["owner"], s["members"], s["missing_test"],
                 s["no_witnesses"], s["days"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
