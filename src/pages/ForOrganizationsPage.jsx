/**
 * ForOrganizationsPage — public landing at /for-organizations.
 *
 * A painted door, not a product: it states what an organization can already
 * do for free, names the administrative conveniences that MAY become a paid
 * layer, and measures interest with a cta_click event before anything gets
 * built. The free-forever commitment lives here in full, so the paid layer
 * can never be read as moving the ground under existing users.
 */
import { useTranslation } from 'react-i18next'
import { Card, Button, SectionLabel } from '../components/ui'
import { usePageMeta } from '../hooks/usePageMeta'
import { trackEvent } from '../lib/api'

const CONTACT = 'hello@cercol.team'

export default function ForOrganizationsPage() {
  const { t } = useTranslation()

  usePageMeta({
    title: t('seo.forOrgs.title'),
    description: t('seo.forOrgs.description'),
    path: '/for-organizations/',
  })

  const todayItems = ['today1', 'today2', 'today3', 'today4']
  const laterItems = ['later1', 'later2', 'later3', 'later4']

  function handleInterest() {
    trackEvent('cta_click', { slug: 'org-interest', path: '/for-organizations' })
    window.location.href = `mailto:${CONTACT}?subject=${encodeURIComponent(t('forOrgs.cta.subject'))}`
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 flex flex-col gap-10">
      <header>
        <SectionLabel color="blue">{t('forOrgs.eyebrow')}</SectionLabel>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">{t('forOrgs.title')}</h1>
        <p className="mt-3 text-gray-600 leading-relaxed">{t('forOrgs.intro')}</p>
      </header>

      <Card className="p-6 border-l-4 border-l-[var(--mm-color-green)]">
        <p className="text-sm font-semibold text-gray-900 mb-1">{t('forOrgs.freeForever.heading')}</p>
        <p className="text-sm text-gray-600 leading-relaxed">{t('forOrgs.freeForever.body')}</p>
      </Card>

      <section>
        <SectionLabel color="gray" className="mb-3">{t('forOrgs.today.heading')}</SectionLabel>
        <ul className="flex flex-col gap-2">
          {todayItems.map((k) => (
            <li key={k} className="bg-white border border-gray-200 rounded px-4 py-3 text-sm text-gray-700">
              {t(`forOrgs.today.${k}`)}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionLabel color="gray" className="mb-3">{t('forOrgs.later.heading')}</SectionLabel>
        <p className="text-sm text-gray-500 mb-3 leading-relaxed">{t('forOrgs.later.note')}</p>
        <ul className="flex flex-col gap-2">
          {laterItems.map((k) => (
            <li key={k} className="bg-white border border-gray-200 rounded px-4 py-3 text-sm text-gray-700">
              {t(`forOrgs.later.${k}`)}
            </li>
          ))}
        </ul>
      </section>

      <Card className="p-6 text-center">
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{t('forOrgs.cta.body')}</p>
        <Button onClick={handleInterest} variant="primary">
          {t('forOrgs.cta.button')}
        </Button>
        <p className="mt-3 text-xs text-gray-400">{t('forOrgs.cta.note')}</p>
      </Card>
    </main>
  )
}
