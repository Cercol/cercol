/**
 * Layout — persistent shell wrapping all routes.
 * Two-row header:
 *   Row 1: brand link (left) + AccountButton + LanguageToggle (right)
 *   Row 2: five doc nav links (scrollable on narrow viewports)
 * Children rendered below in normal flow.
 */
import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AccountButton from './AccountButton'
import LanguageToggle from './LanguageToggle'

export default function Layout({ children }) {
  const { t } = useTranslation()

  const navLinks = [
    { to: '/about',       label: t('nav.about')       },
    { to: '/instruments', label: t('nav.instruments') },
    { to: '/roles',       label: t('nav.roles')       },
    { to: '/science',     label: t('nav.science')     },
    { to: '/faq',         label: t('nav.faq')         },
  ]

  return (
    <>
      <header className="bg-white border-b border-gray-200">
        {/* Row 1 — brand + controls */}
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="text-base font-bold tracking-tight text-gray-900 hover:text-blue-700 transition-colors shrink-0"
          >
            {t('nav.brand')}
          </Link>
          <div className="flex items-center gap-3 shrink-0">
            <AccountButton />
            <LanguageToggle />
          </div>
        </div>

        {/* Row 2 — doc nav */}
        <div className="border-t border-gray-100">
          <nav
            className="max-w-xl mx-auto px-4 flex items-center gap-1 overflow-x-auto py-1.5 scrollbar-none"
            aria-label="Documentation"
          >
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `shrink-0 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      {children}
    </>
  )
}
