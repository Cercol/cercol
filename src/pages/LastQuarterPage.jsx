/**
 * LastQuarterPage — team report for a group.
 * Route: /groups/:id
 * Phase 13.1 — two-column layout: multi-member radar (left 2/3)
 *              + member list with hover-linked highlight (right 1/3).
 *
 * Sections:
 *  1. Team composition — multi-series radar + hoverable member list
 *  2. Balance analysis — group mean z-scores + single-series RadarChart
 *  3. Team narrative   — deterministic decision tree text
 *  4. Share            — copy link + print/PDF
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
import { RoleIcon, LastQuarterIcon } from '../components/MoonIcons'
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
 * ArcIcon — single arc role icon with a native tooltip showing the role name.
 */
function ArcIcon({ role, t }) {
  return (
    <span title={t(`roles.${role}.name`)} style={{ cursor: 'help', display: 'inline-flex' }}>
      <RoleIcon role={role} size={16} style={{ color: '#b0b8c4' }} />
    </span>
  )
}

/**
 * MemberRow — one member in the right-column list.
 * Triggers radar highlight on hover (completed members only).
 */
function MemberRow({ member, color, isHovered, onMouseEnter, onMouseLeave, t }) {
  const arc = member.completed && member.zscores
    ? computeRole(zscoresToRaw(member.zscores)).arc
    : []

  return (
    <div
      className="flex items-center gap-3 py-3 rounded px-2 -mx-2 transition-colors"
      style={{
        backgroundColor: isHovered && color ? color + '18' : 'transparent',
        cursor: member.completed ? 'default' : 'default',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Role avatar */}
      <div
        className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: member.completed && color ? color + '22' : '#f3f4f6',
        }}
      >
        {member.completed && member.role
          ? <RoleIcon role={member.role} size={22} style={{ color: color ?? colors.red }} />
          : <span className="text-gray-300 text-base select-none">·</span>
        }
      </div>

      {/* Name + role + arc */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold text-gray-900 truncate leading-snug">
            {member.display_name ?? '—'}
          </span>
          {member.is_self && (
            <span className="text-xs text-gray-400">({t('lastQuarter.selfLabel')})</span>
          )}
        </div>

        {member.completed && member.role ? (
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="text-xs text-gray-500">{t(`roles.${member.role}.name`)}</span>
            {arc.length > 0 && (
              <span className="flex items-center gap-1">
                {arc.map(r => <ArcIcon key={r} role={r} t={t} />)}
              </span>
            )}
          </div>
        ) : (
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
  const { t, i18n } = useTranslation() // eslint-disable-line no-unused-vars
  const { user, loading: authLoading } = useAuth()

  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [copied,  setCopied]  = useState(false)

  // Hover state: user_id of the highlighted member, or null
  const [hoveredMember, setHoveredMember] = useState(null)

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

  const members        = data?.members ?? []
  const completedMembers = members.filter(m => m.completed && m.zscores && m.role)
  const completedCount = completedMembers.length
  const pendingCount   = members.length - completedCount

  // Multi-series radar: one shape per completed member
  const radarSeries = completedMembers.map(m => ({
    id:     m.user_id,
    scores: zscoresToRaw(m.zscores),
    color:  ROLE_COLORS[m.role] ?? colors.red,
    opacity: hoveredMember === null
      ? 0.5
      : hoveredMember === m.user_id ? 1.0 : 0.15,
  }))

  const groupMeans = computeGroupMeans(members)

  // Balance flags
  const flags = groupMeans ? {
    p: balanceFlagForPBV(groupMeans.p),
    b: balanceFlagForPBV(groupMeans.b),
    v: balanceFlagForPBV(groupMeans.v),
    c: balanceFlagForC(groupMeans.c),
    n: balanceFlagForN(groupMeans.n),
  } : null

  // Narrative keys
  const narrative = groupMeans ? generateNarrative(groupMeans) : null

  // Balance radar (group mean)
  const radarScores = groupMeans ? zscoresToRaw({
    presence:   groupMeans.p,
    bond:       groupMeans.b,
    vision:     groupMeans.v,
    discipline: groupMeans.c,
    depth:      groupMeans.n,
  }) : null

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

        {/* ── Section 1: Two-column team composition ── */}
        <Card className="shadow-sm p-6">
          <SectionLabel color="gray" className="mb-4">
            {t('lastQuarter.compositionHeading')}
          </SectionLabel>

          {completedCount > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

              {/* Left column: multi-member radar (2/3) */}
              <div className="md:col-span-2">
                <RadarChart
                  series={radarSeries}
                  maxScore={5}
                  domainKeys={DOMAIN_KEYS}
                  labelFn={k => t(`fmDomains.${k}.name`)}
                />
              </div>

              {/* Right column: member list (1/3) */}
              <div className="flex flex-col divide-y divide-gray-100">
                {members.map(m => {
                  const color = m.completed && m.role ? ROLE_COLORS[m.role] ?? colors.red : null
                  return (
                    <MemberRow
                      key={m.user_id}
                      member={m}
                      color={color}
                      isHovered={hoveredMember === m.user_id}
                      onMouseEnter={m.completed ? () => setHoveredMember(m.user_id) : undefined}
                      onMouseLeave={m.completed ? () => setHoveredMember(null) : undefined}
                      t={t}
                    />
                  )
                })}
              </div>
            </div>
          ) : (
            // No one completed yet — just show member list
            <div className="flex flex-col divide-y divide-gray-100">
              {members.map(m => (
                <MemberRow
                  key={m.user_id}
                  member={m}
                  color={null}
                  isHovered={false}
                  t={t}
                />
              ))}
            </div>
          )}

          {pendingCount > 0 && (
            <p className="mt-4 text-xs text-gray-400 pt-3 border-t border-gray-100">
              {t('lastQuarter.pendingNote', { count: pendingCount })}
            </p>
          )}
        </Card>

        {/* ── Section 2: Balance analysis ── */}
        {flags && radarScores ? (
          <Card className="shadow-sm p-6">
            <SectionLabel color="gray" className="mb-4">
              {t('lastQuarter.balanceHeading')}
            </SectionLabel>

            {/* Dimension flags */}
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

            {/* Group mean radar */}
            <RadarChart
              scores={radarScores}
              maxScore={5}
              domainKeys={DOMAIN_KEYS}
              labelFn={k => t(`fmDomains.${k}.name`)}
            />
          </Card>
        ) : completedCount === 0 ? (
          <Card className="shadow-sm p-6 text-center">
            <p className="text-sm text-gray-400">{t('lastQuarter.pendingNote_plural', { count: members.length })}</p>
          </Card>
        ) : null}

        {/* ── Section 3: Team narrative ── */}
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

        {/* ── Section 4: Share ── */}
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
