import { describe, it, expect } from 'vitest'
import { rotateFacets } from '../administration-order'
import { FQ_ITEMS } from '../../data/first-quarter'
import { FM_ITEMS } from '../../data/full-moon'
import { INSTRUMENT_DOMAIN_ORDER } from '../../data/domains'

const blocks = (items) =>
  INSTRUMENT_DOMAIN_ORDER.map((d) => rotateFacets(items.filter((it) => it.domain === d)))

describe('administration order', () => {
  it.each([
    ['First Quarter', FQ_ITEMS],
    ['Full Moon', FM_ITEMS],
  ])('%s: no two consecutive items probe the same facet, nothing lost', (_name, items) => {
    for (const block of blocks(items)) {
      for (let i = 1; i < block.length; i++) {
        expect(block[i].facet).not.toBe(block[i - 1].facet)
      }
    }
    const flat = blocks(items).flat()
    expect(flat.map((it) => it.id).sort((a, b) => a - b))
      .toEqual(items.map((it) => it.id).sort((a, b) => a - b))
  })
})
