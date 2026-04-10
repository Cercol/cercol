/**
 * LanguageToggle — globe icon + active language code that opens a dropdown.
 * The active ISO 639-1 code (EN, CA, ES, FR, DE) is shown beside the icon
 * so the user always sees which language is active without opening the menu.
 * Clicking an option sets that language directly and closes the dropdown.
 * Outside-click closes without changing language.
 * Persists selection to localStorage (key: 'cercol-lang').
 */
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { GlobeIcon } from './MoonIcons'
import { colors } from '../design/tokens'

const STORAGE_KEY = 'cercol-lang'
const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'ca', label: 'CA' },
  { code: 'es', label: 'ES' },
  { code: 'fr', label: 'FR' },
  { code: 'de', label: 'DE' },
  { code: 'da', label: 'DA' },
]

export default function LanguageToggle() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close dropdown on click outside
  useEffect(() => {
    if (!open) return
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  function select(code) {
    i18n.changeLanguage(code)
    localStorage.setItem(STORAGE_KEY, code)
    setOpen(false)
  }

  const activeLabel = LANGS.find(l => l.code === i18n.language)?.label ?? 'EN'

  return (
    <div className="relative" ref={ref}>
      {/* Globe + active code trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Select language"
        aria-expanded={open}
        className="flex items-center gap-1 p-1.5 rounded transition-colors hover:bg-white/10"
        style={{ color: 'rgba(255,255,255,0.7)' }}
      >
        <GlobeIcon size={18} />
        <span className="text-xs font-semibold tracking-wide leading-none">{activeLabel}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-9 z-50 w-20 rounded border overflow-hidden shadow-lg"
          style={{ backgroundColor: colors.white, borderColor: colors.border }}
        >
          {LANGS.map(({ code, label }) => {
            const active = i18n.language === code
            return (
              <button
                key={code}
                onClick={() => select(code)}
                className="w-full text-left text-sm px-4 py-2.5 hover:bg-gray-50 transition-colors"
                style={{
                  color: active ? colors.blue : colors.textPrimary,
                  fontWeight: active ? 600 : 400,
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
