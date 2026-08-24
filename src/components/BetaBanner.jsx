/**
 * BetaBanner — the participation strip shown below the header.
 *
 * Since 2026-08-24 it counts usable responses toward the N≥300
 * role-validation threshold (plan step tg9). The launch-promotion wording
 * ("Full Moon free while the beta lasts") had to go once everything became
 * free forever (docs/policies/pricing.md): it promised an ending that will
 * not come. An earlier counter attempt failed for using NORM_MIN_SAMPLE
 * (200, an internal number) as the target; this one uses the validation
 * threshold the science page already commits to publicly, and the copy asks
 * for participation rather than promising anything at the finish line.
 *
 * Fetched once on mount. Hidden silently on error (never blocks the page).
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

  // Hide on the free-instrument pages (the banner would be a third ask on a
  // screen that already asks for the test) and before the corpus number has
  // loaded: a counter without its number is noise.
  const lang = (i18n.language || 'en').split('-')[0]
  if (SUPPRESSED_PATH.test(pathname) || beta?.corpus == null) return null

  return (
    <div style={{ backgroundColor: colors.yellow }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-2.5 flex items-center justify-between gap-4 flex-wrap">
        <span className="text-sm font-semibold text-gray-900">
          {t('beta.banner', { count: beta.corpus, target: beta.target || 300 })}
        </span>

        <Link
          to={navHref({ to: '/instruments' }, lang)}
          className="shrink-0 text-xs font-bold text-gray-900 underline hover:no-underline"
        >
          {t('beta.cta')}
        </Link>
      </div>
    </div>
  )
}
