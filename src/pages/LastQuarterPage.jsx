/**
 * LastQuarterPage — team report for a group.
 * Route: /groups/:id
 * Phase 13.5
 *
 * Layout:
 *  Top card   — 3-col grid [40/30/30]: radar+toggle | dimension rows | member list
 *  Bottom row — 2-col grid [50/50]: balance analysis | team narrative
 *  Footer     — share (print-hidden)
 */
import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { getGroupReportData } from '../lib/api'
import { computeRole } from '../utils/role-scoring'
import {
  computeGroupMeans,
  computeDimensionAnalysis,
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

const DOMAIN_BAR_HEX = {
  presence:   '#fbbf24', // amber-400
  bond:       '#10b981', // emerald-500
  discipline: '#2563eb', // blue-600
  depth:      '#ef4444', // red-500
  vision:     '#427c42', // brand green
}

const DOMAIN_ICON_COLOR = {
  presence:   'text-amber-400',
  bond:       'text-emerald-500',
  discipline: 'text-blue-600',
  depth:      'text-red-500',
  vision:     'text-[#427c42]',
}

/**
 * IconTooltip — CSS tooltip that appears after ~300 ms hover, cursor stays default.
 */
function IconTooltip({ label, children }) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef(null)

  function show() { timerRef.current = setTimeout(() => setVisible(true), 300) }
  function hide()  { clearTimeout(timerRef.current); setVisible(false) }

  return (
    <span
      className="relative inline-flex"
      style={{ cursor: 'default' }}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}
      {visible && (
        <span
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5
                     bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap
                     pointer-events-none z-50"
        >
          {label}
        </span>
      )}
    </span>
  )
}

function BalancePill({ flag, t }) {
  const { bg, text } = BALANCE_COLOR[flag] ?? BALANCE_COLOR.balanced
  return (
    <span
      className="inline-block text-xs font-semibold px-1.5 py-0.5 rounded-full shrink-0"
      style={{ backgroundColor: bg, color: text }}
    >
      {t(`lastQuarter.balanceState.${flag}`)}
    </span>
  )
}

/**
 * DomainRows — 5 stacked dimension score rows (one per domain).
 * Print fix: bar fill uses inline background-color + print-color-adjust so colors survive print.
 */
function DomainRows({ scores, t }) {
  return (
    <div className="flex flex-col divide-y divide-gray-100">
      {DOMAIN_KEYS.map(key => {
        const raw = scores[key] ?? 1
        const pct = Math.round(((raw - 1) / 4) * 100)
        return (
          <div key={key} className="py-1.5 first:pt-0 last:pb-0">
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-semibold flex items-center gap-1 ${DOMAIN_ICON_COLOR[key]}`}>
                <DimensionIcon domain={key} size={11} />
                <span style={{ color: colors.textPrimary }}>{t(`fmDomains.${key}.name`)}</span>
              </span>
              <span className="text-xs font-bold shrink-0 ml-1.5" style={{ color: colors.textPrimary }}>
                {Number(raw).toFixed(1)}
              </span>
            </div>
            {/* Track */}
            <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#f3f4f6' }}>
              {/* Fill — inline backgroundColor + print-color-adjust ensures bars print */}
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  backgroundColor: DOMAIN_BAR_HEX[key],
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * MemberRow — compact member row with icon cluster + name.
 */
function MemberRow({ member, t }) {
  const roleResult = member.completed && member.zscores
    ? computeRole(zscoresToRaw(member.zscores))
    : null

  const primaryRole  = member.role
  const primaryColor = primaryRole ? (ROLE_COLORS[primaryRole] ?? colors.red) : null

  const sortedArc = roleResult
    ? [...roleResult.arc].sort((a, b) => roleResult.probabilities[b] - roleResult.probabilities[a])
    : []
  const arcRole1 = sortedArc[0] ?? null
  const arcRole2 = sortedArc[1] ?? null

  return (
    <div className="flex items-center gap-2 py-1.5">
      {/* Icon cluster */}
      <div className="flex items-end gap-0.5 shrink-0">
        {primaryRole ? (
          <>
            <IconTooltip label={t(`roles.${primaryRole}.name`)}>
              <RoleIcon role={primaryRole} size={26} style={{ color: primaryColor }} />
            </IconTooltip>
            {arcRole1 && (
              <IconTooltip label={t(`roles.${arcRole1}.name`)}>
                <RoleIcon role={arcRole1} size={18} style={{ color: ROLE_COLORS[arcRole1] ?? colors.red, opacity: 0.7 }} />
              </IconTooltip>
            )}
            {arcRole2 && (
              <IconTooltip label={t(`roles.${arcRole2}.name`)}>
                <RoleIcon role={arcRole2} size={13} style={{ color: ROLE_COLORS[arcRole2] ?? colors.red, opacity: 0.5 }} />
              </IconTooltip>
            )}
          </>
        ) : (
          <div className="w-7 h-7 flex items-center justify-center">
            <span className="text-gray-300 select-none">·</span>
          </div>
        )}
      </div>

      {/* Name + self / pending */}
      <div className="flex-1 min-w-0 flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-semibold text-gray-900 truncate leading-snug">
          {member.display_name ?? '—'}
        </span>
        {member.is_self && (
          <span className="text-xs text-gray-400">({t('lastQuarter.selfLabel')})</span>
        )}
        {!member.completed && (
          <span
            className="inline-block text-xs px-1.5 py-0.5 rounded"
            style={{ backgroundColor: '#f3f4f6', color: '#9ca3af' }}
          >
            {t('lastQuarter.pendingLabel')}
          </span>
        )}
      </div>
    </div>
  )
}

/** Balance analysis content (used inside a card in the bottom row). */
function BalanceContent({ dimAnalysis, completedCount, members, t }) {
  if (!dimAnalysis || dimAnalysis.length === 0) {
    if (completedCount === 0) {
      return (
        <p className="text-xs text-gray-400">
          {t('lastQuarter.pendingNote_plural', { count: members.length })}
        </p>
      )
    }
    return null
  }

  return (
    <div className="flex flex-col divide-y divide-gray-100">
      {dimAnalysis.map(({ dim, meanZ, flag, topMember, compensatingMember, suggestedRole, suggestedRoles }) => {
        const isPBV    = dim === 'presence' || dim === 'bond' || dim === 'vision'
        const isTilted = Math.abs(meanZ) >= 0.5

        let noteKey = null
        if (dim === 'discipline' && flag === 'lowCaution')  noteKey = 'c_low'
        else if (dim === 'depth' && flag === 'highCaution') noteKey = 'n_high'

        const hasExtra = noteKey || (isPBV && isTilted && (compensatingMember || suggestedRole)) || suggestedRoles?.length

        return (
          <div key={dim} className="py-2 first:pt-0 last:pb-0">
            {/* Single-line: icon + name + pill + top contributor */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`flex items-center gap-1 shrink-0 ${DOMAIN_ICON_COLOR[dim]}`}>
                <DimensionIcon domain={dim} size={13} />
              </span>
              <span className="text-xs font-semibold text-gray-800 shrink-0">
                {t(`fmDomains.${dim}.name`)}
              </span>
              <BalancePill flag={flag} t={t} />
              {topMember?.role && (
                <span className="flex items-center gap-1 text-xs text-gray-500 ml-auto shrink-0">
                  <span className="text-gray-400">{t('lastQuarter.balance.topContributor')}</span>
                  <RoleIcon role={topMember.role} size={14} style={{ color: ROLE_COLORS[topMember.role] ?? colors.red }} />
                  <span className="font-medium text-gray-700">
                    {topMember.display_name?.split(' ')[0] ?? topMember.display_name}
                  </span>
                </span>
              )}
            </div>

            {/* Expanded note — only when tilted/caution */}
            {hasExtra && (
              <div className="mt-1 ml-5 flex flex-col gap-0.5">
                {noteKey && (
                  <p className="text-xs text-gray-500 leading-snug">
                    {t(`lastQuarter.balance.notes.${noteKey}`)}
                  </p>
                )}

                {isPBV && isTilted && compensatingMember?.role && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <RoleIcon role={compensatingMember.role} size={14} style={{ color: ROLE_COLORS[compensatingMember.role] ?? colors.red }} />
                    <span className="font-medium text-gray-700">
                      {compensatingMember.display_name?.split(' ')[0] ?? compensatingMember.display_name}
                    </span>
                    <span>{t('lastQuarter.balance.compensates')}</span>
                  </div>
                )}

                {isPBV && isTilted && suggestedRole && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <RoleIcon role={suggestedRole} size={14} style={{ color: ROLE_COLORS[suggestedRole] ?? colors.red }} />
                    <span>{t('lastQuarter.balance.suggestRole', { role: t(`roles.${suggestedRole}.name`) })}</span>
                  </div>
                )}

                {suggestedRoles?.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 flex-wrap">
                    <span>{t('lastQuarter.balance.suggestRoles')}</span>
                    {suggestedRoles.map(r => (
                      <IconTooltip key={r} label={t(`roles.${r}.name`)}>
                        <RoleIcon role={r} size={14} style={{ color: ROLE_COLORS[r] ?? colors.red }} />
                      </IconTooltip>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/** Narrative content (used inside a card in the bottom row). */
function NarrativeContent({ narrative, t }) {
  if (!narrative) return null
  return (
    <div className="flex flex-col gap-3">
      {[
        { heading: t('lastQuarter.narrative.moveHeading'),     key: narrative.moveKey,     section: 'move' },
        { heading: t('lastQuarter.narrative.watchOutHeading'), key: narrative.watchOutKey, section: 'watchOut' },
        { heading: t('lastQuarter.narrative.helpHeading'),     key: narrative.helpKey,     section: 'help' },
      ].map(({ heading, key, section }) => (
        <div key={section}>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">
            {heading}
          </p>
          <p className="text-xs text-gray-700 leading-relaxed">
            {t(`lastQuarter.narrative.${section}.${key}`)}
          </p>
        </div>
      ))}
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

  const members        = data?.members ?? []
  const completedCount = members.filter(m => m.completed && m.zscores && m.role).length
  const pendingCount   = members.length - members.filter(m => m.completed).length

  const selfMember = members.find(m => m.is_self && m.completed && m.zscores)
  const selfScores = selfMember ? zscoresToRaw(selfMember.zscores) : null

  const groupMeans = computeGroupMeans(members)

  // Dev: log z-scores to verify balance classification
  if (import.meta.env.DEV && groupMeans) {
    console.log('[LastQuarter] group mean z-scores:', {
      presence:   groupMeans.p.toFixed(3),
      bond:       groupMeans.b.toFixed(3),
      vision:     groupMeans.v.toFixed(3),
      discipline: groupMeans.c.toFixed(3),
      depth:      groupMeans.n.toFixed(3),
    })
    console.log('[LastQuarter] balance flags:', {
      presence:   balanceFlagForPBV(groupMeans.p),
      bond:       balanceFlagForPBV(groupMeans.b),
      vision:     balanceFlagForPBV(groupMeans.v),
      discipline: balanceFlagForC(groupMeans.c),
      depth:      balanceFlagForN(groupMeans.n),
    })
  }

  const teamScores = groupMeans ? zscoresToRaw({
    presence:   groupMeans.p,
    bond:       groupMeans.b,
    vision:     groupMeans.v,
    discipline: groupMeans.c,
    depth:      groupMeans.n,
  }) : null

  const activeScores = radarMode === 'myProfile' ? selfScores : teamScores

  const dimAnalysis = groupMeans ? computeDimensionAnalysis(members, groupMeans) : null
  const narrative   = groupMeans ? generateNarrative(groupMeans) : null

  return (
    <main className="py-6 sm:py-10 print:py-4">
      <div className="w-full px-4 flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-start gap-3">
          <LastQuarterIcon size={28} style={{ color: colors.blue, flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">
              {t('lastQuarter.title')}
            </p>
            <h1 className="text-xl font-bold text-gray-900">{data?.group_name}</h1>
          </div>
        </div>

        {/* ── Top card: 3-column [40/30/30] ── */}
        <Card className="shadow-sm p-4">
          <SectionLabel color="gray" className="mb-3">
            {t('lastQuarter.compositionHeading')}
          </SectionLabel>

          {completedCount > 0 ? (
            <div className="lq-top-grid grid grid-cols-1 md:grid-cols-[4fr_3fr_3fr] gap-4 items-start">

              {/* Col 1 (40%): toggle + radar */}
              <div>
                <div className="flex gap-2 mb-3">
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
                {activeScores && (
                  <RadarChart
                    scores={activeScores}
                    maxScore={5}
                    domainKeys={DOMAIN_KEYS}
                    labelFn={k => t(`fmDomains.${k}.name`)}
                  />
                )}
              </div>

              {/* Col 2 (30%): dimension score rows */}
              <div className="md:border-l md:border-gray-100 md:pl-4">
                {activeScores && <DomainRows scores={activeScores} t={t} />}
              </div>

              {/* Col 3 (30%): member list */}
              <div className="flex flex-col divide-y divide-gray-100 md:border-l md:border-gray-100 md:pl-4">
                {members.map(m => (
                  <MemberRow key={m.user_id} member={m} t={t} />
                ))}
              </div>
            </div>
          ) : (
            /* No completed members — just show the member list */
            <div className="flex flex-col divide-y divide-gray-100">
              {members.map(m => (
                <MemberRow key={m.user_id} member={m} t={t} />
              ))}
            </div>
          )}

          {pendingCount > 0 && (
            <p className="mt-3 text-xs text-gray-400 pt-2 border-t border-gray-100">
              {t('lastQuarter.pendingNote', { count: pendingCount })}
            </p>
          )}
        </Card>

        {/* ── Bottom row: 2-column [50/50] ── */}
        {(dimAnalysis?.length > 0 || narrative) && (
          <div className="lq-bottom-grid grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

            {/* Col 1: Balance analysis */}
            <Card className="shadow-sm p-4 h-full">
              <SectionLabel color="gray" className="mb-3">
                {t('lastQuarter.balanceHeading')}
              </SectionLabel>
              <BalanceContent
                dimAnalysis={dimAnalysis}
                completedCount={completedCount}
                members={members}
                t={t}
              />
            </Card>

            {/* Col 2: Team narrative */}
            {narrative && (
              <Card className="shadow-sm p-4 h-full">
                <SectionLabel color="gray" className="mb-3">
                  {t('lastQuarter.narrativeHeading')}
                </SectionLabel>
                <NarrativeContent narrative={narrative} t={t} />
              </Card>
            )}
          </div>
        )}

        {/* ── Share ── */}
        <Card className="shadow-sm p-4 print:hidden">
          <SectionLabel color="gray" className="mb-3">
            {t('lastQuarter.shareHeading')}
          </SectionLabel>
          <div className="flex gap-3 flex-wrap">
            <Button variant="secondary" size="sm" onClick={handleCopyLink}>
              {copied ? t('lastQuarter.copied') : t('lastQuarter.copyLink')}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => window.print()}>
              {t('lastQuarter.downloadPdf')}
            </Button>
          </div>
        </Card>

      </div>
    </main>
  )
}
