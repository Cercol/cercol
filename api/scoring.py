"""
Pure scoring helpers — no external dependencies.

These functions mirror src/utils/role-scoring.js (single source of truth).
Kept in a separate module so they can be imported by tests without pulling
in asyncpg, stripe, or any other heavy runtime dependency.
"""
import math

# ---------------------------------------------------------------------------
# Normative priors for z-score computation (from SCIENCE.md)
# ---------------------------------------------------------------------------

_NORM = {
    "presence":   {"mean": 3.3, "sd": 0.72},
    "bond":       {"mean": 3.9, "sd": 0.58},
    "discipline": {"mean": 3.7, "sd": 0.62},
    "depth":      {"mean": 2.8, "sd": 0.72},
    "vision":     {"mean": 3.7, "sd": 0.60},
}

# Role centroids (presence, bond, vision, discipline, depth) — must match role-scoring.js
_ROLE_CENTROIDS = {
    "R01": ( 1.0,  1.0,  0.0,  0.0, -0.5),
    "R02": ( 1.0, -1.0,  0.0,  0.5,  0.3),
    "R03": (-1.0,  1.0,  0.0, -0.3,  0.3),
    "R04": (-1.0, -1.0,  0.0,  0.0,  0.5),
    "R05": ( 1.0,  0.0,  1.0,  0.3, -0.3),
    "R06": ( 1.0,  0.0, -1.0,  0.5,  0.0),
    "R07": (-1.0,  0.0,  1.0,  0.0,  0.8),
    "R08": (-1.0,  0.0, -1.0,  1.0, -0.8),
    "R09": ( 0.0,  1.0,  1.0, -0.3,  0.3),
    "R10": ( 0.0,  1.0, -1.0,  0.5, -0.3),
    "R11": ( 0.0, -1.0,  1.0,  0.0,  0.5),
    "R12": ( 0.0, -1.0, -1.0,  0.3, -0.5),
}


def _scores_to_zscores(scores: dict) -> dict:
    return {
        domain: (scores[domain] - _NORM[domain]["mean"]) / _NORM[domain]["sd"]
        for domain in _NORM
        if domain in scores and scores[domain] is not None
    }


def _compute_role(zscores: dict) -> str:
    """Nearest-centroid role assignment (mirrors frontend role-scoring.js)."""
    vec = (
        zscores.get("presence",   0),
        zscores.get("bond",       0),
        zscores.get("vision",     0),
        zscores.get("discipline", 0),
        zscores.get("depth",      0),
    )
    best_role, best_dist = "R01", float("inf")
    for role, centroid in _ROLE_CENTROIDS.items():
        dist = math.sqrt(sum((a - b) ** 2 for a, b in zip(vec, centroid)))
        if dist < best_dist:
            best_dist = dist
            best_role = role
    return best_role
