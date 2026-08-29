/**
 * AuthPage — two sign-in methods: Google, and a magic link by email.
 *
 * Passwords were retired on the server (410, see worker/src/auth.js
 * passwordGone) because bcrypt does not fit the Worker CPU budget. The form
 * kept offering them, and kept defaulting to them, so the first thing a
 * visitor met was a password field whose submit answered "Password sign-in
 * has been retired". That is the screen every account starts on, and the
 * launch promotion is an account.
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { takeNextPath } from '../lib/api'
import { Card, Button } from '../components/ui'

const INPUT_CLASS =
  'w-full border border-gray-200 rounded px-4 py-3 text-sm text-gray-900 placeholder-gray-400 ' +
  'focus:outline-none focus:border-[var(--mm-color-blue)] focus:ring-1 focus:ring-[var(--mm-color-blue)]/40 transition'

export default function AuthPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, signIn, signInWithGoogle } = useAuth()

  const [email,    setEmail]    = useState('')
  const [status,   setStatus]   = useState('idle')        // 'idle' | 'busy' | 'sent' | 'confirmed'
  const [errorMsg, setErrorMsg] = useState('')

  // Redirect once signed in: back to where the sign-in started (the Full
  // Moon gate leaves a marker) or home. 'sent' holds on the "check your
  // email" card because the magic link has not been clicked yet.
  useEffect(() => {
    if (user && status !== 'sent') navigate(takeNextPath() || '/', { replace: true })
  }, [user, status, navigate])

  function setError(msg) { setStatus('idle'); setErrorMsg(msg) }
  function setBusy()      { setStatus('busy'); setErrorMsg('') }

  async function handleGoogle() {
    setBusy()
    try { await signInWithGoogle() }
    catch (e) { setError(e.message ?? t('auth.error')) }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy()
    try {
      await signIn(email)
      setStatus('sent')
    } catch (e) {
      setError(e.message ?? t('auth.error'))
    }
  }

  // ── Sent / confirmed state ──────────────────────────────────────────────
  if (status === 'sent') {
    return (
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-16">
        <Card className="w-full max-w-sm p-8 shadow-sm text-center">
          <p className="text-2xl mb-2">✉️</p>
          <h1 className="text-lg font-bold text-gray-900 mb-2">
            {t('auth.sentHeading')}
          </h1>
          <p className="text-sm text-gray-500 mb-1">
            {t('auth.sentBody', { email })}
          </p>
          <p className="text-xs text-gray-400 mt-4">{t('auth.sentNote')}</p>
          <button
            onClick={() => { setStatus('idle'); setErrorMsg('') }}
            className="mt-6 text-sm text-[var(--mm-color-blue)] hover:underline"
          >
            {t('auth.tryAgain')}
          </button>
        </Card>
      </main>
    )
  }

  // ── Main form ───────────────────────────────────────────────────────────
  const submitLabel = status === 'busy' ? t('auth.sending') : t('auth.sendLink')

  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-16">
      <div className="w-full max-w-sm">
        <Card className="p-8 shadow-sm flex flex-col gap-5">

          <div>
            <h1 className="text-lg font-bold text-gray-900">{t('auth.signIn')}</h1>
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={status === 'busy'}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"/>
            </svg>
            {t('auth.continueWithGoogle')}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">{t('auth.or')}</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Email + method form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Email */}
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
                className={INPUT_CLASS}
              />
            </div>

            {/* Error */}
            {errorMsg && (
              <p className="text-xs text-red-500">{errorMsg}</p>
            )}

            {/* Submit */}
            <Button type="submit" variant="primary" disabled={status === 'busy'} className="w-full">
              {submitLabel}
            </Button>

          </form>
        </Card>
      </div>
    </main>
  )
}
