import { describe, it, expect } from 'vitest'
import { STATUSES } from '../src/authority.js'
import { AUTHORITY_TARGETS, STAGES, BEATS, orderedTargets } from '../../src/data/authority-targets.js'

describe('authority catalogue', () => {
  it('has an id, a stage, a beat and a difficulty on every target', () => {
    for (const t of AUTHORITY_TARGETS) {
      expect(STAGES, `${t.id} stage`).toContain(t.stage)
      expect(BEATS, `${t.id} beat`).toContain(t.beat)
      expect(['form', 'person', 'long'], `${t.id} difficulty`).toContain(t.difficulty)
      expect(t.url, `${t.id} url`).toMatch(/^https?:\/\//)
      expect(t.why?.length, `${t.id} why`).toBeGreaterThan(40)
    }
  })

  it('gives every target a unique id, since D1 keys progress by it', () => {
    const ids = AUTHORITY_TARGETS.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    // The id reaches the Worker in a URL path, which only accepts this shape.
    for (const id of ids) expect(id, id).toMatch(/^[a-z0-9-]+$/)
  })

  it('never carries an invented contact: null or a real address, nothing else', () => {
    for (const t of AUTHORITY_TARGETS) {
      if (t.contact !== null) expect(t.contact, t.id).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/)
    }
  })

  it('orders what is reachable today before what waits, forms before people', () => {
    const order = orderedTargets().map((t) => t.stage)
    expect(order.indexOf('now')).toBe(0)
    // Once a later stage starts, no earlier stage may appear again.
    let seen = -1
    for (const s of order) {
      const i = STAGES.indexOf(s)
      expect(i).toBeGreaterThanOrEqual(seen)
      seen = i
    }
    const nowOnes = orderedTargets(AUTHORITY_TARGETS.filter((t) => t.stage === 'now'))
    expect(nowOnes[0].difficulty).toBe('form')
  })

  it('keeps the consent gate in the catalogue, because it expires value daily', () => {
    const gate = AUTHORITY_TARGETS.find((t) => t.id === 'consent-gate')
    expect(gate).toBeDefined()
    expect(gate.stage).toBe('consent')
  })

  it('agrees with the Worker about what a status is', () => {
    expect(STATUSES).toEqual(['todo', 'doing', 'done', 'dropped'])
  })
})
