import { describe, it, expect } from 'vitest'
import { locs, split, languageCoverage, LANGS } from '../validate_sitemap.mjs'

describe('validate_sitemap', () => {
  it('reads locs as site-relative paths', () => {
    const xml = '<url><loc>https://cercol.team/de/blog/a/</loc></url><url><loc>https://cercol.team/blog/a/</loc></url>'
    expect(locs(xml)).toEqual(['/de/blog/a/', '/blog/a/'])
  })
  it('treats an unprefixed path as English', () => {
    expect(split('/blog/a/')).toEqual({ lang: 'en', rest: '/blog/a/' })
    expect(split('/de/blog/a/')).toEqual({ lang: 'de', rest: '/blog/a/' })
    // A slug that starts with a locale code is not a locale prefix.
    expect(split('/blog/de-facto-leadership/')).toEqual({ lang: 'en', rest: '/blog/de-facto-leadership/' })
  })
  it('names the languages an article is missing from', () => {
    const complete = LANGS.map((l) => (l === 'en' ? '/blog/a/' : `/${l}/blog/a/`))
    expect(languageCoverage(complete)).toEqual({ total: 1, incomplete: [] })
    // The bug this exists for: English only, the rest left to hreflang.
    const { incomplete } = languageCoverage(['/blog/a/'])
    expect(incomplete).toEqual([{ path: '/blog/a/', missing: ['ca', 'es', 'fr', 'de', 'da'] }])
  })
})
