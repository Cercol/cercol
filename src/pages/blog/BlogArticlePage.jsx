/**
 * BlogArticlePage — dynamic article page at /blog/:slug.
 * Fetches article by slug from the API, renders markdown content.
 * Language-aware: shows current locale content, falling back to English.
 * Features: cover banner, ToC, related articles, reading time, custom marked renderer.
 */
import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { marked } from 'marked'
import { getBlogPost, getBlogPosts, trackBlogView } from '../../lib/api'

// Configure marked with custom renderers once at module load time
marked.use({
  gfm: true,
  breaks: true,
  renderer: {
    // Wrap tables in a scrollable container for responsive overflow
    table(token) {
      // Build header cells
      const headerCells = token.header
        .map(cell => {
          const align = cell.align ? ` align="${cell.align}"` : ''
          const text = this.parser.parseInline(cell.tokens)
          return `<th${align}>${text}</th>`
        })
        .join('')
      const headerRow = `<tr>${headerCells}</tr>`

      // Build body rows
      const bodyRows = token.rows
        .map(row => {
          const cells = row
            .map(cell => {
              const align = cell.align ? ` align="${cell.align}"` : ''
              const text = this.parser.parseInline(cell.tokens)
              return `<td${align}>${text}</td>`
            })
            .join('')
          return `<tr>${cells}</tr>`
        })
        .join('')

      return `<div class="table-wrapper"><table><thead>${headerRow}</thead><tbody>${bodyRows}</tbody></table></div>`
    },

    // Add id attributes to headings so ToC anchor links work
    heading(token) {
      const text = this.parser.parseInline(token.tokens)
      const id = text
        .toLowerCase()
        .replace(/<[^>]+>/g, '') // strip any inner HTML tags
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/^-|-$/g, '')
      return `<h${token.depth} id="${id}">${text}</h${token.depth}>\n`
    },
  },
})

/** Translations for the "only available in English" notice. */
const ONLY_ENGLISH_NOTICE = {
  en: '',
  ca: 'Aquest article només està disponible en anglès.',
  es: 'Este artículo solo está disponible en inglés.',
  fr: "Cet article n'est disponible qu'en anglais.",
  de: 'Dieser Artikel ist nur auf Englisch verfügbar.',
  da: 'Denne artikel er kun tilgængelig på engelsk.',
}

/** Translations for "Related articles" section heading. */
const RELATED_LABEL = {
  en: 'Related articles',
  ca: 'Articles relacionats',
  es: 'Artículos relacionados',
  fr: 'Articles liés',
  de: 'Verwandte Artikel',
  da: 'Relaterede artikler',
}

/** Translations for "Back to blog" breadcrumb. */
const BACK_LABEL = {
  en: '← Back to blog',
  ca: '← Tornar al blog',
  es: '← Volver al blog',
  fr: '← Retour au blog',
  de: '← Zurück zum Blog',
  da: '← Tilbage til blog',
}

/** Translations for "Contents" ToC toggle (mobile). */
const CONTENTS_LABEL = {
  en: 'Contents',
  ca: 'Contingut',
  es: 'Contenido',
  fr: 'Sommaire',
  de: 'Inhalt',
  da: 'Indhold',
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
}

/** Estimate reading time from a markdown string (~200 words/min). */
function readingTime(text) {
  if (!text) return null
  const wordCount = text.trim().split(/\s+/).length
  const mins = Math.max(1, Math.ceil(wordCount / 200))
  return `${mins} min read`
}

/** Parse ## and ### headings from markdown content for ToC. */
function extractHeadings(markdown) {
  if (!markdown) return []
  const lines = markdown.split('\n')
  const headings = []
  for (const line of lines) {
    const m = line.match(/^(#{2,3})\s+(.+)/)
    if (m) {
      const level = m[1].length
      const text = m[2].trim()
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/^-|-$/g, '')
      headings.push({ level, text, id })
    }
  }
  return headings
}

/** Resolve a localised field with English fallback. */
function localise(field, lang) {
  if (!field) return ''
  if (typeof field === 'string') return field
  return field[lang] || field.en || ''
}

export default function BlogArticlePage() {
  const { slug }   = useParams()
  const navigate   = useNavigate()
  const { i18n }   = useTranslation()
  const lang       = i18n.language?.slice(0, 2) || 'en'
  const { pathname } = useLocation()
  const BLOG_LANG_PREFIXES = ['ca', 'es', 'fr', 'de', 'da']
  const urlLang = BLOG_LANG_PREFIXES.find(l => pathname.startsWith(`/${l}/`)) || 'en'

  const [post,         setPost]         = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [relatedPosts, setRelatedPosts] = useState([])
  const [tocOpen,      setTocOpen]      = useState(false)
  const articleRef = useRef(null)

  // Sync i18n to URL language
  useEffect(() => {
    if (urlLang !== i18n.language.slice(0, 2)) {
      i18n.changeLanguage(urlLang)
    }
  }, [urlLang])

  // Fetch the main article
  useEffect(() => {
    setLoading(true)
    setError(null)
    getBlogPost(slug)
      .then(data => {
        setPost(data)
        trackBlogView(slug).catch(() => {})
      })
      .catch(err => {
        if (err.message?.includes('404')) {
          navigate('/blog', { replace: true })
        } else {
          setError(err.message)
        }
      })
      .finally(() => setLoading(false))
  }, [slug, navigate])

  // Extract internal /blog/[slug] links from all language versions of the content.
  // This drives the "related articles" section automatically — no manual curation needed.
  function extractLinkedSlugs(content) {
    if (!content) return []
    const all = Object.values(content).join('\n')
    const matches = [...all.matchAll(/\(\/blog\/([a-z0-9-]+)\)/g)]
    return [...new Set(matches.map(m => m[1]))]
  }

  // Fetch related posts: articles explicitly linked from the text come first;
  // recent articles fill the remaining slots up to 3. Scales to any number of articles.
  useEffect(() => {
    if (!post) return
    getBlogPosts()
      .then(data => {
        if (!Array.isArray(data)) return
        const linkedSlugs = extractLinkedSlugs(post.content)
        const linked   = data.filter(p => p.slug !== slug && linkedSlugs.includes(p.slug))
        const fallback = data.filter(p => p.slug !== slug && !linkedSlugs.includes(p.slug))
        setRelatedPosts([...linked, ...fallback].slice(0, 3))
      })
      .catch(() => {})
  }, [slug, post])

  // Set document title, meta tags, hreflang, canonical, and JSON-LD when post loads
  useEffect(() => {
    if (!post) return
    const title = localise(post.title, urlLang) || slug
    const description = localise(post.description, urlLang) || ''
    const prevTitle = document.title
    document.title = `${title} · Cèrcol`

    const BASE = 'https://cercol.team'
    const canonicalUrl = urlLang === 'en' ? `${BASE}/blog/${slug}` : `${BASE}/${urlLang}/blog/${slug}`
    const addedEls = []

    // Remove stale tags first
    document.querySelectorAll('link[rel="alternate"][hreflang], link[rel="canonical"]').forEach(el => el.remove())
    document.querySelectorAll('meta[name="description"][data-blog], meta[property^="og:"][data-blog], script[type="application/ld+json"][data-blog]').forEach(el => el.remove())

    // Meta description
    if (description) {
      const metaDesc = document.createElement('meta')
      metaDesc.name = 'description'
      metaDesc.content = description
      metaDesc.dataset.blog = '1'
      document.head.appendChild(metaDesc)
      addedEls.push(metaDesc)
    }

    // Open Graph tags
    const ogTags = [
      ['property', 'og:title', title],
      ['property', 'og:description', description],
      ['property', 'og:url', canonicalUrl],
      ['property', 'og:type', 'article'],
      ['property', 'og:site_name', 'Cèrcol'],
    ]
    ogTags.forEach(([attr, key, val]) => {
      if (!val) return
      const meta = document.createElement('meta')
      meta[attr] = key
      meta.content = val
      meta.dataset.blog = '1'
      document.head.appendChild(meta)
      addedEls.push(meta)
    })

    // JSON-LD BlogPosting
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: title,
      description,
      url: canonicalUrl,
      datePublished: post.published_at || post.created_at,
      dateModified: post.updated_at || post.published_at || post.created_at,
      author: { '@type': 'Person', name: post.author || 'Miquel Matoses' },
      publisher: {
        '@type': 'Organization',
        name: 'Cèrcol',
        url: BASE,
      },
      inLanguage: urlLang,
    }
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.dataset.blog = '1'
    script.textContent = JSON.stringify(jsonLd)
    document.head.appendChild(script)
    addedEls.push(script)

    // Hreflang alternates
    const langs = ['en', 'ca', 'es', 'fr', 'de', 'da']
    langs.forEach(l => {
      const el = document.createElement('link')
      el.rel = 'alternate'
      el.hreflang = l
      el.href = l === 'en' ? `${BASE}/blog/${slug}` : `${BASE}/${l}/blog/${slug}`
      document.head.appendChild(el)
      addedEls.push(el)
    })
    const xd = document.createElement('link')
    xd.rel = 'alternate'
    xd.hreflang = 'x-default'
    xd.href = `${BASE}/blog/${slug}`
    document.head.appendChild(xd)
    addedEls.push(xd)
    const canon = document.createElement('link')
    canon.rel = 'canonical'
    canon.href = canonicalUrl
    document.head.appendChild(canon)
    addedEls.push(canon)

    return () => {
      document.title = prevTitle
      addedEls.forEach(el => el.remove())
    }
  }, [post, urlLang, slug])

  if (loading) {
    return (
      <main className="py-12 max-w-3xl">
        <div className="animate-pulse space-y-4">
          <div className="h-3 bg-gray-100 rounded w-40" />
          <div className="h-64 bg-gray-100 rounded-2xl" />
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

  const title       = localise(post.title, urlLang)
  const description = localise(post.description, urlLang)
  const rawContent  = post.content ? (post.content[urlLang] || post.content.en || '') : ''
  const showNotice  = urlLang !== 'en' && rawContent === (post.content?.en || '') && !post.content?.[urlLang]
  const rawHtml     = rawContent ? marked.parse(rawContent) : ''
  const htmlContent = urlLang === 'en'
    ? rawHtml
    : rawHtml.replace(/href="\/blog\//g, `href="/${urlLang}/blog/`)
  const headings    = extractHeadings(rawContent)
  const estTime     = readingTime(rawContent)

  return (
    <main className="py-8">

      {/* Breadcrumb */}
      <div className="mb-6 max-w-3xl">
        <Link
          to={urlLang === 'en' ? '/blog' : `/${urlLang}/blog`}
          className="text-sm font-medium hover:underline"
          style={{ color: 'var(--mm-color-blue)' }}
        >
          {BACK_LABEL[urlLang] || BACK_LABEL.en}
        </Link>
      </div>

      {/* Cover banner */}
      <div
        className="relative w-full rounded-2xl overflow-hidden mb-8 max-w-3xl"
        style={{ height: 'clamp(180px, 28vw, 280px)' }}
      >
        {post.coverUrl ? (
          <>
            <img
              src={post.coverUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, var(--mm-color-blue) 0%, #00297a 100%)',
            }}
          />
        )}
      </div>

      {/* Article header */}
      <header className="mb-8 max-w-3xl">
        <h1
          className="text-3xl font-bold text-gray-900 mb-3 leading-tight"
          style={{ fontFamily: 'var(--mm-font-display)' }}
        >
          {title}
        </h1>
        {description && (
          <p className="text-base text-gray-500 mb-3 leading-relaxed">{description}</p>
        )}
        <p className="text-sm text-gray-400 flex flex-wrap gap-x-2 gap-y-1 items-center">
          {post.author && <span>{post.author}</span>}
          {post.author && post.published_at && <span>·</span>}
          {post.published_at && <span>{formatDate(post.published_at)}</span>}
          {estTime && <><span>·</span><span>{estTime}</span></>}
          {post.view_count != null && <><span>·</span><span>👁 {post.view_count}</span></>}
        </p>
      </header>

      {/* Language notice */}
      {showNotice && ONLY_ENGLISH_NOTICE[urlLang] && (
        <div
          className="mb-6 px-4 py-3 rounded-xl border text-sm flex gap-3 items-start max-w-3xl"
          style={{
            background: 'var(--mm-color-blue-tint)',
            borderColor: 'var(--mm-color-blue)',
            color: '#1a3a6b',
          }}
        >
          {/* Info icon */}
          <svg
            className="flex-shrink-0 mt-0.5"
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span>{ONLY_ENGLISH_NOTICE[urlLang]}</span>
        </div>
      )}

      {/* Two-column layout: article + ToC sidebar on desktop */}
      <div className="flex gap-10 items-start max-w-5xl">

        {/* Main article content */}
        <div className="min-w-0 flex-1">

          {/* Mobile ToC toggle */}
          {headings.length > 0 && (
            <div className="lg:hidden mb-6">
              <button
                type="button"
                onClick={() => setTocOpen(o => !o)}
                className="w-full flex justify-between items-center px-4 py-3 rounded-xl border text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span>{CONTENTS_LABEL[urlLang] || CONTENTS_LABEL.en}</span>
                <span className="text-gray-400">{tocOpen ? '▾' : '▸'}</span>
              </button>
              {tocOpen && (
                <nav className="mt-2 px-4 py-3 rounded-xl border bg-white">
                  <ul className="space-y-1">
                    {headings.map(h => (
                      <li
                        key={h.id}
                        style={{ paddingLeft: h.level === 3 ? '1rem' : '0' }}
                      >
                        <a
                          href={`#${h.id}`}
                          onClick={() => setTocOpen(false)}
                          className="text-sm hover:underline block py-0.5"
                          style={{ color: 'var(--mm-color-blue)' }}
                        >
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </div>
          )}

          <article
            ref={articleRef}
            className="prose-article"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>

        {/* Desktop sticky ToC sidebar */}
        {headings.length > 0 && (
          <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-6 self-start">
            <nav
              className="rounded-xl border p-4"
              style={{ borderColor: 'var(--mm-color-gray-200)' }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: 'var(--mm-color-blue)' }}
              >
                {CONTENTS_LABEL[urlLang] || CONTENTS_LABEL.en}
              </p>
              <ul className="space-y-1.5">
                {headings.map(h => (
                  <li
                    key={h.id}
                    style={{ paddingLeft: h.level === 3 ? '0.75rem' : '0' }}
                  >
                    <a
                      href={`#${h.id}`}
                      className="text-xs leading-snug block py-0.5 text-gray-600 hover:text-[var(--mm-color-blue)] hover:underline transition-colors"
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        )}
      </div>

      {/* Related articles */}
      {relatedPosts.length > 0 && (
        <section className="mt-16 pt-10 border-t max-w-3xl">
          <h2
            className="text-xl font-bold text-gray-900 mb-6"
            style={{ fontFamily: 'var(--mm-font-display)' }}
          >
            {RELATED_LABEL[urlLang] || RELATED_LABEL.en}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedPosts.map(p => {
              const relatedHref = urlLang === 'en' ? `/blog/${p.slug}` : `/${urlLang}/blog/${p.slug}`
              return (
              <Link
                key={p.slug}
                to={relatedHref}
                className="group block rounded-xl border p-4 hover:shadow-md transition-shadow bg-white"
              >
                <h3
                  className="text-sm font-semibold text-gray-900 mb-1 group-hover:underline leading-snug"
                  style={{ fontFamily: 'var(--mm-font-display)' }}
                >
                  {localise(p.title, urlLang)}
                </h3>
                {localise(p.description, urlLang) && (
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                    {localise(p.description, urlLang)}
                  </p>
                )}
                <span
                  className="mt-2 inline-block text-xs font-medium hover:underline"
                  style={{ color: 'var(--mm-color-blue)' }}
                >
                  Read →
                </span>
              </Link>
              )
            })}
          </div>
        </section>
      )}

    </main>
  )
}
