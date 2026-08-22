import { describe, it, expect } from 'vitest'
import { FQ_ITEMS, FQ_DOMAIN_META } from '../first-quarter'
import { IPIP_NEO_60 } from '../reference/ipip-neo-60'

const FACET = { vigil:'n1',blaze:'n2',hollow:'n3',veil:'n4',surge:'n5',fracture:'n6',
  hearth:'e1',gather:'e2',command:'e3',drive:'e4',thrill:'e5',radiance:'e6',
  dream:'o1',craft:'o2',resonance:'o3',drift:'o4',prism:'o5',compass:'o6',
  faith:'a1',edge:'a2',gift:'a3',yield:'a4',shadow:'a5',shield:'a6',
  mastery:'c1',structure:'c2',oath:'c3',quest:'c4',will:'c5',counsel:'c6' }

describe('First Quarter is the IPIP-NEO-60', () => {
  it('has 60 items in 30 facets of 2', () => {
    expect(FQ_ITEMS).toHaveLength(60)
    const by = {}
    for (const i of FQ_ITEMS) (by[i.facet] ||= []).push(i)
    expect(Object.keys(by)).toHaveLength(30)
    for (const [f, v] of Object.entries(by)) expect(v.length, f).toBe(2)
  })

  it('every item is the published one, in the published facet and direction', () => {
    // Seven facets hold items keyed in both directions, so a published item
    // is matched on its own text rather than on its facet's sign.
    const ref = Object.fromEntries(IPIP_NEO_60.map(i => [i.en, i]))
    for (const it of FQ_ITEMS) {
      const c = ref[it.text.en]
      expect(c, `not a published item: ${it.text.en}`).toBeTruthy()
      expect(FACET[it.facet], it.text.en).toBe(c.facet)
      expect(it.reverse, it.text.en).toBe(c.keyed === -1)
    }
  })

  it('puts every facet under the domain its meta says', () => {
    for (const [dom, meta] of Object.entries(FQ_DOMAIN_META))
      for (const f of meta.facets)
        for (const it of FQ_ITEMS.filter(i => i.facet === f)) expect(it.domain).toBe(dom)
  })

  it('puts the item that proved the sets were never compared where it belongs', () => {
    // "Act without thinking" sat in Immoderation keyed forward, adding to
    // Depth. It is published in Cautiousness keyed reverse, subtracting from
    // Discipline: it crossed both domain and sign, in both instruments, in
    // every response collected before 2026-08-22.
    const it_ = FQ_ITEMS.find((i) => i.text.en === 'Act without thinking.')
    expect(it_).toBeTruthy()
    expect(it_.facet).toBe('counsel')
    expect(it_.domain).toBe('discipline')
    expect(it_.reverse).toBe(true)
  })
})

describe('the French political item', () => {
  it('is not transposed, as it is in the published table it came from', () => {
    const it_ = FQ_ITEMS.find((i) => i.text.en === 'Tend to vote for liberal political candidates.')
    expect(it_.text['fr-CA']).toContain('libérales')
  })
})
