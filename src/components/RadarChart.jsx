/**
 * RadarChart — Big Five spider chart using Recharts.
 * Props:
 *   scores  {Record<string, number>} — dimension → score (1–7)
 */
import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { DIMENSION_META } from '../data/tipi'
import { colors } from '../design/tokens'
import { scoreToPercent } from '../utils/scoring'

export default function RadarChart({ scores }) {
  const data = Object.entries(scores).map(([key, score]) => ({
    dimension: DIMENSION_META[key].label,
    score: scoreToPercent(score),
    rawScore: score,
  }))

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RechartsRadar data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke={colors.border} />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fill: colors.textPrimary, fontSize: 13, fontWeight: 500 }}
        />
        <Tooltip
          formatter={(value, name, props) => [
            `${props.payload.rawScore} / 7`,
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
          stroke={colors.primary}
          fill={colors.primary}
          fillOpacity={0.18}
          strokeWidth={2}
        />
      </RechartsRadar>
    </ResponsiveContainer>
  )
}
