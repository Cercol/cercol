# Policies

Rules and conventions the project agrees to follow. Not technical
content (that lives in `docs/architecture/`) and not historical
context (that lives in `docs/archive/`).

## Philosophy

Prevention via convention plus automated enforcement, not via memory.
Every policy in this directory should aim to make the wrong thing
hard or impossible, not just discouraged. Where a policy cannot be
enforced automatically, it must be paired with a CI check, a
pre-commit hook, or a PR-template checkbox.

## Documents

- `identities.md` — separation of human and service identities.
  Which account owns each token, how to rotate, how to onboard a
  new service. Lists the current ownership state and the migration
  backlog toward `hello@cercol.team`.
- `sprint-process.md` — when a sprint needs a written spec or ADR
  before code, and when the long-running autonomous-sprint pattern
  with gates between phases applies.
- `docs-maintenance.md` — the decay table. When each kind of
  document is archived, the format of the line that replaces it in
  the live doc, and the cadence of the quarterly sweep.
- `post-mortems.md` — when to write a post-mortem and how. Always
  ends with a link to the policy that would have prevented it (or
  with a new policy added to this directory).
- `conventions.md` — code conventions consolidated from CLAUDE.md
  and from lessons baked into past PRs. Comments in English, no em
  dashes, snippets only in PR descriptions, `# Spec:` markers on
  modules with dedicated docs.
