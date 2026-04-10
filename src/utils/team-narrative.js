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
