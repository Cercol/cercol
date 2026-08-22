/**
 * Unit tests for the Worker's pure logic: everything that runs without D1,
 * KV or the network. The integration side (real endpoints, real BigQuery)
 * was verified against production during the migration and is documented
 * in docs/architecture/seo-pipeline.md; this file is what CI can hold.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

import { issueAccessToken, verifyAccessToken, bearerFrom } from '../src/jwt.js'
import { extractLinkTargets, extractDois, isInternal, langsWithContent, doiUrl } from '../src/links.js'
import { scoreForReport, zscoresFor } from '../src/scoring.js'
import { validateResult } from '../src/writes.js'
import { classifyChannel, buildChannels, buildFunnel, buildCumulative, weekBounds, weekLabel } from '../src/jobs/digest.js'
import { zeroClickFloor, actions } from '../src/jobs/daily.js'
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
import { warnings, actions, CAPS, dayBounds, CTA_CLAIM_MIN_READS } from '../src/jobs/daily.js'
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
    // The old line ended "Make sure it points at an instrument", which every
    // article already does. What the line reports now is whether anyone took
    // the bridge, which is the half that can actually come out either way.
    //
    // Eight reads cannot answer it either way: at the ~0.5% this site converts
    // at, a day with no click is what eight reads predict. The line reports
    // the reads and stops rather than blaming the copy.
    expect(a[2]).not.toContain('Not one of them went on to an instrument')
    expect(a[2]).toBe(a[2].trimEnd())
    expect(a[3]).toContain('24 impressions at position 4.5')
    const clicked = actions({ ...data, warns: [], search: null,
      product: { ...data.product, takingOff: [['Limits', 'limits', 8, 0, 2]] } })
    expect(clicked[1]).toContain('2 of them went on to an instrument.')
    // Above CTA_CLAIM_MIN_READS a silent day stops being the likeliest
    // outcome, and the copy is a fair thing to point at.
    const loud = actions({ ...data, warns: [], search: null,
      product: { ...data.product, takingOff: [['Limits', 'limits', CTA_CLAIM_MIN_READS, 0, 0]] } })
    expect(loud[1]).toContain('Not one of them went on to an instrument')
    const quiet = actions({ ...data, warns: [], search: null,
      product: { ...data.product, takingOff: [['Limits', 'limits', CTA_CLAIM_MIN_READS - 1, 0, 0]] } })
    expect(quiet[1]).not.toContain('Not one of them')
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

import { plainAction, fileTasks } from '../src/jobs/daily.js'
describe('daily tasks as a GitHub issue', () => {
  it('turns the email markup back into something readable in an issue', () => {
    expect(plainAction('<a href="https://cercol.team/blog/x/" style="color:#0047ba;">A title</a> is taking off'))
      .toBe('[A title](https://cercol.team/blog/x/) is taking off')
    expect(plainAction('3 errors. Read them with <code>npx wrangler tail</code>.'))
      .toBe('3 errors. Read them with `npx wrangler tail`.')
    expect(plainAction('Position 4.5 for &ldquo;facette&rdquo; &mdash; rewrite it'))
      .toBe('Position 4.5 for "facette" — rewrite it')
  })
  it('does nothing without a token, and nothing on a quiet day', async () => {
    expect(await fileTasks({}, '2026-08-20', ['something'])).toBe(null)
    expect(await fileTasks({ GITHUB_TOKEN: 'x' }, '2026-08-20', [])).toBe(null)
  })
})

// Search Console is the only place that says whether Google will index a
// page at all; the 307 regression went unseen for eleven days without it.
import { indexingActions, SITEMAP_STALE_DAYS } from '../src/jobs/indexing.js'
describe('indexing', () => {
  it('says nothing at all until the service account has access', () => {
    expect(indexingActions({ pending: true })).toEqual([])
    expect(indexingActions({ pending: true, error: 'search console 403' })).toEqual([])
    expect(indexingActions(null)).toEqual([])
  })
  it('reports a canonical Google picked over ours, which is what a 307 looks like', () => {
    const [line] = indexingActions({
      problems: [{ url: 'https://cercol.team/instruments/', state: 'page with redirect', googleCanonical: 'https://cercol.team/instruments' }],
      sitemap: null,
    })
    expect(line).toContain('indexes https://cercol.team/instruments instead of https://cercol.team/instruments/')
    expect(line).toContain('page with redirect')
  })
  it('flags a sitemap with errors, or one Google has stopped fetching', () => {
    const stale = { problems: [], sitemap: { path: '/sitemap.xml', errors: 0, warnings: 3, ageDays: SITEMAP_STALE_DAYS } }
    expect(indexingActions(stale)).toHaveLength(1)
    expect(indexingActions(stale)[0]).toContain('last downloaded')
    const broken = { problems: [], sitemap: { path: '/sitemap.xml', errors: 2, warnings: 0, ageDays: 1 } }
    expect(indexingActions(broken)).toEqual([expect.stringContaining('2 error(s)')])
    // Warnings alone are not a task, and a fresh clean sitemap is silent.
    expect(indexingActions({ problems: [], sitemap: { path: '/sitemap.xml', errors: 0, warnings: 9, ageDays: 1 } })).toEqual([])
  })
})

describe('a task list that could not be filed', () => {
  it('says so in the brief instead of failing quietly', async () => {
    const { runDaily } = await import('../src/jobs/daily.js')
    expect(typeof runDaily).toBe('function')
    // The warning is a plain push onto data.warns, which actions() leads with.
    const withError = actions({ warns: ['The task list could not be filed as an issue (github 403).'], product: { visitors: [1, 1], starts: [0, 0], tests: [0, 0], topPages: [], takingOff: [] }, search: null })
    expect(withError[0]).toContain('could not be filed')
  })
})

describe('evidence in the filed issue', () => {
  it('summarises each starter so a reader can tell a person from a crawler', async () => {
    const { fileTasks } = await import('../src/jobs/daily.js')
    let sent = null
    const realFetch = globalThis.fetch
    globalThis.fetch = async (url, init) => { sent = JSON.parse(init.body); return { ok: true, json: async () => ({ number: 7 }) } }
    const starters = {
      a1b2c3d4: [{ name: 'page_view', n: 4, at: '09:12' }, { name: 'article_view', n: 2, at: '09:14' }, { name: 'test_start', n: 1, at: '09:20' }, { name: 'test_progress', n: 3, pct: 30, at: '09:21' }],
      ffffffff: [{ name: 'test_start', n: 1, at: '03:02' }],
    }
    const res = await fileTasks({ GITHUB_TOKEN: 'x' }, '2026-08-20', ['something real'], { starters })
    globalThis.fetch = realFetch
    expect(res).toEqual({ number: 7 })
    expect(sent.body).toContain('`a1b2c3d4`: page_view x4')
    expect(sent.body).toContain('reached 30%')
    expect(sent.body).toContain('`ffffffff`: test_start x1')
    // The full id never leaves the Worker: the issue is public.
    expect(sent.body).not.toContain('a1b2c3d4-')
  })
  it('leaves the section out entirely when nobody started a test', async () => {
    const { fileTasks } = await import('../src/jobs/daily.js')
    let sent = null
    const realFetch = globalThis.fetch
    globalThis.fetch = async (url, init) => { sent = JSON.parse(init.body); return { ok: true, json: async () => ({ number: 8 }) } }
    await fileTasks({ GITHUB_TOKEN: 'x' }, '2026-08-20', ['something'], { starters: {} })
    globalThis.fetch = realFetch
    expect(sent.body).not.toContain('<details>')
  })
})

// An article compared against itself: the one content signal that is a
// defect rather than an opinion.
import { languageGaps, freshGaps, languageActions, MIN_ARTICLE_IMPRESSIONS } from '../src/jobs/languages.js'
describe('language gaps', () => {
  // A blog whose impressions run 60% English, 20% Spanish, 20% German.
  const site = [
    { slug: 'a', lang: 'en', impressions: 60 }, { slug: 'a', lang: 'es', impressions: 20 }, { slug: 'a', lang: 'de', impressions: 20 },
    { slug: 'b', lang: 'en', impressions: 60 }, { slug: 'b', lang: 'es', impressions: 40 }, { slug: 'b', lang: 'de', impressions: 0 },
  ]
  it('flags the version that took none of what its own article predicts', () => {
    const gaps = languageGaps(site)
    expect(gaps).toHaveLength(1)
    expect(gaps[0]).toMatchObject({ slug: 'b', lang: 'de', impressions: 0 })
    // 100 impressions on b, German is 20/200 of the blog, so ~10 expected.
    expect(gaps[0].expected).toBe(10)
  })
  it('says nothing about an article too small to have a shape', () => {
    const small = site.map((r) => ({ ...r, impressions: Math.floor(r.impressions / 10) }))
    expect(languageGaps(small)).toEqual([])
    expect(languageGaps([])).toEqual([])
    // Right at the line, an article still counts.
    expect(MIN_ARTICLE_IMPRESSIONS).toBe(50)
  })
  it('does not flag a language the whole blog barely has', () => {
    // Danish is one impression across the blog: expecting none of it on any
    // single article is correct, not a defect.
    const withDa = [...site, { slug: 'a', lang: 'da', impressions: 1 }]
    expect(languageGaps(withDa).filter((g) => g.lang === 'da')).toEqual([])
  })

  const gap = { slug: 'b', lang: 'de', impressions: 0, expected: 10, total: 100 }
  it('reports a gap once, then holds it', () => {
    const now = Date.parse('2026-09-01T05:00:00Z')
    const first = freshGaps([gap], {}, { now })
    expect(first.fresh).toHaveLength(1)
    // Tomorrow, same gap, nothing new to say.
    const second = freshGaps([gap], first.reported, { now: now + 86400e3 })
    expect(second.fresh).toEqual([])
    // A month later it is still broken, so it is worth saying again.
    const later = freshGaps([gap], first.reported, { now: now + 31 * 86400e3 })
    expect(later.fresh).toHaveLength(1)
  })
  it('forgets a gap that closed, so a recurrence reads as news', () => {
    const now = Date.parse('2026-09-01T05:00:00Z')
    const { reported } = freshGaps([gap], {}, { now })
    const closed = freshGaps([], reported, { now: now + 86400e3 })
    expect(closed.reported).toEqual({})
    expect(freshGaps([gap], closed.reported, { now: now + 2 * 86400e3 }).fresh).toHaveLength(1)
  })
  it('writes one line, for the worst gap only', () => {
    const [line] = languageActions({ fresh: [gap, { ...gap, lang: 'fr', expected: 6 }] })
    expect(line).toContain('German version of b')
    expect(line).toContain('predict about 10')
    expect(line).toContain('https://cercol.team/de/blog/b/')
    expect(languageActions({ fresh: [] })).toEqual([])
    expect(languageActions(null)).toEqual([])
  })
})

describe('instrument version', () => {
  it('rejects a version that is not a small positive integer', () => {
    const base = { instrument: 'newMoon', presence: 4 }
    expect(validateResult({ ...base, instrument_version: 1 })).toBeNull()
    expect(validateResult({ ...base })).toBeNull()
    expect(validateResult({ ...base, instrument_version: null })).toBeNull()
    expect(validateResult({ ...base, instrument_version: 0 })).toBe('instrument_version')
    expect(validateResult({ ...base, instrument_version: -1 })).toBe('instrument_version')
    expect(validateResult({ ...base, instrument_version: 1.5 })).toBe('instrument_version')
    expect(validateResult({ ...base, instrument_version: '1' })).toBe('instrument_version')
  })
})

describe('zero-click floor', () => {
  it('scales the evidence needed with how far down the page sits', () => {
    // Zero clicks at position 2 is odd; at position 9 it is what the maths
    // predicts. A flat floor treated them the same.
    expect(zeroClickFloor(2)).toBeLessThan(zeroClickFloor(5))
    expect(zeroClickFloor(5)).toBeLessThan(zeroClickFloor(9))
    expect(zeroClickFloor(9)).toBeLessThan(zeroClickFloor(15))
  })

  it('would not have reported the item that started this', () => {
    // 168 impressions at position 8.0, which is an 8% chance of happening.
    expect(168).toBeLessThan(zeroClickFloor(8.0))
  })

  it('still reports a page with real exposure near the top', () => {
    expect(60).toBeGreaterThan(zeroClickFloor(2.0))
  })

  it('never asks for fewer than the old flat floor', () => {
    for (const pos of [1, 2, 3, 5, 7, 8, 10]) expect(zeroClickFloor(pos)).toBeGreaterThanOrEqual(10)
  })
})

describe('export gaps', () => {
  const base = {
    warns: [], indexing: null, languages: null,
    product: {
      starts: [0, 0], tests: [0, 0], visitors: [0, 0], topPages: [], dropOff: [],
      takingOff: [], byInstrument: [], byLang: [], newUsers: [0, 0], pageViews: [0, 0],
      signups: [0, 0], top: [], totals: {}, witness: [0, 0],
    },
  }

  it('says nothing when every day arrived', () => {
    const out = actions({ ...base, search: { exportGaps: [], queries: [], zeroClick: null } })
    expect(out.join(' ')).not.toContain('never exported')
  })

  it('names the day and the deadline when one is missing', () => {
    const out = actions({ ...base, search: { exportGaps: ['2026-08-16'], queries: [], zeroClick: null } })
    const line = out.find((l) => l.includes('never exported'))
    expect(line).toContain('2026-08-16')
    expect(line).toContain('retries for about a week')
    // The point a reader needs: the day still exists in Search Console.
    expect(line).toContain('not lost from Search Console')
  })

  it('leads with it, because it is the only line with a deadline', () => {
    const out = actions({ ...base, warns: [], search: { exportGaps: ['2026-08-16'], queries: [], zeroClick: null } })
    expect(out[0]).toContain('never exported')
  })
})

describe('what counts toward a norm', () => {
  it('is one version only, and the SQL says so', () => {
    // A norm is a mean and a spread over answers to the same questions.
    // Pooling answers given to two different item sets, or on two different
    // response scales, produces a number that describes neither. The stamp
    // exists for this and the query has to use it.
    const src = readFileSync('worker/src/norms.js', 'utf8')
    expect(src).toMatch(/instrument_version = \?/)
    expect(src).toMatch(/COALESCE\(is_seed, 0\) = 0/)
  })

  it('has exactly one definition of it', () => {
    // If a counter reports progress toward a threshold using different
    // arithmetic from the norm computation, it reports a number the norms
    // will not use, which is worse than reporting nothing.
    const norms = readFileSync('worker/src/norms.js', 'utf8')
    const admin = readFileSync('worker/src/admin.js', 'utf8')
    expect(norms).toContain('export async function usableCorpus')
    expect(admin).toContain('usableCorpus(env.DB)')
  })
})
