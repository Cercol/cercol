/**
 * RadarChart — domain spider chart using Recharts.
 * Phase 10.15: circular grid rings, organic cubic-bezier shape, radial gradient fill.
 *
 * Props:
 *   scores      {Record<string, number>} — domain → score
 *   maxScore    {number}                 — top of scale (5 for WC, 7 for New Moon)
 *   domainKeys  {string[]}               — ordered list of domain keys (required)
 *   labelFn     {(key: string) => string} — maps a domain key to its display label (required)
 */
import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { colors } from '../design/tokens'

function scoreToPercent(score, maxScore) {
  return Math.round(((score - 1) / (maxScore - 1)) * 100)
}

/** Catmull-Rom → cubic Bézier closed path through an array of {x, y} points. */
function smoothClosedPath(points, tension = 0.4) {
  if (!points || points.length < 3) return ''
  const n = points.length
  const p = (i) => points[((i % n) + n) % n]
  let d = `M ${p(0).x} ${p(0).y}`
  for (let i = 0; i < n; i++) {
    const p0 = p(i - 1)
    const p1 = p(i)
    const p2 = p(i + 1)
    const p3 = p(i + 2)
    const cp1x = p1.x + (tension * (p2.x - p0.x)) / 2
    const cp1y = p1.y + (tension * (p2.y - p0.y)) / 2
    const cp2x = p2.x - (tension * (p3.x - p1.x)) / 2
    const cp2y = p2.y - (tension * (p3.y - p1.y)) / 2
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }
  return d + ' Z'
}

/** Organic radar fill: smooth cubic-bezier shape with moon-like radial gradient. */
function OrganicRadarShape({ points, cx, cy, outerRadius, stroke, strokeWidth }) {
  if (!points || points.length === 0) return null
  const d = smoothClosedPath(points)
  return (
    <g>
      <defs>
        <radialGradient
          id="cercol-radar-grad"
          gradientUnits="userSpaceOnUse"
          cx={cx}
          cy={cy}
          r={outerRadius}
        >
          <stop offset="0%"   stopColor={colors.red} stopOpacity={0.18} />
          <stop offset="55%"  stopColor={colors.red} stopOpacity={0.38} />
          <stop offset="100%" stopColor={colors.red} stopOpacity={0.58} />
        </radialGradient>
      </defs>
      <path
        d={d}
        fill="url(#cercol-radar-grad)"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </g>
  )
}

export default function RadarChart({ scores, maxScore = 5, domainKeys, labelFn }) {
  const data = domainKeys.map((key) => ({
    dimension: labelFn(key),
    domainKey: key,
    score: scoreToPercent(scores[key] ?? 1, maxScore),
    rawScore: scores[key] ?? 1,
  }))

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RechartsRadar data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid gridType="circle" stroke={colors.border} />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fill: colors.textPrimary, fontSize: 12, fontWeight: 500 }}
        />
        <Tooltip
          formatter={(value, name, props) => [
            `${props.payload.rawScore} / ${maxScore}`,
            props.payload.dimension,
          ]}
          contentStyle={{
            borderRadius: '12px',
            border: `1px solid ${colors.border}`,
            fontSize: '13px',
          }}
        />
        <Radar
          dataKey="score"
          stroke={colors.red}
          strokeWidth={2}
          shape={<OrganicRadarShape />}
        />
      </RechartsRadar>
    </ResponsiveContainer>
  )
}
