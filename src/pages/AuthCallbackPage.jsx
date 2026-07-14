/**
 * AuthCallbackPage — handles two types of auth redirects:
 *
 *   1. Magic link:    /auth/callback?type=magic&token=<token>
 *      → POST /auth/magic-link/verify → receive access+refresh tokens → store → redirect home
 *
 *   2. Google OAuth:  /auth/callback?access_token=<at>&refresh_token=<rt>
 *      → Backend redirects here with tokens already in the URL → store → redirect home
 *
 *   3. Email verify:  /auth/callback?type=verify&token=<token>
 *      → POST /auth/verify-email → marks the account verified (unlocking the free
 *        Full Moon slot) → redirect to /full-moon. No tokens: the account already
 *        has its session from signup; this only flips email_verified.
 *
 * On error, redirects to /auth with ?error=... query param.
 */
import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export default function AuthCallbackPage() {
  const navigate      = useNavigate()
  const [params]      = useSearchParams()
  const { t }         = useTranslation()
  const { applySession } = useAuth()
  const handledRef    = useRef(false)

  useEffect(() => {
    if (handledRef.current) return
    handledRef.current = true

    // Immediately clear tokens from the visible URL and browser history
    // so they never appear in server logs or browser history entries.
    window.history.replaceState({}, '', window.location.pathname)

    async function handle() {
      const type        = params.get('type')
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const error       = params.get('error')

      // Error from Google OAuth callback
      if (error) {
        navigate(`/auth?error=${encodeURIComponent(error)}`, { replace: true })
        return
      }

      // Case 1: Magic link
      if (type === 'magic') {
        const token = params.get('token')
        if (!token) {
          navigate('/auth?error=missing_token', { replace: true })
          return
        }
        try {
          const res = await fetch(`${API_URL}/auth/magic-link/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          })
          if (!res.ok) {
            const body = await res.json().catch(() => ({}))
            const msg  = encodeURIComponent(body.detail ?? 'magic_link_error')
            navigate(`/auth?error=${msg}`, { replace: true })
            return
          }
          const data = await res.json()
          await applySession(data.access_token, data.refresh_token)
          navigate('/', { replace: true })
        } catch {
          navigate('/auth?error=network_error', { replace: true })
        }
        return
      }

      // Case 1b: Email verification (password signup)
      if (type === 'verify') {
        const token = params.get('token')
        if (!token) {
          navigate('/auth?error=missing_token', { replace: true })
          return
        }
        try {
          const res = await fetch(`${API_URL}/auth/verify-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          })
          if (!res.ok) {
            const body = await res.json().catch(() => ({}))
            const msg  = encodeURIComponent(body.detail ?? 'verify_error')
            navigate(`/auth?error=${msg}`, { replace: true })
            return
          }
          // Verified: land on the now-unlocked Full Moon instrument.
          navigate('/full-moon', { replace: true })
        } catch {
          navigate('/auth?error=network_error', { replace: true })
        }
        return
      }

      // Case 2: Google OAuth (tokens already in URL)
      if (accessToken && refreshToken) {
        await applySession(accessToken, refreshToken)
        navigate('/', { replace: true })
        return
      }

      // Unknown / incomplete params
      navigate('/auth?error=unknown_callback', { replace: true })
    }

    handle()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="flex items-center justify-center py-24">
      <p className="text-sm text-gray-400">{t('auth.signingIn')}</p>
    </main>
  )
}
