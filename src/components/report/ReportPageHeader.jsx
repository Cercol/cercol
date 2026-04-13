/**
 * ReportPageHeader — shared header for all four report pages.
 *
 * Props:
 *   icon     — JSX element (moon phase icon)
 *   eyebrow  — instrument name / category label (uppercase, muted)
 *   title    — main h1 (Playfair Display via global CSS)
 *   subtitle — optional muted subtitle below the title
 */
import { colors } from '../../design/tokens'

export default function ReportPageHeader({ icon, eyebrow, title, subtitle }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: colors.textMuted }}
        >
          {eyebrow}
        </span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: colors.textPrimary }}>
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 text-sm" style={{ color: colors.textMuted }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
