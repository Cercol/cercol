/**
 * CookieBanner — one-time bottom notice about strictly necessary cookies.
 *
 * Cèrcol uses only functional (strictly necessary) cookies for auth session
 * management. No analytics, no advertising trackers. Under GDPR, strictly
 * necessary cookies do not require consent — this banner is informational only.
 *
 * Dismissed state is persisted to localStorage (key: 'cercol-cookies-ok').
 * The banner disappears permanently once dismissed.
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { colors } from '../design/tokens'

const STORAGE_KEY = 'cercol-cookies-ok'

export default function CookieBanner() {
  const { t } = useTranslation()
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === '1'
  )

  if (dismissed) return null

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1')
    setDismissed(true)
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-4 px-4 py-3 sm:px-6"
      style={{ backgroundColor: colors.black }}
    >
      <p className="text-xs text-white/70 leading-relaxed">
        {t('cookies.notice')}{' '}
        <a
          href="/privacy"
          className="underline text-white/90 hover:text-white transition-colors"
        >
          {t('cookies.learnMore')}
        </a>
      </p>
      <button
        onClick={dismiss}
        className="shrink-0 text-xs font-semibold text-white px-3 py-1.5 rounded border border-white/30 hover:bg-white/10 transition-colors"
        aria-label={t('cookies.dismiss')}
      >
        {t('cookies.ok')}
      </button>
    </div>
  )
}
