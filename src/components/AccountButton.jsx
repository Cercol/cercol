/**
 * AccountButton — auth indicator in the header (blue background context).
 * Not signed in: "Sign in" link (white text).
 * Signed in: email initial badge + "My results" link + "Sign out" button.
 */
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { colors } from '../design/tokens'

export default function AccountButton() {
  const { t }          = useTranslation()
  const navigate       = useNavigate()
  const { user, loading, signOut } = useAuth()

  if (loading) return null

  if (!user) {
    return (
      <button
        onClick={() => navigate('/auth')}
        className="text-sm font-medium text-white/70 hover:text-white transition-colors px-2 py-1"
      >
        {t('auth.signIn')}
      </button>
    )
  }

  const initial = (user.email?.[0] ?? '?').toUpperCase()

  return (
    <div className="flex items-center gap-2">
      <span
        className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center select-none"
        style={{ backgroundColor: colors.red }}
      >
        {initial}
      </span>
      <button
        onClick={() => navigate('/my-results')}
        className="text-sm font-medium text-white/70 hover:text-white transition-colors"
      >
        {t('myResults.link')}
      </button>
      <span className="text-white/30 text-xs">|</span>
      <button
        onClick={signOut}
        className="text-sm font-medium text-white/50 hover:text-white transition-colors"
      >
        {t('auth.signOut')}
      </button>
    </div>
  )
}
