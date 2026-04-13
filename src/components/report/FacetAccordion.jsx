/**
 * FacetAccordion — collapsible per-domain facet accordion.
 * Used in FirstQuarterResultsPage and FullMoonResultsPage.
 *
 * First domain is expanded by default.
 * Print: all panels are forced open via .facet-accordion-panel and
 * the @media print rule in index.css.
 *
 * Both FQ and FM use the fqFacets namespace for facet names and
 * descriptions — these are the same 30 IPIP facets.
 */
import { useState } from 'react'
import { Card } from '../ui'
import { colors } from '../../design/tokens'

const DOMAIN_BAR_HEX = {
  depth:      '#ef4444',
  presence:   '#fbbf24',
  vision:     '#427c42',
  bond:       '#10b981',
  discipline: '#2563eb',
}

export default function FacetAccordion({
  domainKeys,       // string[] — ordered domain list (e.g. DOMAIN_KEYS)
  domainMeta,       // { [key]: { facets: string[] } } — FQ_DOMAIN_META or FM_DOMAIN_META
  facets,           // { [facetKey]: number } — scored facet values
  scoreToPercent,   // (score: number) => number 0–100
  scoreLabel,       // (score: number) => 'low' | 'moderate' | 'high'
  domainNs,         // i18n namespace for domain names, e.g. 'fqDomains' or 'fmDomains'
  labelNs,          // i18n namespace for score labels, e.g. 'fqResults' or 'fmResults'
  facetCountLabel,  // translated word for "facets" (e.g. "facets", "facetes")
  t,                // i18n translation function
}) {
  const [expanded, setExpanded] = useState(
    Object.fromEntries(domainKeys.map((k, i) => [k, i === 0]))
  )

  function toggle(key) {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="flex flex-col gap-2">
      {domainKeys.map((domainKey) => {
        const domainFacets = domainMeta[domainKey].facets
        const isExpanded   = expanded[domainKey] ?? false
        const barHex       = DOMAIN_BAR_HEX[domainKey]

        return (
          <Card key={domainKey} className="overflow-hidden">
            {/* Domain header — clickable toggle */}
            <button
              onClick={() => toggle(domainKey)}
              className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: barHex }}
              />
              <span className="text-sm font-semibold flex-1" style={{ color: colors.textPrimary }}>
                {t(`${domainNs}.${domainKey}.name`)}
              </span>
              <span className="text-xs tabular-nums" style={{ color: colors.textMuted }}>
                {domainFacets.length} {facetCountLabel}
              </span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                style={{ color: colors.textMuted }}
              >
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Facet grid — visible when expanded; forced open in print via CSS class */}
            <div className={`facet-accordion-panel${isExpanded ? '' : ' hidden'} px-5 pb-4 border-t border-gray-100`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mt-4">
                {domainFacets.map((facetKey) => {
                  const score       = facets[facetKey]
                  const pct         = scoreToPercent(score)
                  const tier        = scoreLabel(score)
                  const descVariant = score > 3.5 ? 'high' : score < 2.5 ? 'low' : null
                  return (
                    <div key={facetKey}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium" style={{ color: colors.textPrimary }}>
                          {t(`fqFacets.${facetKey}.label`)}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <span className="text-xs font-semibold tabular-nums" style={{ color: colors.textMuted }}>
                            {score}/5
                          </span>
                          <span
                            className="text-xs font-semibold px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: barHex + '22', color: barHex }}
                          >
                            {t(`${labelNs}.scoreLabels.${tier}`)}
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: barHex }}
                        />
                      </div>
                      {descVariant && (
                        <p className="text-xs leading-relaxed mt-1" style={{ color: colors.textMuted }}>
                          {t(`fqFacets.${facetKey}.${descVariant}`)}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
