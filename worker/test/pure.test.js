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

// Font stacks from mm-design carry double quotes; inside style="..." they
// would end the attribute and drop every rule after them (that shipped once).
import { DISPLAY, SANS, stat, shell } from '../src/email-ui.js'
import { warnings, actions, CAPS, dayBounds } from '../src/jobs/daily.js'
describe('email kit', () => {
  it('font stacks contain no double quotes', () => {
    expect(DISPLAY).not.toMatch(/"/); expect(SANS).not.toMatch(/"/)
    expect(stat('x', '1')).toMatch(/font-family:'Playfair Display'/)
    expect(shell('hi')).toContain('email-logo.png')
  })
})
describe('daily brief', () => {
  it('warns at 70% of a cap, on killed requests, and on faults', () => {
    const ok = { d1: { rowsRead: 1, rowsWritten: 1 }, kv: { write: 1 }, worker: { requests: 1, errors: 0, cpuP99: 1, byStatus: [] }, mailCredit: 5 }
    expect(warnings(ok)).toEqual([])
    const bad = { ...ok, d1: { rowsRead: CAPS.d1RowsRead * 0.7, rowsWritten: 1 }, worker: { requests: 1, errors: 3, cpuP99: 12, byStatus: [['exceededResources', 3], ['scriptThrewException', 3]] }, mailCredit: 0.1 }
    expect(warnings(bad)).toHaveLength(4)
    expect(warnings({ pending: true })).toHaveLength(1)
  })
  it('a CPU p99 over budget is not a warning unless requests were actually killed', () => {
    const hot = { d1: { rowsRead: 1, rowsWritten: 1 }, kv: { write: 1 }, worker: { requests: 1, errors: 0, cpuP99: 85.7, byStatus: [['clientDisconnected', 2]] }, mailCredit: 5 }
    expect(warnings(hot)).toEqual([])
  })
  it('actions lead with the warnings, then the funnel, the hot article and the clickless query', () => {
    const data = {
      warns: ['Top up Purelymail.'],
      product: { signups: [0, 0], tests: [0, 0], visitors: [22, 3], starts: [1, 0], topPages: [['/', 4]],
        takingOff: [['Limits', 'limits', 8, 0]], dropOff: [['First Quarter', 30]] },
      search: { zeroClick: ['https://cercol.team/blog/facet/', 24, 4.5] },
    }
    const a = actions(data)
    expect(a).toHaveLength(4)
    expect(a[0]).toBe('Top up Purelymail.')
    expect(a[1]).toContain('none finished, getting as far as First Quarter at 30%')
    expect(a[2]).toContain('taking off')
    expect(a[3]).toContain('24 impressions at position 4.5')
    // Nobody starting is a different failure from starting and dropping out.
    // No progress events at all: say so rather than implying a known point.
    expect(actions({ ...data, product: { ...data.product, dropOff: [] }, warns: [], search: null })[0]).toContain('nobody reached the first tenth')
    const cold = { ...data, product: { ...data.product, starts: [0, 0] }, warns: [], search: null }
    expect(actions(cold)[0]).toContain('nobody started a test')
    // A quiet, healthy day produces an empty list, and the brief says so.
    expect(actions({ warns: [], product: { visitors: [3, 1], starts: [0, 0], tests: [0, 0], topPages: [], takingOff: [] }, search: null })).toEqual([])
    // A page nobody clicked but nobody really saw either is not a task.
    expect(actions({ warns: [], product: { visitors: [3, 1], starts: [0, 0], tests: [0, 0], topPages: [], takingOff: [] }, search: { zeroClick: null } })).toEqual([])
  })
  it('nags about the Hetzner decommission from the due date until silenced', () => {
    const ok = { d1: { rowsRead: 1, rowsWritten: 1 }, kv: { write: 1 }, worker: { requests: 1, errors: 0, cpuP99: 1, byStatus: [] }, mailCredit: 5 }
    expect(warnings(ok, { today: '2026-08-30' })).toEqual([])
    expect(warnings(ok, { today: '2026-08-31' })).toHaveLength(1)
    expect(warnings(ok, { today: '2026-09-15', decommissioned: true })).toEqual([])
  })
  it('dayBounds is yesterday UTC and the same weekday a week earlier', () => {
    const b = dayBounds(new Date('2026-08-18T04:00:00Z'))
    expect(b.y0.toISOString()).toBe('2026-08-17T00:00:00.000Z'); expect(b.y1.toISOString()).toBe('2026-08-18T00:00:00.000Z')
    expect(b.w0.toISOString()).toBe('2026-08-10T00:00:00.000Z'); expect(b.w1.toISOString()).toBe('2026-08-11T00:00:00.000Z')
  })
})

// The blog reads sit behind the edge cache; a stale or unstored response is
// the difference between one D1 scan per build and six hundred.
import { cached } from '../src/index.js'
describe('blog edge cache', () => {
  const store = new Map()
  globalThis.caches = { default: {
    match: async (k) => store.get(String(k.url || k)),
    put: async (k, v) => { store.set(String(k.url || k), v) },
    delete: async (k) => store.delete(String(k)),
  } }
  const req = new Request('https://api.cercol.team/blog')

  it('stores a 200, serves the second call from the cache, and never caches an error', async () => {
    let calls = 0
    const ok = () => { calls++; return Response.json([{ slug: 'a' }]) }
    const first = await cached(req, null, ok)
    expect(first.headers.get('cache-control')).toBe('public, max-age=60')
    expect(await (await cached(req, null, ok)).json()).toEqual([{ slug: 'a' }])
    expect(calls).toBe(1)

    store.clear()
    const boom = () => new Response('nope', { status: 500 })
    expect((await cached(req, null, boom)).status).toBe(500)
    expect(store.size).toBe(0)
  })
})

import { isAutomated } from '../src/writes.js'
describe('automated clients', () => {
  const ua = (s) => isAutomated(new Request('https://api.cercol.team/events', { headers: { 'user-agent': s } }))
  it('keeps agents and crawlers out of the funnel, and real browsers in', () => {
    expect(ua('Mozilla/5.0 (Macintosh) Claude/1.32352.1 Chrome/148.0 Electron/42.9 Safari/537.36')).toBe(true)
    expect(ua('Mozilla/5.0 (compatible; ClaudeBot/1.0)')).toBe(true)
    expect(ua('Mozilla/5.0 Chrome-Lighthouse')).toBe(true)
    expect(ua('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Safari/604.1')).toBe(false)
    // CUBOT is a phone brand: a bare "bot" would have cost us those visitors.
    expect(ua('Mozilla/5.0 (Linux; Android 13; CUBOT NOTE 30) Chrome/120')).toBe(false)
  })
})
