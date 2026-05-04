/**
 * AuthContext — provides user session state, profile state, and auth actions.
 *
 * Token strategy:
 *   • access_token  → module-level variable in tokens.js (cleared on page reload)
 *   • refresh_token → localStorage key `cercol_rt` (survives page reload)
 *
 * On mount: if a refresh token exists, silently exchange it for a new access
 * token and decode the user payload from the JWT.  This is the only async step
 * before `loading` becomes false.
 *
 * Exposes:
 *   user                        — { id, email } or null
 *   profile                     — profiles row or null (loads after user resolves)
 *   loading                     — true while the initial session check is in progress
 *   refreshProfile()            — re-fetches profile from the API
 *   markOnboardingSeen()        — sets onboarding_seen=true locally + persists to API
 *   signIn(email)               — sends a magic link; throws on error
 *   signInWithPassword(e, p)    — email + password sign-in; throws on error
 *   signUp(email, password)     — creates account; throws on error
 *   signInWithGoogle()          — redirects to Google OAuth flow
 *   signOut()                   — clears tokens and session state
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  getAccessToken, setAccessToken, clearAccessToken,
  getRefreshToken, setRefreshToken, clearRefreshToken,
} from '../lib/tokens'
import { getMyProfile, updateMyProfile } from '../lib/api'

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

const AuthContext = createContext(null)

// ── JWT decoder (no verification — backend validates on every API call) ────────

function _decodeJWT(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return { id: payload.sub, email: payload.email ?? null }
  } catch {
    return null
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // ── Internal helpers ────────────────────────────────────────────────────────

  const _applyTokens = useCallback((accessToken, refreshToken) => {
    setAccessToken(accessToken)
    setRefreshToken(refreshToken)
    const decoded = _decodeJWT(accessToken)
    setUser(decoded)
    return decoded
  }, [])

  const _clearSession = useCallback(() => {
    clearAccessToken()
    clearRefreshToken()
    setUser(null)
    setProfile(null)
  }, [])

  const fetchProfile = useCallback(async () => {
    try {
      const data = await getMyProfile()
      setProfile(data ?? null)
    } catch {
      setProfile(null)
    }
  }, [])

  // ── Bootstrap: restore session from stored refresh token ───────────────────

  useEffect(() => {
    async function init() {
      const rt = getRefreshToken()
      if (!rt) {
        setLoading(false)
        return
      }
      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: rt }),
        })
        if (!res.ok) throw new Error('Refresh failed')
        const data = await res.json()
        _applyTokens(data.access_token, data.refresh_token)
        await fetchProfile()
      } catch {
        _clearSession()
      } finally {
        setLoading(false)
      }
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Public actions ──────────────────────────────────────────────────────────

  async function refreshProfile() {
    if (getAccessToken()) await fetchProfile()
  }

  async function markOnboardingSeen() {
    // Optimistic local update — closes the modal immediately.
    setProfile(prev => prev ? { ...prev, onboarding_seen: true } : prev)
    // Persist to localStorage as a redundant browser-side guard.
    localStorage.setItem('cercol_onboarding_seen', '1')
    try {
      await updateMyProfile({ onboarding_seen: true })
    } catch {
      // Silently fail — localStorage fallback prevents re-showing the modal.
    }
  }

  async function signIn(email) {
    const res = await fetch(`${API_URL}/auth/magic-link/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.detail ?? 'Failed to send magic link')
    }
  }

  async function signInWithPassword(email, password) {
    const res = await fetch(`${API_URL}/auth/password/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.detail ?? 'Invalid credentials')
    }
    const data = await res.json()
    _applyTokens(data.access_token, data.refresh_token)
    await fetchProfile()
  }

  async function signUp(email, password) {
    const res = await fetch(`${API_URL}/auth/password/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.detail ?? 'Signup failed')
    }
    const data = await res.json()
    _applyTokens(data.access_token, data.refresh_token)
    await fetchProfile()
  }

  function signInWithGoogle() {
    // Navigate directly — Google OAuth is a full-page redirect flow.
    window.location.href = `${API_URL}/auth/google`
  }

  function signOut() {
    // Clear the local session immediately so the UI responds instantly.
    const rt = getRefreshToken()
    _clearSession()

    // Fire-and-forget: revoke the refresh token on the backend.
    // If this request fails or times out, the token will expire naturally (30 days).
    if (rt) {
      fetch(`${API_URL}/auth/signout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: rt }),
      }).catch(() => {})
    }
  }

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      refreshProfile, markOnboardingSeen,
      signIn, signInWithPassword, signUp, signInWithGoogle, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (ctx === null) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
