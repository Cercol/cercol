/**
 * Cèrcol role scoring — Phase 5.1 (theoretical centroids, beta)
 * Pipeline: CLAUDE.md "Phase 5 — Scientific foundation"
 * OCEAN mapping: E=presence, A=bond, C=discipline, N=depth, O=vision
 * Prior normalisation: mean=3, SD=0.6 (1-5 scale)
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

// OCEAN factor keys — index maps to CENTROIDS arrays
const FACTOR_KEYS = ['E', 'A', 'C', 'N', 'O']
const DOMAIN_MAP  = { E: 'presence', A: 'bond', C: 'discipline', N: 'depth', O: 'vision' }

// ── Sector → role lookup ───────────────────────────────────────────────────
// Boundary sectors return 2 candidates (resolved by Euclidean distance).
// Unrecognised sectors also resolved by Euclidean over all 9 roles.
const SECTOR_MAP = {
  // R1 — Bolt
  'E+/C+': ['R1'], 'C+/E+': ['R1'],
  // R2 — Beacon
  'E+/A+': ['R2'], 'A+/E+': ['R2'],
  // R3 — Thorn
  'A-/E+': ['R3'], 'E+/N+': ['R3'], 'N-/A-': ['R3'],
  // R4 — Anchor
  'A+/C+': ['R4'], 'C+/A+': ['R4'], 'A+/N-': ['R4'], 'N-/C+': ['R4'],
  // R5 — Heron
  'A+/E-': ['R5'], 'E-/A+': ['R5'], 'A+/C-': ['R5'], 'C-/A+': ['R5'],
  // R6 — Anvil
  'C+/N+': ['R6'], 'N+/C+': ['R6'],
  // R7 — Loom
  'O+/C+': ['R7'], 'C+/O+': ['R7'],
  // R8 — Comet
  'O+/N-': ['R8'], 'O+/A-': ['R8'], 'E-/O+': ['R8'],
  // Boundary sectors — 2 candidates, resolved by Euclidean
  'E+/O+': ['R1', 'R8'], 'O+/E+': ['R1', 'R8'],
  'A+/O+': ['R5', 'R7'], 'O+/A+': ['R5', 'R7'],
  'N-/E+': ['R1', 'R2'], 'E+/N-': ['R1', 'R2'],
  'E+/A-': ['R3', 'R6'], 'A-/C+': ['R3', 'R6'],
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
function buildResult(role, z, sector, method) {
  const roles   = Object.keys(CENTROIDS)
  const dists   = roles.map(r => euclidean(z, CENTROIDS[r]))
  const probs   = softmax(dists.map(d => -d))
  const probMap = Object.fromEntries(roles.map((r, i) => [r, probs[i]]))
  const arc     = roles.filter(r => probMap[r] > 0.15 && r !== role)

  const [zE, zA, zC, zN, zO] = z
  const alpha = (zA + zE - zN) / 3
  const beta  = (zC + zO)  / 2

  return { role, arc, probabilities: probMap, alpha, beta, sector, _method: method }
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
 *   sector: string,          // e.g. 'E+/C+' (traceability)
 * }
 */
export function computeRole(domainScores) {
  const MEAN = 3
  const SD   = 0.6

  // Step 1 — Normalise raw scores to z-scores [E, A, C, N, O]
  const z = FACTOR_KEYS.map(f => (domainScores[DOMAIN_MAP[f]] - MEAN) / SD)

  // Step 2 — Identify primary and secondary factor poles (AB5C sector)
  const sorted = z.map((v, i) => [i, Math.abs(v)]).sort((a, b) => b[1] - a[1])
  const [priIdx, priAbs] = sorted[0]
  const [secIdx, secAbs] = sorted[1]

  const sector = `${FACTOR_KEYS[priIdx]}${z[priIdx] >= 0 ? '+' : '-'}/${FACTOR_KEYS[secIdx]}${z[secIdx] >= 0 ? '+' : '-'}`

  // Centre rule: primary pole too weak → R0 (no dominant role)
  if (priAbs < 0.5) {
    return buildResult('R0', z, sector, 'centre')
  }

  // Pure pole: secondary too weak → fall through to Euclidean over all roles
  // Otherwise look up candidates in SECTOR_MAP (fall back to all 9 if unknown)
  const candidates = secAbs < 0.3
    ? Object.keys(CENTROIDS)
    : (SECTOR_MAP[sector] ?? Object.keys(CENTROIDS))

  // Step 4 — Resolve by minimum Euclidean distance within candidate set
  const distances = Object.fromEntries(
    Object.keys(CENTROIDS).map(r => [r, euclidean(z, CENTROIDS[r])])
  )
  const role = candidates.reduce((best, r) =>
    distances[r] < distances[best] ? r : best
  )

  return buildResult(
    role, z, sector,
    candidates.length === Object.keys(CENTROIDS).length ? 'euclidean-all' : 'sector'
  )
}
