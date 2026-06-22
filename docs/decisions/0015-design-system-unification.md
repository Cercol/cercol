# ADR 0015: Design-system unification

- **Number**: 0015
- **Title**: Unify the staff/admin area onto the shared `components/ui` layer
- **Status**: Proposed
- **Date**: 2026-06-23

## Context

A consolidation audit of the frontend found that the public pages and the
staff/admin area now read as two different designs. The root cause is
concrete and verifiable: `src/pages/AdminDashboardPage.jsx` is the only page
in `src/pages` that imports none of the shared layers. It pulls in React,
`../lib/api`, and `recharts`, and nothing else. Every other page imports
`components/ui`, and most also import `design/tokens`.

Because it imports no shared layer, the admin page hand-rolls its own visual
vocabulary:

- A divergent card string, `bg-white rounded-xl border border-gray-100
  shadow-sm`, repeated about fifteen times. The canonical card in
  `components/ui/Card.jsx` is flat: `bg-white border border-gray-200 rounded`,
  with no shadow and a smaller radius. The two cards do not match, and that
  mismatch is the visible "two designs" drift.
- Roughly 127 raw Tailwind gray utilities (`text-gray-*`, `bg-gray-*`,
  `border-gray-*`) instead of tokens or shared components.
- Hardcoded brand hex values (`#0047ba`, `#427c42`, `#e5e7eb`) for the
  sparkline and the recharts grid, instead of mm-design tokens.
- A phantom font variable, `var(--mm-font-heading)`, which is defined nowhere
  in mm-design or in this repo and therefore resolves to the inherited font.

The report surfaces, by contrast, were consolidated in earlier phases and are
healthy: all six surfaces share `components/report`. The drift is confined to
the staff area.

## Decision

The canonical card and component language for the whole product is the
existing local `components/ui` layer. Specifically, the flat `ui/Card` spec
(rounded, gray-200 border, no shadow) is the single card language. The
staff/admin area migrates onto this shared layer: it stops hand-rolling cards,
tables, inputs and grays, and consumes the shared primitives and mm-design
tokens like every public page already does.

UI primitives stay local in `components/ui` for now. Promoting them into
mm-design is explicit future work and is out of scope for this decision.

## Alternatives considered

- **Promote the admin card style (rounded-xl + shadow) to the canonical
  spec.** Rejected: that would make the admin area the source of truth and
  force every public page to change, which is the larger and riskier blast
  radius. The public surfaces already share `ui/Card`; aligning the single
  outlier is cheaper and safer.
- **Promote `components/ui` into mm-design first, then migrate admin onto
  the published package.** Rejected for now: it couples this consolidation to
  a cross-repo package release. We can promote later once the shared layer has
  settled. Keeping primitives local keeps this program self-contained.
- **Leave the two designs and only tokenise the loose hex.** Rejected: that
  addresses the symptom (raw color) but not the cause (no shared component
  layer), so the visual divergence would persist.

## Consequences

- The admin area inherits the flat card spec and therefore loses the soft
  elevation (shadow, larger radius) it currently has. For a data-dense staff
  surface this is a deliberate trade: consistency over decoration. If the flat
  card later proves too plain for dense tables, the escape hatch is to bump the
  canonical card tokens globally, which lifts every surface at once rather than
  forking the admin look again.
- A small set of new shared primitives (for example `StatCard`, a `Table`
  shell, `Input`/`Select`, and a token-colored `Sparkline`) will be added to
  `components/ui` so the admin page has shared components to land on.
- Color and font drift in the admin area is removed: tokens replace the
  hardcoded hex, and the phantom `--mm-font-heading` is dropped.

This ADR covers items 1 through 9 of the consolidation audit (the design-system
and shared-component work). Two related areas get their own ADRs later and are
explicitly out of scope here:

- The inline-SVG and icon policy (whether icons such as the Cèrcol logo and the
  chevrons move into MoonIcons / mm-design, or are documented as exceptions).
- The backend DB-pool access idioms (`request.app.state.pool` versus the
  module-global `_pool` versus the `_pool()` re-import helper).

## Related

- Consolidation audit (Phase 18 program), items 1 to 9.
- `src/components/ui/Card.jsx` — the canonical flat card spec adopted here.
- `src/pages/AdminDashboardPage.jsx` — the outlier that migrates onto the
  shared layer.
- mm-design `tokens/colors.css`, `tokens/typography.css` — the token source
  the admin area will consume.
