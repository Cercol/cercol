/**
 * The response scale.
 *
 * The IPIP-NEO norms were collected on an accuracy scale with all five points
 * verbalised. Cèrcol scores against those norms, so the scale is part of the
 * instrument and not a matter of taste. Every string here was either taken
 * from a publisher or passed by a native-speaker philologist on 2026-08-22.
 */
import { describe, it, expect } from 'vitest'
import en from '../en.json'
import ca from '../ca.json'
import es from '../es.json'
import fr from '../fr.json'
import de from '../de.json'
import da from '../da.json'
import { FQ_SCALE_LABELS } from '../../data/first-quarter'
import { FM_SCALE_LABELS } from '../../data/full-moon'

const LOCALES = { en, ca, es, fr, de, da }

describe('the 5-point scale', () => {
  it('has five points in every language', () => {
    for (const [lang, d] of Object.entries(LOCALES))
      expect(Object.keys(d.scale).sort(), lang).toEqual(['1', '2', '3', '4', '5'])
  })

  it('is an accuracy scale, not an agreement one', () => {
    // The agreement wording is what the norms were NOT collected on.
    const agreement = /agree|acord|acuerdo|d'accord|stimme|enig/i
    for (const [lang, d] of Object.entries(LOCALES))
      for (const [point, label] of Object.entries(d.scale))
        expect(label, `${lang} scale.${point}: ${label}`).not.toMatch(agreement)
  })

  it('qualifies both interior points, which is where the French scale broke', () => {
    // Points 2 and 4 lost their intensity qualifier in French, so they read
    // stronger than the English and the scale stopped being equidistant.
    for (const [lang, d] of Object.entries(LOCALES)) {
      expect(d.scale['2'].split(' ').length, `${lang} scale.2`).toBeGreaterThan(1)
      expect(d.scale['4'].split(' ').length, `${lang} scale.4`).toBeGreaterThan(1)
    }
  })

  it('mirrors point 2 against point 4, and point 1 against point 5', () => {
    // The qualifier must be the same on both sides of the midpoint, or the
    // halves are not equally spaced whatever the words are.
    for (const [lang, d] of Object.entries(LOCALES)) {
      const q = (s) => s.split(' ').slice(0, -1).join(' ').toLowerCase()
      expect(q(d.scale['1']), `${lang} poles`).toBe(q(d.scale['5']))
      expect(q(d.scale['2']), `${lang} inner`).toBe(q(d.scale['4']))
    }
  })

  it('names the dimension at the midpoint rather than saying "neutral"', () => {
    for (const [lang, d] of Object.entries(LOCALES))
      expect(d.scale['3'].split(' ').length, `${lang} scale.3: ${d.scale['3']}`).toBeGreaterThan(2)
  })

  it('keeps the English fallbacks in step with the English locale', () => {
    // useScaleLabels falls back to these. Left on the agreement wording, a
    // missing key would render an agreement anchor inside an accuracy scale
    // with no error at all.
    for (const point of [1, 2, 3, 4, 5]) {
      expect(FQ_SCALE_LABELS[point]).toBe(en.scale[String(point)])
      expect(FM_SCALE_LABELS[point]).toBe(en.scale[String(point)])
    }
  })

  it('leaves New Moon on its own 7-point agreement scale', () => {
    // New Moon is the TIPI, which is genuinely an agreement instrument and is
    // scored against different norms. It must not be dragged along.
    for (const [lang, d] of Object.entries(LOCALES))
      expect(Object.keys(d.scale7), lang).toHaveLength(7)
    expect(en.scale7['1'].toLowerCase()).toContain('disagree')
  })

  it('orders the German 7-point steps correctly', () => {
    // scale7.2 and .6 used "mäßig", which reads as mediocre rather than
    // moderate, so point 6 came out weaker than point 5.
    expect(de.scale7['2']).not.toContain('mäßig')
    expect(de.scale7['6']).not.toContain('mäßig')
  })
})

describe('the item label', () => {
  it('is a bare noun that can take a number after it', () => {
    // QuestionCard renders `{prefix} {index}`. The old value was a relative
    // clause, so it rendered as "I see myself as someone who 12" — and in
    // Catalan, Spanish, French and German it could never govern the item,
    // which is a complete first-person sentence.
    for (const [lang, d] of Object.entries(LOCALES))
      for (const inst of ['fq', 'fm'])
        expect(d[inst].itemPrefix.split(' ').length, `${lang} ${inst}.itemPrefix`).toBe(1)
  })

  it('leaves New Moon its carrier stem, which does compose there', () => {
    // New Moon items are adjective pairs, so the stem completes them.
    expect(en.newMoon.itemPrefix.split(' ').length).toBeGreaterThan(1)
  })
})
