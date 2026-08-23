// Spec: worker/src/witness.js
//
// The Witness role check measures the instrument, never the person. It has
// its own table for that reason, and these tests hold the contract: what it
// accepts, and that a reload cannot become a second data point.
import { describe, it, expect } from 'vitest'
import { roleCheck } from '../src/witness.js'

function db({ session = { id: 's1', completed_at: '2026-08-23T10:00:00+00:00' } } = {}) {
  const runs = []
  return {
    runs,
    prepare(sql) {
      const stmt = {
        sql,
        bind: (...a) => { stmt.args = a; return stmt },
        first: async () => session,
        run: async () => { runs.push({ sql, args: stmt.args }); return { success: true } },
      }
      return stmt
    },
  }
}

const req = (body) => new Request('https://api.test/witness/session/tok/role-check', {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
})

const GOOD = { computed_role: 'R01', rival_role: 'R02', distant_role: 'R07', chosen_role: 'R01' }

describe('the Witness role check', () => {
  it('records a valid answer', async () => {
    const d = db()
    const res = await roleCheck({ DB: d }, req(GOOD))
    expect(res.status).toBe(200)
    const insert = d.runs.at(-1)
    expect(insert.sql).toContain('witness_role_checks')
    expect(insert.args).toContain('R01')
    expect(insert.args).toContain('R07')
  })

  it('refuses a chosen role that was never shown', async () => {
    const res = await roleCheck({ DB: db() }, req({ ...GOOD, chosen_role: 'R09' }))
    expect(res.status).toBe(422)
  })

  it('refuses three options that are not three', async () => {
    const res = await roleCheck({ DB: db() }, req({ ...GOOD, rival_role: 'R01' }))
    expect(res.status).toBe(422)
  })

  it('refuses anything that is not a role id', async () => {
    for (const bad of ['R13', 'R00', 'r01', 'presence', '']) {
      const res = await roleCheck({ DB: db() }, req({ ...GOOD, computed_role: bad }))
      expect(res.status, bad).toBe(422)
    }
  })

  it('takes an agreement rating of 1 to 7, or none', async () => {
    expect((await roleCheck({ DB: db() }, req({ ...GOOD, agreement: 4 }))).status).toBe(200)
    expect((await roleCheck({ DB: db() }, req({ ...GOOD, agreement: null }))).status).toBe(200)
    for (const bad of [0, 8, 10, 3.5, '4']) {
      expect((await roleCheck({ DB: db() }, req({ ...GOOD, agreement: bad }))).status, String(bad)).toBe(422)
    }
  })

  it('will not record against a session that is not finished', async () => {
    const res = await roleCheck({ DB: db({ session: { id: 's1', completed_at: null } }) }, req(GOOD))
    expect(res.status).toBe(409)
  })

  it('is idempotent, so a reload is not a second data point', async () => {
    const d = db()
    await roleCheck({ DB: d }, req(GOOD))
    expect(d.runs.at(-1).sql).toContain('ON CONFLICT (session_id) DO NOTHING')
  })
})
