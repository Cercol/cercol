/**
 * SharePage — public, prerendered share landing at /share/<roleId>.
 *
 * Purpose: a shared result link previews the user's animal. The 12 routes
 * /share/R01../share/R12 are prerendered, each with its per-role og:image
 * (public/og/role-<roleId>.png) and share title baked in, so social/AI
 * crawlers (which do not run JS) see the right card.
 *
 * The scores ride in ?r=<encodedScores>; when present the role is recomputed
 * from them (authoritative) and the page shows that role. Without ?r= (the
 * prerendered shell, or a bare link) it falls back to the path role.
 *
 * No account, no API: a low-friction bridge to the free test.
 */
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import usePageMeta from '../hooks/usePageMeta'
import { decodeScores } from '../utils/share-url'
import { computeRole } from '../utils/role-scoring'
import { isRoleId, roleOgImage } from '../utils/role-share'
import RoleCard from '../components/report/RoleCard'

export default function SharePage() {
  const { roleId: raw } = useParams()
  const { t } = useTranslation()
  const [params] = useSearchParams()

  const encoded = params.get('r')
  const scores = encoded ? decodeScores(encoded) : null
  // Scores are authoritative; the path role is the fallback for the shell.
  const roleId = scores ? computeRole(scores).role : (isRoleId(raw) ? raw : 'R01')
  const name = t(`roles.${roleId}.name`)
  const essence = t(`roles.${roleId}.essence`)

  usePageMeta({
    title: t('share.title', { role: name }),
    description: t('share.tagline'),
    image: roleOgImage(roleId),
    path: `/share/${roleId}/`,
  })

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 sm:py-16 flex flex-col gap-8">
      <RoleCard role={roleId} roleName={name} roleEssence={essence} />
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-4">{t('share.tagline')}</p>
        <Link
          to="/new-moon"
          className="font-semibold inline-flex items-center justify-center transition-colors rounded text-sm px-5 py-2.5 bg-[var(--mm-color-blue)] text-white hover:opacity-90"
        >
          {t('share.cta')}
        </Link>
      </div>
    </main>
  )
}
