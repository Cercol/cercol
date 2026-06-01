/**
 * Locale helpers for path-based multilingual routing.
 *
 * English is the default and has no path prefix (/, /about/). The other
 * five languages live under a prefix (/es/, /es/about/). These helpers are
 * the single source of truth for mapping between a pathname and its locale,
 * shared by the router language sync, usePageMeta, and LanguageToggle so the
 * rules never drift.
 */

// Languages that carry a URL path prefix. English is implicit (no prefix).
export const PATH_LANGS = ['ca', 'es', 'fr', 'de', 'da']
export const ALL_LANGS = ['en', ...PATH_LANGS]

/** Locale implied by a pathname's first segment, or 'en' if none. */
export function localeFromPath(pathname) {
  const seg = (pathname || '/').split('/')[1]
  return PATH_LANGS.includes(seg) ? seg : 'en'
}

/**
 * Strip a leading locale segment, returning the language-neutral path.
 * "/es/about" -> "/about", "/es" -> "/", "/about" -> "/about".
 */
export function stripLocale(pathname) {
  const seg = (pathname || '/').split('/')[1]
  if (!PATH_LANGS.includes(seg)) return pathname || '/'
  const rest = pathname.slice(seg.length + 1) // drop "/<lang>"
  return rest === '' ? '/' : rest
}

/**
 * Build the URL for a language-neutral path in a target locale.
 * (locale 'en' -> no prefix). Always preserves the caller's path exactly.
 */
export function localizedPath(neutralPath, locale) {
  const p = neutralPath || '/'
  if (locale === 'en') return p
  return p === '/' ? `/${locale}` : `/${locale}${p}`
}

/**
 * Locale that should own the canonical for a URL. A path prefix wins;
 * otherwise a ?lang= query is honoured so /about?lang=es canonicalises to
 * the /es/about/ path-based version. Used by usePageMeta.
 */
export function localeForCanonical(pathname, search) {
  const fromPath = localeFromPath(pathname)
  if (fromPath !== 'en') return fromPath
  const q = new URLSearchParams(search || '').get('lang')
  return PATH_LANGS.includes(q) ? q : 'en'
}
