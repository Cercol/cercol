/**
 * Language varieties.
 *
 * The published translations are not written in one variety per language:
 * Gravel's French is Canadian, the Spanish IPIP-NEO-120 is Mexican. Rather
 * than edit a published instrument until it stops being one, each source is
 * kept intact and the variety is declared. An adapted variant stores only the
 * strings it changes, so the file shows the difference.
 */
import { describe, it, expect } from 'vitest'
import { VARIANTS, variantsFor, activeVariant, itemText, answeredIn } from '../instrument-variants'
import { FM_ITEMS } from '../full-moon'
import { FQ_ITEMS } from '../first-quarter'
import { FQ_ITEMS } from '../first-quarter'

describe('the variant registry', () => {
  it('says where every variant text comes from', () => {
    for (const [lang, list] of Object.entries(VARIANTS))
      for (const v of list) {
        expect(v.code, lang).toMatch(/^[a-z]{2}-[A-Z]{2}$/)
        expect(['published', 'adapted'], v.code).toContain(v.provenance)
        expect(v.source.length, v.code).toBeGreaterThan(40)
      }
  })

  it('offers a choice only where there is more than one variety', () => {
    expect(variantsFor('fr').map((v) => v.code)).toEqual(['fr-FR', 'fr-CA'])
    expect(variantsFor('es')).toHaveLength(0)   // one variety, so no picker
    expect(variantsFor('ca')).toHaveLength(0)
  })

  it('ignores a variant a reader could not have chosen', () => {
    expect(activeVariant('fr', 'es-MX')).toBe('fr-FR')
    expect(activeVariant('fr', 'nonsense')).toBe('fr-FR')
  })
})

describe('resolving an item', () => {
  const t = { en: 'Work hard.', 'fr-CA': 'Je travaille fort.', 'fr-FR': 'Je travaille dur.' }
  const u = { en: 'Trust others.', 'fr-CA': 'Je fais confiance aux autres.' }

  it('gives each reader their own variety where it differs', () => {
    expect(itemText(t, 'fr')).toBe('Je travaille dur.')
    expect(itemText(t, 'fr', 'fr-CA')).toBe('Je travaille fort.')
  })

  it('falls through to the published text where the adaptation changed nothing', () => {
    expect(itemText(u, 'fr')).toBe('Je fais confiance aux autres.')
  })

  it('shows English rather than an invented sentence', () => {
    expect(itemText(u, 'de')).toBe('Trust others.')
  })
})

describe('what the items actually carry', () => {
  it('has Gravel on every French item of both instruments', () => {
    expect(FM_ITEMS.filter((i) => i.text['fr-CA'])).toHaveLength(120)
    expect(FQ_ITEMS.filter((i) => i.text['fr-CA'])).toHaveLength(60)
  })

  it('stores only the strings the European adaptation changes', () => {
    // If this ever equals the item count, someone has copied the whole
    // translation instead of adapting it, and the diff stops being readable.
    expect(FM_ITEMS.filter((i) => i.text['fr-FR']).length).toBeLessThan(120)
    expect(FQ_ITEMS.filter((i) => i.text['fr-FR']).length).toBeLessThan(60)
  })

  it('resolves every item for a French reader of either variety', () => {
    for (const items of [FM_ITEMS, FQ_ITEMS])
      for (const i of items) {
        expect(itemText(i.text, 'fr'), i.text.en).not.toBe(i.text.en)
        expect(itemText(i.text, 'fr', 'fr-CA'), i.text.en).not.toBe(i.text.en)
      }
  })

  it('does not call a European reader liberal where the English means progressive', () => {
    // In European French "libéral" reads as pro-market and right-leaning, so
    // Gravel's wording would attract exactly the respondents this positively
    // keyed item is meant to score low.
    const en = 'Tend to vote for liberal political candidates.'
    const it_ = FM_ITEMS.find((i) => i.text.en === en)
    expect(itemText(it_.text, 'fr')).toContain('progressistes')
    expect(itemText(it_.text, 'fr', 'fr-CA')).toContain('libérales')
  })
})

describe('what gets recorded', () => {
  it('records the variety the items were actually read in', () => {
    expect(answeredIn('fr', null)).toBe('fr-FR')
    expect(answeredIn('fr', 'fr-CA')).toBe('fr-CA')
    expect(answeredIn('es', null)).toBe('es-MX')
    expect(answeredIn('ca', null)).toBe('ca')
  })
})

describe('the political item, in every language that has one', () => {
  it('never calls the reader liberal where the English means progressive', () => {
    // Four philologists, working separately on Catalan, French, German and
    // the European French adaptation, all reached this independently: in
    // Catalan, French and German "liberal" names the pro-market centre-right,
    // the opposite of the sense this positively keyed Liberalism item has.
    // Left literal it would attract exactly the respondents it scores low.
    const it_ = FM_ITEMS.find((i) => i.text.en === 'Tend to vote for liberal political candidates.')
    expect(it_.text.ca).toContain('progressistes')
    expect(it_.text['fr-FR']).toContain('progressistes')
    expect(it_.text.de).toContain('progressive')
    // Gravel's Canadian keeps his wording: it is a published translation and
    // "libéral" carries the Canadian party sense he was writing for.
    expect(it_.text['fr-CA']).toContain('libérales')
  })

  it('leaves the conservative partner alone, because it needed nothing', () => {
    const it_ = FM_ITEMS.find((i) => i.text.en === 'Tend to vote for conservative political candidates.')
    expect(it_.text['fr-FR']).toBeUndefined()   // no override: Gravel's reads correctly in Europe
    expect(it_.text['fr-CA']).toContain('traditionnelles')
  })
})

describe('no language is half in English any more', () => {
  it('has every item in Catalan, French and German', () => {
    for (const items of [FM_ITEMS, FQ_ITEMS])
      for (const key of ['ca', 'de', 'fr-CA'])
        expect(items.filter((i) => i.text[key]).length, key).toBe(items.length)
  })

  it('is short only where the published source is short, and by how much', () => {
    // Spanish and Danish come from published translations that do not cover
    // every item of both instruments. Those gaps fall back to English rather
    // than to something invented, and the counts are pinned so a gap that
    // grows is noticed.
    expect(FM_ITEMS.filter((i) => i.text['es-MX']).length).toBe(118)
    expect(FQ_ITEMS.filter((i) => i.text['es-MX']).length).toBe(52)
    expect(FM_ITEMS.filter((i) => i.text.da).length).toBe(120)
    expect(FQ_ITEMS.filter((i) => i.text.da).length).toBe(53)
  })
})
