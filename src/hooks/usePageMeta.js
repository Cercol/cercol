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
 * @param {string}   opts.path          route path with trailing slash, e.g. "/about/"
 */
import { useEffect } from 'react'

const BASE = 'https://cercol.team'
const LANGS = ['en', 'ca', 'es', 'fr', 'de', 'da']

function withTrailingSlash(path) {
  if (!path) return '/'
  return path.endsWith('/') ? path : `${path}/`
}

export function usePageMeta({ title, description, path }) {
  useEffect(() => {
    const cleanPath = withTrailingSlash(path)
    const canonicalUrl = `${BASE}${cleanPath}`

    // Title
    const prevTitle = document.title
    if (title) document.title = title

    // Description (mutate existing tag if present, otherwise create one)
    const metaDesc = document.querySelector('meta[name="description"]')
    const prevDesc = metaDesc?.getAttribute('content') ?? null
    if (description && metaDesc) metaDesc.setAttribute('content', description)

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

    // Hreflang: en + x-default point to the bare path,
    // other languages append ?lang=<code>
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
      const href = l === 'en' ? canonicalUrl : `${canonicalUrl}?lang=${l}`
      makeAlt(l, href)
    })
    makeAlt('x-default', canonicalUrl)

    return () => {
      document.title = prevTitle
      if (metaDesc && prevDesc !== null) metaDesc.setAttribute('content', prevDesc)
      added.forEach(el => el.remove())
    }
  }, [title, description, path])
}

export default usePageMeta
