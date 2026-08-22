// Spec: src/components/Footer.jsx
//
// Until 2026-08-22 the site had no footer, and the header's Science, Blog,
// About and FAQ links lived inside dropdown panels the prerender never
// opened. The live prerendered home page linked to exactly five paths, none
// of them the blog, in every language. 648 blog pages were reachable by a
// crawler only from each other.
//
// Rendered to static markup, no jsdom and no interaction: the same snapshot
// the prerender takes, which is the whole point of the assertion.

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import { createInstance } from 'i18next'
import { initReactI18next } from 'react-i18next'
import { describe, expect, it } from 'vitest'

import en from '../../locales/en.json'
import fr from '../../locales/fr.json'
import Footer from '../Footer.jsx'
import { NAV, NAV_LINKS, META_LINKS, navHref, isEntryActive, isHomePath } from '../../lib/navigation'

// A bare instance: src/i18n.js reads navigator.language at import time, and
// the language under test is the point of the second case anyway.
const i18n = createInstance()
await i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, fr: { translation: fr } },
  lng: 'en', fallbackLng: 'en', interpolation: { escapeValue: false },
})

const render = () =>
  renderToStaticMarkup(
    createElement(I18nextProvider, { i18n }, createElement(MemoryRouter, null, createElement(Footer))),
  )

describe('Footer', () => {
  it('links to every destination the site has, with no interaction', () => {
    const html = render()
    for (const link of NAV_LINKS) {
      expect(html, `footer does not link to ${link.key}`).toContain(`href="${navHref(link, 'en')}"`)
    }
    // The line under the sections, which HomePage used to own alone.
    // & is serialised as &amp; in the markup, which is what a crawler reads.
    for (const entry of META_LINKS) {
      const href = (entry.href || entry.to).replace(/&/g, '&amp;')
      expect(html, `footer does not link to ${entry.key}`).toContain(`href="${href}"`)
    }
  })

  it('follows the reader locale where the destination has one', async () => {
    await i18n.changeLanguage('fr')
    const html = render()
    // The blog is the one locale-prefixed entry today; see navHref.
    expect(html).toContain('href="/fr/blog"')
    expect(html).not.toContain('href="/blog"')
    await i18n.changeLanguage('en')
  })
})

describe('navigation is defined once', () => {
  it('flattens groups into destinations and leaves group labels out', () => {
    expect(NAV_LINKS.map((l) => l.key)).toEqual(['instruments', 'roles', 'science', 'blog', 'about', 'faq'])
    expect(NAV_LINKS.every((l) => l.to)).toBe(true)
  })
  it('prefixes only what is marked, and never English', () => {
    expect(navHref({ to: '/blog', localised: true }, 'de')).toBe('/de/blog')
    expect(navHref({ to: '/blog', localised: true }, 'en')).toBe('/blog')
    expect(navHref({ to: '/science' }, 'de')).toBe('/science')
    expect(navHref({ to: '/faq' }, undefined)).toBe('/faq')
  })
  it('marks a group active from any of its children', () => {
    const learn = NAV.find((e) => e.key === 'menuLearn')
    expect(isEntryActive(learn, '/science')).toBe(true)
    expect(isEntryActive(learn, '/fr/blog/what-is-a-facet/')).toBe(true)
    expect(isEntryActive(learn, '/roles')).toBe(false)
  })
})

// The home page manages its own full-bleed background; Layout only wraps
// internal pages in the 896px column. isHome matched '/' alone, so every
// locale home was rendered as an internal page and the instrument cards were
// crushed into a narrow band with white either side. Live for five languages
// out of six, and invisible to anyone loading the English home.
describe('isHomePath', () => {
  it('is the home in every language, with or without the trailing slash', () => {
    for (const p of ['/', '/ca', '/ca/', '/es/', '/fr/', '/de/', '/da/']) {
      expect(isHomePath(p), `${p} should be the home`).toBe(true)
    }
  })
  it('is not an internal page, in any language', () => {
    for (const p of ['/instruments/', '/blog/', '/ca/blog/', '/de/science/', '/ca/blog/what-is-a-facet/']) {
      expect(isHomePath(p), `${p} should not be the home`).toBe(false)
    }
  })
})
