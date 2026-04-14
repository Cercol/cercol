/**
 * Card — white container with consistent 4px border-radius.
 *
 * accent: none | red | green | yellow | blue
 *   Default (no accent): white bg, 1px gray border (#e5e7eb), 4px radius.
 *   Accent: white bg, 3px left border in accent color, no other border.
 *
 * Padding, shadow, overflow are passed via className.
 */
import { colors } from '../../design/tokens'

const ACCENT_COLORS = {
  red:    colors.red,
  green:  colors.green,
  yellow: colors.yellow,
  blue:   colors.blue,
}

export default function Card({ children, accent, className = '' }) {
  if (accent) {
    return (
      <div
        className={`bg-white rounded ${className}`}
        style={{
          borderStyle: 'solid',
          borderWidth: '0 0 0 3px',
          borderColor: ACCENT_COLORS[accent],
        }}
      >
        {children}
      </div>
    )
  }

  return (
    <div className={`bg-white border border-gray-200 rounded ${className}`}>
      {children}
    </div>
  )
}
