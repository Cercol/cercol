/**
 * RadarDataCard — shared card that combines a RadarChart with 1 or 2 data columns.
 *
 * Props:
 *   scores         — domain score object (required unless customFirstCol is provided)
 *   maxScore       — max radar score (default 5)
 *   domainKeys     — array of domain key strings
 *   labelFn        — function (key) => string for radar axis labels
 *   customFirstCol — optional JSX to render in place of RadarChart in col 1
 *   children       — 1 child → 2-col layout; 2 children → 3-col layout
 */
import React from 'react'
import { Card } from '../ui'
import RadarChart from '../RadarChart'

export default function RadarDataCard({ scores, maxScore = 5, domainKeys, labelFn, customFirstCol, children }) {
  const childCount = React.Children.count(children)
  const gridClass = childCount >= 2
    ? 'grid grid-cols-1 md:grid-cols-3 gap-4'
    : 'grid grid-cols-1 md:grid-cols-2 gap-4'

  const firstCol = customFirstCol ?? (
    <RadarChart
      scores={scores}
      maxScore={maxScore}
      domainKeys={domainKeys}
      labelFn={labelFn}
    />
  )

  return (
    <Card className="shadow-sm p-5">
      <div className={gridClass}>
        {firstCol}
        {React.Children.map(children, (child) => (
          <div className="flex flex-col gap-0">
            {child}
          </div>
        ))}
      </div>
    </Card>
  )
}
