"""
Pure scoring helpers — no external dependencies.

These functions mirror src/utils/role-scoring.js (single source of truth).
Kept in a separate module so they can be imported by tests without pulling
in asyncpg, stripe, or any other heavy runtime dependency.

Living-model norm hierarchy
----------------------------
Norms are resolved at three tiers, from most to least specific:

  Tier 1 — (instrument, language): population subset for that exact instrument
            and language combination.  Requires ≥ NORM_MIN_SAMPLE results.

  Tier 2 — (instrument): all languages pooled for that instrument.
            Requires ≥ NORM_MIN_SAMPLE results.

  Tier 3 — Hardcoded researcher priors (_NORM).  Used when empirical data
            is insufficient.  Values are based on published Big Five norms
            (predominantly Western/US samples) and will become less relevant
            as Cèrcol accumulates its own data.

The active norm cache lives in main.py (_norm_cache) and is refreshed every
NORM_REFRESH_DAYS days by a background asyncio task.
"""
import math

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

NORM_MIN_SAMPLE   = 200   # minimum results required to use empirical norms
NORM_REFRESH_DAYS = 28    # how often the background task refreshes the cache

# ---------------------------------------------------------------------------
# Researcher priors — Tier 3 fallback (from SCIENCE.md)
# ---------------------------------------------------------------------------

_NORM = {
    "presence":   {"mean": 3.3, "sd": 0.72},
    "bond":       {"mean": 3.9, "sd": 0.58},
    "discipline": {"mean": 3.7, "sd": 0.62},
    "depth":      {"mean": 2.8, "sd": 0.72},
    "vision":     {"mean": 3.7, "sd": 0.60},
}

DOMAINS = list(_NORM.keys())

# ---------------------------------------------------------------------------
# Response scale normalisation
# ---------------------------------------------------------------------------
# New Moon (TIPI) is answered on 1-7; every other instrument is 1-5, and the
# priors above are 1-5 statistics. Results are stored on the instrument's own
# scale, so a New Moon row must be mapped before it meets the priors: without
# it a mild "5" reads as +2.4 SD and the respondent lands in the wrong role.
# Empirical norms (Tier 1/2) are computed from the same stored column, so they
# already match the stored scale and must NOT be rescaled.
_SEVEN_POINT_INSTRUMENTS = {"newMoon"}


def to_five_scale(scores: dict, instrument: str | None) -> dict:
    """Linearly map a 1-7 instrument's domain scores onto 1-5.

    Returns `scores` unchanged for instruments already answered on 1-5.
    """
    if instrument not in _SEVEN_POINT_INSTRUMENTS:
        return scores
    return {
        k: ((float(v) - 1) * 4 / 6 + 1) if v is not None else v
        for k, v in scores.items()
    }

# Role centroids (presence, bond, vision, discipline, depth) — must match role-scoring.js
_ROLE_CENTROIDS = {
    "R01": ( 1.0,  1.0,  0.0,  0.0, -0.5),
    "R02": ( 1.0, -1.0,  0.0,  0.5,  0.3),
    "R03": (-1.0,  1.0,  0.0,  0.0, -0.8),
    "R04": (-1.0, -1.0,  0.0,  0.8, -0.5),
    "R05": ( 1.0,  0.0,  1.0, -0.3, -0.5),
    "R06": ( 1.0,  0.0, -1.0,  0.8, -0.3),
    "R07": (-1.0,  0.0,  1.0, -0.8,  0.0),
    "R08": (-1.0,  0.0, -1.0,  1.0, -0.8),
    "R09": ( 0.0,  1.0,  1.0,  0.8, -0.5),
    "R10": ( 0.0,  1.0, -1.0,  0.5, -0.8),
    "R11": ( 0.0, -1.0,  1.0, -0.8,  0.3),
    "R12": ( 0.0, -1.0, -1.0,  0.8, -0.3),
}

# ---------------------------------------------------------------------------
# Norm resolution
# ---------------------------------------------------------------------------

def resolve_norm(instrument: str, language: str | None, cache: dict) -> tuple[dict, str]:
    """
    Return the best available norm for this (instrument, language) pair and
    a string describing which tier was used.

    cache structure (built by main._recompute_norms):
        {
            "fullMoon": {
                "en":    { "presence": {"mean": X, "sd": Y, "n": N}, ... },
                "__all__": { ... },   # instrument-wide, all languages pooled
            },
            ...
        }

    Returns (norm_dict, tier_label) where norm_dict has the same shape as _NORM.
    """
    instr_cache = cache.get(instrument, {})

    # Tier 1 — instrument + language
    if language:
        lang_norm = instr_cache.get(language)
        if lang_norm and _norm_is_valid(lang_norm):
            return lang_norm, f"empirical:{instrument}:{language}"

    # Tier 2 — instrument, all languages pooled
    all_norm = instr_cache.get("__all__")
    if all_norm and _norm_is_valid(all_norm):
        return all_norm, f"empirical:{instrument}:*"

    # Tier 3 — researcher priors
    return _NORM, "prior"


def _norm_is_valid(norm: dict) -> bool:
    """True if every domain in _NORM is present with a finite sd > 0."""
    for domain in DOMAINS:
        entry = norm.get(domain)
        if not entry:
            return False
        if entry.get("sd", 0) <= 0:
            return False
    return True

# ---------------------------------------------------------------------------
# Scoring
# ---------------------------------------------------------------------------

def _scores_to_zscores(scores: dict, norm: dict | None = None,
                       instrument: str | None = None) -> dict:
    """
    Convert raw domain scores to z-scores using the provided norm dict.
    Falls back to researcher priors (_NORM) if norm is None.
    Only domains present in both scores and norm are included in the output.

    `instrument` triggers the 1-7 to 1-5 map, and only against the priors:
    an empirical norm was aggregated from the same stored column as `scores`,
    so both are already on the instrument's own scale.
    """
    effective = norm if norm is not None else _NORM
    if effective is _NORM:
        scores = to_five_scale(scores, instrument)
    # Cast each raw score to float before the arithmetic. Scores reach this
    # function from two sources: the JSON request body (already float) and
    # Postgres NUMERIC columns read by the admin endpoints (asyncpg returns
    # decimal.Decimal). Mixing Decimal with the float mean/sd raised
    # "unsupported operand type(s) for -: 'decimal.Decimal' and 'float'" and
    # crashed GET /admin/results with a 500. Float precision is more than
    # enough for psychometric z-scores.
    return {
        domain: (float(scores[domain]) - effective[domain]["mean"]) / effective[domain]["sd"]
        for domain in effective
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
