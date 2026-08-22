/**
 * Where Cèrcol should appear, and what it takes to get there.
 *
 * # Spec: docs/architecture/seo-pipeline.md
 *
 * Researched 2026-08-22 by four agents, one per beat, each verifying every
 * entry by opening the page. Anything that could not be opened was cut, and
 * anything whose contact address is not published on the page carries no
 * address here: an invented one costs the relationship it is meant to open.
 *
 * The catalogue lives in the repository rather than the database because it
 * is research, and research should be reviewable in a pull request. Progress
 * against it lives in D1 (authority_status), because that is yours to change
 * from the admin screen. The two are joined by `id`.
 *
 * `stage` is the only field that matters for ordering, and it encodes the
 * finding that shaped everything else: almost nothing here is blocked by how
 * many people have taken the test.
 *
 *   now     — reachable today, at 41 responses, with what already exists
 *   consent — blocked until responses are collected under a consent notice
 *             that permits open publication. This cannot be applied
 *             retroactively, so every day without it produces more data that
 *             can never be published
 *   data    — blocked until there are enough responses, and in most cases
 *             enough self-plus-Witness pairs, which are the rarer asset
 *
 * `difficulty` is about the mechanism, not the effort: `form` means a door
 * anyone can open, `person` means someone decides, `long` means both a
 * person and a bar Cèrcol does not clear yet.
 */

export const STAGES = ['now', 'consent', 'data']
export const BEATS = ['psychometrics', 'openscience', 'es-ca', 'de', 'fr', 'da']

export const AUTHORITY_TARGETS = [
  // ─── Reachable today ────────────────────────────────────────────────
  {
    id: 'ipip-name-fix',
    name: 'IPIP: fix the broken name',
    beat: 'psychometrics',
    stage: 'now',
    difficulty: 'person',
    url: 'https://ipip.ori.org/IPIPImplementationsAroundTheWeb.htm',
    contact: 'j5j@psu.edu',
    why: 'The one authority citation Cèrcol has renders the name as C¿rcol. The byte is a correct Latin-1 è, but the page declares no charset, so browsers default to UTF-8 and reject it. The sibling page Johnson wrote on the same day declares iso-8859-1 and displays it correctly.',
    ask: 'Write it as C&egrave;rcol. Fixes the ÷ and ™ on the same page too.',
  },
  {
    id: 'ipip-catalan-items',
    name: 'IPIP translations page: add Catalan',
    beat: 'psychometrics',
    stage: 'now',
    difficulty: 'person',
    url: 'https://ipip.ori.org/newItemTranslations.htm',
    contact: 'j5j@psu.edu',
    why: '43 languages listed, Arabic to Welsh, each credited to whoever supplied it. Spanish appears four times. Catalan is absent. The only validated Catalan Big Five measure found anywhere is the 10-item TIPI (Renau et al. 2013), whose own abstract calls itself the first Catalan translation of a brief Big Five measure.',
    ask: 'Offer the Catalan/Valencian item file in IPIP format plus the translation procedure. Claim an open item set with documented methodology, never a validated instrument.',
  },
  {
    id: 'ipip-french-danish',
    name: 'IPIP French and Danish pages',
    beat: 'fr',
    stage: 'now',
    difficulty: 'person',
    url: 'https://ipip.ori.org/ipipneo_300fr.htm',
    contact: 'j5j@psu.edu',
    why: 'Cèrcol runs the European-French adaptation and the validated Danish IPIP-NEO-120. Both languages have their own IPIP pages that do not mention a live implementation.',
    ask: 'A follow-up to an existing relationship, not a cold email. Clarify the Danish reuse licence with Vedel first: that page carries no licence statement.',
  },
  {
    id: 'zenodo-doi',
    name: 'Zenodo software DOI',
    beat: 'openscience',
    stage: 'now',
    difficulty: 'form',
    url: 'https://help.zenodo.org/docs/github/enable-repository/',
    contact: null,
    why: 'Turns Cèrcol from a website into a citable object. A concept DOI for the project and a version DOI per release, propagated into Software Heritage. Every later listing can point at it.',
    ask: 'Link the GitHub account, enable the repo, tag v1.0.0. Add CITATION.cff and the DOI badge. One hour.',
  },
  {
    id: 'psycharchives',
    name: 'PsychArchives (ZPID) deposit',
    beat: 'de',
    stage: 'now',
    difficulty: 'form',
    url: 'https://www.psycharchives.org/en/contribute',
    contact: 'psycharchives-submission@leibniz-psychology.org',
    why: 'The cheapest DOI in psychology. Self-service, free under 1 GB, formal check only, no peer review, no affiliation requirement, usually one to two working days.',
    ask: 'Deposit the scoring code, the German item set and later the dataset as citable objects. CC BY-SA.',
  },
  {
    id: 'osf-methodology',
    name: 'OSF project for the methodology',
    beat: 'openscience',
    stage: 'now',
    difficulty: 'form',
    url: 'https://help.osf.io/article/392-create-a-doi',
    contact: null,
    why: 'A citable landing page for how the scoring actually works, separate from the app. This is what a reviewer, or a language model, will cite when describing the method.',
    ask: 'Item-to-scale mappings, scoring formulas, the six-language translation protocol, norm sources, Witness logic. Free DOI.',
  },
  {
    id: 'softcatala',
    name: 'Softcatalà, El Rebost',
    beat: 'es-ca',
    stage: 'now',
    difficulty: 'form',
    url: 'https://www.softcatala.org/programes/',
    contact: null,
    why: 'The canonical index of Catalan-language software, and it feeds Softvalencià. Self-serve submission, moderated.',
    ask: 'Needs a working Catalan interface and an open licence. Both true today.',
  },
  {
    id: 'hal-source',
    name: 'HAL source-code deposit',
    beat: 'fr',
    stage: 'now',
    difficulty: 'form',
    url: 'http://doc.hal.science/en/deposer/deposer-le-code-source/',
    contact: null,
    why: 'Makes Cèrcol citable inside French academic bibliographies, with automatic Software Heritage archiving.',
    ask: 'Any account holder may deposit. Needs a free licence, a domain and one affiliation.',
  },
  {
    id: 'danish-repro',
    name: 'Danish Reproducibility Network',
    beat: 'da',
    stage: 'now',
    difficulty: 'form',
    url: 'https://danish-repro.github.io/',
    contact: 'danish.repro@gmail.com',
    why: 'Explicitly open to all career stages and to people outside universities. The cheapest Danish entry point and a route to methods people at KU, AU, AAU and SDU.',
    ask: 'Join the mailing list. Nothing to prove.',
  },
  {
    id: 'vedel-aarhus',
    name: 'Anna Vedel, Aarhus University',
    beat: 'da',
    stage: 'now',
    difficulty: 'person',
    url: 'https://ipip.ori.org/DanishIPIP-NEO-120.htm',
    contact: null,
    why: 'She translated and validated the exact Danish instrument Cèrcol runs, and co-authored the Danish BFI-2. Denmark has no gap in instruments, it has a gap in delivery: nothing Danish, free and open administers one with a report, and nothing covers peer assessment or team roles.',
    ask: 'Offer what her 2018 paper could not collect: a live open platform, a peer-assessment layer, and an anonymised Danish dataset. Collaborator, not gatekeeper. Steven Ludeke (SDU) is the second name.',
  },
  {
    id: 'personality-project',
    name: 'The Personality Project link lists',
    beat: 'psychometrics',
    stage: 'now',
    difficulty: 'person',
    url: 'https://personality-project.org/',
    contact: 'revelle@northwestern.edu',
    why: 'Revelle explicitly invites suggestions for links and corrections. The non-academic list is still heavy with MBTI-era links, so an open IPIP-sourced instrument is a genuine upgrade to it. Read by students and psych R package users.',
    ask: 'One good email, same shape as the one that worked on Johnson.',
  },
  {
    id: 'psiara-copc',
    name: 'Psiara (COPC digital magazine)',
    beat: 'es-ca',
    stage: 'now',
    difficulty: 'person',
    url: 'https://psiara.cat/',
    contact: 'comunicacio@copc.cat',
    why: 'Read by Catalan collegiate psychologists. Rolling web publication plus a formatted PDF three times a year.',
    ask: 'A professional-interest article about open assessment tools in Catalan, not a product pitch. Verify the address before sending: copc.cat blocked automated fetching.',
  },

  // ─── Blocked on consent ─────────────────────────────────────────────
  {
    id: 'consent-gate',
    name: 'Ship the consent notice',
    beat: 'openscience',
    stage: 'consent',
    difficulty: 'form',
    url: 'https://openpsychologydata.metajnl.com/about/submissions/',
    contact: null,
    why: 'Not a target, the precondition for all of them. Every data venue asks for consent, anonymisation and an ethics statement. Consent cannot be obtained retroactively, so responses collected before this exists are probably never publishable. This is the only item here that gets worse while it waits.',
    ask: 'A step stating plainly that responses may be published as an anonymised open dataset under CC0 or CC BY, with a data-protection note for EU respondents.',
  },
  {
    id: 'dataset-zenodo',
    name: 'Anonymised dataset on Zenodo',
    beat: 'openscience',
    stage: 'consent',
    difficulty: 'form',
    url: 'https://zenodo.org',
    contact: null,
    why: 'The artefact every data venue wants to see before it will consider a paper. Its own DOI, its own codebook.',
    ask: 'Track two numbers, not one: total completions, and complete self-plus-Witness pairs. The pairs are the rare asset.',
  },

  // ─── Blocked on data ────────────────────────────────────────────────
  {
    id: 'open-test-archive',
    name: 'Open Test Archive (ZPID Leibniz)',
    beat: 'de',
    stage: 'data',
    difficulty: 'person',
    url: 'https://www.testarchiv.eu/en/veroeffentlichen',
    contact: 'testarchiv@leibniz-psychology.org',
    why: 'A curated, DOI-assigned home for the instruments themselves, in the archive German-speaking psychologists browse deliberately. 262 open-access tests. Six language versions are accepted as supplementary material and make a deposit more attractive, not less. Because the items are public-domain IPIP, the rights problem that stops most submitters does not apply.',
    ask: 'Signed consent, the instrument on their template, a structured description, reliabilities and a norm or sample description. The reliabilities are the part that needs data.',
  },
  {
    id: 'personality-science',
    name: 'Personality Science, Projects & Data',
    beat: 'openscience',
    stage: 'data',
    difficulty: 'person',
    url: 'https://journals.sagepub.com/author-instructions/ppp',
    contact: null,
    why: 'Diamond open access, no fee, backed by five personality associations, and an article type that literally names resources, platforms and datasets. The best-fit journal found anywhere in this research.',
    ask: 'Roughly 1,000 self-reports, or several hundred complete self-plus-Witness pairs. The dyadic multilingual design is the novelty, not the count.',
  },
  {
    id: 'jopd',
    name: 'Journal of Open Psychology Data',
    beat: 'openscience',
    stage: 'data',
    difficulty: 'person',
    url: 'https://openpsychologydata.metajnl.com/about/submissions/',
    contact: null,
    why: 'A peer-reviewed data paper. Datasets need not be important; negative results are explicitly welcome.',
    ask: 'About 500 consented responses with demographics. £536 fee, waivers exist. A thin Reuse Potential section is what kills submissions here.',
  },
  {
    id: 'psicothema',
    name: 'Psicothema',
    beat: 'es-ca',
    stage: 'data',
    difficulty: 'long',
    url: 'https://www.psicothema.com/envio',
    contact: 'psicothema@cop.es',
    why: 'The highest-impact Spanish psychology journal, published with the COP. Its 2026 norms require open materials and data availability, which is Cèrcol’s natural position.',
    ask: 'A real validation study with a Spanish sample. A description of the website will be desk-rejected.',
  },
  {
    id: 'aloma-catalan',
    name: 'Aloma (Blanquerna, URL)',
    beat: 'es-ca',
    stage: 'data',
    difficulty: 'person',
    url: 'https://revistaaloma.blanquerna.edu/index.php/aloma',
    contact: null,
    why: 'Accepts Catalan, no fees, and it is the journal that published the Catalan TIPI in 2013. The exact precedent for a Catalan validation.',
    ask: 'A Catalan-item validation paper. Approach the editors before submitting.',
  },
  {
    id: 'french-validation',
    name: 'Validate the French item set',
    beat: 'fr',
    stage: 'data',
    difficulty: 'long',
    url: 'https://ipip.ori.org/ipipneo_300fr.htm',
    contact: null,
    why: 'The largest open goal in this research. Both French IPIP-NEO translations are explicitly unvalidated, including the one Cèrcol uses, whose authors say validation is future work. The only validated French option is domain-level with no facets and is free-for-research rather than openly licensed. There is no francophone open test repository at all. A validated, openly licensed, facet-level French Big Five does not exist today.',
    ask: 'French responses in quantity. No incumbent to displace, only two translations whose own authors say validation is outstanding.',
  },
  {
    id: 'zis-gesis',
    name: 'ZIS (GESIS)',
    beat: 'de',
    stage: 'data',
    difficulty: 'person',
    url: 'https://zis.gesis.org/infotexte/Publikationsprozess.html',
    contact: null,
    why: 'Open repository for social-science scales, a DOI per instrument, free to publish. Transferring an instrument to a new context qualifies, which a documented translation with data is.',
    ask: 'Reliability and validity evidence from real responses.',
  },
  {
    id: 'joss-library',
    name: 'JOSS, via an extracted scoring library',
    beat: 'openscience',
    stage: 'data',
    difficulty: 'long',
    url: 'https://joss.theoj.org/papers/new',
    contact: null,
    why: 'A Crossref DOI, free, public review. The web app is out of scope: JOSS excludes web tools without a core library, requires six months of public history, and wants evidence of research use.',
    ask: 'Extract the scoring engine as a tested, documented, published library. The repo clears the six-month rule in October 2026.',
  },
  {
    id: 'wikidata',
    name: 'Wikidata item',
    beat: 'openscience',
    stage: 'data',
    difficulty: 'long',
    url: 'https://www.wikidata.org/wiki/Wikidata:Notability',
    contact: null,
    why: 'Defensible once two or three DOIs and the IPIP listing exist, because notability there means identifiable and referenced rather than famous.',
    ask: 'Wait for the DOIs. A self-created item attracts deletion requests, so keep it sparse and factual. Wikipedia proper is a different matter and the honest answer there is not yet, perhaps never, and only through other people citing the work.',
  },
]

/** Targets in the order they should be attempted. */
export function orderedTargets(targets = AUTHORITY_TARGETS) {
  const rank = { form: 0, person: 1, long: 2 }
  return [...targets].sort(
    (a, b) => STAGES.indexOf(a.stage) - STAGES.indexOf(b.stage) || rank[a.difficulty] - rank[b.difficulty],
  )
}
