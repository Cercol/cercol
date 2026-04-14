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
//         Maples-Keller et al. (2019) doi:10.1080/00223891.2018.1467425
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
 * @param {Object} domainScores - {presence, bond, vision, discipline, depth} on 1–5 scale
 * @returns {Object} {
 *   role: 'R01'|'R02'|…|'R12',
 *   arc: string[],          // other roles with probability > 15%
 *   probabilities: Object,  // {R01…R12: 0–1}
 * }
 */
export function computeRole(domainScores) {
  // Step 1 — Normalise raw 1-5 scores to z-scores using per-domain published priors
  const z = FACTOR_KEYS.map(f => (domainScores[DOMAIN_MAP[f]] - NORM_MEAN[f]) / NORM_SD[f])

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
