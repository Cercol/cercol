/**
 * AboutPage — public informational page at /about.
 * No auth required. High-level intro: what Cèrcol is, philosophy,
 * five dimensions, explore-deeper cards, and framing note.
 */
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function ExploreCard({ label, desc, to, accent }) {
  return (
    <Link
      to={to}
      className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all flex flex-col gap-1.5"
    >
      <p className={`text-xs font-bold uppercase tracking-widest ${accent}`}>{label}</p>
      <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
      <p className="mt-auto pt-2 text-xs font-semibold text-gray-400 flex items-center gap-1">
        Read more
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
        </svg>
      </p>
    </Link>
  )
}

function DimensionCard({ name, desc, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <p className={`text-xs font-bold uppercase tracking-widest mb-1.5 ${accent}`}>{name}</p>
      <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
    </div>
  )
}

export default function AboutPage() {
  const { t } = useTranslation()

  const dimensions = [
    { key: 'presence',    accent: 'text-amber-500' },
    { key: 'bond',        accent: 'text-emerald-600' },
    { key: 'discipline',  accent: 'text-blue-600' },
    { key: 'depth',       accent: 'text-red-500' },
    { key: 'vision',      accent: 'text-purple-600' },
  ]

  const notThisItems = ['item1', 'item2', 'item3', 'item4']

  return (
    <main className="py-12">

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

        {/* ── Philosophy ────────────────────────────────────────── */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {t('about.philosophy.heading')}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {t('about.philosophy.body')}
          </p>
        </section>

        {/* ── Explore deeper ────────────────────────────────────── */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {t('about.explore.heading')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ExploreCard
              label={t('about.explore.instruments.label')}
              desc={t('about.explore.instruments.desc')}
              to="/instruments"
              accent="text-amber-500"
            />
            <ExploreCard
              label={t('about.explore.roles.label')}
              desc={t('about.explore.roles.desc')}
              to="/roles"
              accent="text-purple-600"
            />
            <ExploreCard
              label={t('about.explore.science.label')}
              desc={t('about.explore.science.desc')}
              to="/science"
              accent="text-blue-600"
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

        {/* ── What Cèrcol is not ────────────────────────────────── */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('about.notThis.heading')}
          </h2>
          <ul className="flex flex-col gap-2">
            {notThisItems.map((key) => (
              <li key={key} className="flex gap-3 text-sm text-gray-600 leading-relaxed">
                <span className="mt-0.5 shrink-0 text-gray-300">—</span>
                {t(`about.notThis.${key}`)}
              </li>
            ))}
          </ul>
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

    </main>
  )
}
