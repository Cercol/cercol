/**
 * RolesPage — deep documentation page at /roles.
 * No auth required. Twelve roles with OCEAN profiles, beta disclaimer,
 * honest limitations, and an invitation to critique the model.
 */
import { useTranslation } from 'react-i18next'
import { Card, SectionLabel } from '../components/ui'
import { RoleIcon } from '../components/MoonIcons'

const ROLES = [
  { key: 'R01', accent: 'text-emerald-600', bg: 'bg-emerald-50' }, // Dolphin  P+ B+
  { key: 'R02', accent: 'text-red-500',     bg: 'bg-red-50'     }, // Wolf     P+ B-
  { key: 'R03', accent: 'text-teal-600',    bg: 'bg-teal-50'    }, // Elephant P- B+
  { key: 'R04', accent: 'text-slate-600',   bg: 'bg-slate-50'   }, // Owl      P- B-
  { key: 'R05', accent: 'text-amber-500',   bg: 'bg-amber-50'   }, // Eagle    P+ V+
  { key: 'R06', accent: 'text-orange-500',  bg: 'bg-orange-50'  }, // Falcon   P+ V-
  { key: 'R07', accent: 'text-[#427c42]',   bg: 'bg-[#eaf2ea]'  }, // Octopus  P- V+
  { key: 'R08', accent: 'text-stone-600',   bg: 'bg-stone-50'   }, // Tortoise P- V-
  { key: 'R09', accent: 'text-yellow-600',  bg: 'bg-yellow-50'  }, // Bee      B+ V+
  { key: 'R10', accent: 'text-amber-800',   bg: 'bg-amber-100'  }, // Bear     B+ V-
  { key: 'R11', accent: 'text-[#427c42]',   bg: 'bg-[#eaf2ea]'  }, // Fox      B- V+
  { key: 'R12', accent: 'text-gray-600',    bg: 'bg-gray-50'    }, // Badger   B- V-
]

function RoleCard({ roleKey, accent, bg, t }) {
  const name = t(`roles.${roleKey}.name`)
  const ca   = t(`roles.${roleKey}.ca`)
  const essence     = t(`roles.${roleKey}.essence`)
  const profile     = t(`roles.${roleKey}.profile`)
  const contributes = t(`roles.${roleKey}.contributes`)
  const misses      = t(`roles.${roleKey}.misses`)

  return (
    <Card className="overflow-hidden">
      <div className={`px-5 pt-5 pb-4 ${bg} flex items-start gap-3`}>
        <RoleIcon role={roleKey} size={28} className={`shrink-0 mt-0.5 ${accent}`} />
        <div>
          <p className={`text-xs font-bold uppercase tracking-widest mb-0.5 ${accent}`}>
            {name}{ca !== name ? ` · ${ca}` : ''}
          </p>
          <p className="text-sm font-medium text-gray-800 leading-snug">{essence}</p>
        </div>
      </div>
      <div className="px-5 py-4 flex flex-col gap-3">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
            {t('rolesPage.grid.profileLabel')}
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">{profile}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
            {t('rolesPage.grid.contributesLabel')}
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">{contributes}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
            {t('rolesPage.grid.missesLabel')}
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">{misses}</p>
        </div>
      </div>
    </Card>
  )
}

function InfoBox({ heading, body, accent = 'text-gray-900' }) {
  return (
    <Card className="px-6 py-5">
      <h3 className={`text-sm font-bold mb-2 ${accent}`}>{heading}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
    </Card>
  )
}

export default function RolesPage() {
  const { t } = useTranslation()

  return (
    <main className="py-12">

        {/* ── Intro ─────────────────────────────────────────────── */}
        <section className="mb-12">
          <SectionLabel color="gray" className="mb-3">
            {t('nav.roles')}
          </SectionLabel>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('rolesPage.intro.heading')}
          </h1>
          <p className="text-base text-gray-600 leading-relaxed mb-3">
            {t('rolesPage.intro.body1')}
          </p>
          <p className="text-sm text-gray-500 leading-relaxed">
            {t('rolesPage.intro.body2')}
          </p>
        </section>

        {/* ── Beta disclaimer ───────────────────────────────────── */}
        <section className="mb-12">
          <div className="bg-amber-50 border border-amber-200 rounded px-6 py-5">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">
              Beta
            </p>
            <p className="text-sm font-semibold text-gray-900 mb-1">{t('rolesPage.beta.heading')}</p>
            <p className="text-sm text-gray-600 leading-relaxed">{t('rolesPage.beta.body')}</p>
          </div>
        </section>

        {/* ── Roles grid ────────────────────────────────────────── */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {t('rolesPage.grid.heading')}
          </h2>
          <div className="flex flex-col gap-4">
            {ROLES.map(({ key, accent, bg }) => (
              <RoleCard key={key} roleKey={key} accent={accent} bg={bg} t={t} />
            ))}
          </div>
        </section>

        {/* ── Context notes ─────────────────────────────────────── */}
        <section className="mb-12 flex flex-col gap-3">
          <InfoBox
            heading={t('rolesPage.centreNote.heading')}
            body={t('rolesPage.centreNote.body')}
          />
          <InfoBox
            heading={t('rolesPage.arcNote.heading')}
            body={t('rolesPage.arcNote.body')}
          />
          <InfoBox
            heading={t('rolesPage.contextNote.heading')}
            body={t('rolesPage.contextNote.body')}
          />
        </section>

        {/* ── Critique CTA ──────────────────────────────────────── */}
        <Card className="px-6 py-6">
          <h2 className="text-base font-bold text-gray-900 mb-2">
            {t('rolesPage.critique.heading')}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            {t('rolesPage.critique.body')}
          </p>
          <a
            href="https://github.com/miquelmatoses/cercol/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1.5"
          >
            {t('rolesPage.critique.cta')}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
          </a>
        </Card>

    </main>
  )
}
