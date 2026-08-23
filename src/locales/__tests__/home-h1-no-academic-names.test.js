// Spec: src/locales/en.json
//
// CLAUDE.md forbids academic instrument names in src/locales/*.json. The h1
// is the one string on the homepage allowed to be a full sentence, and the
// positioning it now carries ("built from published questions that name
// their source") is the same claim without the forbidden words. This test is
// the thing that stops the words creeping back when someone reaches for the
// shorter phrasing.
import { describe, expect, it } from 'vitest'

const LANGS = ['en', 'ca', 'es', 'fr', 'de', 'da']
const BANNED = ['Big Five', 'OCEAN', 'IPIP', 'NEO-PI', 'AB5C']

describe('the homepage strings', () => {
  it('never names an academic instrument', async () => {
    for (const lang of LANGS) {
      const { default: d } = await import(`../${lang}.json`)
      for (const key of ['h1', 'subtitle']) {
        for (const word of BANNED) {
          expect(d.home[key], `${lang}.home.${key} carries "${word}"`).not.toContain(word)
        }
      }
    }
  })

  it('keeps the subtitle short enough to survive as a page title', async () => {
    // HomePage composes the localized <title> as `Cèrcol — ${home.subtitle}`
    // and uses the same string as the meta description.
    for (const lang of LANGS) {
      const { default: d } = await import(`../${lang}.json`)
      const title = `Cèrcol — ${d.home.subtitle}`
      expect(title.length, `${lang} title is ${title.length} chars`).toBeLessThanOrEqual(70)
    }
  })
})
