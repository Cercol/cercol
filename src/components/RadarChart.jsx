/**
 * RadarChart — domain spider chart using Recharts.
 * Props:
 *   scores    {Record<string, number>} — domain → score
 *   maxScore  {number}                 — top of scale (5 for CBF, 7 for Radar)
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

function scoreToPercent(score, maxScore) {
  return Math.round(((score - 1) / (maxScore - 1)) * 100)
}

export default function RadarChart({ scores, maxScore = 5 }) {
  const { t } = useTranslation()

  const data = Object.keys(DOMAIN_META).map((key) => ({
    dimension: t(`domains.${key}.label`),
    domainKey: key,
    score: scoreToPercent(scores[key] ?? 1, maxScore),
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
          stroke={colors.primary}
          fill={colors.primary}
          fillOpacity={0.18}
          strokeWidth={2}
        />
      </RechartsRadar>
    </ResponsiveContainer>
  )
}
