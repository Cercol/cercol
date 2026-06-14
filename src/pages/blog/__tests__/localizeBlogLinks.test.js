// Spec: src/pages/blog/BlogArticlePage.jsx
//
// Guards the language-aware internal-link rewrite (Phase 17.10) and the
// trailing-slash normalization (SLICE 2). Internal /blog/<slug> links must
// emit the canonical trailing-slash form (GitHub Pages 301s the non-slash
// URL); a target with the active locale is rewritten to /<lang>/blog/.../;
// a target without that locale keeps the English URL but still gets a slash;
// English articles and external links are handled by the marked renderer.

import { describe, expect, it } from 'vitest'

import { marked } from 'marked'
// Side-effect import: configures the shared marked singleton (link renderer).
import { localizeBlogLinks } from '../BlogArticlePage.jsx'

// MOCK article list, shaped like window.__BLOG_ARTICLES__.
const ARTICLES = [
  { slug: 'x', languages: ['en', 'es'] },
  { slug: 'y', languages: ['en'] },
]

describe('localizeBlogLinks', () => {
  it('rewrites and adds a trailing slash when the target has the active locale', () => {
    const html = '<a href="/blog/x">link</a>'
    expect(localizeBlogLinks(html, 'es', ARTICLES)).toBe('<a href="/es/blog/x/">link</a>')
  })

  it('keeps the English URL but normalizes the slash when the target lacks the locale', () => {
    const html = '<a href="/blog/y">link</a>'
    expect(localizeBlogLinks(html, 'ca', ARTICLES)).toBe('<a href="/blog/y/">link</a>')
  })

  it('does not touch links for English articles (handled by the marked renderer)', () => {
    const html = '<a href="/blog/x">link</a>'
    expect(localizeBlogLinks(html, 'en', ARTICLES)).toBe(html)
  })

  it('leaves external links untouched', () => {
    const html = '<a href="https://en.wikipedia.org/wiki/Big_Five">ext</a>'
    expect(localizeBlogLinks(html, 'es', ARTICLES)).toBe(html)
  })

  it('preserves an existing trailing slash when rewriting', () => {
    const html = '<a href="/blog/x/">link</a>'
    expect(localizeBlogLinks(html, 'es', ARTICLES)).toBe('<a href="/es/blog/x/">link</a>')
  })

  it('keeps the English URL (slash-normalized) when the article list is unavailable', () => {
    // No article list: cannot decide locale, so the link stays English, but
    // the trailing slash is still normalized.
    const html = '<a href="/blog/x">link</a>'
    expect(localizeBlogLinks(html, 'es', undefined)).toBe('<a href="/blog/x/">link</a>')
  })

  it('handles multiple links in one body independently', () => {
    const html = '<a href="/blog/x">a</a> and <a href="/blog/y">b</a>'
    expect(localizeBlogLinks(html, 'es', ARTICLES)).toBe(
      '<a href="/es/blog/x/">a</a> and <a href="/blog/y/">b</a>',
    )
  })
})

describe('marked link renderer (trailing slash)', () => {
  it('appends a trailing slash to internal /blog/<slug> links', () => {
    expect(marked.parse('[x](/blog/foo)')).toContain('href="/blog/foo/"')
  })

  it('appends a trailing slash to /<lang>/blog/<slug> links', () => {
    expect(marked.parse('[x](/es/blog/foo)')).toContain('href="/es/blog/foo/"')
  })

  it('does not double the slash when one is already present', () => {
    const out = marked.parse('[x](/blog/foo/)')
    expect(out).toContain('href="/blog/foo/"')
    expect(out).not.toContain('href="/blog/foo//"')
  })

  it('leaves external links untouched', () => {
    expect(marked.parse('[x](https://doi.org/10.1000/abc)')).toContain('href="https://doi.org/10.1000/abc"')
  })

  it('leaves non-article internal links untouched', () => {
    const out = marked.parse('[x](/science)')
    expect(out).toContain('href="/science"')
  })
})
