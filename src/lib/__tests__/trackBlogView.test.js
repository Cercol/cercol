// Spec: src/lib/api.js
//
// Guards the prerender view-count suppression (SLICE 1). trackBlogView must
// early-return without any network call when window.__PRERENDER__ is set
// (the prerender pass), and POST normally otherwise. The vitest environment
// is 'node', so window is stubbed explicitly.

import { afterEach, describe, expect, it, vi } from 'vitest'

import { trackBlogView } from '../api.js'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('trackBlogView', () => {
  it('does not POST when window.__PRERENDER__ is true', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('window', { __PRERENDER__: true })

    await trackBlogView('some-slug')

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('POSTs to the view endpoint when not prerendering', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    })
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('window', {})

    await trackBlogView('some-slug')

    // trackBlogView now also fires an article_view event; assert the view
    // endpoint specifically rather than the total call count.
    const viewCall = fetchMock.mock.calls.find(([u]) => u.includes('/blog/some-slug/view'))
    expect(viewCall).toBeTruthy()
    expect(viewCall[1].method).toBe('POST')
  })
})
