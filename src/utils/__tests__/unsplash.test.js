import { describe, it, expect } from 'vitest'
import { normalizeUnsplashUrl } from '../unsplash'

describe('normalizeUnsplashUrl', () => {
  it('returns null for null / undefined input', () => {
    expect(normalizeUnsplashUrl(null)).toBeNull()
    expect(normalizeUnsplashUrl(undefined)).toBeNull()
    expect(normalizeUnsplashUrl('')).toBeNull()
  })

  it('passes through non-Unsplash URLs unchanged', () => {
    const url = 'https://example.com/image.jpg'
    expect(normalizeUnsplashUrl(url)).toBe(url)
  })

  it('fixes malformed double-? URLs from the database', () => {
    const malformed =
      'https://images.unsplash.com/photo-abc?ixid=M3w5NDcwMjR8MHwxfHNlYXJjaHwxfA&ixlib=rb-4.1.0?w=1200&auto=format&fit=crop&q=80'
    const result = normalizeUnsplashUrl(malformed, { w: 760 })
    // Must have exactly one `?`
    expect(result.split('?').length).toBe(2)
    // Must contain correct width
    expect(result).toContain('w=760')
    // Must not contain the broken second ?
    expect(result).not.toMatch(/ixlib=[^&]+\?/)
    // ixid param must be preserved
    expect(result).toContain('ixid=')
    expect(result).toContain('auto=format')
    expect(result).toContain('fit=crop')
  })

  it('applies sizing to well-formed single-? URLs', () => {
    const url = 'https://images.unsplash.com/photo-xyz?w=1200&auto=format&fit=crop&q=80'
    const result = normalizeUnsplashUrl(url, { w: 400, q: 70 })
    expect(result.split('?').length).toBe(2)
    expect(result).toContain('w=400')
    expect(result).toContain('q=70')
    expect(result).toContain('auto=format')
  })

  it('uses default w=760 q=80 when no options provided', () => {
    const url = 'https://images.unsplash.com/photo-def?ixid=abc&ixlib=rb-4.1.0?w=1200&q=75'
    const result = normalizeUnsplashUrl(url)
    expect(result).toContain('w=760')
    expect(result).toContain('q=80')
  })
})
