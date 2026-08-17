/**
 * Byte-compare the Worker against the FastAPI server it is replacing.
 *
 * # Spec: docs/architecture/seo-pipeline.md
 *
 * Runs every public read endpoint against both origins and diffs the JSON.
 * The comparison is on the parsed value, not the raw bytes, because key
 * order in a JSON object carries no meaning and Python and V8 do not have
 * to agree on it; everything else — values, nulls, array order, status
 * codes, redirect targets — must match exactly.
 *
 * Array order IS compared, which is the point: /blog is ordered by
 * published_at with an id tiebreak, and 25 articles share one timestamp.
 *
 * Usage:
 *   node scripts/diff-api.mjs [--old https://api.cercol.team] [--new https://...workers.dev]
 */

const args = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = args.indexOf(name)
  return i === -1 ? fallback : args[i + 1]
}
const OLD = opt('--old', 'https://api.cercol.team')
const NEW = opt('--new', 'https://cercol-api.cercol-team.workers.dev')

/** Stable stringify: sorts object keys so key order never shows as a diff. */
function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

async function probe(base, path) {
  const res = await fetch(base + path, { redirect: 'manual' })
  const out = { status: res.status, location: res.headers.get('location') }
  const text = await res.text()
  try {
    out.body = canonical(JSON.parse(text))
  } catch {
    out.body = text
  }
  return out
}

/** First difference between two probes, or null when identical. */
function difference(a, b) {
  if (a.status !== b.status) return `status ${a.status} vs ${b.status}`
  if ((a.location || null) !== (b.location || null)) return `location ${a.location} vs ${b.location}`
  if (a.body !== b.body) {
    for (let i = 0; i < Math.max(a.body.length, b.body.length); i++) {
      if (a.body[i] !== b.body[i]) {
        return `body differs at char ${i}\n      old: …${a.body.slice(Math.max(0, i - 60), i + 60)}…\n      new: …${b.body.slice(Math.max(0, i - 60), i + 60)}…`
      }
    }
  }
  return null
}

const listing = await (await fetch(`${OLD}/blog`)).json()
const paths = [
  '/blog',
  ...listing.map((a) => `/blog/${a.slug}`),
  // A dead slug that must 308, and one that must 404.
  '/blog/introverts-in-extrovert-workplaces-what-research-says-what-research-says',
  '/blog/this-slug-does-not-exist-anywhere',
]

let failures = 0
for (const path of paths) {
  const [a, b] = await Promise.all([probe(OLD, path), probe(NEW, path)])
  const diff = difference(a, b)
  if (diff) {
    failures++
    console.log(`  DIFF  ${path}\n      ${diff}`)
  }
}

console.log(`\n${paths.length} endpoints compared · ${failures} differing`)
process.exit(failures === 0 ? 0 : 1)
