import { describe, it, expect } from 'vitest'
import { decileReached } from '../useTrackTestStart'

describe('decileReached', () => {
  it('reports a tenth only once it is complete', () => {
    expect(decileReached(5, 60)).toBe(null)   // 8%, not there yet
    expect(decileReached(6, 60)).toBe(1)      // exactly 10%
    expect(decileReached(17, 60)).toBe(2)
    expect(decileReached(59, 60)).toBe(9)
  })
  it('says nothing on the last item or before the first', () => {
    // The results row records the finish; a 100% milestone would double-count.
    expect(decileReached(60, 60)).toBe(null)
    expect(decileReached(10, 10)).toBe(null)
    expect(decileReached(0, 60)).toBe(null)
    expect(decileReached(1, 0)).toBe(null)
  })
  it('works for the short instrument too', () => {
    expect(decileReached(1, 10)).toBe(1)
    expect(decileReached(9, 10)).toBe(9)
  })
})
