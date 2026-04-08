/**
 * InstrumentsPage — deep documentation page at /instruments.
 * No auth required. Covers all three instruments in detail:
 * New Moon, First Quarter, and Full Moon (self-report + Witness + cognitive).
 */
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

/**
 * StaticItem — read-only sample question with greyed-out scale.
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
 * WitnessSection — expanded breakdown of the Witness Cèrcol sub-instrument.
 */
function WitnessSection({ data }) {
  const rows = [
    { heading: data.whyHeading, body: data.whyBody },
    { heading: data.howHeading, body: data.howBody },
    { heading: data.whoHeading, body: data.whoBody },
    { heading: data.privacyHeading, body: data.privacyBody },
    { heading: data.blindSpotsHeading, body: data.blindSpotsBody },
  ]
  return (
    <div className="flex flex-col gap-4">
      {rows.map(({ heading, body }) => (
        <div key={heading}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">{heading}</p>
          <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
        </div>
      ))}
    </div>
  )
}

export default function InstrumentsPage() {
  const { t } = useTranslation()

  const p2 = t('instruments.fullMoon.part2', { returnObjects: true })

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-12">

        {/* ── Intro ─────────────────────────────────────────────── */}
        <section className="mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            {t('nav.instruments')}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('instruments.intro.heading')}
          </h1>
          <p className="text-base text-gray-600 leading-relaxed">
            {t('instruments.intro.body')}
          </p>
        </section>

        {/* ── New Moon ──────────────────────────────────────────── */}
        <section className="mb-10">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 pt-6 pb-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1 text-amber-500">
                    🌑 {t('instruments.newMoon.eyebrow')}
                  </p>
                  <h2 className="text-lg font-bold text-gray-900">{t('instruments.newMoon.heading')}</h2>
                </div>
                <span className="shrink-0 mt-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                  {t('instruments.freeLabel')}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-3">{t('instruments.newMoon.meta')}</p>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">{t('instruments.newMoon.measures')}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{t('instruments.newMoon.get')}</p>
            </div>
            <div className="border-t border-gray-100 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                {t('instruments.sampleHeading')}
              </p>
              <div className="flex flex-col gap-2">
                {t('instruments.newMoon.items', { returnObjects: true }).map((item, i) => (
                  <StaticItem key={i} prefix={t('instruments.newMoon.itemPrefix')} text={item} scaleMax={7} />
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-400">{t('instruments.newMoon.scaleNote')}</p>
            </div>
            <div className="border-t border-gray-100 px-6 py-4">
              <Link
                to="/new-moon"
                className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1.5"
              >
                {t('instruments.newMoon.heading')}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ── First Quarter ─────────────────────────────────────── */}
        <section className="mb-10">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 pt-6 pb-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1 text-blue-600">
                    🌓 {t('instruments.firstQuarter.eyebrow')}
                  </p>
                  <h2 className="text-lg font-bold text-gray-900">{t('instruments.firstQuarter.heading')}</h2>
                </div>
                <span className="shrink-0 mt-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                  {t('instruments.freeLabel')}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-3">{t('instruments.firstQuarter.meta')}</p>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">{t('instruments.firstQuarter.measures')}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{t('instruments.firstQuarter.get')}</p>
            </div>
            <div className="border-t border-gray-100 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                {t('instruments.sampleHeading')}
              </p>
              <div className="flex flex-col gap-2">
                {t('instruments.firstQuarter.items', { returnObjects: true }).map((item, i) => (
                  <StaticItem key={i} prefix={t('instruments.firstQuarter.itemPrefix')} text={item} scaleMax={5} />
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-400">{t('instruments.firstQuarter.scaleNote')}</p>
            </div>
            <div className="border-t border-gray-100 px-6 py-4">
              <Link
                to="/first-quarter"
                className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1.5"
              >
                {t('instruments.firstQuarter.heading')}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Full Moon ─────────────────────────────────────────── */}
        <section className="mb-14">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 pt-6 pb-3">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1 text-purple-600">
                    🌕 {t('instruments.fullMoon.eyebrow')}
                  </p>
                  <h2 className="text-lg font-bold text-gray-900">{t('instruments.fullMoon.heading')}</h2>
                </div>
                <span className="shrink-0 mt-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700">
                  {t('instruments.paidLabel')}
                </span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{t('instruments.fullMoon.system')}</p>
            </div>

            {/* Part 1 — Self-report */}
            <div className="border-t border-gray-100 px-6 py-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                {t('instruments.fullMoon.part1.label')} · {t('instruments.fullMoon.part1.heading')}
              </p>
              <p className="text-xs text-gray-400 mb-3">{t('instruments.fullMoon.part1.meta')}</p>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{t('instruments.fullMoon.part1.body')}</p>
              <div className="flex flex-col gap-2">
                {t('instruments.fullMoon.part1.items', { returnObjects: true }).map((item, i) => (
                  <StaticItem key={i} prefix={t('instruments.fullMoon.part1.itemPrefix')} text={item} scaleMax={5} />
                ))}
              </div>
            </div>

            {/* Part 2 — Witness */}
            <div className="border-t border-gray-100 px-6 py-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                {p2.label} · {p2.heading}
              </p>
              <WitnessSection data={p2} />
            </div>

            {/* Part 3 — Cognitive */}
            <div className="border-t border-gray-100 px-6 py-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                {t('instruments.fullMoon.part3.label')} · {t('instruments.fullMoon.part3.heading')}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">{t('instruments.fullMoon.part3.body')}</p>
            </div>

            <div className="border-t border-gray-100 px-6 py-4">
              <Link
                to="/full-moon"
                className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1.5"
              >
                {t('instruments.fullMoon.heading')}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </main>
  )
}
