/**
 * BetaBanner — launch promotion strip shown below the header.
 *
 * Shown when:
 *   - Beta slots are still available (remaining > 0)
 *   - The visitor is not yet premium (either not logged in, or logged in without premium)
 *
 * Fetched once on mount. Hidden silently on error (never blocks the page).
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getBetaStatus } from '../lib/api'
import { colors } from '../design/tokens'

export default function BetaBanner({ userIsPremium }) {
  const { t } = useTranslation()
  const [beta, setBeta] = useState(null)

  useEffect(() => {
    getBetaStatus()
      .then(setBeta)
      .catch(() => {/* silently ignore — banner is best-effort */})
  }, [])

  // Hide when: no data yet, slots exhausted, or user already has premium
  if (!beta || beta.remaining <= 0 || userIsPremium) return null

  const pct = Math.round(((beta.total - beta.remaining) / beta.total) * 100)

  return (
    <div style={{ backgroundColor: colors.yellow }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-2.5 flex items-center justify-between gap-4 flex-wrap">

        {/* Left: text + progress */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-gray-900">
            {t('beta.banner', { remaining: beta.remaining })}
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
              {beta.total - beta.remaining}/{beta.total}
            </span>
          </div>
        </div>

        {/* Right: CTA */}
        <Link
          to="/auth"
          className="shrink-0 text-xs font-bold text-gray-900 underline hover:no-underline"
        >
          {t('beta.cta')}
        </Link>

      </div>
    </div>
  )
}
