/**
 * OnboardingModal — welcome modal shown once to new users after first sign-in.
 *
 * Visibility is controlled by App.jsx:
 *   - shown when profile.onboarding_seen === false AND localStorage key absent
 *   - dismissed via markOnboardingSeen() from AuthContext (optimistic + persisted)
 *
 * Props:
 *   onDismiss()       — close without navigating
 *   onGoToNewMoon()   — close and navigate to /new-moon
 */
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './ui'
import { NewMoonIcon, FirstQuarterIcon, FullMoonIcon } from './MoonIcons'

const INSTRUMENTS = [
  { key: 'newMoon',      Icon: NewMoonIcon,      nameKey: 'home.newMoon.name' },
  { key: 'firstQuarter', Icon: FirstQuarterIcon,  nameKey: 'home.firstQuarter.name' },
  { key: 'fullMoon',     Icon: FullMoonIcon,      nameKey: 'home.fullMoon.name' },
]

export default function OnboardingModal({ onDismiss, onGoToNewMoon }) {
  const { t } = useTranslation()
  const primaryRef = useRef(null)

  // Move focus to the primary CTA when the modal opens.
  useEffect(() => {
    primaryRef.current?.focus()
  }, [])

  // Close on Escape key.
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onDismiss()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onDismiss])

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onDismiss}
      aria-hidden="false"
    >
      {/* Panel — stop click propagation so backdrop click doesn't fire inside */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-heading"
        className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Heading */}
        <h2
          id="onboarding-heading"
          className="text-2xl font-bold text-gray-900 mb-2"
        >
          {t('onboarding.heading')}
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          {t('onboarding.intro')}
        </p>

        {/* Instrument list */}
        <div className="flex flex-col gap-4 mb-6">
          {INSTRUMENTS.map(({ key, Icon, nameKey }) => (
            <div key={key} className="flex items-start gap-3">
              <Icon
                size={20}
                className="text-[var(--mm-color-black)] shrink-0 mt-0.5"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900">{t(nameKey)}</p>
                <p className="text-xs text-gray-500 leading-relaxed mt-0.5">
                  {t(`onboarding.${key}.desc`)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Suggested order hint */}
        <p className="text-xs text-gray-400 italic mb-6">
          {t('onboarding.suggestedOrder')}
        </p>

        {/* CTAs */}
        <div className="flex flex-col gap-2">
          <Button
            ref={primaryRef}
            variant="primary"
            size="lg"
            onClick={onGoToNewMoon}
            className="w-full"
          >
            {t('onboarding.primaryCta')}
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={onDismiss}
            className="w-full text-gray-500"
          >
            {t('onboarding.dismissCta')}
          </Button>
        </div>
      </div>
    </div>
  )
}
