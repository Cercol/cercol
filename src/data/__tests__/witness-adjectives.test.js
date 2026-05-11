import { describe, it, expect } from 'vitest'
import { WITNESS_ADJECTIVES } from '../witness-adjectives'
import { ROLE_TOP_ADJECTIVES } from '../../utils/witness-scoring'

/**
 * Structural invariants of the witness adjective corpus.
 *
 * These tests do NOT evaluate the psychometric quality of individual
 * adjectives (that requires human judgement). They protect the
 * structural assumptions the rest of the system relies on:
 * cardinality, factor balance, valence symmetry, schema integrity,
 * ID format, and translation uniqueness.
 *
 * Any change to witness-adjectives.js that breaks an assumption here
 * must update both the data and the rationale, not silently bypass
 * the test.
 */

const FACTORS    = ['E', 'A', 'O', 'C', 'N']
const ID_PATTERN = /^[EAOCN][+\-]\d{2}$/
const ALL_ROLES  = Array.from({ length: 12 }, (_, i) => `R${String(i + 1).padStart(2, '0')}`)

describe('witness-adjectives corpus structure', () => {
  describe('cardinality', () => {
    it('has exactly 100 entries', () => {
      expect(WITNESS_ADJECTIVES).toHaveLength(100)
    })
  })

  describe('per-factor distribution', () => {
    FACTORS.forEach((factor) => {
      it(`has exactly 20 entries for factor ${factor}`, () => {
        const count = WITNESS_ADJECTIVES.filter((a) => a.factor === factor).length
        expect(count).toBe(20)
      })

      it(`has exactly 10 positive and 10 negative entries for factor ${factor}`, () => {
        const entries  = WITNESS_ADJECTIVES.filter((a) => a.factor === factor)
        const positive = entries.filter((a) => a.valence > 0).length
        const negative = entries.filter((a) => a.valence < 0).length
        expect(positive).toBe(10)
        expect(negative).toBe(10)
      })
    })
  })

  describe('schema integrity', () => {
    it('every entry has all required fields with non-empty values', () => {
      WITNESS_ADJECTIVES.forEach((adj) => {
        // id: non-empty string
        expect(typeof adj.id).toBe('string')
        expect(adj.id.length).toBeGreaterThan(0)
        // en / ca: non-empty strings (the two languages stored on the entry)
        expect(typeof adj.en).toBe('string')
        expect(adj.en.trim().length).toBeGreaterThan(0)
        expect(typeof adj.ca).toBe('string')
        expect(adj.ca.trim().length).toBeGreaterThan(0)
        // factor: one of the 5 OCEAN keys
        expect(FACTORS).toContain(adj.factor)
        // valence: exactly +1 or -1
        expect([1, -1]).toContain(adj.valence)
        // tip: object with en and ca
        expect(typeof adj.tip).toBe('object')
        expect(adj.tip).not.toBeNull()
        expect(typeof adj.tip.en).toBe('string')
        expect(adj.tip.en.trim().length).toBeGreaterThan(0)
        expect(typeof adj.tip.ca).toBe('string')
        expect(adj.tip.ca.trim().length).toBeGreaterThan(0)
      })
    })
  })

  describe('id format and uniqueness', () => {
    it('every id matches the pattern {factor}{sign}{nn}', () => {
      WITNESS_ADJECTIVES.forEach((adj) => {
        expect(adj.id).toMatch(ID_PATTERN)
      })
    })

    it('ids are unique across the corpus', () => {
      const ids        = WITNESS_ADJECTIVES.map((a) => a.id)
      const uniqueIds  = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('the factor letter in the id matches the entry factor', () => {
      WITNESS_ADJECTIVES.forEach((adj) => {
        const idFactor = adj.id[0]
        expect(idFactor).toBe(adj.factor)
      })
    })

    it('the sign in the id matches the entry valence', () => {
      WITNESS_ADJECTIVES.forEach((adj) => {
        const idSign         = adj.id[1]
        const expectedSign   = adj.valence > 0 ? '+' : '-'
        expect(idSign).toBe(expectedSign)
      })
    })
  })

  describe('translation uniqueness (no collisions per language)', () => {
    it('no two adjectives share the same English word', () => {
      const enValues = WITNESS_ADJECTIVES.map((a) => a.en.toLowerCase().trim())
      const seen     = new Map()
      const dupes    = []
      enValues.forEach((v, i) => {
        if (seen.has(v)) {
          dupes.push({ word: v, ids: [seen.get(v), WITNESS_ADJECTIVES[i].id] })
        } else {
          seen.set(v, WITNESS_ADJECTIVES[i].id)
        }
      })
      if (dupes.length > 0) {
        throw new Error(
          `English translation collisions found:\n` +
          dupes.map((d) => `  "${d.word}" appears in ${d.ids.join(' and ')}`).join('\n')
        )
      }
      expect(dupes).toHaveLength(0)
    })

    it('no two adjectives share the same Catalan word', () => {
      const caValues = WITNESS_ADJECTIVES.map((a) => a.ca.toLowerCase().trim())
      const seen     = new Map()
      const dupes    = []
      caValues.forEach((v, i) => {
        if (seen.has(v)) {
          dupes.push({ word: v, ids: [seen.get(v), WITNESS_ADJECTIVES[i].id] })
        } else {
          seen.set(v, WITNESS_ADJECTIVES[i].id)
        }
      })
      if (dupes.length > 0) {
        throw new Error(
          `Catalan translation collisions found:\n` +
          dupes.map((d) => `  "${d.word}" appears in ${d.ids.join(' and ')}`).join('\n')
        )
      }
      expect(dupes).toHaveLength(0)
    })
  })
})

describe('ROLE_TOP_ADJECTIVES integrity', () => {
  it('has entries for all 12 roles R01 through R12', () => {
    ALL_ROLES.forEach((role) => {
      expect(ROLE_TOP_ADJECTIVES[role]).toBeDefined()
    })
  })

  it('every role has exactly 5 adjective IDs', () => {
    Object.entries(ROLE_TOP_ADJECTIVES).forEach(([role, ids]) => {
      expect(ids, `role ${role} must have 5 adjective IDs`).toHaveLength(5)
    })
  })

  it('every referenced adjective ID exists in WITNESS_ADJECTIVES', () => {
    const corpusIds = new Set(WITNESS_ADJECTIVES.map((a) => a.id))
    const missing   = []
    Object.entries(ROLE_TOP_ADJECTIVES).forEach(([role, ids]) => {
      ids.forEach((id) => {
        if (!corpusIds.has(id)) missing.push({ role, id })
      })
    })
    if (missing.length > 0) {
      throw new Error(
        `ROLE_TOP_ADJECTIVES references IDs not found in the corpus:\n` +
        missing.map((m) => `  ${m.role} → ${m.id}`).join('\n')
      )
    }
    expect(missing).toHaveLength(0)
  })

  it('adjective IDs within a single role are unique (no duplicates)', () => {
    Object.entries(ROLE_TOP_ADJECTIVES).forEach(([role, ids]) => {
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size, `role ${role} has duplicate adjective IDs`).toBe(ids.length)
    })
  })
})
