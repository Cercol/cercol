/**
 * The offer to retake after an instrument change.
 *
 * The rule is small but it decides who sees a prompt to redo twenty minutes
 * of work, so it is worth pinning: strictly older than the current version,
 * and a missing version counts as older because it predates versioning.
 */
import { describe, it, expect } from 'vitest'
import { INSTRUMENT_VERSION } from '../../data/instrument-version'

const stale = (result) => (result.instrument_version ?? 0) < INSTRUMENT_VERSION

describe('retake offer', () => {
  it('offers nothing on a result taken with the current instrument', () => {
    expect(stale({ instrument_version: INSTRUMENT_VERSION })).toBe(false)
  })

  it('offers a retake on a result from any earlier version', () => {
    expect(stale({ instrument_version: INSTRUMENT_VERSION - 1 })).toBe(true)
    expect(stale({ instrument_version: 1 })).toBe(true)
  })

  it('treats a result with no version as older, since it predates the stamp', () => {
    expect(stale({})).toBe(true)
    expect(stale({ instrument_version: null })).toBe(true)
  })

  it('never offers a retake on a result somehow ahead of the code', () => {
    // A stale bundle can render a row written by a newer deploy.
    expect(stale({ instrument_version: INSTRUMENT_VERSION + 1 })).toBe(false)
  })
})
