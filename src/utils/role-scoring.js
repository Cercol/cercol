/**
 * Cèrcol role scoring — Phase 5.3 (theoretical centroids, beta)
 * Pipeline: CLAUDE.md "Phase 5 — Scientific foundation"
 * OCEAN mapping: E=presence, A=bond, C=discipline, N=depth, O=vision
 *
 * Normalisation: per-domain published priors from Johnson (2014) and
 * Maples-Keller et al. (2019); replaced by sample stats at N≥200.
 *
 * Replace CENTROIDS with empirical values at N≥300.
 */

// ── Theoretical centroids (z-scores per role) ──────────────────────────────
// Order: [E, A, C, N, O] = [presence, bond, discipline, depth, vision]
const CENTROIDS = {
  R0: [  0.0,  0.0,  0.0,  0.0,  0.0 ],
  R1: [ +1.2,  0.0, +1.0,  0.0, +0.5 ],
  R2: [ +1.2, +0.8,  0.0, -0.8,  0.0 ],
  R3: [ +0.8, -1.0,  0.0, +0.5,  0.0 ],
  R4: [  0.0, +1.0, +1.0, -0.5,  0.0 ],
  R5: [ -0.8, +1.2, -0.5,  0.0,  0.0 ],
  R6: [  0.0, -0.5, +1.0, +0.8,  0.0 ],
  R7: [  0.0, +0.5, +0.5,  0.0, +1.2 ],
  R8: [ +0.5,  0.0,  0.0, -0.5, +1.2 ],
}

// ── OCEAN factor keys ──────────────────────────────────────────────────────
const FACTOR_KEYS = ['E', 'A', 'C', 'N', 'O']
const DOMAIN_MAP  = { E: 'presence', A: 'bond', C: 'discipline', N: 'depth', O: 'vision' }

// ── Published normative statistics for IPIP-NEO (1-5 scale) ───────────────
// Source: Johnson (2014) doi:10.1016/j.jrp.2014.05.003;
//         Maples-Keller et al. (2019) doi:10.1080/00223891.2018.1467425
// Approximate cross-study means for general adult samples.
// Order matches FACTOR_KEYS: [E, A, C, N, O]
const NORM_MEAN = {
  E: 3.3,  // Presence (Extraversion)
  A: 3.9,  // Bond (Agreeableness)
  C: 3.7,  // Discipline (Conscientiousness)
  N: 2.8,  // Depth (Neuroticism)
  O: 3.7,  // Vision (Openness)
}
const NORM_SD = {
  E: 0.72,
  A: 0.58,
  C: 0.62,
  N: 0.72,
  O: 0.60,
}

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

// ── buildResult ───────────────────────────────────────────────────────────
function buildResult(role, z) {
  const roles   = Object.keys(CENTROIDS)
  const dists   = roles.map(r => euclidean(z, CENTROIDS[r]))
  const probs   = softmax(dists.map(d => -d))
  const probMap = Object.fromEntries(roles.map((r, i) => [r, probs[i]]))
  const arc     = roles.filter(r => probMap[r] > 0.15 && r !== role)

  const [zE, zA, zC, zN, zO] = z
  const alpha = (zA + zE - zN) / 3
  const beta  = (zC + zO)  / 2

  return { role, arc, probabilities: probMap, alpha, beta }
}

/**
 * computeRole — main export
 *
 * @param {Object} domainScores - {presence, bond, discipline, depth, vision} on 1–5 scale
 * @returns {Object} {
 *   role: 'R0'|'R1'|…|'R8',
 *   arc: string[],           // other roles with prob > 15%
 *   probabilities: Object,   // {R0…R8: 0–1}
 *   alpha: number,           // Digman α axis (display only)
 *   beta: number,            // Digman β axis (display only)
 * }
 */
export function computeRole(domainScores) {
  // Step 1 — Normalise raw 1-5 scores to z-scores using per-domain published priors
  const z = FACTOR_KEYS.map(f => (domainScores[DOMAIN_MAP[f]] - NORM_MEAN[f]) / NORM_SD[f])

  // Step 2 — Centre rule: no dominant pole → R0
  if (Math.max(...z.map(Math.abs)) < 0.5) {
    return buildResult('R0', z)
  }

  // Step 3 — Assign role with minimum Euclidean distance to centroids
  const role = Object.keys(CENTROIDS).reduce((best, r) =>
    euclidean(z, CENTROIDS[r]) < euclidean(z, CENTROIDS[best]) ? r : best
  )

  // Step 4 — buildResult: softmax probabilities, arc, Digman α/β
  return buildResult(role, z)
}
