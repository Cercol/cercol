/**
 * AboutPage — public informational page at /about.
 * No auth required. Explains what Cèrcol is, the three instruments,
 * the five dimensions, and how to interpret scores.
 * Brand voice: warm, direct, no jargon (PRODUCT.md).
 */
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

/**
 * StaticItem — read-only visual representation of a sample instrument question.
 * Shows the item text and a greyed-out scale. Not interactive.
 */
function StaticItem({ prefix, text, scaleMax }) {
  return (
    <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
      <p className="text-xs text-gray-400 mb-1">{prefix}</p>
      <p className="text-sm text-gray-700 mb-3 font-medium">{text}</p>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: scaleMax }, (_, i) => (
          <div
            key={i}
            className="flex-1 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center"
          >
            <span className="text-xs text-gray-300 font-medium">{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * DimensionCard — one of the five dimension descriptions.
 */
function DimensionCard({ name, desc, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <p className={`text-xs font-bold uppercase tracking-widest mb-1.5 ${accent}`}>{name}</p>
      <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
    </div>
  )
}

/**
 * InstrumentSection — one instrument with description + sample items.
 */
function InstrumentSection({ moon, name, eyebrow, meta, about, get, items, itemPrefix, itemScale, scaleMax, free, freeLabel, paidLabel, accent, ctaTo, sampleHeading }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-6 pt-6 pb-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${accent}`}>
              {moon} {eyebrow}
            </p>
            <h3 className="text-lg font-bold text-gray-900">{name}</h3>
          </div>
          <span className={`shrink-0 mt-1 text-xs font-semibold px-2.5 py-1 rounded-full ${free ? 'bg-emerald-50 text-emerald-700' : 'bg-purple-50 text-purple-700'}`}>
            {free ? freeLabel : paidLabel}
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-3">{meta}</p>
        <p className="text-sm text-gray-600 leading-relaxed mb-2">{about}</p>
        <p className="text-sm text-gray-500 leading-relaxed">{get}</p>
      </div>

      <div className="border-t border-gray-100 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">{sampleHeading}</p>
        <div className="flex flex-col gap-2">
          {items.map((item, i) => (
            <StaticItem key={i} prefix={itemPrefix} text={item} scaleMax={scaleMax} />
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-400">{itemScale}</p>
      </div>

      <div className="border-t border-gray-100 px-6 py-4">
        <Link
          to={ctaTo}
          className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1.5"
        >
          Start {name}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
          </svg>
        </Link>
      </div>
    </div>
  )
}

export default function AboutPage() {
  const { t } = useTranslation()

  const dimensions = [
    { key: 'presence',   accent: 'text-amber-500' },
    { key: 'bond',       accent: 'text-emerald-600' },
    { key: 'discipline', accent: 'text-blue-600' },
    { key: 'depth',      accent: 'text-red-500' },
    { key: 'vision',     accent: 'text-purple-600' },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-12">

        {/* ── Intro ─────────────────────────────────────────────── */}
        <section className="mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            {t('about.intro.eyebrow')}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('about.intro.heading')}
          </h1>
          <p className="text-base text-gray-600 leading-relaxed mb-5">
            {t('about.intro.body')}
          </p>
          <blockquote className="border-l-2 border-gray-200 pl-4 italic text-gray-500 text-sm leading-relaxed">
            {t('about.intro.founding')}
          </blockquote>
        </section>

        {/* ── Instruments ───────────────────────────────────────── */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {t('about.instruments.heading')}
          </h2>
          <div className="flex flex-col gap-5">
            <InstrumentSection
              moon="🌑"
              name={t('about.instruments.newMoon.name')}
              eyebrow={t('about.instruments.newMoon.eyebrow')}
              meta={t('about.instruments.newMoon.meta')}
              about={t('about.instruments.newMoon.about')}
              get={t('about.instruments.newMoon.get')}
              items={t('about.instruments.newMoon.items', { returnObjects: true })}
              itemPrefix={t('about.instruments.newMoon.itemPrefix')}
              itemScale={t('about.instruments.newMoon.itemScale')}
              scaleMax={7}
              free
              freeLabel={t('about.instruments.freeLabel')}
              paidLabel={t('about.instruments.paidLabel')}
              accent="text-amber-500"
              sampleHeading={t('about.instruments.sampleHeading')}
              ctaTo="/new-moon"
            />
            <InstrumentSection
              moon="🌓"
              name={t('about.instruments.firstQuarter.name')}
              eyebrow={t('about.instruments.firstQuarter.eyebrow')}
              meta={t('about.instruments.firstQuarter.meta')}
              about={t('about.instruments.firstQuarter.about')}
              get={t('about.instruments.firstQuarter.get')}
              items={t('about.instruments.firstQuarter.items', { returnObjects: true })}
              itemPrefix={t('about.instruments.firstQuarter.itemPrefix')}
              itemScale={t('about.instruments.firstQuarter.itemScale')}
              scaleMax={5}
              free
              freeLabel={t('about.instruments.freeLabel')}
              paidLabel={t('about.instruments.paidLabel')}
              accent="text-blue-600"
              sampleHeading={t('about.instruments.sampleHeading')}
              ctaTo="/first-quarter"
            />
            <InstrumentSection
              moon="🌕"
              name={t('about.instruments.fullMoon.name')}
              eyebrow={t('about.instruments.fullMoon.eyebrow')}
              meta={t('about.instruments.fullMoon.meta')}
              about={t('about.instruments.fullMoon.about')}
              get={t('about.instruments.fullMoon.get')}
              items={t('about.instruments.fullMoon.items', { returnObjects: true })}
              itemPrefix={t('about.instruments.fullMoon.itemPrefix')}
              itemScale={t('about.instruments.fullMoon.itemScale')}
              scaleMax={5}
              free={false}
              freeLabel={t('about.instruments.freeLabel')}
              paidLabel={t('about.instruments.paidLabel')}
              accent="text-purple-600"
              sampleHeading={t('about.instruments.sampleHeading')}
              ctaTo="/full-moon"
            />
          </div>
        </section>

        {/* ── Five dimensions ───────────────────────────────────── */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {t('about.dimensions.heading')}
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            {t('about.dimensions.subheading')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dimensions.map(({ key, accent }) => (
              <DimensionCard
                key={key}
                name={t(`about.dimensions.${key}.name`)}
                desc={t(`about.dimensions.${key}.desc`)}
                accent={accent}
              />
            ))}
          </div>
        </section>

        {/* ── Framing note ──────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-200 px-6 py-6">
          <h2 className="text-base font-bold text-gray-900 mb-2">
            {t('about.framing.heading')}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {t('about.framing.body')}
          </p>
        </section>

      </div>
    </main>
  )
}
