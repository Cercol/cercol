// Spec: worker/src/writes.js
//
// The witness funnel now has a front end (witness_invite_cta, the nudge on a
// solo finisher's results page) to pair with its back end (witness_cta). This
// holds the contract: the Worker accepts the new name and still rejects
// anything outside EVENT_NAMES.
import { describe, it, expect } from 'vitest'
import { recordEvent } from '../src/writes.js'

function db() {
  const runs = []
  return {
    runs,
    prepare(sql) {
      const stmt = {
        sql,
        bind: (...a) => { stmt.args = a; return stmt },
        run: async () => { runs.push({ sql, args: stmt.args }); return { success: true } },
      }
      return stmt
    },
  }
}

const req = (name) => new Request('https://api.test/events', {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'user-agent': 'Mozilla/5.0' },
  body: JSON.stringify({ name, path: '/first-quarter/results' }),
})

describe('recordEvent', () => {
  it('stores witness_invite_cta', async () => {
    const d = db()
    const res = await recordEvent({ DB: d }, req('witness_invite_cta'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, stored: true })
    expect(d.runs).toHaveLength(1)
    expect(d.runs[0].args[1]).toBe('witness_invite_cta')
  })

  it('rejects an unknown event name', async () => {
    const res = await recordEvent({ DB: db() }, req('witness_invented_cta'))
    expect(res.status).toBe(400)
  })
})
