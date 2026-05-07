/**
 * ArticleLayout — shared wrapper for all blog articles.
 *
 * Props:
 *   title        — article title (sets document.title and og meta)
 *   description  — short description for meta description tag
 *   date         — ISO date string e.g. "2026-05-08"
 *   readingTime  — e.g. "8 min"
 *   children     — article body content
 *
 * Sets document.title and meta description via useEffect (no react-helmet needed).
 * Renders a consistent header, prose body, and a bottom CTA card.
 */
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, Button, SectionLabel } from '../../components/ui'

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function ArticleLayout({ title, description, date, readingTime, children }) {
  useEffect(() => {
    const prev = document.title
    document.title = `${title} — Cèrcol`

    // Set meta description
    let metaDesc = document.querySelector('meta[name="description"]')
    const prevDesc = metaDesc?.getAttribute('content') ?? ''
    if (metaDesc) {
      metaDesc.setAttribute('content', description)
    }

    return () => {
      document.title = prev
      if (metaDesc) metaDesc.setAttribute('content', prevDesc)
    }
  }, [title, description])

  return (
    <main className="py-12 max-w-2xl">

      {/* ── Article header ───────────────────────────────────────── */}
      <header className="mb-10">
        <SectionLabel color="blue" className="mb-3">
          Blog · Cèrcol
        </SectionLabel>
        <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
          {title}
        </h1>
        <p className="text-xs text-gray-400">
          {formatDate(date)} · {readingTime} read
        </p>
      </header>

      {/* ── Article body ─────────────────────────────────────────── */}
      <article className="mb-14">
        {children}
      </article>

      {/* ── CTA card ─────────────────────────────────────────────── */}
      <Card className="px-6 py-6">
        <p className="text-sm font-bold text-gray-900 mb-1.5">
          Try it yourself — First Quarter Cèrcol is free.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          First Quarter Cèrcol is a 60-item personality assessment built on the
          IPIP-NEO-60, measuring all five dimensions across 30 facets.
          No account required.
        </p>
        <Link to="/first-quarter">
          <Button variant="primary" size="md">
            Take First Quarter Cèrcol — free
          </Button>
        </Link>
      </Card>

    </main>
  )
}
