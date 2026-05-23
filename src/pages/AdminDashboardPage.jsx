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
  getBlogPosts,
  createBlogPost,
  updateBlogPost,
  patchBlogPostStatus,
  getSeoSources,
  getSeoHealth,
  getSeoQueries,
  getSeoAnomalies,
} from '../lib/api'
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'

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

// ---------------------------------------------------------------------------
// SEO tab utilities
// ---------------------------------------------------------------------------

function formatNum(n) {
  if (n === null || n === undefined) return '-'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

function formatPct(n, digits = 2) {
  if (n === null || n === undefined) return '-'
  return (n * 100).toFixed(digits) + '%'
}

function SeoStatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
      <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function DataPendingBanner({ message }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
      <p className="font-semibold mb-0.5">Data pending</p>
      <p className="text-xs text-amber-700">{message}</p>
    </div>
  )
}

function SourcesGrid({ sources, gsc }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {sources.map(s => (
        <div key={s.name} className="bg-white rounded-xl border border-gray-100 shadow-sm px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">{s.name}</p>
          <p className="text-sm font-bold text-gray-900">{formatNum(s.row_count)} rows</p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {s.last_update ? `last ${s.last_update}` : 'no data yet'}
          </p>
        </div>
      ))}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-3 py-2">
        <p className="text-xs text-gray-400 mb-0.5">gsc bulk export</p>
        <p className="text-sm font-bold text-gray-900">
          {gsc?.bulk_export_ready ? `${gsc.tables_present.length} tables` : 'pending'}
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">
          {gsc?.bulk_export_ready ? 'ready' : '~48h after GSC config'}
        </p>
      </div>
    </div>
  )
}

function HealthSection({ health }) {
  if (!health) return null
  const bing = health.bing_28d || {}
  const gsc = health.gsc_28d || { available: false }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <SeoStatCard
        label="GSC 28d impressions"
        value={gsc.available ? formatNum(gsc.impressions) : '-'}
        sub={gsc.available ? `${formatNum(gsc.clicks)} clicks` : 'export pending'}
      />
      <SeoStatCard
        label="Bing 28d impressions"
        value={formatNum(bing.impressions)}
        sub={`${formatNum(bing.clicks)} clicks`}
      />
      <SeoStatCard
        label="PSI URLs (latest)"
        value={formatNum((health.pagespeed_latest_mobile || []).length)}
        sub="mobile snapshots"
      />
      <SeoStatCard
        label="Bot hits 7d"
        value={formatNum((health.crawl_7d_by_bot || []).reduce((a, b) => a + b.hits, 0))}
        sub={`${(health.crawl_7d_by_bot || []).length} distinct bots`}
      />
    </div>
  )
}

function CrawlByBotChart({ data }) {
  if (!data || !data.length) return null
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
        Crawler hits last 7 days
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="bot" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="hits" fill="var(--mm-color-blue)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function QuickWinsTable({ queries }) {
  if (!queries || !queries.length) return null
  // Quick wins: avg_position between 8 and 20, sorted by impressions.
  const wins = queries
    .filter(q => q.avg_position != null && q.avg_position >= 8 && q.avg_position <= 20)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 15)
  if (!wins.length) return (
    <p className="text-xs text-gray-400">
      No queries currently sit in the 8 to 20 SERP position range.
    </p>
  )
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-100">
          <tr>
            <th className="text-left px-3 py-2">Query</th>
            <th className="text-right px-3 py-2">Impr.</th>
            <th className="text-right px-3 py-2">Clicks</th>
            <th className="text-right px-3 py-2">CTR</th>
            <th className="text-right px-3 py-2">Pos.</th>
          </tr>
        </thead>
        <tbody>
          {wins.map(q => (
            <tr key={q.query} className="border-b border-gray-50 last:border-0">
              <td className="px-3 py-2 text-gray-700 truncate max-w-[260px]">{q.query}</td>
              <td className="px-3 py-2 text-right text-gray-600">{formatNum(q.impressions)}</td>
              <td className="px-3 py-2 text-right text-gray-600">{formatNum(q.clicks)}</td>
              <td className="px-3 py-2 text-right text-gray-600">{formatPct(q.ctr)}</td>
              <td className="px-3 py-2 text-right text-gray-600">{q.avg_position?.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AnomaliesList({ anomalies }) {
  if (!anomalies || !anomalies.length) return (
    <p className="text-xs text-gray-400">No pages crossed the 30 percent threshold this week.</p>
  )
  return (
    <div className="space-y-1.5">
      {anomalies.slice(0, 15).map(a => {
        const up = a.change_pct > 0
        return (
          <div
            key={a.url}
            className="bg-white rounded-xl border border-gray-100 shadow-sm px-3 py-2 flex items-center gap-3"
          >
            <span className={`text-xs font-bold w-14 text-right ${up ? 'text-emerald-600' : 'text-red-500'}`}>
              {up ? '+' : ''}{a.change_pct.toFixed(0)}%
            </span>
            <span className="text-sm text-gray-700 truncate flex-1">{a.url}</span>
            <span className="text-xs text-gray-400 shrink-0">
              {formatNum(a.prior_impressions)} -&gt; {formatNum(a.recent_impressions)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function SeoTab() {
  const [sources, setSources] = useState(null)
  const [health, setHealth] = useState(null)
  const [queries, setQueries] = useState(null)
  const [anomalies, setAnomalies] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copiedQuery, setCopiedQuery] = useState(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    Promise.all([
      getSeoSources().catch(e => ({ _err: e })),
      getSeoHealth().catch(e => ({ _err: e })),
      getSeoQueries({ periodDays: 28, minImpressions: 10, limit: 100 }).catch(e => ({ _err: e })),
      getSeoAnomalies({ thresholdPct: 30 }).catch(e => ({ _err: e })),
    ]).then(([s, h, q, a]) => {
      if (!alive) return
      if (s?._err || h?._err || q?._err || a?._err) {
        setError(s?._err || h?._err || q?._err || a?._err)
      }
      setSources(s?._err ? null : s)
      setHealth(h?._err ? null : h)
      setQueries(q?._err ? null : q)
      setAnomalies(a?._err ? null : a)
      setLoading(false)
    })
    return () => { alive = false }
  }, [])

  function copyQuery(q) {
    navigator.clipboard.writeText(q).then(() => {
      setCopiedQuery(q)
      setTimeout(() => setCopiedQuery(null), 2000)
    })
  }

  if (loading) return <p className="text-sm text-gray-400">Loading SEO data ...</p>
  if (error) return <p className="text-sm text-red-500">SEO data unavailable: {String(error.message || error)}</p>

  const dataPending = (health && health.data_pending) || (queries && queries.data_pending)

  return (
    <div className="space-y-8">

      {dataPending && (
        <DataPendingBanner message="The GSC bulk export needs about 48 hours to populate after configuration. Until then, dashboards fall back to Bing data, which has limited coverage for low-traffic sites." />
      )}

      {/* Sources status */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Source status</h2>
        {sources ? <SourcesGrid sources={sources.sources} gsc={sources.gsc} /> : null}
      </section>

      {/* Health KPIs */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">28-day overview</h2>
        <HealthSection health={health} />
      </section>

      {/* Crawler hits */}
      {health?.crawl_7d_by_bot?.length > 0 && (
        <section>
          <CrawlByBotChart data={health.crawl_7d_by_bot} />
        </section>
      )}

      {/* Quick wins */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Quick wins (queries position 8 to 20)
        </h2>
        <p className="text-xs text-gray-400 mb-3">
          Source: {queries?.source || 'pending'}. These already get impressions; improving rank pays off fast.
        </p>
        <QuickWinsTable queries={queries?.queries || []} />
      </section>

      {/* Anomalies */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Anomalies (7d vs prior 7d)
        </h2>
        <AnomaliesList anomalies={anomalies?.anomalies || []} />
      </section>

      {/* External tools (auxiliary footer) */}
      <section className="pt-6 border-t border-gray-100">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">External tools</h2>
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

      {/* LLM visibility checker (auxiliary) */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
          LLM visibility check
        </h2>
        <p className="text-xs text-gray-400 mb-3">
          Run the search manually in each engine. Cèrcol should appear within 6 to 12 months.
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

    </div>
  )
}

// ---------------------------------------------------------------------------
// Blog tab
// ---------------------------------------------------------------------------

const BLOG_LANGS = ['en', 'ca', 'es', 'fr', 'de', 'da']

const EMPTY_FORM = {
  slug:     '',
  author:   '',
  cover_url: '',
  title:       { en: '', ca: '', es: '', fr: '', de: '', da: '' },
  description: { en: '', ca: '', es: '', fr: '', de: '', da: '' },
  content:     { en: '', ca: '', es: '', fr: '', de: '', da: '' },
}

function BlogTab() {
  const [posts,     setPosts]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [form,      setForm]      = useState(null) // null = hidden, object = editing
  const [isNew,     setIsNew]     = useState(false)
  const [formLang,  setFormLang]  = useState('en')
  const [saving,    setSaving]    = useState(false)
  const [toggling,  setToggling]  = useState({}) // slug → bool

  const loadPosts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getBlogPosts()
      setPosts(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadPosts() }, [loadPosts])

  function openCreate() {
    setForm({ ...EMPTY_FORM, title: { ...EMPTY_FORM.title }, description: { ...EMPTY_FORM.description }, content: { ...EMPTY_FORM.content } })
    setIsNew(true)
    setFormLang('en')
  }

  function openEdit(post) {
    setForm({
      slug:        post.slug,
      author:      post.author || '',
      cover_url:   post.cover_url || '',
      title:       typeof post.title === 'object' ? { ...EMPTY_FORM.title, ...post.title } : { ...EMPTY_FORM.title, en: post.title || '' },
      description: typeof post.description === 'object' ? { ...EMPTY_FORM.description, ...post.description } : { ...EMPTY_FORM.description, en: post.description || '' },
      content:     typeof post.content === 'object' ? { ...EMPTY_FORM.content, ...post.content } : { ...EMPTY_FORM.content, en: post.content || '' },
    })
    setIsNew(false)
    setFormLang('en')
  }

  function closeForm() {
    setForm(null)
  }

  function setField(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function setLangField(key, lang, value) {
    setForm(f => ({ ...f, [key]: { ...f[key], [lang]: value } }))
  }

  async function handleSave(publishStatus) {
    if (!form) return
    setSaving(true)
    try {
      const payload = {
        author:      form.author,
        cover_url:   form.cover_url || undefined,
        title:       form.title,
        description: form.description,
        content:     form.content,
      }
      if (isNew) {
        const created = await createBlogPost({ ...payload, slug: form.slug })
        if (publishStatus === 'published') {
          await patchBlogPostStatus(created.slug || form.slug, 'published')
        }
      } else {
        await updateBlogPost(form.slug, payload)
        if (publishStatus) {
          await patchBlogPostStatus(form.slug, publishStatus)
        }
      }
      await loadPosts()
      closeForm()
    } catch (err) {
      alert(`Save failed: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleStatus(post) {
    const next = post.status === 'published' ? 'draft' : 'published'
    setToggling(t => ({ ...t, [post.slug]: true }))
    try {
      await patchBlogPostStatus(post.slug, next)
      await loadPosts()
    } catch (err) {
      alert(`Status change failed: ${err.message}`)
    } finally {
      setToggling(t => ({ ...t, [post.slug]: false }))
    }
  }

  function copyUrl(slug) {
    navigator.clipboard.writeText(`https://cercol.team/blog/${slug}`)
  }

  return (
    <div className="space-y-6">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Blog posts</h2>
        <button
          type="button"
          onClick={openCreate}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--mm-color-blue)] text-white hover:opacity-90 transition-opacity"
        >
          + New post
        </button>
      </div>

      {/* Post list */}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
        <table className="w-full bg-white">
          <thead className="border-b border-gray-100">
            <tr>
              <Th>Title (EN)</Th>
              <Th>Status</Th>
              <Th>Views</Th>
              <Th>Published</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && <LoadingRow />}
            {!loading && posts.length === 0 && <EmptyRow message="No blog posts yet." />}
            {posts.map(post => {
              const titleEn = typeof post.title === 'object' ? (post.title.en || '') : (post.title || '')
              const busy = toggling[post.slug]
              return (
                <tr key={post.slug} className="hover:bg-gray-50/50 transition-colors">
                  <Td className="max-w-[220px]">
                    <span className="font-medium text-gray-800 line-clamp-1">{titleEn || post.slug}</span>
                    <span className="block text-xs text-gray-400 font-mono">{post.slug}</span>
                  </Td>
                  <Td>
                    <Badge variant={post.status === 'published' ? 'green' : 'yellow'}>
                      {post.status ?? 'draft'}
                    </Badge>
                  </Td>
                  <Td>
                    <span className="text-xs text-gray-500">👁 {post.view_count ?? 0}</span>
                  </Td>
                  <Td className="whitespace-nowrap text-xs text-gray-400">
                    {post.published_at ? fmt(post.published_at) : '—'}
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-500 hover:text-gray-800 transition-colors"
                      >
                        Open ↗
                      </a>
                      <button
                        type="button"
                        onClick={() => copyUrl(post.slug)}
                        className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-500 hover:text-gray-800 transition-colors"
                      >
                        Copy URL
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleToggleStatus(post)}
                        className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-40"
                      >
                        {busy ? '…' : post.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(post)}
                        className="text-xs px-2 py-1 rounded border border-[var(--mm-color-blue)]/30 text-[var(--mm-color-blue)] hover:border-[var(--mm-color-blue)] transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Create / Edit form */}
      {form && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">
              {isNew ? 'New post' : `Edit: ${form.slug}`}
            </h3>
            <button
              type="button"
              onClick={closeForm}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Slug (create only) + Author + Cover URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isNew && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setField('slug', e.target.value)}
                  placeholder="my-article-slug"
                  className="w-full text-sm px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[var(--mm-color-blue)] focus:ring-1 focus:ring-[var(--mm-color-blue)]/30 font-mono"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Author</label>
              <input
                type="text"
                value={form.author}
                onChange={e => setField('author', e.target.value)}
                placeholder="First Last"
                className="w-full text-sm px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[var(--mm-color-blue)] focus:ring-1 focus:ring-[var(--mm-color-blue)]/30"
              />
            </div>
            <div className={isNew ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-medium text-gray-500 mb-1">Cover URL (optional)</label>
              <input
                type="url"
                value={form.cover_url}
                onChange={e => setField('cover_url', e.target.value)}
                placeholder="https://…"
                className="w-full text-sm px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[var(--mm-color-blue)] focus:ring-1 focus:ring-[var(--mm-color-blue)]/30"
              />
            </div>
          </div>

          {/* Language tabs */}
          <div>
            <div className="flex items-center gap-1 mb-4 bg-gray-50 rounded-lg p-1 w-fit">
              {BLOG_LANGS.map(l => (
                <TabButton
                  key={l}
                  label={l.toUpperCase()}
                  active={formLang === l}
                  onClick={() => setFormLang(l)}
                />
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Title ({formLang.toUpperCase()})
                </label>
                <textarea
                  rows={2}
                  value={form.title[formLang] || ''}
                  onChange={e => setLangField('title', formLang, e.target.value)}
                  placeholder={`Title in ${formLang.toUpperCase()}…`}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[var(--mm-color-blue)] focus:ring-1 focus:ring-[var(--mm-color-blue)]/30 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Description / Meta ({formLang.toUpperCase()})
                </label>
                <textarea
                  rows={2}
                  value={form.description[formLang] || ''}
                  onChange={e => setLangField('description', formLang, e.target.value)}
                  placeholder="Short meta description…"
                  className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[var(--mm-color-blue)] focus:ring-1 focus:ring-[var(--mm-color-blue)]/30 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Content ({formLang.toUpperCase()}) — Markdown
                </label>
                <textarea
                  rows={14}
                  value={form.content[formLang] || ''}
                  onChange={e => setLangField('content', formLang, e.target.value)}
                  placeholder="Write article content in Markdown…"
                  className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[var(--mm-color-blue)] focus:ring-1 focus:ring-[var(--mm-color-blue)]/30 font-mono resize-y"
                />
              </div>
            </div>
          </div>

          {/* Save buttons */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('draft')}
              className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-colors disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Save as draft'}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('published')}
              className="text-sm font-medium px-4 py-2 rounded-lg bg-[var(--mm-color-blue)] text-white hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Publish'}
            </button>
          </div>
        </div>
      )}

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
  { id: 'blog',     label: 'Blog'     },
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
      {activeTab === 'blog'     && <BlogTab />}
      {activeTab === 'seo'      && <SeoTab />}
    </div>
  )
}
