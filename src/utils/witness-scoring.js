/**
 * Witness Cèrcol scoring utilities.
 *
 * Each round shows 5 adjectives (one per OCEAN factor).
 * The witness picks one as BEST fit and one as WORST fit for the subject.
 *
 * Scoring per factor:
 *   BEST  pick → factor_votes += adjective.valence
 *   WORST pick → factor_votes -= adjective.valence
 *   Neither    → 0 contribution
 *
 * After N rounds, each factor has appeared N times (one adjective per round).
 * Raw vote range: [−N, +N]
 * Mapped to 1–5 scale: score = 3 + (sum_votes / N) * 2
 * This centres at 3 (neutral) and spans [1, 5].
 *
 * Round selection uses a shuffled-cycle algorithm:
 * pre-shuffles each factor's adjective list, then cycles through them
 * one per factor per round, ensuring no adjective repeats until
 * the full factor list is exhausted.
 */

import { WITNESS_ADJECTIVES, ADJECTIVES_BY_FACTOR, FACTOR_TO_DOMAIN, FACTORS } from '../data/witness-adjectives'
import { computeRole, ARC_PROBABILITY_THRESHOLD } from './role-scoring'

// ── Role → top-5 adjective IDs (pre-baked from centroid z-scores × valence) ──
// fit(adj, R) = z_R[factor] * sign(valence); top 5 per role sorted by fit desc
export const ROLE_TOP_ADJECTIVES = {
  R01: ['E+01', 'E+04', 'A+01', 'A+06', 'N-02'],
  R02: ['E+01', 'E+03', 'A-01', 'A-04', 'C+01'],
  R03: ['E-01', 'E-02', 'A+01', 'A+02', 'N-01'],
  R04: ['E-01', 'A-01', 'C+01', 'C+07', 'N-02'],
  R05: ['E+01', 'E+04', 'O+01', 'O+03', 'N-01'],
  R06: ['E+01', 'E+03', 'C+01', 'C+05', 'O-06'],
  R07: ['E-01', 'E-06', 'O+01', 'O+02', 'C-02'],
  R08: ['C+01', 'C+02', 'C+03', 'C+04', 'N-01'],
  R09: ['A+01', 'A+06', 'O+01', 'O+03', 'C+01'],
  R10: ['A+01', 'A+02', 'N-01', 'N-02', 'O-04'],
  R11: ['A-01', 'O+01', 'O+03', 'C-02', 'N+02'],
  R12: ['A-04', 'A-01', 'C+01', 'C+07', 'C+05'],
}

// ── Role relevance thresholds ─────────────────────────────────────────────────
const DOMINANT_RATIO = 1.5   // top/second ratio → single dominant role
const MIN_ABSOLUTE   = 0.10  // floor: never include roles below 10%
const RELATIVE_RATIO = 0.60  // relative floor: top * 0.6
const MAX_RELEVANT   = 5     // cap at 5 roles

/**
 * getRelevantRoles — extract relevant roles from a probability map.
 *
 * If top/second ≥ 1.5, returns only the top role (dominant).
 * Otherwise, includes all roles above max(10%, top × 60%), capped at 5.
 *
 * @param {Object} probabilities - {R01: 0.12, ...} from computeRole()
 * @param {Object} options - override thresholds
 * @returns {Array<{role, probability}>} sorted by probability desc
 */
export function getRelevantRoles(probabilities, options = {}) {
  const {
    dominantRatio = DOMINANT_RATIO,
    minAbsolute   = MIN_ABSOLUTE,
    relativeRatio = RELATIVE_RATIO,
    maxRoles      = MAX_RELEVANT,
  } = options
  const sorted = Object.entries(probabilities)
    .sort(([, a], [, b]) => b - a)
    .map(([role, probability]) => ({ role, probability }))
  if (sorted.length === 0) return []
  const top    = sorted[0]
  const second = sorted[1]
  if (second && top.probability / second.probability >= dominantRatio) return [top]
  const threshold = Math.max(minAbsolute, top.probability * relativeRatio)
  const relevant  = sorted.filter(r => r.probability >= threshold)
  if (relevant.length === 0) return [top]
  return relevant.slice(0, maxRoles)
}

/**
 * compareRoleViews — compare relevant roles seen by self vs witnesses.
 *
 * @param {Object} selfResult    - computeRole() return value
 * @param {Object} witnessResult - computeRole() return value, or null
 * @returns {Object|null} { selfRelevant, witnessRelevant, shared: Set, surprises }
 *   surprises: [{role, probability, type: 'witnessOnly'|'selfOnly'}]
 */
export function compareRoleViews(selfResult, witnessResult) {
  if (!witnessResult) return null
  const selfRelevant    = getRelevantRoles(selfResult.probabilities)
  const witnessRelevant = getRelevantRoles(witnessResult.probabilities)
  const selfSet         = new Set(selfRelevant.map(r => r.role))
  const witnessSet      = new Set(witnessRelevant.map(r => r.role))
  const shared          = new Set([...selfSet].filter(r => witnessSet.has(r)))
  const surprises       = [
    ...witnessRelevant.filter(r => !selfSet.has(r.role)).map(r => ({ ...r, type: 'witnessOnly' })),
    ...selfRelevant.filter(r => !witnessSet.has(r.role)).map(r => ({ ...r, type: 'selfOnly' })),
  ].sort((a, b) => b.probability - a.probability)
  return { selfRelevant, witnessRelevant, shared, surprises }
}

// ── Fisher-Yates shuffle ───────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * buildRounds — pre-generates all rounds for a Witness session.
 *
 * Each round contains adjectives of ONE polarity only:
 *   Positive round: E+, A+, C+, N−, O+  (high E/A/C/O, low N)
 *   Negative round: E−, A−, C−, N+, O−  (low E/A/C/O, high N)
 *
 * This prevents witnesses from always avoiding the negative adjective
 * when it is mixed with positive ones — a key forced-choice design constraint.
 *
 * Fixed 20-round polarity sequence (14 positive, 6 negative):
 *   P P N P P P N P P N P P P N P P N P P P
 *
 * Adjective IDs encode polarity: second character is '+' or '−'.
 * N factor is inverted: N+ (anxious) = negative pole, N− (calm) = positive pole.
 *
 * @param {number} totalRounds - number of rounds (default 20)
 * @returns {Array} Array of { adjectives: [adj×5], best: null, worst: null }
 */

// Which id sign goes into positive-pole rounds for each factor
const POSITIVE_POLE_SIGN = { E: '+', A: '+', C: '+', N: '-', O: '+' }

// Fixed polarity pattern: 14 positive (P), 6 negative (N) across 20 rounds
const ROUND_POLARITY = ['P','P','N','P','P','P','N','P','P','N','P','P','P','N','P','P','N','P','P','P']

/**
 * Returns adjectives for a given factor filtered to the requested pole.
 * @param {string} factor - 'E'|'A'|'C'|'N'|'O'
 * @param {string} polarity - 'pos' | 'neg'
 */
function getPoleAdjectives(factor, polarity) {
  const posSign = POSITIVE_POLE_SIGN[factor]
  const targetSign = polarity === 'pos' ? posSign : (posSign === '+' ? '-' : '+')
  return ADJECTIVES_BY_FACTOR[factor].filter(a => a.id.charAt(1) === targetSign)
}

export function buildRounds(totalRounds = 20) {
  // Build independently shuffled pools for each factor × polarity
  const pools = { pos: {}, neg: {} }
  const ptrs  = { pos: {}, neg: {} }
  for (const f of FACTORS) {
    for (const p of ['pos', 'neg']) {
      pools[p][f] = shuffle(getPoleAdjectives(f, p))
      ptrs[p][f]  = 0
    }
  }

  const rounds = []
  for (let i = 0; i < totalRounds; i++) {
    const polarity = ROUND_POLARITY[i] === 'P' ? 'pos' : 'neg'
    const adjectives = FACTORS.map((f) => {
      // Reshuffle when the factor pool for this polarity is exhausted
      if (ptrs[polarity][f] >= pools[polarity][f].length) {
        pools[polarity][f] = shuffle(getPoleAdjectives(f, polarity))
        ptrs[polarity][f]  = 0
      }
      return pools[polarity][f][ptrs[polarity][f]++]
    })
    rounds.push({ adjectives, best: null, worst: null })
  }
  return rounds
}

/**
 * computeWitnessScores — convert completed rounds into domain scores.
 *
 * @param {Array} rounds - completed rounds with { adjectives, best: adjId, worst: adjId }
 * @returns {Object} { presence, bond, discipline, depth, vision } on 1–5 scale
 */
export function computeWitnessScores(rounds) {
  const votes = { E: 0, A: 0, C: 0, N: 0, O: 0 }
  const count = { E: 0, A: 0, C: 0, N: 0, O: 0 }

  for (const round of rounds) {
    if (!round.best && !round.worst) continue

    for (const adj of round.adjectives) {
      count[adj.factor] += 1
      if (round.best === adj.id) {
        votes[adj.factor] += adj.valence
      } else if (round.worst === adj.id) {
        votes[adj.factor] -= adj.valence
      }
    }
  }

  const scores = {}
  for (const f of FACTORS) {
    const n = count[f] || 1
    // Clamp to [1, 5]
    scores[FACTOR_TO_DOMAIN[f]] = Math.max(1, Math.min(5, 3 + (votes[f] / n) * 2))
  }
  return scores
}

/**
 * computeInterimRole — compute running role probabilities from partially
 * completed rounds. Used for live display during the instrument.
 *
 * @param {Array} rounds - rounds completed so far (best/worst may be non-null)
 * @returns {Object|null} computeRole() result or null if no rounds answered
 */
export function computeInterimRole(rounds) {
  const answered = rounds.filter(r => r.best !== null && r.worst !== null)
  if (answered.length === 0) return null
  const scores = computeWitnessScores(answered)
  return computeRole(scores)
}

/**
 * computeCombinedRole — combine self and witness role results.
 *
 * Applies a 2/3 self + 1/3 witness weighting to probabilities across all 12 roles.
 * If witnessResult is null, returns selfResult unchanged.
 *
 * @param {Object} selfResult    — return value of computeRole()
 * @param {Object} witnessResult — return value of computeRole(), or null
 * @returns same shape as computeRole(): { role, arc, probabilities }
 */
export function computeCombinedRole(selfResult, witnessResult) {
  if (!witnessResult) return selfResult

  const combined = {}
  for (const r of Object.keys(selfResult.probabilities)) {
    const selfProb    = selfResult.probabilities[r] ?? 0
    const witnessProb = witnessResult.probabilities[r] ?? 0
    combined[r] = (selfProb * 2 + witnessProb) / 3
  }

  // Primary: highest combined probability
  const entries = Object.entries(combined).sort((a, b) => b[1] - a[1])
  const role = entries[0][0]

  // Arc: combined probability > 15%, excluding primary
  const arc = entries.filter(([r, p]) => r !== role && p > ARC_PROBABILITY_THRESHOLD).map(([r]) => r)

  return { role, arc, probabilities: combined }
}

/**
 * averageWitnessScores — compute mean domain scores across completed witnesses.
 *
 * @param {Array} scoreSets - array of {presence, bond, ...} objects
 * @returns {Object} averaged domain scores
 */
export function averageWitnessScores(scoreSets) {
  if (!scoreSets.length) return null
  const sums = { presence: 0, bond: 0, discipline: 0, depth: 0, vision: 0 }
  for (const s of scoreSets) {
    for (const key of Object.keys(sums)) {
      sums[key] += s[key] ?? 3
    }
  }
  const result = {}
  for (const key of Object.keys(sums)) {
    result[key] = Math.round((sums[key] / scoreSets.length) * 100) / 100
  }
  return result
}
