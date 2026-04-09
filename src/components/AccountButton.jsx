/**
 * AccountButton — auth indicator in the header (blue background context).
 *
 * Signed out: UserIcon button → navigates to /auth.
 * Signed in:  red circle with email initial → opens a small dropdown with
 *             Profile, My Results, and Sign Out items.
 */
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { colors } from '../design/tokens'
import { UserIcon } from './MoonIcons'

export default function AccountButton() {
  const { t }      = useTranslation()
  const navigate   = useNavigate()
  const { user, loading, signOut } = useAuth()
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

  if (loading) return null

  // ── Signed out ────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <button
        onClick={() => navigate('/auth')}
        aria-label={t('auth.signIn')}
        className="p-1.5 rounded transition-colors hover:bg-white/10"
        style={{ color: 'rgba(255,255,255,0.7)' }}
      >
        <UserIcon size={18} />
      </button>
    )
  }

  // ── Signed in ─────────────────────────────────────────────────────────────
  const initial = (user.email?.[0] ?? '?').toUpperCase()

  return (
    <div className="relative" ref={ref}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Account menu"
        aria-expanded={open}
        className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center select-none hover:opacity-90 transition-opacity"
        style={{ backgroundColor: colors.red }}
      >
        {initial}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-9 z-50 w-44 rounded border overflow-hidden shadow-lg"
          style={{ backgroundColor: colors.white, borderColor: colors.border }}
        >
          <button
            onClick={() => { navigate('/profile'); setOpen(false) }}
            className="w-full text-left text-sm px-4 py-2.5 hover:bg-gray-50 transition-colors"
            style={{ color: colors.textPrimary }}
          >
            {t('account.profile')}
          </button>
          <div className="h-px mx-3" style={{ backgroundColor: colors.border }} />
          <button
            onClick={() => { navigate('/my-results'); setOpen(false) }}
            className="w-full text-left text-sm px-4 py-2.5 hover:bg-gray-50 transition-colors"
            style={{ color: colors.textPrimary }}
          >
            {t('myResults.link')}
          </button>
          <div className="h-px mx-3" style={{ backgroundColor: colors.border }} />
          <button
            onClick={() => { signOut(); setOpen(false) }}
            className="w-full text-left text-sm px-4 py-2.5 hover:bg-gray-50 transition-colors"
            style={{ color: colors.textMuted }}
          >
            {t('auth.signOut')}
          </button>
        </div>
      )}
    </div>
  )
}
