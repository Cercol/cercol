/**
 * NotFoundPage — catch-all route.
 *
 * The static-assets server runs in single-page-application mode, so an
 * unknown URL is served the app with an HTTP 200 (a real 404 status would
 * break the deliberately un-prerendered routes: /witness/:token, /groups/:id,
 * /auth). This page is what makes that tolerable: the visitor gets told, and
 * the robots meta below tells crawlers not to index the soft-404. No
 * usePageMeta here on purpose — a 404 must not emit canonical or hreflang
 * tags for a URL that does not exist.
 */
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, SectionLabel } from '../components/ui'
import { navHref } from '../lib/navigation'

export default function NotFoundPage() {
  const { t, i18n } = useTranslation()
  const lang = (i18n.language || 'en').slice(0, 2)

  useEffect(() => {
    const prevTitle = document.title
    document.title = t('notFound.title')
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex'
    document.head.appendChild(robots)
    return () => {
      document.title = prevTitle
      robots.remove()
    }
  }, [t])

  return (
    <main className="max-w-3xl mx-auto px-4 py-16 flex flex-col items-start gap-6">
      <div>
        <SectionLabel color="red">404</SectionLabel>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">{t('notFound.heading')}</h1>
        <p className="mt-3 text-gray-600 leading-relaxed">{t('notFound.body')}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link to={navHref({ to: '/' }, lang)}><Button>{t('notFound.home')}</Button></Link>
        <Link to={navHref({ to: '/instruments' }, lang)}><Button variant="secondary">{t('notFound.instruments')}</Button></Link>
      </div>
    </main>
  )
}
