/**
 * LastQuarterPage — team report for a group.
 * Route: /groups/:id
 * Phase 13.2
 *
 * Sections:
 *  1. Team composition — toggle (My profile / Team average) + radar + dimension rows
 *                        + member list (icon cluster + name only)
 *  2. Balance analysis — group mean flags (unchanged)
 *  3. Team narrative   — deterministic decision tree text (unchanged)
 *  4. Share            — copy link + print/PDF (unchanged)
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { getGroupReportData } from '../lib/api'
import { computeRole } from '../utils/role-scoring'
import {
  computeGroupMeans,
  generateNarrative,
  balanceFlagForPBV,
  balanceFlagForC,
  balanceFlagForN,
  zscoresToRaw,
} from '../utils/team-narrative'
import { RoleIcon, LastQuarterIcon, DimensionIcon } from '../components/MoonIcons'
import RadarChart from '../components/RadarChart'
import { Card, Button, SectionLabel } from '../components/ui'
import { colors, ROLE_COLORS } from '../design/tokens'
import { DOMAIN_KEYS } from '../data/domains'

const BALANCE_COLOR = {
  balanced:     { bg: '#f0fdf4', text: '#166534' },
  tiltedHigh:   { bg: '#fef9c3', text: '#854d0e' },
  tiltedLow:    { bg: '#fef9c3', text: '#854d0e' },
  stronglyHigh: { bg: '#fee2e2', text: '#991b1b' },
  stronglyLow:  { bg: '#fee2e2', text: '#991b1b' },
  highGood:     { bg: '#f0fdf4', text: '#166534' },
  lowGood:      { bg: '#f0fdf4', text: '#166534' },
  lowCaution:   { bg: '#fee2e2', text: '#991b1b' },
  highCaution:  { bg: '#fee2e2', text: '#991b1b' },
}

const DOMAIN_BAR_COLOR = {
  presence:   'bg-amber-400',
  bond:       'bg-emerald-500',
  discipline: 'bg-blue-600',
  depth:      'bg-red-500',
  vision:     'bg-[#427c42]',
}

const DOMAIN_ICON_COLOR = {
  presence:   'text-amber-400',
  bond:       'text-emerald-500',
  discipline: 'text-blue-600',
  depth:      'text-red-500',
  vision:     'text-[#427c42]',
}

function BalancePill({ flag, t }) {
  const { bg, text } = BALANCE_COLOR[flag] ?? BALANCE_COLOR.balanced
  return (
    <span
      className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: bg, color: text }}
    >
      {t(`lastQuarter.balanceState.${flag}`)}
    </span>
  )
}

/**
 * DomainRows — compact dimension score rows below the radar.
 * scores: {presence, bond, vision, discipline, depth} on 1–5 scale.
 */
function DomainRows({ scores, t }) {
  return (
    <div className="flex flex-col divide-y divide-gray-100 mt-4">
      {DOMAIN_KEYS.map(key => {
        const raw = scores[key] ?? 1
        const pct = Math.round(((raw - 1) / 4) * 100)
        return (
          <div key={key} className="py-2.5 first:pt-0 last:pb-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-xs font-semibold flex items-center gap-1.5 ${DOMAIN_ICON_COLOR[key]}`}>
                <DimensionIcon domain={key} size={13} />
                <span style={{ color: colors.textPrimary }}>{t(`fmDomains.${key}.name`)}</span>
              </span>
              <span className="text-xs font-bold shrink-0 ml-2" style={{ color: colors.textPrimary }}>
                {Number(raw).toFixed(1)}
                <span className="font-normal" style={{ color: colors.textMuted }}>/5</span>
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${DOMAIN_BAR_COLOR[key]}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * MemberRow — member in the right-column list.
 * Shows role icon cluster (primary + up to 2 arc) with tooltips.
 * No role name text visible by default.
 */
function MemberRow({ member, t }) {
  const roleResult = member.completed && member.zscores
    ? computeRole(zscoresToRaw(member.zscores))
    : null

  const primaryRole = member.role
  const primaryColor = primaryRole ? (ROLE_COLORS[primaryRole] ?? colors.red) : null

  // Sort arc by probability descending, take up to 2
  const sortedArc = roleResult
    ? [...roleResult.arc].sort((a, b) => roleResult.probabilities[b] - roleResult.probabilities[a])
    : []
  const arcRole1 = sortedArc[0] ?? null
  const arcRole2 = sortedArc[1] ?? null

  return (
    <div className="flex items-center gap-3 py-3">
      {/* Icon cluster */}
      <div className="flex items-end gap-0.5 shrink-0">
        {primaryRole ? (
          <>
            <span
              title={t(`roles.${primaryRole}.name`)}
              style={{ cursor: 'help', display: 'inline-flex' }}
            >
              <RoleIcon role={primaryRole} size={30} style={{ color: primaryColor }} />
            </span>
            {arcRole1 && (
              <span
                title={t(`roles.${arcRole1}.name`)}
                style={{ cursor: 'help', display: 'inline-flex' }}
              >
                <RoleIcon
                  role={arcRole1}
                  size={20}
                  style={{ color: ROLE_COLORS[arcRole1] ?? colors.red, opacity: 0.7 }}
                />
              </span>
            )}
            {arcRole2 && (
              <span
                title={t(`roles.${arcRole2}.name`)}
                style={{ cursor: 'help', display: 'inline-flex' }}
              >
                <RoleIcon
                  role={arcRole2}
                  size={15}
                  style={{ color: ROLE_COLORS[arcRole2] ?? colors.red, opacity: 0.5 }}
                />
              </span>
            )}
          </>
        ) : (
          <div className="w-8 h-8 flex items-center justify-center">
            <span className="text-gray-300 select-none">·</span>
          </div>
        )}
      </div>

      {/* Name + self / pending */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold text-gray-900 truncate leading-snug">
            {member.display_name ?? '—'}
          </span>
          {member.is_self && (
            <span className="text-xs text-gray-400">({t('lastQuarter.selfLabel')})</span>
          )}
        </div>
        {!member.completed && (
          <span
            className="inline-block text-xs px-1.5 py-0.5 rounded mt-0.5"
            style={{ backgroundColor: '#f3f4f6', color: '#9ca3af' }}
          >
            {t('lastQuarter.pendingLabel')}
          </span>
        )}
      </div>
    </div>
  )
}

export default function LastQuarterPage() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const { t }       = useTranslation()
  const { user, loading: authLoading } = useAuth()

  const [data,      setData]      = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [copied,    setCopied]    = useState(false)
  const [radarMode, setRadarMode] = useState('teamAverage') // 'myProfile' | 'teamAverage'

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/auth'); return }

    getGroupReportData(id)
      .then(setData)
      .catch(err => {
        if (err.message?.includes('403')) {
          setError('notMember')
        } else {
          setError('generic')
        }
      })
      .finally(() => setLoading(false))
  }, [id, user, authLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // ── Loading ─────────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-sm text-gray-400">{t('lastQuarter.loading')}</p>
      </main>
    )
  }

  // ── Error ────────────────────────────────────────────────────────
  if (error) {
    return (
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-sm text-red-500">
          {error === 'notMember' ? t('lastQuarter.notMember') : t('lastQuarter.error')}
        </p>
      </main>
    )
  }

  const members         = data?.members ?? []
  const completedCount  = members.filter(m => m.completed && m.zscores && m.role).length
  const pendingCount    = members.length - members.filter(m => m.completed).length

  // Signed-in user's own scores
  const selfMember = members.find(m => m.is_self && m.completed && m.zscores)
  const selfScores = selfMember
    ? zscoresToRaw(selfMember.zscores)
    : null

  const groupMeans  = computeGroupMeans(members)

  // Team average scores
  const teamScores = groupMeans ? zscoresToRaw({
    presence:   groupMeans.p,
    bond:       groupMeans.b,
    vision:     groupMeans.v,
    discipline: groupMeans.c,
    depth:      groupMeans.n,
  }) : null

  // Active scores depend on toggle
  const activeScores = radarMode === 'myProfile' ? selfScores : teamScores

  // Balance flags (only if we have completed data)
  const flags = groupMeans ? {
    p: balanceFlagForPBV(groupMeans.p),
    b: balanceFlagForPBV(groupMeans.b),
    v: balanceFlagForPBV(groupMeans.v),
    c: balanceFlagForC(groupMeans.c),
    n: balanceFlagForN(groupMeans.n),
  } : null

  // Narrative keys
  const narrative = groupMeans ? generateNarrative(groupMeans) : null

  return (
    <main className="py-10 sm:py-16">
      <div className="w-full px-4 flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-start gap-3">
          <LastQuarterIcon size={32} style={{ color: colors.blue, flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">
              {t('lastQuarter.title')}
            </p>
            <h1 className="text-2xl font-bold text-gray-900">{data?.group_name}</h1>
          </div>
        </div>

        {/* ── Section 1: Team composition ── */}
        <Card className="shadow-sm p-6">
          <SectionLabel color="gray" className="mb-4">
            {t('lastQuarter.compositionHeading')}
          </SectionLabel>

          {completedCount > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

              {/* Left column: toggle + radar + dimension rows (2/3) */}
              <div className="md:col-span-2">
                {/* Toggle */}
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={radarMode === 'teamAverage' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setRadarMode('teamAverage')}
                  >
                    {t('lastQuarter.toggleTeamAverage')}
                  </Button>
                  <Button
                    variant={radarMode === 'myProfile' ? 'primary' : 'secondary'}
                    size="sm"
                    disabled={!selfScores}
                    onClick={() => selfScores && setRadarMode('myProfile')}
                  >
                    {t('lastQuarter.toggleMyProfile')}
                  </Button>
                </div>

                {/* Radar */}
                {activeScores && (
                  <RadarChart
                    scores={activeScores}
                    maxScore={5}
                    domainKeys={DOMAIN_KEYS}
                    labelFn={k => t(`fmDomains.${k}.name`)}
                  />
                )}

                {/* Dimension score rows */}
                {activeScores && <DomainRows scores={activeScores} t={t} />}
              </div>

              {/* Right column: member list (1/3) */}
              <div className="flex flex-col divide-y divide-gray-100">
                {members.map(m => (
                  <MemberRow key={m.user_id} member={m} t={t} />
                ))}
              </div>
            </div>
          ) : (
            // No one completed yet — just show member list
            <div className="flex flex-col divide-y divide-gray-100">
              {members.map(m => (
                <MemberRow key={m.user_id} member={m} t={t} />
              ))}
            </div>
          )}

          {pendingCount > 0 && (
            <p className="mt-4 text-xs text-gray-400 pt-3 border-t border-gray-100">
              {t('lastQuarter.pendingNote', { count: pendingCount })}
            </p>
          )}
        </Card>

        {/* ── Section 2: Balance analysis (unchanged) ── */}
        {flags && teamScores ? (
          <Card className="shadow-sm p-6">
            <SectionLabel color="gray" className="mb-4">
              {t('lastQuarter.balanceHeading')}
            </SectionLabel>

            <div className="flex flex-col gap-2 mb-6">
              {[
                { key: 'presence',   label: t('fmDomains.presence.name'),   flag: flags.p },
                { key: 'bond',       label: t('fmDomains.bond.name'),       flag: flags.b },
                { key: 'vision',     label: t('fmDomains.vision.name'),     flag: flags.v },
                { key: 'discipline', label: t('fmDomains.discipline.name'), flag: flags.c },
                { key: 'depth',      label: t('fmDomains.depth.name'),      flag: flags.n },
              ].map(({ key, label, flag }) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-gray-700">{label}</span>
                  <BalancePill flag={flag} t={t} />
                </div>
              ))}
            </div>

            <RadarChart
              scores={teamScores}
              maxScore={5}
              domainKeys={DOMAIN_KEYS}
              labelFn={k => t(`fmDomains.${k}.name`)}
            />
          </Card>
        ) : completedCount === 0 ? (
          <Card className="shadow-sm p-6 text-center">
            <p className="text-sm text-gray-400">
              {t('lastQuarter.pendingNote_plural', { count: members.length })}
            </p>
          </Card>
        ) : null}

        {/* ── Section 3: Team narrative (unchanged) ── */}
        {narrative && (
          <Card className="shadow-sm p-6">
            <SectionLabel color="gray" className="mb-4">
              {t('lastQuarter.narrativeHeading')}
            </SectionLabel>
            <div className="flex flex-col gap-5">
              {[
                { heading: t('lastQuarter.narrative.moveHeading'),     key: narrative.moveKey,     section: 'move' },
                { heading: t('lastQuarter.narrative.watchOutHeading'), key: narrative.watchOutKey, section: 'watchOut' },
                { heading: t('lastQuarter.narrative.helpHeading'),     key: narrative.helpKey,     section: 'help' },
              ].map(({ heading, key, section }) => (
                <div key={section}>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                    {heading}
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {t(`lastQuarter.narrative.${section}.${key}`)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ── Section 4: Share (unchanged) ── */}
        <Card className="shadow-sm p-6">
          <SectionLabel color="gray" className="mb-4">
            {t('lastQuarter.shareHeading')}
          </SectionLabel>
          <div className="flex gap-3 flex-wrap">
            <Button variant="secondary" onClick={handleCopyLink} className="gap-2">
              {copied ? t('lastQuarter.copied') : t('lastQuarter.copyLink')}
            </Button>
            <Button variant="secondary" onClick={() => window.print()} className="gap-2">
              {t('lastQuarter.downloadPdf')}
            </Button>
          </div>
        </Card>

      </div>
    </main>
  )
}
