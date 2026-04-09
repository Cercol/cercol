/**
 * PrivacyPage — plain-language privacy policy at /privacy.
 * Direct brand voice: honest and readable, not legal boilerplate.
 */
import { useTranslation } from 'react-i18next'
import { SectionLabel } from '../components/ui'

function Section({ label, children }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-bold text-gray-900">{label}</h2>
      {children}
    </section>
  )
}

function P({ children }) {
  return <p className="text-sm text-gray-600 leading-relaxed">{children}</p>
}

function UL({ items }) {
  return (
    <ul className="flex flex-col gap-1.5 pl-4">
      {items.map((item, i) => (
        <li key={i} className="text-sm text-gray-600 leading-relaxed list-disc">{item}</li>
      ))}
    </ul>
  )
}

export default function PrivacyPage() {
  const { t } = useTranslation()
  const p = (key) => t(`privacy.${key}`)

  return (
    <main className="py-12">
      <div className="max-w-2xl flex flex-col gap-10">

        <div>
          <SectionLabel color="gray" className="mb-1">{p('eyebrow')}</SectionLabel>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{p('title')}</h1>
          <p className="text-sm text-gray-400">{p('lastUpdated')}</p>
        </div>

        <P>{p('intro')}</P>

        <Section label={p('collected.heading')}>
          <P>{p('collected.body')}</P>
          <UL items={[
            p('collected.email'),
            p('collected.results'),
            p('collected.profile'),
            p('collected.payment'),
            p('collected.anonymous'),
          ]} />
        </Section>

        <Section label={p('why.heading')}>
          <P>{p('why.body')}</P>
          <UL items={[
            p('why.function'),
            p('why.research'),
            p('why.payment'),
          ]} />
          <P>{p('why.noAds')}</P>
        </Section>

        <Section label={p('retention.heading')}>
          <P>{p('retention.body')}</P>
          <UL items={[
            p('retention.account'),
            p('retention.anonymous'),
            p('retention.payment'),
          ]} />
        </Section>

        <Section label={p('cookies.heading')}>
          <P>{p('cookies.body')}</P>
        </Section>

        <Section label={p('rights.heading')}>
          <P>{p('rights.body')}</P>
          <UL items={[
            p('rights.access'),
            p('rights.deletion'),
            p('rights.portability'),
            p('rights.correction'),
          ]} />
          <P>{p('rights.how')}</P>
        </Section>

        <Section label={p('thirdParties.heading')}>
          <P>{p('thirdParties.supabase')}</P>
          <P>{p('thirdParties.stripe')}</P>
          <P>{p('thirdParties.noTrackers')}</P>
        </Section>

        <Section label={p('contact.heading')}>
          <P>{p('contact.body')}</P>
          <p className="text-sm text-gray-600">
            <a
              href={`mailto:${p('contact.email')}`}
              className="text-[#0047ba] underline hover:no-underline"
            >
              {p('contact.email')}
            </a>
          </p>
        </Section>

      </div>
    </main>
  )
}
