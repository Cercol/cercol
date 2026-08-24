/**
 * Cold outreach, the deterministic half (ops plan t76).
 *
 * The routine researches companies and commits one draft per domain to
 * outreach/queue/<domain>.json in the private ops repo. This job is the only
 * thing that ever sends: it reads the queue with the same GitHub token the
 * plan endpoint uses, applies the hard rules in code (generic address only,
 * 24 h veto window, one email per domain ever, 3 per day, full stop on any
 * complaint), sends as miquel@cercol.team so replies reach a human, and
 * records every send in the outreach table. The 24 h window is the
 * operator's standing veto: deleting a draft from the repo means it never
 * goes out. OUTREACH_ENABLED != '1' keeps the whole thing dark while still
 * reporting queue depth to the brief.
 */

import { sendAsMiquel } from '../emails.js'

const GENERIC = /^(info|hello|contact|hi|hej|hola|mail|post|team|office|kontakt)@/i
const MAX_SEND = 3
const MAX_READ = 8 // subrequest budget: 1 list + 8 reads + 3 sends + a few D1

/** The rules a draft must pass regardless of what the routine wrote. */
export function validateDraft(d, now = Date.now()) {
  if (!d || !d.domain || !d.email || !d.subject || !d.text) return 'missing fields'
  if (!GENERIC.test(d.email)) return 'not a generic address'
  if (!d.email.toLowerCase().endsWith(`@${d.domain.toLowerCase()}`)) return 'email/domain mismatch'
  if (d.subject.length > 150 || d.text.length > 5000) return 'oversized'
  const t = Date.parse(d.prepared_at)
  if (!t) return 'missing prepared_at'
  if (now - t < 24 * 3600e3) return 'too fresh'
  return null
}

export async function runOutreach(env, { dry = false } = {}) {
  const repo = env.OPS_REPO || 'Cercol/cercol-ops'
  const gh = { authorization: `Bearer ${env.GITHUB_TOKEN}`, accept: 'application/vnd.github+json', 'user-agent': 'cercol-api' }
  const list = await fetch(`https://api.github.com/repos/${repo}/contents/outreach/queue`, { headers: gh })
  if (list.status === 404) return { queued: 0, sent: 0, enabled: env.OUTREACH_ENABLED === '1' }
  if (!list.ok) throw new Error(`github ${list.status}`)
  const files = (await list.json()).filter((f) => f.name.endsWith('.json'))
  const out = { queued: files.length, sent: 0, skipped: [], enabled: env.OUTREACH_ENABLED === '1' }
  if (!out.enabled || !files.length) return out

  const health = await env.DB.prepare(
    `SELECT COUNT(*) AS n, SUM(status='complained') AS c, SUM(status='bounced') AS b FROM outreach`).first()
  if ((health.c || 0) > 0 || ((health.n || 0) >= 10 && (health.b || 0) / health.n > 0.1)) {
    return { ...out, halted: true }
  }

  for (const f of files.slice(0, MAX_READ)) {
    if (out.sent >= MAX_SEND) break
    const res = await fetch(f.url, { headers: { ...gh, accept: 'application/vnd.github.raw+json' } })
    if (!res.ok) { out.skipped.push([f.name, `github ${res.status}`]); continue }
    let d
    try { d = await res.json() } catch { out.skipped.push([f.name, 'bad json']); continue }
    const err = validateDraft(d)
    if (err) { if (err !== 'too fresh') out.skipped.push([f.name, err]); continue }
    const dup = await env.DB.prepare(`SELECT 1 AS x FROM outreach WHERE domain = ?`).bind(d.domain.toLowerCase()).first()
    if (dup) { out.skipped.push([f.name, 'domain already contacted']); continue }
    if (!dry) {
      const sent = await sendAsMiquel(env, { to: d.email, subject: d.subject, text: d.text })
      await env.DB.prepare(
        `INSERT INTO outreach (company, domain, email, lang, source, subject, queue_file, note) VALUES (?,?,?,?,?,?,?,?)`)
        .bind(d.company || d.domain, d.domain.toLowerCase(), d.email, d.lang || 'en', d.source || null, d.subject, f.path, sent?.id || null).run()
    }
    out.sent++
  }
  return out
}

/**
 * POST /webhooks/resend?key=… — bounce and complaint feedback. The key in
 * the URL is the whole authentication (set RESEND_WEBHOOK_KEY on the Worker
 * and paste the same URL into the Resend dashboard); a forged call can only
 * mark rows bounced, which fails safe by halting sends.
 */
export async function outreachWebhook(env, request) {
  const key = new URL(request.url).searchParams.get('key')
  if (!env.RESEND_WEBHOOK_KEY || key !== env.RESEND_WEBHOOK_KEY) return new Response('not found', { status: 404 })
  let ev
  try { ev = await request.json() } catch { return new Response('bad json', { status: 400 }) }
  const status = { 'email.bounced': 'bounced', 'email.complained': 'complained' }[ev.type]
  const to = ev.data?.to?.[0]
  if (status && to) {
    await env.DB.prepare(`UPDATE outreach SET status = ?, note = ? WHERE email = ?`)
      .bind(status, ev.type, to).run()
  }
  return Response.json({ ok: true })
}
