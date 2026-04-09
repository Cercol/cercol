/**
 * LanguageToggle — single globe icon button that cycles EN ↔ CA.
 * Persists the selection to localStorage (key: 'cercol-lang').
 * Browser language detection happens once at app init in i18n.js.
 */
import { useTranslation } from 'react-i18next'
import { GlobeIcon } from './MoonIcons'

const STORAGE_KEY = 'cercol-lang'

export default function LanguageToggle() {
  const { i18n } = useTranslation()

  function toggle() {
    const next = i18n.language === 'en' ? 'ca' : 'en'
    i18n.changeLanguage(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  return (
    <button
      onClick={toggle}
      aria-label={i18n.language === 'en' ? 'Switch to Català' : 'Switch to English'}
      title={i18n.language === 'en' ? 'Català' : 'English'}
      className="p-1.5 rounded transition-colors hover:bg-white/10"
      style={{ color: 'rgba(255,255,255,0.7)' }}
    >
      <GlobeIcon size={18} />
    </button>
  )
}
