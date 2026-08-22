/**
 * Footer — the site-wide, always-visible way to every section.
 *
 * It exists for two readers. A person who has scrolled to the bottom of an
 * article and wants somewhere to go next, and a crawler, which until now had
 * neither: the header's Science, Blog, About and FAQ links live inside
 * dropdown panels, and a panel rendered with display:none is followed but
 * weighted below a visible link. Every prerendered page carries this.
 *
 * The sections come from src/lib/navigation.js, the same definition the
 * header renders, so the two cannot disagree about what the site contains.
 * The line beneath them absorbs what HomePage used to render in a <footer>
 * of its own: privacy, the sample report, the repository, the issue form and
 * the author. Those existed on the home page and nowhere else.
 *
 * Same horizontal padding as the header (px-6 lg:px-12, no max width), so on
 * a wide screen the logo at the top and the logo at the bottom sit on the
 * same line rather than one being inset by a container the other does not
 * have.
 *
 * Tokens only, no literal colours: brand blue ground like the header, with
 * the white/70 to white treatment the header nav already uses, so the two
 * ends of the page read as the same object.
 */
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import CercolLogo from './CercolLogo'
import { colors } from '../design/tokens'
import { NAV, META_LINKS, navHref } from '../lib/navigation'

function FooterLink({ entry, lang }) {
  const { t } = useTranslation()
  return (
    <li>
      <Link
        to={navHref(entry, lang)}
        className="text-xs text-white/70 hover:text-white transition-colors"
      >
        {t(`nav.${entry.key}`)}
      </Link>
    </li>
  )
}

export default function Footer() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  return (
    <footer style={{ backgroundColor: colors.blue }} aria-label={t('footer.label')}>
      <div className="px-6 lg:px-12 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">

          <div className="shrink-0">
            <Link to={navHref({ to: '/' }, lang)} style={{ color: colors.white }} className="inline-block">
              <CercolLogo className="h-6 w-auto" />
            </Link>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-white/70">
              {t('footer.tagline')}
            </p>
          </div>

          <nav className="flex gap-10" aria-label={t('footer.sections')}>
            {NAV.map((entry) => (
              <div key={entry.key}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-white/50">
                  {t(`nav.${entry.key}`)}
                </p>
                <ul className="flex flex-col gap-1.5">
                  {entry.items.map((item) => <FooterLink key={item.key} entry={item} lang={lang} />)}
                </ul>
              </div>
            ))}
          </nav>

        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/15 pt-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>{t('footer.rights')}</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {META_LINKS.map((entry) => {
              const label = entry.label || t(entry.labelKey)
              return (
                <li key={entry.key}>
                  {entry.href ? (
                    <a
                      href={entry.href}
                      target="_blank"
                      rel={entry.rel || 'noreferrer'}
                      className="text-white/50 hover:text-white transition-colors"
                    >
                      {label}
                    </a>
                  ) : (
                    <Link to={navHref(entry, lang)} className="text-white/50 hover:text-white transition-colors">
                      {label}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </div>

      </div>
    </footer>
  )
}
