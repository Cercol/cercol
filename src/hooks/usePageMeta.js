/**
 * usePageMeta — keep <title>, description, canonical and hreflang in sync
 * with the current route on top-level pages.
 *
 * Top-level public pages (About, Science, FAQ, Instruments, Roles, Privacy)
 * are pre-rendered from a shared index.html shell whose canonical points to
 * the home and whose hreflangs all point to the home. Without this hook the
 * canonical of every internal page would be `https://cercol.team/` and
 * Google would treat them as duplicates of the home.
 *
 * The hook follows the same direct-DOM pattern used in BlogArticlePage.jsx
 * (no react-helmet, per CLAUDE.md).
 *
 * Conventions enforced here:
 *   - canonical URL always ends with a trailing slash
 *   - canonical points to the page itself, never the home
 *   - hreflang alternates point to the same page with `?lang=<code>`,
 *     except `en` and `x-default` which use the unparameterised URL
 *
 * @param {object}   opts
 * @param {string}   opts.title         document.title to set (required)
 * @param {string=}  opts.description   meta[name=description] content
 * @param {string=}  opts.ogTitle       og:title / twitter:title content (defaults to title)
 * @param {string=}  opts.ogDescription og:description / twitter:description content (defaults to description)
 * @param {string}   opts.path          route path with trailing slash, e.g. "/about/"
 */
import { useEffect } from 'react'
import { ALL_LANGS, localeForCanonical, localizedPath } from '../utils/locale'

const BASE = 'https://cercol.team'
const LANGS = ALL_LANGS

function withTrailingSlash(path) {
  if (!path) return '/'
  return path.endsWith('/') ? path : `${path}/`
}

/** Locale that owns the current URL, for canonical purposes. */
function currentLocale() {
  if (typeof window === 'undefined') return 'en'
  return localeForCanonical(window.location.pathname, window.location.search)
}

export function usePageMeta({ title, description, ogTitle, ogDescription, image, path }) {
  useEffect(() => {
    // `path` is the language-neutral page path (e.g. "/about/"). The
    // canonical points to the locale-prefixed version that owns this view,
    // so /es/about/ and /about?lang=es both canonicalise to /es/about/.
    const cleanPath = withTrailingSlash(path)
    const locale = currentLocale()
    const canonicalUrl = `${BASE}${withTrailingSlash(localizedPath(cleanPath, locale))}`

    // Title
    const prevTitle = document.title
    if (title) document.title = title

    // Description (mutate existing tag if present, otherwise create one)
    const metaDesc = document.querySelector('meta[name="description"]')
    const prevDesc = metaDesc?.getAttribute('content') ?? null
    if (description && metaDesc) metaDesc.setAttribute('content', description)

    // Open Graph + Twitter. The shell's index.html ships exactly one of
    // each of these meta tags with the generic home copy. Without this
    // block top-level pages kept the home's og:title/og:description, so
    // social shares and crawlers saw "Cercol - Team Personality
    // Assessment" for every page. Mutate the existing tags via
    // setAttribute (never appendChild) so the count stays at one, exactly
    // as BlogArticlePage does for articles. og:* use property=, twitter:*
    // use name=. Restored on unmount so SPA navigation does not leak copy.
    const ogTitleValue = ogTitle || title
    const ogDescValue = ogDescription || description
    // Per-page og:image / twitter:image override (e.g. per-role share images).
    // Absolute URL required by crawlers; relative paths are resolved to BASE.
    const imageUrl = image
      ? (image.startsWith('http') ? image : `${BASE}${image}`)
      : null
    const ogPairs = [
      ['meta[property="og:title"]', ogTitleValue],
      ['meta[property="og:description"]', ogDescValue],
      ['meta[property="og:url"]', canonicalUrl],
      ['meta[property="og:image"]', imageUrl],
      ['meta[name="twitter:title"]', ogTitleValue],
      ['meta[name="twitter:description"]', ogDescValue],
      ['meta[name="twitter:image"]', imageUrl],
    ]
    const socialPrev = []  // [{el, prev}]
    ogPairs.forEach(([selector, value]) => {
      if (!value) return
      const el = document.querySelector(selector)
      if (el) {
        socialPrev.push({ el, prev: el.getAttribute('content') })
        el.setAttribute('content', value)
      }
    })

    // Wipe stale canonical + hreflang from the shell or a prior route
    document
      .querySelectorAll('link[rel="canonical"], link[rel="alternate"][hreflang]')
      .forEach(el => el.remove())

    const added = []

    // Canonical
    const canon = document.createElement('link')
    canon.rel = 'canonical'
    canon.href = canonicalUrl
    canon.dataset.pageMeta = '1'
    document.head.appendChild(canon)
    added.push(canon)

    // Hreflang: path-based per locale now that every language has a real
    // path (/es/about/), matching how the blog articles already work. No
    // more ?lang= alternates. x-default points to the English path.
    const makeAlt = (hreflang, href) => {
      const link = document.createElement('link')
      link.rel = 'alternate'
      link.hreflang = hreflang
      link.href = href
      link.dataset.pageMeta = '1'
      document.head.appendChild(link)
      added.push(link)
    }
    LANGS.forEach(l => {
      makeAlt(l, `${BASE}${withTrailingSlash(localizedPath(cleanPath, l))}`)
    })
    makeAlt('x-default', `${BASE}${cleanPath}`)

    return () => {
      document.title = prevTitle
      if (metaDesc && prevDesc !== null) metaDesc.setAttribute('content', prevDesc)
      socialPrev.forEach(({ el, prev }) => prev !== null && el.setAttribute('content', prev))
      added.forEach(el => el.remove())
    }
  }, [title, description, ogTitle, ogDescription, image, path])
}

export default usePageMeta
