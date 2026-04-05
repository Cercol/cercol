/**
 * Single source of truth for Cèrcol domain naming.
 *
 * DOMAINS  — full metadata per domain key
 * DOMAIN_KEYS — canonical key order (stable for share URL encoding)
 * TIPI_TO_CERCOL — derived map from TIPI academic key → Cèrcol key
 */

export const DOMAINS = {
  presence:   { cercol: 'Presence',   valencian: 'Presència',   academic: { tipi: 'extraversion',      neo: 'Extraversion'      } },
  bond:       { cercol: 'Bond',       valencian: 'Vincle',      academic: { tipi: 'agreeableness',     neo: 'Agreeableness'     } },
  discipline: { cercol: 'Discipline', valencian: 'Disciplina',  academic: { tipi: 'conscientiousness', neo: 'Conscientiousness'  } },
  depth:      { cercol: 'Depth',      valencian: 'Profunditat', academic: { tipi: 'neuroticism',       neo: 'Neuroticism'       } },
  vision:     { cercol: 'Vision',     valencian: 'Visió',       academic: { tipi: 'openness',          neo: 'Openness'          } },
}

/** Canonical key order — determines encoding order for share URLs. Do not reorder. */
export const DOMAIN_KEYS = ['presence', 'bond', 'discipline', 'depth', 'vision']

/** Map from TIPI academic key → Cèrcol domain key */
export const TIPI_TO_CERCOL = Object.fromEntries(
  Object.entries(DOMAINS).map(([cercol, meta]) => [meta.academic.tipi, cercol])
)
