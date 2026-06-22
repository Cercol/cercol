/**
 * StatCard — a labelled KPI number on the canonical flat Card.
 *
 * The value renders in the inherited body font. The previous admin markup
 * applied an undefined --mm-font-heading variable, which resolved to the
 * inherited font anyway; dropping it keeps the exact same rendering without
 * the phantom variable.
 */
import Card from './Card'

export default function StatCard({ label, value, sub }) {
  return (
    <Card className="px-5 py-4 flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="text-3xl font-bold text-gray-900">{value ?? '—'}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </Card>
  )
}
