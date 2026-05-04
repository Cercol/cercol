/**
 * tokens.js — in-memory access token + localStorage refresh token storage.
 *
 * Access token: stored in a module-level variable (never in localStorage/cookies)
 *   so it is cleared on page refresh and not accessible to other scripts.
 *
 * Refresh token: stored in localStorage under REFRESH_KEY so sessions survive
 *   page reloads.  Cleared on signout.
 */

const REFRESH_KEY = 'cercol_rt'

/** @type {string|null} */
let _accessToken = null

// ── Access token ─────────────────────────────────────────────────────────────

export function getAccessToken() {
  return _accessToken
}

export function setAccessToken(token) {
  _accessToken = token
}

export function clearAccessToken() {
  _accessToken = null
}

// ── Refresh token ─────────────────────────────────────────────────────────────

export function getRefreshToken() {
  try {
    return localStorage.getItem(REFRESH_KEY)
  } catch {
    return null
  }
}

export function setRefreshToken(token) {
  try {
    localStorage.setItem(REFRESH_KEY, token)
  } catch {
    // Ignore (e.g. private browsing quota)
  }
}

export function clearRefreshToken() {
  try {
    localStorage.removeItem(REFRESH_KEY)
  } catch {
    // Ignore
  }
}
