/**
 * BlogArticlePage — dynamic article page at /blog/:slug.
 * Fetches article by slug from the API, renders markdown content.
 * Language-aware: shows current locale content, falling back to English.
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { marked } from 'marked'
import { getBlogPost, trackBlogView } from '../../lib/api'

/** Translations for the "only available in English" notice. */
const ONLY_ENGLISH_NOTICE = {
  en: '',
  ca: 'Aquest article només està disponible en anglès.',
  es: 'Este artículo solo está disponible en inglés.',
  fr: "Cet article n'est disponible qu'en anglais.",
  de: 'Dieser Artikel ist nur auf Englisch verfügbar.',
  da: 'Denne artikel er kun tilgængelig på engelsk.',
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function BlogArticlePage() {
  const { slug } = useParams()
  const navigate  = useNavigate()
  const { i18n }  = useTranslation()
  const lang      = i18n.language?.slice(0, 2) || 'en'

  const [post,    setPost]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getBlogPost(slug)
      .then(data => {
        setPost(data)
        // Fire-and-forget view tracking
        trackBlogView(slug).catch(() => {})
      })
      .catch(err => {
        // Redirect to /blog on 404
        if (err.message?.includes('404')) {
          navigate('/blog', { replace: true })
        } else {
          setError(err.message)
        }
      })
      .finally(() => setLoading(false))
  }, [slug, navigate])

  // Set document title when post loads
  useEffect(() => {
    if (!post) return
    const title = localise(post.title, lang) || slug
    const prev = document.title
    document.title = `${title} · Cèrcol`
    return () => { document.title = prev }
  }, [post, lang, slug])

  if (loading) {
    return (
      <main className="py-12 max-w-3xl">
        <div className="animate-pulse space-y-4">
          <div className="h-3 bg-gray-100 rounded w-40" />
          <div className="h-7 bg-gray-100 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-32" />
          <div className="h-px bg-gray-100 my-6" />
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-3 bg-gray-100 rounded w-full" />
          ))}
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="py-12 text-center">
        <p className="text-sm text-red-500">Could not load article. Please try again later.</p>
      </main>
    )
  }

  if (!post) return null

  const title       = localise(post.title, lang)
  const rawContent  = post.content ? (post.content[lang] || post.content.en || '') : ''
  const showNotice  = lang !== 'en' && rawContent === (post.content?.en || '') && !post.content?.[lang]
  const htmlContent = rawContent ? marked.parse(rawContent) : ''

  return (
    <main className="py-12">

      {/* Article header */}
      <header className="mb-8 max-w-3xl">
        <h1
          className="text-3xl font-bold text-gray-900 mb-3 leading-tight"
          style={{ fontFamily: 'var(--mm-font-heading)' }}
        >
          {title}
        </h1>
        <p className="text-sm text-gray-400">
          {formatDate(post.published_at)}
          {post.author ? ` · ${post.author}` : ''}
          {post.view_count != null ? ` · 👁 ${post.view_count}` : ''}
        </p>
      </header>

      {/* Language notice */}
      {showNotice && ONLY_ENGLISH_NOTICE[lang] && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-yellow-50 border border-yellow-200 text-sm text-yellow-800 max-w-3xl">
          {ONLY_ENGLISH_NOTICE[lang]}
        </div>
      )}

      {/* Markdown content */}
      <article
        className="prose-article max-w-3xl"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

    </main>
  )
}

/** Resolve a localised field with English fallback. */
function localise(field, lang) {
  if (!field) return ''
  if (typeof field === 'string') return field
  return field[lang] || field.en || ''
}
