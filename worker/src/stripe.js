/**
 * Stripe: checkout session and the completion webhook.
 *
 * # Spec: docs/architecture/backend.md
 *
 * No SDK. Both calls are one HTTPS request each, and the webhook signature
 * is HMAC-SHA256 over "<timestamp>.<raw body>" with the endpoint secret,
 * which WebCrypto does natively. Mirrors api/main.py, including the one
 * effect the webhook has: premium = true on checkout.session.completed.
 */

import { requireUser } from './auth.js'
import { httpError, now } from './db.js'

const enc = new TextEncoder()
const front = (env) => env.FRONTEND_URL || 'https://cercol.team'

/** POST /checkout — signed-in only; returns { url }. */
export async function createCheckout(env, request) {
  const user = await requireUser(env, request)
  if (user instanceof Response) return user
  if (!env.STRIPE_PRICE_ID) return httpError(500, 'Stripe price not configured')
  const form = new URLSearchParams({
    mode: 'payment',
    'line_items[0][price]': env.STRIPE_PRICE_ID,
    'line_items[0][quantity]': '1',
    client_reference_id: user.sub,
    success_url: `${front(env)}/full-moon?payment=success`,
    cancel_url: `${front(env)}/full-moon?payment=cancelled`,
  })
  if (user.email) form.set('customer_email', user.email)
  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, 'content-type': 'application/x-www-form-urlencoded' },
    body: form,
  })
  if (!res.ok) return httpError(502, 'Stripe checkout failed')
  const session = await res.json()
  return Response.json({ url: session.url })
}

/**
 * Verify a Stripe-Signature header against the raw body. Same scheme the
 * SDK's Webhook.construct_event applies: v1 = HMAC-SHA256(secret, "t.body"),
 * and the timestamp must be within the tolerance (Stripe's default 300 s).
 */
async function verifySignature(secret, header, rawBody, toleranceS = 300) {
  const parts = Object.fromEntries((header || '').split(',').map((kv) => kv.split('=')))
  const t = parts.t, v1 = parts.v1
  if (!t || !v1) return false
  if (Math.abs(Date.now() / 1000 - Number(t)) > toleranceS) return false
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(`${t}.${rawBody}`)))
  const hex = [...sig].map((b) => b.toString(16).padStart(2, '0')).join('')
  // Constant-time compare on equal-length strings.
  if (hex.length !== v1.length) return false
  let diff = 0
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ v1.charCodeAt(i)
  return diff === 0
}

/** POST /webhooks/stripe */
export async function stripeWebhook(env, request) {
  const raw = await request.text()
  const ok = await verifySignature(env.STRIPE_WEBHOOK_SECRET, request.headers.get('stripe-signature'), raw)
  if (!ok) return httpError(400, 'Invalid webhook signature')
  let event
  try { event = JSON.parse(raw) } catch { return httpError(400, 'Invalid payload') }
  if (event.type === 'checkout.session.completed') {
    const userId = event.data?.object?.client_reference_id
    if (userId) {
      await env.DB.prepare(`UPDATE profiles SET premium = 1, updated_at = ? WHERE id = ?`).bind(now(), userId).run()
    }
  }
  return Response.json({ received: true })
}
