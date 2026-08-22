import { describe, it, expect } from 'vitest'
import { FM_ITEMS, FM_DOMAIN_META } from '../full-moon'
import { IPIP_NEO_120 } from '../reference/ipip-neo-120'

describe('Full Moon is now the IPIP-NEO-120', () => {
  it('has 120 items in 30 facets of 4', () => {
    expect(FM_ITEMS).toHaveLength(120)
    const by = {}
    for (const i of FM_ITEMS) (by[i.facet] ||= []).push(i)
    expect(Object.keys(by)).toHaveLength(30)
    for (const [f, v] of Object.entries(by)) expect(v.length, f).toBe(4)
  })
  it('every item is the published one, in the published facet and direction', () => {
    const FACET = { vigil:'n1',blaze:'n2',hollow:'n3',veil:'n4',surge:'n5',fracture:'n6',
      hearth:'e1',gather:'e2',command:'e3',drive:'e4',thrill:'e5',radiance:'e6',
      dream:'o1',craft:'o2',resonance:'o3',drift:'o4',prism:'o5',compass:'o6',
      faith:'a1',edge:'a2',gift:'a3',yield:'a4',shadow:'a5',shield:'a6',
      mastery:'c1',structure:'c2',oath:'c3',quest:'c4',will:'c5',counsel:'c6' }
    const ref = Object.fromEntries(IPIP_NEO_120.map(i => [i.en, i]))
    for (const it of FM_ITEMS) {
      const c = ref[it.text.en]
      expect(c, `not a published item: ${it.text.en}`).toBeTruthy()
      expect(FACET[it.facet], it.text.en).toBe(c.facet)
      expect(it.reverse, it.text.en).toBe(c.keyed === -1)
    }
  })
  it('every facet is in the domain meta, and the domain matches', () => {
    for (const [dom, meta] of Object.entries(FM_DOMAIN_META))
      for (const f of meta.facets)
        for (const it of FM_ITEMS.filter(i => i.facet === f)) expect(it.domain).toBe(dom)
  })
  it('carries Vedel s Danish on all 120', () => {
    expect(FM_ITEMS.filter(i => i.text.da).length).toBe(120)
  })
  it('puts the three misplaced items where they belong', () => {
    // Found on 2026-08-22 among the items we already shared with the
    // published instrument, which is why replacing text alone would not
    // have fixed them.
    const at = (en) => FM_ITEMS.find((i) => i.text.en === en)
    expect(at('Act without thinking.')).toMatchObject({ facet: 'counsel', domain: 'discipline', reverse: true })
    expect(at('Tell the truth.')).toMatchObject({ facet: 'oath', domain: 'discipline' })
    expect(at('Take advantage of others.')).toMatchObject({ facet: 'edge', domain: 'bond' })
  })

  it('ids are 1..120 with no gap', () => {
    expect(FM_ITEMS.map(i => i.id)).toEqual([...Array(120)].map((_, i) => i + 1))
  })
})
