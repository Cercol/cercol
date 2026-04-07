/**
 * RoleWheel — α/β 2D scatter showing all 9 roles + user position.
 * Phase 5.2.
 *
 * Axes (Digman 1997):
 *   α = (z_A + z_E − z_N) / 3   →  horizontal (socialisation)
 *   β = (z_C + z_O) / 2          →  vertical   (efficacy / growth)
 *
 * SVG coordinate convention: x = α, y = −β (SVG y-axis is inverted).
 * viewBox="−3 −3 6 6" — origin at centre; all theoretical centroids
 * and realistic user profiles fall well within ±2.5 on both axes.
 *
 * Props:
 *   result — return value of computeRole() from role-scoring.js
 */
import { useTranslation } from 'react-i18next'
import { ROLE_PROJECTIONS } from '../utils/role-scoring'
import { colors } from '../design/tokens'

// ── Axis geometry ─────────────────────────────────────────────────────────
const AXIS_REACH  = 2.65   // line endpoints
const LABEL_REACH = 2.72   // axis end-label positions

// ── Visual tiers ──────────────────────────────────────────────────────────
const RADIUS = { primary: 0.28, arc: 0.22, background: 0.18 }
const FILL   = {
  primary:    colors.primary,
  arc:        '#dbeafe',        // blue-100
  background: '#f3f4f6',        // gray-100
}
const STROKE = {
  primary:    colors.primaryDark,
  arc:        '#3b82f6',        // blue-500
  background: '#d1d5db',        // gray-300
}
const LABEL_COLOR = {
  primary:    colors.primary,
  arc:        '#1d4ed8',        // blue-700
  background: colors.textMuted,
}
const LABEL_SIZE   = { primary: 0.20, arc: 0.18, background: 0.17 }
const LABEL_WEIGHT = { primary: 'bold', arc: '600', background: 'normal' }

// ── Label placement ───────────────────────────────────────────────────────
// Offset the label in the direction away from the origin, scaled so the
// text anchor point is just outside the dot boundary.
function labelPlacement(alpha, beta, radius) {
  const dist = Math.sqrt(alpha * alpha + beta * beta)

  // Near-origin (R0): place up-right at a fixed offset
  if (dist < 0.15) {
    const d = radius + 0.14
    return { lx: d, ly: -d, anchor: 'start' }
  }

  const scale = (radius + 0.22) / dist
  const lx = alpha * scale
  const ly = -beta * scale   // SVG y-axis inversion

  // Text anchor: follow horizontal direction
  const anchor = Math.abs(lx) < 0.06 ? 'middle' : lx > 0 ? 'start' : 'end'
  return { lx, ly, anchor }
}

// Render order: background → arc → primary (so primary is always on top)
const LAYERS = ['background', 'arc', 'primary']

export default function RoleWheel({ result }) {
  const { t } = useTranslation()
  const { role: primaryRole, arc, alpha: userAlpha, beta: userBeta } = result

  // Clamp user position to keep it within the visible viewport
  const ux = Math.max(-2.5, Math.min(2.5,  userAlpha))
  const uy = Math.max(-2.5, Math.min(2.5, -userBeta))   // SVG inversion

  return (
    <div>
      <svg
        viewBox="-3 -3 6 6"
        className="w-full max-w-xs mx-auto block"
        aria-hidden="true"
      >
        {/* ── Grid axes ── */}
        <line
          x1={-AXIS_REACH} y1="0" x2={AXIS_REACH} y2="0"
          stroke="#e5e7eb" strokeWidth="0.04"
        />
        <line
          x1="0" y1={-AXIS_REACH} x2="0" y2={AXIS_REACH}
          stroke="#e5e7eb" strokeWidth="0.04"
        />

        {/* ── Axis end labels ── */}
        <text x={ LABEL_REACH} y="0.28" textAnchor="end"   fontSize="0.22" fill="#9ca3af">+α</text>
        <text x={-LABEL_REACH} y="0.28" textAnchor="start" fontSize="0.22" fill="#9ca3af">−α</text>
        <text x="0.12" y={-LABEL_REACH + 0.15} textAnchor="start" fontSize="0.22" fill="#9ca3af">+β</text>
        <text x="0.12" y={ LABEL_REACH - 0.05} textAnchor="start" fontSize="0.22" fill="#9ca3af">−β</text>

        {/* ── Role dots + labels, rendered back-to-front ── */}
        {LAYERS.flatMap(layer =>
          Object.entries(ROLE_PROJECTIONS)
            .filter(([r]) => {
              const isPrimary = r === primaryRole
              const isArc     = arc.includes(r)
              if (layer === 'primary')    return isPrimary
              if (layer === 'arc')        return isArc && !isPrimary
              return !isPrimary && !isArc
            })
            .map(([r, { alpha, beta }]) => {
              const isPrimary = r === primaryRole
              const isArc     = arc.includes(r)
              const tier      = isPrimary ? 'primary' : isArc ? 'arc' : 'background'

              const cx = alpha
              const cy = -beta
              const { lx, ly, anchor } = labelPlacement(alpha, beta, RADIUS[tier])

              return (
                <g key={r}>
                  <circle
                    cx={cx} cy={cy}
                    r={RADIUS[tier]}
                    fill={FILL[tier]}
                    stroke={STROKE[tier]}
                    strokeWidth="0.04"
                  />
                  <text
                    x={cx + lx} y={cy + ly}
                    textAnchor={anchor}
                    dominantBaseline="middle"
                    fontSize={LABEL_SIZE[tier]}
                    fill={LABEL_COLOR[tier]}
                    fontWeight={LABEL_WEIGHT[tier]}
                  >
                    {t(`roles.${r}.name`)}
                  </text>
                </g>
              )
            })
        )}

        {/* ── User position: outer ring + inner dot ── */}
        <circle
          cx={ux} cy={uy}
          r="0.20"
          fill="none"
          stroke={colors.warning}
          strokeWidth="0.07"
        />
        <circle
          cx={ux} cy={uy}
          r="0.08"
          fill={colors.warning}
          stroke="none"
        />
      </svg>

      {/* ── Legend ── */}
      <p className="flex items-center justify-center gap-1.5 mt-2 text-xs" style={{ color: colors.textMuted }}>
        <svg width="14" height="14" viewBox="-1 -1 2 2" aria-hidden="true">
          <circle cx="0" cy="0" r="0.75" fill="none" stroke={colors.warning} strokeWidth="0.28" />
          <circle cx="0" cy="0" r="0.3"  fill={colors.warning} stroke="none" />
        </svg>
        {t('roles.you')}
      </p>
    </div>
  )
}
