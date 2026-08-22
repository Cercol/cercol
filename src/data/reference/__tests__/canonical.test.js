/**
 * Guards on the two canonical item sets.
 *
 * These files exist because the instruments were once written from memory and
 * half the items were the wrong ones. Every assertion here is a property the
 * published instruments have, so a file that fails one of them was not built
 * from the source.
 */
import { describe, it, expect } from 'vitest'
import { IPIP_NEO_120 } from '../ipip-neo-120'
import { IPIP_NEO_60 } from '../ipip-neo-60'

const DOMAINS = ['neuroticism', 'extraversion', 'openness', 'agreeableness', 'conscientiousness']

describe('IPIP-NEO-120', () => {
  it('has thirty facets of four items', () => {
    expect(IPIP_NEO_120).toHaveLength(120)
    const byFacet = {}
    for (const i of IPIP_NEO_120) (byFacet[i.facet] ||= []).push(i)
    expect(Object.keys(byFacet)).toHaveLength(30)
    for (const [facet, items] of Object.entries(byFacet)) expect(items.length, facet).toBe(4)
  })

  it('gives every item a text, a domain, a keying and an IPIP code', () => {
    for (const i of IPIP_NEO_120) {
      expect(i.en.length, i.code).toBeGreaterThan(4)
      expect(i.en.endsWith('.'), i.en).toBe(true)
      expect(DOMAINS, i.code).toContain(i.domain)
      expect([1, -1], i.code).toContain(i.keyed)
      expect(i.code, i.en).toMatch(/^ipip_[A-Z]\d+$/)
    }
  })

  it('carries Vedel s Danish for all 120', () => {
    expect(IPIP_NEO_120.filter((i) => i.da).length).toBe(120)
  })

  it('repeats no item', () => {
    const seen = new Set(IPIP_NEO_120.map((i) => i.en))
    expect(seen.size).toBe(120)
  })
})

describe('IPIP-NEO-60', () => {
  it('has thirty facets of two items', () => {
    expect(IPIP_NEO_60).toHaveLength(60)
    const byFacet = {}
    for (const i of IPIP_NEO_60) (byFacet[i.facet] ||= []).push(i)
    expect(Object.keys(byFacet)).toHaveLength(30)
    for (const [facet, items] of Object.entries(byFacet)) expect(items.length, facet).toBe(2)
  })

  it('gives every item a text, a domain and a keying', () => {
    for (const i of IPIP_NEO_60) {
      expect(i.en.length, i.en).toBeGreaterThan(4)
      expect(i.en.endsWith('.'), i.en).toBe(true)
      expect(DOMAINS, i.en).toContain(i.domain)
      expect([1, -1], i.en).toContain(i.keyed)
    }
  })

  it('is not a subset of the 120, which is why translations do not simply cascade', () => {
    // 51 of the 60 also appear in the 120. The other 9 were selected by IRT
    // from the wider pool, so a translation of the 120 does not cover them.
    const in120 = new Set(IPIP_NEO_120.map((i) => i.en.toLowerCase()))
    const shared = IPIP_NEO_60.filter((i) => in120.has(i.en.toLowerCase()))
    expect(shared.length).toBe(51)
    // Nine items are in the 60 and not in the 120, so a full translation of
    // the 120 still leaves those nine to do.
  })

  it('keys per item, not per facet, because seven facets hold both directions', () => {
    const pos = new Set(IPIP_NEO_60.filter((i) => i.keyed === 1).map((i) => i.facet))
    const neg = new Set(IPIP_NEO_60.filter((i) => i.keyed === -1).map((i) => i.facet))
    const mixed = [...pos].filter((f) => neg.has(f)).sort()
    expect(mixed).toEqual(['c2', 'c3', 'c5', 'e2', 'o2', 'o3', 'o6'])
  })

  it('leaves no parsing debris in an item', () => {
    for (const i of IPIP_NEO_60) expect(i.en, i.en).not.toMatch(/keyed|Alpha|\d{4}/)
  })

  it('uses the same thirty facet codes as the 120', () => {
    const a = new Set(IPIP_NEO_120.map((i) => i.facet))
    const b = new Set(IPIP_NEO_60.map((i) => i.facet))
    expect([...b].sort()).toEqual([...a].sort())
  })
})
