import { describe, it, expect } from 'vitest'
import { computeWitnessScores, detectDivergence, spearmanRho, spearmanLabel, computeRankComparison } from '../witness-scoring'
import { NORM_MEAN, NORM_SD } from '../role-scoring'

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

// ── detectDivergence ──────────────────────────────────────────────────────────

const NEUTRAL = { presence: 3, bond: 3, discipline: 3, depth: 3, vision: 3 }

describe('detectDivergence', () => {
  it('returns empty array when self and witness scores are identical', () => {
    expect(detectDivergence(NEUTRAL, NEUTRAL)).toHaveLength(0)
  })

  it('detects presence divergence when scores are maximally different', () => {
    const self    = { ...NEUTRAL, presence: 1 }
    const witness = { ...NEUTRAL, presence: 5 }
    const result  = detectDivergence(self, witness)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].domain).toBe('presence')
  })

  it('computes diff as |selfZ - witnessZ| using imported NORM constants', () => {
    const selfScore    = 1
    const witnessScore = 5
    const self    = { ...NEUTRAL, presence: selfScore }
    const witness = { ...NEUTRAL, presence: witnessScore }
    const [d] = detectDivergence(self, witness)

    const expectedSelfZ    = (selfScore    - NORM_MEAN.E) / NORM_SD.E
    const expectedWitnessZ = (witnessScore - NORM_MEAN.E) / NORM_SD.E
    const expectedDiff     = Math.abs(expectedSelfZ - expectedWitnessZ)

    expect(d.selfZ).toBeCloseTo(expectedSelfZ, 10)
    expect(d.witnessZ).toBeCloseTo(expectedWitnessZ, 10)
    expect(d.diff).toBeCloseTo(expectedDiff, 10)
  })

  it('includes selfScore and witnessScore in result entries', () => {
    const self    = { ...NEUTRAL, presence: 1 }
    const witness = { ...NEUTRAL, presence: 5 }
    const [d] = detectDivergence(self, witness)
    expect(d.selfScore).toBe(1)
    expect(d.witnessScore).toBe(5)
  })

  it('sorts results by diff descending', () => {
    // presence diff >> bond diff (both above default threshold)
    const self    = { presence: 1, bond: 2, discipline: 3, depth: 3, vision: 3 }
    const witness = { presence: 5, bond: 5, discipline: 3, depth: 3, vision: 3 }
    const result  = detectDivergence(self, witness)
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].diff).toBeGreaterThanOrEqual(result[i].diff)
    }
  })

  it('respects custom threshold — higher threshold excludes borderline domains', () => {
    const self    = { ...NEUTRAL, presence: 1 }
    const witness = { ...NEUTRAL, presence: 5 }
    // diff ≈ 4 / NORM_SD.E ≈ 5.6 → included even at threshold 5
    expect(detectDivergence(self, witness, 5)).toHaveLength(1)
    // At threshold 100 nothing passes
    expect(detectDivergence(self, witness, 100)).toHaveLength(0)
  })

  it('respects custom threshold — threshold 0 catches any non-zero difference', () => {
    const self    = { ...NEUTRAL, presence: 1 }
    const result  = detectDivergence(self, NEUTRAL, 0)
    // presence diff is clearly > 0
    const domains = result.map(r => r.domain)
    expect(domains).toContain('presence')
  })

  it('uses NORM_MEAN.A for bond domain', () => {
    const selfScore    = 1
    const witnessScore = 5
    const self    = { ...NEUTRAL, bond: selfScore }
    const witness = { ...NEUTRAL, bond: witnessScore }
    const [d] = detectDivergence(self, witness)
    const expectedSelfZ = (selfScore - NORM_MEAN.A) / NORM_SD.A
    expect(d.selfZ).toBeCloseTo(expectedSelfZ, 10)
  })
})

// ── spearmanRho ───────────────────────────────────────────────────────────────

describe('spearmanRho', () => {
  it('returns 1 for identical rankings', () => {
    const s = { presence: 5, bond: 4, vision: 3, discipline: 2, depth: 1 }
    expect(spearmanRho(s, s)).toBeCloseTo(1, 5)
  })

  it('returns -1 for fully reversed rankings', () => {
    const s = { presence: 5, bond: 4, vision: 3, discipline: 2, depth: 1 }
    const w = { presence: 1, bond: 2, vision: 3, discipline: 4, depth: 5 }
    expect(spearmanRho(s, w)).toBeCloseTo(-1, 5)
  })

  it('returns a value close to 0 for weakly correlated rankings', () => {
    // s ranks [1,2,3,4,5], w ranks [2,5,4,1,3] → ρ = -0.2
    const s = { presence: 5, bond: 4, vision: 3, discipline: 2, depth: 1 }
    const w = { presence: 4, bond: 1, vision: 2, discipline: 5, depth: 3 }
    expect(Math.abs(spearmanRho(s, w))).toBeLessThan(0.5)
  })

  it('handles tied scores with averaged ranks', () => {
    const s = { presence: 4, bond: 4, vision: 3, discipline: 2, depth: 1 }
    const w = { presence: 4, bond: 4, vision: 3, discipline: 2, depth: 1 }
    expect(spearmanRho(s, w)).toBeCloseTo(1, 5)
  })

  it('returns 0 when either input is null', () => {
    expect(spearmanRho(null, { presence: 1, bond: 2, vision: 3, discipline: 4, depth: 5 })).toBe(0)
    expect(spearmanRho({ presence: 1, bond: 2, vision: 3, discipline: 4, depth: 5 }, null)).toBe(0)
  })
})

// ── spearmanLabel ─────────────────────────────────────────────────────────────

describe('spearmanLabel', () => {
  it('returns strong for ρ ≥ 0.5', () => {
    expect(spearmanLabel(0.5)).toBe('strong')
    expect(spearmanLabel(0.9)).toBe('strong')
    expect(spearmanLabel(1.0)).toBe('strong')
  })

  it('returns moderate for 0 ≤ ρ < 0.5', () => {
    expect(spearmanLabel(0.0)).toBe('moderate')
    expect(spearmanLabel(0.49)).toBe('moderate')
  })

  it('returns divergent for ρ < 0', () => {
    expect(spearmanLabel(-0.01)).toBe('divergent')
    expect(spearmanLabel(-1.0)).toBe('divergent')
  })
})

// ── computeRankComparison ─────────────────────────────────────────────────────

describe('computeRankComparison', () => {
  it('returns 5 entries sorted by selfRank ascending', () => {
    const s = { presence: 5, bond: 4, vision: 3, discipline: 2, depth: 1 }
    const w = { presence: 1, bond: 2, vision: 3, discipline: 4, depth: 5 }
    const result = computeRankComparison(s, w)
    expect(result).toHaveLength(5)
    expect(result[0].domain).toBe('presence')   // highest self (rank 1)
    expect(result[4].domain).toBe('depth')       // lowest self (rank 5)
    expect(result[0].selfRank).toBe(1)
    expect(result[0].witnessRank).toBe(5)
  })

  it('returns empty array on null input', () => {
    expect(computeRankComparison(null, {})).toEqual([])
  })
})
