/**
 * Public pages that exist ONLY at the unprefixed English path.
 *
 * The router (src/App.jsx) deliberately declares no /<lang> route for the
 * instrument-taking pages: they are interactive, not SEO targets, and a
 * localized reader reaches them as /new-moon?lang=<code> (see navHref in
 * src/lib/navigation.js). Until 2026-09-12 the prerenderer and the sitemap
 * treated them like every other static page and emitted /ca|es|fr|de|da
 * variants, ten URLs that rendered the 404 page and that Search Console
 * filed as "discovered - currently not indexed".
 *
 * Shared by prerender.mjs (render unprefixed only), generate-sitemap.mjs
 * (advertise unprefixed only, no hreflang alternates) and
 * validate_sitemap.mjs (exempt from the every-language coverage check).
 *
 * /full-moon is not here because it is not prerendered or advertised at
 * all: it redirects an anonymous visitor to /auth.
 */
export const EN_ONLY_PAGES = ['/new-moon', '/first-quarter']
