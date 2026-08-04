"""The nudge job must be quiet, correct, and safe to run every night.

# Spec: api/deploy/cron/cercol-group-nudge

Its first dry run against production proposed three emails to one person and
one to a demo fixture. Both are regression-tested here.
"""
from __future__ import annotations

import os
import sys
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from jobs.group_nudge import build_status, choose_per_owner  # noqa: E402


def _row(**kw):
    base = dict(id="00000000-0000-0000-0000-000000000001", name="Team",
                created_at=datetime.now(timezone.utc) - timedelta(days=15),
                owner_email="a@b.c", owner_first_name="A", owner_lang="en",
                members=6, pending=0, completed_fullmoon=6, have_witnesses=0,
                due=True)
    base.update(kw)
    return base


def test_the_email_describes_the_owners_largest_team_not_the_first_one_due():
    """The real shape this hit, from production.

    One owner, three incomplete groups: a one-member group created on 28
    July and their actual six-member team created on the 30th. At a 15 day
    threshold the small one comes due two days before the others.

    Choosing only among the groups already past the threshold sent them an
    email about the abandoned one-member group, marked the rest suppressed,
    and never mentioned the team they actually use.
    """
    now = datetime.now(timezone.utc)
    small = _row(id="small", name="SL:T", members=1,
                 created_at=now - timedelta(days=16), due=True)
    real  = _row(id="real", name="Logs Sqn SLT v2", members=6,
                 created_at=now - timedelta(days=14), due=False)
    other = _row(id="other", name="Logs Sqn SLT", members=4,
                 created_at=now - timedelta(days=14), due=False)

    chosen = choose_per_owner([small, real, other])

    assert len(chosen) == 1, "one email per owner"
    assert chosen[0]["id"] == "real", "the email is about the team they use"
    assert sorted(chosen[0]["suppress_ids"]) == ["other", "small"], \
        "the others are suppressed now, or the owner is written to again in two days"


def test_no_email_until_at_least_one_group_is_due():
    now = datetime.now(timezone.utc)
    assert choose_per_owner([
        _row(id="a", members=6, created_at=now - timedelta(days=2), due=False),
        _row(id="b", members=1, created_at=now - timedelta(days=1), due=False),
    ]) == []


def test_two_owners_get_one_email_each():
    chosen = choose_per_owner([
        _row(id="a", owner_email="one@x.c", members=3),
        _row(id="b", owner_email="one@x.c", members=9),
        _row(id="c", owner_email="two@x.c", members=2),
    ])
    assert sorted(c["id"] for c in chosen) == ["b", "c"]


def test_status_reports_what_is_missing_not_what_is_done():
    s = build_status(_row())
    assert s["members"] == 6
    assert s["missing_test"] == 0
    assert s["no_witnesses"] == 6      # the state the job exists to unstick


def test_status_counts_a_half_finished_team():
    s = build_status(_row(completed_fullmoon=4, have_witnesses=2))
    assert s["missing_test"] == 2
    assert s["no_witnesses"] == 4


def test_days_is_the_age_of_the_group():
    s = build_status(_row(created_at=datetime.now(timezone.utc) - timedelta(days=21)))
    assert s["days"] == 21


def test_the_email_omits_the_pending_line_when_there_is_nothing_pending():
    """A nudge that says "0 invitations are waiting" reads as a form letter."""
    import emails
    html = emails._group_nudge_html("A", build_status(_row()), "g1", "en")
    assert "still waiting" not in html
    html2 = emails._group_nudge_html("A", build_status(_row(pending=2)), "g1", "en")
    assert "still waiting" in html2


def test_the_email_links_to_the_team_page():
    import emails
    html = emails._group_nudge_html("A", build_status(_row()), "abc-123", "en")
    assert "/groups/abc-123" in html


def test_every_language_has_the_nudge_strings():
    import emails
    keys = [k for k in emails._S if k.startswith("gn_")]
    assert len(keys) == 9
    for k in keys:
        for lang in ("en", "ca", "es", "fr", "de", "da"):
            assert emails._S[k].get(lang), (k, lang)


def test_two_completed_witnesses_is_the_bar_not_one():
    """The documented gate is MIN_WITNESSES_FOR_REPORT = 2. With one witness
    the aggregate is that named person's answer, the server will not release
    it, and the member therefore has no result. A job that treated one as
    done would stop nudging a team that cannot see anything."""
    import re, pathlib
    sql = pathlib.Path(__file__).parent.parent.joinpath("jobs/group_nudge.py").read_text()
    assert "w.n >= 2" in sql, "the nudge must require two completed witnesses"
    assert "completed_at IS NOT NULL" in sql, "created sessions are not completed ones"


def test_the_api_never_returns_individual_witness_scores():
    """A witness answers on the understanding that the subject sees an
    aggregate. Returning domain_scores per session let the subject read what
    each named colleague said straight from the network tab."""
    import pathlib
    main = pathlib.Path(__file__).parent.parent.joinpath("main.py").read_text()
    block = main[main.index('@app.get("/witness/my-sessions")'):]
    block = block[:block.index("@app.", 10)]
    assert '"scores"' not in block, "per-session scores must not leave the server"
    assert '"aggregate"' in block and "MIN_WITNESSES_FOR_REPORT" in block
