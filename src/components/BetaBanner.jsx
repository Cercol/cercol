/**
 * BetaBanner — launch promotion strip shown below the header.
 *
 * Shown when:
 *   - Beta slots are still available (remaining > 0)
 *   - The visitor is not yet premium (either not logged in, or logged in without premium)
 *
 * Fetched once on mount. Hidden silently on error (never blocks the page).
 *
 * It is a launch promotion and says so. It briefly counted responses towards
 * the norms threshold instead, which was wrong three ways: 200 is
 * NORM_MIN_SAMPLE, an internal number with nothing to do with the promotion,
 * while the promotion is BETA_TOTAL = 500; "0 of 200" told every visitor that
 * nobody had taken the test; and it implied the free instruments stop being
 * free, which they do not. The earlier "488 licences remaining, help us find
 * bugs" was also wrong, for announcing emptiness and asking a stranger for
 * quality assurance. A promotion states the offer and keeps its own numbers
 * to itself.
 */
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { navHref } from '../lib/navigation'
import { getBetaStatus } from '../lib/api'
import { colors } from '../design/tokens'

// The free-instrument pages, in any of the six languages. The banner is a
// third ask on a screen that already asks the reader to begin a test and to
// accept cookies, and the one the reader came for is the least legible of
// the three, so the banner yields on exactly these two routes.
const SUPPRESSED_PATH = /^\/(?:(?:ca|es|fr|de|da)\/)?(?:new-moon|first-quarter)\/?$/

export default function BetaBanner() {
  const { t, i18n } = useTranslation()
  const { pathname } = useLocation()

  // Read from window.__BETA__ injected by prerender.mjs into every pre-rendered
  // HTML. This eliminates the hydration flash: the pre-rendered banner is
  // visible in the raw HTML, and React mounts with the same data so it doesn't
  // unmount and re-mount after the API round-trip (~1300ms LCP delay removed).
  // The useEffect below still refreshes from the API in the background.
  const [beta, setBeta] = useState(() => {
    if (typeof window !== 'undefined' && window.__BETA__) return window.__BETA__
    return null
  })

  useEffect(() => {
    getBetaStatus()
      .then(setBeta)
      .catch(() => {/* silently ignore — banner is best-effort */})
  }, [])

  // Hide on the free-instrument pages, before the status has loaded, and once
  // the promotion is over. userIsPremium is gone from the condition: it was
  // hiding a sales pitch, and this is an offer a paying account has already
  // taken.
  const lang = (i18n.language || 'en').split('-')[0]
  if (SUPPRESSED_PATH.test(pathname) || !beta || beta.remaining <= 0) return null

  return (
    <div style={{ backgroundColor: colors.yellow }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-2.5 flex items-center justify-between gap-4 flex-wrap">
        <span className="text-sm font-semibold text-gray-900">{t('beta.banner')}</span>

        {/* nofollow: /auth is not prerendered, and the banner sits on every
            prerendered page, which once made it the largest single source of
            crawled 404s. */}
        <Link
          to={navHref({ to: '/auth' }, lang)}
          rel="nofollow"
          className="shrink-0 text-xs font-bold text-gray-900 underline hover:no-underline"
        >
          {t('beta.cta')}
        </Link>
      </div>
    </div>
  )
}
