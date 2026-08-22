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
 * `to` is the English path. Only the blog is locale-prefixed today, which is
 * what the header has always done; `navHref` is the one place that decides,
 * so changing that policy later is one function rather than a search.
 */

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
    key: 'brand',
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
      { key: 'blog', to: '/blog', localised: true },
    ],
  },
  {
    key: 'menuCompany',
    items: [
      { key: 'about', to: '/about' },
      { key: 'faq', to: '/faq' },
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
// The credit is for the design system, not a byline: mm-design is where every
// token, icon and type choice on this site comes from.
export const DESIGN_URL = 'https://github.com/miquelmatoses/mm-design'

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
 * Only entries marked `localised` get a prefix. Every top-level page has a
 * real locale-prefixed URL that is prerendered and in the sitemap, so more of
 * them could be prefixed; that is a behaviour change and belongs in its own
 * commit, not in the one that centralises the list.
 */
export function navHref({ to, localised }, lang = 'en') {
  const code = String(lang || 'en').slice(0, 2)
  return localised && code !== 'en' ? `/${code}${to}` : to
}

/** True when `pathname` is inside this entry, for the active state. */
export function isEntryActive(entry, pathname) {
  const paths = entry.items.map((i) => i.to)
  return paths.some((p) => pathname === p || pathname.includes(`${p}/`) || pathname.endsWith(p))
}
