// Spec: src/components/BlogTestCTA.jsx
//
// The end-of-article CTA must link to the free no-account test (/new-moon)
// and show locale-correct copy. Rendered to static markup (no jsdom needed).

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import BlogTestCTA from '../BlogTestCTA.jsx'

const html = (lang) =>
  renderToStaticMarkup(
    createElement(MemoryRouter, null, createElement(BlogTestCTA, { lang })),
  )

describe('BlogTestCTA', () => {
  it('links to the free no-account test', () => {
    expect(html('en')).toContain('href="/new-moon"')
  })

  it('renders with a slug prop without breaking the link', () => {
    const out = renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(BlogTestCTA, { slug: 'some-article', lang: 'en' })),
    )
    expect(out).toContain('href="/new-moon"')
    expect(out).toContain('See yourself in five dimensions.')
  })

  it('shows the English heading and button by default', () => {
    const out = html('en')
    expect(out).toContain('See yourself in five dimensions.')
    expect(out).toContain('Start the free test')
  })

  it('shows locale-correct copy (ca)', () => {
    expect(html('ca')).toContain('en cinc dimensions.')
  })

  it('uses the corrected Danish character', () => {
    expect(html('da')).toContain('øjebliksbillede')
  })

  it('falls back to English for an unknown locale', () => {
    expect(html('xx')).toContain('See yourself in five dimensions.')
  })
})
