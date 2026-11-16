// Spec: src/lib/api.js
//
// Funnel events wait for a sign of a person. A page that is loaded and left
// untouched (a renderer with a browser user agent) must post nothing.

import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
  vi.resetModules()
})

function browser() {
  const listeners = {}
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) })
  vi.stubGlobal('fetch', fetchMock)
  vi.stubGlobal('document', { visibilityState: 'visible' })
  vi.stubGlobal('window', {
    addEventListener: (e, fn) => { listeners[e] = fn },
    removeEventListener: (e) => { delete listeners[e] },
  })
  return { listeners, fetchMock }
}

describe('whenEngaged', () => {
  it('holds events until the first interaction', async () => {
    vi.useFakeTimers()
    const { listeners, fetchMock } = browser()
    const { trackEvent } = await import('../api.js')

    const sent = trackEvent('page_view', { path: '/blog/x/' })
    await vi.advanceTimersByTimeAsync(5000)
    expect(fetchMock).not.toHaveBeenCalled()

    listeners.scroll()
    await sent
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(listeners.scroll).toBeUndefined()
  })

  it('counts a page left visible long enough, but not a hidden one', async () => {
    vi.useFakeTimers()
    const { fetchMock } = browser()
    const { trackEvent } = await import('../api.js')

    document.visibilityState = 'hidden'
    trackEvent('page_view', { path: '/blog/x/' })
    await vi.advanceTimersByTimeAsync(60000)
    expect(fetchMock).not.toHaveBeenCalled()

    document.visibilityState = 'visible'
    await vi.advanceTimersByTimeAsync(15000)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
