/**
 * AuthCallbackPage — handles the redirect from a Supabase magic link.
 *
 * Supabase redirects here after the user clicks the email link.
 * The Supabase client (detectSessionInUrl: true by default) automatically
 * exchanges the code/token in the URL for a session.
 * We just wait for the SIGNED_IN event, then redirect home.
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'

export default function AuthCallbackPage() {
  const navigate    = useNavigate()
  const { t }       = useTranslation()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        navigate('/', { replace: true })
      }
      if (event === 'SIGNED_OUT') {
        navigate('/auth', { replace: true })
      }
    })

    // If the session was already established before this component mounted
    // (detectSessionInUrl processed the URL synchronously), redirect immediately.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/', { replace: true })
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-sm text-gray-400">{t('auth.signingIn')}</p>
    </main>
  )
}
