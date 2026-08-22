import { describe, it, expect } from 'vitest'
import { apiResponseFor } from '../lib/prerender-api-cache.mjs'

// The prerender fetches the API once and then serves every in-page request
// from that data. If this mapping loses an endpoint, the endpoint goes back
// to being called once per route, across ~730 routes, on every build.
describe('prerender API cache', () => {
  const articles = [{ slug: 'a' }, { slug: 'b' }]
  const articlesBySlug = new Map([['a', { slug: 'a', content: 'A' }]])
  const betaStatus = { remaining: 488, total: 500 }
  const globals = { articles, articlesBySlug, betaStatus }

  it('serves the three endpoints a rendering page asks for', () => {
    expect(apiResponseFor('/beta', globals)).toBe(betaStatus)
    expect(apiResponseFor('/blog', globals)).toBe(articles)
    expect(apiResponseFor('/blog/a', globals)).toEqual({ slug: 'a', content: 'A' })
  })

  it('decodes a slug the way the fetcher encoded it', () => {
    const m = new Map([['a b', { slug: 'a b' }]])
    expect(apiResponseFor('/blog/a%20b', { ...globals, articlesBySlug: m })).toEqual({ slug: 'a b' })
  })

  it('returns undefined rather than guessing, so the caller lets it through', () => {
    expect(apiResponseFor('/health', globals)).toBeUndefined()
    expect(apiResponseFor('/blog/missing', globals)).toBeUndefined()
  })
})
