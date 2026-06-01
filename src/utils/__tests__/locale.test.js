// Spec: src/utils/locale.js
//
// Locale path helpers underpin path-based multilingual routing (Phase
// 17.11): the router language sync, usePageMeta canonical/hreflang, and the
// LanguageToggle navigation all funnel through these. Testing them here
// covers that shared logic without needing a DOM (vitest env is node).

import { describe, expect, it } from 'vitest'

import {
  localeFromPath,
  stripLocale,
  localizedPath,
  localeForCanonical,
} from '../locale.js'

describe('localeFromPath', () => {
  it('returns en for unprefixed paths', () => {
    expect(localeFromPath('/')).toBe('en')
    expect(localeFromPath('/about')).toBe('en')
    expect(localeFromPath('/blog/some-slug')).toBe('en')
  })
  it('detects a leading locale segment', () => {
    expect(localeFromPath('/es')).toBe('es')
    expect(localeFromPath('/es/about')).toBe('es')
    expect(localeFromPath('/da/blog/x')).toBe('da')
  })
  it('does not treat a non-locale segment as a locale', () => {
    expect(localeFromPath('/en/about')).toBe('en') // en has no prefix
    expect(localeFromPath('/instruments')).toBe('en')
  })
})

describe('stripLocale', () => {
  it('removes a locale prefix', () => {
    expect(stripLocale('/es/about')).toBe('/about')
    expect(stripLocale('/da/blog/x')).toBe('/blog/x')
  })
  it('maps a bare locale to root', () => {
    expect(stripLocale('/es')).toBe('/')
  })
  it('leaves unprefixed paths untouched', () => {
    expect(stripLocale('/about')).toBe('/about')
    expect(stripLocale('/')).toBe('/')
  })
})

describe('localizedPath', () => {
  it('prefixes non-English locales', () => {
    expect(localizedPath('/about', 'es')).toBe('/es/about')
    expect(localizedPath('/', 'es')).toBe('/es')
  })
  it('leaves English unprefixed', () => {
    expect(localizedPath('/about', 'en')).toBe('/about')
    expect(localizedPath('/', 'en')).toBe('/')
  })
  it('round-trips with stripLocale (language switch on /es/about -> ca)', () => {
    // The exact LanguageToggle behaviour: from /es/about switching to ca.
    expect(localizedPath(stripLocale('/es/about'), 'ca')).toBe('/ca/about')
    // ... and switching back to English drops the prefix.
    expect(localizedPath(stripLocale('/es/about'), 'en')).toBe('/about')
  })
})

describe('localeForCanonical', () => {
  it('prefers the path prefix', () => {
    expect(localeForCanonical('/es/about', '')).toBe('es')
    expect(localeForCanonical('/es/about', '?lang=fr')).toBe('es')
  })
  it('honours ?lang= on an unprefixed path (canonical points to /<lang>/)', () => {
    expect(localeForCanonical('/about', '?lang=es')).toBe('es')
    expect(localeForCanonical('/', '?lang=da')).toBe('da')
  })
  it('falls back to en', () => {
    expect(localeForCanonical('/about', '')).toBe('en')
    expect(localeForCanonical('/about', '?lang=zz')).toBe('en')
  })
})
