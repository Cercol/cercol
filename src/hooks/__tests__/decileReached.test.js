import { describe, it, expect } from 'vitest'
import { pctReached } from '../useTrackTestStart'

describe('pctReached', () => {
  it('reports the exact whole percent completed', () => {
    expect(pctReached(18, 120)).toBe(15)
    expect(pctReached(6, 60)).toBe(10)
    expect(pctReached(17, 60)).toBe(28)
    expect(pctReached(59, 60)).toBe(98)
  })
  it('says nothing on the last item or before the first', () => {
    // The results row records the finish; a 100% milestone would double-count.
    expect(pctReached(60, 60)).toBe(null)
    expect(pctReached(10, 10)).toBe(null)
    expect(pctReached(0, 60)).toBe(null)
    expect(pctReached(1, 0)).toBe(null)
  })
  it('works for the short instrument too', () => {
    expect(pctReached(1, 10)).toBe(10)
    expect(pctReached(9, 10)).toBe(90)
  })
})
