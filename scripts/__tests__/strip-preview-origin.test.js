import { describe, it, expect } from 'vitest'
import { stripPreviewOrigin } from '../prerender.mjs'

// Every prerendered page but the home shipped with modulepreload links to
// http://localhost:4173, so cercol.team asked real visitors for access to
// other applications on their device before showing them a report.
describe('stripPreviewOrigin', () => {
  it('makes the build machine relative', () => {
    const html = '<link rel="modulepreload" href="http://localhost:4173/assets/x.js">'
    expect(stripPreviewOrigin(html)).toBe('<link rel="modulepreload" href="/assets/x.js">')
  })

  it('leaves the production origin alone', () => {
    const html = '<link rel="canonical" href="https://cercol.team/sample/">'
    expect(stripPreviewOrigin(html)).toBe(html)
  })

  it('refuses to ship a page that still points at a local address', () => {
    // A future change renders on another port, and the replacement misses it.
    expect(() => stripPreviewOrigin('<script src="http://localhost:5173/a.js">')).toThrow(/localhost:5173/)
    expect(() => stripPreviewOrigin('<script src="http://127.0.0.1:8080/a.js">')).toThrow(/127\.0\.0\.1/)
  })
})
