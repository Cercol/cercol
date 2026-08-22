/**
 * Transactional email through Resend, mirroring api/emails.py.
 *
 * # Spec: docs/ops/email.md
 *
 * The string table is not translated twice: worker/src/i18n/emails.json is
 * extracted from api/emails.py, so both backends read one source. The HTML
 * helpers below reproduce the Python ones character for character (inline
 * CSS, table layout, same colours), so a magic-link email sent by the
 * Worker is indistinguishable from one sent by FastAPI.
 *
 * Only the seven transactional templates live here. The weekly digest is a
 * scheduled job with its own builder and moves in phase 8.
 */

import STRINGS from './i18n/emails.json' with { type: 'json' }
import { shell, h1 as kitH1, p as kitP, C, SANS } from './email-ui.js'

const SUPPORTED = new Set(['en', 'ca', 'es', 'fr', 'de', 'da'])
const BLUE = C.blue, WHITE = C.white

export const lang = (l) => (l && SUPPORTED.has(l) ? l : 'en')
const t = (key, l) => STRINGS[key]?.[l] || STRINGS[key]?.en || key
const fmt = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`))

function base(content, l, frontendUrl) {
  return shell(content, { lang: l, frontendUrl, footer: `${t('footer_received', l)}<br><a href="${frontendUrl}/privacy" style="color:${C.muted};">${t('footer_privacy', l)}</a>` })
}
const btn = (url, label) =>
  `<a href="${url}" style="display:inline-block;background:${BLUE};color:${WHITE};font-family:${SANS};font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:8px;margin-top:24px;">${label}</a>`
const h1 = kitH1
const p = kitP

/** POST to Resend. Throws on a non-2xx so callers decide whether to swallow. */
async function send(env, to, subject, html) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: 'Cèrcol <noreply@cercol.team>', to: [to], subject, html }),
  })
  if (!res.ok) throw new Error(`resend ${res.status}: ${await res.text()}`)
}

const F = (env) => env.FRONTEND_URL || 'https://cercol.team'

/**
 * A plain message from the person behind the project, not from the product.
 *
 * Everything else here is transactional and goes out as noreply@. This one is
 * correspondence: it must come from the address the recipient already has a
 * thread with, and a reply must reach a mailbox a human reads. Same verified
 * domain, so Resend needs nothing new.
 *
 * Plain text on purpose. The design kit would wrap a note to a professor in a
 * product template, which is the wrong register and looks like marketing.
 */
export async function sendAsMiquel(env, { to, subject, text, replyTo }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: 'Miquel Matoses <miquel@cercol.team>',
      to: Array.isArray(to) ? to : [to],
      reply_to: replyTo || 'miquel@cercol.team',
      subject,
      text,
    }),
  })
  if (!res.ok) throw new Error(`resend ${res.status}: ${await res.text()}`)
  return res.json()
}

export function sendMagicLink(env, to, link, l = 'en') {
  const L = lang(l)
  return send(env, to, t('magic_subject', L), base(
    h1(t('magic_heading', L)) + p(t('magic_body', L)) + btn(link, t('magic_button', L)) + p(t('magic_ignore', L), true), L, F(env)))
}
export function sendVerifyEmail(env, to, link, l = 'en') {
  const L = lang(l)
  return send(env, to, t('verify_subject', L), base(
    h1(t('verify_heading', L)) + p(t('verify_body', L)) + btn(link, t('verify_button', L)) + p(t('verify_ignore', L), true), L, F(env)))
}
export function sendEmailChangeConfirm(env, to, link, l = 'en') {
  const L = lang(l)
  return send(env, to, t('ec_subject', L), base(
    h1(t('ec_heading', L)) + p(t('ec_body', L)) + btn(link, t('ec_button', L)) + p(t('ec_ignore', L), true), L, F(env)))
}
export function sendEmailChangeNotice(env, to, newEmail, l = 'en') {
  const L = lang(l)
  return send(env, to, t('ecn_subject', L), base(
    h1(t('ecn_heading', L)) + p(fmt(t('ecn_body', L), { new_email: newEmail })) + p(t('ecn_warning', L), true), L, F(env)))
}
export function sendWitnessAssigned(env, to, witnessName, subjectDisplay, link, l = 'en') {
  const L = lang(l)
  return send(env, to, fmt(t('wa_subject', L), { subject_display: subjectDisplay }), base(
    h1(fmt(t('wa_heading', L), { witness_name: witnessName }))
    + p(fmt(t('wa_body1', L), { subject_display: subjectDisplay })) + p(t('wa_body2', L))
    + btn(link, t('wa_button', L)) + p(t('wa_ignore', L), true), L, F(env)))
}
export function sendWitnessCompleted(env, to, witnessName, l = 'en') {
  const L = lang(l)
  return send(env, to, fmt(t('wc_subject', L), { witness_name: witnessName }), base(
    h1(t('wc_heading', L)) + p(fmt(t('wc_body1', L), { witness_name: witnessName })) + p(t('wc_body2', L))
    + btn(`${F(env)}/my-results`, t('wc_button', L)), L, F(env)))
}
export function sendGroupInvitation(env, to, groupName, inviterName, l = 'en') {
  const L = lang(l)
  return send(env, to, fmt(t('gi_subject', L), { group_name: groupName }), base(
    h1(t('gi_heading', L)) + p(fmt(t('gi_body1', L), { inviter_name: inviterName, group_name: groupName }))
    + p(t('gi_body2', L)) + btn(`${F(env)}/groups`, t('gi_button', L)) + p(t('gi_note', L), true), L, F(env)))
}
export function sendWitnessRoundAssigned(env, to, witnessName, inviterName, groupName, items, l = 'en') {
  if (!items?.length) return Promise.resolve()
  const L = lang(l)
  const buttons = items.map(([name, link]) => btn(link, name)).join('')
  return send(env, to, fmt(t('wr_subject', L), { n: String(items.length) }), base(
    h1(fmt(t('wr_heading', L), { witness_name: witnessName }))
    + p(fmt(t('wr_body1', L), { inviter_name: inviterName, group_name: groupName })) + p(t('wr_body2', L))
    + buttons + p(t('wr_ignore', L), true), L, F(env)))
}
export function sendGroupNudge(env, to, ownerName, status, groupId, l = 'en') {
  const L = lang(l)
  const parts = [
    h1(fmt(t('gn_heading', L), { name: ownerName || '' })),
    p(fmt(t('gn_body1', L), { group_name: status.group_name, days: String(status.days) })),
    p(fmt(t('gn_status', L), Object.fromEntries(Object.entries(status).map(([k, v]) => [k, String(v)])))),
  ]
  if (status.pending) parts.push(p(fmt(t('gn_pending', L), { pending: String(status.pending) }), true))
  parts.push(p(t('gn_body2', L)), p(t('gn_body3', L)), btn(`${F(env)}/groups/${groupId}`, t('gn_button', L)), p(t('gn_note', L), true))
  return send(env, to, fmt(t('gn_subject', L), { group_name: status.group_name }), base(parts.join(''), L, F(env)))
}
