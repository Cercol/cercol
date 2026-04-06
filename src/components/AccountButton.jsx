/**
 * AccountButton — top-left auth indicator.
 * Not signed in: "Sign in" link.
 * Signed in: email initial badge + "My results" link + "Sign out" button.
 */
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'

export default function AccountButton() {
  const { t }          = useTranslation()
  const navigate       = useNavigate()
  const { user, loading, signOut } = useAuth()

  if (loading) return null

  if (!user) {
    return (
      <button
        onClick={() => navigate('/auth')}
        className="text-sm font-semibold text-gray-400 hover:text-gray-700 transition-colors px-2 py-1"
      >
        {t('auth.signIn')}
      </button>
    )
  }

  const initial = (user.email?.[0] ?? '?').toUpperCase()

  return (
    <div className="flex items-center gap-2">
      <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center select-none">
        {initial}
      </span>
      <button
        onClick={() => navigate('/my-results')}
        className="text-sm font-semibold text-gray-500 hover:text-blue-700 transition-colors"
      >
        {t('myResults.link')}
      </button>
      <span className="text-gray-300 text-xs">|</span>
      <button
        onClick={signOut}
        className="text-sm font-semibold text-gray-400 hover:text-gray-700 transition-colors"
      >
        {t('auth.signOut')}
      </button>
    </div>
  )
}
