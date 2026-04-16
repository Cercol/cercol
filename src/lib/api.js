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

/** authFetchBlob — like authFetch but returns a Blob (for CSV downloads). */
async function authFetchBlob(path) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.blob()
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
 * logResult — log an instrument result via the backend API.
 * Attaches auth token if the user is signed in (links result to account).
 * @param {{ instrument, language?, presence?, bond?, discipline?, depth?, vision?, facets? }} params
 */
export async function logResult({ instrument, language, presence, bond, discipline, depth, vision, facets }) {
  const { data: { session } } = await supabase.auth.getSession()
  const fetcher = session ? authFetch : publicFetch
  return fetcher('/results', {
    method: 'POST',
    body: JSON.stringify({ instrument, language, presence, bond, discipline, depth, vision, facets }),
  })
}

/**
 * getMyResults — returns all results for the authenticated user, newest first.
 * @returns {Promise<Array>}
 */
export async function getMyResults() {
  return authFetch('/me/results')
}

/**
 * getMyProfile — returns the authenticated user's profile (including premium flag).
 * Creates the profile row if it does not exist yet.
 * @returns {Promise<{id, premium, first_name, last_name, country, native_language}>}
 */
export async function getMyProfile() {
  return authFetch('/me/profile')
}

/**
 * updateMyProfile — updates mutable profile fields.
 * @param {{ first_name?, last_name?, country?, native_language? }} fields
 */
export async function updateMyProfile(fields) {
  return authFetch('/me/profile', {
    method: 'PATCH',
    body: JSON.stringify(fields),
  })
}

/**
 * getLatestFullMoonResult — fetch the most recent fullMoon result for the signed-in user.
 * Returns null if no result exists.
 * @returns {Promise<{presence,bond,discipline,depth,vision,facets}|null>}
 */
export async function getLatestFullMoonResult() {
  const results = await getMyResults()
  return results.find(r => r.instrument === 'fullMoon') ?? null
}

// ── Admin ─────────────────────────────────────────────────────────────────

/** getAdminStats — global KPI counters (users + results). Admin only. */
export async function getAdminStats() {
  return authFetch('/admin/stats')
}

/**
 * getAdminUsers — paginated user list.
 * @param {{ offset?: number, limit?: number, search?: string }} params
 */
export async function getAdminUsers({ offset = 0, limit = 25, search = '' } = {}) {
  const q = new URLSearchParams({ offset, limit, ...(search ? { search } : {}) })
  return authFetch(`/admin/users?${q}`)
}

/**
 * getAdminResults — paginated results list.
 * @param {{ offset?: number, limit?: number, instrument?: string }} params
 */
export async function getAdminResults({ offset = 0, limit = 25, instrument = '' } = {}) {
  const q = new URLSearchParams({ offset, limit, ...(instrument ? { instrument } : {}) })
  return authFetch(`/admin/results?${q}`)
}

/**
 * downloadAdminCSV — fetch a CSV export from the admin API and trigger a browser download.
 * @param {'users' | 'results'} type
 * @param {{ instrument?: string }} filters
 */
export async function downloadAdminCSV(type, filters = {}) {
  const q = new URLSearchParams(filters)
  const path = `/admin/${type}/export.csv${q.toString() ? '?' + q : ''}`
  const blob = await authFetchBlob(path)
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `cercol_${type}_${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
