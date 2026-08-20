/**
 * dist/_redirects — a permanent redirect for every prerendered page.
 *
 * # Spec: docs/architecture/seo-pipeline.md
 *
 * Cloudflare's `html_handling: auto-trailing-slash` already sends /roles to
 * /roles/, but it does it with a 307. A 307 is temporary: it tells Google to
 * keep the slashless URL in the index and not to pass anything to the
 * canonical one. GitHub Pages, which this replaced on 2026-08-17, answered
 * 301. Search Console started failing "Page with redirect" validation the
 * same week with 276 URLs, which is what that change looks like from
 * outside.
 *
 * So every prerendered page gets an explicit 301 here, generated from what
 * the prerender actually wrote rather than from a second list that could
 * drift from it. Anything not prerendered keeps Cloudflare's 307, which is
 * correct: those routes have no canonical page to point at.
 *
 * Runs after prerender in `npm run build:full`, writing into dist/ (not
 * public/, which is copied before prerender exists).
 */

import { readdirSync, writeFileSync, existsSync } from 'fs'
import { join, relative } from 'path'

const DIST = new URL('../dist/', import.meta.url).pathname
// Cloudflare accepts 2,000 static rules per file; the build is ~730 pages.
const MAX_RULES = 2000

/** Every directory under dist/ that holds an index.html, as a URL path. */
export function prerenderedPaths(dir, root = dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    if (entry.name === 'assets') continue
    const full = join(dir, entry.name)
    if (existsSync(join(full, 'index.html'))) out.push('/' + relative(root, full).split('\\').join('/'))
    out.push(...prerenderedPaths(full, root))
  }
  return out.sort()
}

/** One `/path /path/ 301` line per page. The root is already canonical. */
export function redirectsFile(paths) {
  return paths.map((p) => `${p} ${p}/ 301`).join('\n') + '\n'
}

// Importable for tests: only the build run writes anything.
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  const paths = prerenderedPaths(DIST)
  if (paths.length > MAX_RULES) {
    throw new Error(`${paths.length} redirect rules, over Cloudflare's ${MAX_RULES} limit: switch to a zone-level redirect rule`)
  }
  writeFileSync(join(DIST, '_redirects'), redirectsFile(paths), 'utf8')
  console.log(`[redirects] ${paths.length} permanent redirects written to dist/_redirects`)
}
