// Spec: worker/src/auth.js
//
// The banner counts responses towards the norms threshold, not free licences.
// It reads the count through usableCorpus so the banner and the norms cannot
// disagree about what counts: same instrument version, seed rows excluded.
import { describe, it, expect } from 'vitest'
import { betaStatus } from '../src/auth.js'
import { NORM_MIN_SAMPLE } from '../src/norms.js'
import { INSTRUMENT_VERSION } from '../../src/data/instrument-version.js'

function db({ betaProfiles = 12, corpus = [{ instrument: 'firstQuarter', language: 'en', n: 24 }, { instrument: 'firstQuarter', language: 'ca', n: 2 }] } = {}) {
  const seen = []
  return {
    seen,
    prepare(sql) {
      seen.push(sql)
      const stmt = {
        bind: (...a) => { seen.push(a); return stmt },
        first: async () => ({ n: betaProfiles }),
        all: async () => ({ results: corpus }),
      }
      return stmt
    },
  }
}

describe('the beta banner payload', () => {
  it('reports First Quarter per language, the grain the threshold gates on', async () => {
    const res = await betaStatus({ DB: db() })
    expect((await res.json()).validation).toEqual({
      threshold: NORM_MIN_SAMPLE,
      version: INSTRUMENT_VERSION,
      instrument: 'firstQuarter',
      byLanguage: { en: 24, ca: 2 },
    })
  })

  it('does not let another instrument inflate the meter', async () => {
    // computeNorms needs NORM_MIN_SAMPLE per instrument AND language. A
    // meter that summed the corpus would tell a Catalan reader that 26
    // responses counted towards norms when 2 of them did.
    const res = await betaStatus({
      DB: db({ corpus: [
        { instrument: 'newMoon', language: 'ca', n: 40 },
        { instrument: 'firstQuarter', language: 'ca', n: 2 },
      ] }),
    })
    expect((await res.json()).validation.byLanguage).toEqual({ ca: 2 })
  })

  it('filters on the current instrument version, not on everything ever answered', async () => {
    const d = db()
    await betaStatus({ DB: d })
    expect(d.seen.flat()).toContain(INSTRUMENT_VERSION)
    expect(d.seen.join(' ')).toContain('is_seed')
    expect(d.seen.join(' ')).toContain('GROUP BY instrument, language')
  })

  it('still carries the licence figures, which other callers read', async () => {
    const body = await (await betaStatus({ DB: db({ betaProfiles: 12 }) })).json()
    expect(body).toMatchObject({ remaining: 488, total: 500, active: true })
  })
})
