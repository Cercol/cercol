/**
 * Crawler traffic on cercol.team from Cloudflare's own analytics.
 *
 * # Spec: docs/architecture/seo-pipeline.md
 *
 * Replaces api/jobs/crawl_log_parser.py, which read Caddy's access log on
 * the Hetzner box and had been blind since 2026-05-28 (a directory ACL on
 * a shared /var/log/caddy). That parser only ever saw api.cercol.team;
 * this sees the whole site, because the frontend now sits behind
 * Cloudflare too. One GraphQL query, no ingest table, no cursor: the data
 * lives at Cloudflare and is read when the digest wants it.
 *
 * Bot names are matched on the User-Agent the same way the old parser did
 * (self-identifying tokens), so the digest's "crawler" vocabulary does not
 * change. Needs CF_ANALYTICS_TOKEN (Zone Analytics Read) and the zone id.
 */

const BOTS = [
  ['googlebot', 'Googlebot'], ['bingbot', 'Bingbot'], ['duckduckbot', 'DuckDuckBot'], ['yandexbot', 'YandexBot'],
  ['applebot', 'Applebot'], ['baiduspider', 'Baiduspider'], ['petalbot', 'PetalBot'],
  ['gptbot', 'GPTBot'], ['chatgpt-user', 'ChatGPT-User'], ['oai-searchbot', 'OAI-SearchBot'],
  ['claudebot', 'ClaudeBot'], ['claude-web', 'Claude-Web'], ['anthropic-ai', 'anthropic-ai'],
  ['perplexitybot', 'PerplexityBot'], ['google-notebooklm', 'Google-NotebookLM'], ['ccbot', 'CCBot'],
  ['amazonbot', 'Amazonbot'], ['bytespider', 'Bytespider'], ['meta-externalagent', 'Meta-ExternalAgent'],
  ['semrushbot', 'SemrushBot'], ['ahrefsbot', 'AhrefsBot'], ['mj12bot', 'MJ12bot'],
  ['facebookexternalhit', 'facebookexternalhit'], ['twitterbot', 'Twitterbot'], ['linkedinbot', 'LinkedInBot'],
]

export function classifyBot(ua) {
  const u = (ua || '').toLowerCase()
  for (const [tok, name] of BOTS) if (u.includes(tok)) return name
  return null
}

async function oneDay(env, sinceIso, untilIso) {
  const q = `{ viewer { zones(filter:{zoneTag:"${env.CF_ZONE_ID}"}) {
      httpRequestsAdaptiveGroups(limit: 500, filter:{datetime_geq:"${sinceIso}", datetime_lt:"${untilIso}", clientRequestHTTPHost:"cercol.team"}, orderBy:[count_DESC]) {
        count dimensions { userAgent } } } } }`
  const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST', headers: { authorization: `Bearer ${env.CF_ANALYTICS_TOKEN}`, 'content-type': 'application/json' },
    body: JSON.stringify({ query: q }),
  })
  const d = await res.json()
  if (d?.errors?.length) throw new Error(d.errors[0].message)
  return d?.data?.viewer?.zones?.[0]?.httpRequestsAdaptiveGroups || []
}

/**
 * { byBot: [[name, hits]...], total } for cercol.team between two ISO
 * datetimes. The free plan caps each adaptive query at a one-day window,
 * so a week is seven queries summed; that is seven subrequests, well
 * inside the digest's budget.
 */
export async function crawlerHits(env, sinceIso, untilIso) {
  if (!env.CF_ANALYTICS_TOKEN || !env.CF_ZONE_ID) return { byBot: [], total: 0, pending: true }
  const c = {}
  let total = 0
  for (let t = Date.parse(sinceIso); t < Date.parse(untilIso); t += 86400e3) {
    const a = new Date(t).toISOString(), b = new Date(Math.min(t + 86400e3, Date.parse(untilIso))).toISOString()
    for (const g of await oneDay(env, a, b)) {
      const name = classifyBot(g.dimensions.userAgent)
      if (!name) continue
      c[name] = (c[name] || 0) + g.count; total += g.count
    }
  }
  return { byBot: Object.entries(c).sort((x, y) => y[1] - x[1]), total, pending: false }
}
