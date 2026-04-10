/**
 * i18n initialisation.
 * Language priority:
 *   1. localStorage ('cercol-lang') — manual user selection persists across visits
 *   2. navigator.language            — auto-detect on first visit
 *                                      fr* → FR, de* → DE, ca* → CA, es* → ES, else EN
 *   3. 'en'                          — fallback
 */
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ca from './locales/ca.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import de from './locales/de.json'

const STORAGE_KEY = 'cercol-lang'
const saved   = localStorage.getItem(STORAGE_KEY)
const browser = navigator.language?.startsWith('fr') ? 'fr'
              : navigator.language?.startsWith('de') ? 'de'
              : navigator.language?.startsWith('ca') ? 'ca'
              : navigator.language?.startsWith('es') ? 'es'
              : 'en'
const initialLang = saved ?? browser

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ca: { translation: ca },
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de },
    },
    lng: initialLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
