// Spec: src/components/BlogTestCTA.jsx
//
// The two CTA variants send the reader to different instruments, the heading
// narrows to the article's own dimension when the slug names one, and the
// duplicated dimension names must match the locale files they mirror.
// Rendered to static markup (no jsdom needed).

import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import BlogTestCTA, { dimensionForSlug } from '../BlogTestCTA.jsx'

const html = (lang) =>
  renderToStaticMarkup(
    createElement(MemoryRouter, null, createElement(BlogTestCTA, { lang })),
  )

const htmlWith = (props) =>
  renderToStaticMarkup(
    createElement(MemoryRouter, null, createElement(BlogTestCTA, props)),
  )

describe('BlogTestCTA', () => {
  it('sends the early card to the two-minute test', () => {
    expect(htmlWith({ lang: 'en', compact: true })).toContain('href="/new-moon"')
  })

  it('sends the end-of-article card to the 60-item test', () => {
    // The reader who got this far has shown more commitment than the one who
    // saw the compact card, and First Quarter is the instrument that returns
    // a profile rather than an orientation.
    expect(html('en')).toContain('href="/first-quarter"')
    expect(html('en')).not.toContain('href="/new-moon"')
  })

  it('keeps a non-English reader in their language', () => {
    // A French reader who reached the end of a French article was handed an
    // English test, and /fr/first-quarter/ has existed all along.
    for (const lang of ['ca', 'es', 'fr', 'de', 'da']) {
      expect(htmlWith({ lang }), lang).toContain(`href="/${lang}/first-quarter"`)
      expect(htmlWith({ lang }), lang).toContain(`href="/${lang}/sample"`)
      expect(htmlWith({ lang, compact: true }), lang).toContain(`href="/${lang}/new-moon"`)
    }
    // English keeps the bare path, and an unknown language falls back to it.
    expect(htmlWith({ lang: 'en' })).toContain('href="/first-quarter"')
    expect(htmlWith({ lang: 'pt' })).toContain('href="/first-quarter"')
  })

  it('overrides the heading for a matching category (teams, en)', () => {
    const out = htmlWith({ lang: 'en', category: 'teams' })
    // Apostrophe is HTML-escaped in static markup; match around it.
    expect(out).toContain('See how you shift a team')
    expect(out).toContain('balance.')
    expect(out).not.toContain('See yourself in five dimensions.')
  })

  it('falls back to the generic heading for an unmapped category', () => {
    const out = htmlWith({ lang: 'en', category: 'science' })
    expect(out).toContain('See yourself in five dimensions.')
  })

  it('uses the localized category heading for es/fr/de/da (now mapped)', () => {
    expect(htmlWith({ lang: 'es', category: 'teams' }))
      .toContain('Mira cómo cambias el equilibrio de un equipo.')
    expect(htmlWith({ lang: 'de', category: 'leadership' }))
      .toContain('Sieh dein eigenes Führungsprofil.')
  })

  it('renders with a slug prop without breaking the link', () => {
    const out = htmlWith({ slug: 'some-article', lang: 'en' })
    expect(out).toContain('href="/first-quarter"')
    expect(out).toContain('See yourself in five dimensions.')
  })

  it('shows the English heading and button by default', () => {
    const out = html('en')
    expect(out).toContain('See yourself in five dimensions.')
    expect(out).toContain('Start the 60-item test')
  })

  it('shows locale-correct copy (ca)', () => {
    expect(html('ca')).toContain('en cinc dimensions.')
  })

  it('uses the corrected Danish character', () => {
    expect(htmlWith({ lang: 'da', compact: true })).toContain('gratis test')
    expect(html('da')).toContain('facetter')
  })

  it('falls back to English for an unknown locale', () => {
    expect(html('xx')).toContain('See yourself in five dimensions.')
  })
})

describe('dimensionForSlug', () => {
  it('maps the real dimension slugs in the corpus', () => {
    expect(dimensionForSlug('what-is-conscientiousness-the-most-consistent-predictor-of-job-performance')).toBe('discipline')
    expect(dimensionForSlug('conscientiousness-perfectionism-when-discipline-becomes-a-problem')).toBe('discipline')
    expect(dimensionForSlug('what-is-agreeableness-the-cooperative-dimension')).toBe('bond')
    expect(dimensionForSlug('low-agreeableness-in-leadership-when-directness-helps-and-when-it-harms')).toBe('bond')
    expect(dimensionForSlug('neuroticism-stress-resilience-at-work')).toBe('depth')
    expect(dimensionForSlug('what-is-openness-to-experience-creativity-curiosity-and-its-limits')).toBe('vision')
    expect(dimensionForSlug('what-openness-to-experience-means-for-team-innovation')).toBe('vision')
    expect(dimensionForSlug('what-is-extraversion-beyond-the-introvert-extrovert-binary')).toBe('presence')
    expect(dimensionForSlug('introversion-energy-management-science')).toBe('presence')
  })

  it('returns null for articles that are not about one dimension', () => {
    expect(dimensionForSlug('best-free-personality-tests-for-teams-2026')).toBe(null)
    expect(dimensionForSlug('personality-and-procrastination-what-research-says')).toBe(null)
    expect(dimensionForSlug(undefined)).toBe(null)
  })
})

describe('dimension headings', () => {
  it('names the dimension in the reader language, never the academic one', () => {
    const out = htmlWith({ lang: 'en', slug: 'neuroticism-stress-resilience-at-work', category: 'work' })
    expect(out).toContain('See your own Depth score.')
    // The product vocabulary rule: the academic name must not reach the copy
    // even though the slug that selected this heading is built from it.
    expect(out).not.toContain('Neuroticism')
    // And the dimension beats the category heading it would otherwise get.
    expect(out).not.toContain('See how you show up at work.')
  })

  it('localizes the dimension heading', () => {
    expect(htmlWith({ lang: 'ca', slug: 'what-is-openness-to-experience-creativity-curiosity-and-its-limits' }))
      .toContain('Mira la teua puntuació de Visió.')
    expect(htmlWith({ lang: 'de', slug: 'what-is-agreeableness-the-cooperative-dimension' }))
      .toContain('Sieh deinen eigenen Bindung-Wert.')
  })

  it('mirrors the dimension labels in the locale files exactly', () => {
    // DIMENSION_LABEL is duplicated in the component because it takes an
    // explicit lang rather than reading the i18n instance. This is the guard
    // that stops the copy drifting away from src/locales/*.json.
    const DOMAIN_KEY = {
      presence: 'extraversion',
      bond: 'agreeableness',
      discipline: 'conscientiousness',
      depth: 'negativeEmotionality',
      vision: 'openMindedness',
    }
    const src = readFileSync(new URL('../BlogTestCTA.jsx', import.meta.url), 'utf8')
    for (const lang of ['en', 'ca', 'es', 'fr', 'de', 'da']) {
      const locale = JSON.parse(
        readFileSync(new URL(`../../locales/${lang}.json`, import.meta.url), 'utf8'),
      )
      for (const [key, domainKey] of Object.entries(DOMAIN_KEY)) {
        const expected = locale.domains[domainKey].label
        const row = src.match(new RegExp(`^  ${key}:\\s*\\{(.*)\\},?$`, 'm'))
        expect(row, `${key} row not found in DIMENSION_LABEL`).toBeTruthy()
        const found = row[1].match(new RegExp(`\\b${lang}:\\s*'([^']*)'`))
        expect(found, `${key}.${lang} not found`).toBeTruthy()
        expect(found[1], `${key}.${lang} drifted from locales/${lang}.json`).toBe(expected)
      }
    }
  })
})

describe('facet articles', () => {
  it('promises facets to a facet reader, in every language', () => {
    const expected = {
      en: 'See your own 30 facets.', ca: 'Mira les teues 30 facetes.',
      es: 'Mira tus propias 30 facetas.', fr: 'D', de: 'Sieh deine eigenen 30 Facetten.',
      da: 'Se dine egne 30 facetter.',
    }
    for (const [lang, text] of Object.entries(expected)) {
      const out = htmlWith({ lang, slug: 'what-is-a-facet-in-personality-psychology' })
      expect(out, lang).toContain(text)
      expect(out, lang).toContain('30')
    }
  })

  it('lets a dimension match win over the facet pattern', () => {
    // An article about one dimension's facets is still best answered with
    // that dimension's score.
    const out = htmlWith({ lang: 'en', slug: 'conscientiousness-facets-explained' })
    expect(out).toContain('See your own Discipline score.')
    // "30 facets" also appears in the body copy, so assert on the heading.
    expect(out).not.toContain('See your own 30 facets.')
  })

  it('leaves an unrelated article on the generic heading', () => {
    const out = htmlWith({ lang: 'en', slug: 'gender-and-personality-what-big-five-research-says' })
    expect(out).toContain('See yourself in five dimensions.')
  })
})
