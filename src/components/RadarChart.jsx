/**
 * RadarChart — Big Five domain spider chart using Recharts.
 * Props:
 *   scores  {Record<string, number>} — domain → score (1–5)
 */
import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { useTranslation } from 'react-i18next'
import { DOMAIN_META } from '../data/cercol-big-five'
import { colors } from '../design/tokens'
import { scoreToPercent } from '../utils/cbf-scoring'

export default function RadarChart({ scores }) {
  const { t } = useTranslation()

  const data = Object.keys(DOMAIN_META).map((key) => ({
    dimension: t(`domains.${key}.label`),
    domainKey: key,
    score: scoreToPercent(scores[key] ?? 1),
    rawScore: scores[key] ?? 1,
  }))

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RechartsRadar data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke={colors.border} />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fill: colors.textPrimary, fontSize: 12, fontWeight: 500 }}
        />
        <Tooltip
          formatter={(value, name, props) => [
            `${props.payload.rawScore} / 5`,
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
