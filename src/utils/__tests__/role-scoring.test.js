import { describe, it, expect } from 'vitest'
import {
  computeRole,
  NORM_MEAN,
  NORM_SD,
  ARC_PROBABILITY_THRESHOLD,
  DOMAIN_MAP,
  toFiveScale,
} from '../role-scoring'

// Build domain scores at the normative mean (all z = 0)
const MEAN_SCORES = {
  presence: NORM_MEAN.E,
  bond: NORM_MEAN.A,
  vision: NORM_MEAN.O,
  discipline: NORM_MEAN.C,
  depth: NORM_MEAN.N,
}

// Helper: shift a domain score by N standard deviations
function withZ(base, domain, factor, zDelta) {
  return { ...base, [domain]: NORM_MEAN[factor] + zDelta * NORM_SD[factor] }
}

describe('computeRole — return shape', () => {
  it('returns role, arc, and probabilities', () => {
    const result = computeRole(MEAN_SCORES)
    expect(result).toHaveProperty('role')
    expect(result).toHaveProperty('arc')
    expect(result).toHaveProperty('probabilities')
  })

  it('has exactly 12 probability entries (R01–R12)', () => {
    const result = computeRole(MEAN_SCORES)
    expect(Object.keys(result.probabilities)).toHaveLength(12)
  })

  it('probabilities sum to 1', () => {
    const sum = Object.values(computeRole(MEAN_SCORES).probabilities).reduce((a, b) => a + b, 0)
    expect(sum).toBeCloseTo(1, 10)
  })
})

describe('computeRole — primary role', () => {
  it('primary role has the highest probability', () => {
    const result = computeRole(MEAN_SCORES)
    const maxProb = Math.max(...Object.values(result.probabilities))
    expect(result.probabilities[result.role]).toBe(maxProb)
  })

  it('strong Dolphin profile (high E, high A, low N) → R01', () => {
    const scores = {
      presence: NORM_MEAN.E + 1.5 * NORM_SD.E,
      bond: NORM_MEAN.A + 1.5 * NORM_SD.A,
      vision: NORM_MEAN.O,
      discipline: NORM_MEAN.C,
      depth: NORM_MEAN.N - 1.0 * NORM_SD.N,
    }
    expect(computeRole(scores).role).toBe('R01')
  })

  it('strong Tortoise profile (low E, low O, high C, low N) → R08', () => {
    const scores = {
      presence: NORM_MEAN.E - 1.5 * NORM_SD.E,
      bond: NORM_MEAN.A,
      vision: NORM_MEAN.O - 1.5 * NORM_SD.O,
      discipline: NORM_MEAN.C + 1.5 * NORM_SD.C,
      depth: NORM_MEAN.N - 1.0 * NORM_SD.N,
    }
    expect(computeRole(scores).role).toBe('R08')
  })

  it('strong Eagle profile (high E, high O) → R05', () => {
    const scores = {
      presence: NORM_MEAN.E + 1.5 * NORM_SD.E,
      bond: NORM_MEAN.A,
      vision: NORM_MEAN.O + 1.5 * NORM_SD.O,
      discipline: NORM_MEAN.C - 0.5 * NORM_SD.C,
      depth: NORM_MEAN.N - 0.5 * NORM_SD.N,
    }
    expect(computeRole(scores).role).toBe('R05')
  })
})

describe('computeRole — arc', () => {
  it('primary role is never included in arc', () => {
    const result = computeRole(MEAN_SCORES)
    expect(result.arc).not.toContain(result.role)
  })

  it('all arc roles exceed ARC_PROBABILITY_THRESHOLD', () => {
    const result = computeRole(MEAN_SCORES)
    for (const r of result.arc) {
      expect(result.probabilities[r]).toBeGreaterThan(ARC_PROBABILITY_THRESHOLD)
    }
  })

  it('non-arc roles (excluding primary) do not exceed ARC_PROBABILITY_THRESHOLD', () => {
    const result = computeRole(MEAN_SCORES)
    const arcSet = new Set(result.arc)
    for (const [r, p] of Object.entries(result.probabilities)) {
      if (r !== result.role && !arcSet.has(r)) {
        expect(p).toBeLessThanOrEqual(ARC_PROBABILITY_THRESHOLD)
      }
    }
  })

  it('very extreme profile produces a narrow arc (or empty)', () => {
    // Profile maximally aligned with R08 — expected arc is small
    const scores = {
      presence: NORM_MEAN.E - 3 * NORM_SD.E,
      bond: NORM_MEAN.A,
      vision: NORM_MEAN.O - 3 * NORM_SD.O,
      discipline: NORM_MEAN.C + 3 * NORM_SD.C,
      depth: NORM_MEAN.N - 3 * NORM_SD.N,
    }
    const result = computeRole(scores)
    expect(result.role).toBe('R08')
    expect(result.arc.length).toBeLessThan(4)
  })
})

describe('DOMAIN_MAP', () => {
  it('maps all five OCEAN factors to domain names', () => {
    expect(DOMAIN_MAP.E).toBe('presence')
    expect(DOMAIN_MAP.A).toBe('bond')
    expect(DOMAIN_MAP.O).toBe('vision')
    expect(DOMAIN_MAP.C).toBe('discipline')
    expect(DOMAIN_MAP.N).toBe('depth')
  })
})

describe('toFiveScale', () => {
  it('leaves 1-5 instruments untouched', () => {
    const scores = { presence: 3.2, bond: 4.1, vision: 2.8, discipline: 3.9, depth: 2.2 }
    expect(toFiveScale(scores, 'fullMoon')).toEqual(scores)
    expect(toFiveScale(scores, null)).toEqual(scores)
  })

  it('maps the 1-7 endpoints onto the 1-5 endpoints', () => {
    const mapped = toFiveScale({ presence: 1, bond: 4, vision: 7 }, 'newMoon')
    expect(mapped.presence).toBeCloseTo(1)   // floor to floor
    expect(mapped.bond).toBeCloseTo(3)       // midpoint to midpoint
    expect(mapped.vision).toBeCloseTo(5)     // ceiling to ceiling
  })

  it('stops a mild New Moon answer from reading as an extreme profile', () => {
    // A flat "5 out of 7" is mildly agreeable. Scored against the 1-5 priors
    // it lands above +2 SD on presence, which is what mislabelled a third of
    // the historical results.
    const flatFive = { presence: 5, bond: 5, vision: 5, discipline: 5, depth: 5 }
    const zRaw = (flatFive.presence - NORM_MEAN.E) / NORM_SD.E
    const mapped = toFiveScale(flatFive, 'newMoon')
    const zMapped = (mapped.presence - NORM_MEAN.E) / NORM_SD.E
    expect(zRaw).toBeGreaterThan(2)
    expect(Math.abs(zMapped)).toBeLessThan(1)
  })

  it('changes which role a New Moon result is assigned to', () => {
    const scores = { presence: 3.5, bond: 5.5, vision: 5.5, discipline: 5.0, depth: 3.0 }
    expect(computeRole(scores, 'newMoon').role)
      .not.toBe(computeRole(scores).role)
  })
})
