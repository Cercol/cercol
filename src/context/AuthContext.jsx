/**
 * AuthContext — provides user session state, profile state, and auth actions.
 *
 * Exposes:
 *   user                        — Supabase User object or null
 *   profile                     — profiles row or null (loads after user resolves)
 *   loading                     — true while the initial session check is in progress
 *   refreshProfile()            — re-fetches profile from Supabase
 *   signIn(email)               — sends a magic link; throws on error
 *   signInWithPassword(e, p)    — email + password sign-in; throws on error
 *   signUp(email, password)     — creates account; throws on error
 *   signInWithGoogle()          — OAuth redirect; throws on error
 *   signOut()                   — clears the session
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getMyProfile } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) { setProfile(null); return }
    try {
      const data = await getMyProfile()
      setProfile(data ?? null)
    } catch {
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      fetchProfile(u?.id ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      fetchProfile(u?.id ?? null)
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  async function refreshProfile() {
    if (user) await fetchProfile(user.id)
  }

  async function signIn(email) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) throw error
  }

  async function signInWithPassword(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return { needsConfirmation: !data.session }
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, signIn, signInWithPassword, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
