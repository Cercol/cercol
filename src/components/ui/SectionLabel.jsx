/**
 * SectionLabel — eyebrow text displayed above section headings.
 * All caps, text-xs, font-semibold, wide letter spacing.
 *
 * color: blue | red | green | amber | gray
 *   Maps to brand palette. Default: gray.
 */
const COLOR_MAP = {
  blue:  'text-[var(--mm-color-blue)]',
  red:   'text-[var(--mm-color-red)]',
  green: 'text-[var(--mm-color-green)]',
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
