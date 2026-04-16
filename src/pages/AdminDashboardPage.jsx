/**
 * AdminDashboardPage — staff-only dashboard.
 *
 * Three tabs:
 *   Overview — KPI stat cards (users, results by instrument)
 *   Users    — paginated table with search + CSV export
 *   Results  — paginated table with instrument filter + CSV export
 *
 * Pagination uses IntersectionObserver-based infinite scroll.
 * Only reachable via AdminRoute (is_admin gate); invisible to all other users.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getAdminStats,
  getAdminUsers,
  getAdminResults,
  downloadAdminCSV,
  getAdminNorms,
  refreshAdminNorms,
} from '../lib/api'

// ---------------------------------------------------------------------------
// Helpers
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
// Sub-components
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
  }[variant]
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
      {loading ? 'Exporting…' : '↓ Export CSV'}
    </button>
  )
}

function LoadingRow() {
  return (
    <tr>
      <td colSpan={99} className="py-6 text-center text-sm text-gray-400">
        Loading…
      </td>
    </tr>
  )
}

function EmptyRow({ message }) {
  return (
    <tr>
      <td colSpan={99} className="py-6 text-center text-sm text-gray-400">
        {message}
      </td>
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
  const loadingRef = useRef(false)
  const offsetRef  = useRef(0)
  const sentinelRef = useRef(null)

  // Reset + initial load whenever filters change
  const filtersKey = JSON.stringify(filters)
  useEffect(() => {
    setItems([])
    setTotal(null)
    setHasMore(true)
    offsetRef.current = 0
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

  // IntersectionObserver watches the sentinel div
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadMore()
    }, { rootMargin: '120px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [loadMore])

  // Trigger first load when filters change (offsetRef reset means sentinel may not fire)
  useEffect(() => {
    loadMore()
  }, [filtersKey]) // eslint-disable-line

  return { items, total, hasMore, loading, sentinelRef }
}

// ---------------------------------------------------------------------------
// Overview tab
// ---------------------------------------------------------------------------

function OverviewTab() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="py-12 text-center text-sm text-gray-400">Loading stats…</p>
  if (error)   return <p className="py-12 text-center text-sm text-red-500">{error}</p>

  const r = stats.results

  return (
    <div className="space-y-6">
      {/* Users */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Users</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard label="Registered" value={stats.users.total} />
          <StatCard label="Premium" value={stats.users.premium} sub={`${stats.users.total ? Math.round(stats.users.premium / stats.users.total * 100) : 0}% of users`} />
          <StatCard label="Admins" value={stats.users.admins} />
        </div>
      </section>

      {/* Results */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Tests</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard label="Total tests" value={r.total} />
          <StatCard label="Anonymous" value={r.anonymous} sub={`${r.total ? Math.round(r.anonymous / r.total * 100) : 0}% of results`} />
          <StatCard label="Authenticated" value={r.total - r.anonymous} />
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <StatCard label="New Moon" value={r.by_instrument.newMoon} />
          <StatCard label="First Quarter" value={r.by_instrument.firstQuarter} />
          <StatCard label="Full Moon" value={r.by_instrument.fullMoon} />
        </div>
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Users tab
// ---------------------------------------------------------------------------

function UsersTab() {
  const [search,      setSearch]      = useState('')
  const [debouncedQ,  setDebouncedQ]  = useState('')
  const [exporting,   setExporting]   = useState(false)

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const filters = { search: debouncedQ }
  const { items, total, loading, sentinelRef } = useInfiniteList(getAdminUsers, filters)

  async function handleExport() {
    setExporting(true)
    try { await downloadAdminCSV('users') } finally { setExporting(false) }
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
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

      {/* Table */}
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
            {items.map(u => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                <Td className="font-mono text-xs max-w-[200px] truncate">{u.email || <span className="text-gray-300">—</span>}</Td>
                <Td>{[u.first_name, u.last_name].filter(Boolean).join(' ') || <span className="text-gray-300">—</span>}</Td>
                <Td>{u.premium ? <Badge variant="green">Premium</Badge> : <Badge>Free</Badge>}</Td>
                <Td>{u.is_admin ? <Badge variant="blue">Admin</Badge> : null}</Td>
                <Td className="whitespace-nowrap text-xs text-gray-400">{fmt(u.created_at)}</Td>
                <Td className="text-center font-medium">{u.result_count}</Td>
              </tr>
            ))}
            {loading && <LoadingRow />}
            {!loading && items.length === 0 && <EmptyRow message="No users found." />}
          </tbody>
        </table>
      </div>

      {/* Infinite scroll sentinel */}
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
      {/* Toolbar */}
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

      {/* Table */}
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

      {/* Infinite scroll sentinel */}
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
      {/* Header info */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="space-y-1 text-sm text-gray-500">
          <p>Threshold: <strong className="text-gray-800">{data.norm_min_sample} results</strong> to activate empirical norms</p>
          <p>Refresh: every <strong className="text-gray-800">{data.norm_refresh_days} days</strong> (background task)</p>
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

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><TierPill tier="empirical:x:en" /> instrument + language ≥ {data.norm_min_sample}</span>
        <span className="flex items-center gap-1.5"><TierPill tier="empirical:x:*" /> instrument only ≥ {data.norm_min_sample}</span>
        <span className="flex items-center gap-1.5"><TierPill tier="prior" /> researcher priors (fallback)</span>
      </div>

      {/* One table per instrument */}
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
                  <tr>
                    <Th>Language</Th>
                    <Th>Active tier</Th>
                    <Th>Sample n</Th>
                  </tr>
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
// Page
// ---------------------------------------------------------------------------

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'users',    label: 'Users'    },
  { id: 'results',  label: 'Results'  },
  { id: 'norms',    label: 'Norms'    },
]

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="py-8 space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold text-gray-900"
          style={{ fontFamily: 'var(--mm-font-heading)' }}
        >
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-400">Staff-only view. Handle with care.</p>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1 w-fit">
        {TABS.map(tab => (
          <TabButton
            key={tab.id}
            label={tab.label}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'users'    && <UsersTab />}
      {activeTab === 'results'  && <ResultsTab />}
      {activeTab === 'norms'    && <NormsTab />}
    </div>
  )
}
