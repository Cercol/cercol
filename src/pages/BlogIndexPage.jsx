/**
 * BlogIndexPage — public blog index at /blog.
 * Fetches posts from the backend API and displays them with title, description,
 * published date, author, and view count. Language-aware: shows current locale
 * title/description with English as fallback.
 */
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, SectionLabel } from '../components/ui'
import { getBlogPosts } from '../lib/api'

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
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

    let metaDesc = document.querySelector('meta[name="description"]')
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

      {/* Header */}
      <SectionLabel color="blue" className="mb-3">
        Blog
      </SectionLabel>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        Personality science and team assessment
      </h1>
      <p className="text-sm text-gray-600 leading-relaxed mb-10 max-w-xl">
        Research-grounded articles on the Big Five, IPIP, team composition,
        and peer assessment. Written to be citable, honest, and useful.
      </p>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="rounded-2xl border border-gray-100 shadow-sm bg-white px-5 py-5 animate-pulse"
            >
              <div className="h-3 bg-gray-100 rounded w-32 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-full mb-1" />
              <div className="h-3 bg-gray-100 rounded w-5/6" />
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
        <p className="text-sm text-gray-400 py-8 text-center">No articles published yet.</p>
      )}

      {/* Post list */}
      {!loading && !error && posts.length > 0 && (
        <div className="flex flex-col gap-4">
          {posts.map(post => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="block group"
            >
              <Card className="px-5 py-5 transition-shadow group-hover:shadow-md">
                <p className="text-xs text-gray-400 mb-2">
                  {formatDate(post.published_at)}
                  {post.author ? ` · ${post.author}` : ''}
                  {post.view_count != null ? ` · 👁 ${post.view_count}` : ''}
                </p>
                <h2 className="text-base font-bold text-gray-900 mb-2 group-hover:text-[var(--mm-color-blue)] transition-colors">
                  {localise(post.title)}
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {localise(post.description)}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}

    </main>
  )
}
