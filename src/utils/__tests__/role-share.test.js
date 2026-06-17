import { describe, it, expect } from 'vitest'
import { buildSharePath, isRoleId, roleOgImage, ROLE_IDS } from '../role-share'
import { computeRole } from '../role-scoring'

const scores = { presence: 4.5, bond: 4.2, discipline: 3.5, depth: 2.5, vision: 3.7 }

describe('role-share', () => {
  it('buildSharePath returns /share/<role>?r= matching computeRole', () => {
    const { role } = computeRole(scores)
    const path = buildSharePath(scores)
    expect(path).toMatch(/^\/share\/R\d\d\?r=.+/)
    expect(path.startsWith(`/share/${role}?r=`)).toBe(true)
  })

  it('exposes the 12 role ids and validates them', () => {
    expect(ROLE_IDS).toHaveLength(12)
    expect(ROLE_IDS[0]).toBe('R01')
    expect(ROLE_IDS[11]).toBe('R12')
    expect(isRoleId('R07')).toBe(true)
    expect(isRoleId('R99')).toBe(false)
    expect(isRoleId('about')).toBe(false)
  })

  it('maps role id to its per-role OG image, with a safe fallback', () => {
    expect(roleOgImage('R03')).toBe('/og/role-R03.png')
    expect(roleOgImage('bogus')).toBe('/og/role-R01.png')
  })
})
