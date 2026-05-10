/**
 * Layout — persistent shell wrapping all routes.
 *
 * Header: single row on brand blue (#0047ba).
 *   Left:   Cèrcol logo (white SVG)
 *   Center: four nav items — two direct links + two dropdown groups:
 *             Instruments · Roles · Learn ▾ (Science, Blog) · Company ▾ (About, FAQ)
 *   Right:  AccountButton + LanguageToggle + hamburger (mobile)
 *
 * Mobile nav: hamburger opens a full-width blue dropdown below the header.
 *   Dropdown groups render as expandable sections with indented sub-links.
 *
 * Content wrapper: white background, centered max-w-4xl column.
 * Exception: homepage ("/") opts out — manages its own full-bleed background.
 */
import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AccountButton from './AccountButton'
import LanguageToggle from './LanguageToggle'
import CercolLogo from './CercolLogo'
import { colors } from '../design/tokens'
import { HamburgerIcon, CloseIcon } from './MoonIcons'
import { useAuth } from '../context/AuthContext'

/** Chevron icon — rotates when open */
function Chevron({ open }) {
  return (
    <svg
      className={`w-3 h-3 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

/** Desktop dropdown group with click-to-open panel */
function DropdownGroup({ label, children, isAnyChildActive }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`shrink-0 flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded transition-colors whitespace-nowrap ${
          isAnyChildActive || open
            ? 'text-white bg-white/20'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`}
      >
        {label}
        <Chevron open={open} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
          {children}
        </div>
      )}
    </div>
  )
}

/** Single link inside a desktop dropdown panel */
function DropdownItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `block px-4 py-2 text-xs font-medium transition-colors ${
          isActive
            ? 'text-[var(--mm-color-blue)] bg-blue-50'
            : 'text-gray-700 hover:text-[var(--mm-color-blue)] hover:bg-gray-50'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

export default function Layout({ children }) {
  const { t, i18n }  = useTranslation()
  const { pathname } = useLocation()
  const { profile }  = useAuth()
  const isHome       = pathname === '/'
  const [menuOpen, setMenuOpen]     = useState(false)
  const [mobileLearnOpen, setMobileLearnOpen]   = useState(false)
  const [mobileCompanyOpen, setMobileCompanyOpen] = useState(false)

  const blogTo = i18n.language === 'en' ? '/blog' : `/${i18n.language}/blog`

  // Derived: is any child of a group currently active?
  const learnActive   = pathname === '/science' || pathname.includes('/blog')
  const companyActive = pathname === '/about' || pathname === '/faq'

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

          {/* Nav — desktop only */}
          <nav
            className="hidden md:flex flex-1 items-center gap-1"
            aria-label="Main navigation"
          >
            {/* Direct links */}
            <NavLink to="/instruments" className={navLinkClass}>
              {t('nav.instruments')}
            </NavLink>
            <NavLink to="/roles" className={navLinkClass}>
              {t('nav.roles')}
            </NavLink>

            {/* Learn group: Science + Blog */}
            <DropdownGroup label={t('nav.menuLearn')} isAnyChildActive={learnActive}>
              <DropdownItem to="/science"  label={t('nav.science')} />
              <DropdownItem to={blogTo}    label={t('nav.blog')}    />
            </DropdownGroup>

            {/* Company group: About + FAQ */}
            <DropdownGroup label={t('nav.menuCompany')} isAnyChildActive={companyActive}>
              <DropdownItem to="/about" label={t('nav.about')} />
              <DropdownItem to="/faq"   label={t('nav.faq')}   />
            </DropdownGroup>

            {profile?.is_admin && (
              <NavLink to="/admin" className={navLinkClass}>
                {t('nav.admin')}
              </NavLink>
            )}
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
              {menuOpen ? <CloseIcon size={20} /> : <HamburgerIcon size={20} />}
            </button>
          </div>

        </div>
      </header>

      {/* ── Mobile dropdown nav ── */}
      {menuOpen && (
        <div className="md:hidden" style={{ backgroundColor: colors.blue }}>
          <nav className="flex flex-col px-4 py-3 gap-0.5" aria-label="Mobile navigation">

            <NavLink
              to="/instruments"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `text-sm font-medium px-3 py-2.5 rounded transition-colors ${
                  isActive ? 'text-white bg-white/20' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`
              }
            >
              {t('nav.instruments')}
            </NavLink>

            <NavLink
              to="/roles"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `text-sm font-medium px-3 py-2.5 rounded transition-colors ${
                  isActive ? 'text-white bg-white/20' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`
              }
            >
              {t('nav.roles')}
            </NavLink>

            {/* Learn group */}
            <button
              type="button"
              onClick={() => setMobileLearnOpen(o => !o)}
              className="flex items-center justify-between text-sm font-medium px-3 py-2.5 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              {t('nav.menuLearn')}
              <Chevron open={mobileLearnOpen} />
            </button>
            {mobileLearnOpen && (
              <div className="ml-4 flex flex-col gap-0.5">
                {[
                  { to: '/science', label: t('nav.science') },
                  { to: blogTo,     label: t('nav.blog')    },
                ].map(({ to, label }) => (
                  <NavLink
                    key={to} to={to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `text-sm font-medium px-3 py-2 rounded transition-colors ${
                        isActive ? 'text-white bg-white/20' : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </div>
            )}

            {/* Company group */}
            <button
              type="button"
              onClick={() => setMobileCompanyOpen(o => !o)}
              className="flex items-center justify-between text-sm font-medium px-3 py-2.5 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              {t('nav.menuCompany')}
              <Chevron open={mobileCompanyOpen} />
            </button>
            {mobileCompanyOpen && (
              <div className="ml-4 flex flex-col gap-0.5">
                {[
                  { to: '/about', label: t('nav.about') },
                  { to: '/faq',   label: t('nav.faq')   },
                ].map(({ to, label }) => (
                  <NavLink
                    key={to} to={to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `text-sm font-medium px-3 py-2 rounded transition-colors ${
                        isActive ? 'text-white bg-white/20' : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </div>
            )}

            {profile?.is_admin && (
              <NavLink
                to="/admin"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-medium px-3 py-2.5 rounded transition-colors ${
                    isActive ? 'text-white bg-white/20' : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {t('nav.admin')}
              </NavLink>
            )}

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
