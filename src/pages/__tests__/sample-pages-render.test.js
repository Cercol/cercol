// Spec: src/pages/SampleFirstQuarterPage.jsx
//
// /sample shipped throwing. FacetAccordion takes the translation function as
// a prop and the page did not pass it, so the whole page rendered as the
// error boundary, in production, for an hour. Nothing caught it because
// nothing rendered the page: the tests around it checked imports, locale
// keys and the shape of a usePageMeta argument, all of which were fine.
//
// Rendered to static markup, no jsdom: the same snapshot the prerender takes.
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, beforeAll } from 'vitest'

let SampleFirstQuarterPage
let SampleReportPage

beforeAll(async () => {
  // i18n reads a stored language preference at import time.
  globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} }
  await import('../../i18n.js')
  SampleFirstQuarterPage = (await import('../SampleFirstQuarterPage.jsx')).default
  SampleReportPage = (await import('../SampleReportPage.jsx')).default
})

const render = (Page, path) =>
  renderToStaticMarkup(
    createElement(MemoryRouter, { initialEntries: [path] }, createElement(Page)),
  )

describe('the sample reports render', () => {
  it('renders the First Quarter sample without throwing', () => {
    const html = render(SampleFirstQuarterPage, '/sample')
    expect(html.length).toBeGreaterThan(2000)
    // The three sections a reader came for, by their data rather than their copy.
    expect(html, 'role card').toMatch(/role/i)
    expect(html, 'the thirty facets').toContain('30')
    expect(html, 'a link to the test').toContain('/first-quarter')
    expect(html, 'a link to the longer sample').toContain('/sample/full-moon')
  })

  it('renders the Full Moon sample without throwing', () => {
    const html = render(SampleReportPage, '/sample/full-moon')
    expect(html.length).toBeGreaterThan(2000)
  })
})
