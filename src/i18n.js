/**
 * i18n initialisation.
 * Language priority:
 *   1. localStorage ('cercol-lang') — manual user selection persists across visits
 *   2. navigator.language            — auto-detect on first visit (ca* → CA, else EN)
 *   3. 'en'                          — fallback
 */
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ca from './locales/ca.json'

const STORAGE_KEY = 'cercol-lang'
const saved   = localStorage.getItem(STORAGE_KEY)
const browser = navigator.language?.startsWith('ca') ? 'ca' : 'en'
const initialLang = saved ?? browser

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ca: { translation: ca },
    },
    lng: initialLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
