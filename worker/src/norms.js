/**
 * Empirical population norms, computed from D1, mirroring
 * api/main.py:_recompute_norms and api/scoring.py:resolve_norm.
 *
 * # Spec: SCIENCE.md
 *
 * Two tiers per instrument: per language, and pooled across languages. Only
 * the current INSTRUMENT_VERSION counts, and seeded rows never do.
 *
 * The version filter is the whole reason the stamp exists. A norm is a mean
 * and a spread over answers to the same questions; pooling answers given to
 * two different item sets, or on two different response scales, produces a
 * number that describes neither. Cèrcol's instruments changed on 2026-08-22
 * from something that shared 57 of 120 items with the IPIP-NEO-120 to the
 * IPIP-NEO-120 itself, and from an agreement scale to an accuracy one. Every
 * response recorded before that is real data about a different instrument.
 *
 * Note what this means in practice: the corpus went back to zero that day.
 * Anything reporting progress toward a norming threshold has to count the
 * same way, or it reports a number this function will not use.
 * Each needs NORM_MIN_SAMPLE (200) results before it is used; below that
 * the researcher prior applies. At version 7 the corpus is empty, so this
 * returns the prior everywhere. It is here so that the day a version's
 * corpus crosses 200, nothing has to be written.
 *
 * SQLite has no STDDEV_SAMP. The sample SD is computed from SUM and
 * SUM(x*x): sd = sqrt((ss - n*mean^2) / (n - 1)). The pooled tier merges
 * per-language groups the same way the server does, via (n, sum, sumsq).
 *
 * The server keeps the result in process memory and refreshes it every 28
 * days. Workers are stateless, so the cache lives in KV, with the same
 * refresh window; the reader falls back to computing on a miss.
 */

import { priorFor } from '../../src/utils/role-scoring.js'
import { INSTRUMENT_VERSION } from '../../src/data/instrument-version.js'

export const NORM_MIN_SAMPLE = 200   // api/scoring.py: NORM_MIN_SAMPLE
export const NORM_REFRESH_DAYS = 28  // api/scoring.py: NORM_REFRESH_DAYS
const DOMAINS = ['presence', 'bond', 'discipline', 'depth', 'vision']
const KV_KEY = 'norms:v1'

/** Compute the two-tier cache from D1. Shape matches the server's _norm_cache. */
export async function computeNorms(db) {
  const aggs = DOMAINS.map((d) => `SUM(${d}) AS ${d}_s, SUM(${d}*${d}) AS ${d}_ss`).join(', ')
  const { results: rows } = await db.prepare(
    `SELECT instrument, language, COUNT(*) AS n, ${aggs}
       FROM results
      WHERE ${DOMAINS.map((d) => `${d} IS NOT NULL`).join(' AND ')}
        AND COALESCE(is_seed, 0) = 0
        AND instrument_version = ?1
      GROUP BY instrument, language ORDER BY instrument, language`
  ).bind(INSTRUMENT_VERSION).all()

  const cache = {}
  const accum = {}
  for (const row of rows) {
    const instr = row.instrument, lang = row.language || '__unknown__', n = row.n
    if (n >= NORM_MIN_SAMPLE) {
      cache[instr] ||= {}
      cache[instr][lang] = Object.fromEntries(DOMAINS.map((d) => {
        const mean = row[`${d}_s`] / n
        const varS = n > 1 ? (row[`${d}_ss`] - n * mean * mean) / (n - 1) : 0
        return [d, { mean, sd: Math.sqrt(Math.max(varS, 0)), n }]
      }))
    }
    accum[instr] ||= Object.fromEntries(DOMAINS.map((d) => [d, { n: 0, s: 0, ss: 0 }]))
    for (const d of DOMAINS) {
      const a = accum[instr][d]
      a.n += n; a.s += row[`${d}_s`]; a.ss += row[`${d}_ss`]
    }
  }
  for (const [instr, doms] of Object.entries(accum)) {
    const totalN = doms[DOMAINS[0]].n
    if (totalN < NORM_MIN_SAMPLE) continue
    cache[instr] ||= {}
    cache[instr].__all__ = Object.fromEntries(DOMAINS.map((d) => {
      const a = doms[d], mean = a.s / a.n
      const varP = a.ss / a.n - mean * mean
      return [d, { mean: round4(mean), sd: round4(Math.sqrt(Math.max(varP, 0))), n: a.n }]
    }))
  }
  return { cache, computedAt: new Date().toISOString().replace('Z', '+00:00') }
}
const round4 = (x) => Math.round(x * 1e4) / 1e4

/** Cached norms from KV, recomputed on miss or when older than the window. */
export async function getNorms(env, { force = false } = {}) {
  if (!force && env.NORMS) {
    const hit = await env.NORMS.get(KV_KEY, 'json')
    if (hit && Date.now() - Date.parse(hit.computedAt) < NORM_REFRESH_DAYS * 86400e3) return hit
  }
  const fresh = await computeNorms(env.DB)
  if (env.NORMS) await env.NORMS.put(KV_KEY, JSON.stringify(fresh))
  return fresh
}

const validNorm = (norm) => norm && DOMAINS.every((d) => norm[d] && norm[d].sd > 0)

/** (norm, tierLabel) for an (instrument, language), same tiers as the server. */
export function resolveNorm(instrument, language, cache) {
  const ic = cache?.[instrument] || {}
  if (language && validNorm(ic[language])) return [ic[language], `empirical:${instrument}:${language}`]
  if (validNorm(ic.__all__)) return [ic.__all__, `empirical:${instrument}:*`]
  const { mean, sd } = priorFor(instrument)
  const map = { E: 'presence', A: 'bond', O: 'vision', C: 'discipline', N: 'depth' }
  const prior = Object.fromEntries(Object.entries(map).map(([f, d]) => [d, { mean: mean[f], sd: sd[f] }]))
  return [prior, 'prior']
}

/**
 * How many responses actually count toward norming, per instrument.
 *
 * One definition, used by everything that reports progress toward a
 * threshold, so that no counter can say a number the norms will not use.
 * A response counts when it is not seeded and it was answered under the
 * current instrument version. Everything else is real data about a
 * different instrument.
 *
 * Returns { instrument: n } plus `version`, so a caller can say which
 * version the count belongs to rather than implying it is all-time.
 */
export async function usableCorpus(db) {
  // Grouped by language as well as instrument, because that is the grain
  // computeNorms gates on: NORM_MIN_SAMPLE is required per instrument AND
  // language, not across the corpus. A total that ignores language counts
  // something broader than the threshold it is displayed against, which is
  // how a public meter ends up overstating how close the project is.
  const { results } = await db.prepare(
    `SELECT instrument, language, COUNT(*) AS n FROM results
      WHERE COALESCE(is_seed, 0) = 0 AND instrument_version = ?1
      GROUP BY instrument, language`
  ).bind(INSTRUMENT_VERSION).all()
  const out = { version: INSTRUMENT_VERSION, threshold: NORM_MIN_SAMPLE, total: 0, byLanguage: {} }
  for (const r of results) {
    const lang = r.language || '__unknown__'
    out[r.instrument] = (out[r.instrument] || 0) + r.n
    out.byLanguage[r.instrument] ||= {}
    out.byLanguage[r.instrument][lang] = r.n
    out.total += r.n
  }
  return out
}
