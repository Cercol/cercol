/**
 * Cèrcol role scoring — v2 (12-role animal system)
 * Scientific foundation: SCIENCE.md
 * OCEAN mapping: E=presence, A=bond, O=vision, C=discipline, N=depth
 *
 * Normalisation: per-domain published priors from Johnson (2014) and
 * Maples-Keller et al. (2019); replaced by sample stats at N≥200.
 *
 * Replace CENTROIDS with empirical k-means values at N≥300.
 */

// ── Theoretical centroids v2 (z-scores per role) ──────────────────────────
// Order: [E, A, O, C, N] = [presence, bond, vision, discipline, depth]
// Source: AB5C (Hofstee et al. 1992) + OCEAN team composition literature (Bell 2007)
const CENTROIDS = {
  R01: [ +1.0, +1.0,  0.0,  0.0, -0.5 ], // Dolphin  P+ B+
  R02: [ +1.0, -1.0,  0.0, +0.5, +0.3 ], // Wolf     P+ B-
  R03: [ -1.0, +1.0,  0.0,  0.0, -0.8 ], // Elephant P- B+
  R04: [ -1.0, -1.0,  0.0, +0.8, -0.5 ], // Owl      P- B-
  R05: [ +1.0,  0.0, +1.0, -0.3, -0.5 ], // Eagle    P+ V+
  R06: [ +1.0,  0.0, -1.0, +0.8, -0.3 ], // Falcon   P+ V-
  R07: [ -1.0,  0.0, +1.0, -0.8,  0.0 ], // Octopus  P- V+
  R08: [ -1.0,  0.0, -1.0, +1.0, -0.8 ], // Tortoise P- V-
  R09: [  0.0, +1.0, +1.0, +0.8, -0.5 ], // Bee      B+ V+
  R10: [  0.0, +1.0, -1.0, +0.5, -0.8 ], // Bear     B+ V-
  R11: [  0.0, -1.0, +1.0, -0.8, +0.3 ], // Fox      B- V+
  R12: [  0.0, -1.0, -1.0, +0.8, -0.3 ], // Badger   B- V-
}

// ── OCEAN factor keys and domain mapping ──────────────────────────────────
// Order matches CENTROIDS columns: E, A, O, C, N
const FACTOR_KEYS = ['E', 'A', 'O', 'C', 'N']
export const DOMAIN_MAP  = { E: 'presence', A: 'bond', O: 'vision', C: 'discipline', N: 'depth' }

// ── Published normative statistics for IPIP-NEO (1-5 scale) ───────────────
// Source: Johnson (2014) doi:10.1016/j.jrp.2014.05.003;
//         Maples-Keller et al. (2019) doi:10.1080/00223891.2017.1381968
// Approximate cross-study means for general adult samples.
// These are the authoritative normative statistics for the whole codebase.
// Import NORM_MEAN and NORM_SD from this file — never redefine them elsewhere.
export const NORM_MEAN = {
  E: 3.3,  // Presence (Extraversion)
  A: 3.9,  // Bond (Agreeableness)
  O: 3.7,  // Vision (Openness)
  C: 3.7,  // Discipline (Conscientiousness)
  N: 2.8,  // Depth (Neuroticism)
}
export const NORM_SD = {
  E: 0.72,
  A: 0.58,
  O: 0.60,
  C: 0.62,
  N: 0.72,
}

// ── Priors, per instrument ────────────────────────────────────────────────
// A prior belongs to an instrument, not to the platform. Feeding one
// instrument's raw scores to another's reference does not add noise, it
// pushes everyone toward the same corner of the role space, and it has now
// happened twice:
//
//   New Moon answers on 1-7 and was measured against these 1-5 statistics,
//   so a mild "slightly agree" read as +2.4 SD.
//
//   The Witness instrument is forced-choice. Its own output is centred on
//   3.0 with an SD near 0.50, because the score is 3 + (votes/count) * 2 and
//   every round increments count for all five factors while moving only two.
//   Measured against self-report means of 3.3 to 3.9 it put four roles
//   permanently out of reach and sent 41% of respondents to Badger.

// The TIPI's own published norms, for New Moon, which is the TIPI.
//
// Gosling, S. D., Rentfrow, P. J., & Potter, J. (2014). Norms for the Ten
// Item Personality Inventory. Unpublished data, tables published at
// gosling.psy.utexas.edu. N = 278,000 across six age bands per sex, pooled
// with the between-band variance included.
//
// This replaces a rescale of the 1-5 IPIP statistics. The arithmetic was
// right and the reference was wrong: a ten-item adjective-pair instrument
// does not produce a 120-item inventory's distribution whatever scale it is
// written on. The rescale put Bond 0.74 of its own SD too high and every SD
// 25 to 45% too narrow, so ordinary warmth scored as cold and every z-score
// was pushed toward the edges of the role space. 41% of the real New Moon
// results held at the time changed role between the two priors.
//
// Cercol keys Neuroticism where the TIPI publishes Emotional Stability; on
// 1-7 the reflection is 8 - x, which leaves the SD alone.
const NORM_SEVEN_POINT = {
  mean: { E: 3.95, A: 4.71, O: 5.51, C: 4.65, N: 3.64 },
  sd:   { E: 1.58, A: 1.23, O: 1.14, C: 1.41, N: 1.48 },
}

// The Witness instrument's own distribution for the three-pick, 13-round
// design: mean 3.07, SD 1.03 over 15000 simulated witnesses across a range of
// accuracy. The mean is off 3.0 because the rank weights are asymmetric
// (+1, +0.5, -1) and the prior absorbs that. Simulated rather
// than observed, because the instrument has no real responses yet; a prior in
// exactly the sense the published statistics are, replaced by empirical norms
// at N >= 200.
const NORM_WITNESS = {
  mean: Object.fromEntries(Object.keys(NORM_MEAN).map(k => [k, 3.07])),
  sd:   Object.fromEntries(Object.keys(NORM_SD).map(k => [k, 1.03])),
}

const PRIORS = {
  newMoon:      NORM_SEVEN_POINT,
  firstQuarter: { mean: NORM_MEAN, sd: NORM_SD },
  fullMoon:     { mean: NORM_MEAN, sd: NORM_SD },
  witness:      NORM_WITNESS,
}

/**
 * priorFor — the Tier 3 prior for one instrument.
 * Falls back to the 1-5 statistics, which is what two of the three
 * self-report instruments use.
 * @param {string|null} instrument
 * @returns {{mean: Record<string, number>, sd: Record<string, number>}}
 */
export function priorFor(instrument = null) {
  return PRIORS[instrument] ?? { mean: NORM_MEAN, sd: NORM_SD }
}

// ── Arc role probability threshold ────────────────────────────────────────
// A role is included in the arc if its probability exceeds this value.
export const ARC_PROBABILITY_THRESHOLD = 0.15

// ── Softmax over negated distances ────────────────────────────────────────
function softmax(values) {
  const max  = Math.max(...values)
  const exps = values.map(v => Math.exp(v - max))
  const sum  = exps.reduce((a, b) => a + b, 0)
  return exps.map(e => e / sum)
}

// ── Euclidean distance in 5D space ────────────────────────────────────────
function euclidean(zArr, centroid) {
  return Math.sqrt(
    zArr.reduce((sum, z, i) => sum + (z - centroid[i]) ** 2, 0)
  )
}

/**
 * computeRole — main export
 *
 * @param {Object} domainScores - {presence, bond, vision, discipline, depth}
 *   on whatever scale `instrument` produces.
 * @param {string|null} [instrument] - 'newMoon' | 'firstQuarter' | 'fullMoon'
 *   | 'witness'. Always pass it: the raw numbers do not say which instrument
 *   they came from, and the wrong prior does not blur a result, it relocates
 *   it. Omitting it falls back to the 1-5 self-report statistics.
 * @returns {Object} {
 *   role: 'R01'|'R02'|…|'R12',
 *   arc: string[],          // other roles with probability > 15%
 *   probabilities: Object,  // {R01…R12: 0–1}
 * }
 */
export function computeRole(domainScores, instrument = null) {
  // Step 1 — z-score against the prior built for THIS instrument
  const { mean, sd } = priorFor(instrument)
  const z = FACTOR_KEYS.map(f => (domainScores[DOMAIN_MAP[f]] - mean[f]) / sd[f])

  // Step 2 — Euclidean distance to all 12 centroids in 5D space
  const roles = Object.keys(CENTROIDS)
  const dists = roles.map(r => euclidean(z, CENTROIDS[r]))

  // Step 3 — Softmax over negative distances → probability map
  const probs   = softmax(dists.map(d => -d))
  const probMap = Object.fromEntries(roles.map((r, i) => [r, probs[i]]))

  // Step 4 — Primary role: minimum distance; arc: probability > 15% (excluding primary)
  const role = roles.reduce((best, r) =>
    euclidean(z, CENTROIDS[r]) < euclidean(z, CENTROIDS[best]) ? r : best
  )
  const arc = roles.filter(r => probMap[r] > ARC_PROBABILITY_THRESHOLD && r !== role)

  return { role, arc, probabilities: probMap }
}
