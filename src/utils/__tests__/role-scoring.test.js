import { describe, it, expect } from 'vitest'
import {
  computeRole,
  DOMAIN_ALPHA,
  NORM_MEAN,
  NORM_SD,
  ARC_PROBABILITY_THRESHOLD,
  DOMAIN_MAP,
  priorFor,
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

describe('priorFor', () => {
  it('falls back to the 1-5 self-report statistics when no instrument is named', () => {
    expect(priorFor(null).mean).toEqual(NORM_MEAN)
    expect(priorFor('fullMoon').mean).toEqual(NORM_MEAN)
  })

  it("uses the TIPI's own published norms for New Moon, not a rescale", () => {
    // Gosling, Rentfrow & Potter (2014), N = 278,000, pooled over six age
    // bands per sex. Pinned to the published figures rather than derived,
    // because the derivation is exactly what was wrong: rescaling the 1-5
    // IPIP statistics put Bond 0.74 of its own SD too high and every SD 25
    // to 45% too narrow, and reassigned 41% of real New Moon results.
    const p = priorFor('newMoon')
    expect(p.mean).toEqual({ E: 3.95, A: 4.71, O: 5.51, C: 4.65, N: 3.64 })
    expect(p.sd).toEqual({ E: 1.58, A: 1.23, O: 1.14, C: 1.41, N: 1.48 })
  })

  it('does not let the 1-7 prior be a stretched copy of the 1-5 one', () => {
    // The regression guard. If someone reinstates the linear map, every
    // domain lands back on (x5 - 1) * 6/4 + 1 and this fails.
    const p = priorFor('newMoon')
    const stretched = ['E', 'A', 'O', 'C', 'N'].every(
      f => Math.abs(p.mean[f] - (((NORM_MEAN[f] - 1) * 6) / 4 + 1)) < 0.01,
    )
    expect(stretched).toBe(false)
    // And the spread must be the instrument's, which is wider than the
    // stretch produced on every domain.
    for (const f of ['E', 'A', 'O', 'C', 'N']) {
      expect(p.sd[f]).toBeGreaterThan((NORM_SD[f] * 6) / 4)
    }
  })

  it('gives the Witness instrument its own centre and spread', () => {
    const p = priorFor('witness')
    for (const f of ['E', 'A', 'O', 'C', 'N']) {
      expect(p.mean[f]).toBe(3.07)
      expect(p.sd[f]).toBe(1.03)
    }
  })
})

describe('computeRole against the right prior', () => {
  it('puts a neutral Witness result at the origin, not in a corner', () => {
    // computeWitnessScores is centred on 3.0 by construction. Against the
    // self-report norms that lands at z = (-0.42, -1.55, -1.17, -1.13, +0.28),
    // a fixed point that sent 41% of witnessed reports to the same role.
    // Typical means the instrument's own centre, not a round 3.0: the rank
    // weights are asymmetric so the mean is 3.07.
    const { mean, sd } = priorFor('witness')
    const typical = {
      presence: mean.E, bond: mean.A, vision: mean.O,
      discipline: mean.C, depth: mean.N,
    }
    expect(computeRole(typical, 'witness').role).not.toBe(computeRole(typical).role)
    expect((typical.bond - mean.A) / sd.A).toBe(0)
  })

  it('stops a mild New Moon answer reading as an extreme profile', () => {
    const flatFive = { presence: 5, bond: 5, vision: 5, discipline: 5, depth: 5 }
    const p = priorFor('newMoon')
    const zNewMoon = (flatFive.presence - p.mean.E) / p.sd.E
    const zWrong = (flatFive.presence - NORM_MEAN.E) / NORM_SD.E
    expect(zWrong).toBeGreaterThan(2)
    expect(Math.abs(zNewMoon)).toBeLessThan(1)
  })

  it('assigns a different role when the instrument is named', () => {
    const scores = { presence: 3.5, bond: 5.5, vision: 5.5, discipline: 5.0, depth: 3.0 }
    expect(computeRole(scores, 'newMoon').role).not.toBe(computeRole(scores).role)
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

describe('the two instruments do not share a reliability', () => {
  it('gives each its own published alpha and its own source', () => {
    // SCIENCE.md cited Kajonius & Johnson's .82-.90 for both. That figure is
    // the IPIP-NEO-120's; the 60 publishes its own, from a different sample.
    expect(DOMAIN_ALPHA.fullMoon.min).not.toBe(DOMAIN_ALPHA.firstQuarter.min)
    for (const k of ['fullMoon', 'firstQuarter']) {
      expect(DOMAIN_ALPHA[k].source, k).toMatch(/N = [\d,]+/)
      expect(DOMAIN_ALPHA[k].min, k).toBeLessThan(DOMAIN_ALPHA[k].max)
    }
  })

  it('records that the shorter form is the more internally consistent one', () => {
    // Counter-intuitive and deliberate: its sixty items were selected by IRT
    // to optimise domain information, where the 120 spends its length on
    // facet coverage. Pinned so nobody "corrects" it back.
    expect(DOMAIN_ALPHA.firstQuarter.min).toBeGreaterThan(DOMAIN_ALPHA.fullMoon.min)
  })
})
