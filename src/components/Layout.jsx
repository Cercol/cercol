/**
 * Layout — persistent shell wrapping all routes.
 *
 * Header: single row on brand blue (#0047ba).
 *   Left:   Cèrcol logo (white SVG)
 *   Center: the entries in src/lib/navigation.js — two direct links and two
 *           dropdown groups. That file is the only list; this component, the
 *           mobile menu below and the footer all render from it, so they
 *           cannot drift apart. Adding a page is one line there.
 *   Right:  AccountButton + LanguageToggle + hamburger (mobile)
 *
 * Mobile nav: hamburger opens a full-width blue dropdown below the header.
 *   Dropdown groups render as expandable sections with indented sub-links.
 *
 * Content wrapper: white background, centered max-w-4xl column.
 * Exception: homepage ("/") opts out — manages its own full-bleed background.
 *
 * Footer: on every page. Until 2026-08-22 there was none, and the header's
 * Science, Blog, About and FAQ links sat inside dropdown panels that the
 * prerender never opened, so no prerendered page linked to them at all.
 */
import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AccountButton from './AccountButton'
import LanguageToggle from './LanguageToggle'
import CercolLogo from './CercolLogo'
import BetaBanner from './BetaBanner'
import { colors } from '../design/tokens'
import Footer from './Footer'
import { NAV, navHref, isEntryActive, isHomePath } from '../lib/navigation'
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

/**
 * Desktop dropdown group with click-to-open panel.
 *
 * The panel is always in the DOM and hidden with a class, rather than mounted
 * only once open. Prerendering serialises the page exactly as it renders with
 * no interaction, so `{open && ...}` meant the Science, Blog, About and FAQ
 * links appeared in no prerendered page at all: the only header links a
 * crawler ever saw were the two direct ones, Instruments and Roles. That left
 * every blog index reachable only from the articles it itself links to, a
 * closed loop with no entry point from the pages that carry the site's
 * authority, which is what "crawled, currently not indexed" looks like from
 * Google's side.
 *
 * `hidden` is display:none, so a closed panel stays out of the tab order and
 * out of the accessibility tree exactly as before.
 *
 * Exported for the test that asserts the children survive a closed render.
 */
export function DropdownGroup({ label, children, isAnyChildActive }) {
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

      <div
        className={`absolute top-full left-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 ${
          open ? '' : 'hidden'
        }`}
      >
        {children}
      </div>
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
  const isHome       = isHomePath(pathname)
  const [menuOpen, setMenuOpen]     = useState(false)
  // One entry per open group, keyed by nav key: a boolean per group meant a
  // new group needed a new useState, which is how the list drifts.
  const [mobileOpen, setMobileOpen] = useState({})

  const mobileLinkClass = ({ isActive }) =>
    `text-sm font-medium px-3 py-2.5 rounded transition-colors ${
      isActive ? 'text-white bg-white/20' : 'text-white/70 hover:text-white hover:bg-white/10'
    }`

  const mobileSubLinkClass = ({ isActive }) =>
    `text-sm font-medium px-3 py-2 rounded transition-colors ${
      isActive ? 'text-white bg-white/20' : 'text-white/60 hover:text-white hover:bg-white/10'
    }`

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
          <Link to={navHref({ to: '/' }, i18n.language)} className="shrink-0" style={{ color: colors.white }}>
            <CercolLogo className="h-7 w-auto" />
          </Link>

          {/* Nav — desktop only */}
          <nav
            className="hidden md:flex flex-1 items-center gap-1"
            aria-label="Main navigation"
          >
            {NAV.map((entry) => (entry.direct ? (
              entry.items.map((item) => (
                <NavLink key={item.key} to={navHref(item, i18n.language)} className={navLinkClass}>
                  {t(`nav.${item.key}`)}
                </NavLink>
              ))
            ) : (
              <DropdownGroup
                key={entry.key}
                label={t(`nav.${entry.key}`)}
                isAnyChildActive={isEntryActive(entry, pathname)}
              >
                {entry.items.map((item) => (
                  <DropdownItem key={item.key} to={navHref(item, i18n.language)} label={t(`nav.${item.key}`)} />
                ))}
              </DropdownGroup>
            )))}

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

      {/* ── Beta launch banner ── */}
      <BetaBanner userIsPremium={!!profile?.premium} />

      {/* ── Mobile dropdown nav ── */}
      {menuOpen && (
        <div className="md:hidden" style={{ backgroundColor: colors.blue }}>
          <nav className="flex flex-col px-4 py-3 gap-0.5" aria-label="Mobile navigation">

            {NAV.map((entry) => {
              const open = mobileOpen[entry.key]
              if (entry.direct) return entry.items.map((item) => (
                <NavLink
                  key={item.key}
                  to={navHref(item, i18n.language)}
                  onClick={() => setMenuOpen(false)}
                  className={mobileLinkClass}
                >
                  {t(`nav.${item.key}`)}
                </NavLink>
              ))
              return (
                <div key={entry.key} className="contents">
                  <button
                    type="button"
                    onClick={() => setMobileOpen((o) => ({ ...o, [entry.key]: !o[entry.key] }))}
                    aria-expanded={!!open}
                    className="flex items-center justify-between text-sm font-medium px-3 py-2.5 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {t(`nav.${entry.key}`)}
                    <Chevron open={!!open} />
                  </button>
                  {open && (
                    <div className="ml-4 flex flex-col gap-0.5">
                      {entry.items.map((item) => (
                        <NavLink
                          key={item.key}
                          to={navHref(item, i18n.language)}
                          onClick={() => setMenuOpen(false)}
                          className={mobileSubLinkClass}
                        >
                          {t(`nav.${item.key}`)}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

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

      <Footer />
    </>
  )
}
