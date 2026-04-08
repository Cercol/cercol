/**
 * Layout — persistent shell wrapping all routes.
 * Header: brand link (left) + doc nav links (centre) + AccountButton + LanguageToggle (right).
 * Children rendered below in normal flow.
 */
import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AccountButton from './AccountButton'
import LanguageToggle from './LanguageToggle'

export default function Layout({ children }) {
  const { t } = useTranslation()

  return (
    <>
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="text-base font-bold tracking-tight text-gray-900 hover:text-blue-700 transition-colors shrink-0"
          >
            {t('nav.brand')}
          </Link>

          {/* Doc nav — centre */}
          <nav className="flex items-center gap-1" aria-label="Documentation">
            {[
              { to: '/about',   label: t('nav.about')   },
              { to: '/science', label: t('nav.science') },
              { to: '/faq',     label: t('nav.faq')     },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
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

          <div className="flex items-center gap-3 shrink-0">
            <AccountButton />
            <LanguageToggle />
          </div>
        </div>
      </header>
      {children}
    </>
  )
}
