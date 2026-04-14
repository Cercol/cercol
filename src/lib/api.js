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
 * @param {boolean} linkAsUser — if true and the user is signed in, attaches Bearer
 *   so the backend can record witness_user_id on the session.
 */
export async function completeWitnessSession(token, scores, linkAsUser = false) {
  const fetcher = linkAsUser ? authFetch : publicFetch
  return fetcher(`/witness/session/${token}/complete`, {
    method: 'POST',
    body: JSON.stringify({ scores }),
  })
}

/**
 * getMyWitnessContributions — returns sessions the signed-in user has completed as a witness.
 * @returns {Promise<Array<{subject_display: string, completed_at: string}>>}
 */
export async function getMyWitnessContributions() {
  return authFetch('/witness/my-contributions')
}

/**
 * getMyWitnessSessions — fetch all witness sessions for the signed-in user.
 * @returns {Promise<Array>}
 */
export async function getMyWitnessSessions() {
  return authFetch('/witness/my-sessions')
}

// ── Groups ────────────────────────────────────────────────────────────────

/**
 * createGroup — creates a new group and optionally invites members by email.
 * @param {string} name
 * @param {string[]} emails
 * @returns {Promise<{id: string, name: string, errors: string[]}>}
 */
export async function createGroup(name, emails = []) {
  return authFetch('/groups', {
    method: 'POST',
    body: JSON.stringify({ name, emails }),
  })
}

/**
 * getMyGroups — returns all groups the signed-in user is an active member of.
 * @returns {Promise<Array>}
 */
export async function getMyGroups() {
  return authFetch('/groups/mine')
}

/**
 * getPendingInvitations — returns pending group invitations for the signed-in user.
 * @returns {Promise<Array<{group_id, group_name, invited_at}>>}
 */
export async function getPendingInvitations() {
  return authFetch('/groups/pending')
}

/**
 * acceptGroupInvitation — accept a pending invitation.
 * @param {string} groupId
 */
export async function acceptGroupInvitation(groupId) {
  return authFetch(`/groups/${groupId}/accept`, { method: 'POST' })
}

/**
 * declineGroupInvitation — decline (delete) a pending invitation.
 * @param {string} groupId
 */
export async function declineGroupInvitation(groupId) {
  return authFetch(`/groups/${groupId}/decline`, { method: 'POST' })
}

/**
 * getGroupReportData — fetch member OCEAN z-scores and roles for a group.
 * Requires active membership.
 * @param {string} groupId
 */
export async function getGroupReportData(groupId) {
  return authFetch(`/groups/${groupId}/report-data`)
}

// ── Results ───────────────────────────────────────────────────────────────

/**
 * getLatestFullMoonResult — fetch the most recent fullMoon result row for a user.
 * Returns null if no result exists.
 * @param {string} userId
 * @returns {Promise<{presence,bond,discipline,depth,vision,facets}|null>}
 */
export async function getLatestFullMoonResult(userId) {
  const { data } = await supabase
    .from('results')
    .select('presence,bond,discipline,depth,vision,facets')
    .eq('user_id', userId)
    .eq('instrument', 'fullMoon')
    .order('created_at', { ascending: false })
    .limit(1)
  return data?.length ? data[0] : null
}
