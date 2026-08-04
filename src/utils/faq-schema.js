/**
 * Extract a FAQPage from an article body.
 *
 * SEO.md lists FAQPage among the structured data Cercol emits, and six
 * articles carry a "Common questions" section written for exactly that.
 * Nothing ever emitted it: BlogArticlePage shipped BlogPosting alone, so
 * those sections produced no rich result in any language, English included.
 *
 * Detection is on the shape, not on the section title, because the title is
 * translated: "Common questions", "Preguntes freqüents", "Häufige Fragen".
 * An h3 whose text ends in a question mark is a question in all six
 * languages, and the answer is whatever follows it up to the next heading.
 *
 * Markdown emphasis and links are flattened, because a schema answer is
 * plain text and Google shows it verbatim.
 */

const QUESTION = /^###\s+(.+\?)\s*$/
const HEADING = /^#{1,6}\s/

/** Markdown to the plain text a rich result would display. */
function flatten(md) {
  return md
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')   // links keep their text
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * @param {string} body      the article markdown in the language being shown
 * @param {string} url       canonical URL of the article
 * @param {string} language  BCP 47 code for inLanguage
 * @returns {object|null}    a FAQPage, or null when there is nothing to say
 */
export function buildFaqSchema(body, url, language) {
  if (!body) return null

  const lines = body.split('\n')
  const items = []

  for (let i = 0; i < lines.length; i++) {
    const m = QUESTION.exec(lines[i])
    if (!m) continue

    const answer = []
    for (let j = i + 1; j < lines.length && !HEADING.test(lines[j]); j++) {
      answer.push(lines[j])
    }
    const text = flatten(answer.join(' '))
    // A question with no answer under it is a heading someone wrote and did
    // not finish. Emitting it would put an empty answer in a rich result.
    if (text) items.push({ question: flatten(m[1]), answer: text })
  }

  // One question is a subheading that happens to end in "?", not an FAQ.
  // Two or more in the same article is the section this exists for.
  if (items.length < 2) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url,
    inLanguage: language,
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }
}
