/**
 * Badge — small label pill for status/category.
 *
 * variant: default | beta | paid | free
 *   default — gray bg, gray text
 *   beta    — yellow (#f1c22f) bg, black text
 *   paid    — blue (#0047ba) bg, white text
 *   free    — green (#427c42) bg, white text
 *
 * All variants: text-xs, font-semibold, 4px radius, px-2.5 py-1.
 */
export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    beta:    'bg-[#f1c22f] text-[#111111]',
    paid:    'bg-[#0047ba] text-white',
    free:    'bg-[#427c42] text-white',
  }

  return (
    <span
      className={[
        'inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded',
        variants[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
