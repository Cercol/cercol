// Spec: src/lib/navigation.js
//
// Every localized page sent its reader to the English test. navHref exists
// for exactly this and only the header, the footer and the blog CTA card
// used it: /ca/instruments, /de/instruments, /ca/roles and /fr/science all
// linked /first-quarter rather than /ca/first-quarter, live.
//
// The card's own comment names the cost: "a French reader who reached the
// end of a French article was being handed an English test". That was fixed
// on the card and nowhere else.
import { readFileSync, readdirSync } from 'fs'
import { resolve, join } from 'path'
import { describe, expect, it } from 'vitest'

const SRC = resolve(__dirname, '../..')
const PATHS = /(new-moon|first-quarter|full-moon|last-quarter|sample|instruments|roles|science)/

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name)
    if (e.isDirectory()) return e.name === '__tests__' ? [] : walk(p)
    return e.name.endsWith('.jsx') ? [p] : []
  })
}

describe('links to an instrument keep the reader in their language', () => {
  it('routes every one through navHref', () => {
    const offenders = []
    for (const file of walk(SRC)) {
      const src = readFileSync(file, 'utf8')
      for (const m of src.matchAll(/to="(\/[a-z-]+)"/g)) {
        if (PATHS.test(m[1])) offenders.push(`${file.slice(SRC.length + 1)}: ${m[0]}`)
      }
    }
    expect(offenders, 'a hardcoded path sends a localized reader to English').toEqual([])
  })
})
