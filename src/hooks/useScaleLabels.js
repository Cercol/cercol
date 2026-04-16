/**
 * useScaleLabels — translate scale label keys via i18n with English fallback.
 *
 * @param {string} namespace  — i18n key prefix (e.g. 'scale7', 'scale')
 * @param {Record<string,string>} fallbackObj — key → English fallback label
 * @returns {Record<string,string>} — key → translated (or fallback) label
 *
 * Used by NewMoonPage, FirstQuarterPage, FullMoonPage to avoid duplicating
 * the same Object.fromEntries(Object.entries(...).map(...)) pattern.
 */
import { useTranslation } from 'react-i18next'

export function useScaleLabels(namespace, fallbackObj) {
  const { t } = useTranslation()
  return Object.fromEntries(
    Object.entries(fallbackObj).map(([k, fallback]) => {
      const translated = t(`${namespace}.${k}`)
      return [k, translated !== `${namespace}.${k}` ? translated : fallback]
    })
  )
}
