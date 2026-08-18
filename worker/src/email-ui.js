/**
 * Email design kit, from mm-design tokens. Every internal email (daily
 * brief, weekly digest) renders through these so it looks like the site:
 * Playfair Display for the display sizes, Roboto for the body, the brand
 * palette, uppercase widest-tracked section labels, cards with a 3px
 * brand-colour left border. Inline styles because email.
 *
 * Fonts: Apple Mail, iOS Mail and Spark honour the <link>; Gmail falls
 * back to Georgia / Helvetica, which the stacks already carry.
 */

import { colors, fonts, BRAND_TINTS, GRAY } from 'mm-design/tokens/index.js'

export const C = {
  red: colors.red, blue: colors.blue, yellow: colors.yellow, green: colors.green,
  ink: colors.textPrimary, muted: colors.textMuted, border: colors.border,
  page: GRAY[50], track: colors.trackBg, white: colors.white, gray200: GRAY[200], gray500: GRAY[500],
  tint: BRAND_TINTS,
}
// Single quotes: these land inside style="..." attributes.
export const DISPLAY = fonts.display.replace(/"/g, "'")
export const SANS = fonts.sans.replace('system-ui', 'Helvetica, Arial').replace(/"/g, "'")

export const fmt = (n) => Number(n || 0).toLocaleString('en-US')
export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

export const h1 = (t) => `<h1 style="margin:0 0 4px;font-family:${DISPLAY};font-size:26px;font-weight:700;line-height:1.2;color:${C.ink};">${t}</h1>`
export const sub = (t) => `<p style="margin:0 0 20px;font-family:${SANS};font-size:14px;line-height:1.5;color:${C.muted};">${t}</p>`
export const p = (t, muted = false) => `<p style="margin:0 0 10px;font-family:${SANS};font-size:14px;line-height:1.6;color:${muted ? C.muted : C.ink};">${t}</p>`
export const label = (t, color = C.blue) => `<p style="margin:0 0 8px;font-family:${SANS};font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;line-height:1.4;color:${color};">${t}</p>`
export const section = (title, body, color) => `<div style="margin-top:28px;">${label(title, color)}${body}</div>`
export const empty = (t) => `<p style="margin:0;font-family:${SANS};font-size:13px;color:${C.muted};font-style:italic;">${t}</p>`

/** Delta against a comparison value: arrow + signed number, coloured. */
export function delta(cur, prev, suffix = '') {
  const d = cur - prev
  const [arrow, col] = d > 0 ? ['&#9650;', C.green] : d < 0 ? ['&#9660;', C.red] : ['&#8211;', C.gray500]
  return `<span style="font-family:${SANS};font-size:12px;color:${col};white-space:nowrap;">${arrow} ${d >= 0 ? '+' : ''}${fmt(d)}${suffix}</span>`
}

/** Stat card: mm-card with a brand accent, display-font value. */
export const stat = (labelText, value, note = '', accent = C.blue) =>
  `<td style="padding:12px 12px 12px 14px;vertical-align:top;background:${C.white};border:1px solid ${C.gray200};border-left:3px solid ${accent};border-radius:6px;">
    <div style="font-family:${DISPLAY};font-size:28px;font-weight:700;line-height:1.1;color:${C.ink};">${value}</div>
    <div style="font-family:${SANS};font-size:12px;color:${C.muted};margin-top:3px;">${labelText}</div>${note ? `<div style="margin-top:4px;">${note}</div>` : ''}</td>`
export const statRow = (cards) => `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;"><tr>${cards.join('<td style="width:8px;"></td>')}</tr></table>`

export function table(headers, rows, aligns) {
  aligns = aligns || headers.map(() => 'left')
  const head = headers.map((h, i) => `<th style="padding:6px 8px;text-align:${aligns[i]};font-family:${SANS};font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:${C.gray500};border-bottom:1px solid ${C.border};">${h}</th>`).join('')
  const body = rows.map((r) => `<tr>${r.map((c, i) => `<td style="padding:8px;text-align:${aligns[i]};font-family:${SANS};font-size:13px;line-height:1.4;color:${C.ink};border-bottom:1px solid ${C.gray200};">${c}</td>`).join('')}</tr>`).join('')
  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`
}

/** Usage bar against a cap: blue normally, yellow from 40%, red from 70%. */
export function bar(v, cap, width = 110) {
  const pct = Math.min(100, Math.round((v / cap) * 100))
  const col = pct >= 70 ? C.red : pct >= 40 ? C.yellow : C.blue
  return `<span style="display:inline-block;vertical-align:middle;width:${width}px;height:6px;background:${C.track};border-radius:3px;overflow:hidden;"><span style="display:block;width:${pct}%;height:6px;background:${col};"></span></span> <span style="font-family:${SANS};font-size:12px;color:${C.muted};">${pct}%</span>`
}

/** Callout: red tint for warnings, green tint for all-clear. */
export const callout = (lines, kind = 'ok') => {
  const col = kind === 'warn' ? C.red : C.green, bg = kind === 'warn' ? C.tint.red : C.tint.green
  return `<div style="background:${bg};border-left:3px solid ${col};border-radius:6px;padding:10px 14px;margin:0 0 20px;">${lines.map((l) => `<div style="font-family:${SANS};font-size:13px;line-height:1.5;color:${C.ink};">${l}</div>`).join('')}</div>`
}

export function shell(content, { frontendUrl = 'https://cercol.team', footer = '', lang = 'en' } = {}) {
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>Cèrcol</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:${C.page};font-family:${SANS};color:${C.ink};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${C.page};padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr>
          <td style="background:${C.blue};border-radius:12px 12px 0 0;padding:20px 32px;">
            <img src="${frontendUrl}/email-logo.png" alt="Cèrcol" width="160" height="67" style="display:block;border:0;" />
          </td>
        </tr>
        <tr>
          <td style="background:${C.white};padding:32px;border-left:1px solid ${C.gray200};border-right:1px solid ${C.gray200};">
            ${content}
          </td>
        </tr>
        <tr>
          <td style="background:${C.page};border-radius:0 0 12px 12px;padding:16px 32px;border:1px solid ${C.gray200};border-top:none;">
            <p style="margin:0;font-family:${SANS};font-size:12px;color:${C.muted};line-height:1.5;">${footer}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
