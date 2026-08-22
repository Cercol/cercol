/**
 * What the prerender build already holds for a given API path.
 *
 * The build fetches the article list, every article body and the beta status
 * once, then serves every in-page request from that data instead of letting
 * the rendering pages call the API themselves. Before this existed, /beta and
 * /blog/<slug> were called once per route across ~730 routes on every build:
 * eleven deploys in one day took the account to 76% of the free plan's
 * 100k daily Worker requests, all of them ours.
 *
 * Lives in its own module so the test can import it without importing
 * prerender.mjs, which launches Chrome on import.
 */
export function apiResponseFor(pathname, { articles, articlesBySlug, betaStatus }) {
  if (pathname === '/beta') return betaStatus
  if (pathname === '/blog') return articles
  const m = pathname.match(/^\/blog\/(.+)$/)
  if (m) return articlesBySlug.get(decodeURIComponent(m[1]))
  return undefined
}
