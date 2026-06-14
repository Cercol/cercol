// Spec: src/lib/api.js
//
// trackEvent is a fire-and-forget first-party funnel POST. It must never
// throw (so it no-ops safely until the endpoint is live), must skip during
// the prerender pass, and must POST to /events otherwise. vitest env is
// 'node', so window/fetch are stubbed.

import { afterEach, describe, expect, it, vi } from 'vitest'

import { trackEvent } from '../api.js'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('trackEvent', () => {
  it('does not POST during the prerender pass', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('window', { __PRERENDER__: true })

    await trackEvent('article_view', { slug: 'x' })

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('POSTs to /events with the event name and payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    })
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('window', {})

    await trackEvent('test_start', { instrument: 'newMoon' })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toContain('/events')
    expect(options.method).toBe('POST')
    const body = JSON.parse(options.body)
    expect(body).toMatchObject({ name: 'test_start', instrument: 'newMoon' })
  })

  it('silently swallows a network error (never throws)', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network down'))
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('window', {})

    await expect(trackEvent('cta_click', { slug: 'x' })).resolves.toBeUndefined()
  })
})
