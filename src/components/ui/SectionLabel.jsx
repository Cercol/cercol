/**
 * SectionLabel — eyebrow text displayed above section headings.
 * All caps, text-xs, font-semibold, wide letter spacing.
 *
 * color: blue | red | green | amber | gray
 *   Maps to brand palette. Default: gray.
 */
const COLOR_MAP = {
  blue:  'text-[#0047ba]',
  red:   'text-[#cf3339]',
  green: 'text-[#427c42]',
  amber: 'text-amber-500',
  gray:  'text-gray-400',
}

export default function SectionLabel({ children, color = 'gray', className = '' }) {
  return (
    <p className={['text-xs font-semibold uppercase tracking-widest', COLOR_MAP[color], className].join(' ')}>
      {children}
    </p>
  )
}
