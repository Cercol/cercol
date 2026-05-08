/**
 * Layout — persistent shell wrapping all routes.
 *
 * Header: single row on brand blue (#0047ba).
 *   Left:   Cèrcol logo (white SVG)
 *   Center: five doc nav links — horizontal on desktop (md+),
 *           hidden on mobile (replaced by hamburger)
 *   Right:  hamburger (mobile) | AccountButton + LanguageToggle
 *
 * Mobile nav: hamburger opens a full-width blue dropdown below the header.
 * Each link closes the menu on click.
 *
 * Content wrapper: white background, centered max-w-4xl column.
 * Exception: homepage ("/") opts out — manages its own full-bleed background.
 */
import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AccountButton from './AccountButton'
import LanguageToggle from './LanguageToggle'
import CercolLogo from './CercolLogo'
import { colors } from '../design/tokens'
import { HamburgerIcon, CloseIcon } from './MoonIcons'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children }) {
  const { t, i18n }  = useTranslation()
  const { pathname } = useLocation()
  const { profile }  = useAuth()
  const isHome       = pathname === '/'
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { to: '/about',       label: t('nav.about')       },
    { to: '/instruments', label: t('nav.instruments') },
    { to: '/roles',       label: t('nav.roles')       },
    { to: '/science',     label: t('nav.science')     },
    { to: i18n.language === 'en' ? '/blog' : `/${i18n.language}/blog`, label: t('nav.blog') },
    { to: '/faq',         label: t('nav.faq')         },
    ...(profile?.is_admin ? [{ to: '/admin', label: t('nav.admin') }] : []),
  ]

  const navLinkClass = ({ isActive }) =>
    `shrink-0 text-xs font-medium px-2.5 py-1.5 rounded transition-colors whitespace-nowrap ${
      isActive
        ? 'text-white bg-white/20'
        : 'text-white/70 hover:text-white hover:bg-white/10'
    }`

  return (
    <>
      {/* ── Blue header ── */}
      <header style={{ backgroundColor: colors.blue }}>
        <div className="h-16 flex items-center gap-6 px-6 lg:px-12">

          {/* Logo — left */}
          <Link to="/" className="shrink-0" style={{ color: colors.white }}>
            <CercolLogo className="h-7 w-auto" />
          </Link>

          {/* Nav — desktop only, scrollable on mid-range viewports */}
          <nav
            className="hidden md:flex flex-1 items-center gap-1 overflow-x-auto min-w-0"
            style={{ scrollbarWidth: 'none' }}
            aria-label="Main navigation"
          >
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} className={navLinkClass}>
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right slot */}
          <div className="flex items-center gap-3 shrink-0 ml-auto md:ml-0">
            <AccountButton />
            <LanguageToggle />

            {/* Hamburger — mobile only */}
            <button
              type="button"
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="md:hidden flex flex-col justify-center gap-1.5 p-1"
              style={{ color: colors.white }}
            >
              {menuOpen ? (
                <CloseIcon size={20} />
              ) : (
                <HamburgerIcon size={20} />
              )}
            </button>
          </div>

        </div>
      </header>

      {/* ── Mobile dropdown nav ── */}
      {menuOpen && (
        <div className="md:hidden" style={{ backgroundColor: colors.blue }}>
          <nav className="flex flex-col px-4 py-3 gap-0.5" aria-label="Mobile navigation">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-medium px-3 py-2.5 rounded transition-colors ${
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
        </div>
      )}

      {/* ── Content wrapper ── */}
      {isHome ? children : (
        <div className="bg-white min-h-[calc(100vh-4rem)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-8">
            {children}
          </div>
        </div>
      )}
    </>
  )
}
