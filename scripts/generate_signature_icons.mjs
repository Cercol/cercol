/**
 * Generate the email signature icon PNGs into public/.
 *
 * Gmail strips inline <svg> from email bodies, so the Spark signature must
 * reference hosted raster PNGs via <img>. This script rasterizes:
 *
 *   public/sig-bee.png        animal silhouette, baked fill #cf3339, 2x of 108x100
 *   public/sig-moon-new.png   moon phase line icons on the blue strip, 2x of 20x20
 *   public/sig-moon-first.png
 *   public/sig-moon-full.png
 *   public/sig-moon-last.png
 *
 * Transparent background (resvg default). Mirrors scripts/generate_og_image.mjs.
 * Reproducible: run `node scripts/generate_signature_icons.mjs`.
 *
 * # Spec: docs/architecture/seo-pipeline.md
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { Resvg } from '@resvg/resvg-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')

// --- Bee silhouette -------------------------------------------------------
// viewBox 400x369 (aspect 400/369 ~= 1.084). Target display height 100px,
// rendered at 2x (200px). resvg does not resolve currentColor, so the fill
// must be baked to the brand red before rendering.
const BEE_FILL = '#cf3339'
const BEE_RENDER_H = 200

function renderBee() {
  const src = resolve(REPO_ROOT, 'src/assets/icons/animals/cercol-icon-r09-bee.svg')
  const raw = readFileSync(src, 'utf8')
  const baked = raw.replace(/fill="currentColor"/g, `fill="${BEE_FILL}"`)
  if (baked === raw) {
    throw new Error('Bee SVG: no fill="currentColor" found to bake')
  }
  const png = new Resvg(baked, {
    fitTo: { mode: 'height', value: BEE_RENDER_H },
  }).render().asPng()
  writeFileSync(resolve(REPO_ROOT, 'public/sig-bee.png'), png)
}

// --- Moon phases ----------------------------------------------------------
// Colours already baked into the source strings. Render @2x: fitTo width 40
// (display 20x20). viewBox is 24x24 so height follows to 40 as well.
const MOON_RENDER_W = 40

const MOONS = {
  'sig-moon-new.png':
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8.5" stroke="rgba(255,255,255,0.9)" stroke-width="1.4" fill="none"/><line x1="7" y1="7.5" x2="17" y2="16.5" stroke="rgba(255,255,255,0.6)" stroke-width="1.1" stroke-linecap="round"/><line x1="8.5" y1="6" x2="18.5" y2="15.5" stroke="rgba(255,255,255,0.6)" stroke-width="1.1" stroke-linecap="round"/><line x1="5.5" y1="9.5" x2="15" y2="18.5" stroke="rgba(255,255,255,0.6)" stroke-width="1.1" stroke-linecap="round"/></svg>',
  'sig-moon-first.png':
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 3.5 C17 3.5 20.5 7.5 20.5 12 C20.5 16.5 17 20.5 12 20.5 L12 3.5 Z" fill="rgba(255,255,255,0.9)" stroke="rgba(255,255,255,0.9)" stroke-width="0.5"/><path d="M12 3.5 C7 3.5 3.5 7.5 3.5 12 C3.5 16.5 7 20.5 12 20.5" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1.4" stroke-linecap="round"/></svg>',
  'sig-moon-full.png':
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8.5" stroke="rgba(255,255,255,0.9)" stroke-width="1.4" fill="rgba(255,255,255,0.9)"/><ellipse cx="9" cy="10.5" rx="1.4" ry="0.9" stroke="#0047ba" stroke-width="0.9" fill="none"/><ellipse cx="14" cy="14" rx="1.6" ry="1" stroke="#0047ba" stroke-width="0.9" fill="none"/><ellipse cx="13" cy="9" rx="0.8" ry="0.5" stroke="#0047ba" stroke-width="0.8" fill="none"/></svg>',
  'sig-moon-last.png':
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 3.5 C7 3.5 3.5 7.5 3.5 12 C3.5 16.5 7 20.5 12 20.5 L12 3.5 Z" fill="rgba(255,255,255,0.9)" stroke="rgba(255,255,255,0.9)" stroke-width="0.5"/><path d="M12 3.5 C17 3.5 20.5 7.5 20.5 12 C20.5 16.5 17 20.5 12 20.5" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1.4" stroke-linecap="round"/></svg>',
}

function renderMoons() {
  for (const [file, svg] of Object.entries(MOONS)) {
    const png = new Resvg(svg, {
      fitTo: { mode: 'width', value: MOON_RENDER_W },
    }).render().asPng()
    writeFileSync(resolve(REPO_ROOT, 'public', file), png)
  }
}

function main() {
  renderBee()
  renderMoons()
  console.log('[sig] wrote public/sig-bee.png + 4 moon PNGs')
}

main()
