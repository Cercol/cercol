/**
 * Sparkline — tiny inline SVG trend line for dashboard cards.
 *
 * This is a charting primitive, not an icon, so the inline <svg> here is the
 * sanctioned exception to the MoonIcons-only rule. The default stroke is the
 * mm-design blue token; pass `color` (a token value) to override.
 *
 * data: array of { day: 'YYYY-MM-DD', count: number }. Missing days render as 0.
 */
import { colors } from '../../design/tokens'

export default function Sparkline({ data, color = colors.blue, days = 30 }) {
  if (!data || data.length === 0) {
    return <div className="h-12 flex items-center text-xs text-gray-300">No data</div>
  }

  // Fill in all days (missing days = 0)
  const filled = []
  const today  = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const found = data.find(r => r.day === key)
    filled.push(found ? found.count : 0)
  }

  const max = Math.max(...filled, 1)
  const W = 200
  const H = 40
  const pts = filled.map((v, i) => {
    const x = (i / (filled.length - 1)) * W
    const y = H - (v / max) * H
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-12" preserveAspectRatio="none">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
