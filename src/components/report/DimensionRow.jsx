/**
 * DimensionRow — shared dimension/domain score row across all report pages.
 *
 * Standard mode (FQ/FM results, FM report comparison):
 *   icon | name | score [/ witnessScore] | badge | bar [+ tick]
 * Compact mode (Last Quarter embedded layout):
 *   icon | name | score | bar  (no badge, no description)
 *
 * All translation must be done by the caller — this component receives
 * pre-resolved strings so it has no i18n dependency.
 */
import { DimensionIcon } from '../MoonIcons'
import { colors, DOMAIN_COLORS, DOMAIN_ICON_CLASSES } from '../../design/tokens'

const LABEL_STYLES = {
  low:      'bg-gray-100 text-gray-600',
  moderate: 'bg-blue-100 text-blue-700',
  high:     'bg-[#0047ba] text-white',
}

export default function DimensionRow({
  domainKey,         // 'presence' | 'bond' | 'discipline' | 'depth' | 'vision'
  domainName,        // translated domain name (caller provides)
  score,             // number 1–5 (self score)
  pct,               // number 0–100 for bar width
  labelTier,         // 'low' | 'moderate' | 'high' — used only in standard mode
  labelText,         // translated tier label — used only in standard mode
  description,       // optional pre-translated description text
  witnessScore,      // optional number 1–5
  witnessPct,        // optional number 0–100
  compact = false,   // true = Last Quarter compact mode
  maxScore = 5,      // denominator shown next to score (e.g. 7 for New Moon)
}) {
  const barHex = DOMAIN_COLORS[domainKey]

  // ── Compact mode ─────────────────────────────────────────────────────────────
  if (compact) {
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-semibold flex items-center gap-1 ${DOMAIN_ICON_CLASSES[domainKey]}`}>
            <DimensionIcon domain={domainKey} size={11} />
            <span style={{ color: colors.textPrimary }}>{domainName}</span>
          </span>
          <span className="text-xs font-bold shrink-0 ml-1.5 tabular-nums" style={{ color: colors.textPrimary }}>
            {Number(score).toFixed(1)}
          </span>
        </div>
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: colors.trackBg }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              backgroundColor: barHex,
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }}
          />
        </div>
      </div>
    )
  }

  // ── Standard mode ─────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <DimensionIcon domain={domainKey} size={14} className={DOMAIN_ICON_CLASSES[domainKey]} />
        <span className="text-sm font-semibold flex-1 min-w-0 truncate" style={{ color: colors.textPrimary }}>
          {domainName}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-sm font-bold tabular-nums" style={{ color: colors.textPrimary }}>
            {Number(score).toFixed(1)}
            <span className="text-xs font-normal" style={{ color: colors.textMuted }}>/{maxScore}</span>
          </span>
          {witnessScore != null && (
            <span className="text-sm font-bold tabular-nums" style={{ color: colors.blue }}>
              {Number(witnessScore).toFixed(1)}
            </span>
          )}
          {labelTier && labelText && (
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${LABEL_STYLES[labelTier]}`}>
              {labelText}
            </span>
          )}
        </div>
      </div>
      {/* Bar + optional witness tick */}
      <div
        className="relative w-full h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: colors.trackBg }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: barHex,
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
          }}
        />
        {witnessPct != null && (
          <div
            className="absolute inset-y-0 w-0.5"
            style={{ left: `${witnessPct}%`, backgroundColor: colors.blue, opacity: 0.85 }}
          />
        )}
      </div>
      {description && (
        <p className="text-xs leading-relaxed mt-1.5" style={{ color: colors.textMuted }}>
          {description}
        </p>
      )}
    </div>
  )
}
