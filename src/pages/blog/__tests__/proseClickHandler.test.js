// Spec: src/pages/blog/BlogArticlePage.jsx
//
// Guards the prose-link funnel tracking (plan step tc7). The article
// bodies carry hundreds of in-prose links to the homepage, /instruments
// and the instrument pages, and none of them fired a funnel event: the
// "reads gave 6 clicks" verdict counted only the BlogTestCTA cards.
// These tests fail if the classifier stops recognising the destinations,
// if the handler stops firing cta_click, or if the handler is unwired
// from the rendered body containers.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../lib/api', async (importOriginal) => {
  const mod = await importOriginal()
  return { ...mod, trackEvent: vi.fn() }
})

import { trackEvent } from '../../../lib/api'
import { proseDestination, proseClickHandler } from '../BlogArticlePage.jsx'

// A click event whose target sits inside a link with this href.
const clickOn = (href) => ({
  target: { closest: () => ({ getAttribute: () => href }) },
})

describe('proseDestination', () => {
  it('classifies the three families the plan step names', () => {
    expect(proseDestination('/')).toBe('home')
    expect(proseDestination('/instruments/')).toBe('instruments')
    expect(proseDestination('/new-moon/')).toBe('new-moon')
    expect(proseDestination('/first-quarter')).toBe('first-quarter')
    expect(proseDestination('/full-moon/')).toBe('full-moon')
    expect(proseDestination('/last-quarter/')).toBe('last-quarter')
  })

  it('sees through a language prefix', () => {
    expect(proseDestination('/fr/first-quarter/')).toBe('first-quarter')
    expect(proseDestination('/de/instruments/')).toBe('instruments')
    expect(proseDestination('/ca/')).toBe('home')
    expect(proseDestination('/da')).toBe('home')
  })

  it('accepts absolute cercol.team URLs, the form the bodies link the homepage with', () => {
    expect(proseDestination('https://cercol.team')).toBe('home')
    expect(proseDestination('https://cercol.team/')).toBe('home')
    expect(proseDestination('https://cercol.team/instruments/')).toBe('instruments')
    expect(proseDestination('https://www.cercol.team/es/new-moon/')).toBe('new-moon')
  })

  it('ignores everything that is not a bridge', () => {
    expect(proseDestination('/blog/critiques-of-the-big-five/')).toBe(null)
    expect(proseDestination('/fr/blog/')).toBe(null)
    expect(proseDestination('/science/')).toBe(null)
    expect(proseDestination('/instruments/deep-dive/')).toBe(null)
    expect(proseDestination('#method')).toBe(null)
    expect(proseDestination('https://en.wikipedia.org/wiki/Big_Five')).toBe(null)
    expect(proseDestination('mailto:hello@cercol.team')).toBe(null)
    expect(proseDestination('')).toBe(null)
    expect(proseDestination(null)).toBe(null)
  })

  it('is not fooled by a query string or fragment', () => {
    expect(proseDestination('/first-quarter/?utm_source=x')).toBe('first-quarter')
    expect(proseDestination('/instruments#full-moon')).toBe('instruments')
  })
})

describe('proseClickHandler', () => {
  beforeEach(() => {
    trackEvent.mockClear()
  })

  it('fires cta_click with the prose-prefixed destination, keeping slug as the article slug', () => {
    proseClickHandler('critiques-of-the-big-five', 'fr')(clickOn('/fr/first-quarter/'))
    expect(trackEvent).toHaveBeenCalledTimes(1)
    const [name, payload] = trackEvent.mock.calls[0]
    expect(name).toBe('cta_click')
    // slug stays the article slug: the daily brief's per-article click
    // count groups cta_click by slug and must keep matching.
    expect(payload.slug).toBe('critiques-of-the-big-five')
    expect(payload.lang).toBe('fr')
    expect(payload.instrument).toBe('prose:first-quarter')
  })

  it('tells the homepage and /instruments apart from the instrument pages', () => {
    const handle = proseClickHandler('some-article', 'en')
    handle(clickOn('https://cercol.team'))
    handle(clickOn('/instruments/'))
    expect(trackEvent.mock.calls.map(([, p]) => p.instrument))
      .toEqual(['prose:home', 'prose:instruments'])
  })

  it('stays silent on links that recirculate inside the blog', () => {
    proseClickHandler('some-article', 'en')(clickOn('/blog/other-article/'))
    expect(trackEvent).not.toHaveBeenCalled()
  })

  it('stays silent on clicks that are not on a link', () => {
    proseClickHandler('some-article', 'en')({ target: { closest: () => null } })
    expect(trackEvent).not.toHaveBeenCalled()
  })

  it('is wired to every rendered body container', () => {
    // The handler only counts if the containers carry it. jsdom is not in
    // the toolchain, so guard the wiring the way the repo guards other
    // invariants: read the source. Three containers render article HTML
    // (intro, rest, and the no-intro fallback); all three must delegate.
    const source = readFileSync(
      fileURLToPath(new URL('../BlogArticlePage.jsx', import.meta.url)),
      'utf8',
    )
    const wired = source.match(/onClick={onProseClick}/g) || []
    expect(wired.length).toBe(3)
    expect(source).toMatch(/const onProseClick = proseClickHandler\(slug, urlLang\)/)
  })
})
