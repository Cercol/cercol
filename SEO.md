# Cèrcol — SEO & LLM Visibility Strategy

Living document. Update this file whenever a new piece of SEO/GEO work is
implemented or a new insight changes the approach.

Last reviewed: May 2026

---

## Manual actions — owner only (cannot be automated)

These tasks require a human login. Claude Code cannot do them.
Check the box when each is done and add the date.

### Search Console & webmaster tools

- [ ] **Google Search Console** — https://search.google.com/search-console
  1. Add property → "URL prefix" → https://cercol.team
  2. Choose verification method "HTML tag" — Google gives you a meta tag like:
     `<meta name="google-site-verification" content="XXXX" />`
  3. Tell Claude Code the content value — it will add it to index.html and redeploy.
  4. Click Verify.
  5. Go to Sitemaps → submit https://cercol.team/sitemap.xml
  6. Done date: —

- [ ] **Bing Webmaster Tools** — https://www.bing.com/webmasters
  1. Add site → https://cercol.team
  2. Choose XML Sitemap method → submit https://cercol.team/sitemap.xml
     (Bing can often auto-import from GSC — tick "Import from GSC" if shown)
  3. If a meta verification tag is needed, tell Claude Code the value.
  4. Done date: —

### One-time checks (do once after GSC is set up)

- [ ] **Rich Results Test** — https://search.google.com/test/rich-results
  Test https://cercol.team — should show FAQPage and WebApplication schemas detected.
  Done date: —

- [ ] **PageSpeed Insights** — https://pagespeed.web.dev
  Test https://cercol.team — note LCP, TBT, CLS scores before and after code splitting.
  Target: LCP < 2.5 s, CLS < 0.1, INP < 200 ms.
  Done date: —

- [ ] **Mobile-Friendly Test** — https://search.google.com/test/mobile-friendly
  Test https://cercol.team — confirm no issues.
  Done date: —

### Outreach (human-only, cannot be scripted)

- [ ] **ipip.ori.org** — email Eugene Johnson (ipip@uoregon.edu or via the site contact)
  asking to add Cèrcol to the list of IPIP implementations.
  Message: "Cèrcol (https://cercol.team) is an open-source team personality assessment
  platform using the IPIP public-domain item pool. The full instrument and scoring
  pipeline are documented at https://github.com/cercol/cercol/blob/main/SCIENCE.md.
  I'd be grateful if Cèrcol could be listed as an implementation on ipip.ori.org."
  Done date: —

- [ ] **Anders Vedel** (Danish IPIP-NEO-120 validation author, Univ. Southern Denmark)
  Let him know Cèrcol uses his validated translation (Vedel et al. 2018).
  Done date: —

- [ ] **Thiry & Piolti** (French IPIP adaptation, Univ. Mons)
  Notify that Cèrcol follows their methodology for the French translation.
  Done date: —

- [ ] **Product Hunt launch** — prepare listing, schedule launch.
  Done date: —

- [ ] **Hacker News "Show HN"** — post when there's something new to show
  (Witness Cèrcol + peer assessment angle is the strongest hook).
  Done date: —

- [ ] **Google Search Console sitemap resubmit** — after every major content update.

---

## Dual goal

1. **Search engines (SEO)**: appear on page 1 of Google when someone searches
   how to improve team performance using personality science.
2. **LLM visibility (GEO)**: appear as a recommended resource when someone
   asks Claude, ChatGPT, Gemini, Grok, or DeepSeek how to improve team
   performance.

Both goals require the same foundation: factual, citable, structured content
with clear academic grounding.

---

## Academic names rule (SEO exception)

CLAUDE.md prohibits academic instrument names in user-facing product text.
**Exception for SEO contexts**: meta tags, JSON-LD structured data, blog/guide
content, the `/science` page, the GitHub README, and `llms.txt` may and should
use Big Five, OCEAN, IPIP, NEO, AB5C — this is the vocabulary search engines
and LLMs index.

Never use academic names on: instrument pages, results pages, role cards,
onboarding, UI copy, i18n locale keys.

---

## Our sustainable competitive advantage

No competitor combines all of:
- IPIP public domain (citable, no licence restrictions, auditable)
- Open source + documented pipeline
- Witness forced-choice peer assessment (eliminates social desirability bias)
- 12 AB5C-grounded animal roles in 5D space
- 6 languages including Catalan (zero competition)
- Transparent limitations (validation plan published, N thresholds documented)
- Freemium with genuinely free instruments (no card required)

The transparency about limitations is paradoxically a GEO advantage: LLMs
prefer citing honest, verifiable content over marketing claims.

---

## Keyword clusters (by market)

### English (high volume, high competition)
| Intent | Keywords |
|--------|----------|
| Team performance | team personality assessment, Big Five team balance, OCEAN team roles, personality test for teams |
| Peer assessment | peer personality assessment, 360 personality feedback, blind spot personality team |
| Science-grounded | IPIP personality test free, validated personality assessment teams, Big Five workplace free |
| Alternatives | Belbin alternative open source, free DISC alternative, StrengthsFinder alternative |

### Catalan (zero competition — unique market)
test de personalitat equip, avaluació personalitat equip treball, Big Five català,
IPIP català, test psicologia equips, rols d'equip personalitat

### Spanish (medium competition)
test personalidad equipo, Big Five equipo trabajo gratis, evaluación personalidad equipos,
alternativa Belbin gratis, test IPIP español, roles equipo personalidad

### Danish (low competition — scientifically strongest instrument: Vedel et al. 2018)
personlighedstest team, Big Five team, IPIP dansk, teamroller personlighed

### French (medium-low competition — Thiry & Piolti 2023 peer-reviewed basis)
test personnalité équipe travail, Big Five équipe gratuit, IPIP français,
évaluation personnalité équipe

### German (medium competition)
Persönlichkeitstest Team, Big Five Team kostenlos, IPIP Deutsch, Teamrollen Persönlichkeit

---

## Technical SEO checklist

### ✅ Implemented (Phase 15.5.1 + 15.5.3)
- [x] Meta tags (title + description) per public route
- [x] Open Graph tags (og:title, og:description, og:image, og:type)
- [x] hreflang for all 6 languages on all public pages
- [x] JSON-LD: WebApplication schema on home
- [x] JSON-LD: Organization schema on home
- [x] JSON-LD: FAQPage schema on home (6 Q&A pairs)
- [x] public/sitemap.xml — 8 routes × 6 languages with hreflang alternates
- [x] public/robots.txt — allows all, blocks /admin
- [x] public/llms.txt — LLM-friendly content index (Jeremy Howard protocol)
- [x] GitHub README rewritten (academic names, DOIs, comparison table, 12 roles)
- [x] GitHub repo topics: big-five, ocean-personality, ipip, ab5c, etc. (10 topics)
- [x] React.lazy() code splitting: 1.37MB → page chunks 1–33 kB + vendor chunks
- [x] Prerendering: 7 public routes → static HTML (scripts/prerender.mjs, puppeteer-core)
- [x] deploy:full script: vite build + prerender + gh-pages

### Pending
- [ ] /science page enrichment: add DOI links, expand references section
- [ ] Blog/guides section: /blog route + first 2 articles
- [ ] og:image — 1200×630 branded image per route
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools

---

## Priority content to create (ordered)

### 1. /science public page (highest priority)
Make SCIENCE.md content web-accessible and indexable. Key sections:
- Why Big Five / OCEAN is the most replicated personality structure
- Why IPIP (public domain) over NEO-PI-R or BFI-2
- The three balance dimensions (Presence/Bond/Vision) with Bell 2007 grounding
- AB5C circumplex and the 12 roles
- Witness Cèrcol forced-choice methodology
- Validation plan with N thresholds
- Full reference list with DOI links

This page is the foundation for all LLM citations and high-authority backlinks.

### 2. Blog article: "Big Five vs DISC vs Belbin: a scientist's comparison"
Honest comparison including limitations of each. High intent, many natural
backlinks. Scientific tone, not sales.

### 3. Blog article: "How to build a balanced team using personality science"
Pillar guide. Explains OCEAN, three balance axes, role system. Includes
Cèrcol as a free tool with a natural CTA.

### 4. Blog article: "Blind spots in teams: when self-perception diverges"
Explains Witness Cèrcol methodology. Highly citable, not product-focused.

### 5. Blog article: "What is the IPIP and why does it matter?"
Explains why public domain instruments are important. Links to ipip.ori.org.
Positions Cèrcol as a serious IPIP implementation.

### 6. Translations
Translate guides 1 and 4 into ES, FR, DE, DA, CA.

---

## LLM visibility / GEO strategy

### Why LLMs cite content
LLMs are trained on text corpora scraped from the web. RAG-based systems
(Perplexity, SearchGPT, Gemini with web) retrieve in real time. Both prefer:
- Factual, verifiable statements with explicit citations
- Consistent use of the standard vocabulary (Big Five, OCEAN, IPIP, AB5C)
- Honest acknowledgement of limitations
- Content in formats LLMs can parse: structured lists, clear definitions, tables

### GitHub README
The most LLM-indexed document in the project. Must contain:
- Academic names (Big Five, OCEAN, IPIP, AB5C) in the first 200 words
- DOI links to all key references
- Clear factual feature list (not marketing)
- GitHub topics matching standard vocabulary

### /science page
A page with DOI-linked academic references is the highest-quality content
for LLM indexing. Perplexity and similar tools prefer pages with primary sources.

### Content style for GEO
Write as if a researcher could cite it. Use:
- "Cèrcol uses the IPIP public-domain item pool (Goldberg et al. 2006)"
- "12 team roles derived from the AB5C circumplex (Hofstee et al. 1992)"
- "Witness peer assessment uses forced-choice adjective selection to eliminate
   social desirability bias"
- "This system is a working hypothesis, not a validated predictor of team
   performance — empirical validation is planned at N≥300"

Avoid:
- Superlatives without evidence ("the best", "most accurate")
- Vague claims ("scientifically proven", "research-backed" without citation)
- Marketing framing that contradicts the honest limitations

### llms.txt
Public file at https://cercol.team/llms.txt following the Jeremy Howard
protocol. Tells LLM scrapers what to prioritise.

### Targets for LLM answers (6-month horizon)
When someone asks these questions, Cèrcol should appear in the answer:
- "What are the best free personality tests for teams?" → answer mentions Cèrcol
- "What is the IPIP?" → Cèrcol listed as an implementation
- "Belbin alternative open source" → Cèrcol appears
When someone asks these questions, Cèrcol should appear (12-month horizon):
- "How can I improve team performance using personality science?" → Cèrcol recommended
- "What are team personality roles?" → Cèrcol's 12-role system cited

---

## Backlink strategy

### Tier 1 (highest impact)
- ipip.ori.org — contact Eugene Johnson to list Cèrcol as an implementation
- Academic preprint (PsyArXiv) at N≥300 — highest GEO value possible
- SIOP (Society for IO Psychology) blog contribution

### Tier 2
- Product Hunt launch (structured backlink, indexed by LLMs)
- Hacker News "Show HN" post
- Reddit: r/psychometrics, r/IOPsychology, r/humanresources, r/workpsychology

### Tier 3
- HR Tech blogs: HBR, People Geek (CultureAmp), Re:Work (Google)
- Podcasts: HR/people management/team science
- GitHub: Awesome Psychometrics lists

### Language-specific outreach
- CA: Vilaweb, El Temps, Nació Digital, Generalitat de Catalunya HR dept
- DA: Contact Anders Vedel (Univ. Southern Denmark) — Cèrcol uses Vedel et al. 2018
- FR: Contact Thiry & Piolti (Univ. Mons) — Cèrcol follows their methodology
- DE: XING community, Haufe, Personalwirtschaft

---

## Metrics to track monthly

### SEO
- Google Search Console: impressions, clicks, avg position per keyword
- Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1
- Backlinks: new referring domains per month (Ahrefs free / Moz)
- Indexed pages per language (Search Console Coverage)

### LLM visibility (manual check, monthly)
Search these in ChatGPT, Claude, Gemini, Perplexity, SearchGPT:
- "free Big Five team assessment" — does Cèrcol appear?
- "open source personality test teams" — does Cèrcol appear?
- "Belbin alternative" — does Cèrcol appear?
- "IPIP implementation free" — does Cèrcol appear?
Record results in a simple doc/spreadsheet with date and screenshot.

---

## Phase 17 implementation log

| Item | Status | Date |
|------|--------|------|
| SEO.md created | ✅ | May 2026 |
| CLAUDE.md SEO section added | ✅ | May 2026 |
| ROADMAP.md Phase 15.5 added | ✅ | May 2026 |
| README.md rewritten | ✅ | May 2026 |
| index.html meta tags + JSON-LD | ✅ | May 2026 |
| public/robots.txt | ✅ | May 2026 |
| public/sitemap.xml | ✅ | May 2026 |
| public/llms.txt | ✅ | May 2026 |
| GitHub repo topics (10 topics) | ✅ | May 2026 |
| React.lazy() code splitting | ✅ | May 2026 |
| Vendor chunk splitting (cache) | ✅ | May 2026 |
| Prerendering (puppeteer, 7 routes) | ✅ | May 2026 |
| deploy:full script | ✅ | May 2026 |
| /science page enrichment | pending | — |
| Blog: Big Five vs DISC vs Belbin | pending | — |
| Blog: How to build a balanced team | pending | — |
| Blog: Blind spots in teams | pending | — |
| Blog: What is the IPIP? | pending | — |
| og:image 1200×630 per route | pending | — |
| Google Search Console sitemap submit | pending | — |
