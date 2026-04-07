/**
 * Authenticated and public fetch helpers for the Cèrcol backend (api.cercol.team).
 * Authenticated calls attach the current Supabase session access token as Bearer.
 */
import { supabase } from './supabase'

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

// ── Private helpers ────────────────────────────────────────────────────────

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

async function publicFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API error ${res.status}: ${text}`)
  }

  return res.json()
}

// ── Stripe ────────────────────────────────────────────────────────────────

export async function createCheckoutSession() {
  return authFetch('/checkout', { method: 'POST' })
}

// ── Witness Cèrcol ────────────────────────────────────────────────────────

/**
 * createWitnessSessions — creates up to 12 witness sessions.
 * @param {Array<{name: string, email?: string}>} witnesses
 * @returns {Promise<Array<{token, name, link}>>}
 */
export async function createWitnessSessions(witnesses) {
  return authFetch('/witness/sessions', {
    method: 'POST',
    body: JSON.stringify({ witnesses }),
  })
}

/**
 * getWitnessSession — public lookup by token.
 * @param {string} token
 * @returns {Promise<{witness_name: string, completed: boolean}>}
 */
export async function getWitnessSession(token) {
  return publicFetch(`/witness/session/${token}`)
}

/**
 * completeWitnessSession — submit domain scores for a witness session.
 * @param {string} token
 * @param {{presence, bond, discipline, depth, vision}} scores
 */
export async function completeWitnessSession(token, scores) {
  return publicFetch(`/witness/session/${token}/complete`, {
    method: 'POST',
    body: JSON.stringify({ scores }),
  })
}

/**
 * getMyWitnessSessions — fetch all witness sessions for the signed-in user.
 * @returns {Promise<Array>}
 */
export async function getMyWitnessSessions() {
  return authFetch('/witness/my-sessions')
}
