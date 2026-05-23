// Spec: src/pages/blog/BlogArticlePage.jsx
//
// Guards the prerender-injected article read used by BlogArticlePage
// at first paint. The function is the soft-404 fix: when present, it
// hands the article body to React synchronously and avoids the
// post-hydration API call that was failing intermittently.

import { describe, expect, it } from 'vitest'

import { getPrerenderedArticle } from '../BlogArticlePage.jsx'

const SLUG = 'what-is-agreeableness-the-cooperative-dimension'

const FAKE_ARTICLE = {
  // EXAMPLE / MOCK data, not a real published article.
  slug: SLUG,
  title: { en: 'MOCK article title' },
  description: { en: 'MOCK article description' },
  content: { en: '# Title\n\nbody' },
  published_at: '2026-01-01T00:00:00Z',
  author: 'MOCK',
}

describe('getPrerenderedArticle', () => {
  it('returns the article when the slug matches', () => {
    const win = { __ARTICLE__: FAKE_ARTICLE }
    expect(getPrerenderedArticle(SLUG, win)).toBe(FAKE_ARTICLE)
  })

  it('returns null when the slug does not match (client-side navigation)', () => {
    const win = { __ARTICLE__: FAKE_ARTICLE }
    expect(getPrerenderedArticle('different-slug', win)).toBe(null)
  })

  it('returns null when no global is set', () => {
    const win = {}
    expect(getPrerenderedArticle(SLUG, win)).toBe(null)
  })

  it('returns null when window is undefined (SSR safety)', () => {
    expect(getPrerenderedArticle(SLUG, undefined)).toBe(null)
  })

  it('returns null when the global is set but has no slug', () => {
    const win = { __ARTICLE__: { title: 'no slug' } }
    expect(getPrerenderedArticle(SLUG, win)).toBe(null)
  })
})
