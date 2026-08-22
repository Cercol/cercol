import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { createInstance } from 'i18next'
import VariantPicker from '../VariantPicker'
import en from '../../locales/en.json'
import fr from '../../locales/fr.json'
import ca from '../../locales/ca.json'

const i18n = createInstance()
await i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, fr: { translation: fr }, ca: { translation: ca } },
  lng: 'en', fallbackLng: 'en', interpolation: { escapeValue: false },
})

const render = () =>
  renderToStaticMarkup(createElement(I18nextProvider, { i18n }, createElement(VariantPicker, { value: null, onChange: () => {} })))

describe('VariantPicker', () => {
  it('shows nothing for a language with one variety', async () => {
    await i18n.changeLanguage('ca')
    expect(render()).toBe('')
    await i18n.changeLanguage('en')
    expect(render()).toBe('')
  })

  it('offers both French varieties, European first', async () => {
    await i18n.changeLanguage('fr')
    const html = render()
    expect(html).toContain('Français (Europe)')
    expect(html).toContain('Français (Canada)')
    expect(html.indexOf('Europe')).toBeLessThan(html.indexOf('Canada'))
    await i18n.changeLanguage('en')
  })

  it('names the source of each option, so a reader can tell what they are answering', async () => {
    await i18n.changeLanguage('fr')
    const html = render()
    expect(html).toContain('Gravel')
    expect(html).toContain('Thiry')
    await i18n.changeLanguage('en')
  })

  it('says the default is an adaptation rather than a published text', async () => {
    await i18n.changeLanguage('fr')
    // fr-FR is Cèrcol's adaptation; the note must not claim it is published.
    expect(render()).toContain('adapt')
    await i18n.changeLanguage('en')
  })
})
