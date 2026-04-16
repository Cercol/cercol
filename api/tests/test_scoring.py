"""
Unit tests for the two pure scoring functions in scoring.py:
  - _scores_to_zscores   — raw domain scores → z-scores using _NORM priors
  - _compute_role         — nearest-centroid role assignment

These mirror the frontend role-scoring.js logic and are the most
critical computational paths in the backend.
"""
import math
import sys
import os

import pytest

# Add api/ to path so we can import scoring without installing the package
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from scoring import _scores_to_zscores, _compute_role, _NORM, _ROLE_CENTROIDS


# ---------------------------------------------------------------------------
# _scores_to_zscores
# ---------------------------------------------------------------------------

class TestScoresToZscores:
    def _full_scores(self, **overrides):
        base = {d: _NORM[d]["mean"] for d in _NORM}
        base.update(overrides)
        return base

    def test_mean_score_gives_zero_zscore(self):
        scores = self._full_scores()
        z = _scores_to_zscores(scores)
        for domain in _NORM:
            assert z[domain] == pytest.approx(0.0, abs=1e-9), domain

    def test_one_sd_above_mean_gives_plus_one(self):
        for domain in _NORM:
            scores = self._full_scores(**{domain: _NORM[domain]["mean"] + _NORM[domain]["sd"]})
            z = _scores_to_zscores(scores)
            assert z[domain] == pytest.approx(1.0, abs=1e-9), domain

    def test_one_sd_below_mean_gives_minus_one(self):
        for domain in _NORM:
            scores = self._full_scores(**{domain: _NORM[domain]["mean"] - _NORM[domain]["sd"]})
            z = _scores_to_zscores(scores)
            assert z[domain] == pytest.approx(-1.0, abs=1e-9), domain

    def test_missing_domain_excluded_from_output(self):
        scores = {d: _NORM[d]["mean"] for d in _NORM if d != "vision"}
        z = _scores_to_zscores(scores)
        assert "vision" not in z
        assert len(z) == len(_NORM) - 1

    def test_none_value_excluded_from_output(self):
        scores = {d: _NORM[d]["mean"] for d in _NORM}
        scores["bond"] = None
        z = _scores_to_zscores(scores)
        assert "bond" not in z

    def test_output_keys_match_input_keys(self):
        scores = {d: _NORM[d]["mean"] for d in _NORM}
        z = _scores_to_zscores(scores)
        assert set(z.keys()) == set(_NORM.keys())


# ---------------------------------------------------------------------------
# _compute_role  (nearest-centroid assignment)
# ---------------------------------------------------------------------------

class TestComputeRole:
    """
    Each role has a known centroid. A z-score vector exactly on a centroid
    must return that role. We also test that each centroid is its own nearest
    neighbour (i.e. no two centroids are closer to each other than to themselves).
    """

    def test_each_centroid_maps_to_its_own_role(self):
        for role, (e, a, o, c, n) in _ROLE_CENTROIDS.items():
            zscores = {
                "presence":   e,
                "bond":       a,
                "vision":     o,
                "discipline": c,
                "depth":      n,
            }
            result = _compute_role(zscores)
            assert result == role, (
                f"Centroid of {role} mapped to {result} instead"
            )

    def test_all_zeros_returns_a_valid_role(self):
        z = {d: 0.0 for d in ["presence", "bond", "vision", "discipline", "depth"]}
        role = _compute_role(z)
        assert role in _ROLE_CENTROIDS

    def test_missing_dimensions_default_to_zero(self):
        """Partial z-score dicts should not crash — missing dims default to 0."""
        role = _compute_role({"presence": 1.0})
        assert role in _ROLE_CENTROIDS

    def test_high_presence_high_bond_returns_r01(self):
        """R01 (Dolphin) centroid is (+1, +1, 0, 0, -0.5) — highest E and A."""
        z = {"presence": 2.0, "bond": 2.0, "vision": 0.0, "discipline": 0.0, "depth": -1.0}
        assert _compute_role(z) == "R01"

    def test_low_presence_low_vision_high_discipline_returns_r08(self):
        """R08 (Tortoise) centroid is (-1, 0, -1, +1, -0.8) — low E, low O, high C."""
        z = {"presence": -2.0, "bond": 0.0, "vision": -2.0, "discipline": 2.0, "depth": -1.5}
        assert _compute_role(z) == "R08"

    def test_centroids_are_unique_nearest_neighbours(self):
        """
        For every role R, its own centroid must be strictly closer to R than to
        any other role. This validates there are no degenerate/duplicate centroids.
        """
        for role, centroid in _ROLE_CENTROIDS.items():
            own_dist = 0.0  # distance from centroid to itself
            for other_role, other_centroid in _ROLE_CENTROIDS.items():
                if other_role == role:
                    continue
                dist = math.sqrt(sum((a - b) ** 2 for a, b in zip(centroid, other_centroid)))
                assert dist > own_dist, (
                    f"Centroid of {role} is identical to or closer to {other_role}"
                )

    def test_output_is_always_a_known_role_code(self):
        import random
        random.seed(42)
        for _ in range(50):
            z = {d: random.gauss(0, 1) for d in ["presence", "bond", "vision", "discipline", "depth"]}
            assert _compute_role(z) in _ROLE_CENTROIDS
