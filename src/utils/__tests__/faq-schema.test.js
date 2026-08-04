import { describe, it, expect } from 'vitest'
import { buildFaqSchema } from '../faq-schema'

const URL = 'https://cercol.team/blog/what-is-a-facet-in-personality-psychology'

describe('buildFaqSchema', () => {
  it('reads the questions section out of an English article', () => {
    const body = [
      '# What is a facet?',
      '',
      '## Common questions',
      '',
      '### What is a personality facet?',
      '',
      'A facet is a narrower trait inside one of the [Big Five](/blog/x) domains.',
      '',
      '### How many facets does the Big Five have?',
      '',
      'Thirty in the **NEO** model, six per domain.',
    ].join('\n')

    const faq = buildFaqSchema(body, URL, 'en')

    expect(faq['@type']).toBe('FAQPage')
    expect(faq.mainEntity).toHaveLength(2)
    expect(faq.mainEntity[0].name).toBe('What is a personality facet?')
    // Markdown is flattened: a rich result shows the answer verbatim.
    expect(faq.mainEntity[0].acceptedAnswer.text)
      .toBe('A facet is a narrower trait inside one of the Big Five domains.')
    expect(faq.mainEntity[1].acceptedAnswer.text)
      .toBe('Thirty in the NEO model, six per domain.')
  })

  it('works on a translated article, where the section title is not English', () => {
    const body = [
      '## Häufige Fragen',
      '',
      '### Was ist eine Persönlichkeitsfacette?',
      '',
      'Ein schmalerer Zug innerhalb einer Big Five-Domäne.',
      '',
      '### Wie viele Facetten haben die Big Five?',
      '',
      'Dreißig, sechs pro Domäne.',
    ].join('\n')

    const faq = buildFaqSchema(body, URL, 'de')

    expect(faq.inLanguage).toBe('de')
    expect(faq.mainEntity.map(q => q.name)).toEqual([
      'Was ist eine Persönlichkeitsfacette?',
      'Wie viele Facetten haben die Big Five?',
    ])
  })

  it('stops an answer at the next heading of any level', () => {
    const body = [
      '### Why do facets matter?',
      'Because two people can share a domain score.',
      '## Sources',
      '- Poropat (2009).',
      '### Another question?',
      'An answer.',
    ].join('\n')

    const faq = buildFaqSchema(body, URL, 'en')
    expect(faq.mainEntity[0].acceptedAnswer.text)
      .toBe('Because two people can share a domain score.')
  })

  it('ignores a single question, which is a subheading and not a section', () => {
    const body = '### Can you fake a personality test?\n\nSometimes.'
    expect(buildFaqSchema(body, URL, 'en')).toBeNull()
  })

  it('drops a question nobody answered rather than emit an empty answer', () => {
    const body = [
      '### What is a facet?',
      '### How many are there?',
      'Thirty.',
      '### Why does it matter?',
      'Prediction improves.',
    ].join('\n')

    const faq = buildFaqSchema(body, URL, 'en')
    expect(faq.mainEntity.map(q => q.name))
      .toEqual(['How many are there?', 'Why does it matter?'])
  })

  it('returns null for an article with no questions at all', () => {
    expect(buildFaqSchema('## Sources\n- Poropat (2009).', URL, 'en')).toBeNull()
    expect(buildFaqSchema('', URL, 'en')).toBeNull()
  })
})
