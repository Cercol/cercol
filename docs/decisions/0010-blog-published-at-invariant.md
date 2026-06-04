# ADR 0010: enforce the published_at invariant for published blog posts via a DB CHECK constraint

- **Number**: 0010
- **Title**: enforce the published_at invariant for published blog posts via a DB CHECK constraint
- **Status**: Proposed
- **Date**: 2026-06-04

## Context

The `/blog` list query surfaced 25 rows with `status = 'published'` but
`published_at IS NULL`. This produced two symptoms: on Postgres a bare
`ORDER BY published_at DESC` places NULLs first, so the undated articles ranked
as the newest on the blog index; and the sitemap emitted those 25 entries with
no `<lastmod>`.

Every application write path stamps the date:

- `api/blog.py` `create_post` sets `published_at = now()` whenever
  `status == 'published'`.
- The PUT/PATCH publish transitions set `published_at` on first publish when it
  was previously NULL.

So the invariant "a published post has a non-null published_at" already holds for
anything written through the app. The 25 violations therefore came from an
out-of-repo bulk write that inserted/published rows directly in the database,
bypassing the application entirely.

Two changes address this in layers:

- PR #49 fixed the ordering symptom (`ORDER BY published_at DESC NULLS LAST,
  id DESC`).
- Migration 017 backfills the data (`published_at = created_at` for the affected
  rows).

Neither prevents the same class of bug from recurring on the next direct DB
write. This ADR is about where the durable guard belongs.

## Decision

Add, in a follow-up migration **018 applied AFTER 017**, a table CHECK
constraint:

```sql
CHECK (status <> 'published' OR published_at IS NOT NULL)
```

The guard lives at the **DB layer** because that is where the violation actually
occurred. The application already enforces the invariant on every write path, so
an app-level check would add nothing the app already does — and, critically, it
would not have caught the bulk loader that bypassed the app. Only a constraint
inside Postgres rejects a bad direct write.

018 must run after 017: the constraint cannot be added while the 25 violating
rows still exist (Postgres validates existing rows when the constraint is added),
so the backfill has to land first.

## Alternatives considered

- **`published_at NOT NULL`**. Rejected: it forbids draft rows from having a null
  `published_at`, but drafts legitimately have no publish date. A blanket
  NOT NULL would break the draft workflow.
- **`published_at TIMESTAMPTZ DEFAULT now()`**. Rejected: a default silently
  stamps a possibly-wrong date on any insert that omits the column, which is
  exactly how a bulk loader would have produced plausible-but-wrong dates. It
  hides the bug instead of surfacing it; the point is to fail loudly.
- **App-level validation only**. Rejected: the app already stamps the date on
  every write path, yet the violation still happened — because the offending
  write bypassed the app. An app-level check cannot guard a direct DB write.

## Consequences

- Any future write that publishes a post without a date — including a direct DB
  write or a bulk loader — errors loudly at insert/update time instead of
  silently producing an undated published row.
- Migration 018 depends on 017 having been applied first; adding the constraint
  before the backfill would fail on the existing violating rows.
- Drafts may still have `published_at IS NULL`; the constraint only binds rows
  whose `status = 'published'`.

## Open question for sign-off

Confirm that draft posts (`status <> 'published'`) are allowed to have a null
`published_at`. This ADR assumes yes (the constraint is intentionally scoped to
published rows only). If drafts must also carry a date, the constraint shape
changes and this ADR needs revisiting before 018 is written.

## Related

- PR #49 (deterministic blog ordering; fixed the ordering symptom).
- `db/migrations/017_blog_backfill_published_at.sql` (backfills the data; must
  precede 018).
- `api/blog.py` `create_post` and the publish transitions (the app-level write
  paths that already hold the invariant).
- `db/migrations/013_blog_posts.sql` (blog_posts DDL).
