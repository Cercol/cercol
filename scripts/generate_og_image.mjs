/**
 * Generate public/og-image.png (1200x630).
 *
 * Composition: brand-blue background, wordmark centered in white.
 * The wordmark SVG paths are the same the React CercolLogo component
 * renders; the canonical copy lives at src/assets/brand/cercol-wordmark.svg.
 *
 * Reproducible: run `node scripts/generate_og_image.mjs` to regenerate.
 *
 * # Spec: docs/architecture/seo-pipeline.md
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { Resvg } from '@resvg/resvg-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')

const WIDTH = 1200
const HEIGHT = 630
const BG = '#0047ba'           // mm-design brand blue
const FG = '#ffffff'           // wordmark colour

// Wordmark layout. The mark's intrinsic viewBox is 1122.52 x 470.92
// (ratio ~2.384). We choose a target width of 640 px to leave generous
// margins on every side; height follows the ratio. The mark is centred
// horizontally and vertically.
const MARK_W = 640
const MARK_H = Math.round((MARK_W * 470.92) / 1122.52)   // ~268
const MARK_X = Math.round((WIDTH - MARK_W) / 2)          // 280
const MARK_Y = Math.round((HEIGHT - MARK_H) / 2)         // 181


function main() {
  const wordmarkPath = resolve(REPO_ROOT, 'src/assets/brand/cercol-wordmark.svg')
  const wordmark = readFileSync(wordmarkPath, 'utf8')

  // Extract the <path> elements from the wordmark SVG. The wordmark
  // ships with `aria-label="Cèrcol"` and currentColor fills; here we
  // wrap it inside a <g> with the explicit fill colour and positioned
  // via a viewBox-preserving <svg> nest.
  const paths = wordmark.match(/<path[\s\S]*?\/>/g) ?? []
  if (paths.length === 0) {
    throw new Error('No <path> found in wordmark SVG')
  }

  // The simplest reliable composition: nest the wordmark inside a
  // child <svg> with its own viewBox + width/height. resvg-js renders
  // nested SVGs correctly. `color="#ffffff"` propagates as the value
  // of currentColor for the nested paths.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${BG}"/>
  <svg x="${MARK_X}" y="${MARK_Y}" width="${MARK_W}" height="${MARK_H}" viewBox="0 0 1122.52 470.92" color="${FG}">
    ${paths.join('\n    ')}
  </svg>
</svg>`

  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: WIDTH },
    background: BG,
  }).render().asPng()

  const out = resolve(REPO_ROOT, 'public/og-image.png')
  writeFileSync(out, png)

  console.log(`[og] wrote ${out} (${(png.length / 1024).toFixed(1)} KB, ${WIDTH}x${HEIGHT})`)
}

main()
