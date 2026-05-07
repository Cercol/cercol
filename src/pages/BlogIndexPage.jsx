/**
 * BlogIndexPage — public blog index at /blog.
 * Fetches posts from the backend API and displays them as cards with cover images.
 * Language-aware: shows current locale title/description with English as fallback.
 */
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SectionLabel } from '../components/ui'
import { getBlogPosts } from '../lib/api'

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
}

/** Estimate reading time from description text as a rough approximation. */
function estimateReadTime(text) {
  if (!text) return null
  const words = text.trim().split(/\s+/).length
  // For index cards we only have the description, not the full article.
  // Scale up to simulate full article length (description ~ 10% of article).
  const mins = Math.max(3, Math.ceil((words * 10) / 200))
  return `${mins} min read`
}

export default function BlogIndexPage() {
  const { i18n } = useTranslation()
  const lang = i18n.language?.slice(0, 2) || 'en'

  const [posts,   setPosts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

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
    return field[lang] || field.en || ''
  }

  return (
    <main className="py-12">

      {/* Page header */}
      <SectionLabel color="blue" className="mb-3">
        Blog
      </SectionLabel>
      <h1
        className="text-3xl font-bold text-gray-900 mb-3"
        style={{ fontFamily: 'var(--mm-font-display)' }}
      >
        Personality science and team assessment
      </h1>
      <p className="text-sm text-gray-600 leading-relaxed mb-10 max-w-xl">
        Science-grounded articles on personality, teams, and open measurement.
        Written to be citable, honest, and useful.
      </p>

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
          Could not load articles. Please try again later.
        </p>
      )}

      {/* Empty state */}
      {!loading && !error && posts.length === 0 && (
        <div className="py-16 text-center rounded-2xl border border-dashed border-gray-200">
          <p className="text-sm text-gray-400">No articles published yet.</p>
          <p className="text-xs text-gray-300 mt-1">Check back soon.</p>
        </div>
      )}

      {/* Post grid */}
      {!loading && !error && posts.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => {
            const desc = localise(post.description)
            return (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
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
                  <div className="mt-auto flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-gray-400">
                    {post.published_at && <span>{formatDate(post.published_at)}</span>}
                    {estimateReadTime(desc) && (
                      <><span>·</span><span>{estimateReadTime(desc)}</span></>
                    )}
                    {post.view_count != null && (
                      <><span>·</span><span>👁 {post.view_count}</span></>
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
