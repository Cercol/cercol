/**
 * AdminDashboardPage — staff-only dashboard.
 *
 * Tabs:
 *   Overview  — KPI stat cards + 30-day activity sparklines
 *   Users     — paginated table with search, CSV export, toggle premium
 *   Results   — paginated table with instrument filter + CSV export
 *   Norms     — norm cache state per instrument × language
 *   SEO       — quick links, LLM visibility checks, implementation checklist
 *
 * Only reachable via AdminRoute (is_admin gate).
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getAdminStats,
  getAdminUsers,
  getAdminResults,
  downloadAdminCSV,
  getAdminNorms,
  refreshAdminNorms,
  patchAdminUser,
  getAdminActivity,
} from '../lib/api'

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const LIMIT = 25

const INSTRUMENT_LABELS = {
  newMoon:      'New Moon',
  firstQuarter: 'First Quarter',
  fullMoon:     'Full Moon',
}

function fmt(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

// ---------------------------------------------------------------------------
// Shared UI primitives
// ---------------------------------------------------------------------------

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--mm-font-heading)' }}>
        {value ?? '—'}
      </span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  )
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        active
          ? 'bg-[var(--mm-color-blue)] text-white'
          : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  )
}

function Badge({ children, variant = 'default' }) {
  const cls = {
    default: 'bg-gray-100 text-gray-500',
    green:   'bg-green-50 text-green-700',
    blue:    'bg-[var(--mm-color-blue)]/10 text-[var(--mm-color-blue)]',
    red:     'bg-red-50 text-red-600',
    yellow:  'bg-yellow-50 text-yellow-700',
  }[variant] ?? 'bg-gray-100 text-gray-500'
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${cls}`}>
      {children}
    </span>
  )
}

function ExportButton({ onClick, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-colors disabled:opacity-50"
    >
      {loading ? 'Exporting…' : '↓ CSV'}
    </button>
  )
}

function LoadingRow() {
  return (
    <tr>
      <td colSpan={99} className="py-6 text-center text-sm text-gray-400">Loading…</td>
    </tr>
  )
}

function EmptyRow({ message }) {
  return (
    <tr>
      <td colSpan={99} className="py-6 text-center text-sm text-gray-400">{message}</td>
    </tr>
  )
}

function Th({ children }) {
  return (
    <th className="py-2.5 px-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
      {children}
    </th>
  )
}

function Td({ children, className = '' }) {
  return (
    <td className={`py-2.5 px-3 text-sm text-gray-700 ${className}`}>
      {children}
    </td>
  )
}

// ---------------------------------------------------------------------------
// Infinite-scroll hook
// ---------------------------------------------------------------------------

function useInfiniteList(fetchFn, filters) {
  const [items,   setItems]   = useState([])
  const [total,   setTotal]   = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const loadingRef  = useRef(false)
  const offsetRef   = useRef(0)
  const sentinelRef = useRef(null)

  const filtersKey = JSON.stringify(filters)

  useEffect(() => {
    setItems([])
    setTotal(null)
    setHasMore(true)
    offsetRef.current  = 0
    loadingRef.current = false
  }, [filtersKey]) // eslint-disable-line

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return
    loadingRef.current = true
    setLoading(true)
    try {
      const data = await fetchFn({ ...filters, offset: offsetRef.current, limit: LIMIT })
      setItems(prev => offsetRef.current === 0 ? data.items : [...prev, ...data.items])
      setTotal(data.total)
      setHasMore(data.has_more)
      offsetRef.current += data.items.length
    } catch (err) {
      console.error('[AdminDashboard] loadMore error', err)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [fetchFn, filtersKey, hasMore]) // eslint-disable-line

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadMore()
    }, { rootMargin: '120px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [loadMore])

  useEffect(() => { loadMore() }, [filtersKey]) // eslint-disable-line

  return { items, total, hasMore, loading, sentinelRef }
}

// ---------------------------------------------------------------------------
// Sparkline — SVG polyline, no external deps
// ---------------------------------------------------------------------------

function Sparkline({ data, color = '#0047ba', days = 30 }) {
  if (!data || data.length === 0) {
    return <div className="h-12 flex items-center text-xs text-gray-300">No data</div>
  }

  // Fill in all days (missing days = 0)
  const filled = []
  const today  = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const found = data.find(r => r.day === key)
    filled.push(found ? found.count : 0)
  }

  const max = Math.max(...filled, 1)
  const W = 200
  const H = 40
  const pts = filled.map((v, i) => {
    const x = (i / (filled.length - 1)) * W
    const y = H - (v / max) * H
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-12" preserveAspectRatio="none">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Overview tab
// ---------------------------------------------------------------------------

function OverviewTab() {
  const [stats,    setStats]    = useState(null)
  const [activity, setActivity] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    Promise.all([getAdminStats(), getAdminActivity({ days: 30 })])
      .then(([s, a]) => { setStats(s); setActivity(a) })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="py-12 text-center text-sm text-gray-400">Loading…</p>
  if (error)   return <p className="py-12 text-center text-sm text-red-500">{error}</p>

  const r = stats.results

  return (
    <div className="space-y-8">
      {/* Users */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Users</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard label="Registered" value={stats.users.total} />
          <StatCard
            label="Premium"
            value={stats.users.premium}
            sub={`${stats.users.total ? Math.round(stats.users.premium / stats.users.total * 100) : 0}% of users`}
          />
          <StatCard label="Admins" value={stats.users.admins} />
        </div>
      </section>

      {/* Tests */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Tests</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard label="Total tests" value={r.total} />
          <StatCard
            label="Anonymous"
            value={r.anonymous}
            sub={`${r.total ? Math.round(r.anonymous / r.total * 100) : 0}% of results`}
          />
          <StatCard label="Authenticated" value={r.total - r.anonymous} />
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <StatCard label="New Moon"      value={r.by_instrument.newMoon} />
          <StatCard label="First Quarter" value={r.by_instrument.firstQuarter} />
          <StatCard label="Full Moon"     value={r.by_instrument.fullMoon} />
        </div>
      </section>

      {/* Activity sparklines */}
      {activity && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            Last 30 days
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                New registrations
              </p>
              <Sparkline data={activity.registrations} color="#0047ba" days={30} />
              <p className="text-xs text-gray-300 mt-1">
                {activity.registrations.reduce((s, r) => s + r.count, 0)} total
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                Tests completed
              </p>
              <Sparkline data={activity.results} color="#427c42" days={30} />
              <p className="text-xs text-gray-300 mt-1">
                {activity.results.reduce((s, r) => s + r.count, 0)} total
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Users tab
// ---------------------------------------------------------------------------

function UsersTab() {
  const [search,     setSearch]     = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [exporting,  setExporting]  = useState(false)
  const [patching,   setPatching]   = useState({}) // userId → bool

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const filters = { search: debouncedQ }
  const { items, setItems, total, loading, sentinelRef, ...rest } = useInfiniteList(getAdminUsers, filters)

  // useInfiniteList doesn't expose setItems — we need local override for optimistic update
  const [localOverrides, setLocalOverrides] = useState({}) // userId → { premium, is_admin }

  async function handleTogglePremium(user) {
    const userId = user.id
    setPatching(p => ({ ...p, [userId]: true }))
    try {
      const updated = await patchAdminUser(userId, { premium: !user.premium })
      setLocalOverrides(o => ({ ...o, [userId]: { ...o[userId], premium: updated.premium } }))
    } catch (err) {
      console.error('[AdminDashboard] patchAdminUser error', err)
    } finally {
      setPatching(p => ({ ...p, [userId]: false }))
    }
  }

  async function handleExport() {
    setExporting(true)
    try { await downloadAdminCSV('users') } finally { setExporting(false) }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by email or name…"
          className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[var(--mm-color-blue)] focus:ring-1 focus:ring-[var(--mm-color-blue)]/30"
        />
        <ExportButton onClick={handleExport} loading={exporting} />
        {total !== null && (
          <span className="text-xs text-gray-400 whitespace-nowrap">{total} users</span>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
        <table className="w-full bg-white">
          <thead className="border-b border-gray-100">
            <tr>
              <Th>Email</Th>
              <Th>Name</Th>
              <Th>Premium</Th>
              <Th>Admin</Th>
              <Th>Registered</Th>
              <Th>Tests</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map(u => {
              const override = localOverrides[u.id] ?? {}
              const premium  = override.premium  ?? u.premium
              const isAdmin  = override.is_admin ?? u.is_admin
              const busy     = patching[u.id]
              return (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <Td className="font-mono text-xs max-w-[180px] truncate">
                    {u.email || <span className="text-gray-300">—</span>}
                  </Td>
                  <Td>
                    {[u.first_name, u.last_name].filter(Boolean).join(' ') || (
                      <span className="text-gray-300">—</span>
                    )}
                  </Td>
                  <Td>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleTogglePremium({ ...u, premium })}
                      className="disabled:opacity-40 transition-opacity"
                      title={premium ? 'Click to revoke premium' : 'Click to grant premium'}
                    >
                      {premium
                        ? <Badge variant="green">Premium</Badge>
                        : <Badge>Free</Badge>}
                    </button>
                  </Td>
                  <Td>{isAdmin ? <Badge variant="blue">Admin</Badge> : null}</Td>
                  <Td className="whitespace-nowrap text-xs text-gray-400">{fmt(u.created_at)}</Td>
                  <Td className="text-center font-medium">{u.result_count}</Td>
                </tr>
              )
            })}
            {loading && <LoadingRow />}
            {!loading && items.length === 0 && <EmptyRow message="No users found." />}
          </tbody>
        </table>
      </div>
      <div ref={sentinelRef} className="h-1" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Results tab
// ---------------------------------------------------------------------------

function ResultsTab() {
  const [instrument, setInstrument] = useState('')
  const [exporting,  setExporting]  = useState(false)

  const filters = { instrument }
  const { items, total, loading, sentinelRef } = useInfiniteList(getAdminResults, filters)

  async function handleExport() {
    setExporting(true)
    try { await downloadAdminCSV('results', instrument ? { instrument } : {}) }
    finally { setExporting(false) }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={instrument}
          onChange={e => setInstrument(e.target.value)}
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[var(--mm-color-blue)] bg-white"
        >
          <option value="">All instruments</option>
          {Object.entries(INSTRUMENT_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <ExportButton onClick={handleExport} loading={exporting} />
        {total !== null && (
          <span className="text-xs text-gray-400 whitespace-nowrap">{total} results</span>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
        <table className="w-full bg-white">
          <thead className="border-b border-gray-100">
            <tr>
              <Th>Date</Th>
              <Th>Instrument</Th>
              <Th>Lang</Th>
              <Th>User</Th>
              <Th>Role</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map(r => (
              <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                <Td className="whitespace-nowrap text-xs text-gray-400">{fmt(r.created_at)}</Td>
                <Td>
                  <Badge variant={r.instrument === 'fullMoon' ? 'blue' : 'default'}>
                    {INSTRUMENT_LABELS[r.instrument] ?? r.instrument}
                  </Badge>
                </Td>
                <Td className="uppercase text-xs">{r.language || '—'}</Td>
                <Td className="font-mono text-xs max-w-[180px] truncate">
                  {r.user_email || <span className="text-gray-300">anonymous</span>}
                </Td>
                <Td>
                  {r.role
                    ? <span className="font-mono text-xs font-semibold text-[var(--mm-color-blue)]">{r.role}</span>
                    : <span className="text-gray-300">—</span>}
                </Td>
              </tr>
            ))}
            {loading && <LoadingRow />}
            {!loading && items.length === 0 && <EmptyRow message="No results found." />}
          </tbody>
        </table>
      </div>
      <div ref={sentinelRef} className="h-1" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Norms tab
// ---------------------------------------------------------------------------

const LANGS       = ['en', 'ca', 'es', 'fr', 'de', 'da']
const INSTRUMENTS = ['newMoon', 'firstQuarter', 'fullMoon']

function TierPill({ tier }) {
  if (!tier) return null
  if (tier === 'prior')
    return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 font-medium">prior</span>
  if (tier.startsWith('empirical') && tier.endsWith(':*'))
    return <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-[var(--mm-color-blue)] font-medium">instrument</span>
  if (tier.startsWith('empirical'))
    return <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">local</span>
  return <span className="text-xs text-gray-400">{tier}</span>
}

function NormsTab() {
  const [data,       setData]       = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error,      setError]      = useState(null)

  function load() {
    setLoading(true)
    setError(null)
    getAdminNorms()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleRefresh() {
    setRefreshing(true)
    try { await refreshAdminNorms(); load() }
    catch (err) { setError(err.message) }
    finally { setRefreshing(false) }
  }

  if (loading) return <p className="py-12 text-center text-sm text-gray-400">Loading…</p>
  if (error)   return <p className="py-12 text-center text-sm text-red-500">{error}</p>

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="space-y-1 text-sm text-gray-500">
          <p>Threshold: <strong className="text-gray-800">{data.norm_min_sample} results</strong> to activate empirical norms</p>
          <p>Refresh: every <strong className="text-gray-800">{data.norm_refresh_days} days</strong></p>
          {data.computed_at && (
            <p>Last computed: <strong className="text-gray-800">{fmt(data.computed_at)}</strong></p>
          )}
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-colors disabled:opacity-50"
        >
          {refreshing ? 'Refreshing…' : '↻ Refresh now'}
        </button>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
        <span className="flex items-center gap-1.5"><TierPill tier="empirical:x:en" /> instrument + language ≥ {data.norm_min_sample}</span>
        <span className="flex items-center gap-1.5"><TierPill tier="empirical:x:*" /> instrument only ≥ {data.norm_min_sample}</span>
        <span className="flex items-center gap-1.5"><TierPill tier="prior" /> researcher priors (fallback)</span>
      </div>

      {INSTRUMENTS.map(instr => {
        const instrTiers = data.tiers?.[instr] ?? {}
        return (
          <section key={instr}>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
              {INSTRUMENT_LABELS[instr] ?? instr}
              {instrTiers.__all__?.n != null && (
                <span className="ml-2 normal-case font-normal text-gray-300">
                  ({instrTiers.__all__.n} total results)
                </span>
              )}
            </h2>
            <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
              <table className="w-full bg-white">
                <thead className="border-b border-gray-100">
                  <tr><Th>Language</Th><Th>Active tier</Th><Th>Sample n</Th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {LANGS.map(lang => {
                    const entry = instrTiers[lang]
                    return (
                      <tr key={lang} className="hover:bg-gray-50/50">
                        <Td className="font-mono text-xs uppercase">{lang}</Td>
                        <Td><TierPill tier={entry?.tier} /></Td>
                        <Td className="text-xs text-gray-400">{entry?.n ?? '—'}</Td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// SEO tab
// ---------------------------------------------------------------------------

const SEO_LINKS = [
  { label: 'Google Search Console', url: 'https://search.google.com/search-console', emoji: '🔍' },
  { label: 'Bing Webmaster Tools',  url: 'https://www.bing.com/webmasters',          emoji: '🔎' },
  { label: 'PageSpeed Insights',    url: 'https://pagespeed.web.dev/?url=https%3A%2F%2Fcercol.team', emoji: '⚡' },
  { label: 'Rich Results Test',     url: 'https://search.google.com/test/rich-results?url=https%3A%2F%2Fcercol.team', emoji: '📋' },
  { label: 'Mobile-Friendly Test',  url: 'https://search.google.com/test/mobile-friendly?url=https%3A%2F%2Fcercol.team', emoji: '📱' },
  { label: 'Ahrefs Backlinks',      url: 'https://ahrefs.com/backlink-checker/?target=cercol.team', emoji: '🔗' },
]

const LLM_QUERIES = [
  'What are the best free personality tests for teams?',
  'Open source personality test for teams',
  'Belbin alternative free open source',
  'IPIP personality test implementation free',
  'Big Five team assessment tool',
]

const LLM_ENGINES = [
  { name: 'ChatGPT',   url: q => `https://chatgpt.com/?q=${encodeURIComponent(q)}` },
  { name: 'Claude',    url: q => `https://claude.ai/new?q=${encodeURIComponent(q)}` },
  { name: 'Gemini',    url: q => `https://gemini.google.com/app?q=${encodeURIComponent(q)}` },
  { name: 'Perplexity',url: q => `https://www.perplexity.ai/?q=${encodeURIComponent(q)}` },
]

const SEO_CHECKLIST = [
  { done: true,  item: 'Meta tags (title + description) per public route' },
  { done: true,  item: 'Open Graph tags (og:title, og:description, og:image)' },
  { done: true,  item: 'hreflang for all 6 languages on all public pages' },
  { done: true,  item: 'JSON-LD: WebApplication + Organization + FAQPage (9 Q&As)' },
  { done: true,  item: 'sitemap.xml — 8 routes × 6 languages with hreflang alternates' },
  { done: true,  item: 'robots.txt — allows all, blocks /admin' },
  { done: true,  item: 'llms.txt — LLM-friendly content index (Jeremy Howard protocol)' },
  { done: true,  item: 'GitHub README rewritten with academic names + DOI references' },
  { done: true,  item: 'GitHub repo topics: 10 SEO topics (big-five, ipip, ab5c…)' },
  { done: true,  item: 'React.lazy() code splitting — bundle 1.37 MB → per-page 1–33 kB' },
  { done: true,  item: 'Prerendering: 7 public routes → static HTML (puppeteer-core)' },
  { done: true,  item: 'Google Search Console verified + sitemap submitted' },
  { done: true,  item: 'Bing Webmaster Tools verified + sitemap submitted' },
  { done: true,  item: 'FAQ expanded: 12 questions across 6 languages' },
  { done: false, item: '/science page enrichment — DOI links, expand references' },
  { done: false, item: 'Blog: "Big Five vs DISC vs Belbin: a scientist\'s comparison"' },
  { done: false, item: 'Blog: "How to build a balanced team using personality science"' },
  { done: false, item: 'Blog: "Blind spots in teams: when self-perception diverges"' },
  { done: false, item: 'Blog: "What is the IPIP and why does it matter?"' },
  { done: false, item: 'og:image 1200×630 branded image per route' },
  { done: false, item: 'Outreach: ipip.ori.org (Eugene Johnson) — list Cèrcol as implementation' },
  { done: false, item: 'Outreach: Anders Vedel (Vedel et al. 2018 DA validation)' },
  { done: false, item: 'Outreach: Thiry & Piolti (FR adaptation)' },
  { done: false, item: 'Product Hunt launch' },
  { done: false, item: 'Hacker News "Show HN"' },
]

function SeoTab() {
  const [copiedQuery, setCopiedQuery] = useState(null)

  function copyQuery(q) {
    navigator.clipboard.writeText(q).then(() => {
      setCopiedQuery(q)
      setTimeout(() => setCopiedQuery(null), 2000)
    })
  }

  const done    = SEO_CHECKLIST.filter(i => i.done).length
  const total   = SEO_CHECKLIST.length
  const pct     = Math.round(done / total * 100)

  return (
    <div className="space-y-8">

      {/* Quick links */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Quick access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SEO_LINKS.map(({ label, url, emoji }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2.5 bg-white rounded-xl border border-gray-100 shadow-sm text-sm text-gray-700 hover:border-[var(--mm-color-blue)]/30 hover:text-[var(--mm-color-blue)] transition-colors"
            >
              <span>{emoji}</span>
              <span className="truncate">{label}</span>
              <span className="ml-auto text-gray-300 text-xs shrink-0">↗</span>
            </a>
          ))}
        </div>
      </section>

      {/* LLM visibility checker */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
          LLM visibility check
        </h2>
        <p className="text-xs text-gray-400 mb-3">
          Test monthly. Cèrcol should appear in answers within 6–12 months.
        </p>
        <div className="space-y-2">
          {LLM_QUERIES.map(q => (
            <div key={q} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
              <p className="text-sm text-gray-700 mb-2 font-medium">"{q}"</p>
              <div className="flex items-center gap-2 flex-wrap">
                {LLM_ENGINES.map(({ name, url }) => (
                  <a
                    key={name}
                    href={url(q)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-500 hover:border-[var(--mm-color-blue)]/40 hover:text-[var(--mm-color-blue)] transition-colors"
                  >
                    {name} ↗
                  </a>
                ))}
                <button
                  type="button"
                  onClick={() => copyQuery(q)}
                  className="text-xs px-2.5 py-1 rounded-lg border border-dashed border-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {copiedQuery === q ? '✓ copied' : 'copy'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Implementation checklist */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Implementation checklist
          </h2>
          <span className="text-xs text-gray-400">{done}/{total} done ({pct}%)</span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-[var(--mm-color-blue)] rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="space-y-1.5">
          {SEO_CHECKLIST.map(({ done: isDone, item }) => (
            <div
              key={item}
              className={`flex items-start gap-2.5 px-3 py-2 rounded-lg text-sm ${
                isDone ? 'text-gray-500' : 'text-gray-700 bg-white border border-gray-100 shadow-sm'
              }`}
            >
              <span className={`mt-0.5 shrink-0 text-base ${isDone ? 'text-green-500' : 'text-gray-300'}`}>
                {isDone ? '✓' : '○'}
              </span>
              <span className={isDone ? 'line-through decoration-gray-300' : ''}>{item}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'users',    label: 'Users'    },
  { id: 'results',  label: 'Results'  },
  { id: 'norms',    label: 'Norms'    },
  { id: 'seo',      label: 'SEO'      },
]

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="py-8 space-y-6">
      <div>
        <h1
          className="text-2xl font-bold text-gray-900"
          style={{ fontFamily: 'var(--mm-font-heading)' }}
        >
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-400">Staff-only. Handle with care.</p>
      </div>

      <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1 w-fit flex-wrap">
        {TABS.map(tab => (
          <TabButton
            key={tab.id}
            label={tab.label}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>

      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'users'    && <UsersTab />}
      {activeTab === 'results'  && <ResultsTab />}
      {activeTab === 'norms'    && <NormsTab />}
      {activeTab === 'seo'      && <SeoTab />}
    </div>
  )
}
