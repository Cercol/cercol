/**
 * MethodologyNote — the small muted disclaimer footnote rendered at the bottom
 * of every report surface (Full Moon, First Quarter, New Moon, Last Quarter).
 *
 * Centralizes the shared card string so all report pages render an identical
 * note instead of repeating the className and inline color in each file.
 */
import { colors } from '../../design/tokens'

export default function MethodologyNote({ children }) {
  return (
    <div
      className="bg-gray-100 rounded px-5 py-4 text-xs leading-relaxed"
      style={{ color: colors.textMuted }}
    >
      {children}
    </div>
  )
}
