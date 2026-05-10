"""
Shared FE/BE role oracle — backend consumer.

Loads tests/role-oracle.json from the repo root and verifies:
1. _NORM values match the oracle's norm_assumptions (catches silent FE/BE norm drift).
2. For every oracle case, converting the raw scores through _scores_to_zscores and
   then calling _compute_role returns the expected role code.

NOTE: _compute_role expects z-scores, not raw scores. The conversion is done here
via _scores_to_zscores so the test exercises the full pipeline.
"""

import json
from pathlib import Path

import pytest

from scoring import _NORM, _compute_role, _scores_to_zscores

# Path: api/tests/ -> api/ -> repo root -> tests/role-oracle.json
ORACLE_PATH = Path(__file__).resolve().parent.parent.parent / "tests" / "role-oracle.json"


def _load_oracle():
    with ORACLE_PATH.open() as fh:
        return json.load(fh)


_ORACLE = _load_oracle()


def test_norm_assumptions_match_backend():
    """The backend _NORM must match the oracle's norm_assumptions."""
    for dim in ("presence", "bond", "vision", "discipline", "depth"):
        oracle_dim = _ORACLE["norm_assumptions"][dim]
        backend_dim = _NORM[dim]
        assert backend_dim["mean"] == oracle_dim["mean"], (
            f"{dim} mean diverges: backend={backend_dim['mean']} "
            f"oracle={oracle_dim['mean']}"
        )
        assert backend_dim["sd"] == oracle_dim["sd"], (
            f"{dim} sd diverges: backend={backend_dim['sd']} "
            f"oracle={oracle_dim['sd']}"
        )


@pytest.mark.parametrize(
    "case",
    _ORACLE["cases"],
    ids=lambda c: c["id"],
)
def test_role_oracle(case):
    # Convert raw 1-5 scores to z-scores using the backend's own _NORM,
    # then feed into _compute_role (which expects z-scores).
    zscores = _scores_to_zscores(case["scores"])
    actual = _compute_role(zscores)
    # _compute_role returns a plain string role code.
    assert actual == case["expected_role"], (
        f"{case['id']}: got {actual!r}, expected {case['expected_role']!r}"
    )
