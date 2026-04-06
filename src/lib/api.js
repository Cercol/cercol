/**
 * Authenticated fetch helper for the Cèrcol backend (api.cercol.team).
 * Attaches the current Supabase session access token as a Bearer header.
 */
import { supabase } from './supabase'

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

async function authFetch(path, options = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      ...(options.headers ?? {}),
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API error ${res.status}: ${text}`)
  }

  return res.json()
}

export async function createCheckoutSession() {
  return authFetch('/checkout', { method: 'POST' })
}
