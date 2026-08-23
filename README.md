# Cèrcol — Open-Source Team Personality Assessment

[![Live](https://img.shields.io/badge/live-cercol.team-0047ba)](https://cercol.team)
[![License](https://img.shields.io/badge/license-MIT-427c42)](./LICENSE)
[![Instruments](https://img.shields.io/badge/instruments-IPIP%20public%20domain-f1c22f)](https://ipip.ori.org)
[![Languages](https://img.shields.io/badge/languages-EN%20·%20CA%20·%20ES%20·%20FR%20·%20DE%20·%20DA-111111)](https://cercol.team)
[![IPIP](https://img.shields.io/badge/IPIP-high--quality%20implementation-cf3339)](https://ipip.ori.org/IPIPImplementationsAroundTheWeb.htm)

Cèrcol maps team personality using the **Big Five (OCEAN)** via the
[IPIP public-domain item pool](https://ipip.ori.org/) (Goldberg et al. 2006).
**12 team roles** are derived from the AB5C circumplex (Hofstee, De Raad &
Goldberg 1992) and the team composition literature (Bell 2007; Neuman & Wright 1999).

*"Tot suma, ningú no és imprescindible, però tots som necessaris."*

---

## Project maturity

Cèrcol is a solo project with one reviewer, so the record of how it is built
is kept in the open rather than in anyone's head.

- **[22 architecture decisions](./docs/decisions/)** — why Supabase went, why
  the JWT is self-hosted HS256, why the API runs on Cloudflare Workers. Each
  one says what was rejected and on what evidence.
- **[8 post-mortems](./docs/post-mortems/)** — including the one that matters
  most: the instruments were once written from memory, and the Full Moon set
  shared only 57 of its 120 items with the published IPIP-NEO-120. They were
  rebuilt from source, and the norm corpus was reset to zero rather than
  carried across.
- **[Dataset versions](./docs/policies/dataset-versions.md)** — the instruments
  are at version 7. A change to an item bumps the version, because answers to
  two different item sets are not comparable and nothing can repair that
  afterwards.
- **[CHANGELOG.md](./CHANGELOG.md)** — what changed, month by month.

No test-coverage badge: it is 45% of statements and 31% of functions, and a
badge saying so would be decoration. The suite is 480 tests and runs on every
push; the number is here so it is not a thing you have to go and find out.

## What makes it different

| Feature | Cèrcol | Belbin | DISC | StrengthsFinder |
|---------|--------|--------|------|-----------------|
| Based on Big Five (OCEAN) | ✓ | — | — | — |
| Items: public domain (IPIP) | ✓ | — | — | — |
| Scoring pipeline: published & auditable | ✓ | — | — | — |
| Peer assessment (forced-choice) | ✓ | partial | — | — |
| Blind spot detection (self vs peer) | ✓ | — | — | — |
| Free instruments available | ✓ | — | — | — |
| Open source | ✓ | — | — | — |
| 6 languages incl. Catalan | ✓ | — | — | — |

### Witness peer assessment
Cèrcol's peer assessment (**Witness Cèrcol**) uses **forced-choice adjective
selection** — the assessor picks one best-fit and one worst-fit adjective per
round from a set covering all five OCEAN factors. Forced choice eliminates social
desirability bias that corrupts Likert-scale peer ratings. Up to 12 Witnesses per
subject; scores are averaged. The self and peer profiles are each mapped to
their relevant role archetype(s), and the report compares the two archetype sets,
surfacing any archetype one side sees but the other does not (a **surprise**).

---

## Instruments

| Phase | Instrument | Items | Time | Price |
|-------|-----------|-------|------|-------|
| 🌑 | New Moon Cèrcol (TIPI-based) | 10 | ~2 min | Free |
| 🌓 | First Quarter Cèrcol (IPIP-NEO-60) | 60 | ~10 min | Free |
| 🌕 | Full Moon Cèrcol (IPIP-NEO-120 + Witness + ICAR g) | 120+ | ~25 min | One-time payment |
| 🌗 | Last Quarter Cèrcol (team report) | — | — | Planned |

New Moon and First Quarter are always free — no account required, no payment,
no card. Full Moon produces a definitive role result, Witness peer assessment,
and team report.

---

## Personality dimensions (OCEAN mapping)

| Cèrcol name | Big Five / OCEAN | What it reflects |
|-------------|-----------------|-----------------|
| **Presence** | Extraversion (E) | Energy in a room; initiative vs listening |
| **Bond** | Agreeableness (A) | Cohesion vs productive confrontation |
| **Vision** | Openness to Experience (O) | Innovation vs pragmatism |
| **Discipline** | Conscientiousness (C) | Structure, reliability, follow-through |
| **Depth** | Neuroticism (N) | Emotional range and intensity |

No score is good or bad. Each reflects a tendency. Both ends of every dimension
are functional in the right team context.

---

## The 12 team roles (AB5C-derived)

Roles are derived from intersections of three **balance dimensions**
(Presence × Bond × Vision) at both poles, following the AB5C circumplex
(Hofstee et al. 1992). Discipline and Depth modulate how each role is expressed.

| Role | Profile | One-line essence |
|------|---------|-----------------|
| Dolphin | P+ B+ | When you're in the room, people talk — because you made it easy. |
| Wolf | P+ B− | You don't wait for permission. The team moves because you don't stay quiet. |
| Elephant | P− B+ | You don't take up space — you create it. People explain themselves beside you. |
| Owl | P− B− | You see what others miss because you don't need to be at the centre. |
| Eagle | P+ V+ | You see far and you move there. You bring the team to places it wouldn't go alone. |
| Falcon | P+ V− | Not vision — timing. You know exactly when to move. |
| Octopus | P− V+ | The team's best ideas often passed through you first, in silence. |
| Tortoise | P− V− | You won't make noise. But when you're not there, the team drifts. |
| Bee | B+ V+ | Where others see chaos, you see structure. |
| Bear | B+ V− | You don't change under pressure. That knowing frees others to take risks. |
| Fox | B− V+ | You see what doesn't add up — in ideas and relationships. |
| Badger | B− V− | You're not interested in what should work. You're interested in what works. |

No role is better or worse than another. No role is universally necessary.
Every role is necessary in *some* team configurations.

---

## Scientific foundation

### Measurement
All items come from the **IPIP** (International Personality Item Pool) —
a public-domain collection of personality items with no licence restrictions
for commercial or non-commercial use (Goldberg et al. 2006). Items are
selected by highest confirmatory factor loadings from published validation studies.

### Team role derivation
The 12 roles follow the **AB5C circumplex** structure (Hofstee et al. 1992),
which organises personality as intersections of OCEAN factor pairs. The
selection of Presence (E), Bond (A), and Vision (O) as balance dimensions
requiring team-level representation at both poles is grounded in Bell (2007)
and Neuman & Wright (1999).

### What this system claims
- The personality measurement is valid and replicable (IPIP items, published norms)
- The role definitions follow a principled scientific framework (AB5C)
- The team balance descriptions are logical derivations, not arbitrary design

### What this system does not claim
- That roles predict team performance (no direct evidence for this specific model)
- That the theoretical centroids are empirically correct (validation at N≥300 planned)
- That every team needs all 12 roles

Full scientific documentation: [SCIENCE.md](./SCIENCE.md)

### Language validation
| Language | Items | Standing |
|----------|-------|----------|
| English | Johnson (2014), Maples-Keller et al. (2019) | The instruments themselves, item for item |
| Danish | Vedel, Gøtzsche-Astrup & Holm (2018) | Published translation, used as published. Seven items are Cèrcol's |
| French (Canada) | Gravel, IPIP-NEO-300, on ipip.ori.org | Published translation, used as published |
| French (Europe) | Adapted from Gravel by Cèrcol | 40 of 180 strings changed. Not published, not validated |
| Spanish (Mexico) | Frez Puente & Ortega Luque, on ipip.ori.org | Published translation, used as published. Nine items are Cèrcol's |
| German | Cèrcol | A validated translation exists and is not distributed; a request is pending |
| Catalan | Cèrcol | No published translation exists anywhere |

### References
- Barrick, M. R., & Mount, M. K. (1991). The Big Five personality dimensions and job performance. *Personnel Psychology, 44*(1), 1–26. https://doi.org/10.1111/j.1744-6570.1991.tb00688.x
- Bell, S. T. (2007). Deep-level composition variables as predictors of team performance. *Journal of Applied Psychology, 92*(3), 595–615. https://doi.org/10.1037/0021-9010.92.3.595
- Goldberg, L. R. et al. (2006). The International Personality Item Pool and the future of public-domain personality measures. *Journal of Research in Personality, 40*, 84–96. https://doi.org/10.1016/j.jrp.2005.08.007
- Hofstee, W. K. B., De Raad, B., & Goldberg, L. R. (1992). Integration of the Big Five and circumplex approaches to trait structure. *JPSP, 63*, 146–163. https://doi.org/10.1037/0022-3514.63.1.146
- Maples-Keller, J. L. et al. (2019). Using item response theory to develop a 60-item representation of the NEO PI-R using the IPIP. *Psychological Assessment, 31*(2), 188–203. https://doi.org/10.1037/pas0000544
- Neuman, G. A., & Wright, J. (1999). Team effectiveness: Beyond skills and cognitive ability. *Journal of Applied Psychology, 84*(3), 376–389. https://doi.org/10.1037/0021-9010.84.3.376
- Vedel, A., Gøtzsche-Astrup, O., & Holm, P. (2018). The Danish IPIP-NEO-120. *Nordic Psychology, 71*(1), 62–77. https://doi.org/10.1080/19012276.2018.1470108

Full item pool: https://ipip.ori.org

---

## Privacy

No account required for any instrument. No personal data collected during assessment.

Anonymous scores are logged: instrument name, language, five domain z-scores.
Nothing that identifies you. Account creation is optional (saves result history
and unlocks Full Moon features). Data is stored in a Cloudflare D1 database
in the EU jurisdiction of the Cloudflare account. No third-party analytics.

---

## Stack

- **Frontend**: React + Vite → Cloudflare static assets (cercol.team)
- **Backend**: Cloudflare Worker + D1 (SQLite) + KV (api.cercol.team), `worker/`
- **Auth**: Self-hosted (magic link via Resend, Google OAuth); no passwords
- **Scoring**: 100% client-side JavaScript (no data sent to server during assessment)

---

## Roadmap

**Now**: New Moon, First Quarter, and Full Moon are live. Witness peer assessment is live.
**Next**: Last Quarter Cèrcol — team-level instrument built on accumulated real data.

No dates. No promises. Just the order things need to happen in.

Full roadmap: [ROADMAP.md](./ROADMAP.md)

---

## Development

- Backend architecture: [docs/architecture/backend.md](docs/architecture/backend.md)
- Auth architecture: [docs/architecture/auth.md](docs/architecture/auth.md)
- Operations runbook: [docs/ops/runbook.md](docs/ops/runbook.md)
- Code conventions: [docs/policies/conventions.md](docs/policies/conventions.md)
- Sprint process: [docs/policies/sprint-process.md](docs/policies/sprint-process.md)
- Architecture decisions (ADRs): [docs/decisions/](docs/decisions/)
- Post-mortems: [docs/post-mortems/](docs/post-mortems/)

Local setup:

```
git clone https://github.com/cercol/cercol.git
cd cercol
npm install
npm run dev               # frontend on http://localhost:5173

npx wrangler dev --config worker/wrangler.jsonc   # API on http://localhost:8787
```

Run tests:

```
npm test -- --run          # vitest, includes worker/test
```

---

## Contributing

Contributions are welcome: bug reports, translation fixes, accessibility
improvements, new language support. Open an issue before opening a pull request.

[GitHub Issues](https://github.com/cercol/cercol/issues)

See [CONTRIBUTING.md](CONTRIBUTING.md) for the PR workflow and
the checklist that PRs are reviewed against.

---

## License

MIT
