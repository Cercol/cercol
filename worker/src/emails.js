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

const SUPPORTED = new Set(['en', 'ca', 'es', 'fr', 'de', 'da'])
const BLUE = '#0047ba', DARK = '#111111', GRAY = '#6b7280', LIGHT = '#f9fafb', WHITE = '#ffffff'

export const lang = (l) => (l && SUPPORTED.has(l) ? l : 'en')
const t = (key, l) => STRINGS[key]?.[l] || STRINGS[key]?.en || key
const fmt = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`))

function base(content, l, frontendUrl) {
  return `<!DOCTYPE html>
<html lang="${l}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cèrcol</title>
</head>
<body style="margin:0;padding:0;background:${LIGHT};font-family:Arial,Helvetica,sans-serif;color:${DARK};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${LIGHT};padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

        <!-- Header -->
        <tr>
          <td style="background:${BLUE};border-radius:12px 12px 0 0;padding:20px 32px;">
            <img src="${frontendUrl}/email-logo.png" alt="Cèrcol" width="160" height="67"
                 style="display:block;border:0;" />
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:${WHITE};padding:32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:${LIGHT};border-radius:0 0 12px 12px;padding:20px 32px;border:1px solid #e5e7eb;border-top:none;">
            <p style="margin:0;font-size:12px;color:${GRAY};line-height:1.5;">
              ${t('footer_received', l)}<br>
              <a href="${frontendUrl}/privacy" style="color:${GRAY};">${t('footer_privacy', l)}</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
const btn = (url, label) =>
  `<a href="${url}" style="display:inline-block;background:${BLUE};color:${WHITE};font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:8px;margin-top:24px;">${label}</a>`
const h1 = (text) => `<h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:${DARK};">${text}</h1>`
const p = (text, muted = false) =>
  `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:${muted ? GRAY : DARK};">${text}</p>`

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
