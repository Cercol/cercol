/**
 * attribution.js — first-touch channel capture.
 *
 * On the visitor's first load we record where they came from: the external
 * referring site (document.referrer) and any utm_source / utm_medium /
 * utm_campaign tags on the landing URL. These are persisted once in
 * localStorage (same pattern as cercol_anon) so the FIRST touch is preserved
 * even after later navigations overwrite the URL or referrer.
 *
 * First-party only: never shared with third parties, never linked to identity.
 * The values are attached to a completed test so a result can be traced to its
 * channel. Returns all-null in non-browser/prerender contexts.
 */
const KEY = 'cercol_attribution'

const EMPTY = { referrer: null, utm_source: null, utm_medium: null, utm_campaign: null }

/**
 * getFirstTouch — return the persisted first-touch attribution, capturing it
 * on the first call. Idempotent: later calls return the stored first touch.
 * @returns {{referrer: string|null, utm_source: string|null, utm_medium: string|null, utm_campaign: string|null}}
 */
export function getFirstTouch() {
  if (typeof window === 'undefined' || window.__PRERENDER__) return { ...EMPTY }
  try {
    const stored = localStorage.getItem(KEY)
    if (stored) return { ...EMPTY, ...JSON.parse(stored) }

    const params = new URLSearchParams(window.location.search)
    const ref = document.referrer || ''
    const ft = {
      // Only external referrers count as a channel; same-origin is internal nav.
      referrer: ref && !ref.startsWith(window.location.origin) ? ref : null,
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
    }
    localStorage.setItem(KEY, JSON.stringify(ft))
    return ft
  } catch {
    // Storage blocked (private mode, etc.): degrade to no attribution.
    return { ...EMPTY }
  }
}
