/**
 * MoonIcons — SVG moon phase icons in Cèrcol line style.
 *
 * Monocolor stroke-based, slightly imperfect hand-crafted quality
 * matching the brand's rice-grain illustration system.
 * All icons use currentColor — place color on the parent or via className/style.
 *
 * Exports: NewMoonIcon, FirstQuarterIcon, FullMoonIcon, CheckIcon
 *
 * Usage:
 *   <NewMoonIcon size={40} style={{ color: colors.red }} />
 *   <FullMoonIcon size={13} className="inline-block align-middle" />
 *   <CheckIcon size={40} style={{ color: colors.green }} />
 */

/**
 * NewMoonIcon — dark circle with diagonal hatching suggesting an unlit face.
 * The hatching lines are pre-clipped to the circle radius so no clipPath ID is needed.
 */
export function NewMoonIcon({ size = 32, className = '', style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {/* Slightly irregular circle outline */}
      <path
        strokeWidth="1.8"
        d="M16 4.5 C22.5 4 28.5 9.5 28 16 C27.5 22.5 22 28 16 27.5 C9.5 28 3.5 22 4 16 C4.5 9.5 9.5 4 16 4.5 Z"
      />
      {/* Diagonal hatching (upper-left → lower-right, pre-clipped to circle radius 12) */}
      <line strokeWidth="1.3" x1="4.2"  y1="15.8" x2="16.2" y2="3.8"  />
      <line strokeWidth="1.3" x1="5.1"  y1="20.9" x2="20.9" y2="5.1"  />
      <line strokeWidth="1.3" x1="7.5"  y1="24.5" x2="24.5" y2="7.5"  />
      <line strokeWidth="1.3" x1="11.1" y1="26.9" x2="26.9" y2="11.1" />
      <line strokeWidth="1.3" x1="15.8" y1="27.8" x2="27.8" y2="15.8" />
    </svg>
  )
}

/**
 * FirstQuarterIcon — right half illuminated, slight inward terminator curve.
 * Single closed path: outer right arc + terminator curve returning to top.
 */
export function FirstQuarterIcon({ size = 32, className = '', style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {/*
        Right arc (lit half): (16,4.5) → right around → (16,27.5)
        Terminator (shadow boundary): (16,27.5) → slight leftward bow → (16,4.5)
        The terminator bows gently left — physically accurate and visually distinctive.
      */}
      <path
        strokeWidth="1.8"
        d="M16 4.5
           C22.5 4 28.5 9.5 28 16.5
           C27.5 23 21.5 28 16 27.5
           C14.5 21.5 14 10.5 16 4.5 Z"
      />
    </svg>
  )
}

/**
 * FullMoonIcon — nearly-circular disk with three small irregular crater marks.
 */
export function FullMoonIcon({ size = 32, className = '', style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {/* Slightly irregular circle */}
      <path
        strokeWidth="1.8"
        d="M16 4.5 C22.5 4 28 9.5 27.5 16 C27 22.5 22.5 28 16 27.5 C9.5 28 4 22 4.5 16 C5 9.5 9.5 4 16 4.5 Z"
      />
      {/* Crater 1 — small oval near upper-left of disk */}
      <path
        strokeWidth="1.2"
        d="M10 13.5 C10 12.2 13 12.2 13 13.5 C13 14.8 10 14.8 10 13.5 Z"
      />
      {/* Crater 2 — small oval lower-right */}
      <path
        strokeWidth="1.2"
        d="M19.5 20.5 C19.5 19.5 21.5 19.5 21.5 20.5 C21.5 21.5 19.5 21.5 19.5 20.5 Z"
      />
      {/* Crater 3 — tiny mark upper-right */}
      <path
        strokeWidth="1"
        d="M18.5 9.5 C18.5 8.8 20 8.8 20 9.5 C20 10.2 18.5 10.2 18.5 9.5 Z"
      />
    </svg>
  )
}

/**
 * CheckIcon — a simple hand-drawn checkmark.
 * Used for completion/confirmation states.
 */
export function CheckIcon({ size = 32, className = '', style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {/* Two bezier segments: down to the valley, then up to upper-right */}
      <path
        strokeWidth="2.5"
        d="M5 16.5 C7.5 19 10.5 23 12.5 25 C17 20 22 13 27.5 6.5"
      />
    </svg>
  )
}
