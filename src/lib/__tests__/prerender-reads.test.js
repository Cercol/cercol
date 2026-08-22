// Spec: src/lib/api.js
//
// During the prerender pass these three reads must come from the globals the
// build already injected, not from the API. Components refresh on mount by
// design, so without this the build calls our own Worker once per route:
// /beta alone was 726 requests per build, and eleven deploys in one day took
// the account to 76% of the free plan's 100k daily limit.
//
// The suite environment is 'node', so window/fetch are stubbed.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const GLOBALS = {
  __BETA__: { remaining: 488, total: 500 },
  __BLOG_ARTICLES__: [{ slug: 'a', title: { en: 'A' } }],
  __ARTICLE__: { slug: 'a', content: { en: 'body' } },
}

describe('prerender-time API reads', () => {
  let fetchMock
  beforeEach(() => {
    vi.resetModules()
    fetchMock = vi.fn(() =>
      Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ from: 'network' }) }),
    )
    vi.stubGlobal('fetch', fetchMock)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('reads the injected globals and never touches the network', async () => {
    vi.stubGlobal('window', { __PRERENDER__: true, ...GLOBALS })
    const api = await import('../api.js')
    expect(await api.getBetaStatus()).toEqual(GLOBALS.__BETA__)
    expect(await api.getBlogPosts()).toEqual(GLOBALS.__BLOG_ARTICLES__)
    expect(await api.getBlogPost('a')).toEqual(GLOBALS.__ARTICLE__)
    expect(fetchMock, 'the prerender must not call the API for these').not.toHaveBeenCalled()
  })

  it('falls through for a slug the build did not inject', async () => {
    vi.stubGlobal('window', { __PRERENDER__: true, ...GLOBALS })
    const api = await import('../api.js')
    await api.getBlogPost('other').catch(() => {})
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('leaves a real visitor on the network, globals or not', async () => {
    vi.stubGlobal('window', { ...GLOBALS })
    const api = await import('../api.js')
    await api.getBetaStatus().catch(() => {})
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
