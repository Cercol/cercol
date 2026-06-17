/**
 * Generate public/og/role-R01.png ... role-R12.png (1200x630).
 *
 * Composition per role: brand-blue background, the existing per-role animal
 * silhouette (src/assets/icons/animals/*.svg, currentColor -> white) centered
 * in the upper area, and the Cèrcol wordmark (white) below. The animal SVGs and
 * the wordmark are reused as-is (same assets RoleIcon and og-image.png use); no
 * artwork is generated from scratch. The role NAME is not drawn into the image
 * (it lives in og:title), so no font is needed.
 *
 * Reproducible: `node scripts/generate_role_og_images.mjs` (or `npm run og:roles`).
 * Mirrors scripts/generate_og_image.mjs.
 *
 * # Spec: docs/architecture/seo-pipeline.md
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { Resvg } from '@resvg/resvg-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')

const WIDTH = 1200
const HEIGHT = 630
const BG = '#0047ba'
const FG = '#ffffff'

// Wordmark, smaller than the generic og-image and anchored near the bottom.
const MARK_W = 300
const MARK_H = Math.round((MARK_W * 470.92) / 1122.52)   // ~126
const MARK_X = Math.round((WIDTH - MARK_W) / 2)
const MARK_Y = 452

// Animal box (upper area), preserving each silhouette's aspect ratio.
const ANIMAL_MAX_W = 720
const ANIMAL_MAX_H = 330
const ANIMAL_TOP = 70

/** Return the content inside the root <svg> of a Potrace SVG (the <g>…</g>). */
function innerSvg(svg) {
  const s = svg
    .replace(/<\?xml[\s\S]*?\?>/g, '')
    .replace(/<!DOCTYPE[\s\S]*?>/g, '')
    .replace(/<metadata>[\s\S]*?<\/metadata>/g, '')
  const open = s.indexOf('>', s.indexOf('<svg')) + 1
  const close = s.lastIndexOf('</svg>')
  return s.slice(open, close).trim()
}

function viewBox(svg) {
  const m = svg.match(/viewBox="([\d.\s]+)"/)
  if (!m) throw new Error('no viewBox')
  const [, , w, h] = m[1].trim().split(/\s+/).map(Number)
  return { w, h }
}

function main() {
  const animalsDir = resolve(REPO_ROOT, 'src/assets/icons/animals')
  const wordmark = readFileSync(resolve(REPO_ROOT, 'src/assets/brand/cercol-wordmark.svg'), 'utf8')
  const wordmarkPaths = (wordmark.match(/<path[\s\S]*?\/>/g) ?? []).join('\n    ')
  if (!wordmarkPaths) throw new Error('No <path> in wordmark SVG')

  const outDir = resolve(REPO_ROOT, 'public/og')
  mkdirSync(outDir, { recursive: true })

  const files = readdirSync(animalsDir).filter(f => /^cercol-icon-r\d\d-.*\.svg$/.test(f))
  if (files.length !== 12) {
    console.warn(`[og:roles] expected 12 animal SVGs, found ${files.length}`)
  }

  for (const file of files.sort()) {
    const roleId = 'R' + file.match(/-r(\d\d)-/)[1]   // cercol-icon-r01-dolphin.svg -> R01
    const svg = readFileSync(resolve(animalsDir, file), 'utf8')
    const { w: vbW, h: vbH } = viewBox(svg)
    const scale = Math.min(ANIMAL_MAX_W / vbW, ANIMAL_MAX_H / vbH)
    const aw = Math.round(vbW * scale)
    const ah = Math.round(vbH * scale)
    const ax = Math.round((WIDTH - aw) / 2)
    const ay = ANIMAL_TOP + Math.round((ANIMAL_MAX_H - ah) / 2)

    const composite = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${BG}"/>
  <svg x="${ax}" y="${ay}" width="${aw}" height="${ah}" viewBox="0 0 ${vbW} ${vbH}" color="${FG}">
    ${innerSvg(svg)}
  </svg>
  <svg x="${MARK_X}" y="${MARK_Y}" width="${MARK_W}" height="${MARK_H}" viewBox="0 0 1122.52 470.92" color="${FG}">
    ${wordmarkPaths}
  </svg>
</svg>`

    const png = new Resvg(composite, { fitTo: { mode: 'width', value: WIDTH }, background: BG })
      .render().asPng()
    const out = resolve(outDir, `role-${roleId}.png`)
    writeFileSync(out, png)
    console.log(`[og:roles] ${roleId} <- ${file}  (${(png.length / 1024).toFixed(1)} KB)`)
  }
}

main()
