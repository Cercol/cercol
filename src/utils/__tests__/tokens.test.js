/**
 * Design token sanity tests.
 *
 * These tests guard against the class of regression where mm-design changes
 * the exported format of a token (e.g. from a hex string to a rich object)
 * and silently breaks all inline style props like style={{ color: colors.blue }}.
 *
 * If any of these fail, the CI build fails — preventing a broken deploy.
 */
import { describe, it, expect } from 'vitest'
import {
  colors,
  DOMAIN_BG_CLASSES,
  DOMAIN_ICON_CLASSES,
  ROLE_COLORS,
  BALANCE_COLORS,
  BRAND_TINTS,
} from '../../design/tokens'

const HEX_RE = /^#[0-9a-fA-F]{3,8}$/

function isHex(value) {
  return typeof value === 'string' && HEX_RE.test(value)
}

// ── colors object ────────────────────────────────────────────────────────────

describe('colors — all values are CSS-ready hex strings', () => {
  const brandKeys  = ['red', 'blue', 'yellow', 'green', 'white', 'black']
  const semanticKeys = [
    'primary', 'primaryDark', 'background', 'surface', 'border',
    'textPrimary', 'textMuted', 'success', 'warning', 'error',
  ]
  const reportKeys = ['arcBar', 'arcLabel', 'selfBar', 'trackBg']
  const dimensionKeys = [
    'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism',
  ]

  for (const key of [...brandKeys, ...semanticKeys, ...reportKeys, ...dimensionKeys]) {
    it(`colors.${key} is a hex string`, () => {
      expect(colors[key], `colors.${key} must be a hex string usable in style={{}}`)
        .toSatisfy(isHex)
    })
  }
})

// ── BRAND_TINTS ───────────────────────────────────────────────────────────────

describe('BRAND_TINTS — all values are hex strings', () => {
  it('BRAND_TINTS.blue is a hex string',   () => expect(BRAND_TINTS?.blue).toSatisfy(isHex))
  it('BRAND_TINTS.red is a hex string',    () => expect(BRAND_TINTS?.red).toSatisfy(isHex))
  it('BRAND_TINTS.yellow is a hex string', () => expect(BRAND_TINTS?.yellow).toSatisfy(isHex))
  it('BRAND_TINTS.green is a hex string',  () => expect(BRAND_TINTS?.green).toSatisfy(isHex))
})

// ── Tailwind class strings ────────────────────────────────────────────────────

describe('DOMAIN_ICON_CLASSES — no [object Object] in Tailwind class strings', () => {
  for (const [domain, cls] of Object.entries(DOMAIN_ICON_CLASSES)) {
    it(`DOMAIN_ICON_CLASSES.${domain} does not contain "[object"`, () => {
      expect(cls).not.toContain('[object')
    })
  }
})

describe('DOMAIN_BG_CLASSES — no [object Object] in Tailwind class strings', () => {
  for (const [domain, cls] of Object.entries(DOMAIN_BG_CLASSES)) {
    it(`DOMAIN_BG_CLASSES.${domain} does not contain "[object"`, () => {
      expect(cls).not.toContain('[object')
    })
  }
})

// ── ROLE_COLORS ───────────────────────────────────────────────────────────────

describe('ROLE_COLORS — all values are hex strings', () => {
  for (const [role, value] of Object.entries(ROLE_COLORS)) {
    it(`ROLE_COLORS.${role} is a hex string`, () => {
      expect(value, `ROLE_COLORS.${role} must be a hex string`).toSatisfy(isHex)
    })
  }
})

// ── BALANCE_COLORS ────────────────────────────────────────────────────────────

describe('BALANCE_COLORS — bg and text are hex strings', () => {
  for (const [key, { bg, text }] of Object.entries(BALANCE_COLORS)) {
    it(`BALANCE_COLORS.${key}.bg is a hex string`, () => expect(bg).toSatisfy(isHex))
    it(`BALANCE_COLORS.${key}.text is a hex string`, () => expect(text).toSatisfy(isHex))
  }
})

// ── Critical brand values ─────────────────────────────────────────────────────

describe('Brand palette — exact expected hex values', () => {
  it('blue is #0047ba',  () => expect(colors.blue).toBe('#0047ba'))
  it('red is #cf3339',   () => expect(colors.red).toBe('#cf3339'))
  it('yellow is #f1c22f', () => expect(colors.yellow).toBe('#f1c22f'))
  it('green is #427c42', () => expect(colors.green).toBe('#427c42'))
  it('white is #ffffff', () => expect(colors.white).toBe('#ffffff'))
  it('black is #111111', () => expect(colors.black).toBe('#111111'))
})
