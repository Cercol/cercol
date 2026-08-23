// Spec: src/utils/witness-scoring.js
//
// The Witness task changed on 2026-08-04 from 20 rounds of two picks to 13
// rounds of three. SCIENCE.md and PRODUCT.md were corrected; the copy a
// person actually reads was not, in any of the six languages, for nineteen
// days. Five strings per language stated it, and a post-mortem from the same
// day had already logged the discrepancy.
import { describe, expect, it } from 'vitest'
import { TOTAL_ROUNDS } from '../../utils/witness-scoring'

const LANGS = ['en', 'ca', 'es', 'fr', 'de', 'da']
const ROUND_WORD = /(rounds|rondes|rondas|tours|séries|Runden|runder)/i

describe('what the copy says the Witness task is', () => {
  it('never states a round count the code does not have', async () => {
    for (const lang of LANGS) {
      const { default: d } = await import(`../${lang}.json`)
      const flat = JSON.stringify(d)
      // Any number immediately before a word for "rounds" must be the real one.
      for (const m of flat.matchAll(new RegExp(`(\\d+)\\s*${ROUND_WORD.source}`, 'gi'))) {
        expect(Number(m[1]), `${lang} says "${m[0]}" and the code says ${TOTAL_ROUNDS}`)
          .toBe(TOTAL_ROUNDS)
      }
    }
  })

  it('describes three picks, since two cannot rank five words', async () => {
    // A round takes best, second and worst: RANK_WEIGHT in witness-scoring.js.
    // These are the five strings that describe the task.
    const KEYS = [
      ['faq', 'q11', 'a'], ['faq', 'q3', 'a'],
      ['science', 'fullMoon', 'witness', 'body'],
      ['instruments', 'fullMoon', 'part2', 'howBody'],
      ['witness', 'page', 'intro', 'body'],
    ]
    const SECOND = /(second|segon|segund|deuxième|ensuite|zweit|næstbed)/i
    for (const lang of LANGS) {
      const { default: d } = await import(`../${lang}.json`)
      for (const path of KEYS) {
        const s = path.reduce((o, k) => o?.[k], d)
        expect(s, `${lang}.${path.join('.')} is missing`).toBeTruthy()
        expect(SECOND.test(s), `${lang}.${path.join('.')} does not mention the second pick`).toBe(true)
      }
    }
  })
})
