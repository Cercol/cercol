/**
 * AuthPage — magic link sign-in.
 * Two states: 'form' (email input) → 'sent' (confirmation message).
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import LanguageToggle from '../components/LanguageToggle'

export default function AuthPage() {
  const { t }        = useTranslation()
  const navigate     = useNavigate()
  const { signIn }   = useAuth()

  const [email,   setEmail]   = useState('')
  const [state,   setState]   = useState('form')  // 'form' | 'sending' | 'sent' | 'error'

  async function handleSubmit(e) {
    e.preventDefault()
    setState('sending')
    try {
      await signIn(email)
      setState('sent')
    } catch {
      setState('error')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      <div className="w-full max-w-sm">
        <button
          onClick={() => navigate('/')}
          className="mb-8 text-2xl font-bold tracking-tight text-gray-900 hover:text-blue-700 transition-colors"
        >
          {t('nav.brand')}
        </button>

        {state === 'sent' ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center">
            <p className="text-2xl mb-2">✉️</p>
            <h1 className="text-lg font-bold text-gray-900 mb-2">
              {t('auth.sentHeading')}
            </h1>
            <p className="text-sm text-gray-500 mb-1">
              {t('auth.sentBody', { email })}
            </p>
            <p className="text-xs text-gray-400 mt-4">
              {t('auth.sentNote')}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h1 className="text-lg font-bold text-gray-900 mb-1">
              {t('auth.signIn')}
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              {t('auth.signInSubtitle')}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  {t('auth.emailLabel')}
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                />
              </div>

              {state === 'error' && (
                <p className="text-xs text-red-500">{t('auth.error')}</p>
              )}

              <button
                type="submit"
                disabled={state === 'sending'}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl px-4 py-3 text-sm transition-colors"
              >
                {state === 'sending' ? t('auth.sending') : t('auth.sendLink')}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  )
}
