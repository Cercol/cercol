// Spec: src/pages/blog/BlogArticlePage.jsx
//
// Guards the language-aware internal-link rewrite (Phase 17.10). A link
// to a target that has the active locale is rewritten to /<lang>/blog/...;
// a target without that locale keeps the English URL (fallback); English
// articles and external links are never touched.

import { describe, expect, it } from 'vitest'

import { localizeBlogLinks } from '../BlogArticlePage.jsx'

// MOCK article list, shaped like window.__BLOG_ARTICLES__.
const ARTICLES = [
  { slug: 'x', languages: ['en', 'es'] },
  { slug: 'y', languages: ['en'] },
]

describe('localizeBlogLinks', () => {
  it('rewrites a link when the target has the active locale', () => {
    const html = '<a href="/blog/x">link</a>'
    expect(localizeBlogLinks(html, 'es', ARTICLES)).toBe('<a href="/es/blog/x">link</a>')
  })

  it('keeps the English URL when the target lacks the active locale', () => {
    const html = '<a href="/blog/y">link</a>'
    expect(localizeBlogLinks(html, 'ca', ARTICLES)).toBe('<a href="/blog/y">link</a>')
  })

  it('does not touch links for English articles', () => {
    const html = '<a href="/blog/x">link</a>'
    expect(localizeBlogLinks(html, 'en', ARTICLES)).toBe(html)
  })

  it('leaves external links untouched', () => {
    const html = '<a href="https://en.wikipedia.org/wiki/Big_Five">ext</a>'
    expect(localizeBlogLinks(html, 'es', ARTICLES)).toBe(html)
  })

  it('preserves a trailing slash when rewriting', () => {
    const html = '<a href="/blog/x/">link</a>'
    expect(localizeBlogLinks(html, 'es', ARTICLES)).toBe('<a href="/es/blog/x/">link</a>')
  })

  it('keeps the English URL when the article list is unavailable', () => {
    const html = '<a href="/blog/x">link</a>'
    expect(localizeBlogLinks(html, 'es', undefined)).toBe(html)
  })

  it('handles multiple links in one body independently', () => {
    const html = '<a href="/blog/x">a</a> and <a href="/blog/y">b</a>'
    expect(localizeBlogLinks(html, 'es', ARTICLES)).toBe(
      '<a href="/es/blog/x">a</a> and <a href="/blog/y">b</a>',
    )
  })
})
