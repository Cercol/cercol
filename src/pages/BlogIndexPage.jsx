/**
 * BlogIndexPage — public blog index at /blog.
 * Fetches posts from the backend API and displays them as cards with cover images.
 * Language-aware: shows current locale title/description with English as fallback.
 *
 * Filters: category pills (7 topics) + complexity pills (3 levels).
 * Each card shows a complexity dot indicator (green/blue/red) + category badge.
 */
import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SectionLabel } from '../components/ui'
import { getBlogPosts } from '../lib/api'

function formatDate(iso, lang) {
  if (!iso) return ''
  const d = new Date(iso)
  const locale = lang === 'ca' ? 'ca-ES'
    : lang === 'es' ? 'es-ES'
    : lang === 'fr' ? 'fr-FR'
    : lang === 'de' ? 'de-DE'
    : lang === 'da' ? 'da-DK'
    : 'en-GB'
  return d.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
}

/** Estimate reading time from description text as a rough approximation. */
function estimateReadMins(text) {
  if (!text) return null
  const words = text.trim().split(/\s+/).length
  // Description ≈ 10% of full article — scale up.
  return Math.max(3, Math.ceil((words * 10) / 200))
}

/** Dot indicator: 1 dot = beginner, 2 = intermediate, 3 = expert. */
function ComplexityDots({ complexity }) {
  const levels = { beginner: 1, intermediate: 2, expert: 3 }
  const filled = levels[complexity] ?? 2
  const color = complexity === 'beginner'
    ? 'var(--mm-color-green)'
    : complexity === 'expert'
      ? 'var(--mm-color-red)'
      : 'var(--mm-color-blue)'

  return (
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3].map(i => (
        <span
          key={i}
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: i <= filled ? color : '#e5e7eb' }}
        />
      ))}
    </span>
  )
}

const CATEGORIES  = ['all', 'dimensions', 'science', 'teams', 'leadership', 'work', 'guides']
const COMPLEXITIES = ['all', 'beginner', 'intermediate', 'expert']

export default function BlogIndexPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language?.slice(0, 2) || 'en'
  const { pathname } = useLocation()
  const BLOG_LANG_PREFIXES = ['ca', 'es', 'fr', 'de', 'da']
  const urlLang = BLOG_LANG_PREFIXES.find(l => pathname.startsWith(`/${l}/`)) || 'en'

  useEffect(() => {
    if (urlLang !== i18n.language.slice(0, 2)) i18n.changeLanguage(urlLang)
  }, [urlLang])

  const [posts,           setPosts]           = useState([])
  const [loading,         setLoading]         = useState(true)
  const [error,           setError]           = useState(null)
  const [activeCategory,  setActiveCategory]  = useState('all')
  const [activeLevel,     setActiveLevel]     = useState('all')

  useEffect(() => {
    const prev = document.title
    document.title = 'Blog — Personality science and team assessment · Cèrcol'
    const metaDesc = document.querySelector('meta[name="description"]')
    const prevDesc = metaDesc?.getAttribute('content') ?? ''
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Research-grounded articles on personality science, the Big Five (OCEAN), IPIP, team composition, and peer assessment — by the team behind Cèrcol.'
      )
    }
    return () => {
      document.title = prev
      if (metaDesc) metaDesc.setAttribute('content', prevDesc)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    getBlogPosts()
      .then(data => setPosts(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  /** Resolve localised field (title or description), falling back to English. */
  function localise(field) {
    if (!field) return ''
    if (typeof field === 'string') return field
    return field[urlLang] || field.en || ''
  }

  const visiblePosts = posts.filter(p => {
    const catOk   = activeCategory === 'all' || p.category   === activeCategory
    const levelOk = activeLevel    === 'all' || p.complexity  === activeLevel
    return catOk && levelOk
  })

  const hasFilters = posts.length > 0 && !loading && !error

  return (
    <main className="py-12">

      {/* Page header */}
      <SectionLabel color="blue" className="mb-3">
        {t('blog.label')}
      </SectionLabel>
      <h1
        className="text-3xl font-bold text-gray-900 mb-3"
        style={{ fontFamily: 'var(--mm-font-display)' }}
      >
        {t('blog.heading')}
      </h1>
      <p className="text-sm text-gray-600 leading-relaxed mb-6 max-w-xl">
        {t('blog.subtitle')}
      </p>

      {/* Filters */}
      {hasFilters && (
        <div className="flex flex-col gap-2 mb-8">

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  activeCategory === cat
                    ? 'bg-[var(--mm-color-blue)] text-white border-[var(--mm-color-blue)]'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-[var(--mm-color-blue)] hover:text-[var(--mm-color-blue)]'
                }`}
              >
                {t(`blog.cat.${cat}`)}
              </button>
            ))}
          </div>

          {/* Complexity / level pills */}
          <div className="flex flex-wrap gap-2">
            {COMPLEXITIES.map(level => {
              const color = level === 'beginner' ? 'var(--mm-color-green)'
                : level === 'expert' ? 'var(--mm-color-red)'
                : level === 'intermediate' ? 'var(--mm-color-blue)'
                : null
              const isActive = activeLevel === level
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setActiveLevel(level)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                    isActive
                      ? 'text-white border-transparent'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                  }`}
                  style={isActive && color ? { background: color, borderColor: color } : {}}
                >
                  {level !== 'all' && <ComplexityDots complexity={level} />}
                  {t(`blog.level.${level}`)}
                </button>
              )
            })}
          </div>

        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="rounded-2xl border border-gray-100 shadow-sm bg-white overflow-hidden animate-pulse"
            >
              <div className="h-40 bg-gray-100" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <p className="text-sm text-red-500 py-8 text-center">
          {t('blog.error')}
        </p>
      )}

      {/* Empty state */}
      {!loading && !error && posts.length === 0 && (
        <div className="py-16 text-center rounded-2xl border border-dashed border-gray-200">
          <p className="text-sm text-gray-400">{t('blog.empty')}</p>
          <p className="text-xs text-gray-300 mt-1">{t('blog.emptySubtext')}</p>
        </div>
      )}

      {/* No results for active filters */}
      {!loading && !error && posts.length > 0 && visiblePosts.length === 0 && (
        <div className="py-16 text-center rounded-2xl border border-dashed border-gray-200">
          <p className="text-sm text-gray-400">No articles match the selected filters.</p>
        </div>
      )}

      {/* Post grid */}
      {!loading && !error && visiblePosts.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visiblePosts.map(post => {
            const desc = localise(post.description)
            const href = urlLang === 'en' ? `/blog/${post.slug}` : `/${urlLang}/blog/${post.slug}`
            return (
              <Link
                key={post.slug}
                to={href}
                className="block group rounded-2xl border border-gray-100 shadow-sm bg-white overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Cover image or gradient placeholder */}
                <div className="relative h-40 overflow-hidden">
                  {post.coverUrl ? (
                    <img
                      src={post.coverUrl}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{
                        background:
                          'linear-gradient(135deg, var(--mm-color-blue) 0%, #00297a 100%)',
                      }}
                    />
                  )}
                </div>

                {/* Card body */}
                <div className="px-5 py-4 flex flex-col flex-1">
                  <h2
                    className="text-sm font-bold text-gray-900 mb-2 leading-snug group-hover:text-[var(--mm-color-blue)] transition-colors"
                    style={{ fontFamily: 'var(--mm-font-display)' }}
                  >
                    {localise(post.title)}
                  </h2>
                  {desc && (
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 mb-3">
                      {desc}
                    </p>
                  )}

                  {/* Meta footer */}
                  <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400">
                    {/* Complexity dots + label */}
                    {post.complexity && post.complexity !== 'intermediate' && (
                      <span className="flex items-center gap-1">
                        <ComplexityDots complexity={post.complexity} />
                        <span
                          style={{
                            color: post.complexity === 'beginner'
                              ? 'var(--mm-color-green)'
                              : 'var(--mm-color-red)',
                          }}
                          className="font-medium"
                        >
                          {t(`blog.level.${post.complexity}`)}
                        </span>
                      </span>
                    )}
                    {/* Category badge */}
                    {post.category && post.category !== 'general' && (
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                        {t(`blog.cat.${post.category}`, post.category)}
                      </span>
                    )}
                    {post.published_at && <span>{formatDate(post.published_at, urlLang)}</span>}
                    {estimateReadMins(desc) && (
                      <><span>·</span><span>{t('blog.minRead', { mins: estimateReadMins(desc) })}</span></>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

    </main>
  )
}
