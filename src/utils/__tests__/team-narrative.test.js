import { describe, it, expect } from 'vitest'
import {
  generateNarrative,
  computeGroupMeans,
  computeDimensionAnalysis,
  balanceFlagForPBV,
  balanceFlagForC,
  balanceFlagForN,
} from '../team-narrative'

// ── balanceFlagForPBV ─────────────────────────────────────────────────────────

describe('balanceFlagForPBV', () => {
  it('returns stronglyHigh when z > 1.0', () => {
    expect(balanceFlagForPBV(1.1)).toBe('stronglyHigh')
    expect(balanceFlagForPBV(2.0)).toBe('stronglyHigh')
  })

  it('returns tiltedHigh when 0.5 < z <= 1.0', () => {
    expect(balanceFlagForPBV(0.6)).toBe('tiltedHigh')
    expect(balanceFlagForPBV(1.0)).toBe('tiltedHigh')
  })

  it('returns balanced when -0.5 <= z <= 0.5', () => {
    expect(balanceFlagForPBV(0.0)).toBe('balanced')
    expect(balanceFlagForPBV(0.5)).toBe('balanced')
    expect(balanceFlagForPBV(-0.5)).toBe('balanced')
  })

  it('returns tiltedLow when -1.0 <= z < -0.5', () => {
    expect(balanceFlagForPBV(-0.6)).toBe('tiltedLow')
    expect(balanceFlagForPBV(-1.0)).toBe('tiltedLow')
  })

  it('returns stronglyLow when z < -1.0', () => {
    expect(balanceFlagForPBV(-1.1)).toBe('stronglyLow')
    expect(balanceFlagForPBV(-2.0)).toBe('stronglyLow')
  })
})

// ── balanceFlagForC ───────────────────────────────────────────────────────────

describe('balanceFlagForC', () => {
  it('returns highGood when z > 0.5', () => {
    expect(balanceFlagForC(0.6)).toBe('highGood')
    expect(balanceFlagForC(2.0)).toBe('highGood')
  })

  it('returns balanced when -0.5 <= z <= 0.5', () => {
    expect(balanceFlagForC(0.0)).toBe('balanced')
    expect(balanceFlagForC(0.5)).toBe('balanced')
    expect(balanceFlagForC(-0.5)).toBe('balanced')
  })

  it('returns lowCaution when z < -0.5', () => {
    expect(balanceFlagForC(-0.6)).toBe('lowCaution')
    expect(balanceFlagForC(-2.0)).toBe('lowCaution')
  })
})

// ── balanceFlagForN ───────────────────────────────────────────────────────────

describe('balanceFlagForN', () => {
  it('returns lowGood when z < -0.5', () => {
    expect(balanceFlagForN(-0.6)).toBe('lowGood')
    expect(balanceFlagForN(-2.0)).toBe('lowGood')
  })

  it('returns balanced when -0.5 <= z <= 0.5', () => {
    expect(balanceFlagForN(0.0)).toBe('balanced')
    expect(balanceFlagForN(-0.5)).toBe('balanced')
    expect(balanceFlagForN(0.5)).toBe('balanced')
  })

  it('returns highCaution when z > 0.5', () => {
    expect(balanceFlagForN(0.6)).toBe('highCaution')
    expect(balanceFlagForN(2.0)).toBe('highCaution')
  })
})

// ── generateNarrative ─────────────────────────────────────────────────────────

describe('generateNarrative', () => {
  it('returns balanced moveKey when all |z| < 0.4', () => {
    expect(generateNarrative({ p: 0.3, b: -0.3, v: 0.2, c: 0, n: 0 }).moveKey).toBe('balanced')
  })

  it('boundary: |z| = 0.4 triggers non-balanced', () => {
    expect(generateNarrative({ p: 0.4, b: 0, v: 0, c: 0, n: 0 }).moveKey).toBe('high_p')
  })

  it('boundary: |z| = 0.39 stays balanced', () => {
    expect(generateNarrative({ p: 0.39, b: 0, v: 0, c: 0, n: 0 }).moveKey).toBe('balanced')
  })

  it('returns high_p when p dominates with positive z', () => {
    expect(generateNarrative({ p: 1.0, b: 0.2, v: 0.1, c: 0, n: 0 }).moveKey).toBe('high_p')
  })

  it('returns low_p when p dominates with negative z', () => {
    expect(generateNarrative({ p: -1.0, b: 0.2, v: 0.1, c: 0, n: 0 }).moveKey).toBe('low_p')
  })

  it('returns high_b when b dominates', () => {
    expect(generateNarrative({ p: 0.2, b: 0.9, v: 0.1, c: 0, n: 0 }).moveKey).toBe('high_b')
  })

  it('returns low_b when b dominates with negative z', () => {
    expect(generateNarrative({ p: 0.2, b: -1.0, v: 0.1, c: 0, n: 0 }).moveKey).toBe('low_b')
  })

  it('returns high_v when v dominates', () => {
    expect(generateNarrative({ p: 0.1, b: 0.2, v: 0.8, c: 0, n: 0 }).moveKey).toBe('high_v')
  })

  it('returns low_v when v dominates with negative z', () => {
    expect(generateNarrative({ p: 0.1, b: -0.2, v: -0.8, c: 0, n: 0 }).moveKey).toBe('low_v')
  })

  it('picks dimension with largest absolute z as primary', () => {
    // b has |z|=0.9, v has |z|=0.7 → b wins
    const result = generateNarrative({ p: 0.1, b: 0.9, v: -0.7, c: 0, n: 0 })
    expect(result.moveKey).toBe('high_b')
  })

  it('watchOutKey and helpKey are always equal', () => {
    const result = generateNarrative({ p: 0.5, b: -0.5, v: 0.3, c: 0, n: 0 })
    expect(result.watchOutKey).toBe(result.helpKey)
  })

  it('watchOutKey mirrors moveKey when no structural risk', () => {
    const result = generateNarrative({ p: 1.0, b: 0, v: 0, c: 0, n: 0 })
    expect(result.watchOutKey).toBe('high_p')
  })

  it('overrides risk to low_c when c < -0.5', () => {
    const result = generateNarrative({ p: 1.0, b: 0, v: 0, c: -0.6, n: 0 })
    expect(result.moveKey).toBe('high_p')
    expect(result.watchOutKey).toBe('low_c')
    expect(result.helpKey).toBe('low_c')
  })

  it('overrides risk to high_n when n > 0.5 (and c is fine)', () => {
    const result = generateNarrative({ p: 1.0, b: 0, v: 0, c: 0, n: 0.6 })
    expect(result.watchOutKey).toBe('high_n')
    expect(result.helpKey).toBe('high_n')
  })

  it('low_c takes precedence over high_n when both triggered', () => {
    const result = generateNarrative({ p: 0, b: 0, v: 0, c: -0.6, n: 0.6 })
    expect(result.watchOutKey).toBe('low_c')
  })

  it('returns correct shape', () => {
    const result = generateNarrative({ p: 0, b: 0, v: 0, c: 0, n: 0 })
    expect(result).toHaveProperty('moveKey')
    expect(result).toHaveProperty('watchOutKey')
    expect(result).toHaveProperty('helpKey')
  })
})

// ── computeGroupMeans ─────────────────────────────────────────────────────────

describe('computeGroupMeans', () => {
  it('returns null when no member has zscores', () => {
    const members = [{ zscores: null }, { zscores: null }]
    expect(computeGroupMeans(members)).toBeNull()
  })

  it('averages z-scores across completed members', () => {
    const members = [
      { completed: true,  zscores: { presence: 1.0, bond: 0.0, vision: 0.5, discipline: -0.5, depth: 0.2 } },
      { completed: true,  zscores: { presence: 0.0, bond: 1.0, vision: 0.5, discipline: 0.5,  depth: 0.6 } },
    ]
    const means = computeGroupMeans(members)
    expect(means.p).toBeCloseTo(0.5, 10)
    expect(means.b).toBeCloseTo(0.5, 10)
    expect(means.v).toBeCloseTo(0.5, 10)
    expect(means.c).toBeCloseTo(0.0, 10)
    expect(means.n).toBeCloseTo(0.4, 10)
  })

  it('ignores members without zscores', () => {
    const members = [
      { completed: true,  zscores: { presence: 1.0, bond: 1.0, vision: 1.0, discipline: 1.0, depth: 1.0 } },
      { completed: false, zscores: null },
    ]
    const means = computeGroupMeans(members)
    expect(means.p).toBeCloseTo(1.0, 10)
  })

  it('ignores members with zscores but completed=false', () => {
    const members = [
      { completed: true,  zscores: { presence: 1.0, bond: 1.0, vision: 1.0, discipline: 1.0, depth: 1.0 } },
      { completed: false, zscores: { presence: 9.0, bond: 9.0, vision: 9.0, discipline: 9.0, depth: 9.0 } },
    ]
    const means = computeGroupMeans(members)
    expect(means.p).toBeCloseTo(1.0, 10)
  })

  it('returns object with keys p, b, v, c, n', () => {
    const members = [
      { completed: true, zscores: { presence: 0, bond: 0, vision: 0, discipline: 0, depth: 0 } },
    ]
    const means = computeGroupMeans(members)
    expect(means).toHaveProperty('p')
    expect(means).toHaveProperty('b')
    expect(means).toHaveProperty('v')
    expect(means).toHaveProperty('c')
    expect(means).toHaveProperty('n')
  })
})

// ── computeDimensionAnalysis ──────────────────────────────────────────────────

const MEMBER_HIGH_P = {
  completed: true,
  zscores: { presence: 1.5, bond: -0.5, vision: 0.3, discipline: 0.8, depth: -0.3 },
}
const MEMBER_LOW_P = {
  completed: true,
  zscores: { presence: -0.5, bond: 1.0, vision: 0.1, discipline: 0.2, depth: 0.2 },
}

describe('computeDimensionAnalysis', () => {
  it('returns empty array when no completed members', () => {
    const members = [{ zscores: null, completed: false }]
    expect(computeDimensionAnalysis(members, { p: 0, b: 0, v: 0, c: 0, n: 0 })).toHaveLength(0)
  })

  it('returns an entry for each of the 5 dimensions', () => {
    const groupMeans = { p: 0.5, b: 0.25, v: 0.2, c: 0.5, n: -0.05 }
    const result = computeDimensionAnalysis([MEMBER_HIGH_P, MEMBER_LOW_P], groupMeans)
    expect(result).toHaveLength(5)
    const dims = result.map(r => r.dim)
    ;['presence', 'bond', 'vision', 'discipline', 'depth'].forEach(d => {
      expect(dims).toContain(d)
    })
  })

  it('topMember is the member with highest z-score in the dimension', () => {
    const groupMeans = { p: 0.5, b: 0.25, v: 0.2, c: 0.5, n: -0.05 }
    const result = computeDimensionAnalysis([MEMBER_HIGH_P, MEMBER_LOW_P], groupMeans)
    const presEntry = result.find(r => r.dim === 'presence')
    // MEMBER_HIGH_P.presence=1.5 > MEMBER_LOW_P.presence=-0.5
    expect(presEntry.topMember).toBe(MEMBER_HIGH_P)
  })

  it('uses balanceFlagForPBV for P/B/V dimensions', () => {
    const groupMeans = { p: 1.5, b: -0.7, v: 0.3, c: 0, n: 0 }
    const result = computeDimensionAnalysis([MEMBER_HIGH_P, MEMBER_LOW_P], groupMeans)
    expect(result.find(r => r.dim === 'presence').flag).toBe('stronglyHigh')
    expect(result.find(r => r.dim === 'bond').flag).toBe('tiltedLow')
    expect(result.find(r => r.dim === 'vision').flag).toBe('balanced')
  })

  it('uses balanceFlagForC for discipline dimension', () => {
    const groupMeans = { p: 0, b: 0, v: 0, c: 1.0, n: 0 }
    const result = computeDimensionAnalysis([MEMBER_HIGH_P, MEMBER_LOW_P], groupMeans)
    expect(result.find(r => r.dim === 'discipline').flag).toBe('highGood')
  })

  it('uses balanceFlagForN for depth dimension', () => {
    const groupMeans = { p: 0, b: 0, v: 0, c: 0, n: 1.0 }
    const result = computeDimensionAnalysis([MEMBER_HIGH_P, MEMBER_LOW_P], groupMeans)
    expect(result.find(r => r.dim === 'depth').flag).toBe('highCaution')
  })

  it('sets suggestedRoles for discipline when meanZ < -0.5', () => {
    const groupMeans = { p: 0, b: 0, v: 0, c: -1.0, n: 0 }
    const result = computeDimensionAnalysis([MEMBER_HIGH_P, MEMBER_LOW_P], groupMeans)
    const discEntry = result.find(r => r.dim === 'discipline')
    expect(discEntry.suggestedRoles).toEqual(['R08', 'R04', 'R09'])
  })

  it('sets suggestedRoles for depth when meanZ > 0.5', () => {
    const groupMeans = { p: 0, b: 0, v: 0, c: 0, n: 1.0 }
    const result = computeDimensionAnalysis([MEMBER_HIGH_P, MEMBER_LOW_P], groupMeans)
    const depthEntry = result.find(r => r.dim === 'depth')
    expect(depthEntry.suggestedRoles).toEqual(['R08', 'R03', 'R10'])
  })

  it('finds compensatingMember for high presence tilt', () => {
    // meanZ=0.5 (>= 0.5), MEMBER_LOW_P.presence=-0.5 < 0 → compensates
    const groupMeans = { p: 0.5, b: 0, v: 0, c: 0, n: 0 }
    const result = computeDimensionAnalysis([MEMBER_HIGH_P, MEMBER_LOW_P], groupMeans)
    const presEntry = result.find(r => r.dim === 'presence')
    expect(presEntry.compensatingMember).toBe(MEMBER_LOW_P)
    expect(presEntry.suggestedRole).toBeNull()
  })

  it('sets suggestedRole when no member compensates for high presence tilt', () => {
    const bothHighP = [
      { completed: true, zscores: { presence: 1.5, bond: 0, vision: 0, discipline: 0, depth: 0 } },
      { completed: true, zscores: { presence: 0.8, bond: 0, vision: 0, discipline: 0, depth: 0 } },
    ]
    const groupMeans = { p: 1.15, b: 0, v: 0, c: 0, n: 0 }
    const result = computeDimensionAnalysis(bothHighP, groupMeans)
    const presEntry = result.find(r => r.dim === 'presence')
    expect(presEntry.compensatingMember).toBeNull()
    expect(presEntry.suggestedRole).toBe('R03') // SUGGEST_ROLE_FOR_TILT.presence_high
  })

  it('sets suggestedRole for low presence tilt with no compensator', () => {
    const bothLowP = [
      { completed: true, zscores: { presence: -1.5, bond: 0, vision: 0, discipline: 0, depth: 0 } },
      { completed: true, zscores: { presence: -0.8, bond: 0, vision: 0, discipline: 0, depth: 0 } },
    ]
    const groupMeans = { p: -1.15, b: 0, v: 0, c: 0, n: 0 }
    const result = computeDimensionAnalysis(bothLowP, groupMeans)
    const presEntry = result.find(r => r.dim === 'presence')
    expect(presEntry.suggestedRole).toBe('R01') // SUGGEST_ROLE_FOR_TILT.presence_low
  })

  it('excludes members without completed flag', () => {
    const pendingMember = {
      completed: false,
      zscores: { presence: 10, bond: 10, vision: 10, discipline: 10, depth: 10 },
    }
    const groupMeans = { p: 0.5, b: 0, v: 0, c: 0, n: 0 }
    const result = computeDimensionAnalysis([MEMBER_HIGH_P, MEMBER_LOW_P, pendingMember], groupMeans)
    // pendingMember has extreme scores but should be ignored
    const presEntry = result.find(r => r.dim === 'presence')
    expect(presEntry.topMember).not.toBe(pendingMember)
  })
})
