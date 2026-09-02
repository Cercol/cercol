/**
 * BigQuery from a Worker: service-account auth and query, no SDK.
 *
 * # Spec: docs/architecture/seo-pipeline.md
 *
 * Google's Python client does three things the jobs need: sign a JWT with
 * the service account's RSA key, swap it for an access token, and POST a
 * query. Each is one WebCrypto or fetch call. The service-account JSON
 * (the file GOOGLE_APPLICATION_CREDENTIALS pointed at on the server) is
 * stored whole as the GOOGLE_SA_JSON secret.
 *
 * Tokens are cached in KV for their lifetime minus a minute so a weekly
 * digest that runs six queries signs once, not six times.
 */

const enc = new TextEncoder()
const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

/** PEM PKCS8 -> CryptoKey for RS256. */
async function importRsaKey(pem) {
  const der = Uint8Array.from(atob(pem.replace(/-----[A-Z ]+-----/g, '').replace(/\s+/g, '')), (c) => c.charCodeAt(0))
  return crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign'])
}

/**
 * An access token for one Google API scope, cached in KV per scope.
 *
 * The same service account signs for BigQuery and, once it is added as a
 * user of the Search Console property, for the Search Console API. One
 * cache entry per scope: a token minted for BigQuery is not accepted by
 * searchconsole.googleapis.com.
 */
export async function accessToken(env, scope = 'https://www.googleapis.com/auth/bigquery') {
  const cacheKey = `bq:access-token:${scope}`
  if (env.NORMS) {
    const hit = await env.NORMS.get(cacheKey, 'json')
    if (hit && hit.exp > Date.now() / 1000 + 60) return hit.token
  }
  const sa = JSON.parse(env.GOOGLE_SA_JSON)
  const now = Math.floor(Date.now() / 1000)
  const header = b64url(enc.encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })))
  const claims = b64url(enc.encode(JSON.stringify({
    iss: sa.client_email, scope,
    aud: sa.token_uri || 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600,
  })))
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', await importRsaKey(sa.private_key), enc.encode(`${header}.${claims}`))
  const assertion = `${header}.${claims}.${b64url(sig)}`
  const res = await fetch(sa.token_uri || 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  })
  if (!res.ok) throw new Error(`google token ${res.status}: ${await res.text()}`)
  const { access_token, expires_in } = await res.json()
  if (env.NORMS) await env.NORMS.put(cacheKey, JSON.stringify({ token: access_token, exp: now + expires_in }), { expirationTtl: expires_in })
  return access_token
}

/**
 * Run a query and return rows as plain objects. Uses the jobs.query
 * endpoint with useLegacySql=false, and pages through jobs.getQueryResults
 * if the first response is not complete or has more pages. Values arrive as
 * strings from BigQuery; numeric columns are converted from the schema.
 */
export async function query(env, sql, { project = env.BIGQUERY_PROJECT || 'cercol', timeoutMs = 30000 } = {}) {
  const tok = await accessToken(env)
  const auth = { authorization: `Bearer ${tok}`, 'content-type': 'application/json' }
  let res = await fetch(`https://bigquery.googleapis.com/bigquery/v2/projects/${project}/queries`, {
    method: 'POST', headers: auth, body: JSON.stringify({ query: sql, useLegacySql: false, timeoutMs }),
  })
  if (!res.ok) throw new Error(`bigquery ${res.status}: ${await res.text()}`)
  let body = await res.json()
  const jobId = body.jobReference?.jobId, location = body.jobReference?.location
  // Wait for completion if needed.
  while (!body.jobComplete) {
    res = await fetch(`https://bigquery.googleapis.com/bigquery/v2/projects/${project}/queries/${jobId}?location=${location}&timeoutMs=${timeoutMs}`, { headers: auth })
    body = await res.json()
  }
  const fields = body.schema?.fields || []
  const conv = (f, v) => {
    if (v == null) return null
    if (['INTEGER', 'INT64'].includes(f.type)) return parseInt(v, 10)
    if (['FLOAT', 'FLOAT64', 'NUMERIC', 'BIGNUMERIC'].includes(f.type)) return parseFloat(v)
    if (f.type === 'BOOLEAN' || f.type === 'BOOL') return v === 'true' || v === true
    return v
  }
  const rows = []
  const collect = (rs) => { for (const r of rs || []) rows.push(Object.fromEntries(fields.map((f, i) => [f.name, conv(f, r.f[i].v)]))) }
  collect(body.rows)
  let pageToken = body.pageToken
  while (pageToken) {
    res = await fetch(`https://bigquery.googleapis.com/bigquery/v2/projects/${project}/queries/${jobId}?location=${location}&pageToken=${pageToken}`, { headers: auth })
    body = await res.json(); collect(body.rows); pageToken = body.pageToken
  }
  return rows
}

/**
 * Batch load (NDJSON load job) — what bing/pagespeed/links/anomalies ingest use.
 *
 * Was tabledata.insertAll, but streaming inserts are the one BigQuery SKU
 * with no free tier (billed per row, 1 KB minimum), and they were the whole
 * monthly invoice. Load jobs are free of charge, and their rows land outside
 * the streaming buffer, so the delete-then-insert pattern can always delete
 * them (streamed rows are undeletable for ~30 min).
 */
export async function insertRows(env, dataset, table, rows, { project = env.BIGQUERY_PROJECT || 'cercol' } = {}) {
  if (!rows.length) return { inserted: 0 }
  const tok = await accessToken(env)
  const boundary = 'cercol-bq-load'
  const meta = { configuration: { load: { destinationTable: { projectId: project, datasetId: dataset, tableId: table }, sourceFormat: 'NEWLINE_DELIMITED_JSON' } } }
  const body = [
    `--${boundary}`, 'content-type: application/json', '', JSON.stringify(meta),
    `--${boundary}`, 'content-type: application/octet-stream', '', rows.map((r) => JSON.stringify(r)).join('\n'),
    `--${boundary}--`,
  ].join('\r\n')
  let res = await fetch(`https://bigquery.googleapis.com/upload/bigquery/v2/projects/${project}/jobs?uploadType=multipart`, {
    method: 'POST', headers: { authorization: `Bearer ${tok}`, 'content-type': `multipart/related; boundary=${boundary}` }, body,
  })
  if (!res.ok) throw new Error(`bigquery load ${res.status}: ${await res.text()}`)
  let job = await res.json()
  const { jobId, location } = job.jobReference
  while (job.status?.state !== 'DONE') {
    await new Promise((r) => setTimeout(r, 500))
    res = await fetch(`https://bigquery.googleapis.com/bigquery/v2/projects/${project}/jobs/${jobId}?location=${location}`, { headers: { authorization: `Bearer ${tok}` } })
    if (!res.ok) throw new Error(`bigquery load poll ${res.status}: ${await res.text()}`)
    job = await res.json()
  }
  if (job.status.errorResult) throw new Error(`bigquery load: ${JSON.stringify(job.status.errors || job.status.errorResult).slice(0, 300)}`)
  return { inserted: rows.length }
}

/** DML (DELETE/INSERT) — for the delete-then-insert partition pattern the ingests use. */
export const execute = (env, sql, opts) => query(env, sql, opts)
