import { describe, it, expect } from 'vitest'
import { STATUSES } from '../src/authority.js'
import { PLAN_SECTIONS, PLAN_TASKS, AUDIENCE, EFFORTS, PAYOFFS, nextTask, taskStatus, mineReason, minePending } from '../../src/data/distribution-plan.js'

describe('distribution plan', () => {
  it('gives every step the fields the panel renders', () => {
    for (const t of PLAN_TASKS) {
      expect(t.title?.length, `${t.id} title`).toBeGreaterThan(3)
      expect(t.why?.length, `${t.id} why`).toBeGreaterThan(20)
      expect(EFFORTS, `${t.id} effort`).toContain(t.eff)
      for (const a of t.aud) expect(Object.keys(AUDIENCE), `${t.id} audience`).toContain(a)
      for (const p of t.pay) expect(PAYOFFS, `${t.id} payoff`).toContain(p)
    }
  })

  it('gives every step an action the panel knows how to carry out', () => {
    for (const t of PLAN_TASKS) {
      const a = t.action
      expect(['prompt', 'do', 'email', 'link'], `${t.id} type`).toContain(a?.type)
      if (a.type === 'prompt') expect(a.text?.length, t.id).toBeGreaterThan(20)
      if (a.type === 'do') expect(a.html?.length, t.id).toBeGreaterThan(10)
      if (a.type === 'email') {
        // A mailto may carry several recipients, comma separated. An empty
        // `to` is deliberate: a private person's address does not belong in
        // this public file (2026-08-24, ct21), and mailto: with no recipient
        // still opens a compose window with the subject and body — the
        // operator adds the address. Published, professional addresses of
        // researchers being contacted in that capacity may stay.
        if (a.to !== '') {
          for (const to of a.to.split(',')) expect(to.trim(), t.id).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/)
        }
        expect(a.subject?.length, t.id).toBeGreaterThan(3)
        expect(a.body?.length, t.id).toBeGreaterThan(40)
      }
      if (a.type === 'link') expect(a.url, t.id).toMatch(/^https?:\/\//)
    }
  })

  it('gives every step a unique id, since D1 keys progress by it', () => {
    const ids = PLAN_TASKS.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    // The id reaches the Worker in a URL path, which only accepts this shape.
    for (const id of ids) expect(id, id).toMatch(/^[a-z0-9-]+$/)
  })

  it('lets a stored status override what the plan was written with', () => {
    const seededDone = PLAN_TASKS.find((t) => t.done)
    expect(taskStatus(seededDone, {})).toBe('done')
    expect(taskStatus(seededDone, { [seededDone.id]: { status: 'todo' } })).toBe('todo')
  })

  it('points at the first unfinished step, in plan order', () => {
    const first = nextTask({})
    expect(first).toBeTruthy()
    expect(first.done).toBeFalsy()
    // Marking it done moves the pointer forward rather than repeating itself.
    const second = nextTask({ [first.id]: { status: 'done' } })
    expect(second.id).not.toBe(first.id)
    // Nothing left to do means no pointer, not a crash.
    expect(nextTask(Object.fromEntries(PLAN_TASKS.map((t) => [t.id, { status: 'done' }])))).toBeNull()
  })

  // Was: "keeps the consent notice in the plan, because it expires value
  // daily". That premise was wrong and the step is closed. A response is five
  // ordinal scores, an instrument, a language and a date; no IP, no free text,
  // no email in the published table. It is an anonymous survey and publishing
  // it infringes nobody. See docs/policies/research-data.md.
  it('keeps the settled consent position pointing at the document that settles it', () => {
    const gate = PLAN_TASKS.find((t) => t.id === 'ct1')
    expect(gate.done).toBe(true)
    expect(gate.action.url).toContain('research-data.md')
  })

  it('describes every section it renders', () => {
    for (const s of PLAN_SECTIONS) {
      expect(s.title?.length, s.id).toBeGreaterThan(2)
      expect(s.tasks.length, s.id).toBeGreaterThan(0)
    }
  })

  it('agrees with the Worker about what a status is', () => {
    expect(STATUSES).toEqual(['todo', 'doing', 'done', 'dropped'])
  })
})

// Spec: src/data/distribution-plan.js
//
// Most of what is left in the plan is the operator's, and the panel has to
// say which before the work starts rather than after. The routine already
// reports it every morning in prose ("need your accounts", "wants an
// interactive session"); this is the same fact on the step itself.
describe('steps the routine will not take', () => {
  it('names a reason for every step that is not a prompt', () => {
    for (const t of PLAN_TASKS) {
      const reason = mineReason(t)
      if (t.action?.type === 'prompt' && !t.mine) {
        expect(reason, `${t.id} is a prompt and should be the routine's`).toBeNull()
      } else {
        expect(reason, `${t.id} (${t.action?.type}) needs a reason`).toBeTruthy()
      }
    }
  })

  it('counts only what is still open', () => {
    const { mine, left } = minePending()
    expect(left).toBe(PLAN_TASKS.filter((t) => !t.done).length)
    expect(mine).toBeGreaterThan(0)
    expect(mine).toBeLessThanOrEqual(left)
    // A step marked done in D1 leaves both counts.
    const first = PLAN_TASKS.find((t) => !t.done && mineReason(t))
    const after = minePending({ [first.id]: { status: 'done' } })
    expect(after.mine).toBe(mine - 1)
    expect(after.left).toBe(left - 1)
  })
})
