// Spec: src/components/WitnessRoleCheck.jsx
//
// This screen is the only thing that measures whether the role assignment
// means anything, so the three options it shows are not a presentation
// detail. Rendered as well as unit-tested: /sample shipped throwing today
// because three tests checked everything around a component and none
// rendered it.
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, beforeAll } from 'vitest'
import { pickThree } from '../WitnessRoleCheck.jsx'

// A profile where the ranking is unambiguous.
const PROBS = {
  R01: 0.40, R02: 0.22, R03: 0.10, R04: 0.08, R05: 0.06, R06: 0.05,
  R07: 0.04, R08: 0.02, R09: 0.01, R10: 0.01, R11: 0.005, R12: 0.001,
}

describe('the three roles shown', () => {
  it('shows the computed role, its nearest rival, and the least likely', () => {
    const { rival, distant, order } = pickThree(PROBS, 'R01', 'tok')
    expect(rival).toBe('R02')
    expect(distant).toBe('R12')
    expect(order).toHaveLength(3)
    expect(new Set(order)).toEqual(new Set(['R01', 'R02', 'R12']))
  })

  it('keeps a distant third option, because two neighbours cannot be told apart', () => {
    // With the two most probable roles only, the chance line is 50% and
    // detecting a real 60% needs about 153 sessions. With a distant third it
    // is 33% and about 22 settle it. The distant option is the whole design.
    const { distant } = pickThree(PROBS, 'R01', 'tok')
    expect(PROBS[distant]).toBeLessThan(PROBS.R02)
    expect(PROBS[distant]).toBe(Math.min(...Object.values(PROBS)))
  })

  it('orders from the token, so a reload does not rearrange the question', () => {
    const a = pickThree(PROBS, 'R01', 'abc').order
    const b = pickThree(PROBS, 'R01', 'abc').order
    expect(a).toEqual(b)
  })

  it('does not always put the computed role first', () => {
    const positions = new Set(
      ['a', 'b', 'c', 'd', 'e', 'f'].map((tok) => pickThree(PROBS, 'R01', tok).order.indexOf('R01')),
    )
    expect(positions.size, 'the answer would be first every time').toBeGreaterThan(1)
  })
})

describe('the screen renders', () => {
  let WitnessRoleCheck
  beforeAll(async () => {
    globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} }
    await import('../../i18n.js')
    WitnessRoleCheck = (await import('../WitnessRoleCheck.jsx')).default
  })

  it('renders three choices and the person being described', () => {
    const html = renderToStaticMarkup(
      createElement(MemoryRouter, null,
        createElement(WitnessRoleCheck, {
          token: 'tok',
          roleResult: { role: 'R01', arc: ['R02'], probabilities: PROBS },
          subjectName: 'Aina',
          onDone: () => {},
        })),
    )
    expect(html).toContain('Aina')
    expect((html.match(/aria-pressed="false"/g) || []).length).toBe(3)
    // The note that says whose data this is and what it does not do.
    expect(html).toContain('does not change their score')
  })
})
