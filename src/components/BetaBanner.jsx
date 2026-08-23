/**
 * BetaBanner — launch promotion strip shown below the header.
 *
 * Shown when:
 *   - Beta slots are still available (remaining > 0)
 *   - The visitor is not yet premium (either not logged in, or logged in without premium)
 *
 * Fetched once on mount. Hidden silently on error (never blocks the page).
 *
 * It used to count free Full Moon licences: "488 remaining, help us find
 * bugs". Three things wrong at once. It asked a stranger for quality
 * assurance before giving them anything, it said it in enterprise-software
 * words, and at twelve claimed of five hundred it announced to every visitor
 * that nobody was here. It now counts the number the project actually needs,
 * which goes up when someone helps, and says plainly what is missing without
 * it.
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

  // Hide when: on a free-instrument page, no data yet, or the corpus has
  // reached the threshold and there is nothing left to recruit for. Premium
  // no longer hides it: the ask is a response, and someone who paid can still
  // give one. What premium used to hide was a sales pitch.
  // The reader's own language, because that is the grain the norms are
  // computed at: an English answer does nothing for a Danish reader's norms.
  const v = beta?.validation
  const lang = (i18n.language || 'en').split('-')[0]
  const n = v?.byLanguage?.[lang] ?? 0
  if (SUPPRESSED_PATH.test(pathname) || !v?.threshold || n >= v.threshold) return null

  const pct = Math.round((n / v.threshold) * 100)

  return (
    <div style={{ backgroundColor: colors.yellow }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-2.5 flex items-center justify-between gap-4 flex-wrap">

        {/* Left: text + progress */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-gray-900">
            {t('beta.banner', { n, threshold: v.threshold })}
          </span>
          {/* Progress bar: how many slots have been claimed */}
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-20 h-1.5 bg-black/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-black/50 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-gray-700 font-medium">
              {n}/{v.threshold}
            </span>
          </div>
        </div>

        {/* Right: CTA */}
        {/* nofollow: /auth is not pre-rendered, so GitHub Pages answers it
            404 to a crawler. The banner sits on all 168 pre-rendered pages,
            which made it the single largest source of crawled 404s. */}
        {/* Was /auth: the banner asked a stranger to make an account before
            it had given them anything. The ask is the test itself, and
            First Quarter is the one whose responses the norms are built on. */}
        <Link
          to={navHref({ to: '/first-quarter' }, lang)}
          rel="nofollow"
          className="shrink-0 text-xs font-bold text-gray-900 underline hover:no-underline"
        >
          {t('beta.cta')}
        </Link>

      </div>
    </div>
  )
}
