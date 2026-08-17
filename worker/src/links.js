/**
 * Markdown link and DOI extraction, ported from api/blog_links.py and
 * api/doi_check.py so the link check job sees exactly what the server did.
 *
 * # Spec: docs/architecture/seo-pipeline.md
 */

const AUTOLINK = /<((?:https?:\/\/|\/)[^>\s]+)>/g
const HREF = /href="([^"]+)"/gi
const TITLE_SUFFIX = /^(\S+)\s+["'].*["']$/

/** Destinations from markdown [text](dest) links, parens balanced. */
function mdLinkTargets(md) {
  const out = []
  let i = 0
  while (true) {
    const open = md.indexOf('](', i)
    if (open === -1) break
    let j = open + 2, depth = 1, buf = ''
    while (j < md.length && depth > 0) {
      const ch = md[j]
      if (ch === '(') { depth++; buf += ch }
      else if (ch === ')') { depth--; if (depth > 0) buf += ch }
      else buf += ch
      j++
    }
    let dest = buf.trim()
    const t = dest.match(TITLE_SUFFIX)
    if (t) dest = t[1]
    dest = dest.replace(/^<|>$/g, '').trim()
    if (dest) out.push(dest)
    i = j
  }
  return out
}

/** All link targets in one markdown body, deduped, order preserved. */
export function extractLinkTargets(md) {
  if (!md) return []
  const found = [...mdLinkTargets(md), ...[...md.matchAll(AUTOLINK)].map((m) => m[1]), ...[...md.matchAll(HREF)].map((m) => m[1])]
  return [...new Set(found.filter((u) => u && !u.startsWith('#') && !u.startsWith('mailto:') && !u.startsWith('tel:')))]
}

export const isInternal = (url) => url.startsWith('/') || url.includes('cercol.team')

const LANGS = ['en', 'ca', 'es', 'fr', 'de', 'da']
export const langsWithContent = (content) =>
  content && typeof content === 'object' ? LANGS.filter((l) => typeof content[l] === 'string' && content[l].trim()) : []

const DOI = /\b(10\.\d{4,9}\/[^\s\\"'<>\]}]+)/gi
const TRAILING = new Set(['.', ',', ';', ':', '*', '_'])
export const RESOLVER = 'https://doi.org/'

function trimDoi(doi) {
  while (doi) {
    const last = doi[doi.length - 1]
    if (TRAILING.has(last)) doi = doi.slice(0, -1)
    else if (last === ')' && (doi.match(/\(/g) || []).length < (doi.match(/\)/g) || []).length) doi = doi.slice(0, -1)
    else break
  }
  return doi
}

/** Every distinct DOI in one body, lowercased, order preserved. */
export function extractDois(text) {
  if (!text) return []
  return [...new Set([...text.matchAll(DOI)].map((m) => trimDoi(m[1]).toLowerCase()).filter(Boolean))]
}

/** doi.org URLs normalised to lowercase canonical form; others unchanged. */
export function doiUrl(url) {
  const low = url.toLowerCase()
  for (const p of ['https://doi.org/', 'http://doi.org/', 'https://dx.doi.org/']) if (low.startsWith(p)) return RESOLVER + low.slice(p.length)
  return url
}
