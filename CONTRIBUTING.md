# Contributing to Cèrcol

Cèrcol is an open-source personality assessment platform built on
peer-reviewed psychometric research. See [README.md](README.md)
for product context and [PRODUCT.md](PRODUCT.md) for vocabulary.

## Before you open a PR

Read the conventions and the sprint process first:

- [docs/policies/conventions.md](docs/policies/conventions.md) -
  English comments, no em dashes, snippet markers, `# Spec:` headers.
- [docs/policies/sprint-process.md](docs/policies/sprint-process.md) -
  when a change needs a spec or an ADR before code.
- [CLAUDE.md](CLAUDE.md) - product-specific conventions
  (Witness vocabulary, IPIP-only, no academic terms in UI).

If your change is an architectural decision (locks in a vendor,
removes an alternative, affects how subsystems talk), open an ADR
first under `docs/decisions/` with status `Proposed` before any
code.

## Docs surface

| Where | What lives there |
|---|---|
| `README.md`, `PRODUCT.md`, `SCIENCE.md`, `SEO.md` | Public-facing canonical docs. |
| `CLAUDE.md` | Project brief for code agents and humans alike. |
| `ROADMAP.md` | Phase history (consolidated) plus pending phases. |
| `docs/policies/` | Rules and conventions. |
| `docs/architecture/` | Subsystem deep-dives. |
| `docs/decisions/` | ADRs (Proposed / Accepted / Superseded). |
| `docs/post-mortems/` | Real-incident records with prevention links. |
| `docs/ops/runbook.md` | Operating procedures for the production VPS. |
| `docs/archive/` | Decayed content kept for audit trail. |

## PR workflow

1. Branch off `main` with a descriptive name. Suggested
   prefixes: `feat/`, `fix/`, `chore/`, `docs/`.
2. Make the change. Keep PRs focused; one logical change per PR.
3. Run the gates locally before opening the PR:

   ```
   npm test -- --run            # vitest
   cd api && python -m pytest -v
   npm run build                # vite build (sanity)
   ```

4. Fill in the PR template. The checklist is not decorative; the
   reviewer reads it.
5. Wait for CI to go green. CI runs the same gates plus
   `markdownlint`, `lychee` (link check), `caddy validate` on the
   snippet, the spec-path validator, and a soft docs-coherence
   check.
6. Address review. When all conversations are resolved and all
   checks are green, the reviewer or maintainer squash-merges.

## Sprint patterns

For multi-phase sprints, see
[docs/policies/sprint-process.md](docs/policies/sprint-process.md).
The current Phase 17.5 sprint (this very PR if you're reading the
PR description) is the canonical example of the autonomous-gates
pattern.

## Reporting issues

[GitHub Issues](https://github.com/cercol/cercol/issues). A good
bug report includes: what you did, what you expected, what you saw,
browser and OS, and a URL if relevant.

## License

By contributing you agree your contributions are licensed under the
project's MIT license (see [LICENSE](LICENSE)).
