/**
 * LanguageToggle — EN / CA switcher shown in the top-right of every page.
 */
import { useTranslation } from 'react-i18next'

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
        className={[
          'px-2 py-1 rounded-lg transition-colors',
          current === 'en'
            ? 'bg-blue-600 text-white'
            : 'text-gray-400 hover:text-gray-700',
        ].join(' ')}
      >
        EN
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={() => toggle('ca')}
        className={[
          'px-2 py-1 rounded-lg transition-colors',
          current === 'ca'
            ? 'bg-blue-600 text-white'
            : 'text-gray-400 hover:text-gray-700',
        ].join(' ')}
      >
        CA
      </button>
    </div>
  )
}
