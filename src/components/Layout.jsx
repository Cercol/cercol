/**
 * Layout — persistent shell wrapping all routes.
 * Header: brand link (left) + AccountButton + LanguageToggle (right).
 * Children rendered below in normal flow.
 */
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AccountButton from './AccountButton'
import LanguageToggle from './LanguageToggle'

export default function Layout({ children }) {
  const { t } = useTranslation()

  return (
    <>
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="text-base font-bold tracking-tight text-gray-900 hover:text-blue-700 transition-colors"
          >
            {t('nav.brand')}
          </Link>
          <div className="flex items-center gap-3">
            <AccountButton />
            <LanguageToggle />
          </div>
        </div>
      </header>
      {children}
    </>
  )
}
