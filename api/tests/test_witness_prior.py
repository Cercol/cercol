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


def test_seven_point_prior_is_the_tipi_published_norms():
    """Pinned to Gosling, Rentfrow & Potter (2014), N = 278,000, pooled over
    six age bands per sex, not derived from the 1-5 statistics.

    The derivation is what was wrong. Rescaling the IPIP figures put the Bond
    mean 0.74 of its own SD too high and every SD 25 to 45% too narrow, so an
    ordinary New Moon answer scored as cold and every z-score was pushed
    toward the edges of the role space. 41% of the real New Moon results held
    at the time were assigned a different role by the two priors.
    """
    seven = scoring.prior_for("newMoon")
    assert seven == {
        "presence":   {"mean": 3.95, "sd": 1.58},
        "bond":       {"mean": 4.71, "sd": 1.23},
        "discipline": {"mean": 4.65, "sd": 1.41},
        "depth":      {"mean": 3.64, "sd": 1.48},
        "vision":     {"mean": 5.51, "sd": 1.14},
    }


def test_the_seven_point_prior_is_not_a_stretched_five_point_one():
    """Regression guard: reinstating the linear map trips this."""
    five = scoring.prior_for("fullMoon")
    seven = scoring.prior_for("newMoon")
    stretched = all(
        abs(seven[d]["mean"] - ((five[d]["mean"] - 1) * 6 / 4 + 1)) < 0.01
        for d in scoring.DOMAINS
    )
    assert not stretched
    # A ten-item instrument spreads wider than a 120-item one, on every domain.
    for d in scoring.DOMAINS:
        assert seven[d]["sd"] > five[d]["sd"] * 6 / 4


def test_a_mild_tipi_answer_is_not_extreme():
    """A flat 5 on a 1-7 scale is mild. Against the 1-5 priors it read as
    +2.4 SD; against its own prior it must not."""
    flat = {d: 5.0 for d in scoring.DOMAINS}
    assert scoring._scores_to_zscores(flat)["presence"] > 2
    assert abs(scoring._scores_to_zscores(flat, instrument="newMoon")["presence"]) < 1
