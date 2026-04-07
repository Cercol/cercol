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
import { computeRole } from './role-scoring'

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
 * detectDivergence — compare self-report z-scores with witness z-scores.
 * Returns domains where the absolute difference > threshold.
 *
 * @param {Object} selfDomains - {presence, bond, discipline, depth, vision} on 1–5
 * @param {Object} witnessDomains - averaged witness scores, same shape
 * @param {number} threshold - z-score difference threshold (default 0.8)
 * @returns {Array} of { domain, selfScore, witnessScore, diff } sorted by |diff| desc
 */

// Published normative statistics (same as role-scoring.js)
const NORM_MEAN = { E: 3.3, A: 3.9, C: 3.7, N: 2.8, O: 3.7 }
const NORM_SD   = { E: 0.72, A: 0.58, C: 0.62, N: 0.72, O: 0.60 }
const DOMAIN_TO_FACTOR = { presence: 'E', bond: 'A', discipline: 'C', depth: 'N', vision: 'O' }

export function detectDivergence(selfDomains, witnessDomains, threshold = 0.8) {
  const results = []
  for (const [domain, factor] of Object.entries(DOMAIN_TO_FACTOR)) {
    const selfScore    = selfDomains[domain] ?? 3
    const witnessScore = witnessDomains[domain] ?? 3
    const mean         = NORM_MEAN[factor]
    const sd           = NORM_SD[factor]
    const selfZ        = (selfScore - mean) / sd
    const witnessZ     = (witnessScore - mean) / sd
    const diff         = Math.abs(selfZ - witnessZ)
    if (diff > threshold) {
      results.push({ domain, selfScore, witnessScore, selfZ, witnessZ, diff })
    }
  }
  return results.sort((a, b) => b.diff - a.diff)
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
