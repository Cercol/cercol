// Spec: src/hooks/useTrackTestStart.js
//
// Full Moon is the one gated instrument: an anonymous visitor who lands on
// /full-moon is redirected to /auth, and a signed-in taker with a prior
// result sees the completed screen. A `test_start` fired on mount counted
// both as starts, and the daily brief then reported them as abandoned
// sittings — three visitors on 2026-08-27 "started a test" whose only real
// act was bouncing off the sign-in gate, milliseconds after arriving.
//
// The hook takes the gate's verdict for exactly this reason. These tests
// read the pages so the wiring cannot silently regress: the gated page must
// pass its gate, and the ungated pages must keep firing on mount, where
// mounting and starting are the same thing.
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, expect, it } from 'vitest'

const page = (name) => readFileSync(resolve(__dirname, '../../pages', name), 'utf8')

describe('test_start and the Full Moon gate', () => {
  it('Full Moon fires only once the gate says ready', () => {
    const src = page('FullMoonPage.jsx')
    expect(src).toMatch(/useTrackTestStart\('fullMoon',\s*gateState === 'ready'\)/)
  })

  it('the ungated instruments keep firing on mount', () => {
    expect(page('NewMoonPage.jsx')).toMatch(/useTrackTestStart\('newMoon'\)/)
    expect(page('FirstQuarterPage.jsx')).toMatch(/useTrackTestStart\('firstQuarter'\)/)
  })
})
