import { describe, it, expect } from 'vitest'
import { scoreToPercent5, scoreLabel5 } from '../scoring-utils'

describe('scoreToPercent5', () => {
  it('maps 1 to 0', () => {
    expect(scoreToPercent5(1)).toBe(0)
  })

  it('maps 5 to 100', () => {
    expect(scoreToPercent5(5)).toBe(100)
  })

  it('maps 3 to 50', () => {
    expect(scoreToPercent5(3)).toBe(50)
  })

  it('rounds fractional results', () => {
    // (2 - 1) / 4 * 100 = 25
    expect(scoreToPercent5(2)).toBe(25)
    // (4 - 1) / 4 * 100 = 75
    expect(scoreToPercent5(4)).toBe(75)
  })

  it('applies Math.round to non-integer inputs', () => {
    // (2.5 - 1) / 4 * 100 = 37.5 → rounds to 38
    expect(scoreToPercent5(2.5)).toBe(38)
  })
})

describe('scoreLabel5', () => {
  it('returns low for score below 2.5', () => {
    expect(scoreLabel5(1)).toBe('low')
    expect(scoreLabel5(2.4)).toBe('low')
  })

  it('returns moderate at boundary 2.5', () => {
    expect(scoreLabel5(2.5)).toBe('moderate')
  })

  it('returns moderate up to and including 3.5', () => {
    expect(scoreLabel5(3.0)).toBe('moderate')
    expect(scoreLabel5(3.5)).toBe('moderate')
  })

  it('returns high above 3.5', () => {
    expect(scoreLabel5(3.6)).toBe('high')
    expect(scoreLabel5(5)).toBe('high')
  })
})
