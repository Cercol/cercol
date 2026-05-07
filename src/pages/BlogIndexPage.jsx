/**
 * BlogIndexPage — public blog index at /blog.
 * Lists all articles with title, excerpt, date, and reading time.
 * No auth required. No i18n — articles are English-only.
 */
import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { Card, SectionLabel } from '../components/ui'

const ARTICLES = [
  {
    slug: 'big-five-vs-disc-vs-belbin',
    title: "Big Five vs DISC vs Belbin: a scientist's comparison",
    excerpt:
      'Three of the most popular personality frameworks in organisations. One has decades of peer-reviewed validation. Here is what the research actually says.',
    date: '2026-05-08',
    readingTime: '8 min',
  },
  {
    slug: 'how-to-build-a-balanced-team',
    title: 'How to build a balanced team using personality science',
    excerpt:
      'What does the research say about personality composition and team performance? A practical guide grounded in meta-analytic evidence.',
    date: '2026-05-08',
    readingTime: '7 min',
  },
  {
    slug: 'blind-spots-in-teams',
    title: 'Blind spots in teams: when self-perception diverges from peer perception',
    excerpt:
      'Self-report and peer assessment of personality often disagree. Understanding where — and why — can change how a team works together.',
    date: '2026-05-08',
    readingTime: '6 min',
  },
  {
    slug: 'what-is-the-ipip',
    title: 'What is the IPIP and why does it matter?',
    excerpt:
      'The International Personality Item Pool is the most widely used public-domain personality item library in science. This is why it matters — and why Cèrcol uses it.',
    date: '2026-05-08',
    readingTime: '5 min',
  },
]

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function BlogIndexPage() {
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

  return (
    <main className="py-12">

      {/* ── Header ───────────────────────────────────────────────── */}
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

      {/* ── Article list ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        {ARTICLES.map((article) => (
          <Link
            key={article.slug}
            to={`/blog/${article.slug}`}
            className="block group"
          >
            <Card className="px-5 py-5 transition-shadow group-hover:shadow-md">
              <p className="text-xs text-gray-400 mb-2">
                {formatDate(article.date)} · {article.readingTime} read
              </p>
              <h2 className="text-base font-bold text-gray-900 mb-2 group-hover:text-[var(--mm-color-blue)] transition-colors">
                {article.title}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {article.excerpt}
              </p>
            </Card>
          </Link>
        ))}
      </div>

    </main>
  )
}
