/**
 * Administration order: rotate facets inside a domain block.
 *
 * The item files are grouped by facet for auditability against the sources
 * (src/data/reference/), which put each facet's twin items side by side on
 * screen — "Worry about things." followed immediately by "Get stressed out
 * easily." reads as a redundancy bug and invites carried-over answers. The
 * published IPIP-NEO inventories interleave items so consecutive ones never
 * probe the same facet; the exact published sequence is not in our sources
 * and is not reconstructed from memory. This applies the design principle
 * instead, inside the domain blocks the instrument pages already present:
 * one pass per facet in file order, repeated — twins end up a full facet
 * cycle apart (6 positions in a 12-item First Quarter block, likewise in a
 * 24-item Full Moon block).
 *
 * Order is presentation only: answers are keyed by item id and scoring is
 * order-blind. Decision of 2026-08-24: this does not bump
 * INSTRUMENT_VERSION (docs/policies/dataset-versions.md, "What does not").
 */
export function rotateFacets(items) {
  const byFacet = new Map()
  for (const it of items) {
    if (!byFacet.has(it.facet)) byFacet.set(it.facet, [])
    byFacet.get(it.facet).push(it)
  }
  const facets = [...byFacet.values()]
  const out = []
  for (let pass = 0; out.length < items.length; pass++) {
    for (const group of facets) if (group[pass]) out.push(group[pass])
  }
  return out
}
