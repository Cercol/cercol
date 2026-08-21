/**
 * Every locale must carry its own <title> and meta description.
 *
 * The blog index shipped the English pair on all six URLs for months: only
 * the canonical, the hreflang set and the body copy changed per locale, and
 * the two tags a search engine leans on hardest were byte-identical. Search
 * Console filed /fr/blog/ as "crawled - currently not indexed", which is what
 * a page that looks like a duplicate of /blog/ gets.
 *
 * The guard is deliberately blunt: for every seo.* page, no two languages may
 * share a title or a description. A hardcoded English string reintroduced in
 * a component would not be caught here, but a locale file that quietly copies
 * English across would be, and that is the shape the mistake takes.
 */
import { describe, it, expect } from 'vitest'

import en from '../en.json'
import ca from '../ca.json'
import es from '../es.json'
import fr from '../fr.json'
import de from '../de.json'
import da from '../da.json'

const LOCALES = { en, ca, es, fr, de, da }
const PAGES = Object.keys(en.seo)

describe('seo.* titles and descriptions', () => {
  it('defines every page in every language', () => {
    for (const [lang, dict] of Object.entries(LOCALES)) {
      for (const page of PAGES) {
        expect(dict.seo?.[page]?.title, `${lang}.seo.${page}.title`).toBeTruthy()
        expect(dict.seo?.[page]?.description, `${lang}.seo.${page}.description`).toBeTruthy()
      }
    }
  })

  it('gives the blog index six distinct titles and descriptions', () => {
    for (const field of ['title', 'description']) {
      const values = Object.values(LOCALES).map((d) => d.seo.blog[field])
      expect(new Set(values).size, `seo.blog.${field} is shared between languages`)
        .toBe(values.length)
    }
  })

  it('never repeats one language of a page in another', () => {
    for (const page of PAGES) {
      for (const field of ['title', 'description']) {
        const values = Object.values(LOCALES).map((d) => d.seo[page][field])
        expect(new Set(values).size, `seo.${page}.${field} is shared between languages`)
          .toBe(values.length)
      }
    }
  })

  it('keeps em dashes out of the copy', () => {
    for (const [lang, dict] of Object.entries(LOCALES)) {
      for (const page of PAGES) {
        for (const field of ['title', 'description']) {
          expect(dict.seo[page][field], `${lang}.seo.${page}.${field}`).not.toContain('—')
        }
      }
    }
  })
})
