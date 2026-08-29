/**
 * The post-sign-in return marker behind the Full Moon gate.
 *
 * The gate remembers '/full-moon' before sending an anonymous visitor to
 * /auth; every sign-in flow then returns there instead of dropping the
 * visitor on the home page. These tests pin the marker's contract: internal
 * paths only, one-shot (taking clears it), and stale markers do not
 * teleport a sign-in that happens days later.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { rememberNextPath, takeNextPath } from '../../lib/api'

const store = new Map()
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
}

describe('post-sign-in return path', () => {
  beforeEach(() => store.clear())

  it('round-trips an internal path exactly once', () => {
    rememberNextPath('/full-moon')
    expect(takeNextPath()).toBe('/full-moon')
    expect(takeNextPath()).toBe(null)
  })

  it('refuses anything that is not an internal path', () => {
    rememberNextPath('https://evil.example/phish')
    expect(takeNextPath()).toBe(null)
    rememberNextPath(null)
    expect(takeNextPath()).toBe(null)
  })

  it('expires a stale marker instead of teleporting a later sign-in', () => {
    store.set('cercol_next', JSON.stringify({ path: '/full-moon', at: Date.now() - 31 * 60 * 1000 }))
    expect(takeNextPath()).toBe(null)
  })

  it('survives garbage in the slot', () => {
    store.set('cercol_next', 'not json')
    expect(takeNextPath()).toBe(null)
  })
})
