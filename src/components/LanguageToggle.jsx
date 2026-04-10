/**
 * LanguageToggle — globe icon button that opens a dropdown to select language.
 * Options: English, Català, Español. Active language is visually marked.
 * Outside-click closes the dropdown without changing language.
 * Persists the selection to localStorage (key: 'cercol-lang').
 * Browser language detection happens once at app init in i18n.js.
 */
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { GlobeIcon } from './MoonIcons'
import { colors } from '../design/tokens'

const STORAGE_KEY = 'cercol-lang'
const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'ca', label: 'Català' },
  { code: 'es', label: 'Español' },
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

  return (
    <div className="relative" ref={ref}>
      {/* Globe trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Select language"
        aria-expanded={open}
        className="p-1.5 rounded transition-colors hover:bg-white/10"
        style={{ color: 'rgba(255,255,255,0.7)' }}
      >
        <GlobeIcon size={18} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-9 z-50 w-32 rounded border overflow-hidden shadow-lg"
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
