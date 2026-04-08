/**
 * LanguageToggle — EN / CA switcher in the header (blue background context).
 * Active language: white background with blue text.
 * Inactive: white/60 text, no background.
 */
import { useTranslation } from 'react-i18next'
import { colors } from '../design/tokens'

export default function LanguageToggle() {
  const { i18n } = useTranslation()
  const current = i18n.language

  function toggle(lang) {
    i18n.changeLanguage(lang)
  }

  return (
    <div className="flex items-center gap-1 text-sm font-semibold">
      <button
        onClick={() => toggle('en')}
        className="px-2 py-1 rounded transition-colors"
        style={
          current === 'en'
            ? { backgroundColor: colors.white, color: colors.blue }
            : { color: 'rgba(255,255,255,0.6)' }
        }
      >
        EN
      </button>
      <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
      <button
        onClick={() => toggle('ca')}
        className="px-2 py-1 rounded transition-colors"
        style={
          current === 'ca'
            ? { backgroundColor: colors.white, color: colors.blue }
            : { color: 'rgba(255,255,255,0.6)' }
        }
      >
        CA
      </button>
    </div>
  )
}
