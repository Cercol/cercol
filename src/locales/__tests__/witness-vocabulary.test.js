/**
 * The peer instrument is called Witness, and in each language it has one
 * name: Testimoni, Testigo, Témoin, Zeuge, Vidne. CLAUDE.md forbids
 * "observer" for it anywhere.
 *
 * Both halves of that rule were being broken in the shipped copy: Catalan
 * called the participants "witnesses" in English in five strings, and
 * Catalan, Spanish and French all called them "observers" in the very
 * sentence that explains what a Witness is. German and Danish had it right,
 * which is why this test exists rather than a note in a document.
 *
 * The guard is deliberately scoped to the witnessResults block. Elsewhere,
 * "observador" describes a person who observes and "observere" is an ordinary
 * Danish verb; a blunter rule would fail on correct copy and be deleted.
 */
import { describe, it, expect } from 'vitest'

import en from '../en.json'
import ca from '../ca.json'
import es from '../es.json'
import fr from '../fr.json'
import de from '../de.json'
import da from '../da.json'

const LOCALES = { en, ca, es, fr, de, da }
const OBSERVER = /observ(ador|adores|ateur|ateurs|atør|atører|er|ers)\b|Beobachter/i

const strings = (obj, path = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? strings(v, `${path}${k}.`) : [[`${path}${k}`, String(v)]],
  )

describe('the Witness instrument keeps its name', () => {
  it('is never called an observer, in any language', () => {
    for (const [lang, dict] of Object.entries(LOCALES)) {
      for (const [key, value] of strings(dict.witnessResults, 'witnessResults.')) {
        expect(OBSERVER.test(value), `${lang}.${key}: ${value}`).toBe(false)
      }
    }
  })

  it('is never left in English in a language that has its own word', () => {
    for (const [lang, dict] of Object.entries(LOCALES)) {
      if (lang === 'en') continue
      for (const [key, value] of strings(dict.witnessResults, 'witnessResults.')) {
        expect(/\bwitness(es)?\b/i.test(value), `${lang}.${key}: ${value}`).toBe(false)
      }
    }
  })
})
