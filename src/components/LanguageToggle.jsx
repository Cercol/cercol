/**
 * LanguageToggle — single globe icon button that cycles EN → CA → ES → EN.
 * Persists the selection to localStorage (key: 'cercol-lang').
 * Browser language detection happens once at app init in i18n.js.
 */
import { useTranslation } from 'react-i18next'
import { GlobeIcon } from './MoonIcons'

const STORAGE_KEY = 'cercol-lang'
const LANGS = ['en', 'ca', 'es']
const LANG_NEXT_LABEL = { en: 'Català', ca: 'Español', es: 'English' }

export default function LanguageToggle() {
  const { i18n } = useTranslation()

  function toggle() {
    const idx  = LANGS.indexOf(i18n.language)
    const next = LANGS[(idx + 1) % LANGS.length]
    i18n.changeLanguage(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  const nextLabel = LANG_NEXT_LABEL[i18n.language] ?? 'Català'

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${nextLabel}`}
      title={nextLabel}
      className="p-1.5 rounded transition-colors hover:bg-white/10"
      style={{ color: 'rgba(255,255,255,0.7)' }}
    >
      <GlobeIcon size={18} />
    </button>
  )
}
