# ADR 0016: Backend DB-pool access unification

- **Number**: 0016
- **Title**: Unify backend DB-pool access behind one accessor
- **Status**: Proposed
- **Date**: 2026-06-23

## Context

The backend reaches the asyncpg connection pool through three different idioms
that all resolve to the same pool object, plus a cross-module import workaround.
This is consolidation audit item #11, and unlike `require_admin` (extracted to
`api/deps.py` in Phase 17.8) it has not been touched.

The single pool is created once at startup and exposed on app state:

- `api/main.py:177` creates it inside the `lifespan` context: `_pool = await
  asyncpg.create_pool(...)`.
- `api/main.py:183` exposes it for routers: `app.state.pool = _pool`.

The three coexisting access idioms (HIGH confidence, file:line):

1. **Dependency-injection via the request** (the clean pattern):
   `request.app.state.pool.acquire()`. Used in `api/deps.py:59` (1 site) and
   `api/blog.py` (7 sites: 153, 180, 211, 231, 262, 293, 341). `deps.py` imports
   nothing from `main`, which is what made the `require_admin` extraction
   cycle-free.
2. **Module-global direct read**: `_pool.acquire()` inside `api/main.py`
   (30 sites, e.g. 92, 509, 520, 557 ... 1617). This works only because the code
   lives in the same module that owns `_pool`.
3. **Lazy re-import helper**: `api/auth.py:84-85` defines `def _pool(): from
   main import _pool as p; return p`, called as `_pool().acquire()` at 8 sites
   (267, 303, 348, 383, 413, 445, 466, 511).

The import cycle that forces idiom 3 (HIGH): `api/main.py:46` does `import auth
as auth_module` at module load, so `main` depends on `auth` at import time. If
`auth.py` tried `from main import _pool` at its top level, that would be a
circular import (main imports auth, auth imports main, both during load). The
lazy function dodges this by importing `main` only when called at request time,
by which point `main` has finished loading. The same workaround appears in the
other direction at `api/main.py:548` (`from auth import _pwd_hash, _pwd_verify`
inside a function), so the cycle leaks lazy imports both ways.

The cost is not a live bug. It is drift: a new endpoint copies whichever idiom
sits nearest, the `auth.py` to `main` lazy import is fragile and easy to break
during refactors, and there is no single place that owns "how you get the pool".

## Decision

Introduce one canonical accessor, `deps.get_pool()`, that reads a module-level
holder in `api/deps.py` populated once at startup, and importing nothing from
`main`. Concretely:

- `api/deps.py` gains a private module global (for example `_POOL`) plus
  `set_pool(pool)` and `get_pool()`. `deps.py` keeps importing nothing from
  `main`, `blog`, or `seo`, exactly as it does today for `require_admin`.
- `api/main.py` `lifespan` calls `deps.set_pool(_pool)` right after
  `create_pool(...)`, alongside the existing `app.state.pool = _pool`. Startup
  order is unchanged: the holder is filled at the same moment the pool is
  created.
- `api/auth.py` replaces the lazy `def _pool(): from main import _pool` with a
  top-level `from deps import get_pool`, and its 8 call sites become
  `get_pool().acquire()`. Because `deps` never imports `main`, there is no cycle
  to dodge, so the lazy-import workaround is deleted outright.
- `api/main.py` 30 sites move from the module-global `_pool.acquire()` to
  `get_pool().acquire()`.
- `api/deps.py` and `api/blog.py` stay on `request.app.state.pool.acquire()` as
  the reference DI pattern for code that already has a `Request`. `app.state.pool`
  continues to mirror the same pool object, so the two access ergonomics (DI via
  request where a Request exists; `get_pool()` where one does not) share one
  source of truth: the holder set at startup.

How this breaks the cycle without changing startup order: the cycle exists only
because `auth` would need `main`. Routing pool access through `deps`, which is a
leaf module with no `main` dependency, removes that need. `main` still imports
`auth` at load; `auth` now imports `deps` (already safe and already done for
`require_admin`); `deps` imports neither. `get_pool()` is only ever called at
request time, after `lifespan` has run `set_pool`, so the holder is always
populated when read.

This is a design proposal. Its runtime equivalence to today's behavior is
**UNVERIFIED (LOW confidence)** until it is implemented and the backend test
suite passes. In particular, the claim that every `get_pool()` call happens
strictly after `set_pool` (never at import time, never before `lifespan`) must
be proven by tests, not assumed.

## Alternatives considered

- **Leave as-is.** Zero risk and zero work, but the three idioms and the
  `auth.py` to `main` cycle persist, new endpoints keep copying whichever idiom
  is nearest, and the lazy cross-module import stays fragile. Rejected because
  the drift is the whole reason #11 was filed.
- **Partial fix: only break the cycle in `auth.py`.** Replace the lazy `from
  main import _pool` with `from deps import get_pool` for the 8 auth sites, and
  leave `main.py` on its 30 module-global reads. Smallest diff, removes the
  genuinely fragile part (the cross-module cycle), but two idioms remain and
  `main.py` still owns a global that other modules must not read directly. A
  reasonable first increment if the full change feels too large to land at once.
- **Full unification (this decision).** All of `main.py` and `auth.py` move to
  `get_pool()`; `deps.py`/`blog.py` stay on request DI. Biggest diff (about 38
  call sites) and behavior-affecting, but it leaves exactly one accessor for
  non-request contexts and one DI pattern for request contexts, with a single
  owner.

## Consequences

- One place owns pool access for non-request code (`deps.get_pool()`), and the
  `auth.py` to `main` import cycle is gone. New endpoints have an obvious,
  copyable pattern.
- The change touches roughly 38 call sites across `api/main.py` (30) and
  `api/auth.py` (8), plus the new accessor in `api/deps.py` and one `set_pool`
  call in `lifespan`. It is purely mechanical but behavior-affecting, so it
  **must land behind the backend test suite**, not by inspection. The migrated
  module (`main.py`) is the largest and least covered surface, so add or extend
  tests that exercise an endpoint per access path before migrating.
- A subtle ordering invariant becomes explicit and must be guarded: `get_pool()`
  must never run before `set_pool()`. Today the module-global has the same
  invariant implicitly (`_pool` is `None` until `lifespan` runs); the accessor
  just names it. A guard that raises a clear error when the holder is unset is
  cheap insurance.
- `app.state.pool` stays as-is, so existing request-DI call sites in
  `deps.py`/`blog.py` do not change and the public behavior of routers is
  untouched.

### Rollback

The change is self-contained and reversible. If the migration regresses, revert
the PR: `main.py` returns to `_pool.acquire()`, `auth.py` returns to its lazy
`_pool()` helper, and `deps.get_pool()`/`set_pool` are removed. No data
migration, no schema change, no server-state change is involved, so rollback is
a code revert and a redeploy.

## Related

- Consolidation audit item #11 (the three pool idioms and the `auth.py` cycle).
- ADR 0015 and Phase 17.8 (`require_admin` extracted to `api/deps.py`): the same
  leaf-module pattern this decision reuses to break the cycle.
- `api/main.py:177,183` (pool creation and `app.state.pool` exposure),
  `api/auth.py:84` (the lazy re-import helper this decision deletes),
  `api/main.py:46` (the `import auth` that creates the cycle).
