// Spec: src/lib/navigation.js
//
// navHref prefixes only destinations that exist as a per-locale route.
// Until 2026-09-12 it prefixed everything, so every localized page linked
// /fr/new-moon/, /es/first-quarter/ and eighteen siblings that no route
// serves: the reader got the 404 page and Search Console reported the URLs
// as "discovered - currently not indexed". English-only destinations now
// carry the language as ?lang=, which useLocaleSync honours.
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, expect, it } from 'vitest'

import { LOCALES, LOCALIZED_PATHS, navHref } from '../navigation'

describe('navHref', () => {
  it('prefixes destinations that have a per-locale route', () => {
    expect(navHref({ to: '/instruments' }, 'fr')).toBe('/fr/instruments')
    expect(navHref({ to: '/blog' }, 'de')).toBe('/de/blog')
    expect(navHref({ to: '/blog/some-article' }, 'da')).toBe('/da/blog/some-article')
    expect(navHref({ to: '/sample/full-moon' }, 'es')).toBe('/es/sample/full-moon')
    expect(navHref({ to: '/' }, 'fr')).toBe('/fr/')
  })

  it('sends English-only destinations through ?lang=, never a phantom prefix', () => {
    for (const lang of LOCALES) {
      expect(navHref({ to: '/new-moon' }, lang)).toBe(`/new-moon?lang=${lang}`)
      expect(navHref({ to: '/first-quarter' }, lang)).toBe(`/first-quarter?lang=${lang}`)
      expect(navHref({ to: '/full-moon' }, lang)).toBe(`/full-moon?lang=${lang}`)
      expect(navHref({ to: '/groups' }, lang)).toBe(`/groups?lang=${lang}`)
    }
  })

  it('leaves English and unknown languages on the bare path', () => {
    expect(navHref({ to: '/new-moon' }, 'en')).toBe('/new-moon')
    expect(navHref({ to: '/instruments' }, 'en')).toBe('/instruments')
    expect(navHref({ to: '/first-quarter' }, 'pt')).toBe('/first-quarter')
    expect(navHref({ to: '/faq' }, undefined)).toBe('/faq')
  })

  it('stays in sync with the routes App.jsx declares per locale', () => {
    // LOCALIZED_PATHS promises a real /<lang> route for every entry. The
    // routes themselves are declared from TOP_LEVEL_PAGES in App.jsx (plus
    // home and the blog), so the two lists drifting apart is exactly the
    // 404-link bug coming back. Read the declaration from source, the same
    // way localized-instrument-links.test.js audits Link targets.
    const appSrc = readFileSync(resolve(__dirname, '../../App.jsx'), 'utf8')
    const block = appSrc.match(/const TOP_LEVEL_PAGES = \[([\s\S]*?)\n\]/)
    expect(block, 'TOP_LEVEL_PAGES not found in App.jsx').not.toBeNull()
    const declared = [...block[1].matchAll(/path:\s*'([^']+)'/g)].map((m) => m[1])
    expect(declared.length).toBeGreaterThan(0)
    const promised = LOCALIZED_PATHS.filter((p) => p !== '/' && p !== '/blog')
    expect([...promised].sort()).toEqual([...declared].sort())
  })
})
