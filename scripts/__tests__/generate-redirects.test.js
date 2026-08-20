import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { prerenderedPaths, redirectsFile } from '../generate-redirects.mjs'

// Cloudflare's auto-trailing-slash answers 307, which tells Google to keep
// the slashless URL indexed. Every prerendered page needs an explicit 301.
let dist
beforeAll(() => {
  dist = mkdtempSync(join(tmpdir(), 'dist-'))
  for (const d of ['roles', 'blog/a-post', 'fr/blog/a-post', 'assets/chunks']) mkdirSync(join(dist, d), { recursive: true })
  for (const d of ['roles', 'blog/a-post', 'fr/blog/a-post', '']) writeFileSync(join(dist, d, 'index.html'), 'x')
  // A directory with no index.html is not a page and gets no rule.
  mkdirSync(join(dist, 'blog/drafts'), { recursive: true })
})
afterAll(() => rmSync(dist, { recursive: true, force: true }))

describe('generate-redirects', () => {
  it('finds every prerendered page, nested ones included, and skips assets', () => {
    expect(prerenderedPaths(dist)).toEqual(['/blog/a-post', '/fr/blog/a-post', '/roles'])
  })
  it('emits a permanent redirect per page and never one that loops', () => {
    const out = redirectsFile(prerenderedPaths(dist))
    expect(out).toContain('/roles /roles/ 301')
    expect(out).toContain('/fr/blog/a-post /fr/blog/a-post/ 301')
    // The slashed form is the target, never a source: that would be a loop.
    for (const line of out.trim().split('\n')) {
      const [from, to, code] = line.split(' ')
      expect(from.endsWith('/')).toBe(false)
      expect(to).toBe(`${from}/`)
      expect(code).toBe('301')
    }
  })
})
