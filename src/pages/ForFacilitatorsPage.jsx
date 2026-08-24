/**
 * ForFacilitatorsPage — public landing at /for-facilitators.
 *
 * The second painted door: coaches and organizational psychologists can use
 * the free instruments with their clients today; practitioner materials and
 * a directory of qualified professionals are named as coming, and interest
 * is measured with a cta_click event before anything is built. The page is
 * explicit that the role model is beta and must not be presented to clients
 * as validated — that honesty is the offer, not the small print.
 */
import { useTranslation } from 'react-i18next'
import { Card, Button, SectionLabel } from '../components/ui'
import { usePageMeta } from '../hooks/usePageMeta'
import { trackEvent } from '../lib/api'

const CONTACT = 'hello@cercol.team'

export default function ForFacilitatorsPage() {
  const { t } = useTranslation()

  usePageMeta({
    title: t('seo.forFacilitators.title'),
    description: t('seo.forFacilitators.description'),
    path: '/for-facilitators/',
  })

  const todayItems = ['today1', 'today2', 'today3', 'today4']
  const laterItems = ['later1', 'later2', 'later3']

  function handleInterest() {
    trackEvent('cta_click', { slug: 'facilitator-interest', path: '/for-facilitators' })
    window.location.href = `mailto:${CONTACT}?subject=${encodeURIComponent(t('forFacilitators.cta.subject'))}`
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 flex flex-col gap-10">
      <header>
        <SectionLabel color="blue">{t('forFacilitators.eyebrow')}</SectionLabel>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">{t('forFacilitators.title')}</h1>
        <p className="mt-3 text-gray-600 leading-relaxed">{t('forFacilitators.intro')}</p>
      </header>

      <section>
        <SectionLabel color="gray" className="mb-3">{t('forFacilitators.today.heading')}</SectionLabel>
        <ul className="flex flex-col gap-2">
          {todayItems.map((k) => (
            <li key={k} className="bg-white border border-gray-200 rounded px-4 py-3 text-sm text-gray-700">
              {t(`forFacilitators.today.${k}`)}
            </li>
          ))}
        </ul>
      </section>

      <Card className="p-6 border-l-4 border-l-[var(--mm-color-yellow)]">
        <p className="text-sm font-semibold text-gray-900 mb-1">{t('forFacilitators.honesty.heading')}</p>
        <p className="text-sm text-gray-600 leading-relaxed">{t('forFacilitators.honesty.body')}</p>
      </Card>

      <section>
        <SectionLabel color="gray" className="mb-3">{t('forFacilitators.later.heading')}</SectionLabel>
        <p className="text-sm text-gray-500 mb-3 leading-relaxed">{t('forFacilitators.later.note')}</p>
        <ul className="flex flex-col gap-2">
          {laterItems.map((k) => (
            <li key={k} className="bg-white border border-gray-200 rounded px-4 py-3 text-sm text-gray-700">
              {t(`forFacilitators.later.${k}`)}
            </li>
          ))}
        </ul>
      </section>

      <Card className="p-6 text-center">
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{t('forFacilitators.cta.body')}</p>
        <Button onClick={handleInterest} variant="primary">
          {t('forFacilitators.cta.button')}
        </Button>
        <p className="mt-3 text-xs text-gray-400">{t('forFacilitators.cta.note')}</p>
      </Card>
    </main>
  )
}
