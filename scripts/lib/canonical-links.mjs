/**
 * Trailing-slash canonicalisation for the pre-rendered HTML.
 *
 * # Spec: docs/architecture/seo-pipeline.md
 *
 * Every pre-rendered route is written as `<route>/index.html`, so GitHub
 * Pages 301s the extension-less URL: `/roles` hops to `/roles/`. The sitemap,
 * the canonical tag and every hreflang already emit the slash form. The
 * router's `to` props do not, and they are not wrong to: to React Router
 * `/roles` and `/roles/` are the same route, and the slash is invisible in a
 * client-side navigation because no HTTP request happens at all.
 *
 * A crawler is not doing a client-side navigation. It followed the nav, the
 * footer and the related-article cards as written, and took a 301 on all 656
 * of them, which Search Console reports as "Page with redirect" against URLs
 * that are not even the canonical ones. Body links were already normalised
 * (localizeBlogLinks in BlogArticlePage) but component links never were.
 *
 * Normalising here, rather than adding a slash to thirty-odd `to` props, is
 * deliberate: this is the single point where the router's paths stop being
 * router paths and become URLs a host has to serve, and a rule applied here
 * cannot be regressed by the next `<Link>` someone writes.
 */

/** Split a URL into its path and its `?query#hash` remainder. */
const SPLIT = /^([^?#]*)(.*)$/

/**
 * Add the trailing slash to every root-relative href in `html`.
 *
 * Left alone: hrefs that already end in `/`, anything whose last segment
 * carries an extension (`/assets/roboto-...woff2`, `/sitemap.xml`), and
 * fragment-only or absolute hrefs, which the leading `/` in the pattern
 * already excludes. JSON payloads embedded in the page are unaffected
 * because their quotes arrive escaped as `href=\"`, which does not match.
 */
export function canonicaliseInternalHrefs(html) {
  return html.replace(/href="(\/[^"]*)"/g, (whole, url) => {
    const [, path, suffix] = url.match(SPLIT)
    if (path.endsWith('/')) return whole
    if (/\.[a-z0-9]+$/i.test(path)) return whole
    return `href="${path}/${suffix}"`
  })
}
