/**
 * Layout — persistent shell wrapping all routes.
 *
 * Header: single row on brand blue (#0047ba).
 *   Left:   Cèrcol logo (white SVG)
 *   Center: five doc nav links (scrollable on narrow viewports)
 *   Right:  AccountButton + LanguageToggle
 *
 * Content wrapper: white background, centered max-w-4xl column with
 * px-4 (mobile) / px-8 (desktop) padding. Covers min-height of viewport
 * minus the 4rem header.
 *
 * Exception: the homepage ("/") opts out of the white wrapper — it manages
 * its own full-bleed blue background. Detected via useLocation.
 */
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AccountButton from './AccountButton'
import LanguageToggle from './LanguageToggle'
import CercolLogo from './CercolLogo'
import { colors } from '../design/tokens'

export default function Layout({ children }) {
  const { t }       = useTranslation()
  const { pathname } = useLocation()
  const isHome      = pathname === '/'

  const navLinks = [
    { to: '/about',       label: t('nav.about')       },
    { to: '/instruments', label: t('nav.instruments') },
    { to: '/roles',       label: t('nav.roles')       },
    { to: '/science',     label: t('nav.science')     },
    { to: '/faq',         label: t('nav.faq')         },
  ]

  return (
    <>
      {/* ── Blue header ── */}
      <header style={{ backgroundColor: colors.blue }}>
        <div className="h-16 flex items-center gap-6 px-8 lg:px-12">

          {/* Logo — left */}
          <Link to="/" className="shrink-0" style={{ color: colors.white }}>
            <CercolLogo className="h-7 w-auto" />
          </Link>

          {/* Nav — center, scrollable on mobile */}
          <nav
            className="flex-1 flex items-center gap-1 overflow-x-auto min-w-0"
            style={{ scrollbarWidth: 'none' }}
            aria-label="Main navigation"
          >
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `shrink-0 text-xs font-medium px-2.5 py-1.5 rounded transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-white bg-white/20'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Auth + language toggle — right */}
          <div className="flex items-center gap-3 shrink-0">
            <AccountButton />
            <LanguageToggle />
          </div>

        </div>
      </header>

      {/* ── Content wrapper ── */}
      {isHome ? children : (
        <div
          className="bg-white min-h-[calc(100vh-4rem)]"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-8">
            {children}
          </div>
        </div>
      )}
    </>
  )
}
