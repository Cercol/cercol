/**
 * team-narrative.js — deterministic narrative key selection for the Last Quarter team report.
 *
 * Takes group mean z-scores and returns the most relevant i18n key suffixes
 * for three narrative sections: move / watchOut / help.
 *
 * Keys map to `lastQuarter.narrative.{section}.{key}` in the locale files.
 *
 * Decision logic:
 *  - Primary (move): the dimension with the largest absolute z-mean among P, B, V.
 *    If all are within ±0.4 → 'balanced'.
 *  - Risk (watchOut + help): if low C (<−0.5) or high N (>+0.5), those structural
 *    risks take precedence because they affect the whole team's functioning.
 *    Otherwise the risk key mirrors the primary.
 *
 * @param {{ p: number, b: number, v: number, c: number, n: number }} means
 *   Group-average z-scores for presence (p), bond (b), vision (v),
 *   discipline (c), and depth (n).
 * @returns {{ moveKey: string, watchOutKey: string, helpKey: string }}
 */
export function generateNarrative({ p, b, v, c, n }) {
  const PRIMARY_THRESHOLD = 0.4

  // Find the dominant dimension among P, B, V
  const pvb = [
    { dim: 'p', z: p },
    { dim: 'b', z: b },
    { dim: 'v', z: v },
  ].reduce((max, curr) => Math.abs(curr.z) > Math.abs(max.z) ? curr : max)

  let moveKey = 'balanced'
  if (Math.abs(pvb.z) >= PRIMARY_THRESHOLD) {
    moveKey = pvb.z > 0 ? `high_${pvb.dim}` : `low_${pvb.dim}`
  }

  // Risk is structural if discipline is notably low or emotional depth notably high
  let riskKey = moveKey
  if (c < -0.5) riskKey = 'low_c'
  else if (n > 0.5) riskKey = 'high_n'

  return {
    moveKey,
    watchOutKey: riskKey,
    helpKey: riskKey,
  }
}

/**
 * computeGroupMeans — compute mean z-scores from an array of z-score objects.
 * Only includes members who have completed Full Moon (zscores != null).
 *
 * @param {Array<{zscores: {presence,bond,vision,discipline,depth}|null}>} members
 * @returns {{ p: number, b: number, v: number, c: number, n: number } | null}
 *   Returns null if no members have completed Full Moon.
 */
export function computeGroupMeans(members) {
  const completed = members.filter(m => m.zscores)
  if (completed.length === 0) return null

  const sum = completed.reduce(
    (acc, m) => ({
      p: acc.p + m.zscores.presence,
      b: acc.b + m.zscores.bond,
      v: acc.v + m.zscores.vision,
      c: acc.c + m.zscores.discipline,
      n: acc.n + m.zscores.depth,
    }),
    { p: 0, b: 0, v: 0, c: 0, n: 0 }
  )

  const count = completed.length
  return {
    p: sum.p / count,
    b: sum.b / count,
    v: sum.v / count,
    c: sum.c / count,
    n: sum.n / count,
  }
}

/**
 * balanceFlagForPBV — classify the balance state of a P/B/V z-mean.
 * @param {number} z
 * @returns {'balanced'|'tiltedHigh'|'tiltedLow'|'stronglyHigh'|'stronglyLow'}
 */
export function balanceFlagForPBV(z) {
  if (z >  1.0) return 'stronglyHigh'
  if (z >  0.5) return 'tiltedHigh'
  if (z < -1.0) return 'stronglyLow'
  if (z < -0.5) return 'tiltedLow'
  return 'balanced'
}

/**
 * balanceFlagForC — discipline: high is generally good, low is a structural risk.
 * @param {number} z
 * @returns {'highGood'|'balanced'|'lowCaution'}
 */
export function balanceFlagForC(z) {
  if (z >  0.5) return 'highGood'
  if (z < -0.5) return 'lowCaution'
  return 'balanced'
}

/**
 * balanceFlagForN — depth/neuroticism: low is stable, high is a risk signal.
 * @param {number} z
 * @returns {'lowGood'|'balanced'|'highCaution'}
 */
export function balanceFlagForN(z) {
  if (z < -0.5) return 'lowGood'
  if (z >  0.5) return 'highCaution'
  return 'balanced'
}

// Published normative statistics mirrored from role-scoring.js (Johnson 2014)
// Used to convert z-scores back to approximate raw 1-5 scores for the radar chart.
const NORM_MEAN = { presence: 3.3, bond: 3.9, vision: 3.7, discipline: 3.7, depth: 2.8 }
const NORM_SD   = { presence: 0.72, bond: 0.58, vision: 0.60, discipline: 0.62, depth: 0.72 }

// Theoretical centroids from SCIENCE.md (order: E=presence, A=bond, O=vision, C=discipline, N=depth)
const CENTROIDS = {
  R01: { e: +1.0, a: +1.0, o:  0.0, c:  0.0, n: -0.5 }, // Dolphin
  R02: { e: +1.0, a: -1.0, o:  0.0, c: +0.5, n: +0.3 }, // Wolf
  R03: { e: -1.0, a: +1.0, o:  0.0, c:  0.0, n: -0.8 }, // Elephant
  R04: { e: -1.0, a: -1.0, o:  0.0, c: +0.8, n: -0.5 }, // Owl
  R05: { e: +1.0, a:  0.0, o: +1.0, c: -0.3, n: -0.5 }, // Eagle
  R06: { e: +1.0, a:  0.0, o: -1.0, c: +0.8, n: -0.3 }, // Falcon
  R07: { e: -1.0, a:  0.0, o: +1.0, c: -0.8, n:  0.0 }, // Octopus
  R08: { e: -1.0, a:  0.0, o: -1.0, c: +1.0, n: -0.8 }, // Tortoise
  R09: { e:  0.0, a: +1.0, o: +1.0, c: +0.8, n: -0.5 }, // Bee
  R10: { e:  0.0, a: +1.0, o: -1.0, c: +0.5, n: -0.8 }, // Bear
  R11: { e:  0.0, a: -1.0, o: +1.0, c: -0.8, n: +0.3 }, // Fox
  R12: { e:  0.0, a: -1.0, o: -1.0, c: +0.8, n: -0.3 }, // Badger
}

// Maps dimension key → groupMeans shorthand key
const DIM_TO_MEANS_KEY = { presence: 'p', bond: 'b', vision: 'v', discipline: 'c', depth: 'n' }

// Maps dimension key → centroid field
const DIM_TO_CENTROID = { presence: 'e', bond: 'a', vision: 'o', discipline: 'c', depth: 'n' }

// Best single role to suggest when no team member can compensate for a P/B/V tilt.
// Chosen as the most functional counterbalance for each direction.
const SUGGEST_ROLE_FOR_TILT = {
  presence_high: 'R03', // Elephant — low-E listener, brings Bond
  presence_low:  'R01', // Dolphin  — high-E warm energy
  bond_high:     'R02', // Wolf     — breaks over-cohesion / groupthink
  bond_low:      'R03', // Elephant — brings warmth without adding high Presence
  vision_high:   'R08', // Tortoise — grounds ideas, delivers
  vision_low:    'R05', // Eagle    — strategic horizon-scanning
}

// Top roles for structural Discipline fix (highest C centroid)
const TOP_HIGH_C_ROLES = ['R08', 'R04', 'R09'] // Tortoise(+1.0), Owl(+0.8), Bee(+0.8)

// Top roles for structural Depth stabilisation (lowest N centroid)
const TOP_LOW_N_ROLES = ['R08', 'R03', 'R10'] // Tortoise(-0.8), Elephant(-0.8), Bear(-0.8)

/**
 * computeDimensionAnalysis — per-dimension balance analysis for the balance section.
 *
 * @param {Array} members — full member list (completed + pending)
 * @param {{ p, b, v, c, n }} groupMeans — group mean z-scores
 * @returns {Array<{
 *   dim: string,
 *   meanZ: number,
 *   flag: string,
 *   topMember: object|null,
 *   compensatingMember: object|null,
 *   suggestedRole: string|null,
 *   suggestedRoles: string[]|null,
 * }>}
 */
export function computeDimensionAnalysis(members, groupMeans) {
  const completed = members.filter(m => m.zscores && m.completed)
  if (completed.length === 0) return []

  return ['presence', 'bond', 'vision', 'discipline', 'depth'].map(dim => {
    const meanZ = groupMeans[DIM_TO_MEANS_KEY[dim]]

    // Member with highest z-score in this dimension (top contributor)
    const topMember = completed.reduce((best, m) => {
      const z = m.zscores[dim] ?? -Infinity
      return z > (best?.zscores[dim] ?? -Infinity) ? m : best
    }, null)

    // Balance flag
    let flag
    if (dim === 'discipline') flag = balanceFlagForC(meanZ)
    else if (dim === 'depth')  flag = balanceFlagForN(meanZ)
    else                       flag = balanceFlagForPBV(meanZ)

    let compensatingMember = null
    let suggestedRole      = null
    let suggestedRoles     = null

    if (dim === 'presence' || dim === 'bond' || dim === 'vision') {
      if (Math.abs(meanZ) >= 0.5) {
        // Find the member most extreme in the compensating direction
        const best = completed.reduce((acc, m) => {
          const z = m.zscores[dim] ?? 0
          if (!acc) return m
          return meanZ > 0
            ? (z < (acc.zscores[dim] ?? Infinity) ? m : acc)
            : (z > (acc.zscores[dim] ?? -Infinity) ? m : acc)
        }, null)

        const bestZ = best?.zscores[dim] ?? 0
        const compensates = meanZ > 0 ? bestZ < 0 : bestZ > 0

        if (compensates) {
          compensatingMember = best
        } else {
          suggestedRole = SUGGEST_ROLE_FOR_TILT[`${dim}_${meanZ > 0 ? 'high' : 'low'}`]
        }
      }
    } else if (dim === 'discipline' && meanZ < -0.5) {
      suggestedRoles = TOP_HIGH_C_ROLES
    } else if (dim === 'depth' && meanZ > 0.5) {
      suggestedRoles = TOP_LOW_N_ROLES
    }

    return { dim, meanZ, flag, topMember, compensatingMember, suggestedRole, suggestedRoles }
  })
}

/**
 * zscoresToRaw — convert z-scores back to approximate 1-5 scores for display.
 * @param {{presence,bond,vision,discipline,depth}} zscores
 * @returns {{presence,bond,vision,discipline,depth}}
 */
export function zscoresToRaw(zscores) {
  return Object.fromEntries(
    Object.entries(zscores).map(([k, z]) => [
      k,
      Math.max(1, Math.min(5, z * NORM_SD[k] + NORM_MEAN[k])),
    ])
  )
}
