import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const read = (f) => readFileSync(resolve(__dirname, '..', f), 'utf8')

// /sample and /sample/full-moon are two different documents. The First
// Quarter page shipped with titleKey/descKey, which usePageMeta does not
// accept, so it served the site's default title; and the Full Moon page kept
// path '/sample/' after it moved, which declares the other page as its
// canonical and tells a crawler the two are the same document.
describe('the two sample pages', () => {
  const fq = read('SampleFirstQuarterPage.jsx')
  const fm = read('SampleReportPage.jsx')

  it('uses the props usePageMeta actually takes', () => {
    for (const [name, src] of [['first quarter', fq], ['full moon', fm]]) {
      expect(src, `${name} uses titleKey`).not.toContain('titleKey')
      expect(src, `${name} uses descKey`).not.toContain('descKey')
      expect(src, `${name} title`).toMatch(/usePageMeta\(\{[\s\S]{0,400}title:/)
    }
  })

  it('gives each page its own canonical', () => {
    expect(fq).toMatch(/path: '\/sample\/'/)
    expect(fm).toMatch(/path: '\/sample\/full-moon\/'/)
  })

  it('names a title key that exists in the locale', () => {
    const en = JSON.parse(read('../locales/en.json'))
    expect(en.sample.fq.title).toBeTruthy()
    expect(en.sample.fq.subtitle).toBeTruthy()
  })
})
