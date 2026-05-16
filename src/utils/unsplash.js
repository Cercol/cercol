/**
 * unsplash.js — Unsplash URL normalisation utility.
 *
 * Problem: 91 of 104 blog cover URLs in the database have a malformed
 * double-? query string produced by string concatenation in the backend:
 *
 *   …photo-abc?ixid=…&ixlib=rb-4.1.0?w=1200&auto=format&fit=crop&q=80
 *                                    ^^^^ second ? — should be &
 *
 * Because the second `?w=…` is not a valid query parameter, Unsplash CDN
 * ignores it and serves the original full-resolution image (3840px+),
 * causing 700 KiB+ LCP payloads on blog pages.
 *
 * normalizeUnsplashUrl() strips the broken suffix, rebuilds clean params,
 * and applies caller-specified sizing overrides.
 */

/**
 * Normalise an Unsplash image URL and apply sizing parameters.
 *
 * @param {string|null|undefined} url  Raw coverUrl value from the API.
 * @param {{ w?: number, q?: number }} [opts]
 *   w — desired pixel width (default 760)
 *   q — JPEG quality 1-100 (default 80)
 * @returns {string|null}  Clean URL, or null if input is falsy or non-Unsplash.
 *
 * @example
 * normalizeUnsplashUrl('https://images.unsplash.com/photo-abc?ixid=X&ixlib=rb-4.1.0?w=1200&auto=format&fit=crop&q=80', { w: 760 })
 * // → 'https://images.unsplash.com/photo-abc?ixid=X&ixlib=rb-4.1.0&w=760&auto=format&fit=crop&q=80'
 */
export function normalizeUnsplashUrl(url, { w = 760, q = 80 } = {}) {
  if (!url || typeof url !== 'string') return null
  if (!url.includes('images.unsplash.com')) return url

  // Split at the FIRST `?` to isolate the base URL
  const firstQ = url.indexOf('?')
  const base = firstQ === -1 ? url : url.slice(0, firstQ)
  const rawParams = firstQ === -1 ? '' : url.slice(firstQ + 1)

  // The malformed URLs look like:
  //   ixid=X&ixlib=rb-4.1.0?w=1200&auto=format&fit=crop&q=80
  // Strip everything from the second `?` onward (the broken suffix).
  const cleanParams = rawParams.split('?')[0]

  // Parse what's left into a URLSearchParams so we can override safely
  const sp = new URLSearchParams(cleanParams)

  // Apply/override sizing params
  sp.set('w', String(w))
  sp.set('auto', 'format')
  sp.set('fit', 'crop')
  sp.set('q', String(q))

  return `${base}?${sp.toString()}`
}
