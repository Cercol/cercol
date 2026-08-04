"""The Witness instrument must be measured against its own distribution.

# Spec: api/scoring.py

computeWitnessScores produces 3 + (votes/count) * 2 over 20 forced-choice
rounds. Every round increments count for all five factors and moves at most
two, so the output is centred on 3.0 by construction, with an SD near 0.50.
Measured against the self-report priors, whose means run 2.8 to 3.9, a
perfectly neutral witness landed at a fixed off-centre point and four of the
twelve roles became unreachable.
"""
from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import scoring  # noqa: E402


def test_a_typical_witness_sits_at_the_origin():
    """Typical means the instrument's own mean, not a round 3.0. The rank
    weights are asymmetric so the centre is 3.07, and hardcoding 3.0 here
    would silently pass whatever the prior said."""
    prior = scoring.prior_for("witness")
    typical = {d: prior[d]["mean"] for d in scoring.DOMAINS}
    z = scoring._scores_to_zscores(typical, instrument="witness")
    assert all(abs(v) < 1e-9 for v in z.values()), z


def test_a_typical_witness_is_off_centre_under_the_wrong_prior():
    """The regression this file exists for. Measured against the self-report
    priors, a typical witness lands over a standard deviation out on Bond."""
    prior = scoring.prior_for("witness")
    neutral = {d: prior[d]["mean"] for d in scoring.DOMAINS}
    z = scoring._scores_to_zscores(neutral)
    assert z["bond"] < -1.0   # over a full SD out on Bond alone
    assert scoring._compute_role(z) != scoring._compute_role(
        scoring._scores_to_zscores(neutral, instrument="witness")
    )


def test_every_role_is_reachable_from_the_witness_instrument():
    """Four roles were unreachable under the self-report prior, whatever the
    respondent was actually like. Sweep the instrument's reachable range."""
    reachable = set()
    lo, hi = 2.0, 4.0          # +/- 2 SD of the witness distribution
    steps = [lo + i * (hi - lo) / 6 for i in range(7)]
    for p in steps:
        for b in steps:
            for v in steps:
                for c in steps:
                    scores = {"presence": p, "bond": b, "vision": v,
                              "discipline": c, "depth": 3.0}
                    z = scoring._scores_to_zscores(scores, instrument="witness")
                    reachable.add(scoring._compute_role(z))
    assert len(reachable) == 12, sorted(reachable)


def test_seven_point_prior_matches_the_linear_map():
    five = scoring.prior_for("fullMoon")
    seven = scoring.prior_for("newMoon")
    for d in scoring.DOMAINS:
        assert seven[d]["mean"] == (five[d]["mean"] - 1) * 6 / 4 + 1
        assert seven[d]["sd"] == five[d]["sd"] * 6 / 4


def test_a_mild_tipi_answer_is_not_extreme():
    """A flat 5 on a 1-7 scale is mild. Against the 1-5 priors it read as
    +2.4 SD; against its own prior it must not."""
    flat = {d: 5.0 for d in scoring.DOMAINS}
    assert scoring._scores_to_zscores(flat)["presence"] > 2
    assert abs(scoring._scores_to_zscores(flat, instrument="newMoon")["presence"]) < 1
