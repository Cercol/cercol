import { describe, it, expect } from 'vitest'
import { computeWitnessScores, getRelevantRoles, compareRoleViews } from '../witness-scoring'

// ── Minimal round builders ────────────────────────────────────────────────────
// Only fields used by computeWitnessScores: id, factor, valence

function makeAdj(id, factor, valence) {
  return { id, factor, valence }
}

// A round with one adjective per OCEAN factor (positive pole)
const POS_ADJS = [
  makeAdj('E+01', 'E', +1),
  makeAdj('A+01', 'A', +1),
  makeAdj('C+01', 'C', +1),
  makeAdj('N-01', 'N', -1),
  makeAdj('O+01', 'O', +1),
]

function makeRound(best, worst, adjs = POS_ADJS) {
  return { adjectives: adjs, best, worst }
}

// ── computeWitnessScores ──────────────────────────────────────────────────────

describe('computeWitnessScores', () => {
  it('returns 3 for all domains when no round has best or worst set', () => {
    const rounds = [makeRound(null, null)]
    const scores = computeWitnessScores(rounds)
    expect(scores.presence).toBe(3)
    expect(scores.bond).toBe(3)
    expect(scores.discipline).toBe(3)
    expect(scores.depth).toBe(3)
    expect(scores.vision).toBe(3)
  })

  it('raises presence to 5 when E+ adj is always chosen as best', () => {
    // One round: best=E+01 (valence +1) → votes[E]=+1, count[E]=1 → 3+(1/1)*2=5
    const scores = computeWitnessScores([makeRound('E+01', 'O+01')])
    expect(scores.presence).toBe(5)
  })

  it('lowers bond to 1 when A+ adj is chosen as worst', () => {
    // worst=A+01 (valence +1) → votes[A]-=1 → 3+(-1/1)*2=1
    const scores = computeWitnessScores([makeRound('E+01', 'A+01')])
    expect(scores.bond).toBe(1)
  })

  it('lowering N (depth) increases score (N has negative valence adjs)', () => {
    // N-01 has valence -1; choosing it as best: votes[N] += (-1) → 3+(-1)*2=1
    const scores = computeWitnessScores([makeRound('N-01', 'E+01')])
    expect(scores.depth).toBe(1)
  })

  it('choosing N-01 as worst reduces depth score', () => {
    // worst=N-01 (valence -1) → votes[N] -= (-1) = +1 → 3+(1/1)*2=5
    const scores = computeWitnessScores([makeRound('E+01', 'N-01')])
    expect(scores.depth).toBe(5)
  })

  it('scores are clamped to [1, 5]', () => {
    // Three rounds all with E+01 as best → still max 5
    const rounds = [
      makeRound('E+01', 'A+01'),
      makeRound('E+01', 'A+01'),
      makeRound('E+01', 'A+01'),
    ]
    const scores = computeWitnessScores(rounds)
    expect(scores.presence).toBe(5)
    expect(scores.bond).toBe(1)
  })

  it('averages votes across multiple rounds', () => {
    // 2 rounds: round 1 best=E+01 (+1), round 2 best=O+01 (ignore E)
    // For E: round1 count=1 votes=+1; round2 count=1 votes=0 → total count=2 votes=1 → 3+(1/2)*2=4
    const rounds = [
      makeRound('E+01', 'A+01'),
      makeRound('O+01', 'A+01'),
    ]
    const scores = computeWitnessScores(rounds)
    // presence: E+01 best in round1 only → votes[E]=1, count[E]=2 → 3+(1/2)*2=4
    expect(scores.presence).toBe(4)
    // vision: O+01 best in round2 only → votes[O]=1, count[O]=2 → 3+(1/2)*2=4
    expect(scores.vision).toBe(4)
  })

  it('returns all five domain keys', () => {
    const scores = computeWitnessScores([makeRound('E+01', 'A+01')])
    expect(scores).toHaveProperty('presence')
    expect(scores).toHaveProperty('bond')
    expect(scores).toHaveProperty('discipline')
    expect(scores).toHaveProperty('depth')
    expect(scores).toHaveProperty('vision')
  })
})

// ── getRelevantRoles ──────────────────────────────────────────────────────────

describe('getRelevantRoles', () => {
  it('returns only top role when dominant ratio >= 1.5', () => {
    const probs = { R01: 0.60, R02: 0.20, R03: 0.10, R04: 0.05, R05: 0.03,
                    R06: 0.01, R07: 0.01, R08: 0.00, R09: 0.00, R10: 0.00,
                    R11: 0.00, R12: 0.00 }
    // R01 / R02 = 3.0 >= 1.5 → dominant
    const result = getRelevantRoles(probs)
    expect(result).toHaveLength(1)
    expect(result[0].role).toBe('R01')
  })

  it('includes multiple roles when no dominant', () => {
    const probs = { R01: 0.30, R02: 0.25, R03: 0.20, R04: 0.15, R05: 0.10,
                    R06: 0.00, R07: 0.00, R08: 0.00, R09: 0.00, R10: 0.00,
                    R11: 0.00, R12: 0.00 }
    // R01/R02 = 1.2 < 1.5 → no dominant; threshold = max(0.10, 0.30*0.6) = 0.18
    // R01(0.30), R02(0.25), R03(0.20) pass; R04(0.15) < 0.18, fails
    const result = getRelevantRoles(probs)
    expect(result.length).toBeGreaterThanOrEqual(2)
    const roles = result.map(r => r.role)
    expect(roles).toContain('R01')
    expect(roles).toContain('R02')
  })

  it('caps at maxRoles (5 by default)', () => {
    const probs = { R01: 0.20, R02: 0.19, R03: 0.18, R04: 0.17, R05: 0.16,
                    R06: 0.10, R07: 0.00, R08: 0.00, R09: 0.00, R10: 0.00,
                    R11: 0.00, R12: 0.00 }
    // All 6 above 10%, but cap = 5
    const result = getRelevantRoles(probs)
    expect(result.length).toBeLessThanOrEqual(5)
  })

  it('returns empty array for empty probabilities', () => {
    expect(getRelevantRoles({})).toHaveLength(0)
  })

  it('always returns at least one role if probabilities are non-empty', () => {
    const probs = { R01: 0.08, R02: 0.05, R03: 0.04, R04: 0.03, R05: 0.02,
                    R06: 0.01, R07: 0.01, R08: 0.01, R09: 0.01, R10: 0.01,
                    R11: 0.01, R12: 0.01 }
    // top=R01(0.08), second=R02(0.05) → ratio 1.6 >= 1.5 → dominant
    const result = getRelevantRoles(probs)
    expect(result.length).toBeGreaterThanOrEqual(1)
  })

  it('sorted by probability descending', () => {
    const probs = { R01: 0.30, R02: 0.25, R03: 0.20, R04: 0.15, R05: 0.10,
                    R06: 0.00, R07: 0.00, R08: 0.00, R09: 0.00, R10: 0.00,
                    R11: 0.00, R12: 0.00 }
    const result = getRelevantRoles(probs)
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].probability).toBeGreaterThanOrEqual(result[i].probability)
    }
  })
})

// ── compareRoleViews ──────────────────────────────────────────────────────────

// Helper to build a minimal computeRole()-shaped result
function makeRoleResult(probs) {
  const entries = Object.entries(probs).sort(([, a], [, b]) => b - a)
  return { role: entries[0][0], arc: [], probabilities: probs }
}

const FLAT_PROBS = { R01: 0.30, R02: 0.25, R03: 0.20, R04: 0.05, R05: 0.04,
                     R06: 0.04, R07: 0.03, R08: 0.03, R09: 0.02, R10: 0.02,
                     R11: 0.01, R12: 0.01 }

describe('compareRoleViews', () => {
  it('returns null when witnessResult is null', () => {
    expect(compareRoleViews(makeRoleResult(FLAT_PROBS), null)).toBeNull()
  })

  it('returns selfRelevant and witnessRelevant arrays', () => {
    const self    = makeRoleResult({ R01: 0.50, R02: 0.20, R03: 0.10, R04: 0.08, R05: 0.07,
                                     R06: 0.02, R07: 0.01, R08: 0.01, R09: 0.01, R10: 0.00,
                                     R11: 0.00, R12: 0.00 })
    const witness = makeRoleResult({ R03: 0.50, R04: 0.20, R05: 0.10, R06: 0.08, R07: 0.07,
                                     R01: 0.02, R02: 0.01, R08: 0.01, R09: 0.01, R10: 0.00,
                                     R11: 0.00, R12: 0.00 })
    const result = compareRoleViews(self, witness)
    expect(Array.isArray(result.selfRelevant)).toBe(true)
    expect(Array.isArray(result.witnessRelevant)).toBe(true)
  })

  it('shared set contains roles appearing in both views', () => {
    // R01 dominant in both
    const selfProbs    = { R01: 0.70, R02: 0.15, R03: 0.05, R04: 0.04, R05: 0.03,
                           R06: 0.01, R07: 0.01, R08: 0.00, R09: 0.00, R10: 0.00,
                           R11: 0.00, R12: 0.00 }
    const witnessProbs = { R01: 0.70, R02: 0.10, R03: 0.05, R04: 0.04, R05: 0.03,
                           R06: 0.04, R07: 0.01, R08: 0.01, R09: 0.00, R10: 0.00,
                           R11: 0.00, R12: 0.00 }
    const result = compareRoleViews(makeRoleResult(selfProbs), makeRoleResult(witnessProbs))
    expect(result.shared.has('R01')).toBe(true)
  })

  it('surprises have correct type labels', () => {
    // Self = R01, Witness = R02 (no overlap)
    const selfProbs    = { R01: 0.80, R02: 0.10, R03: 0.05, R04: 0.02, R05: 0.01,
                           R06: 0.01, R07: 0.00, R08: 0.00, R09: 0.00, R10: 0.00,
                           R11: 0.00, R12: 0.00 }
    const witnessProbs = { R02: 0.80, R01: 0.10, R03: 0.05, R04: 0.02, R05: 0.01,
                           R06: 0.01, R07: 0.00, R08: 0.00, R09: 0.00, R10: 0.00,
                           R11: 0.00, R12: 0.00 }
    const result = compareRoleViews(makeRoleResult(selfProbs), makeRoleResult(witnessProbs))
    const witnessOnly = result.surprises.filter(s => s.type === 'witnessOnly')
    const selfOnly    = result.surprises.filter(s => s.type === 'selfOnly')
    // R02 dominant for witness, not for self → witnessOnly
    expect(witnessOnly.some(s => s.role === 'R02')).toBe(true)
    // R01 dominant for self, not for witness → selfOnly
    expect(selfOnly.some(s => s.role === 'R01')).toBe(true)
  })

  it('surprises sorted by probability descending', () => {
    const result = compareRoleViews(makeRoleResult(FLAT_PROBS), makeRoleResult({
      R05: 0.35, R06: 0.30, R07: 0.20, R01: 0.05, R02: 0.04,
      R03: 0.02, R04: 0.01, R08: 0.01, R09: 0.01, R10: 0.00,
      R11: 0.00, R12: 0.00,
    }))
    for (let i = 1; i < result.surprises.length; i++) {
      expect(result.surprises[i - 1].probability).toBeGreaterThanOrEqual(result.surprises[i].probability)
    }
  })
})
