/**
 * The site's navigation, defined once.
 *
 * Every place that lists where you can go on Cèrcol reads this: the desktop
 * header, the mobile menu, and the footer. Before it existed the same four
 * groups were written out three times inside Layout.jsx alone, once per
 * viewport, with the dropdown children as inline arrays. A footer would have
 * been the fourth copy, and the first one to drift would have done it
 * silently.
 *
 * Labels are i18n keys under `nav.*`, not strings: the six locales already
 * carry them and a new language needs no change here.
 *
 * `to` is the English path. `navHref` turns it into the path for the reader's
 * language, which is the one place that decides, so the policy is one function
 * rather than a search.
 */

/** The locales that own a URL prefix. English is unprefixed. */
export const LOCALES = ['ca', 'es', 'fr', 'de', 'da']

/**
 * True for the home page in any language.
 *
 * Layout used `pathname === '/'`, so /ca/, /es/, /fr/, /de/ and /da/ were
 * treated as internal pages and rendered inside the 896px max-w-4xl column
 * meant for articles. The home manages its own full-bleed background, so
 * every non-English visitor got the instrument cards crushed into a narrow
 * band with white either side. It shipped in Phase 10.2 and nobody caught it
 * because the English home, the one anybody developing this site loads, is
 * the single URL where the bug does not appear.
 */
export function isHomePath(pathname) {
  const p = String(pathname || '').replace(/\/+$/, '')
  return p === '' || LOCALES.includes(p.slice(1))
}

/**
 * Top-level entries, in header order.
 *
 * Every entry is a group with children, so both renderings can walk the same
 * shape. `direct: true` says the header shows the children as plain links
 * rather than behind a dropdown, which is what Instruments and Roles have
 * always done. The footer, which has room, gives every group a column and
 * uses the group key as its heading.
 */
export const NAV = [
  {
    // The footer heads this column with nav.menuAssess: the wordmark used to
    // sit here and told the reader nothing about what Instruments and Roles
    // are. The header shows the two as flat links and never renders the key.
    key: 'menuAssess',
    direct: true,
    items: [
      { key: 'instruments', to: '/instruments' },
      { key: 'roles', to: '/roles' },
    ],
  },
  {
    key: 'menuLearn',
    items: [
      { key: 'science', to: '/science' },
      { key: 'blog', to: '/blog' },
    ],
  },
  {
    key: 'menuCompany',
    items: [
      { key: 'about', to: '/about' },
      { key: 'faq', to: '/faq' },
      { key: 'forOrgs', to: '/for-organizations' },
      { key: 'forFacilitators', to: '/for-facilitators' },
    ],
  },
]

/** Every destination, flattened. Group keys are labels, not places. */
export const NAV_LINKS = NAV.flatMap((entry) => entry.items)

/**
 * The line under the sections: the pages and the outbound links that are not
 * part of the site's navigation but belong on every page. These were written
 * inline in HomePage's own footer, which meant they existed on exactly one
 * page; GITHUB_URL and ISSUE_URL were each defined twice.
 */
export const GITHUB_URL = 'https://github.com/cercol/cercol'
export const ISSUES_URL = `${GITHUB_URL}/issues`
export const ISSUE_URL = `${ISSUES_URL}/new?title=Bug+report&labels=bug`
// The label names the design system, which is what the credit is for; the
// link goes to its author's portfolio, which is where a reader who clicks a
// design credit is actually trying to get to.
export const DESIGN_URL = 'https://miquelmatoses.github.io/portfolio/'

export const META_LINKS = [
  { key: 'privacy', to: '/privacy', labelKey: 'nav.privacy' },
  { key: 'sample', to: '/sample', labelKey: 'sample.eyebrow' },
  { key: 'github', href: GITHUB_URL, labelKey: 'home.viewOnGitHub' },
  { key: 'issues', href: ISSUE_URL, labelKey: 'feedback.reportIssue' },
  { key: 'design', href: DESIGN_URL, label: 'mm-design' },
]

/**
 * The path to link to, for a reader currently in `lang`.
 *
 * Every internal destination gets the prefix. Until 2026-08-22 only the blog
 * did, and the result was a footer that dropped a French reader back into
 * English on every link but one: /fr/instruments/ pointed at /instruments/,
 * /roles/, /science/, /about/, /faq/, /privacy/ and /sample/. All five locales
 * have all eight of those pages, prerendered and in the sitemap, so the
 * prefixed link was always the right one; the flag was a deferral, not a
 * policy.
 *
 * It also starved the non-English clusters of internal links, which is the
 * one lever that moves a page out of "crawled, currently not indexed". That
 * verdict on /fr/blog/ is what sent us looking.
 */
export function navHref({ to }, lang = 'en') {
  const code = String(lang || 'en').slice(0, 2)
  return LOCALES.includes(code) ? `/${code}${to}` : to
}

/** True when `pathname` is inside this entry, for the active state. */
export function isEntryActive(entry, pathname) {
  const paths = entry.items.map((i) => i.to)
  return paths.some((p) => pathname === p || pathname.includes(`${p}/`) || pathname.endsWith(p))
}
