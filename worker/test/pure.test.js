/**
 * Unit tests for the Worker's pure logic: everything that runs without D1,
 * KV or the network. The integration side (real endpoints, real BigQuery)
 * was verified against production during the migration and is documented
 * in docs/architecture/seo-pipeline.md; this file is what CI can hold.
 */
import { describe, it, expect } from 'vitest'

import { issueAccessToken, verifyAccessToken, bearerFrom } from '../src/jwt.js'
import { extractLinkTargets, extractDois, isInternal, langsWithContent, doiUrl } from '../src/links.js'
import { scoreForReport, zscoresFor } from '../src/scoring.js'
import { classifyChannel, buildChannels, buildFunnel, buildCumulative, weekBounds, weekLabel } from '../src/jobs/digest.js'
import { choosePerOwner } from '../src/jobs/nudge.js'
import { classifyBroken } from '../src/jobs/links.js'
import { normaliseDate, parseQueryStats } from '../src/jobs/bing.js'
import { parsePsi } from '../src/jobs/pagespeed.js'
import { resolveNorm } from '../src/norms.js'

const SECRET = 'x'.repeat(48)

describe('jwt', () => {
  it('round-trips and carries the api/auth.py claims', async () => {
    const t = await issueAccessToken(SECRET, 'u1', 'a@b.c')
    const p = await verifyAccessToken(SECRET, t)
    expect(p).toMatchObject({ sub: 'u1', email: 'a@b.c', aud: 'authenticated' })
    expect(p.exp - p.iat).toBe(3600)
  })
  it('rejects a wrong secret, a tampered payload, and a wrong audience', async () => {
    const t = await issueAccessToken(SECRET, 'u1', 'a@b.c')
    expect(await verifyAccessToken('y'.repeat(48), t)).toBeNull()
    const [h, p, s] = t.split('.')
    const forged = btoa(JSON.stringify({ sub: 'u2', aud: 'authenticated', exp: 9e9 })).replace(/=+$/, '')
    expect(await verifyAccessToken(SECRET, `${h}.${forged}.${s}`)).toBeNull()
    expect(await verifyAccessToken(SECRET, 'not.a.jwt')).toBeNull()
    expect(await verifyAccessToken(SECRET, '')).toBeNull()
  })
  it('reads a bearer header case-insensitively', () => {
    expect(bearerFrom(new Request('https://x', { headers: { authorization: 'bearer abc' } }))).toBe('abc')
    expect(bearerFrom(new Request('https://x'))).toBeNull()
  })
})

describe('links', () => {
  it('extracts markdown, autolink and href targets, deduped, without anchors', () => {
    const md = '[a](https://x.org/p) <https://y.org> [b](#frag) [c](mailto:x@y) [a](https://x.org/p)'
    expect(extractLinkTargets(md)).toEqual(['https://x.org/p', 'https://y.org'])
  })
  it('reproduces the server parser exactly, including its </a> autolink quirk', () => {
    // api/blog_links.py's autolink regex reads a closing </a> tag as <, /a, >
    // and yields "/a". Faithful port: the link job must see what the server
    // saw, quirks included, so a sweep does not suddenly report new links.
    expect(extractLinkTargets('<a href="https://z.org">z</a>')).toEqual(['/a', 'https://z.org'])
  })
  it('keeps balanced parens in a destination and drops a title suffix', () => {
    expect(extractLinkTargets('[w](https://en.wikipedia.org/wiki/Foo_(bar) "T")')).toEqual(['https://en.wikipedia.org/wiki/Foo_(bar)'])
  })
  it('finds bare, linked and prose DOIs, lowercased, trimmed', () => {
    const md = 'doi:10.1037/A0021212. See [x](https://doi.org/10.1016/j.jrp.2005.08.007) and *(10.1002/jcad.70006)*'
    expect(extractDois(md)).toEqual(['10.1037/a0021212', '10.1016/j.jrp.2005.08.007', '10.1002/jcad.70006'])
  })
  it('classifies internal links and normalises doi.org URLs', () => {
    expect(isInternal('/blog/x')).toBe(true)
    expect(isInternal('https://cercol.team/blog/x')).toBe(true)
    expect(isInternal('https://doi.org/10.1/x')).toBe(false)
    expect(doiUrl('https://DX.doi.org/10.1016/S0092')).toBe('https://doi.org/10.1016/s0092')
    expect(langsWithContent({ en: 'x', ca: '  ', es: null })).toEqual(['en'])
  })
})

describe('scoring', () => {
  it('z-scores against the instrument prior and names a role', () => {
    const s = { presence: 4, bond: 4, discipline: 3, depth: 3, vision: 3.5 }
    const { zscores, role } = scoreForReport(s, 'fullMoon')
    expect(Object.keys(zscores).sort()).toEqual(['bond', 'depth', 'discipline', 'presence', 'vision'])
    expect(role).toMatch(/^R(0[1-9]|1[0-2])$/)
    expect(zscoresFor(s, 'fullMoon').presence).toBeCloseTo(zscores.presence)
  })
  it('returns nulls for an incomplete profile', () => {
    expect(scoreForReport({ presence: 4 }, 'fullMoon')).toEqual({ zscores: null, role: null })
  })
  it('falls back to the prior below NORM_MIN_SAMPLE', () => {
    const [norm, tier] = resolveNorm('fullMoon', 'en', {})
    expect(tier).toBe('prior')
    expect(norm.presence.sd).toBeGreaterThan(0)
  })
})

describe('digest builders', () => {
  it('week bounds are the previous Mon-Sun in UTC', () => {
    const b = weekBounds(new Date('2026-08-17T10:00:00Z')) // a Monday
    expect(b.ws.toISOString()).toBe('2026-08-10T00:00:00.000Z')
    expect(b.we.toISOString()).toBe('2026-08-17T00:00:00.000Z')
    expect(weekLabel(b.ws, b.we)).toBe('Aug 10–Aug 16, 2026')
  })
  it('classifies channels like the server', () => {
    expect(classifyChannel('Newsletter', null)).toBe('newsletter')
    expect(classifyChannel(null, '')).toBe('direct')
    expect(classifyChannel(null, 'https://www.google.com/')).toBe('search')
    expect(classifyChannel(null, 'https://t.co/x')).toBe('social')
    expect(classifyChannel(null, 'https://example.org/')).toBe('referral')
    expect(buildChannels([{ utm_source: null, referrer: null }, { utm_source: 'x', referrer: null }])).toEqual([['direct', 1], ['x', 1]])
  })
  it('funnel rates are per person, guarded', () => {
    const f = buildFunnel({ page_view: 128, article_view: 76, test_start: 7, cta_click: 1 }, 4, { page_view: 80, test_start: 3, test_complete: 2 })
    expect(f.conversions).toEqual([['Visitors → test starters', '3.8%'], ['Reads → CTA clicks', '1.3%'], ['Starters → finishers', '66.7%']])
    expect(buildFunnel({}, 0, {}).conversions[0][1]).toBe('—')
  })
  it('cumulative pivot orders languages and totals rows', () => {
    const c = buildCumulative([{ instrument: 'newMoon', language: 'en', n: 15 }, { instrument: 'newMoon', language: 'fr', n: 3 }, { instrument: 'fullMoon', language: 'en', n: 10 }, { instrument: 'newMoon', language: null, n: 1 }])
    expect(c.languages).toEqual(['en', 'fr', '—'])
    expect(c.rows[0]).toMatchObject({ instrument: 'New Moon', total: 19 })
    expect(c.grand_total).toBe(29)
  })
})

describe('nudge', () => {
  it('one email per owner, about the largest group, once any is due', () => {
    const rows = [
      { id: 'a', owner_email: 'o@x', members: 1, created_at: '2026-07-28', due: 1 },
      { id: 'b', owner_email: 'o@x', members: 6, created_at: '2026-07-30', due: 0 },
      { id: 'c', owner_email: 'p@x', members: 2, created_at: '2026-08-01', due: 0 },
    ]
    const chosen = choosePerOwner(rows)
    expect(chosen).toHaveLength(1)
    expect(chosen[0].id).toBe('b')
    expect(chosen[0].suppress_ids).toEqual(['a'])
  })
})

describe('jobs parsing', () => {
  it('broken is 404 or no answer, never 403 or 5xx', () => {
    expect(classifyBroken(404)).toBe(true); expect(classifyBroken(null)).toBe(true)
    expect(classifyBroken(403)).toBe(false); expect(classifyBroken(503)).toBe(false); expect(classifyBroken(200)).toBe(false)
  })
  it('bing dates in both formats, and query rows', () => {
    expect(normaliseDate('/Date(1716163200000)/')).toBe('2024-05-20')
    expect(normaliseDate('2026-08-10T00:00:00')).toBe('2026-08-10')
    expect(parseQueryStats({ d: [{ Date: '/Date(1716163200000)/', Query: 'q', Impressions: '3', Clicks: 1, AvgImpressionPosition: '2.5' }] }))
      .toEqual([{ date: '2024-05-20', query: 'q', impressions: 3, clicks: 1, avg_position: 2.5 }])
  })
  it('psi rows round like the server', () => {
    const r = parsePsi({ lighthouseResult: { audits: { 'largest-contentful-paint': { numericValue: 6213.6 }, 'cumulative-layout-shift': { numericValue: 0.012 } }, categories: { performance: { score: 0.654 } } }, loadingExperience: { metrics: { INTERACTION_TO_NEXT_PAINT: { percentile: 180 } } } }, 'https://x/', 'mobile', '2026-08-16T04:00:00.000Z')
    expect(r).toMatchObject({ lcp_ms: 6214, cls: 0.012, performance_score: 65, inp_ms: 180, run_date: '2026-08-16', device: 'mobile' })
    expect(r.fid_ms).toBeNull()
  })
})
