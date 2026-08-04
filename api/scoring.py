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
# Researcher priors, per instrument - Tier 3 fallback (from SCIENCE.md)
# ---------------------------------------------------------------------------
# A prior belongs to an instrument, not to the platform. Three times now a
# score has been z-scored against a reference built for a different
# instrument, and each time the result was not noise but a systematic push
# toward one corner of the role space:
#
#   New Moon answers on 1-7 and was measured against 1-5 statistics, so a
#   mild "5" read as +2.4 SD.
#
#   The Witness instrument is forced-choice and its own output is centred on
#   3.0 with an SD near 0.50, because count[] increments for all five factors
#   every round while only two receive a vote. Measured against self-report
#   means of 3.3 to 3.9 it put four roles out of reach entirely and sent 41%
#   of everyone to Badger.
#
# So the priors are keyed by instrument and nothing may z-score without
# saying which instrument produced the numbers.

# The IPIP-NEO-120's own published descriptives, for First Quarter and Full
# Moon, which are IPIP-NEO instruments.
#
# Kajonius, P. J., & Johnson, J. A. (2019). Assessing the structure of the
# Five Factor Model of Personality (IPIP-NEO-120) in the public domain.
# Europe's Journal of Psychology, 15(2), 260-275. Table A1.
# doi:10.5964/ejop.v15i2.1671  (open access)
#
# N = 320,128 (127,695 male, 192,433 female, mean age 28.13). The table
# reports domain scores on the 4-20 facet metric; a facet is four items on
# 1-5, and each domain figure is the mean of its six facets, so dividing by
# four puts it on the item mean Cercol scores. Published / 4:
#
#   Extraversion       13.69 / 2.36  ->  3.42 / 0.59
#   Agreeableness      14.87 / 2.01  ->  3.72 / 0.50
#   Conscientiousness  14.95 / 2.34  ->  3.74 / 0.59
#   Neuroticism        11.10 / 2.66  ->  2.78 / 0.67
#   Openness           13.71 / 2.06  ->  3.43 / 0.52
#
# These replace five numbers that were attributed to Johnson (2014) and
# Maples-Keller et al. (2019) and are in neither. Johnson (2014) reports
# alphas, correlations and factor loadings, not domain descriptives. The
# largest correction is Openness, whose mean was 0.27 too high and whose SD
# was 0.08 too wide, understating every respondent's Openness by about half
# a standard deviation. On the 18 real 1-5 results held when this was found,
# 55% were assigned a different role by the two priors.
#
# Sample: a US public sample, self-selected by seeking out an online
# personality test. The paper also notes Openness is the most loosely
# structured of the five in this instrument (ECV .43) and that its Openness
# measures intellectual and artistic curiosity rather than emotion or
# politics, which is worth remembering before reading much into Vision.
_NORM_FIVE_POINT = {
    "presence":   {"mean": 3.42, "sd": 0.59},
    "bond":       {"mean": 3.72, "sd": 0.50},
    "discipline": {"mean": 3.74, "sd": 0.59},
    "depth":      {"mean": 2.78, "sd": 0.67},
    "vision":     {"mean": 3.43, "sd": 0.52},
}

# The TIPI's own published norms, for New Moon, which is the TIPI.
#
# Gosling, S. D., Rentfrow, P. J., & Potter, J. (2014). Norms for the Ten
# Item Personality Inventory. Unpublished data, tables published at
# gosling.psy.utexas.edu. N = 278,000 (122,567 male, 155,433 female), six
# age bands per sex, pooled here with the between-band variance included.
#
# This replaces a rescale. The earlier version took the 1-5 IPIP statistics
# and stretched them, x7 = (x5 - 1) * 6/4 + 1, which is correct arithmetic
# and the wrong reference: a ten-item adjective-pair instrument does not
# produce the same distribution as a 120-item statement inventory, whatever
# scale it is written on. Against the TIPI's own norms the rescale put the
# Bond mean 0.74 of its own SD too high and every SD 25 to 45% too narrow, so
# a New Moon respondent of ordinary warmth was scored as notably cold and
# every z-score was inflated toward the edges of the role space. On the 17
# real New Moon results held when this was found, 41% were assigned a
# different role by the two priors.
#
# This is the failure ADR 0019 exists to prevent, one step further in: the
# instrument was named correctly, and then its prior was manufactured
# instead of looked up.
#
# Cercol keys Neuroticism where the TIPI publishes Emotional Stability. On a
# 1-7 scale the reflection is 8 - x, and a reflection leaves the SD alone.
_NORM_SEVEN_POINT = {
    "presence":   {"mean": 3.95, "sd": 1.58},   # Extraversion
    "bond":       {"mean": 4.71, "sd": 1.23},   # Agreeableness
    "discipline": {"mean": 4.65, "sd": 1.41},   # Conscientiousness
    "depth":      {"mean": 3.64, "sd": 1.48},   # 8 - Emotional Stability
    "vision":     {"mean": 5.51, "sd": 1.14},   # Openness
}

# The Witness instrument's own distribution. Its scores come from
# 3 + (votes/count) * 2 over 20 forced-choice rounds, and count increments for
# all five factors every round, so the output is centred on 3.0 by
# construction whatever the respondent is like.
#
# Derived for the three-pick, 13-round design (ADR 0019): mean 3.07, SD 1.03
# over 15000 simulated witnesses across a range of accuracy. The mean is not
# exactly 3.0 because the rank weights are not symmetric (+1, +0.5, -1), and
# the prior absorbs that rather than the scoring pretending otherwise.
#
# This number belongs to those weights and that length. Change either and it
# has to be re-derived, which is why they live next to each other.
#
# ponytail: simulated, not observed, because the instrument has no real
# responses yet. A prior in exactly the sense the published statistics are,
# replaced by the Tier 1/2 empirical norms at NORM_MIN_SAMPLE.
_NORM_WITNESS = {d: {"mean": 3.07, "sd": 1.03} for d in _NORM_FIVE_POINT}

_PRIORS = {
    "newMoon":      _NORM_SEVEN_POINT,
    "firstQuarter": _NORM_FIVE_POINT,
    "fullMoon":     _NORM_FIVE_POINT,
    "witness":      _NORM_WITNESS,
}

# The default when an instrument is not named. Kept as the 1-5 statistics
# because that is what two of the three self-report instruments use.
_NORM = _NORM_FIVE_POINT

DOMAINS = list(_NORM_FIVE_POINT.keys())


def prior_for(instrument: str | None) -> dict:
    """The Tier 3 prior for one instrument, falling back to the 1-5 scale."""
    return _PRIORS.get(instrument, _NORM_FIVE_POINT)


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

    With no explicit `norm`, the Tier 3 prior for `instrument` is used.
    Passing neither is the mistake this signature exists to make visible: a
    raw score means nothing without the instrument that produced it, and
    measuring one instrument's numbers against another's reference is what
    put 41% of Witness respondents on the same role.

    Only domains present in both scores and norm are included in the output.
    """
    effective = norm if norm is not None else prior_for(instrument)
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
