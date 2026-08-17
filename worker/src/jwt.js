/**
 * HS256 JWT, compatible byte-for-byte with what api/auth.py issues.
 *
 * # Spec: docs/architecture/auth.md
 *
 * Same secret (JWT_SECRET), same algorithm, same claims (sub, email, aud,
 * iat, exp), same audience "authenticated". A token minted here validates
 * on the FastAPI server and vice versa, which is what lets the two run side
 * by side during the cutover: a user who signed in on one keeps their
 * session on the other.
 *
 * WebCrypto HMAC is native and does not count against the 10 ms CPU budget
 * in any way that matters; verify() is a few hundred microseconds.
 */

const ACCESS_TTL_S = 60 * 60          // api/auth.py: _ACCESS_TTL = 1 hour
const AUDIENCE = 'authenticated'      // api/auth.py: _JWT_AUDIENCE

const enc = new TextEncoder()

function b64url(bytes) {
  let s = ''
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function b64urlDecode(str) {
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4))
  const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/') + pad)
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}

async function hmacKey(secret) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}

/** Mint an access token for a user. */
export async function issueAccessToken(secret, userId, email) {
  const now = Math.floor(Date.now() / 1000)
  const header = b64url(enc.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })))
  const payload = b64url(enc.encode(JSON.stringify({
    sub: userId, email, aud: AUDIENCE, iat: now, exp: now + ACCESS_TTL_S,
  })))
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(`${header}.${payload}`))
  return `${header}.${payload}.${b64url(sig)}`
}

/**
 * Verify a token and return its payload, or null.
 *
 * Rejects: wrong signature, wrong alg, wrong audience, expired. Mirrors what
 * python-jose's jwt.decode(..., algorithms=["HS256"], audience=AUDIENCE) does
 * in api/deps.py, so a token that fails there fails here.
 */
export async function verifyAccessToken(secret, token) {
  if (typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [h, p, s] = parts
  let header, payload
  try {
    header = JSON.parse(new TextDecoder().decode(b64urlDecode(h)))
    payload = JSON.parse(new TextDecoder().decode(b64urlDecode(p)))
  } catch {
    return null
  }
  if (header.alg !== 'HS256') return null
  const ok = await crypto.subtle.verify('HMAC', await hmacKey(secret), b64urlDecode(s), enc.encode(`${h}.${p}`))
  if (!ok) return null
  if (payload.aud !== AUDIENCE) return null
  if (typeof payload.exp !== 'number' || payload.exp <= Math.floor(Date.now() / 1000)) return null
  return payload
}

/** Bearer token from a request, or null. */
export function bearerFrom(request) {
  const h = request.headers.get('authorization') || ''
  const m = h.match(/^Bearer\s+(.+)$/i)
  return m ? m[1].trim() : null
}

/** URL-safe random token, same shape as Python's secrets.token_urlsafe(48). */
export function randomToken(bytes = 48) {
  const buf = new Uint8Array(bytes)
  crypto.getRandomValues(buf)
  return b64url(buf)
}
