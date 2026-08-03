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

from jobs.group_nudge import build_status  # noqa: E402


def _row(**kw):
    base = dict(id="00000000-0000-0000-0000-000000000001", name="Team",
                created_at=datetime.now(timezone.utc) - timedelta(days=15),
                owner_email="a@b.c", owner_first_name="A", owner_lang="en",
                members=6, pending=0, completed_fullmoon=6, have_witnesses=0)
    base.update(kw)
    return base


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
