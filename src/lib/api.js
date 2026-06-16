/**
 * Authenticated and public fetch helpers for the Cèrcol backend (api.cercol.team).
 *
 * Authenticated calls attach the current access token as Bearer.
 * On 401, a single automatic token refresh is attempted before failing.
 */
import {
  getAccessToken, setAccessToken, clearAccessToken,
  getRefreshToken, setRefreshToken, clearRefreshToken,
} from './tokens'

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

// ── Token refresh ─────────────────────────────────────────────────────────────

/**
 * In-flight refresh promise — ensures concurrent 401s only fire one refresh
 * request rather than a stampede of parallel calls.
 * @type {Promise<string|null>|null}
 */
let _refreshPromise = null

/** Execute a single refresh HTTP request. */
async function _doRefresh() {
  const rt = getRefreshToken()
  if (!rt) return null

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: rt }),
    })
    if (!res.ok) return null
    const data = await res.json()
    setAccessToken(data.access_token)
    setRefreshToken(data.refresh_token)
    return data.access_token
  } catch {
    return null
  }
}

/**
 * Attempt to refresh the access token using the stored refresh token.
 * Deduplicates concurrent calls — multiple simultaneous 401s share one request.
 * Returns the new access token on success, or null on failure.
 */
function _tryRefresh() {
  if (!_refreshPromise) {
    _refreshPromise = _doRefresh().finally(() => {
      _refreshPromise = null
    })
  }
  return _refreshPromise
}

// ── Private helpers ────────────────────────────────────────────────────────────

async function authFetch(path, options = {}) {
  const token = getAccessToken()
  if (!token) throw new Error('Not authenticated')

  const makeRequest = (t) =>
    fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${t}`,
        ...(options.headers ?? {}),
      },
    })

  let res = await makeRequest(token)

  // Auto-refresh on 401 and retry once
  if (res.status === 401) {
    const newToken = await _tryRefresh()
    if (!newToken) {
      clearAccessToken()
      clearRefreshToken()
      throw new Error('Session expired')
    }
    res = await makeRequest(newToken)
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API error ${res.status}: ${text}`)
  }

  return res.json()
}

/** authFetchBlob — like authFetch but returns a Blob (for CSV downloads). */
async function authFetchBlob(path) {
  const token = getAccessToken()
  if (!token) throw new Error('Not authenticated')

  const makeRequest = (t) =>
    fetch(`${API_URL}${path}`, {
      headers: { Authorization: `Bearer ${t}` },
    })

  let res = await makeRequest(token)

  if (res.status === 401) {
    const newToken = await _tryRefresh()
    if (!newToken) {
      clearAccessToken()
      clearRefreshToken()
      throw new Error('Session expired')
    }
    res = await makeRequest(newToken)
  }

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

// ── Beta promotion ────────────────────────────────────────────────────────────

/**
 * getBetaStatus — public endpoint, no auth required.
 * @returns {Promise<{remaining: number, total: number, active: boolean}>}
 */
export async function getBetaStatus() {
  return publicFetch('/beta')
}

// ── Password management ───────────────────────────────────────────────────────

/**
 * setMyPassword — set or change the password for the authenticated user.
 * @param {{ currentPassword?: string, newPassword: string }} params
 *   currentPassword is required when the account already has a password.
 */
export async function setMyPassword({ currentPassword, newPassword }) {
  return authFetch('/me/password', {
    method: 'POST',
    body: JSON.stringify({
      password: newPassword,
      ...(currentPassword ? { current_password: currentPassword } : {}),
    }),
  })
}

// ── Stripe ────────────────────────────────────────────────────────────────────

export async function createCheckoutSession() {
  return authFetch('/checkout', { method: 'POST' })
}

// ── Witness Cèrcol ────────────────────────────────────────────────────────────

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
 * @param {boolean} linkAsUser — if true and signed in, attaches Bearer so
 *   the backend records witness_user_id on the session.
 */
export async function completeWitnessSession(token, scores, linkAsUser = false) {
  const useAuth = linkAsUser && getAccessToken() !== null
  const fetcher = useAuth ? authFetch : publicFetch
  return fetcher(`/witness/session/${token}/complete`, {
    method: 'POST',
    body: JSON.stringify({ scores }),
  })
}

/**
 * getMyWitnessContributions — sessions the signed-in user has completed as a witness.
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

// ── Groups ────────────────────────────────────────────────────────────────────

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

// ── Results ───────────────────────────────────────────────────────────────────

/**
 * logResult — log an instrument result via the backend API.
 * Attaches auth token if the user is signed in (links result to account).
 * @param {{ instrument, language?, presence?, bond?, discipline?, depth?, vision?, facets? }} params
 */
export async function logResult({
  instrument, language, presence, bond, discipline, depth, vision, facets,
}) {
  const useAuth = getAccessToken() !== null
  const fetcher = useAuth ? authFetch : publicFetch
  return fetcher('/results', {
    method: 'POST',
    body: JSON.stringify({
      instrument, language, presence, bond, discipline, depth, vision, facets,
    }),
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
 * anonymiseResult — permanently unlinks a result from the user's account.
 * The row is retained in the database for population-level averages.
 * @param {string} resultId
 * @returns {Promise<{ok: boolean}>}
 */
export async function anonymiseResult(resultId) {
  return authFetch(`/me/results/${resultId}`, { method: 'DELETE' })
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

// ── Blog ──────────────────────────────────────────────────────────────────────

/**
 * getBlogPosts — fetch the list of published blog posts.
 * @returns {Promise<Array<{slug, title, description, published_at, view_count, author, cover_url}>>}
 */
export async function getBlogPosts() {
  return publicFetch('/blog')
}

/**
 * getBlogPost — fetch a single blog post by slug.
 * @param {string} slug
 * @returns {Promise<{slug, title, description, content, published_at, view_count, author, cover_url, status}>}
 */
export async function getBlogPost(slug) {
  return publicFetch(`/blog/${slug}`)
}

/**
 * trackBlogView — fire-and-forget POST to record a view on a blog post.
 * Never throws — any error is silently swallowed.
 * @param {string} slug
 */
export async function trackBlogView(slug) {
  // Skip during the prerender pass: prerender.mjs sets window.__PRERENDER__ at
  // runtime (never serialized into the saved HTML), so this guard suppresses
  // the build-time view inflation while real users still count.
  if (typeof window !== 'undefined' && window.__PRERENDER__) return
  try {
    await publicFetch(`/blog/${slug}/view`, { method: 'POST' })
  } catch {
    // Intentionally ignored — view tracking is best-effort
  }
  // First-party funnel signal (real human article view). After the prerender
  // guard so bots/prerender are excluded. Fire-and-forget.
  trackEvent('article_view', {
    slug,
    path: typeof window !== 'undefined' ? (window.location?.pathname ?? null) : null,
  })
}

/**
 * getAnonId — lazily create and return an opaque, cookie-less visitor id.
 * Persisted in localStorage so page-views from the same browser can be
 * counted as one unique visitor in the weekly digest. NEVER tied to an
 * account (matches the events.anon_id contract in migration 019). Returns
 * null in non-browser/prerender contexts or if storage is unavailable.
 * @returns {string|null}
 */
export function getAnonId() {
  if (typeof window === 'undefined' || window.__PRERENDER__) return null
  try {
    let id = localStorage.getItem('cercol_anon')
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem('cercol_anon', id)
    }
    return id
  } catch {
    // Storage blocked (private mode, etc.): degrade to anonymous-without-id.
    return null
  }
}

/**
 * trackEvent — fire-and-forget first-party funnel event POST to /events.
 * Never throws — any error is silently swallowed, so it safely no-ops until
 * the events table and endpoint are live. Skipped during the prerender pass.
 * @param {'article_view'|'cta_click'|'test_start'|'page_view'} name
 * @param {{slug?, instrument?, lang?, path?, anon_id?}} [payload]
 */
export async function trackEvent(name, payload = {}) {
  if (typeof window !== 'undefined' && window.__PRERENDER__) return
  try {
    await publicFetch('/events', {
      method: 'POST',
      body: JSON.stringify({ name, ...payload }),
    })
  } catch {
    // Intentionally ignored — event tracking is best-effort
  }
}

/**
 * createBlogPost — create a new blog post. Admin only.
 * @param {{ slug, author, cover_url?, title, description, content }} data
 */
export async function createBlogPost(data) {
  return authFetch('/blog', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * updateBlogPost — update an existing blog post. Admin only.
 * @param {string} slug
 * @param {{ author?, cover_url?, title?, description?, content? }} data
 */
export async function updateBlogPost(slug, data) {
  return authFetch(`/blog/${slug}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * patchBlogPostStatus — change the status of a blog post. Admin only.
 * @param {string} slug
 * @param {'published'|'draft'} status
 */
export async function patchBlogPostStatus(slug, status) {
  return authFetch(`/blog/${slug}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

// ── Admin ─────────────────────────────────────────────────────────────────────

/** getAdminStats — global KPI counters (users + results). Admin only. */
export async function getAdminStats() {
  return authFetch('/admin/stats')
}

/** getAdminNorms — current norm cache state (tier active per instrument+language). Admin only. */
export async function getAdminNorms() {
  return authFetch('/admin/norms')
}

/** refreshAdminNorms — force an immediate norm recompute on the server. Admin only. */
export async function refreshAdminNorms() {
  return authFetch('/admin/norms/refresh', { method: 'POST' })
}

// ---------------------------------------------------------------------------
// SEO observability API (Phase 17.6.2). Admin-only, BigQuery-backed.
// ---------------------------------------------------------------------------

/** getSeoSources — row counts + last update per ingest table. */
export async function getSeoSources() {
  return authFetch('/admin/seo/sources')
}

/** getSeoHealth — high-level snapshot KPIs across all sources. */
export async function getSeoHealth() {
  return authFetch('/admin/seo/health')
}

/** getSeoQueries — top queries by impressions, GSC preferred. */
export async function getSeoQueries({ periodDays = 28, minImpressions = 0, limit = 50 } = {}) {
  const q = new URLSearchParams({
    period_days: periodDays, min_impressions: minImpressions, limit,
  })
  return authFetch(`/admin/seo/queries?${q}`)
}

/** getSeoPages — top pages by impressions. */
export async function getSeoPages({ periodDays = 28, limit = 100 } = {}) {
  const q = new URLSearchParams({ period_days: periodDays, limit })
  return authFetch(`/admin/seo/pages?${q}`)
}

/** getSeoAnomalies — pages with >threshold_pct change in 7d vs prior 7d. */
export async function getSeoAnomalies({ thresholdPct = 30 } = {}) {
  const q = new URLSearchParams({ threshold_pct: thresholdPct })
  return authFetch(`/admin/seo/anomalies?${q}`)
}

/** getSeoPageLifecycle — per-day impressions/clicks for a specific URL. */
export async function getSeoPageLifecycle(slug) {
  return authFetch(`/admin/seo/page/${encodeURIComponent(slug)}/lifecycle`)
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
  const q    = new URLSearchParams(filters)
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

/**
 * patchAdminUser — toggle premium or is_admin for a user.
 * @param {string} userId
 * @param {{ premium?: boolean, is_admin?: boolean }} fields
 */
export async function patchAdminUser(userId, fields) {
  return authFetch(`/admin/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  })
}

/**
 * getAdminActivity — daily registration + test counts for sparklines.
 * @param {{ days?: number }} params
 */
export async function getAdminActivity({ days = 30 } = {}) {
  return authFetch(`/admin/activity?days=${days}`)
}
