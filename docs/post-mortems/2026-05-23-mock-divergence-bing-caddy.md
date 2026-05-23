# 2026-05-23 - Mocks diverged from real APIs (Bing GET, Caddy sublogger)

- **Date of incident**: 2026-05-23 (Phase 17.6.1b deploy)
- **Severity**: medium
- **Impact**: First production run of two ingest jobs failed cleanly
  (no data corruption, no incident visible to end users) because the
  test mocks codified an incorrect understanding of the external
  APIs. Caught at deploy time, fixed in the same session as PR #28
  with regression tests.

## Timeline

- **2026-05-22** - Phase 17.6.1a PR #27 merged. CI green (74 + 7s
  tests). Mocked tests asserted parsing of synthetic responses.
- **2026-05-23 06:18 UTC** - First production run of
  `api/jobs/bing_ingest.py`. Bing returned `HTTP 405 Method Not
  Allowed` on all three methods. Retry loop gave up after 3
  attempts.
- **2026-05-23 06:19 UTC** - First production run of
  `api/jobs/crawl_log_parser.py`. After fixing the
  filesystem-permission setfacl, parser read 4.5 MB of log and
  wrote ZERO rows. A separate `grep -i bot` against the same file
  found 16 crawler hits.
- **2026-05-23 06:22 UTC** - PR #28 shipped both fixes with
  regression tests. Backend deploy rolled out. Re-runs succeeded.

## Root cause

In both cases the mocked tests modelled the wrong shape of the API.
The mock and the code agreed; both were wrong; CI was green.

- **Bing GET vs POST.** The real Bing Webmaster Tools REST surface
  uses GET with `siteUrl` and `apikey` as URL-encoded query
  parameters. The code used POST with a JSON body. The test mock
  accepted any method and returned a canned 200, so it never
  noticed.
- **Caddy logger sublogger.** Caddy emits each access-log line with
  `"logger": "http.log.access.<suffix>"` when the site config
  declares multiple log outputs (in our case `log0`). The code
  checked for exact equality with `"http.log.access"`. The test
  fixture used the exact string, so it never noticed.

In both cases the test was a confirmation bias amplifier: "code
matches mock" is a much weaker statement than "code matches the
real service".

## Fix applied

PR #28, merged in the same session:

- `api/jobs/bing_ingest.py`: `_bing_url` rebuilt with `urllib.parse.quote`;
  `_fetch` uses `client.get()` with the new URL. New test asserts
  `request.method == "GET"` and that both `siteUrl=` and `apikey=`
  appear in the URL.
- `api/jobs/crawl_log_parser.py`: `parse_log_line` accepts both the
  bare `"http.log.access"` and any `"http.log.access.<sub>"` variant.
  New parametrised test covers three logger names.

No production data was written by the broken jobs; both failed
before any BigQuery insert. Tables remained empty until the
post-fix re-run.

## Prevention

- New convention in
  [`docs/policies/conventions.md`](../policies/conventions.md):
  integrations against external APIs must include at least one
  "real contract" smoke check before the PR that ships them is
  merged. The check can be a one-shot manual `curl` against the
  documented endpoint or a recorded VCR-style cassette, but it
  must exercise the actual on-wire shape, not a mock.
- The new convention also explicitly notes that mocks alone are
  insufficient: a green CI run with mocked tests does not prove
  the code can talk to the service.
- Both fix commits include a regression test that asserts the
  real on-wire shape (Bing: GET + query params; Caddy logger:
  prefix match). These tests would have caught both bugs at PR #27
  time if they had existed.

## Lessons learned

- The first time code talks to a new external service is part of
  the sprint that introduces it. "Tests are green, ship it" is not
  enough when the only evidence is internal consistency between
  mock and code.
- A 405 Method Not Allowed is one of the cheapest debug signals
  available; the time-to-diagnosis here was about 5 minutes. The
  cost was the entire Phase 17.6.1a sprint shipping a job that
  could not actually run in production until Phase 17.6.1b
  patched it. Cheap to fix late, expensive to discover late.
- The Caddy logger suffix is a Caddy implementation detail that is
  not obviously documented in the access-log JSON spec; reading
  one real line of production output would have surfaced it
  immediately. Defensive parsing (prefix match) is the durable
  fix; the lesson is to inspect one real artefact before locking
  in parsing assumptions.
