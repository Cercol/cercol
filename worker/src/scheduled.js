/**
 * Cron entry point. Five triggers carry seven jobs, because the free plan
 * allows five per account and Cèrcol needs exactly that many once the
 * Caddy log parser is dropped (Cloudflare's own analytics replace it).
 *
 * # Spec: docs/architecture/seo-pipeline.md
 *
 *   0 4 * * *   daily 04:00   purge tokens, group nudge, links tick, daily brief
 *   0 5 * * *   daily 05:00   SEO anomaly detector, indexing check, links tick
 *   0 3 * * SUN Sun 03:00     Bing ingest
 *   0 4 * * SUN Sun 04:00     PageSpeed ingest
 *   0 9 * * MON Mon 09:00     links tick, then the weekly digest
 *
 * The link sweep is paced at 15 probes per tick (the free plan allows 50
 * subrequests per invocation and self-chaining does not work), with its
 * cursor in KV; three ticks a week-day means a full sweep of ~200 URLs
 * takes about five days, and the digest reads whatever the latest
 * snapshot is. If a tick fails midway the cursor lets the next resume.
 *
 * Every job is wrapped so one failure never stops the others in the same
 * trigger, and every outcome is logged, which is what the operator reads
 * in the Workers dashboard instead of cron mail.
 */

import { runNudge } from './jobs/nudge.js'
import { runAnomalies } from './jobs/anomalies.js'
import { runBing } from './jobs/bing.js'
import { runPagespeed } from './jobs/pagespeed.js'
import { runLinksTick } from './jobs/links.js'
import { runDigest } from './jobs/digest.js'
import { runDaily } from './jobs/daily.js'
import { runIndexing } from './jobs/indexing.js'

async function purgeTokens(env) {
  const ago = (d) => new Date(Date.now() - d * 86400e3).toISOString()
  const [m, e, r, o] = await env.DB.batch([
    env.DB.prepare(`DELETE FROM magic_tokens WHERE used_at IS NOT NULL OR expires_at < ?`).bind(ago(1)),
    env.DB.prepare(`DELETE FROM email_change_tokens WHERE used_at IS NOT NULL OR expires_at < ?`).bind(ago(1)),
    env.DB.prepare(`DELETE FROM refresh_tokens WHERE (revoked_at IS NOT NULL AND revoked_at < ?1) OR expires_at < ?1`).bind(ago(7)),
    env.DB.prepare(`DELETE FROM oauth_states WHERE expires_at < ?`).bind(ago(1)),
  ])
  // Events older than 120 days, same as the server's daily cron.
  const ev = await env.DB.prepare(`DELETE FROM events WHERE created_at < ?`).bind(ago(120)).run()
  return { magic: m.meta?.changes || 0, email_change: e.meta?.changes || 0, refresh: r.meta?.changes || 0, oauth: o.meta?.changes || 0, events: ev.meta?.changes || 0 }
}

async function step(name, fn) {
  const t0 = Date.now()
  try {
    const out = await fn()
    console.log(`[cron] ${name} ok ${Date.now() - t0}ms ${JSON.stringify(out)}`)
    return out
  } catch (e) {
    console.log(`[cron] ${name} FAILED ${Date.now() - t0}ms ${e.message}`)
    return null
  }
}

/**
 * The sweep runs one tick (15 probes) per invocation and keeps its cursor
 * in KV. There is no self-chaining: a Worker cannot fetch its own routed
 * hostname (loop protection) and the workers.dev hop proved unreliable
 * from a cron context, so the sweep simply advances one tick on every
 * daily trigger and the Monday one. Three ticks a day, 207 URLs, about
 * five days per full sweep. finishSweep writes the snapshot when the
 * cursor reaches the end; the digest reads MAX(ts_date), so it always
 * reports the latest completed snapshot, same as the server did.
 */
async function linksTick(env) { return runLinksTick(env) }
export const linksSweep = linksTick

export const JOBS = {
  '0 4 * * *': async (env) => { await step('purge-tokens', () => purgeTokens(env)); await step('group-nudge', () => runNudge(env)); await step('links-tick', () => linksTick(env)); await step('daily-brief', () => runDaily(env)) },
  '0 5 * * *': async (env) => { await step('seo-anomalies', () => runAnomalies(env)); await step('seo-indexing', () => runIndexing(env)); await step('links-tick', () => linksTick(env)) },
  '0 3 * * SUN': async (env) => { await step('bing-ingest', () => runBing(env)) },
  '0 4 * * SUN': async (env) => { await step('pagespeed-ingest', () => runPagespeed(env)) },
  '0 9 * * MON': async (env) => { await step('links-tick', () => linksTick(env)); await step('weekly-digest', () => runDigest(env)) },
}

/** Named jobs, for POST /admin/jobs/<name>. Runs one, returns its result. */
export const NAMED = {
  'purge-tokens': (env) => purgeTokens(env),
  'group-nudge': (env, opts) => runNudge(env, opts),
  'seo-anomalies': (env) => runAnomalies(env),
  'seo-indexing': (env) => runIndexing(env),
  'bing-ingest': (env) => runBing(env),
  'pagespeed-ingest': (env, opts) => runPagespeed(env, opts),
  'links-tick': (env) => linksTick(env),
  'weekly-digest': (env, opts) => runDigest(env, opts),
  'daily-brief': (env, opts) => runDaily(env, opts),
}

export async function scheduled(event, env, ctx) {
  const job = JOBS[event.cron]
  if (!job) { console.log(`[cron] no job for ${event.cron}`); return }
  ctx.waitUntil(job(env))
}
