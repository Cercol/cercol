/**
 * The prerender route list and the sitemap page list must not drift apart.
 *
 * They did, and it cost the site its three instrument pages. /new-moon,
 * /first-quarter and /full-moon were reachable in the router and absent from
 * prerender.mjs, so GitHub Pages answered them with public/404.html, a JS
 * redirect shim. A browser with JS recovered; Googlebot, every link-preview
 * crawler and every LLM fetcher saw HTTP 404 and no content. The pages were
 * simultaneously missing from the sitemap, so nothing flagged it.
 *
 * A route that is in the sitemap but not pre-rendered is that same bug: the
 * sitemap advertises a URL that answers 404. This asserts the containment in
 * that direction. Pre-rendering a route that is deliberately kept out of the
 * sitemap is fine and stays allowed (/sample is one).
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))
const read = (f) => readFileSync(resolve(here, '..', f), 'utf8')

/** Paths inside `const STATIC_ROUTES = [ ... ]` in prerender.mjs. */
function prerenderRoutes() {
  const src = read('prerender.mjs')
  const block = src.match(/const STATIC_ROUTES = \[([\s\S]*?)\]/)
  if (!block) throw new Error('STATIC_ROUTES not found in prerender.mjs')
  return [...block[1].matchAll(/'([^']+)'/g)].map((m) => m[1])
}

/** `path:` values inside `const STATIC_PAGES = [ ... ]` in generate-sitemap.mjs. */
function sitemapPaths() {
  const src = read('generate-sitemap.mjs')
  const block = src.match(/const STATIC_PAGES = \[([\s\S]*?)\n\]/)
  if (!block) throw new Error('STATIC_PAGES not found in generate-sitemap.mjs')
  return [...block[1].matchAll(/path:\s*'([^']+)'/g)].map((m) => m[1])
}

describe('static route lists', () => {
  it('parses both lists', () => {
    expect(prerenderRoutes().length).toBeGreaterThan(5)
    expect(sitemapPaths().length).toBeGreaterThan(5)
  })

  it('pre-renders every page the sitemap advertises', () => {
    const rendered = new Set(prerenderRoutes())
    const missing = sitemapPaths().filter((p) => !rendered.has(p))
    expect(missing).toEqual([])
  })

  it('pre-renders the two public instrument pages', () => {
    // Named explicitly rather than left to the containment rule above: these
    // are the conversion destination of every blog CTA, and dropping them
    // from both lists at once would satisfy containment while restoring the
    // original bug.
    const rendered = new Set(prerenderRoutes())
    for (const route of ['/new-moon', '/first-quarter']) {
      expect(rendered.has(route), `${route} must be pre-rendered`).toBe(true)
    }
  })

  it('does not pre-render the auth-gated /full-moon', () => {
    // FullMoonPage sends an anonymous visitor to /auth. Pre-rendering it
    // captured a loading skeleton whose title and canonical were the home's,
    // because the redirect unmounted the page and usePageMeta's cleanup ran.
    // A page a crawler is bounced out of should not be advertised at all.
    expect(prerenderRoutes()).not.toContain('/full-moon')
    expect(sitemapPaths()).not.toContain('/full-moon')
  })
})
