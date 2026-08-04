# Fabricated citations in SCIENCE.md and across the blog

## Timeline

**2026-08-04, morning.** A routine pass over blog metadata surfaced nine
articles carrying 25 statistic cards between them with no DOI anywhere.
Three research psychologists were asked to source or remove each figure.
They found worse than absent sourcing: four coefficients with the wrong
sign, one off by more than three times, and four block quotations
attributed to papers that do not contain them, including one attributed
to Lencioni that does not exist.

**Same morning.** Since the blog was that bad, the same check was run
against the files that define what Cercol claims to be built on. The
norm priors that every z-score divides by cited a DOI that returns 404.
A second DOI resolved to a different paper in a different journal. A
full audit of SCIENCE.md followed, and this is its report.

## Root cause

Nothing verified a citation. `scripts/check_doi_attribution.py` existed
and compared blog DOIs against Crossref, but SCIENCE.md was never in its
scope, and no check anywhere asked whether a number in a prominent card
had a source at all.

The deeper cause is that a plausible citation reads exactly like a real
one. "Neuman & Wright (1999)" attached to a claim about Extraversion
looks no different from the same citation attached to a claim about
Agreeableness, and only reading the paper distinguishes them.

## Fix applied

Blog: migrations 073 and 074. 25 cards down to 8, zero DOIs up to
between three and six per article, in all six languages. Every proposed
DOI was checked against Crossref independently of the agent proposing
it.

SCIENCE.md: three dead or misdirected DOIs corrected, two fabricated
citations replaced with the papers that actually exist, the Step 2
grounding claim narrowed to what Bell (2007) and Neuman & Wright (1999)
report, and the Witness section aligned with the shipped 13-round
design.

The single most consequential finding is not bibliographic. Presence
(Extraversion) is one of three balance dimensions and half the
definition of six of the twelve roles, and neither cited source studied
Extraversion at all. It is now documented as a design decision rather
than an inherited finding.

## Prevention

`scripts/check_translation.py` now fails an article that shows a stat
card and cites no DOI anywhere, matched on the class rather than the tag
after a sweep missed an article writing `<span>` where others write
`<div>`.

Migrations that write JSON assert the shape of the columns rather than
counting violations, per `docs/policies/conventions.md`, because a count
of violations cannot tell "clean" from "gone".

What is not yet automated: nothing checks that a cited paper says what
the sentence claims. That needs reading, and reading is what found every
item below. See `docs/policies/conventions.md` for the citation rules
and `docs/decisions/0019-witness-instrument-scoring.md` for the Witness
design this document had drifted from.

## Lessons learned

A verification query that counts violations passes on missing data.
"Zero over the limit" and "108 readable" mean something together and
nothing apart.

An agent that reports a finding is not a source. Every DOI in this
report was re-checked against Crossref, and every product claim against
the repository, before anything was applied. Two of the agents' own
proposals did not survive that.

A DOI that resolves to the wrong paper is worse than one that 404s,
because nothing looks broken.

---

# SCIENCE.md citation audit

Audited: `/Users/miquelmatoses/Claude/cercol/SCIENCE.md` (645 lines, 14 references, 13 DOIs).

Method: every DOI resolved against the Crossref REST API (authoritative publisher
metadata, not a search snippet). Where a DOI failed or looked suspect, the journal's
full issue table of contents was enumerated from Crossref to establish whether the
cited article exists at all. Abstracts read from PubMed, publisher pages, or the
accepted-manuscript PDF. Numeric claims about the product checked against the shipped
code (`src/utils/witness-scoring.js`, `src/utils/role-scoring.js`, `api/scoring.py`,
`src/data/witness-adjectives.js`) and `docs/decisions/0019-witness-instrument-scoring.md`.

Default verdict is "unverified". Nothing below is inferred from plausibility.

---

## Broken

### B1. Line 591 — Condon & Revelle DOI resolves to a completely different paper

This is the worst class of defect: it resolves, so nobody checks.

Current (line 589–591):

```
- Condon, D. M., & Revelle, W. (2014). The International Cognitive Ability
  Resource. *Intelligence, 46*, 79–90.
  https://doi.org/10.1016/j.intell.2014.05.004
```

`10.1016/j.intell.2014.05.004` resolves to:
Grigoriev, A., & Lynn, R. (2014). *A study of the intelligence of Kazakhs, Russians
and Uzbeks in Kazakhstan.* Intelligence, 46, 40–46. Nothing to do with ICAR.

The volume and pages in SCIENCE.md (46, 79–90) are also wrong, and the title is
truncated. Verified correct record:

```
- Condon, D. M., & Revelle, W. (2014). The international cognitive ability
  resource: Development and initial validation of a public-domain measure.
  *Intelligence, 43*, 52–64.
  https://doi.org/10.1016/j.intell.2014.01.004
```

This DOI is cited in support of line 114 ("g is collected via ICAR"), so the
instrument the product actually administers is currently sourced to a paper about
ethnic-group IQ comparisons in Kazakhstan.

### B2. Lines 485–489 and 576–579 — Cupani (2014): DOI 404s, and the cited article does not exist

Current DOI `10.2466/03.PR0.114k25w4` is not in Crossref. It is one character-block
off a real DOI: `10.2466/13.01.pr0.114k25w4` is Evers, Castle, Prochaska & Prochaska,
*Examining Relationships between Multiple Health Risk Behaviors, Well-Being, and
Productivity*, Psychological Reports 114(3), 843–853 — an unrelated health-behaviour
paper.

I enumerated every Crossref record for Psychological Reports volume 114, issue 3
(2014). There is no Cupani article in that issue and no article at pages 777–797.
The cited article does not exist.

The real paper (full text read, Spanish, journal PDF):

```
- Cupani, M., Pilatti, A., Urrizaga, A., Chincolla, A., & Richaud de Minzi, M. C.
  (2014). Inventario de Personalidad IPIP-NEO: estudios preliminares de adaptación
  al español en estudiantes argentinos. *Revista Mexicana de Investigación en
  Psicología, 6*(1), 55–73.
  https://doi.org/10.32870/rmip.vi.303
```

See W1 and W2 for what the real paper does and does not support.

### B3. Lines 109 and 593–595 — Furnham, Crump & Whelan (1997): the paper does not exist

Current DOI `10.1002/(SICI)1099-0984(199709)11:3<201::AID-PER286>3.0.CO;2-C` is not
in Crossref (nor are the `;2-2` / `;2-1` checksum variants).

I enumerated the full Crossref contents of European Journal of Personality 11(3),
September 1997. The complete issue is:

| Pages | Article |
|---|---|
| 167–185 | De Raad, Perugini & Szirmák — *In Pursuit of a Cross-lingual Reference Structure of Personality Traits* (article id **AID-PER286**) |
| 187–196 | Ferrari et al. — *Exploring the Time Preferences by Procrastinators* |
| 197–209 | Lemos-Giráldez & Fidalgo-Aliste — *Personality Dispositions and Health-related Habits and Attitudes* |
| 211–242 | Van Kampen — *Orderliness as a Major Dimension of Personality* |
| 243–247 | Book reviews |

There is no article at pages 201–213; the page range does not exist in the issue
(197–209 is followed by 211–242). The article id `AID-PER286` embedded in the
fabricated DOI belongs to De Raad, Perugini & Szirmák at pages 167–185. The DOI is a
composite of a real article identifier and an invented page number.

The only real Furnham, Crump & Whelan (1997) paper is:
*Validating the NEO Personality Inventory using assessor's ratings*, Personality and
Individual Differences, 22(5), 669–675, https://doi.org/10.1016/S0191-8869(96)00261-9
— consultants' ratings of 160 managers against NEO-PI scales. It concerns neither
general mental ability as a moderator nor teams, so it cannot be swapped in.

**Recommendation:** delete the reference entry at lines 593–595 entirely, and see W3
for the prose at line 109.

---

## Wrong

### W1. Lines 485–486 — Cupani author list contains a non-name and two people who are not authors

Current:

```
**Validation precedent:** Cupani, M., de Minzi, M. C. R., Pérez, E. R., & Pjurisdición, M. A. (2014).
```

Actual authors, read from the article's own title page:
Marcos Cupani, Angelina Pilatti, Alejandra Urrizaga, Alejandra Chincolla, and María
Cristina Richaud de Minzi.

"Pjurisdición, M. A." is not a person (as suspected, a corrupted token). "Pérez, E. R."
is not an author of this paper. Pilatti, Urrizaga and Chincolla are all missing.

Replacement: `Cupani, M., Pilatti, A., Urrizaga, A., Chincolla, A., & Richaud de Minzi, M. C. (2014).`

### W2. Lines 486–489 — wrong instrument, and "validated" overstates the paper

Current:

```
An assessment of a short measure of personality: The IPIP-NEO-60 in an Argentine sample.
*Psychological Reports, 114*(3), 777–797. This study validated an Argentine Spanish adaptation
of the IPIP-NEO, establishing that the five-factor structure replicates in Spanish-speaking
populations. Cèrcol's translation follows the same item-level translation methodology.
```

What the paper actually says (read in full):

- The instrument is the **300-item** IPIP-NEO, not the IPIP-NEO-60. Verbatim: *"la
  versión original del IPIP-NEO de 300 ítems"* and *"está compuesto por 300 ítems"*.
  The paper's discussion states the 120-item and 50-item reductions are future work.
- The title is *"estudios preliminares de adaptación"* — preliminary adaptation
  studies. The abstract concludes a five-factor solution is *"la más viable"* with
  *"valores de consistencia interna adecuados para la mayoría de las escalas"* (most,
  not all) and explicitly plans *"revisar aquellas escalas donde se observaron índices
  de fiabilidad inadecuados"*. Calling this a validation is stronger than the authors'
  own claim.
- Samples: n = 604 Argentine, compared against n = 647 US.

Recommended replacement for lines 485–489:

```
**Validation precedent:** Cupani, M., Pilatti, A., Urrizaga, A., Chincolla, A., &
Richaud de Minzi, M. C. (2014). Inventario de Personalidad IPIP-NEO: estudios
preliminares de adaptación al español en estudiantes argentinos.
*Revista Mexicana de Investigación en Psicología, 6*(1), 55–73. This is a preliminary
Argentine Spanish adaptation of the 300-item IPIP-NEO (n = 604, compared against a US
sample of n = 647). The authors report a five-factor solution as the most viable for
the Argentine sample, with adequate internal consistency for most scales, and flag
several scales for revision. It is a precedent for direct Spanish translation of
public-domain IPIP items, not a validation of the 60-item form Cèrcol uses.
```

The claim survives in weakened form. It does not support a precedent for the
IPIP-NEO-60 specifically.

### W3. Lines 108–109 — the g-moderation claim has no source

Current:

```
There is evidence that g moderates how an OCEAN profile expresses itself in team
contexts (Furnham, Crump & Whelan 1997; Halfhill et al. 2005), but no study has
integrated AB5C and g to define team roles.
```

Neither citation supports it.

- Furnham, Crump & Whelan 1997: the cited paper does not exist (B3). Their real 1997
  paper is a NEO-PI validation against consultants' ratings of managers — not g, not
  teams, not moderation.
- Halfhill et al. 2005: abstract read in full. It is a review of 31 studies of group
  personality composition, framed around four questions about how GPC is
  operationalized and whether it predicts group effectiveness. It does not examine
  general mental ability as a moderator. Its actual findings are that *"variance
  scores correlate negatively with group effectiveness, and minimum scores predict as
  well as mean scores"* and that the effect is stronger in field than lab studies.

Recommended replacement:

```
No study has integrated AB5C and g to define team roles. Adding g to centroids
without specific evidence of the AB5C×g interaction would introduce arbitrariness
disguised as precision.
```

i.e. delete the "There is evidence that g moderates..." clause and both citations. The
conclusion the paragraph draws (exclude g) does not depend on the unsupported premise,
so nothing else in the section needs to change.

### W4. Lines 98–100 — Bell (2007) is credited with a finding its abstract does not report

Current:

```
**Neuroticism (Depth)** is directional downward. Bell (2007) finds a consistent
negative effect of high mean N on team cohesion and performance.
```

Bell's abstract, verbatim from PubMed, lists what emerged: *"team minimum
agreeableness and team mean conscientiousness, openness to experience, collectivism,
and preference for teamwork emerged as strong predictors of team performance in field
studies."* Emotional stability / neuroticism is not among them. Bell's criterion
throughout is **team performance**; team **cohesion** is not a criterion in the paper.

I could not obtain Bell's full results tables (APA PsycNet, ResearchGate and Sage all
gated; searched for the corrected-correlation table and for a PDF). A secondary source
quotes a small positive rho of .13 for mean emotional stability, which I did not treat
as verification because I could not read Bell. So: I cannot rule out a small effect in
the body of the paper, but "consistent" and "cohesion" are both unsupported by
anything I was able to read.

Recommended replacement (defensible without further reading):

```
**Neuroticism (Depth)** is not among the composition variables Bell (2007) found to
predict team performance in field studies. Cèrcol treats it as directional downward on
the general trait literature rather than on a team-level finding, and no cited source
establishes a team role that requires high N as a desirable characteristic.
```

If the original claim is to be kept, it must be re-sourced from Bell's own results
tables, with the operationalization (mean / minimum / variance) and the setting (lab /
field) stated.

### W5. Lines 36–37 and 70 — the Step 2 grounding claim fails for Presence (E)

This is the most consequential item in the audit. Current:

```
The selection of P, B and V as balance dimensions is grounded in Bell (2007) and
Neuman & Wright (1999).
```

and line 70: `...primarily Bell (2007) and Neuman & Wright (1999).`

Neuman & Wright (1999), abstract read in full: 79 four-person human resource work
teams. The only personality traits studied are **Agreeableness and Conscientiousness**.
Extraversion and Openness do not appear. The paper does not address whether teams
benefit from representation at both poles of any trait.

Bell (2007), abstract read in full: extraversion is not among the variables that
emerged as field predictors.

So of the three "balance dimensions":
- **Bond (A)** — supported as *relevant* by both sources.
- **Vision (O)** — supported as *relevant* by Bell (team mean openness).
- **Presence (E)** — **not studied by Neuman & Wright at all, and not among Bell's
  emergent predictors.** A third of the balance model has no support in either cited
  source.

A second problem sits underneath this. Both cited findings are directional-upward
(higher team mean A/C/O and higher team minimum A predict better performance). Neither
reports a bipolar balance effect. And Halfhill et al. (2005) — already in this
reference list — reports that *variance* scores correlate **negatively** with group
effectiveness, which is evidence against the premise that teams benefit from spread
across a trait. The cited literature currently leans against the balance argument
rather than grounding it.

Recommended replacement for lines 36–37:

```
The selection of Bond (A) and Vision (O) draws on Bell (2007), which found team
minimum agreeableness and team mean openness to experience among the strongest
composition predictors of team performance in field studies, and on Neuman & Wright
(1999), which found Agreeableness predictive of team performance and interpersonal
skills in 79 four-person work teams. Neither study examined Extraversion; the
inclusion of Presence (P) as a balance dimension is a design decision, not a finding
carried over from these sources. Neither study tested a bipolar balance effect —
both report directional, mean- or minimum-level relationships — so the claim that
these dimensions require representation at both poles is Cèrcol's hypothesis, not a
result imported from the literature.
```

And line 70 should be narrowed the same way.

### W6. Lines 80–88 — "the team composition literature identifies three OCEAN dimensions with a clear balance effect"

Unverified and unsupported by any source I could read, for the reasons in W5. The
three bullets that follow (Presence/Bond/Vision needing both poles) are stated as
findings of the literature. They are design rationale. Recommend reframing the section
opener as:

```
Cèrcol selects three OCEAN dimensions as balance dimensions, on the hypothesis that
teams need representation at both poles. This is a design hypothesis. The team
composition literature establishes that these dimensions matter at team level (see
"Scientific foundation"); it does not establish a both-poles requirement.
```

### W7. Lines 209–218 — the norm priors are not sourced to a paper that reports them

Current:

```
Source: Johnson (2014) doi:10.1016/j.jrp.2014.05.003;
        Maples-Keller et al. (2019) doi:10.1080/00223891.2017.1381968
```

for the table of NORM_MEAN (E 3.3, A 3.9, C 3.7, N 2.8, O 3.7) and NORM_SD (.72, .58,
.62, .72, .60).

I read the full Johnson (2014) paper. Its four tables are: Table 1 item assignments and
alphas; Table 2 alpha reliability coefficients for IPIP-NEO-300 vs -120 across three
samples; Table 3 correlations with NEO PI-R and acquaintance ratings; Table 4 factor
loadings and the acquiescence index. **There is no table of domain-level means and
standard deviations anywhere in the paper**, and I found no `M =` / `SD =` statement
for any domain score (the only SDs reported are for participant age and for the
acquiescence index).

Maples-Keller et al. (2019) is closed access. Crossref metadata matches SCIENCE.md
exactly, but the abstract is elided by the publisher on Semantic Scholar, and Wiley /
Taylor & Francis / ResearchGate all returned 402/403. **I have not read it and
therefore cannot confirm it reports these values.**

Verdict: unverified. These five means and five SDs are used for every z-score in the
product (`role-scoring.js` NORM_MEAN/NORM_SD, `api/scoring.py` `_NORM_FIVE_POINT`), and
I could not find them in the one cited source I was able to read in full.

For scale: Vedel et al. (2018) Table 4 reports Danish IPIP-NEO-120 domain sums which
convert (÷24 items) to N 2.75 (SD 0.65), E 3.48 (0.58), O 3.34 (0.50), A 4.04 (0.36),
C 3.70 (0.50). Different sample, different population, cited here only to note that
the SCIENCE.md SDs of 0.58–0.72 are wider than every SD in that published table. This
is context, not verification.

Recommended action: either locate the exact table and page in Maples-Keller (2019) and
cite it as `Maples-Keller et al. (2019), Table N`, or change line 209 to:

```
Source: working priors approximating published IPIP-NEO domain distributions. The
exact table these values were taken from has not been re-established; treat them as
Tier 3 priors until replaced with sample statistics at N≥200.
```

Do not leave a page-less attribution to two papers when one of them demonstrably does
not contain the numbers.

### W8. Lines 228–245 and 287–322 — the Witness section documents a design that no longer ships

Not a citation defect, but the section states numbers as facts about the instrument and
every one of them is now wrong. `docs/decisions/0019-witness-instrument-scoring.md`
(Accepted, 2026-08-03) records the change; SCIENCE.md was not updated with it.

| Line | Current text | Shipped code |
|---|---|---|
| 229–230 | "20 rounds total. Witness picks one best fit and one worst fit per round." | `TOTAL_ROUNDS = 13`; three picks per round: best, second best, worst |
| 232–235 | vote calculation with best/worst only | `RANK_WEIGHT = { best: 1, second: 0.5, worst: -1 }` — the second pick and its 0.5 weight are undocumented |
| 240–241 | "fixed 20-round sequence, 15 positive and 5 negative rounds (75/25 split)" | `ROUND_POLARITY` is 20 long but sliced to 13; first 13 entries are 10 positive, 3 negative |
| 243–245 | "each adjective appears in exactly one round across the 20-round sequence" | False. Only 13 of the 20 adjectives per factor are drawn at all, and `buildRounds` reshuffles a pool when exhausted |
| 319–322 | "Witness-specific normative statistics ... will replace the IPIP-NEO priors ... at N≥200" | Already replaced. `NORM_WITNESS` = mean 3.07, SD 1.03 in both `src/utils/role-scoring.js:85` and `api/scoring.py:91` |
| 421–424 | validation plan repeats the same stale N≥200 promise | same |

The offsets table at lines 304–310 (−1.55, −1.17, −1.13, −0.42, +0.28) is
arithmetically exact — each is `(3 − mean)/SD` against the IPIP-NEO priors, confirmed
to three decimals. But it describes a comparison the pipeline no longer performs, since
witness scores are now z-scored against their own prior.

Recommended action: rewrite lines 228–245 from `witness-scoring.js`, and rewrite the
"Known systematic bias" section to state that the bias was resolved by keying priors to
the instrument (ADR 0019) rather than being a live limitation.

### W9. Lines 633–636 and 535–536 — Ostendorf & Angleitner (1994) is glossed as something it is not

Current bibliography gloss: `[German NEO-PI-R validation establishing five-factor
replication in German-speaking populations.]` and prose at 535–536: `see e.g.
Ostendorf & Angleitner 1994 for the German NEO-PI-R`.

The cited title is *"A comparison of different instruments proposed to measure the Big
Five"* — an instrument comparison, not a NEO-PI-R validation study. The citation itself
(European Review of Applied Psychology, 44, 45–53) I confirmed exists via multiple
independent reference lists, but it has no DOI, I could not read the abstract, and I
could not verify the issue number "44(1)". The gloss is unverified and appears to
mischaracterize the paper.

Recommended replacement for the gloss:

```
[Comparison of instruments proposed to measure the Big Five, including German-language
measures.]
```

and for line 535–536, either drop the parenthetical or re-source the German NEO-PI-R
claim to the actual German NEO-PI-R manual.

### W10. Line 601 — wrong initial for Gough

Current: `Gough, H. C. (2006)`. Crossref: Harrison **G.** Gough. Replace with `Gough, H. G.`

### W11. Lines 160–162 — an uncited correlation range

```
run against the natural positive correlations between E, A and O (r ≈ +0.15
to +0.20).
```

No citation anywhere in the file for this range. Unverified. Either source it or mark
it as an assumption.

### W12. Line 558 — facet name differs from the source

SCIENCE.md says the two altered Danish items are in "the Values/Compass facet". Vedel
et al. call it the **Liberalism** facet (O6). "Values" is the NEO PI-R name for the same
facet so this is defensible, but naming the source's term would be more citable.
Everything else in that paragraph is verbatim correct (see V-Vedel below).

---

## Verified

Sound as written unless noted. Coverage record for the next reader.

**DOIs confirmed against Crossref — author, year, journal, volume, issue and pages all
match SCIENCE.md:**

| Line | Reference | Note |
|---|---|---|
| 583 | Barrick & Mount (1991), Personnel Psychology 44(1), 1–26 | Metadata exact. Abstract **not** read (Wiley returned HTTP 402), so the claim at 92–95 that C predicts performance "across almost all job contexts" is not independently confirmed here — the citation is sound, the characterization is unverified |
| 587 | Bell (2007), JAP 92(3), 595–615 | Metadata exact; abstract read in full. Supports line 95 ("Bell (2007) confirms the effect at team level" for C — team mean conscientiousness was a strong field predictor). See W4/W5 for what it does not support |
| 601 | Goldberg et al. (2006), JRP 40(1), 84–96 | Metadata exact except Gough's initial (W10). Supports line 473 (IPIP items public domain) |
| 606 | Gosling, Rentfrow & Swann (2003), JRP 37, 504–528 | Metadata exact (published title hyphenates "Big-Five"; immaterial) |
| 611 | Halfhill et al. (2005), Small Group Research 36(1), 83–105 | Metadata exact; abstract read in full. Does not support the g claim (W3) |
| 616 | Hofstee, De Raad & Goldberg (1992), JPSP 63(1), 146–163 | Metadata exact. The AB5C claim at 64–67 is supported: ipip.ori.org lists "Hofstee, de Raad and Goldberg's (1992) 45 AB5C facets" with a comparison table and scoring keys, so "each AB5C facet has a known, measured OCEAN profile published in the public domain" holds |
| 621 | Johnson (2014), JRP 51, 78–89 | Metadata exact; SCIENCE.md truncates the published subtitle ": Development of the IPIP-NEO-120". Full paper read. Samples: development N = 21,588; validation in Eugene-Springfield (N = 481, reported as 501 in the paper's own Table 2) and Internet samples N = 307,313 and N = 619,150. IPIP-NEO-120 domain alphas: N .90, E .89, O .81–.82, A .85–.86, C .90. See W7 — it reports no domain means/SDs |
| 627 | Maples-Keller et al. (2019), JPA 101(1), 4–15 | Metadata exact — this is the already-applied fix and it is correct. Abstract **not** read (closed access; publisher elided it on Semantic Scholar, 402/403 elsewhere) |
| 631 | Neuman & Wright (1999), JAP 84(3), 376–389 | Metadata exact; abstract read in full. See W5 for scope |
| 645 | Vedel, Gøtzsche-Astrup & Holm (2018), Nordic Psychology 71(1), 62–77 | Metadata exact — the DOI digit fix is correct |

**Substantive claims confirmed by reading the source:**

- **Lines 546–550, 554–566 (Vedel / Danish).** Accepted manuscript read in full.
  N = 525 Danish veterinary students and graduates. Domain alphas .89 N, .89 E, .81 O.
  The altered-items claim is **verbatim correct**, including the forward-looking liberal
  wording. The paper states: to avoid potential legal problems with collecting data on
  voting behaviour, *"Tend to vote for liberal political candidates"* was altered into
  *"View myself as predominantly liberal politically"*, and *"Tend to vote for
  conservative political candidates"* into *"View myself as predominantly conservative
  politically"*. Both the reason (legal, voting-behaviour data) and both item wordings
  match SCIENCE.md exactly. Only the facet name differs (W12).
- **Lines 510–513 and 638–640 (Thiry & Piolti / French).** Confirmed listed on
  ipip.ori.org/newItemTranslations.htm: *"In 2023, Benjamin Thiry, PhD and Maëva Piolti,
  MA from the University of Mons in Belgium, proposed an adaptation of Gravel's
  translation for European French speaking people."* One nuance worth adding: it is an
  adaptation of Gravel's French-Canadian translation of the IPIP-NEO-**300**, of which
  26 items were re-reviewed by 20 native-speaker translation students.
- **Line 548 (Vedel listed on ipip.ori.org).** Confirmed on the same page.

**Numeric claims confirmed by computation or against the codebase:**

- **Lines 304–310, witness offset table.** Arithmetically exact. Each offset equals
  `(3 − NORM_MEAN)/NORM_SD`: A (3−3.9)/0.58 = −1.552; O (3−3.7)/0.60 = −1.167;
  C (3−3.7)/0.62 = −1.129; E (3−3.3)/0.72 = −0.417; N (3−2.8)/0.72 = +0.278. (The
  comparison they describe is stale — W8 — but the arithmetic is right.)
- **Lines 248–253, adjective corpus.** Confirmed against `src/data/witness-adjectives.js`:
  exactly 100 entries, exactly 20 per factor (E/A/C/N/O), exactly 10 per pole per factor
  (A+ 10, A− 10, C+ 10, C− 10, E+ 10, E− 10, N+ 10, N− 10, O+ 10, O− 10), valence ±1,
  ids in the documented `{factor}{sign}{nn}` form. Schema matches (`id, en, ca, factor,
  valence, tip`), with the file additionally carrying es/fr/de/da.
- **Lines 212–218 vs the codebase.** The norm table matches the shipped constants
  exactly: `src/utils/role-scoring.js:41–54` (E 3.3/0.72, A 3.9/0.58, C 3.7/0.62,
  N 2.8/0.72) and `api/scoring.py:59–62`. SCIENCE.md and the code agree; what is
  unverified is the citation behind both (W7).
- **Line 450.** 10 TIPI + 60 + 120 = 190. Correct.
- **Lines 355–359, 369 (relevance threshold).** Matches `witness-scoring.js:44–53`:
  `DOMINANT_RATIO = 1.5`, floor 10%, `top × 0.60`, `MAX_RELEVANT = 5`.
- **Lines 143–156, role centroids.** 12 roles covering the six P×B / P×V / B×V
  intersections at both poles, internally consistent with the profile column. These are
  labelled in the file as theoretical and "not empirically correct" (line 52), so there
  is no empirical claim to check. Correctly framed.
- **Lines 381–393, ROLE_TOP_ADJECTIVES derivation.** The stated rule
  `fit(A, R) = z_R[F] × sign(V)` matches the comment at `witness-scoring.js:26–27`.

**Correctly self-limiting, no source needed:** lines 18–22, 43–47, 49–60, 75–76,
132–134, 396–412, 434–439, 459–462, 490–491. These state what the system does not
claim. They are the strongest part of the document and none of them overreach.

---

## Coverage gaps

Stated so nobody assumes these were cleared:

1. **Bell (2007) full results tables** — not obtained. APA PsycNet, Sage and ResearchGate
   all gated; searched for the corrected-correlation table by name and for an open PDF.
   Consequence: W4 rests on the abstract only.
2. **Maples-Keller et al. (2019)** — abstract and tables not read (closed access,
   publisher-elided). Consequence: W7 cannot be closed in either direction.
3. **Barrick & Mount (1991) abstract** — not read (HTTP 402). The citation is verified;
   the prose characterization at 92–95 is not.
4. **Ostendorf & Angleitner (1994)** — no DOI exists; abstract not read. Existence
   confirmed only via third-party reference lists. Issue number "44(1)" unverified.
