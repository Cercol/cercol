/**
 * HomePage — instrument selection screen.
 * Full-width blue background. Three instrument cards in a horizontal grid.
 * Cards are white with a 3px left border in the instrument color.
 * On hover: card fills with the instrument color, text inverts.
 * This page opts out of Layout's white content wrapper via the home-route
 * exception in Layout.jsx (useLocation check).
 *
 * Phase 10.17: animal wallpaper positions are generated randomly on each
 * page load using a layout algorithm that avoids the card grid zone and
 * prevents icon overlaps.
 */
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { colors } from '../design/tokens'
import { NewMoonIcon, FirstQuarterIcon, FullMoonIcon, LastQuarterIcon, RoleIcon } from '../components/MoonIcons'

const GITHUB_URL = 'https://github.com/miquelmatoses/cercol'
const ISSUE_URL  = 'https://github.com/miquelmatoses/cercol/issues/new?title=Bug+report&labels=bug'

/** Animal definitions: fixed role selection and size range. */
const ICON_DEFS = [
  { id: 'a01', role: 'R01', size: 160 },
  { id: 'a02', role: 'R05', size: 148 },
  { id: 'a03', role: 'R10', size: 136 },
  { id: 'a04', role: 'R11', size: 122 },
  { id: 'a05', role: 'R03', size: 114 },
  { id: 'a06', role: 'R07', size: 104 },
  { id: 'a07', role: 'R09', size: 94  },
  { id: 'a08', role: 'R04', size: 86  },
  { id: 'a09', role: 'R02', size: 78  },
  { id: 'a10', role: 'R06', size: 72  },
  { id: 'a11', role: 'R08', size: 82  },
  { id: 'a12', role: 'R12', size: 68  },
  { id: 'b01', role: 'R01', size: 58  },
  { id: 'b02', role: 'R05', size: 54  },
  { id: 'b03', role: 'R10', size: 62  },
  { id: 'b04', role: 'R03', size: 50  },
  { id: 'b05', role: 'R07', size: 48  },
  { id: 'b06', role: 'R11', size: 56  },
  { id: 'b07', role: 'R09', size: 46  },
  { id: 'b08', role: 'R04', size: 44  },
  { id: 'b09', role: 'R02', size: 52  },
  { id: 'b10', role: 'R06', size: 42  },
]

/**
 * Card grid exclusion zone in viewport-% coordinates.
 * Conservative: centre 64% × 64% of the viewport where the three
 * instrument cards live. Icons may not overlap this zone.
 */
const CARD_X1 = 18, CARD_X2 = 82
const CARD_Y1 = 18, CARD_Y2 = 82

/**
 * Generates a random layout for the decorative wallpaper icons.
 * Each call produces a different layout — call once per page load.
 *
 * Algorithm:
 *   For each icon, try up to 100 random (x, y) positions in normalised
 *   viewport-% space (with slight edge bleed). Reject positions that
 *   overlap the card zone or that are too close to already-placed icons.
 *   Fall back to a corner slot if no valid position found.
 */
function generateWallpaper() {
  const placed = []

  return ICON_DEFS.map((def) => {
    // Approximate icon radius in viewport-% units (assumes ~1300px viewport width)
    const r = def.size / 13
    const rotate = Math.round((Math.random() - 0.5) * 80)   // –40 ° to +40 °

    let cx = -10, cy = -10   // default: hidden off-screen if no slot found

    for (let attempt = 0; attempt < 200; attempt++) {
      // Sample with slight bleed beyond viewport edges for corner/edge effects
      const x = Math.random() * 112 - 6   // –6 % to 106 %
      const y = Math.random() * 112 - 6

      // Reject if the icon circle overlaps the card exclusion zone
      if (x + r > CARD_X1 && x - r < CARD_X2 &&
          y + r > CARD_Y1 && y - r < CARD_Y2) continue

      // Reject if too close to an already-placed icon (1.05× combined radii — slight gap)
      if (placed.some(p => {
        const dx = x - p.x, dy = y - p.y
        return Math.sqrt(dx * dx + dy * dy) < (r + p.r) * 1.05
      })) continue

      cx = x; cy = y
      break
    }

    placed.push({ x: cx, y: cy, r })

    return {
      id:   def.id,
      role: def.role,
      size: def.size,
      style: {
        left:      `${cx}%`,
        top:       `${cy}%`,
        transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
      },
    }
  })
}

/**
 * InstrumentCard — white card with colored left border.
 * On hover: fills with accentColor; text inverts (white, or black on yellow).
 */
function InstrumentCard({ icon, name, description, meta, accentColor, darkHover = false, paymentLabel, onClick }) {
  const [hovered, setHovered] = useState(false)

  const textColor = hovered ? (darkHover ? colors.black : colors.white) : colors.black

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="text-left w-full p-8 cursor-pointer"
      style={{
        backgroundColor: hovered ? accentColor : colors.white,
        color: textColor,
        borderStyle:  'solid',
        borderWidth:  '0 0 0 3px',
        borderColor:  accentColor,
        borderRadius: 4,
        transition:   'background-color 200ms, color 200ms',
      }}
    >
      <div className="mb-6 leading-none flex justify-center" style={{ color: hovered ? textColor : accentColor }}>{icon}</div>

      <h2
        className="text-2xl font-bold mb-2"
        style={{ color: hovered ? textColor : accentColor, transition: 'color 200ms' }}
      >
        {name}
      </h2>

      <p className="text-sm mb-6" style={{ opacity: hovered ? 0.85 : 0.65 }}>
        {description}
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="text-xs px-2.5 py-1 font-medium"
          style={{ backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 4 }}
        >
          {meta}
        </span>
        {paymentLabel && (
          <span
            className="text-xs px-2.5 py-1 font-medium"
            style={{ backgroundColor: 'rgba(0,0,0,0.12)', borderRadius: 4 }}
          >
            {paymentLabel}
          </span>
        )}
      </div>
    </button>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [wallpaper, setWallpaper] = useState([])

  // Generate a fresh random layout on every page load
  useEffect(() => {
    setWallpaper(generateWallpaper())
  }, [])

  return (
    <main
      className="min-h-[calc(100vh-4rem)] flex flex-col relative overflow-hidden"
      style={{ backgroundColor: colors.blue }}
    >
      {/* Decorative animal icons — randomised on each load, behind cards */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {wallpaper.map(({ id, role, size, style }) => (
          <div key={id} className="absolute" style={style}>
            <RoleIcon role={role} size={size} style={{ color: 'white', opacity: 0.22 }} />
          </div>
        ))}
      </div>

      {/* Instrument cards — vertically centered, 3-col desktop, 2 tablet, 1 mobile */}
      <div className="flex-1 flex items-center px-8 lg:px-16 py-12 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 max-w-screen-xl mx-auto w-full">
          <InstrumentCard
            icon={<NewMoonIcon size={80} />}
            name={t('home.newMoon.name')}
            description={t('home.newMoon.description')}
            meta={t('home.newMoon.meta')}
            accentColor={colors.red}
            onClick={() => navigate('/new-moon')}
          />
          <InstrumentCard
            icon={<FirstQuarterIcon size={80} />}
            name={t('home.firstQuarter.name')}
            description={t('home.firstQuarter.description')}
            meta={t('home.firstQuarter.meta')}
            accentColor={colors.green}
            onClick={() => navigate('/first-quarter')}
          />
          <InstrumentCard
            icon={<FullMoonIcon size={80} />}
            name={t('home.fullMoon.name')}
            description={t('home.fullMoon.description')}
            meta={t('home.fullMoon.meta')}
            accentColor={colors.yellow}
            darkHover
            paymentLabel={t('home.fullMoon.paid')}
            onClick={() => navigate('/full-moon')}
          />
          <InstrumentCard
            icon={<LastQuarterIcon size={80} />}
            name={t('home.lastQuarter.name')}
            description={t('home.lastQuarter.description')}
            meta={t('home.lastQuarter.meta')}
            accentColor={colors.black}
            onClick={() => navigate('/groups')}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="px-8 lg:px-16 pt-10 pb-8">
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {t('home.footnote')}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-white transition-colors"
          >
            {t('home.viewOnGitHub')}
          </a>
          {' · '}
          <a
            href={ISSUE_URL}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-white transition-colors"
          >
            {t('feedback.reportIssue')}
          </a>
          {' · '}
          <Link
            to="/privacy"
            className="underline hover:text-white transition-colors"
          >
            {t('home.privacy')}
          </Link>
        </p>
      </footer>
    </main>
  )
}
