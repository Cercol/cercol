/**
 * AuthPage — three sign-in methods:
 *   1. Google OAuth (button)
 *   2. Email + password (sign in / sign up)
 *   3. Magic link (email only, no password)
 *
 * Layout:
 *   [Google button]
 *   — or —
 *   [email field]
 *   [Password] [Magic link]   ← method tabs
 *   [password field]          ← password method only
 *   [Sign in / Create account toggle] ← password method only
 *   [Submit button]
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'

const INPUT_CLASS =
  'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 ' +
  'focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition'

const BTN_PRIMARY =
  'w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl px-4 py-3 text-sm transition-colors'

export default function AuthPage() {
  const { t } = useTranslation()
  const { signIn, signInWithPassword, signUp, signInWithGoogle } = useAuth()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [method,   setMethod]   = useState('password')   // 'password' | 'magic'
  const [mode,     setMode]     = useState('signin')      // 'signin' | 'signup'  (password only)
  const [status,   setStatus]   = useState('idle')        // 'idle' | 'busy' | 'sent' | 'confirmed'
  const [errorMsg, setErrorMsg] = useState('')

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
      if (method === 'magic') {
        await signIn(email)
        setStatus('sent')
      } else if (mode === 'signin') {
        await signInWithPassword(email, password)
        // onAuthStateChange handles redirect; just stay busy
      } else {
        const { needsConfirmation } = await signUp(email, password)
        setStatus(needsConfirmation ? 'sent' : 'idle')
      }
    } catch (e) {
      setError(e.message ?? t('auth.error'))
    }
  }

  // ── Sent / confirmed state ──────────────────────────────────────────────
  if (status === 'sent') {
    const isMagic = method === 'magic'
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center">
          <p className="text-2xl mb-2">✉️</p>
          <h1 className="text-lg font-bold text-gray-900 mb-2">
            {isMagic ? t('auth.sentHeading') : t('auth.confirmHeading')}
          </h1>
          <p className="text-sm text-gray-500 mb-1">
            {isMagic ? t('auth.sentBody', { email }) : t('auth.confirmBody', { email })}
          </p>
          <p className="text-xs text-gray-400 mt-4">{t('auth.sentNote')}</p>
          <button
            onClick={() => { setStatus('idle'); setErrorMsg('') }}
            className="mt-6 text-sm text-blue-600 hover:underline"
          >
            {t('auth.tryAgain')}
          </button>
        </div>
      </main>
    )
  }

  // ── Main form ───────────────────────────────────────────────────────────
  const isPasswordMode = method === 'password'
  const submitLabel = status === 'busy'
    ? t('auth.sending')
    : isPasswordMode
      ? (mode === 'signup' ? t('auth.createAccount') : t('auth.signInCta'))
      : t('auth.sendLink')

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col gap-5">

          <div>
            <h1 className="text-lg font-bold text-gray-900">{t('auth.signIn')}</h1>
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={status === 'busy'}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
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

            {/* Method tabs */}
            <div className="flex rounded-xl border border-gray-200 overflow-hidden text-xs font-semibold">
              {['password', 'magic'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={[
                    'flex-1 py-2 transition-colors',
                    method === m
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
                  ].join(' ')}
                >
                  {m === 'password' ? t('auth.methodPassword') : t('auth.methodMagic')}
                </button>
              ))}
            </div>

            {/* Password field */}
            {isPasswordMode && (
              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  {t('auth.passwordLabel')}
                </label>
                <input
                  id="password"
                  type="password"
                  required={isPasswordMode}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? t('auth.passwordNewPlaceholder') : t('auth.passwordPlaceholder')}
                  className={INPUT_CLASS}
                />
              </div>
            )}

            {/* Error */}
            {errorMsg && (
              <p className="text-xs text-red-500">{errorMsg}</p>
            )}

            {/* Submit */}
            <button type="submit" disabled={status === 'busy'} className={BTN_PRIMARY}>
              {submitLabel}
            </button>

            {/* Sign-in / Sign-up toggle (password only) */}
            {isPasswordMode && (
              <p className="text-center text-xs text-gray-400">
                {mode === 'signin' ? t('auth.noAccount') : t('auth.haveAccount')}{' '}
                <button
                  type="button"
                  onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setErrorMsg('') }}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  {mode === 'signin' ? t('auth.createAccount') : t('auth.signInCta')}
                </button>
              </p>
            )}

          </form>
        </div>
      </div>
    </main>
  )
}
