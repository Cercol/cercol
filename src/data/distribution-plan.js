/**
 * The distribution plan, as the operator wrote it.
 *
 * # Spec: docs/architecture/seo-pipeline.md
 *
 * Ten sections, ninety-one steps, from fixing the funnel to becoming
 * citable. The first nine came from the standalone plan document; the tenth,
 * "Citable", is the 2026-08-22 research, where four agents each took one beat
 * and verified every entry by opening the page. Only three of its findings
 * were already in the plan, so the rest are new rather than a restatement.
 *
 * The content is in Catalan because the plan is the operator's working
 * document and its audience is one person. Code and comments stay English,
 * per CLAUDE.md.
 *
 * `done` here is the state the plan was written with, not the truth. The
 * truth is in D1 (authority_status, keyed by task id) and overrides it, so
 * ticking a step in the panel outlives a redeploy. A step with no row falls
 * back to this flag.
 *
 * Four kinds of action, because a plan that only describes work is a document
 * and this is meant to be a panel:
 *
 *   prompt  a brief ready to hand to an agent, copied whole
 *   do      instructions for something only a person can do
 *   email   a drafted message, opened in the mail client or copied
 *   link    somewhere to go, usually with the text to paste when you arrive
 */

export const PLAN_SECTIONS = [
  {
    "id": "a11",
    "title": "L'instrument de veres",
    "sub": "Auditat el 22/08/2026 contra les fonts. La Lluna Nova és el TIPI literal, 10 de 10. El Testimoni ja declara honestament què és. Però la Lluna Plena comparteix només 57 dels 120 ítems amb l'IPIP-NEO-120 de Johnson, i 21 dels seus ítems no existeixen enlloc del banc IPIP de 3.320. L'ordre d'aquesta secció importa: primer les fonts, després els instruments, després les llengües, i la documentació l'última, escrita una sola vegada sobre el que aleshores serà cert. Va primera al pla a propòsit: mentre l'instrument no siga el que diu que és, tota la resta val menys.",
    "tasks": [
      {
        "id": "s1",
        "title": "Aconseguir la llista dels 60 de Maples-Keller",
        "why": "La porta de tota la secció. Els 120 de Johnson ja els tenim (columna anglesa de la pàgina danesa de l'IPIP) i el danés de Vedel també. Falta l'IPIP-NEO-60 publicat, que és una selecció per TRI feta sobre el banc de l'IPIP-NEO-120. Si és obtenible, el Primer Quart s'arregla igual que la Lluna Plena. Si no ho és, el Primer Quart necessita una decisió a banda i cal saber-ho abans de tocar res. RESOLTA el 22/08/2026: sí que és obtenible, a ipip.ori.org/IPIP-NEO-60ScoringKeys.htm, arribant-hi des de l'índex de constructes múltiples.",
        "aud": [
          "A"
        ],
        "pay": [
          "Base",
          "Autoritat"
        ],
        "eff": "Baix",
        "action": {
          "type": "prompt",
          "text": "Find whether the IPIP-NEO-60 item list is publicly obtainable.\n\nSource: Maples-Keller, J. L., Williamson, R. L., Sleep, C. E., Carter, N. T., Campbell, W. K., & Miller, J. D. (2019). Using item response theory to develop a 60-item representation of the NEO PI-R using the International Personality Item Pool: Development of the IPIP-NEO-60. Journal of Personality Assessment, 101(1), 4-15. doi:10.1080/00223891.2017.1381968\n\nCheck, in this order:\n1. ipip.ori.org, which hosts several derived scales as their own pages.\n2. The article's supplementary material, and any preprint or accepted manuscript (PsyArXiv, ResearchGate, an author page).\n3. https://github.com/stmueller/OpenScales, which indexes IPIP items by code and may carry the scale assignment.\n4. The R psych package and the psychTools datasets, which ship several IPIP keys.\n\nWhat counts as success: the 60 item texts, which facet each belongs to, and the keying direction. Anything less is not enough to rebuild the instrument.\n\nReport what you found and where, with URLs. If it is behind a paywall with no open copy, say so plainly: that is a real answer and it changes the plan. Do not reconstruct the list from memory or infer it from the 120. That is exactly how this problem was created.",
          "note": "Si no és obtenible, digues-ho i para. No l'aproximes."
        },
        "done": true
      },
      {
        "id": "s2",
        "title": "Portar els 120 de Johnson al repositori com a referència",
        "why": "Un fitxer de referència amb els 120 ítems canònics, la seua faceta i la seua direcció, extret de la font i no de memòria. És el que després permet comparar, substituir i verificar sense tornar a descarregar res. També deixa la comparació auditable: qualsevol pot obrir el fitxer i contrastar-lo amb la pàgina de l'IPIP. FETA el 22/08/2026: src/data/reference/ipip-neo-120.js i ipip-neo-60.js, de dues fonts independents que coincideixen en 115 de 120.",
        "aud": [
          "A"
        ],
        "pay": [
          "Base"
        ],
        "eff": "Baix",
        "action": {
          "type": "prompt",
          "text": "Build a reference file of the canonical IPIP-NEO-120, extracted from source, not written from memory.\n\nSource: https://ipip.ori.org/DanishIPIP-NEO-120.htm . Despite the name it is a two-column table: Johnson's English item on the left, Anna Vedel's Danish on the right, grouped under the 30 facet headings (N1..N6, E1..E6, O1..O6, A1..A6, C1..C6) with '+ keyed' and '- keyed' markers. Fetch it and parse it; the page is Word-exported HTML, so parse the <tr>/<td> structure rather than the raw text, and decode it as UTF-8.\n\nWrite src/data/reference/ipip-neo-120.json with one entry per item: facet code, facet name, English text, keyed direction, and the Danish text. All 120. Add a header comment naming the URL and the date fetched.\n\nThen write a test that fails if the file does not contain exactly 30 facets with exactly 4 items each, and that every English string is non-empty and ends in a full stop.\n\nDo not modify src/data/full-moon.js in this step. This is only the reference."
        },
        "done": true
      },
      {
        "id": "s3",
        "title": "Substituir la Lluna Plena pels 120 reals",
        "why": "Canvien 63 ítems. A partir d'ací el test és l'IPIP-NEO-120 i no una cosa que se li assembla, i els barems de Kajonius & Johnson (N = 320.128) passen a descriure el nostre instrument de veres en comptes d'aproximar-lo. També desapareixen els 21 ítems que no existeixen a cap banc. Context complet a docs/post-mortems/2026-08-22-instruments-written-from-memory.md.",
        "aud": [
          "U",
          "A"
        ],
        "pay": [
          "Base",
          "Autoritat"
        ],
        "eff": "Alt",
        "action": {
          "type": "prompt",
          "text": "Replace the Full Moon item set with the canonical IPIP-NEO-120 in src/data/reference/ipip-neo-120.js.\n\nThis is not a text change. Every item carries a facet, a domain and a keying direction, and all of them move with it. An audit on 2026-08-22 found that even among the 61 items we already share with the published instrument, three sit in the wrong facet and one is keyed the wrong way:\n\n- \"Act without thinking.\" is in Immoderation (n5) keyed forward. Published, it is in Cautiousness (c6) keyed reverse. It crosses domain AND sign, so today it adds to Depth where it should subtract from Discipline. The same error is in First Quarter, where a facet is two items rather than four and it therefore weighs more.\n- \"Tell the truth.\" is in Morality (a2). Published, Dutifulness (c3).\n- \"Take advantage of others.\" is in Cooperation (a4). Published, Morality (a2).\n\nTake facet, domain and keying from the reference file for every item. Do not carry any of ours across, including for the items that stay: that is exactly how those three survived.\n\nThen, in order, and report each one in the pull request:\n\n1. Assert every facet ends with exactly four items. A facet with three or five silently skews its own mean.\n2. Verify the facet-to-domain map against the reference rather than against the previous file.\n3. Confirm the norms are looked up per facet code and not by position in an array. If anything indexes by position, the item replacement will silently misalign it.\n4. Run the role-stability simulation and report how far the role boundary moves under the new item set. It reads domain z-scores, so it moves when the domains do.\n5. Carry the other-language strings ONLY where the English item is unchanged. Where the English is new, leave the language absent and let the loader fall back to English. Do not invent a translation to fill a gap.\n6. Bump INSTRUMENT_VERSION and write the changelog entry.\n\nFull test suite must pass. Open as its own pull request and do not merge: the operator reviews an instrument change.\n\nRead docs/post-mortems/2026-08-22-instruments-written-from-memory.md before you start. It carries the measurements this step is built on and the three items that are in the wrong facet today."
        },
        "done": false
      },
      {
        "id": "s4",
        "title": "Canviar l'escala de resposta a la de l'IPIP-NEO",
        "why": "L'IPIP-NEO no pregunta si estàs d'acord: pregunta com d'exacta és la descripció, de molt inexacta a molt exacta. Els barems que fem servir es van recollir amb eixe format. Mentre preguntem una altra cosa, la comparació amb els barems té una costura que no es veu enlloc. A més, el francés havia perdut el matís als punts 2 i 4, cosa que ja feia que l'escala francesa no fora la mateixa que l'anglesa. Context complet a docs/post-mortems/2026-08-22-instruments-written-from-memory.md.",
        "aud": [
          "U",
          "A"
        ],
        "pay": [
          "Base"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "prompt",
          "text": "Move the First Quarter and Full Moon response scale from agree/disagree to the IPIP-NEO's own accuracy anchors.\n\nThe canonical English anchors are: Very Inaccurate, Moderately Inaccurate, Neither Accurate Nor Inaccurate, Moderately Accurate, Very Accurate.\n\nThe Danish ones, from Anna Vedel via ipip.ori.org/DanishIPIP-NEO-120.htm, are: Meget Unojagtigt, Lidt Unojagtigt, Hverken Nojagtigt Eller Unojagtigt, Lidt Nojagtigt, Meget Nojagtigt. Take them from the page with their correct diacritics rather than retyping them.\n\nFor Catalan, Spanish, French and German, write the equivalents and get each reviewed by a native-speaker subagent before opening the PR. The French anchors currently drop the intensity qualifier at points 2 and 4, so the French scale is not equidistant with the English one; do not repeat that.\n\nAlso review the item carrier stem ('I see myself as someone who' / 'Je me percois comme quelqu'un qui'). With accuracy anchors the stem may no longer be the right frame, and in French it governs a third-person clause while the items are first person.\n\nThe scale change alters what a stored response means, so bump INSTRUMENT_VERSION with a changelog entry."
        },
        "done": false
      },
      {
        "id": "s5",
        "title": "Substituir el Primer Quart pels 60 reals",
        "why": "Depèn de la passa s1. El nostre Primer Quart és un subconjunt perfecte de la nostra Lluna Plena (60 de 60), però només 36 dels seus ítems són a la llista de Johnson. Hi ha un problema obert que cal resoldre en aquesta passa: la taula de barems de Kajonius & Johnson és sobre la mètrica de quatre ítems per faceta, i el Primer Quart en té dos, així que eixos barems no li serveixen tal com estan. Context complet a docs/post-mortems/2026-08-22-instruments-written-from-memory.md.",
        "aud": [
          "U",
          "A"
        ],
        "pay": [
          "Base",
          "Autoritat"
        ],
        "eff": "Alt",
        "action": {
          "type": "prompt",
          "text": "Blocked until the step 's1' has an answer. Do not start this without the published IPIP-NEO-60 item list in hand.\n\nWhen it is available: replace the First Quarter items with the published 60, keeping two items per facet and the published keying, the same way the Full Moon replacement was done.\n\nThen resolve the norms problem, which is the harder half of this step. Kajonius & Johnson (2019) Table A1 gives facet statistics on the 4-to-20 metric, meaning four items answered 1 to 5. First Quarter has two items per facet. Using the same table for both instruments without adjustment is wrong. Find out what the IPIP-NEO-60 paper itself publishes, and if it publishes nothing usable, say so and propose the honest alternative rather than rescaling by assumption.\n\nOpen as its own pull request and do not merge.\n\nRead docs/post-mortems/2026-08-22-instruments-written-from-memory.md first."
        },
        "done": false
      },
      {
        "id": "s6",
        "title": "Danés: el de Vedel, sencer i literal",
        "why": "El primer cas on deixem de traduir i comencem a copiar. La seua pàgina té els 120, humans, validats en població danesa i publicats per Johnson. Quan la Lluna Plena siga l'IPIP-NEO-120, la seua traducció encaixa ítem a ítem sense cap forat. Context complet a docs/post-mortems/2026-08-22-instruments-written-from-memory.md.",
        "aud": [
          "U",
          "A"
        ],
        "pay": [
          "Base",
          "Autoritat"
        ],
        "eff": "Baix",
        "action": {
          "type": "prompt",
          "text": "Replace every Danish string in the Full Moon items with Anna Vedel's published translation, taken from src/data/reference/ipip-neo-120.json.\n\nThis is a copy, not a translation. Do not improve, modernise or correct any of it. If a string looks wrong to you, leave it and note it in the pull request: the value of a validated instrument is that it is the instrument that was validated, and its imperfections are part of what the validation measured.\n\nUpdate SCIENCE.md and the FAQ to say what is then true: the Danish items are Vedel, Gotzsche-Astrup and Holm's published translation, used verbatim, with the citation. That claim is currently false and this step is what makes it true.\n\nThe same for the Danish response anchors if step 's4' has not already taken them.\n\nRead docs/post-mortems/2026-08-22-instruments-written-from-memory.md first, in particular the section on how we know the current Danish is not Vedel's."
        },
        "done": false
      },
      {
        "id": "s7",
        "title": "Recalcular la cobertura de les 27 llengües sobre el joc nou",
        "why": "OpenScales té 27 llengües indexades pels codis d'ítem de l'IPIP, i la cobertura que vam mesurar (francés 93, danés 61, alemany 22, castellà 11 sobre 99) era contra el joc vell. Amb els 120 canònics canviarà, i probablement a millor, perquè són els ítems més usats del banc. És el que decideix quines llengües es copien i quines es tradueixen. Context complet a docs/post-mortems/2026-08-22-instruments-written-from-memory.md.",
        "aud": [
          "A"
        ],
        "pay": [
          "Base"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "prompt",
          "text": "Recompute, for the canonical IPIP-NEO-120 item set, how many items each language in https://github.com/stmueller/OpenScales/tree/main/scales/ipip/translations actually covers.\n\nMethod: map each canonical English item to its IPIP code using ipip_master_en.json, then count hits per language file. Report a table of language, items covered out of 120, and the _translator field verbatim.\n\nTwo things to say plainly in the report. First, nearly every file lists a named human translator AND 'machine translation' in the same provenance string, with no per-item marking, so you cannot take only the human-translated items. Second, name the languages with full or near-full coverage, because those are the ones where Cercol could stop translating and start copying.\n\nThis is research. Change no item files."
        },
        "done": false
      },
      {
        "id": "s8",
        "title": "Català: el nostre, perquè no n'hi ha cap altre",
        "why": "El català no és a cap font externa i no hi serà. És l'única llengua on traduir és inevitable, i per això és on la revisió importa més. Part de la feina del 22/08 sobreviu: els ítems que continuen al joc nou ja estan corregits i unificats en central. Context complet a docs/post-mortems/2026-08-22-instruments-written-from-memory.md.",
        "aud": [
          "U",
          "A"
        ],
        "pay": [
          "Base"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "prompt",
          "text": "After the Full Moon item replacement, fill the Catalan for every item whose English is new.\n\nCarry across the existing Catalan for items that survive the replacement: they were reviewed and corrected on 2026-08-22 and unified on Central Catalan, which is the variety this item bank uses.\n\nFor the new items, translate directly from the English, preserving the construct exactly, in the plain everyday first-person register the existing items use. Then have a native-speaker Catalan philologist subagent with psychometric training review all of them against the English before the pull request is opened, and act on what comes back.\n\nDo not offer the Catalan set to anyone outside the project until that review passes and the step 'ct21' has happened."
        },
        "done": false
      },
      {
        "id": "s9",
        "title": "Escriure la documentació una vegada, sobre el que aleshores serà cert",
        "why": "L'última passa a propòsit. Ara mateix SCIENCE.md, el README i les preguntes freqüents diuen coses que no són certes, i el pla és fer-les certes en comptes d'anar-les canviant. Quan les passes anteriors estiguen fetes, aquesta és una escriptura, no una esmena. Context complet a docs/post-mortems/2026-08-22-instruments-written-from-memory.md.",
        "aud": [
          "U",
          "A"
        ],
        "pay": [
          "Base",
          "Autoritat",
          "GEO"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "prompt",
          "text": "Rewrite the provenance sections of SCIENCE.md, README.md and the faq entries in all six locale files to describe what the instruments then are.\n\nBy this point the claims should be true rather than corrected: Full Moon is the IPIP-NEO-120 (Johnson, 2014) verbatim, First Quarter is the IPIP-NEO-60 (Maples-Keller et al., 2019) verbatim or else honestly described as something else, New Moon is the TIPI (Gosling et al., 2003) verbatim, and the Danish is Vedel, Gotzsche-Astrup and Holm's published translation used as published.\n\nTwo things must be stated and not glossed. The twelve roles are Cercol's own: no published model of twelve roles exists to inherit, so that part is original research and the page should say the evidence for it will come from Cercol's own data or not at all. And the audit of 2026-08-22 belongs in the record, not buried: what the instrument was before, how it was found, and what changed. A science page that hides its own correction history is worth less than one that carries it.\n\nRead the neighbouring entries in each locale before writing, and have each non-English version reviewed by a native-speaker subagent.\n\nRead docs/post-mortems/2026-08-22-instruments-written-from-memory.md first, and link it from the science page. A correction history that is only in a pull request body is a correction history nobody finds."
        },
        "done": false
      },
      {
        "id": "s10",
        "title": "Desbloquejar les cartes a Vedel i a Thiry & Piolti",
        "why": "Les dues estan aturades des del 22/08 perquè afirmaven que els nostres ítems seguien la seua feina, i era fals. Quan el danés siga literalment el seu, la carta a Vedel deixa de ser una afirmació dubtosa i passa a ser un agraïment exacte, amb una petició que té sentit: que li pegue una ullada a com l'hem posada. Context complet a docs/post-mortems/2026-08-22-instruments-written-from-memory.md.",
        "aud": [
          "A"
        ],
        "pay": [
          "Autoritat"
        ],
        "eff": "Baix",
        "action": {
          "type": "do",
          "html": "<ul class=\"ulist\"><li>Reescriure les dues cartes dient el que aleshores serà cert, i llevar el bloqueig de les incidències.</li><li>La de Vedel canvia de to sencer: passa de \"seguim la teua metodologia\" a \"fem servir la teua traducció tal com la vas publicar\".</li><li>La de Thiry i Piolti depèn de si el francés acaba copiat d'OpenScales o traduït per nosaltres. Si és traduït, la carta ha de dir-ho.</li><li><b>Cap de les dues ix sense la revisió filològica de la llengua corresponent.</b></li></ul>"
        },
        "done": false
      }
    ]
  },
  {
    "id": "a1",
    "title": "Arrencada",
    "sub": "Barat, urgent, i desbloqueja la resta. Comença ací.",
    "tasks": [
      {
        "id": "tb1",
        "title": "Arreglar la fuga d'idiomes al prerender (/science en danés)",
        "why": "Bug viu en producció: la /science canònica anglesa es prerenderitza en danés, amb canonical anglès. És la teua pàgina àncora per a SEO i citació d'IA servint danés a tots els crawlers. Urgent; fes-ho primer.",
        "aud": [
          "U",
          "A"
        ],
        "pay": [
          "GEO"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "prompt",
          "note": "PR #88 obert i verificat correcte (causa: localStorage per-origen compartit entre rutes al prerender; fix: context aïllat per ruta). /science ix en anglès, /da i /es correctes. Fusió retinguda fins que el build complet acabe net. Marca-la en fusionar.",
          "text": "GOAL: Fix the prerender language leak. The canonical English /science/ page is prerendered with <html lang=\"da\"> and Danish content while keeping an English canonical and og:locale=en_GB. Confirmed live in production. Full git flow.\n\nSTEP 1 (read-only): Reproduce in a local build and identify the cause: i18n/localStorage state not reset between localized routes in scripts/prerender.mjs, so a route inherits the previous route's language. Report the exact mechanism with file:line.\nSTEP 2: Check whether other canonical (unprefixed) routes leak too (home, /about, /instruments, /roles, /faq, /privacy, blog), not only /science. Report which are affected.\nSTEP 3: Fix the prerender so each unprefixed route renders in its own language (English), resetting i18n state between routes.\nSTEP 4: While there, report (do not necessarily fix) the trailing-slash duplicate URLs seen in GSC impressions, a related canonicalization artifact.\nSTEP 5: Build, verify /science/ and any affected routes render the correct language locally, then branch, PR, CI, merge, sync main. After merge, trigger or note that deploy-frontend.yml rebakes the prerendered HTML. Report the diff and which routes were leaking."
        },
        "done": true
      },
      {
        "id": "tb2",
        "title": "Arreglar el Full Moon gratis dels primers 500 (no funciona)",
        "why": "Arreglat i desplegat (#99): el grant mai disparava (només a la branca INSERT, i auth.py ja creava la fila abans, així que tothom quedava en premium=false). Ara concedeix també a ON CONFLICT i retro-concedeix els denegats.",
        "aud": [
          "U"
        ],
        "pay": [
          "Base"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "prompt",
          "note": "Investiga primer; toca el paywall (territori ADR 0012). Para si és política sense decidir. Pega el resultat a claude.ai.",
          "text": "GOAL: Investigate and fix the broken \"first ~500 users get Full Moon free\" beta grant. A registered account (Miquel's own) is being sent to the Stripe payment step for Full Moon instead of having it unlocked. Read-only first, fix only if the cause is a clear defect.\n\nSTEP 1 (read-only, report with file:line and confidence):\n- Find how Full Moon access is gated: the frontend guard that decides paywall vs unlocked, and any backend enforcement on the Full Moon / results endpoints.\n- Find the beta auto-grant for the first ~500 users: is it implemented at all, and where (a premium-column default, a registration-time grant, a count check, a flag)?\n- Determine exactly why a registered account reaches the payment step: the grant never runs, a counter/threshold is wrong, the premium flag is not read by the gate, or the gate ignores the beta state.\n- Note the overlap with ADR 0012 (paywall enforcement, fate of the beta auto-grant).\nSTOP and report if the real cause is that the beta-grant policy was never decided or implemented (that is the ADR 0012 decision, not a bug fix). Do not invent a paywall policy.\n\nSTEP 2 (only if STEP 1 shows a clear defect in intended behaviour): Fix it so a beta user within the first ~500 gets Full Moon unlocked and never reaches the payment step. Keep the change minimal and aligned with how the grant was meant to work. No migration unless strictly required; if one is, use the sanctioned apply-migrations.yml path and flag it.\nSTEP 3: Verify against the real gate (a beta account no longer sees the payment step), tests, then full git flow (branch, PR, CI, merge, sync main). Report the cause, the fix, and anything left for the ADR 0012 decision."
        },
        "done": true
      },
      {
        "id": "tb2b",
        "title": "Aplicar la migració 029 (consistència del ledger) [opcional]",
        "why": "Aplicada (run 27684197924, 2026-06-17 11:00:48 UTC) per la via sancionada; el ledger ja no té pendents.",
        "aud": [
          "U"
        ],
        "pay": [
          "Base"
        ],
        "eff": "Baix",
        "action": {
          "type": "prompt",
          "note": "Via sancionada, no-op en prod. Pega el resultat a claude.ai.",
          "text": "GOAL: Apply migration 029 (records the is_beta column in version control) via the sanctioned path only, for ledger consistency. It is idempotent and a no-op on prod (the column already exists there); the grant fix needs nothing from it.\n\nSTEP 1: Run apply-migrations.yml with dry_run=true and confirm 029 is the only pending migration. STOP and report if anything other than 029 is pending.\nSTEP 2: Run apply-migrations.yml with dry_run=false. Do not run psql by hand. Confirm 029 lands in the schema_migrations ledger and report the run id and timestamp."
        },
        "done": true
      },
      {
        "id": "tb3",
        "title": "Guardar el nom quan algú es registra amb Google",
        "why": "Arreglat i desplegat (#98): el callback de Google ara extrau given_name/family_name i els desa amb COALESCE (només si el camp és buit, no sobreescriu un nom editat).",
        "aud": [
          "U"
        ],
        "pay": [
          "Base"
        ],
        "eff": "Baix",
        "action": {
          "type": "prompt",
          "note": "Investigació + fix backend, sense migració esperada. Pega el resultat a claude.ai.",
          "text": "GOAL: When a user registers with Google, save their name. Right now Google OAuth sign-up does not persist it. Read-only first, then fix.\n\nSTEP 1 (read-only, report with file:line): In the self-hosted auth (api/auth.py), find the Google OAuth handler. Check what the Google profile / ID token returns (name, given_name, family_name) and whether the user record's name fields (first/last name from the Phase 10.18 profile) are populated on Google sign-in. Confirm the user table already has the name columns (no migration expected).\nSTEP 2: Populate the name from the Google profile on first Google sign-in, mapping given_name/family_name (or name) to the existing fields. Only set when the fields are empty, so a later Google login does not overwrite a name the user edited. If a migration is somehow needed, use the sanctioned path and flag it.\nSTEP 3: Verify (a Google sign-in saves the name), tests, full git flow (branch, PR, CI, merge, sync main). Report the cause and the fix."
        },
        "done": true
      },
      {
        "id": "t01",
        "title": "Corregir tres errors als docs",
        "why": "Vedel mal escrit, un contacte inexistent i una afirmació sobreafirmada. Que els docs no et tornen a enganyar.",
        "aud": [
          "U",
          "A"
        ],
        "pay": [
          "Base"
        ],
        "eff": "Baix",
        "action": {
          "type": "prompt",
          "note": "Pega els resultats de Claude Code a la conversa amb claude.ai.",
          "text": "GOAL: Correct three factual errors in the Cercol docs about external academics/contacts. Docs-only, low risk. Work from the canonical clone. Do the full git flow (branch, commit, push, PR, squash-merge, sync main). Do NOT touch any server or run deploys manually.\n\nSTEP 1 (read-only investigation, no changes):\n- grep the whole repo and report every match with file:line for:\n  - \"Anders Vedel\"\n  - \"Southern Denmark\"\n  - \"Eugene Johnson\"\n  - any sentence calling the French Thiry & Piolti adaptation \"peer-reviewed\"\n- Report findings. If a string is missing where expected, STOP and report; do not guess.\n\nSTEP 2 (apply corrections):\n- \"Anders Vedel\" -> \"Anna Vedel\" wherever it refers to the Danish IPIP-NEO-120 author.\n- Affiliation \"University of Southern Denmark\" -> \"Aarhus University\" in that context.\n- Remove the non-existent contact \"Eugene Johnson\" from SEO.md. Lewis R. Goldberg (IPIP founder) died on 29 March 2026; the site is maintained by the Oregon Research Institute. Reframe that outreach item so the IPIP-listing contact is John A. Johnson (IPIP-NEO author) / ORI.\n- Soften the French claim: describe Thiry & Piolti (2023) as a documented European-French IPIP adaptation listed on ipip.ori.org, NOT \"peer-reviewed\". Keep README.md and SCIENCE.md consistent.\n- English comments, no em dashes, follow docs conventions.\n\nSTEP 3 (git flow):\n- Branch: docs/fix-external-contact-errors\n- Commit, push, open a PR listing the three corrections with the file:line evidence from STEP 1.\n- Run docs CI (markdownlint, lychee, spec validator). If any gate fails, STOP and report.\n- Squash-merge, then in the canonical clone: git checkout main && git pull.\nReport the final diff summary inline."
        },
        "done": true
      },
      {
        "id": "t02",
        "title": "Confirmar l'email a John A. Johnson",
        "why": "Ja enviat (llistat IPIP). Marca'l i anota la data per fer seguiment en ~2 setmanes si no contesta.",
        "aud": [
          "A"
        ],
        "pay": [
          "Autoritat"
        ],
        "eff": "Baix",
        "action": {
          "type": "do",
          "html": "<ul class=\"ulist\"><li>Verifica que l'email va eixir i anota la data a la nota d'esta passa.</li><li>Si en 2 setmanes no hi ha resposta, el seguiment va a la passa <b>1.3</b>.</li></ul>"
        },
        "done": true
      },
      {
        "id": "tx1",
        "title": "Respondre John A. Johnson",
        "why": "Fet: l'intercanvi amb Johnson és actiu (va respondre 'Hello again' i ha actuat sobre la petició).",
        "aud": [
          "A"
        ],
        "pay": [
          "Autoritat"
        ],
        "eff": "Baix",
        "action": {
          "type": "email",
          "to": "j5j@psu.edu",
          "subject": "Re: Cercol - thank you, and a note on the AB5C to team-roles step",
          "body": "Dear John,\n\nThank you. This means a great deal coming from you. The honesty you mention is deliberate: I would rather Cercol be a working hypothesis people can scrutinise than a black box, so your note genuinely made my week.\n\nThat your work spans both the AB5C model and personality-based team construction is striking, because the step I am least sure about in Cercol is exactly the inference from AB5C facets to team-level roles. If you ever feel like sharing a thought on where that reasoning is strongest or weakest, I would be grateful, with no obligation at all.\n\nAnd to make the IPIP listing as easy as possible whenever you get to it, here is a one-line description you are welcome to use or ignore:\n\nCercol (cercol.team): a free, open-source team personality assessment using the public-domain IPIP item pool, with a documented, auditable scoring pipeline. Science write-up: github.com/cercol/cercol/blob/main/SCIENCE.md\n\nThank you again,\nMiquel"
        },
        "done": true
      },
      {
        "id": "t13",
        "title": "Assegurar el llistat a ipip.ori.org",
        "why": "Fet i confirmat viu: Johnson ha llistat Cèrcol a ipip.ori.org (pàgina d'implementacions, secció High-Quality, i la de programming tools), actualitzat 02-07-2026. Backlink Tier-1 des del hub canònic de l'IPIP.",
        "aud": [
          "A"
        ],
        "pay": [
          "Autoritat",
          "GEO"
        ],
        "eff": "Baix",
        "action": {
          "type": "do",
          "html": "<ul class=\"ulist\"><li>John A. Johnson ha contestat (juny 2026): afegirà Cèrcol com a recurs a l'IPIP quan puga, i t'avisarà.</li><li>La teua resposta ja li dona una descripció llesta per enganxar (passa \"Respondre John A. Johnson\"), per facilitar-ho.</li><li>Si en 3-4 setmanes no apareix, nuda educat. Pàgina: <b>ipip.ori.org</b> (Implementations i newItemTranslations).</li></ul>"
        },
        "done": true
      },
      {
        "id": "tx4",
        "title": "Agrair a Johnson el listing + porta oberta a la recerca",
        "why": "Johnson ha afegit Cèrcol a ipip.ori.org (confirmat viu, secció High-Quality) i abans va dir que la seua recerca AB5C i de composició d'equips encaixa amb Cèrcol. Val la pena agrair-ho i mantindre la relació calenta.",
        "aud": [
          "A"
        ],
        "pay": [
          "Autoritat"
        ],
        "eff": "Baix",
        "action": {
          "type": "do",
          "html": "<ul class=\"ulist\">\n  <li>Enviar-li un agraïment breu (esborrany a punt, te'l passo al xat).</li>\n  <li>Deixar oberta la porta al dovetail de recerca (AB5C + equips) sense demanar res dur: quan hi haja dades, compartir-les i valorar la seua perspectiva.</li>\n  <li>És la relació externa més valuosa que tens: autor de l'IPIP-NEO i qui controla el listing.</li>\n</ul>"
        },
        "done": true
      },
      {
        "id": "tx3",
        "title": "Verificar la migració 027",
        "why": "L'auditoria del funnel menciona 'migració 027 (aquesta sessió)'. Si s'ha aplicat una migració durant una auditoria read-only, trencaria el contracte read-only i la via apply-migrations.yml. Confirma-ho.",
        "aud": [
          "U"
        ],
        "pay": [
          "Base"
        ],
        "eff": "Baix",
        "action": {
          "type": "prompt",
          "note": "Read-only. Pega l'informe a claude.ai.",
          "text": "GOAL: Read-only verification. No changes, no migrations, no server state changes.\n\nThe funnel audit referenced \"migration 027 (this session)\" as having fixed the events INSERT permission. Verify:\nSTEP 1: List db/migrations and report whether a migration 027 exists, what it does, and when it was added (git log of the file).\nSTEP 2: Read the schema_migrations ledger (read-only over SSH) and report whether 027 is recorded as applied, when, and via which apply-migrations.yml run.\nSTEP 3: Report any evidence that 027 was applied manually or during a read-only session, which would violate the read-only contract and the sanctioned migration path.\nConfidence HIGH for file/ledger facts, LOW for inferred application path. Report only; change nothing."
        },
        "done": true
      }
    ]
  },
  {
    "id": "a2",
    "title": "Mesura",
    "sub": "Sap què passa abans d’abocar res. La columna vertebral de tot.",
    "tasks": [
      {
        "id": "tm0",
        "title": "Verificar què pot mesurar el funnel",
        "why": "Etiquetar enllaços amb utm i mirar el north-star per font només val si el funnel guarda referrer i utm i l'admin ho pot desglossar. Comprova-ho abans, o el tagging no mesura res.",
        "aud": [
          "U"
        ],
        "pay": [
          "Base"
        ],
        "eff": "Baix",
        "action": {
          "type": "prompt",
          "note": "Read-only. Pega l'informe a claude.ai i decidim si cal un canvi abans d'etiquetar res.",
          "text": "GOAL: Read-only investigation of what the first-party funnel can actually measure for channel attribution. No changes, no server writes.\n\nSTEP 1: Inspect the events ingestion (POST /events in api/blog.py and trackEvent in src/lib/api.js). For each event, report whether it records: referrer, utm_source, utm_medium, utm_campaign, landing path, anon_id, created_at. Give file:line for the fields that ARE captured and explicitly list which are NOT.\nSTEP 2: Report whether utm and referrer are read on the client (from the URL and document.referrer) and sent in the event payload, or dropped before reaching the backend. If dropped, the source of a visit cannot be known.\nSTEP 3: Inspect the admin Overview and the SEO endpoints and report whether completed tests (results rows) can be broken down by week, by instrument, by language, and by source (utm or referrer). State what exists and what is missing.\nSTEP 4: Summarise with HIGH confidence (code facts) what is measurable today and the minimal change needed to attribute a completed test to a channel. Do NOT implement; report so we decide."
        },
        "done": true
      },
      {
        "id": "t22",
        "title": "Treure la visibilitat de cerca i IA (ho fa Claude Code)",
        "why": "No estàs al Regne Unit, així que el report d'IA de GSC no el veus; i Claude Code ja té accés a les dades de GSC i BigQuery del pipeline SEO. La mesura la fa ell, no tu a mà.",
        "aud": [
          "U"
        ],
        "pay": [
          "GEO"
        ],
        "eff": "Baix",
        "action": {
          "type": "prompt",
          "note": "Read-only. Pega l'informe a claude.ai.",
          "text": "GOAL: Read-only. Pull and analyse search and AI-visibility data from the existing SEO pipeline (GSC export in BigQuery, /admin/seo, cercol_seo dataset). No changes.\n\nSTEP 1: For informational blog queries, report impressions vs clicks over the last 90 days and flag the impressions-up / clicks-flat-or-down divergence (the AI Overviews click-eating signature), using the GSC data already in BigQuery.\nSTEP 2: Report whether the new GSC Generative AI report data is reachable for this property via any export or API (likely not: it is UK-first and has no API). State plainly if it is unavailable.\nSTEP 3: Report the top pages by impressions (the real ranking the earlier blog audit could not get locally), so the article-to-test fixes can be prioritised by traffic.\nSTEP 4: Report any AI/search referrer signal already visible in the SEO or server data. Summarise what AI and search visibility we can actually measure today.\nConfidence HIGH for data facts. Report inline."
        },
        "done": true
      },
      {
        "id": "t24",
        "title": "Implementar l'atribució de canal (capturar la font)",
        "why": "Aterrada: PR #91 fusionat (8243a83e), ADR 0014 Accepted, migració 028 aplicada pel camí sancionat (run 27676193244). Còpia de privacitat als 6 idiomes.",
        "aud": [
          "U"
        ],
        "pay": [
          "Base"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "prompt",
          "note": "Prompt combinat (ADR + migració sancionada + merge). Pega el resultat a claude.ai.",
          "text": "GOAL: Land the first-touch attribution work in gated PR #91. Approved. It introduces a new first-party data category, so it needs an ADR and the sanctioned migration path. Do the whole sequence and report at the end.\n\nSTEP 1: Add a new ADR under docs/decisions for first-party visit-source attribution (referrer / utm captured client-side, stored on results, no link to identity). Use the next free ADR number (check the directory). Status Proposed. State the decision, the privacy stance (no PII, anonymous, no identity link), and the rejected alternative (third-party analytics). No em dashes.\nSTEP 2: Apply migration 028 ONLY through the sanctioned path: apply-migrations.yml workflow_dispatch with the schema_migrations ledger. Do NOT run psql by hand. Report the run id and timestamp and confirm 028 is in the ledger.\nSTEP 3: Update PR #91 to reference the ADR, merge it, sync main, and promote the ADR to Accepted now the decision is made.\nSTEP 4: Report ADR number and path, migration run id, merge SHA, and confirm the privacy copy shipped in all six locales.\nSTOP and report instead of forcing it if migration 028 does not apply cleanly or the ledger write looks wrong."
        },
        "done": true
      },
      {
        "id": "tz1",
        "title": "Deixar a la vista el north-star setmanal",
        "why": "El número que mana es tests completats per setmana. Ja es pot traure per instrument i idioma; per font, quan entre l'atribució (2.3). Que Claude Code el deixe a la vista; tu només el mires cada setmana.",
        "aud": [
          "U"
        ],
        "pay": [
          "Base"
        ],
        "eff": "Baix",
        "action": {
          "type": "prompt",
          "note": "Pot ser execució si cal un xicotet canvi. Pega el resultat a claude.ai.",
          "text": "GOAL: Make the north-star (completed tests per week) easy to read every week, using the existing weekly digest and admin data.\n\nSTEP 1: Confirm whether the weekly digest (or an admin view) already surfaces completed tests per week, broken down by instrument and language. If it does, report exactly where I read it.\nSTEP 2: If the north-star is buried or missing, make the minimal change so the digest foregrounds one number: completed tests this week vs last week, with the instrument-by-language pivot underneath.\nSTEP 3: Leave a clearly marked placeholder for the source/channel split, to be filled once the attribution change (2.3) lands.\nSTEP 4: If code changed: branch, PR, CI, merge, sync main. Report where I read the weekly number."
        },
        "done": true
      }
    ]
  },
  {
    "id": "a3",
    "title": "Credibilitat lingüística",
    "sub": "Protegeix el teu wedge abans de contactar amb ningú.",
    "tasks": [
      {
        "id": "tl1",
        "title": "Auditoria de cobertura de les 6 llengües",
        "why": "Abans de presumir de 6 idiomes, confirma que no falta cap cadena, ítem ni adjectiu Witness en cap llengua.",
        "aud": [
          "U",
          "A"
        ],
        "pay": [
          "Base"
        ],
        "eff": "Baix",
        "action": {
          "type": "prompt",
          "note": "Read-only. Comprovacions de fitxer/string: alta confiança. Pega l'informe a claude.ai.",
          "text": "GOAL: Read-only completeness audit across all six locales (en, ca, es, fr, de, da). No changes, no commits, no server.\n\nSTEP 1: List src/locales/*.json and report key parity. Flag every key present in one locale but missing in another, with per-language counts.\nSTEP 2: In the item data files (new-moon, first-quarter, full-moon), confirm every item's text object has all six language keys. Report any item id missing a language.\nSTEP 3: In the Witness adjective corpus, confirm every adjective has all six languages INCLUDING the tip/tooltip field (the schema may only carry en/ca). Report gaps.\nSTEP 4: Confirm role essences, dimension names, facet names and team-narrative keys exist for all six languages. Report gaps with file:line.\nOutput a coverage table per language. Confidence HIGH (string/file facts). Do NOT fix anything."
        },
        "done": true
      },
      {
        "id": "tr2",
        "title": "Completar el corpus Witness (es/fr/de/da)",
        "why": "Revisat i fusionat (#96, 38f55a26): el corpus Witness complet als 6 idiomes ja és a la font.",
        "aud": [
          "U",
          "A"
        ],
        "pay": [
          "Autoritat"
        ],
        "eff": "Alt",
        "action": {
          "type": "do",
          "html": "<p class=\"meta\">Revisat i fusionat (#96). El corpus complet als 6 idiomes ja és a la font.</p>"
        },
        "done": true
      },
      {
        "id": "tl2",
        "title": "Auditoria de terminologia i fugues",
        "why": "Cap terme acadèmic en text d'usuari, mai 'observer', i noms de dimensions, rols i facetes consistents en cada llengua.",
        "aud": [
          "U",
          "A"
        ],
        "pay": [
          "Base",
          "Autoritat"
        ],
        "eff": "Baix",
        "action": {
          "type": "prompt",
          "note": "Read-only. Pega l'informe a claude.ai.",
          "text": "GOAL: Read-only terminology audit. No changes.\n\nSTEP 1: Scan user-facing locale strings and item text for academic terms (Big Five, OCEAN, IPIP, NEO, AB5C) that must not appear in UI. List matches with file:line. EXCLUDE SEO contexts (meta tags, JSON-LD, llms.txt), where these terms are allowed.\nSTEP 2: Scan all languages for \"observer\" or non-sanctioned equivalents. The only allowed terms are Witness / Testimoni / Testigo / Temoin / Zeuge-Zeugin / Vidne. Report any violation.\nSTEP 3: Check the 5 dimension names, 12 role names and 30 facet names are translated consistently across locales (same target term everywhere). Report drift with file:line.\nConfidence HIGH. Do NOT fix anything."
        },
        "done": true
      },
      {
        "id": "tr1",
        "title": "Resoldre la terminologia i la clau que falta",
        "why": "L'auditoria ho ha trobat: 'observers/Beobachter' pels witnesses (en+de), un facet espanyol duplicat ('Impulso' per a surge i drive) i 'nav.admin' que falta en ca. Tot concret, un PR.",
        "aud": [
          "U"
        ],
        "pay": [
          "Autoritat"
        ],
        "eff": "Baix",
        "action": {
          "type": "prompt",
          "note": "Execució. Surte els noms espanyols i la decisió de l'Owl al PR per a revisió. Pega el resultat a claude.ai.",
          "text": "GOAL: Resolve the concrete terminology and locale findings from the audit. One focused PR. No server, no test items.\n\nSTEP 1: In witnessRoleDisclaimer, replace \"observers\" (en.json) and \"Beobachter\" (de.json) with the sanctioned Witness term in each language. This refers to the people doing the assessment, so it must be Witness / Zeuge-Zeugin, not observer.\nSTEP 2: Fix the Spanish facet name collision: es.json uses \"Impulso\" for BOTH fqFacets.surge.label (Surge, a Depth facet) and fqFacets.drive.label (Drive, a Discipline facet). Propose two distinct, natural Spanish names consistent with the Cercol vocabulary and apply them. Show both before/after in the PR for my review (this is product vocabulary).\nSTEP 3: Add the missing nav.admin key to ca.json, mirroring the other locales.\nSTEP 4: For the Owl role profile word \"observador/observateur\" (ca/es/fr): this is the personality adjective, not the instrument term. Do NOT change it silently; report it and let me decide.\nSTEP 5: branch, PR, CI, merge, sync. Report the diff and surface the Spanish facet names and the Owl decision for me."
        },
        "done": true
      },
      {
        "id": "tl3",
        "title": "Fidelitat amb la font validada (DA i FR)",
        "why": "Abans d'escriure a Vedel i a Thiry/Piolti, confirma que els ítems coincideixen de veritat amb la seua adaptació. És el detall que et pot fer quedar mal.",
        "aud": [
          "A"
        ],
        "pay": [
          "Autoritat"
        ],
        "eff": "Baix",
        "action": {
          "type": "prompt",
          "note": "Fes-ho ABANS dels emails a Vedel i a Thiry/Piolti. Read-only. Pega l'informe a claude.ai.",
          "text": "GOAL: Read-only source-fidelity check for the two anchored languages. No changes.\n\nDANISH (Vedel et al. 2018):\n- Verify the Danish item text follows the Vedel Danish IPIP-NEO-120.\n- Specifically, confirm the two Values/Compass items use the \"predominantly conservative politically\" formulation (Vedel) and NOT the original \"vote for conservative candidates\" wording. Report the exact Danish strings with file:line.\n\nFRENCH (Thiry & Piolti 2023, European French):\n- Spot-check 10 French items against expected European-French forms (not Canadian French, not obvious machine translation). Report findings.\n\nConfidence: HIGH for exact-string facts, LOW for any judgement about translation quality. Do NOT change anything; report so we decide before the emails go out."
        },
        "done": true
      },
      {
        "id": "tx2",
        "title": "Corregir 'peer-reviewed' als 6 locales (UI pública)",
        "why": "Els docs ja estan corregits (PR #82), però la mateixa afirmació falsa segueix al text visible en els 6 idiomes. És la versió pública de l'error. Fes-ho abans d'escriure a Thiry & Piolti.",
        "aud": [
          "U"
        ],
        "pay": [
          "Autoritat"
        ],
        "eff": "Baix",
        "action": {
          "type": "prompt",
          "note": "Fet (PR #83). La decisió de política que va sorgir està a la passa 'Decidir: la FAQ entra sota l'excepció SEO?'.",
          "text": "GOAL: Fix a factual overclaim in the user-facing locale copy: the French adaptation by Thiry & Piolti (2023) is described as \"peer-reviewed\", which is inaccurate. The docs were already corrected in PR #82; this is the public UI version of the same error. Work from the canonical clone. Full git flow. Do NOT touch test items or the server.\n\nSTEP 1 (read-only): In src/locales/{en,ca,es,fr,de,da}.json, locate the string(s) around line ~1288 that describe Thiry & Piolti / the French adaptation as \"peer-reviewed\" (or the equivalent in each language). Report the exact before-text for all six with file:line.\n\nSTEP 2 (correct, minimal and accurate per language): Replace the false \"peer-reviewed\" qualifier with an accurate phrasing equivalent to \"documented European-French IPIP adaptation listed on ipip.ori.org\", keeping each language natural and faithful. Make the smallest change that removes the overclaim. Preserve placeholders, punctuation and tone. No em dashes.\n\nSTEP 3 (flag, do not decide): While there, report whether this user-facing block uses academic terms (IPIP, NEO, etc.) that may conflict with the no-academic-terms-in-UI rule. Do NOT change that; leave the judgement to me (it ties to the /science SEO exception).\n\nSTEP 4 (git flow): branch fix/locale-french-peer-reviewed-claim, commit, push, open a PR that shows the before/after for ALL SIX languages in the description so the five non-English strings can be human-reviewed. Run CI. If green, squash-merge and sync main. If any non-English phrasing is uncertain, STOP before merge and surface it for my review.\nReport the final diff inline."
        },
        "done": true
      },
      {
        "id": "tr3",
        "title": "Decidir: la FAQ entra sota l'excepció SEO?",
        "why": "Decidit: la FAQ entra sota l'excepció SEO, com /science. Es deixa escrit per a no tornar-hi.",
        "aud": [
          "U"
        ],
        "pay": [
          "Base"
        ],
        "eff": "Baix",
        "action": {
          "type": "do",
          "html": "<ul class=\"ulist\">\n  <li><b>Decidit:</b> la FAQ entra sota l'excepció SEO (com /science). No cal reescriure q7/q8 ni la frase d'idiomes; Big Five, OCEAN i IPIP hi queden permesos.</li>\n  <li>Mateixa decisió per a rolesPage.intro.body2 (AB5C): permès.</li>\n</ul>"
        },
        "done": true
      },
      {
        "id": "tl4",
        "title": "Revisió normativa català/valencià",
        "why": "Fet en gran part al PR #76: auditoria filològica completa del català + remediació de 104 articles, decisió de registre (blog tu, instruments vós) i moltes correccions.",
        "aud": [
          "U"
        ],
        "pay": [
          "Autoritat"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "do",
          "html": "<p class=\"meta\">Cobert pel PR #76 (ja aplicat).</p>\n<ul class=\"ulist\">\n  <li>El #76 va fer la tria i revisió completa del text català: auditoria filològica (docs/audits/catalan), migració 025 reescrivint el català de 104 articles, decisió de registre blog/instruments.</li>\n  <li>Residual lleuger: un últim ull natiu sobre les cadenes d'UI just abans del pitch als mitjans, però el gros ja està fet.</li>\n</ul>"
        },
        "done": true
      },
      {
        "id": "tl5",
        "title": "Tancar el bucle de correccions d'usuari",
        "why": "Ja tens un sistema de feedback de traduccions al backend. Assegura't que les correccions s'arrepleguen i algú les revisa.",
        "aud": [
          "U",
          "A"
        ],
        "pay": [
          "Base"
        ],
        "eff": "Baix",
        "action": {
          "type": "prompt",
          "note": "Read-only. Pega l'informe a claude.ai.",
          "text": "GOAL: Read-only check of the translation-feedback loop. No changes.\n\nSTEP 1: Locate the translation-feedback storage (PostgreSQL table) and the endpoint that writes to it. Report the schema and the language field values it accepts.\nSTEP 2: Report whether there is a review/approval path before a suggested correction reaches the source item files, or whether it is currently write-only with no review surface.\nSTEP 3: Report how many feedback entries exist per language right now.\nConfidence HIGH for schema/file facts, LOW for behaviour inferred from code. Do NOT change anything."
        },
        "done": true
      },
      {
        "id": "tr4",
        "title": "Resoldre el feedback de traduccions (stub i doc fals)",
        "why": "L'auditoria ho destapa: el botó de feedback de traduccions es un stub que sempre torna false i descarta en silenci el que escriu la gent; i SCIENCE.md afirma falsament que es desa i es revisa. Cal fer-ho honest.",
        "aud": [
          "U"
        ],
        "pay": [
          "Base"
        ],
        "eff": "Baix",
        "action": {
          "type": "prompt",
          "note": "Execució del mínim honest. Si prefereixes construir la funció sencera, digues-m'ho i és un altre prompt. Pega el resultat a claude.ai.",
          "text": "GOAL: Resolve the translation-feedback stub honestly. Right now sendTranslationFeedback() always returns false, the endpoint and table 013 do not exist, the button silently discards what users type, and SCIENCE.md falsely claims feedback is stored and reviewed. Full git flow. (If you would rather build the full feature instead, this becomes a different prompt.)\n\nSTEP 1: Correct the false claim in SCIENCE.md (all six per-language methodology sections) so it reflects reality: the translation-feedback mechanism is planned but not yet implemented. No em dashes.\nSTEP 2: Make the UI honest: either hide the translation-feedback button or have it show a clear \"not available yet\" state, so it no longer silently discards user input. Pick the smaller change and report which.\nSTEP 3: branch, PR, CI, merge, sync main. Report the diff."
        },
        "done": true
      }
    ]
  },
  {
    "id": "a4",
    "title": "Que el funnel convertisca",
    "sub": "Les auditories ja estan fetes; ara es tapen les fugues. Sense açò, el trànsit es perd.",
    "tasks": [
      {
        "id": "tf1",
        "title": "Auditar que el funnel mesura de veritat",
        "why": "Si els events no disparen, tot el trànsit que portes no t'ensenya res. I no et fies de view_count, que el prerender infla.",
        "aud": [
          "U"
        ],
        "pay": [
          "Base"
        ],
        "eff": "Baix",
        "action": {
          "type": "prompt",
          "note": "Read-only. Pega l'informe a claude.ai.",
          "text": "GOAL: Read-only audit of the first-party funnel instrumentation. No changes.\n\nSTEP 1: Locate where the events article_view, cta_click, test_start and test_complete are emitted and stored. Report file:line for each.\nSTEP 2: Trace one full path (blog article -> CTA -> instrument start -> result) and confirm each event fires once and only once at the right moment. Flag any event that is missing, double-fired, or fired on prerender/build.\nSTEP 3: Confirm the view_count inflation from prerender (trackBlogView on every build) and recommend which metric to trust for conversion (the first-party funnel events, not view_count).\nConfidence HIGH for code-location facts, LOW for runtime firing inferred from code. Report; do NOT fix."
        },
        "done": true
      },
      {
        "id": "tg1",
        "title": "Tancar el gap de test_start",
        "why": "Ara test_start només dispara a New Moon; First Quarter, Full Moon, Last Quarter i Witness no l'emeten. Això esbiaixa la conversió start cap a complete (pot passar del 100%).",
        "aud": [
          "U"
        ],
        "pay": [
          "Base"
        ],
        "eff": "Baix",
        "action": {
          "type": "prompt",
          "note": "Execució, un PR focalitzat. Pega el resultat a claude.ai.",
          "text": "GOAL: Close the test_start instrumentation gap. test_start currently fires only on New Moon. Add it to the other instruments. Full git flow, one focused PR. No server, no migrations.\n\nSTEP 1 (read-only): Confirm where New Moon emits test_start and that FirstQuarterPage, FullMoonPage, LastQuarterPage and WitnessPage do NOT. Report file:line.\nSTEP 2: Add trackEvent('test_start', { instrument }) on mount for the missing instruments, ideally via one shared hook to avoid divergence. Match the existing New Moon pattern and the __PRERENDER__ guard. Decide whether Witness counts as a start and note the choice.\nSTEP 3: Add tests for the new emissions if the suite covers events.\nSTEP 4: branch feat/test-start-all-instruments, commit, push, PR, CI green, squash-merge, sync main. Report the diff."
        },
        "done": true
      },
      {
        "id": "tf2",
        "title": "El pont article cap a test",
        "why": "Portar gent a un article sense una eixida clara cap a un test gratis es trànsit perdut. Cada article de mes impressions ha de portar a New Moon en un clic.",
        "aud": [
          "U"
        ],
        "pay": [
          "Trànsit"
        ],
        "eff": "Baix",
        "action": {
          "type": "prompt",
          "note": "Read-only. Pega la llista a claude.ai i decidim els canvis.",
          "text": "GOAL: Read-only audit of the article-to-test bridge. No changes.\n\nSTEP 1: Identify the top-impression blog articles (from GSC/BigQuery data if available, else the canonical list).\nSTEP 2: For each, inspect the rendered article and report whether it has a clear, low-friction CTA to a FREE instrument (New Moon, ~2 min, no account). Report which articles have no CTA, a weak CTA, or a CTA buried below the fold.\nSTEP 3: Recommend the minimal CTA pattern (placement + copy) per article. Do NOT implement; report."
        },
        "done": true
      },
      {
        "id": "tg2",
        "title": "El pont del blog: CTA visible i cap al test gratuït",
        "why": "El CTA és bo però només al final, sota el plec d'articles llargs; qui rebota a la meitat no el veu mai. I els enllaços in-body porten al hub /instruments, no a New Moon. Ara es coneix el rànquing real per impressions: prioritza creativity-and-personality, gender-and-personality, procrastination, motivation i forced-choice.",
        "aud": [
          "U"
        ],
        "pay": [
          "Trànsit"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "prompt",
          "note": "Execució. Si cal tocar contingut de la BD de prod, que pare i reporte. Pega el resultat a claude.ai.",
          "text": "GOAL: Strengthen the blog article-to-test bridge. One focused PR. No server.\n\nSTEP 1 (read-only): Confirm BlogTestCTA renders once at the end, the in-body links point to /instruments (not /new-moon), and category headlines exist only for en/ca. Report file:line.\nSTEP 2: Add an early, slim CTA (reuse BlogTestCTA or a compact variant) just before the first <h2> of the body, same to=\"/new-moon\", same cta_click event. Keep the final CTA.\nSTEP 3: For in-body links in article bodies that invite taking the test, point them to /new-moon instead of /instruments. CA bodies are in migration 025 (in-repo). For bodies stored in the prod DB (other languages), do NOT write to prod: report exactly what a content-update migration would change and STOP that part for my sign-off.\nSTEP 4: Localize the category headlines (CATEGORY_H) to es/fr/de/da so they do not fall back to generic.\nSTEP 5: branch, commit, push, PR, CI, merge, sync. Report the diff."
        },
        "done": true
      },
      {
        "id": "tf3",
        "title": "Recórrer tu el funnel en mòbil",
        "why": "La majoria del trànsit informacional es mòbil. Fes el cami tu mateix i mira on es perd la gent.",
        "aud": [
          "U"
        ],
        "pay": [
          "Trànsit"
        ],
        "eff": "Baix",
        "action": {
          "type": "do",
          "html": "<ul class=\"ulist\"><li>Des del mòbil: obri un article, segueix el CTA, fes New Moon sencer i arriba al resultat.</li><li>Cronometra cada pas i apunta tota fricció (càrrega lenta, passa confusa, massa text).</li><li>Apunta ací els tres punts de fricció mes grans.</li></ul>"
        },
        "done": true
      },
      {
        "id": "tf5",
        "title": "Loop de Witness (creixement integrat)",
        "why": "Witness convida fins a 12 persones a avaluar-te: es creixement integrat i gratis. Cada testimoni viu Cèrcol i pot fer-se el seu propi test.",
        "aud": [
          "U"
        ],
        "pay": [
          "Trànsit"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "prompt",
          "note": "Read-only. Pega l'informe a claude.ai.",
          "text": "GOAL: Read-only audit of the Witness invitation loop as a growth mechanism. No changes.\n\nSTEP 1: Inspect the Witness invite flow: how a subject invites witnesses, how smooth the witness entry is (any friction or required account), and how many witnesses are allowed.\nSTEP 2: Check whether, after completing a Witness assessment, the witness is invited to take their own free instrument (a natural acquisition nudge). Report whether this nudge exists.\nSTEP 3: Recommend the minimal change to turn Witness into an acquisition loop (a non-pushy nudge for the witness to try New Moon). Do NOT implement; report."
        },
        "done": true
      },
      {
        "id": "tg3",
        "title": "Nudge a la pantalla final de Witness",
        "why": "El moment de més intenció del producte (acaba de valorar algú en cinc dimensions, sense compte) mor en un enllaç a la home. Un CTA al test gratuït ahí és creixement quasi gratis.",
        "aud": [
          "U"
        ],
        "pay": [
          "Trànsit"
        ],
        "eff": "Baix",
        "action": {
          "type": "prompt",
          "note": "Execució, PR xicotet. Mostra les 6 cadenes noves al PR per a revisió. Pega el resultat a claude.ai.",
          "text": "GOAL: Turn the Witness completion screen into an acquisition nudge. One small PR. No backend, no migration.\n\nSTEP 1 (read-only): Confirm the completion render (the complete and done phases share a block) ends in a single \"Back to Cercol\" link to home, with no link to /new-moon. Report file:line.\nSTEP 2: On the complete phase (just finished), add a primary CTA: a curiosity and reciprocity framed line plus a button Link to=\"/new-moon\" (free, no account). Demote \"Back to Cercol\" to secondary. Separate the done (revisit) copy so it gets a softer version. Emit trackEvent('cta_click', { path: '/witness/complete' }) on click.\nSTEP 3: Add the new strings to all six locales (witness.page.complete.*). Brand voice, no academic terms, no em dashes. Show the six strings in the PR for review.\nSTEP 4: branch, commit, push, PR, CI, merge, sync. Report the diff."
        },
        "done": true
      },
      {
        "id": "tf4",
        "title": "Loop de compartir el resultat",
        "why": "Compartir el resultat (soc un Llop) es el motor de creixement organic d'un test de personalitat. Si no es compartible i atractiu, perds la viralitat gratis.",
        "aud": [
          "U"
        ],
        "pay": [
          "Trànsit"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "prompt",
          "note": "Read-only. Pega l'informe a claude.ai.",
          "text": "GOAL: Read-only audit of the result-sharing loop. No changes.\n\nSTEP 1: Inspect the result/report pages and report whether there is a share action, what it shares (URL, text, image), and whether there is a per-role OG image so a shared link previews the user's animal.\nSTEP 2: Check share-url.js and the og-image generation: is the shared preview specific to the result, or only the generic site OG image?\nSTEP 3: Recommend the minimal changes to make a shared result attractive and self-explanatory (per-role OG image + share text). Do NOT implement; report."
        },
        "done": true
      },
      {
        "id": "tg4",
        "title": "Tancar el bucle de compartir (pla primer)",
        "why": "Compartir només copia un enllaç i el preview és genèric; el ganxo 'soc un Dofí' es perd perquè els scrapers no executen JS. Cal OG per rol, rutes-shell prerenderitzades i Web Share.",
        "aud": [
          "U"
        ],
        "pay": [
          "Trànsit"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "prompt",
          "note": "Pla primer (no codi). M'ho passes per a sign-off i després ve l'execució. Pega el pla a claude.ai.",
          "text": "GOAL: Prepare a plan (do NOT implement yet) to close the result-sharing loop in the static GitHub Pages architecture. Report the plan for sign-off.\n\nCover:\n- 12 static per-role OG images public/og/role-R01..R12.png (1200x630) reusing scripts/generate_og_image.mjs (resvg to png), built at build time. Decide what New Moon shares (the animal/role vs the five dimensions), since the role is computable from the five scores.\n- 12 prerendered share-shell routes (e.g. /share/roleId) added to STATIC_ROUTES, each HTML with per-role og:image, og:title and twitter:image baked in; client JS reads ?r=scores to render the full result.\n- handleShare computes the role from scores, builds the share route plus ?r=encoded, uses Web Share API with clipboard fallback, and per-role share text localized to the six languages (share.* keys).\n- Note the shared OG-per-role infrastructure with the public sample report.\nReport the plan, the file touch list, and the effort. Do NOT write code. Wait for sign-off."
        },
        "done": true
      },
      {
        "id": "tf6",
        "title": "Informe de mostra públic",
        "why": "Un escèptic, una IA o un periodista han de poder vore com es un resultat sense fer el test. Ajuda a convertir i es contingut citable per a GEO.",
        "aud": [
          "U",
          "A"
        ],
        "pay": [
          "Trànsit",
          "GEO"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "prompt",
          "note": "Read-only. Pega l'informe a claude.ai.",
          "text": "GOAL: Read-only investigation: is there a public, indexable sample result/report a visitor can see without taking the test? No changes.\n\nSTEP 1: Report whether such a public sample exists today and at what URL, or whether results are only visible after completing an instrument.\nSTEP 2: If none exists, report what a static, prerendered, citable sample report would require (one fixed example profile, no personal data), and where it should live.\nDo NOT build it; report so we can decide."
        },
        "done": true
      },
      {
        "id": "tg5",
        "title": "Informe de mostra públic (pla primer)",
        "why": "Ara no hi ha cap URL on un visitant fred, una IA o un periodista veja què obtindrà sense fer el test. Clau per a conversió i per a GEO.",
        "aud": [
          "U",
          "A"
        ],
        "pay": [
          "Trànsit",
          "GEO"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "prompt",
          "note": "Pla primer (no codi). Comparteix infraestructura OG amb el bucle de compartir. Pega el pla a claude.ai.",
          "text": "GOAL: Prepare a plan (do NOT implement yet) for a public, indexable sample report. Report for sign-off.\n\nCover:\n- A fixed synthetic profile (no PII): a hardcoded set of five domain scores mapping deterministically to a clean role via computeRole. Choose an illustrative profile.\n- A new non-gated page (SampleReportPage) reusing the existing report components (ReportPageHeader, DimensionRow, RadarDataCard, RoleCard, FacetAccordion), with no redirect, no API, no state dependency.\n- A stable route (/sample or /example-report) added to STATIC_ROUTES, prerendered to static HTML, ideally x6 languages path-based, with its own meta and OG (reuse the per-role OG from the share loop).\n- Links from home, /instruments and the blog CTAs (see an example report).\nReport the plan, the file touch list, and the effort. Do NOT write code. Wait for sign-off."
        },
        "done": true
      },
      {
        "id": "tg6",
        "title": "Construir el share loop (E1)",
        "why": "Aprovat. Les imatges per rol ja existeixen i porten el logo, així que no cal generar-les; el prompt verifica què hi ha i les reutilitza.",
        "aud": [
          "U"
        ],
        "pay": [
          "Trànsit",
          "GEO"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "prompt",
          "note": "Execució frontend, sense backend ni migració. Recorda que deploy-frontend.yml rebakeja l'HTML després del merge. Pega el resultat a claude.ai.",
          "text": "GOAL: Build the share loop (E1) so a shared result previews the user's role. The per-role images already exist and already carry the Cèrcol logo, so do not generate them from scratch. Frontend only, no backend, no migration. Full git flow (branch, PR, CI, merge, sync main).\n\nSTEP 0 (read-only): Locate the existing per-role images. Report for each: path, format, and dimensions. Determine whether they are already usable as Open Graph images (1200x630) or whether they must be composited onto a 1200x630 canvas. Report with file:line before changing anything; do not regenerate images that already exist.\nSTEP 1: If the existing images are not already 1200x630 OG-ready, add a minimal build step that composites each existing per-role image onto a 1200x630 canvas (reusing the OG generation pipeline) into public/og/role-R01.png ... R12.png. If they are already OG-ready, reference them directly. Pick the smaller path and report which.\nSTEP 2: Add 12 prerendered shell routes /share/<roleId> to STATIC_ROUTES, each with og:image / og:title / twitter:image baked in per role; the client reads ?r=<scores> to render the full result. Localized share text per role (share.* keys) in the six languages.\nSTEP 3: Wire handleShare in the three results pages: compute the role from scores, build /share/<roleId>?r=<encodedScores>, use the Web Share API with a clipboard fallback.\nSTEP 4: Build, verify a couple of /share/<role> routes prerender with the correct per-role og:image and that handleShare builds the right URL. Tests, branch, PR, CI, merge, sync main. Report the diff and the STEP 0 image decision."
        },
        "done": true
      },
      {
        "id": "tg7",
        "title": "Donar OK per construir el sample report (E2)",
        "why": "Fusionat (#95): /sample públic, sense API ni estat, prerenderitzat path-based als 6 idiomes, reutilitzant l'OG-per-rol d'E1.",
        "aud": [
          "U"
        ],
        "pay": [
          "GEO",
          "Trànsit"
        ],
        "eff": "Baix",
        "action": {
          "type": "prompt",
          "note": "Execució frontend. Recorda el rebake de deploy-frontend.yml. Pega el resultat a claude.ai.",
          "text": "GOAL: Build the public sample report (E2). The OG-per-role infra from E1 (PR #92) is merged, reuse it. Frontend only, no backend, no migration. Full git flow (branch, PR, CI, merge, sync main).\n\nSTEP 0 (read-only): Confirm the report components to reuse (ReportPageHeader, DimensionRow, RadarDataCard, RoleCard, FacetAccordion) and the prop shape they expect from the results pages.\nSTEP 1: Add a fixed synthetic sample profile (no PII) in src/data/sample-profile.js: five hardcoded scores mapping deterministically via computeRole to a clean role (for example near the Dolphin centroid). Comment that it is synthetic.\nSTEP 2: Add src/pages/SampleReportPage.jsx, a non-gated page rendering the existing report components from the fixed constant, with no redirect, no API call, no state dependency.\nSTEP 3: Add a stable route /sample to STATIC_ROUTES, prerendered to static HTML (indexable without JS), ideally path-based in the six languages, with its own meta/OG reusing the per-role OG image.\nSTEP 4: Add entry links from home, /instruments and the blog CTA (\"see a sample report\").\nSTEP 5: Build, verify /sample prerenders with correct meta and renders without JS state, tests, branch, PR, CI, merge, sync main. Report the diff."
        },
        "done": true
      }
    ]
  },
  {
    "id": "a5",
    "title": "Contingut que atrau",
    "sub": "La capa que faltava: peces que la gent vol llegir i compartir, cada una pont al test.",
    "tasks": [
      {
        "id": "tc1",
        "title": "Definir la línia de contingut accessible",
        "why": "Fet: agent creat i primer article redactat (Silent Book Club → Octopus, draft #97); veu aprovada. Firma i varietat es treballen a la 5.2.",
        "aud": [
          "U"
        ],
        "pay": [
          "Trànsit"
        ],
        "eff": "Baix",
        "action": {
          "type": "prompt",
          "note": "Corregeix l'agent i llança l'article del mussol. Segueix gated/draft fins que validis la veu. Pega el resultat a claude.ai.",
          "text": "GOAL: The Aina Albaida agent and its first article (DRAFT PR #97) are wrong. Fix the agent spec and replace the article. Keep it a DRAFT, gated, for Miquel's review. Do not publish.\n\nWHY THE FIRST ATTEMPT FAILED (must be fixed in the spec):\n1. It hooked on a MEME (\"make your job sound illegal\"). A meme is universal: people of any role share it and are funny. So \"this meme means you are the Owl\" is invalid reasoning, and the claim that quiet, observant people make better memes is simply false.\n2. The voice read like a teacher explaining, not a person who is actually in the trend and active on social media.\n3. The CTA linked to a GitHub URL instead of the real First Quarter route.\n\nREVISED METHOD the agent spec must encode:\n- The hook must be a REAL current trend that people opt into by preference: a social tendency, a hobby, an activity, or a product that is genuinely blowing up right now, AND where liking or choosing it plausibly signals a personality disposition. NOT a meme, NOT a viral format, NOT generic relatable content, NOT anything universal. Brand-safe (nothing NSFW).\n  Right shape (illustrative, do not reuse): \"everyone is suddenly joining book clubs / sewing meetups / run clubs / obsessing over [gadget] ... if that is you, you are probably the [role] of your team.\"\n- The trait-to-role link must be honest and plausible, framed playfully as a hypothesis, never asserted as proven science. The test is the real answer. This is the Cèrcol voice: real science, honest about limits, warm with an edge.\n- Voice: someone who is IN the trend and active on social, colloquial, direct, a little cheeky. Hooky opener (\"you have definitely seen X everywhere lately\"). Not a lecture. 3 minute read maximum. No jargon, no hype, no em dashes.\n- Structure: hook on the trend, the playful \"if you love X you might be the [role]\", a short warm line on what that role brings to a team, then the honest turn (\"the only way to actually know is the test\"), then the CTA.\n- CTA: take First Quarter Cèrcol (Quart Creixent), linking to the real First Quarter route on cercol.team (not a repo URL). Byline: \"Aina Albaida, AI agent specialised in psychological divulgation and trends\" (AI disclosed). English first.\n\nSTEPS:\nSTEP 1: Rewrite docs/agents/aina-albaida.md with the revised method. Make the rule explicit and central: no memes, no universal viral formats, the hook must be a preference that differentiates people by personality.\nSTEP 2: Delete the Owl / \"make your job sound illegal\" draft. Research a real, currently live trend that fits the revised method (use the web tools), and draft ONE new English article with it, using the correct First Quarter URL in the CTA.\nSTEP 3: Update DRAFT PR #97 (or a fresh draft branch if cleaner) with the revised spec and the new article. Keep it DRAFT, gated, do not publish. Report the chosen trend, why it differentiates by personality rather than being universal, and the new draft."
        },
        "done": true
      },
      {
        "id": "tc2",
        "title": "Escriure les primeres 2-3 peces (EN + CA)",
        "why": "Fet: 3 articles més (Dolphin/run clubs, Tortoise/planners, Fox/film) amb estructura ben variada. La repetició de frases recurrents i l'enriquiment es corregeixen a la 5.3.",
        "aud": [
          "U"
        ],
        "pay": [
          "Trànsit"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "prompt",
          "note": "El test d'aquest lot és la varietat. Tot segueix draft. Pega el resultat a claude.ai.",
          "text": "GOAL: The Aina voice is approved. Now (a) make the byline more casual, and (b) write three more articles to check the line is not repetitive. Keep everything DRAFT and gated; do not publish.\n\nBYLINE: Replace \"AI agent specialised in psychological divulgation and trends\" with a more casual, street-level byline, in the spirit of \"the AI that reads the trends and tells you what your Cèrcol role says about how you move through the world\" (do NOT copy that literally, craft one that fits Aina's voice). It must still disclose that Aina is an AI. Apply the new byline in the spec (docs/agents/aina-albaida.md) and in the existing Silent Book Club / Octopus article.\n\nTHREE MORE ARTICLES (English, drafts):\n- Each hooks on a different real, currently live trend that people opt into by preference (a hobby, an activity, a product, a social tendency) and that differentiates people by personality. No memes, no universal viral formats, brand-safe. Research each with the web tools.\n- Each maps honestly to a DIFFERENT Cèrcol role, different from the Octopus and from each other (four distinct roles across the set). Pick the honest fit; do not force a trend onto a role (as you correctly avoided forcing HYROX onto Falcon). Keep the \"a trend is a hint, not proof, the test is the answer\" turn.\n- CTA in each: https://cercol.team/first-quarter.\n\nTHE ACTUAL TEST OF THIS BATCH IS VARIETY. Do NOT reuse the same skeleton (hook, then \"who likes it\", then \"meet the role\", then \"the honest part\", then CTA). Vary the structure, the opening move, the rhythm and the section shape across the four pieces, so they read like different articles by the same person, not one template filled four times. Some can open with a scene, some with a question, some with a confession; the role can arrive early in one and late in another; vary length within the 3 minute cap.\n\nSTEPS:\nSTEP 1: Update the byline in the spec and the Octopus article. Add to the spec an explicit anti-repetition rule: each article must vary its structure and opening, never reuse a fixed skeleton.\nSTEP 2: Draft the three new articles as gated draft files alongside the Octopus one (same drafts location), each with proposed front-matter. No em dashes anywhere.\nSTEP 3: Keep it all on the draft PR (#97 or a fresh draft branch), gated, not published. Report the four trend/role pairings and, in one line each, how the four differ in structure so the variety is visible."
        },
        "done": true
      },
      {
        "id": "tc3",
        "title": "Polir Aina: matar repeticions de frase + enriquir (imatges, enllaços)",
        "why": "Fet (#97): beats reescrits (cada gir honest, descàrrec i pre-CTA distint), portada Unsplash de llicència lliure i enllaços per aprofundir a cada article. Queden dos serrells: no es veuen les imatges al draft i els enllaços interns ixen com a URLs de GitHub (5.4).",
        "aud": [
          "U"
        ],
        "pay": [
          "Trànsit",
          "GEO"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "prompt",
          "note": "Investiga primer el model d'imatges/enllaços del blog. Tot segueix draft i gated. Pega el resultat a claude.ai.",
          "text": "GOAL: Refine the four Aina drafts and the spec on two fronts: (a) kill the recurring-phrase repetition that shows up across the set, and (b) enrich them beyond plain text with an image and deeper-reading links. Investigate the blog's image/link model first. Keep everything DRAFT and gated; do not publish.\n\nSTEP 1 (read-only, report with file:line):\n- How blog articles handle images: the cover_url field, where cover images are sourced and licensed (the repo normalised Unsplash URLs in Phase 17.1), and whether the content body (JSONB HTML) supports inline images.\n- Internal link targets to link to: the public sample report (/sample), the role-related pages, /science, and the existing academic blog article most related to each of the four trends (search the blog for the closest match per article).\n- Whether any of this needs a schema change. STOP and report if enrichment would need a migration (for example a new field); do not apply one.\n\nSTEP 2 (repetition fix, in the spec and the four drafts): the macro-structure already varies well (openings, role timing, length, subheads). The problem is the recurring BEATS reuse near-identical wording across articles. Reword them so each is different, and add a spec rule that these beats must never be phrased the same way twice:\n- Honest turn: \"A trend can point at a trait. It cannot measure one.\" is in all four almost verbatim. Reword differently in each.\n- \"That split is the whole point.\" is verbatim in two. Remove or reword.\n- The hint / pre-CTA beat (\"it is a hint, a good one\" plus \"go find out if the hunch holds\") repeats across all four, with the word \"hunch\" every time. Vary it.\n- The disclaimer \"the honest bit, this is not a horoscope / fortune cookie\" repeats; \"horoscope\" appears twice. Vary it and retire the repeats.\n- \"A team without an X ... a team with one ...\" is near-identical in two. Vary the team-stakes line.\n\nSTEP 3 (enrichment, per STEP 1 findings): give each of the four a licensed cover image (Unsplash or similar free licence, attributed as the source requires, relevant to the trend), and weave in one or two casual deeper-reading links: the trend's source for the stat (outbound, framed casually) and an internal link (the public sample report at /sample, the closest existing academic article, or the role). Keep it light, not a bibliography; the First Quarter CTA stays the primary action. Update the spec so every future article ships with a cover image and one or two deeper-reading links, not plain text.\n\nSTEP 4: Keep it on the draft PR (#97 or a fresh draft branch), gated, not published. No em dashes. Report the per-article cover image chosen and its licence, the deeper-reading links added, and confirm the recurring beats now read differently in each."
        },
        "done": true
      },
      {
        "id": "tc4",
        "title": "Previsualització dels articles + arreglar els enllaços interns",
        "why": "Les portades viuen a cover_url (no al text), així que no es veuen al draft. I els enllaços per aprofundir ixen com a URLs de GitHub; dos /blog potser no resolen.",
        "aud": [
          "U"
        ],
        "pay": [
          "Trànsit"
        ],
        "eff": "Baix",
        "action": {
          "type": "prompt",
          "note": "Et deixa un fitxer local per obrir al navegador i deixa els enllaços nets. Tot segueix draft i gated. Pega el resultat a claude.ai.",
          "text": "GOAL: Make the four Aina drafts reviewable as they will actually look (cover image + body + links), and fix the deeper-reading links. The cover images live only in the cover_url front-matter, so they are invisible when reading the raw markdown. Keep everything DRAFT and gated; do not publish.\n\nSTEP 1 (links, fix + verify): The deeper-reading links currently render as GitHub blob URLs (root-relative paths resolved against the repo) and are inconsistent with the CTA, which is absolute (https://cercol.team/...).\n- Make every in-article link absolute and consistent: https://cercol.team/<path> (sample, roles, blog/<slug>, first-quarter).\n- Verify each target actually resolves. The two /blog/<slug> deeper-reading links came from a Catalan audit doc, not the live blog; check they exist (a GET against the live blog or the DB). If a slug does not resolve, replace it with one that does or drop that link. /roles, /sample and /first-quarter are known good.\nSTEP 2 (preview): Build a single self-contained preview that renders all four drafts as they will look: the cover_url image at the top, the marked body, and the working links. Write it to a local file in the canonical clone (for example docs/blog-drafts/preview.html), self-contained so it opens directly in a browser with the Unsplash covers loading. Exclude it from the docs CI gates like the other drafts.\nSTEP 3: Commit to the draft PR (gated, not published). Report the exact local path for Miquel to open in a browser, and the final link list per article with confirmation each resolves."
        }
      }
    ]
  },
  {
    "id": "a6",
    "title": "Autoritat i trànsit barat",
    "sub": "Valida que el pont convertix amb trànsit repetible, abans de cremar el tir d’un sol ús.",
    "tasks": [
      {
        "id": "t11",
        "title": "Escriure a Anna Vedel (instrument danés)",
        "why": "El danés és la teua base científica més forta. Avisar-la és cortesia i pot obrir endós i porta als mitjans danesos. Fidelitat danesa verificada (Vedel ok): pots enviar.",
        "aud": [
          "A"
        ],
        "pay": [
          "Autoritat"
        ],
        "eff": "Baix",
        "action": {
          "type": "email",
          "to": "avedel@psy.au.dk",
          "subject": "Cercol - an open-source team assessment using your Danish IPIP-NEO-120",
          "body": "Dear Dr Vedel,\n\nI am Miquel Matoses, the developer of Cercol (https://cercol.team), a free, open-source team personality assessment built on the public-domain IPIP item pool.\n\nThe Danish version of our instruments follows your validated Danish IPIP-NEO-120 (Vedel, Gotzsche-Astrup & Holm, 2018). I wanted to let you know, and to thank you: of the six languages we offer, the Danish instrument has the strongest scientific basis, precisely because of your validation work.\n\nThe full scoring pipeline and our language methodology are documented openly here: https://cercol.team/science\n\nIf you ever spot something that should be corrected, or have any feedback, it would be very welcome.\n\nKind regards,\nMiquel Matoses\ncercol.team"
        }
      },
      {
        "id": "t12",
        "title": "Escriure a Thiry & Piolti (adaptació francesa)",
        "why": "Mateixa lògica per al francés. Marc honest: segueixes la seua aproximació de traducció, no una validació en revista. Fidelitat francesa verificada i claim 'peer-reviewed' ja corregida (PR #83): pots enviar.",
        "aud": [
          "A"
        ],
        "pay": [
          "Autoritat"
        ],
        "eff": "Baix",
        "action": {
          "type": "email",
          "to": "benjaminthiry@hotmail.com, maeva.piolti@gmail.com",
          "subject": "Cercol - un test d'equipe open-source qui suit votre adaptation francaise de l'IPIP",
          "body": "Bonjour Dr Thiry, bonjour Mme Piolti,\n\nJe suis Miquel Matoses, developpeur de Cercol (https://cercol.team), un test de personnalite d'equipe libre et open-source fonde sur le pool d'items IPIP (domaine public).\n\nLes items francais de Cercol suivent votre approche d'adaptation europeenne de l'IPIP (Thiry & Piolti, 2023). Je tenais a vous en informer et a vous remercier.\n\nL'ensemble du pipeline de calcul et notre methodologie de traduction sont documentes ouvertement ici : https://cercol.team/science\n\nSi vous reperez quoi que ce soit a corriger, ou si vous avez des retours, ils seront les bienvenus.\n\nCordialement,\nMiquel Matoses\ncercol.team"
        }
      },
      {
        "id": "t21",
        "title": "Investigar si el prerender es citable",
        "why": "Els crawlers d'IA quasi no executen JS: el que val es l'HTML prerenderitzat. Cal verificar que porta el nom Cercol i els diferenciadors al davant.",
        "aud": [
          "U",
          "A"
        ],
        "pay": [
          "GEO"
        ],
        "eff": "Baix",
        "action": {
          "type": "prompt",
          "note": "Read-only. Pega l'informe a la conversa amb claude.ai i decidim els canvis.",
          "text": "GOAL: Read-only investigation. Verify whether Cercol's PRERENDERED HTML is structured to be cited by AI answer engines. No commits, no changes, no server actions.\n\nContext: AI crawlers mostly do not execute JavaScript, so what matters is the prerendered static HTML in dist/ (and the deployed pages), not the React runtime.\n\nSTEP 1: Build the prerendered output locally (the project's build/prerender script) WITHOUT deploying. Report the command and whether it succeeded. If it fails, STOP and report.\n\nSTEP 2: For the home page, /science, and 2 sample blog articles, inspect the prerendered HTML and report, with file:line evidence and a confidence level:\n- Does \"Cercol\" appear in the first visible heading/paragraph and in <title> / meta description?\n- Are the key differentiators (open-source, IPIP public-domain, Witness forced-choice peer assessment, 12 AB5C animal roles, 6 languages, free instruments) present as extractable text near the top, not only deep in the page or only in JS?\n- On /science: are statistics and claims paired with inline citations/DOIs in the static HTML?\n- Is llms.txt present and does it name Cercol and the differentiators?\n\nSTEP 3: Report a short list of concrete, low-risk improvements (HIGH confidence = exact string/structure facts; LOW confidence = inferred crawler behaviour). Do NOT implement anything. End with the report inline."
        },
        "done": true
      },
      {
        "id": "t23",
        "title": "Baseline GEO: on apareixes hui",
        "why": "Fes la foto inicial. Repeteix-ho cada mes per veure si guanyes terreny a les respostes d'IA. És, de fet, l'única mesura fiable de visibilitat IA que tens: el frontend viu a GitHub Pages sense logs, així que el rastreig i el referrer d'IA són cecs (la migració a Cloudflare ho desbloquejaria).",
        "aud": [
          "U",
          "A"
        ],
        "pay": [
          "GEO"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "do",
          "html": "<p class=\"meta\">Corre cada consulta a <b>ChatGPT, Perplexity, Claude i Gemini</b>. Apunta a un full: data, plataforma, consulta, apareix Cercol (S/N), posició.</p><ul class=\"ulist\">\n          <li>EN: best free personality test for teams</li>\n          <li>EN: open source team personality assessment</li>\n          <li>EN: Belbin alternative open source</li>\n          <li>EN: free Big Five team assessment no signup</li>\n          <li>EN: IPIP implementation free online</li>\n          <li>CA: test de personalitat d'equip</li>\n          <li>CA: alternativa a Belbin gratis</li>\n          <li>ES: test de personalidad para equipos gratis</li>\n          <li>DA: personlighedstest team gratis</li>\n          <li>DA: Big Five team dansk</li></ul>"
        }
      },
      {
        "id": "t23b",
        "title": "Automatitzar el rastreig GEO (job propi) [needs-ADR]",
        "why": "El baseline manual (6.4) es pot semi-automatitzar amb un job teu que pregunte a APIs amb cerca i compte quantes vegades hi apareix Cèrcol. No es SaaS de tercers; encaixa amb el patró jobs/cron + BigQuery que ja tens.",
        "aud": [
          "U",
          "A"
        ],
        "pay": [
          "GEO"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "do",
          "html": "<ul class=\"ulist\">\n  <li><b>Com:</b> job mensual (api/jobs + cron) que envia un set fix de consultes a APIs amb recuperació web (Perplexity sonar i/o un model amb web search), fa grep de \"Cèrcol\"/\"cercol.team\" i desa presència + snippet a cercol_seo.geo_visibility.</li>\n  <li><b>Honest:</b> les respostes d'IA no son deterministes ni iguals a l'app de consum. Corre cada consulta diverses vegades i reporta un <b>hit-rate</b>, no un sí/no. Te cost d'API (xicotet si capes consultes×corregudes×models).</li>\n  <li><b>Límit estructural:</b> açò mesura <b>aparició en respostes</b>, no <b>trànsit</b> des d'elles; el referrer d'IA segueix cec a GitHub Pages (Cloudflare ho desbloquejaria).</li>\n  <li><b>Governança:</b> afig dependència externa + cost + categoria de dades nova, com els jobs SEO (ADRs 0005-0007). Necessita un ADR (Proposed) abans de codi. Si vols, et munto l'ADR + el prompt d'investigació.</li>\n</ul>"
        }
      },
      {
        "id": "t31",
        "title": "Afegir Cercol a llistes awesome i directoris OSS",
        "why": "La recerca conclou que no existeix cap llista 'awesome' mantinguda amb bon encaix; les candidates son abandonades o de mal àmbit.",
        "aud": [
          "U",
          "A"
        ],
        "pay": [
          "GEO"
        ],
        "eff": "Baix",
        "action": {
          "type": "do",
          "html": "<ul class=\"ulist\">\n  <li>No hi ha cap submission clara de qualitat. L'única dubtosa es INRIA/awesome-open-science-software, i només si consideres Cèrcol una eina open-science.</li>\n  <li>Recomanació: <b>saltar</b> de moment; es baix ROI. AlternativeTo (passa següent) rendeix mes.</li>\n</ul>"
        },
        "done": true
      },
      {
        "id": "t32",
        "title": "Llistar a AlternativeTo",
        "why": "Captura la intenció 'alternativa a Belbin / DISC / 16personalities', que es alta i citada per IA.",
        "aud": [
          "U"
        ],
        "pay": [
          "Trànsit",
          "GEO"
        ],
        "eff": "Baix",
        "action": {
          "type": "link",
          "url": "https://alternativeto.net",
          "label": "Obri AlternativeTo",
          "copyLabel": "Copia la descripció",
          "copy": "Cercol is a free, open-source team personality assessment based on the Big Five (OCEAN) using the public-domain IPIP item pool. It maps 12 team archetypes from the AB5C circumplex and includes Witness, a forced-choice peer assessment that reduces social-desirability bias. Available in 6 languages. Free instruments require no account or card.",
          "html": "<p class=\"meta\">Registra Cercol com a alternativa a <b>Belbin</b>, <b>16Personalities</b> i <b>DISC</b>. Enganxa la descripció de davall.</p>"
        }
      },
      {
        "id": "t71",
        "title": "Reddit: escalfar i participar",
        "why": "Reddit es anti-autopromocio i alimenta el citation pool de les IA. Nomes funciona amb participacio real.",
        "aud": [
          "U",
          "A"
        ],
        "pay": [
          "Autoritat",
          "GEO"
        ],
        "eff": "Alt",
        "action": {
          "type": "do",
          "html": "<ul class=\"ulist\"><li>Compte amb historial; aporta valor a r/IOPsychology, r/psychometrics, r/agile abans de res.</li><li>Comparteix l'eina nomes quan respon a una pregunta real i les normes del sub ho permeten.</li></ul>"
        }
      },
      {
        "id": "t72",
        "title": "Quora: respondre 5 preguntes del nínxol",
        "why": "Quora apareix molt a les respostes d'IA. Durador i de baix risc.",
        "aud": [
          "U",
          "A"
        ],
        "pay": [
          "GEO"
        ],
        "eff": "Baix",
        "action": {
          "type": "do",
          "html": "<ul class=\"ulist\"><li>Busca preguntes tipus 'best team personality test', 'Belbin alternative', 'free Big Five test'.</li><li>Respon amb substancia; menciona Cercol nomes quan encaixa de veritat.</li></ul>"
        }
      },
      {
        "id": "t73",
        "title": "Primers equips reals",
        "why": "El nord es tests completats, i per a un producte d'equip aixo vol dir equips. A mes, estes dades desbloquegen els llindars de validacio (N>=200, N>=300) i, amb ells, el preprint i les normes reals.",
        "aud": [
          "U",
          "A"
        ],
        "pay": [
          "Trànsit",
          "Autoritat"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "do",
          "html": "<ul class=\"ulist\"><li>Fes rodar Cèrcol amb 3 equips reals: el teu entorn, startups conegudes, el teu propi grup.</li><li>Genera els primers Last Quarter i arreplega les primeres dades.</li><li>Demana'ls feedback honest del resultat i de la utilitat.</li></ul>"
        }
      },
      {
        "id": "t74",
        "title": "Facilitadors i coaches",
        "why": "Qui fa tallers d'equip pot adoptar Cèrcol gratis com a eina del taller: equips reals sense que tu hages de buscar-los un a un.",
        "aud": [
          "U"
        ],
        "pay": [
          "Trànsit"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "do",
          "html": "<ul class=\"ulist\"><li>Identifica 3-5 facilitadors o coaches d'equip (agile, RH, lideratge).</li><li>Oferta: usen Cèrcol gratis amb els seus equips; tu n'obtens us real i ells una eina nova.</li></ul>"
        }
      }
    ]
  },
  {
    "id": "a7",
    "title": "Llança",
    "sub": "El tir d’un sol ús i les empentes de mercat, quan el pont ja convertix.",
    "tasks": [
      {
        "id": "t40",
        "title": "Abans de provocar un pic: aguantarà?",
        "why": "Comprovat: la cara visible aguanta un pic; el que degrada és l'API dinàmica, no les landing.",
        "aud": [
          "U"
        ],
        "pay": [
          "Base"
        ],
        "eff": "Baix",
        "action": {
          "type": "do",
          "html": "<ul class=\"ulist\">\n  <li><b>Estàtic (segur):</b> home, top-level i articles van per GitHub Pages (CDN, HTML prerenderitzat), TTFB ~30-50ms. Un pic de Show HN a les landing l'absorbeix el CDN; el visitant aterra en HTML estàtic sense dependre de l'API.</li>\n  <li><b>Dinàmic (en risc):</b> api.cercol.team al VPS de 2 cores compartit. Sota pic, el coll d'ampolla és el flood de POST /events + fetches /blog de la SPA. Si peta, es perd telemetria i la navegació SPA s'alenteix; <b>no</b> trenca les landing.</li>\n  <li><b>Estat del box:</b> load 0.35 ara (el ~16 de l'audit vell era transitori). Memòria ajustada; els gunicorn de topquaranta consumeixen el gros.</li>\n  <li><b>Cinturó opcional:</b> cache de /blog i rate-limit/shed de /events (no aplicades). No pots escalar el box tu sol: és compartit.</li>\n</ul>"
        },
        "done": true
      },
      {
        "id": "t41",
        "title": "Preparar el post de Show HN",
        "why": "Open-source + pipeline auditable + limitacions honestes: aguanta l'escrutini de HN, que sol ser brutal amb la psicometria.",
        "aud": [
          "U",
          "A"
        ],
        "pay": [
          "Trànsit",
          "GEO"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "do",
          "titleCopy": "Copia el títol",
          "titleText": "Show HN: Cercol - open-source Big Five team assessment (public-domain IPIP)",
          "copyLabel": "Copia el primer comentari (maker)",
          "copy": "I built Cercol, a free team personality assessment on the Big Five using the public-domain IPIP item pool. Scoring is 100% client-side and the whole pipeline is documented and open-source. It derives 12 team archetypes from the AB5C circumplex, and includes a forced-choice peer assessment (Witness) to cut social-desirability bias. Six languages, including Catalan and a Danish version based on Vedel et al.'s validated IPIP-NEO-120.\n\nHonest limitation: the 12-role model is a principled derivation from published literature, not yet validated as a predictor of team performance. The validation plan and N thresholds are published. Happy to discuss the scoring, the methodology, or where it could be wrong.",
          "html": "<ul class=\"ulist\"><li>Compte HN actiu (perfil complet). Títol modest, sense superlatius.</li><li>El primer comentari el penges tu just al publicar, amb una limitació honesta dins.</li></ul>"
        }
      },
      {
        "id": "t42",
        "title": "Llista de 10-30 contactes tecnics",
        "why": "HN detecta vots coordinats. Demana feedback honest, mai upvotes.",
        "aud": [
          "U"
        ],
        "pay": [
          "Trànsit"
        ],
        "eff": "Baix",
        "action": {
          "type": "do",
          "html": "<ul class=\"ulist\"><li>Apunta 10-30 persones tecniques (excol·legues, primers usuaris, gent del ram).</li><li>El missatge demana <b>opinió i crítica</b>, no vots.</li></ul>"
        }
      },
      {
        "id": "t43",
        "title": "Llançar i moderar la primera hora",
        "why": "La primera hora decideix si arribes a portada. La conversa activa et manté visible.",
        "aud": [
          "U"
        ],
        "pay": [
          "Trànsit"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "do",
          "html": "<ul class=\"ulist\"><li>Dimarts a dijous, mati hora del Pacífic.</li><li>Respon cada comentari dins de la primera hora.</li><li>Front a crítiques dures: responc amb dades i amb les limitacions ja publicades.</li></ul>"
        }
      },
      {
        "id": "t51",
        "title": "Pitch en català per a mitjans",
        "why": "L'angle 'ciencia oberta, feta a casa, en català, competencia zero' es genuinament noticiable a VilaWeb, Nació Digital i À Punt. Abans, passa la revisió normativa català/valencià (Credibilitat lingüística).",
        "aud": [
          "U"
        ],
        "pay": [
          "Trànsit",
          "Autoritat"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "do",
          "copyLabel": "Copia el pitch",
          "copy": "Assumpte: Cercol, ciencia oberta de personalitat d'equip feta des del Pais Valencia, en catala\n\nSoc Miquel Matoses, desenvolupador de Cercol (cercol.team), una plataforma lliure i de codi obert per avaluar la personalitat d'equips amb el model Big Five i items de domini public (IPIP). Tot el sistema de calcul es auditable i obert.\n\nEs, que jo sapia, l'unic test de personalitat d'equip disponible en catala, amb 12 arquetips animals i una avaluacio de parells que elimina el biaix de desitjabilitat social. Hi ha 6 idiomes, i la versio danesa es basa en un instrument validat cientificament.\n\nPense que pot interessar com a historia de ciencia oberta feta a casa. Estic disponible per ampliar el que calga.\n\nGracies,\nMiquel",
          "html": "<p class=\"meta\">Destinataris: seccions de tecnologia/ciencia de <b>VilaWeb</b>, <b>Nació Digital</b>, <b>À Punt</b>. Personalitza el primer paràgraf per a cada un.</p>"
        }
      },
      {
        "id": "t52",
        "title": "Universitats valencianes/catalanes (us docent)",
        "why": "Instruments gratis per a cursos de psicologia/management: usuaris reals, boca-orella i credibilitat.",
        "aud": [
          "U",
          "A"
        ],
        "pay": [
          "Autoritat"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "do",
          "html": "<ul class=\"ulist\"><li>Contacta departaments de psicologia o direcció d'equips.</li><li>Oferta: New Moon i First Quarter gratis per a practiques de classe.</li></ul>"
        }
      },
      {
        "id": "t61",
        "title": "Angle danés quan Vedel responga",
        "why": "L'entrada natural als mitjans de ciencia danesos es via academica, no un pitch directe.",
        "aud": [
          "U",
          "A"
        ],
        "pay": [
          "Autoritat"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "do",
          "html": "<ul class=\"ulist\"><li>Depen de la resposta de la passa <b>1.1</b>.</li><li><b>Videnskab.dk</b> treballa amb investigadors per divulgar; <b>Aktuel Naturvidenskab</b> el publica la Universitat d'Aarhus (on es Vedel).</li><li>Per l'angle open-source/tech: <b>Version2</b>.</li></ul>"
        }
      }
    ]
  },
  {
    "id": "a8",
    "title": "Rumb",
    "sub": "Objectius i l’arbre de decisió que governa les bifurcacions.",
    "tasks": [
      {
        "id": "tz2",
        "title": "Objectius SMART (90 dies)",
        "why": "Fites concretes i mesurables, realistes per a un fundador sol, lligades a mètriques ja instrumentades. Ajusta'ls a la teua realitat.",
        "aud": [
          "U",
          "A"
        ],
        "pay": [
          "Base"
        ],
        "eff": "Baix",
        "action": {
          "type": "do",
          "html": "<ul class=\"ulist\">\n          <li><b>G1 - el pont degota (dies 1-30):</b> 30 tests completats des de trànsit no-propi (comunitats, share, Witness). Mètrica: test_complete. Si s'arriba, el pont converteix.</li>\n          <li><b>G2 - llançament (dies 31-60):</b> nomes despres de G1, 1 Show HN. Objectiu: 1.000 visites en 48h i 80 o mes tests completats atribuits per utm.</li>\n          <li><b>G3 - autoritat i GEO (dies 1-90):</b> figurar a ipip.ori.org mes 2 llistes awesome mes resposta de Vedel o Thiry. Objectiu: aparèixer en 3 o mes de les 10 consultes GEO de la baseline.</li>\n          <li><b>G4 - equips i dades (dies 1-90):</b> 3 equips reals completats (Last Quarter) i N acumulat creixent cap als llindars de validacio.</li>\n        </ul>"
        }
      },
      {
        "id": "tz3",
        "title": "Arbre de decisió",
        "why": "Cada bifurcacio amb una accio clara, perque no improvises en calent.",
        "aud": [
          "U",
          "A"
        ],
        "pay": [
          "Base"
        ],
        "eff": "Baix",
        "action": {
          "type": "do",
          "html": "<ul class=\"ulist\">\n          <li><b>Decisió 1, l'arrancada:</b> NO disparar Show HN fins que el Que el funnel convertisca mostre que el pont article cap a test converteix amb trànsit menut (G1). Si comunitats, share i Witness donen tests, el pont degota: endavant. Si no, primer arregla CTA i fricció; no cremes el tir.</li>\n          <li><b>Decisió 2, resultat de Show HN:</b> si pega a portada, aprofita el pic (respon tot, captura interessats, encadena directoris i mitjans, vigila que el VPS aguante, i decideix abans que passa amb el beta auto-grant dels primers usuaris). Si fa flop, no es el final: Show HN admet reposts amb millores significatives; afila l'angle, prova comunitats i mitjans, i torna-ho en 1-2 mesos.</li>\n          <li><b>Decisió 3, autoritat vs trànsit:</b> si les dades creixen (equips i tests), s'obrin les portes acadèmiques profundes (el preprint deixa d'estar bloquejat en arribar a N>=300 amb metodes complets). Si no creixen, queda't en trànsit i loops i no malgastes esforç en l'acadèmic profund encara.</li>\n          <li><b>Decisió 4, idioma:</b> si per utm el català o el danés responen millor, dobla en eixe nínxol. Si l'EN global domina, concentra-t'hi.</li>\n        </ul>"
        }
      }
    ]
  },
  {
    "id": "a9",
    "title": "Ocupabilitat i senyals externs",
    "sub": "Capa de credibilitat que travessa el projecte. Embolcall, no substància: si es menja temps de producte, va al revés.",
    "tasks": [
      {
        "id": "te0",
        "title": "L'arquitectura: 4 nodes i un pipeline",
        "done": true,
        "why": "El marc que fa açò controlable en lloc de caòtic. Dos objectius distints (ocupabilitat vs audiència de Cèrcol) demanen centres distints.",
        "aud": [],
        "pay": [
          "Ocupabilitat"
        ],
        "eff": "Baix",
        "action": {
          "type": "do",
          "html": "<ul class=\"ulist\">\n  <li><b>Nucli propi (cercol.team):</b> README + /science + /blog. Ací s'acumula el contingut i el valor SEO/GEO.</li>\n  <li><b>Marca personal (tu):</b> perfil LinkedIn + portfolio + CV. Ací miren recruiters i DTU; Cèrcol hi apareix com a projecte amb credencial.</li>\n  <li><b>Satèl·lit (pàgina de Cèrcol a LinkedIn):</b> cara professional i fites, baixa manutenció.</li>\n  <li><b>Superfícies de senyal extern:</b> cada listing, citació o publicació (IPIP fet, OpenScales, newsletter, meetup, investigador). Cada un és un backlink cap als nodes de dalt.</li>\n  <li><b>Pipeline únic:</b> article d'Aina → cercol.team → ganxo al LinkedIn personal → mai l'article sencer fora del domini. Fita important → post personal + pàgina.</li>\n</ul>"
        }
      },
      {
        "id": "te1",
        "title": "Munyir l'IPIP: badge al README",
        "why": "Cèrcol ja està llistat a ipip.ori.org entre les implementacions de qualitat. Fer-ho visible al README és recollida pura.",
        "aud": [],
        "pay": [
          "Ocupabilitat",
          "Autoritat"
        ],
        "eff": "Baix",
        "action": {
          "type": "prompt",
          "note": "Execució. Pega el resultat a claude.ai.",
          "text": "GOAL: Add an IPIP-listing badge to the Cèrcol README. Cèrcol is now listed among the high-quality implementations at ipip.ori.org. Full git flow.\n\nSTEP 1: Add a shields.io static badge to README.md reading \"Listed among high-quality IPIP implementations\", using the mm-design README palette (cf3339, 0047ba, f1c22f, 427c42, 111111 - pick the one that fits the existing badge row), linking to https://ipip.ori.org/IPIPImplementationsAroundTheWeb.htm . Match the existing badge style and placement.\nSTEP 2: Verify the badge renders and the link resolves. branch, PR, CI, merge, sync main. Report the diff."
        }
      },
      {
        "id": "te2",
        "title": "Post LinkedIn + línia de CV + targeta de portfolio",
        "why": "El primer senyal munyit al teu costat. Viu al teu perfil personal (molt més abast que una pàgina), enllaçant a cercol.team.",
        "aud": [],
        "pay": [
          "Ocupabilitat"
        ],
        "eff": "Baix",
        "action": {
          "type": "do",
          "html": "<ul class=\"ulist\">\n  <li>Teu: post curt al teu perfil personal, línia al CV (\"open-source psychometrics platform listed among high-quality IPIP implementations\") i targeta al portfolio.</li>\n  <li>El post enllaça a cercol.team; mai l'article sencer natiu a LinkedIn. Esborrany a punt quan el demanes.</li>\n</ul>"
        }
      },
      {
        "id": "te3",
        "title": "Pàgina de Cèrcol a LinkedIn (satèl·lit)",
        "why": "Cara professional del projecte per poder posar-lo com a posició actual i penjar-hi fites. No és el centre ni per publicar-hi els articles.",
        "aud": [],
        "pay": [
          "Ocupabilitat"
        ],
        "eff": "Baix",
        "action": {
          "type": "do",
          "html": "<ul class=\"ulist\">\n  <li>Crear la pàgina d'empresa com a satèl·lit: baixa manutenció, fites (com el listing IPIP), i un lloc que el teu perfil enllaça.</li>\n  <li>NO publicar-hi els articles d'Aina de manera nativa: el teu perfil té més abast i els articles han de viure a cercol.team pel SEO/GEO. La pàgina rep el ganxo i l'enllaç, no el contingut.</li>\n</ul>"
        }
      },
      {
        "id": "te4",
        "title": "Badges de maduresa + ADRs/post-mortems visibles al README",
        "why": "Un hiring manager decideix en 30 segons. Els ADRs i post-mortems ja els tens; fes-los visibles. Baix esforç, alt senyal, amb avisos.",
        "aud": [],
        "pay": [
          "Ocupabilitat"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "prompt",
          "note": "Execució amb gate al coverage. Sense badge d'uptime. Pega el resultat a claude.ai.",
          "text": "GOAL: Make Cèrcol's maturity visible from the README: test coverage (only if the number is decent), a Lighthouse/performance badge (only if honest), a CHANGELOG, and visible links to the existing ADRs and post-mortems. Full git flow, with a STOP on the coverage decision.\n\nSTEP 1 (read-only): Measure the actual test coverage (frontend vitest + backend pytest) and report the numbers. Do NOT add a coverage badge yet. STOP and report the number: if it is low, do not add a coverage badge (a bad badge is worse than none). Proceed with the rest regardless.\nSTEP 2: Add a concise CHANGELOG.md (seed it from the ROADMAP completed phases and recent PRs), and add a \"Project maturity\" section to README linking to docs/decisions (ADRs) and docs/post-mortems.\nSTEP 3: Add a Lighthouse/performance badge only if there is a stable honest number to show (PageSpeed data exists in cercol_seo.pagespeed_runs); otherwise skip and say so. Do NOT add an uptime badge or status page: the 30-day silent outage history makes an uptime signal work against us, and Uptime Kuma would be new infra on the shared VPS.\nSTEP 4: branch, PR, CI, merge, sync main. Report what was added and the coverage number so Miquel can decide on the coverage badge."
        }
      },
      {
        "id": "te5",
        "title": "Write-up: why we killed Supabase (retrospectiva d'ADR)",
        "why": "Una història d'enginyeria real amb decisions documentades demostra criteri. La matèria primera ja la tens.",
        "aud": [],
        "pay": [
          "Ocupabilitat",
          "GEO"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "do",
          "html": "<ul class=\"ulist\">\n  <li>Matèria primera: ADR 0001/0003, fase 14.5, post-mortems. El redacte jo amb tu.</li>\n  <li>Decisió: on es publica, al teu domini personal (millor per a marca) o al blog de Cèrcol.</li>\n  <li>Distribució teua: Data Engineering Weekly, dbt Slack. Un enllaç des d'una newsletter del sector és un altre \"listing\".</li>\n</ul>"
        }
      },
      {
        "id": "te6",
        "title": "Reclutar un investigador: 5 correus a grups de psicometria",
        "why": "El de més ROI de la llista. La pàgina IPIP ja diu que Cèrcol convida investigadors; fes-ho actiu. Una col·laboració o citació acadèmica alimenta la narrativa DTU.",
        "aud": [
          "A"
        ],
        "pay": [
          "Ocupabilitat",
          "Autoritat"
        ],
        "eff": "Baix",
        "action": {
          "type": "do",
          "html": "<ul class=\"ulist\">\n  <li>5 correus curts oferint la plataforma per a estudis. Porta natural: Revelle i Condon (ICAR/SAPA), ja que Cèrcol usa l'ICAR (Condon i Revelle 2014, a SCIENCE.md); també autors del BFAS.</li>\n  <li>Te'ls redacte jo; els envies tu.</li>\n  <li>Resultat realista: una resposta calenta o una citació futura, no col·laboració immediata.</li>\n</ul>"
        }
      },
      {
        "id": "te7",
        "title": "Segon listing: OpenScales (investigar primer)",
        "why": "Dos listings independents ja són patró, no sort. Però abans cal confirmar què és OpenScales.",
        "aud": [],
        "pay": [
          "Ocupabilitat",
          "Autoritat"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "do",
          "html": "<ul class=\"ulist\">\n  <li>Abans de res, investigar: OpenScales està manteninguda? accepta submissions? com és el format .osd? (ho miro jo).</li>\n  <li>Si és viable: Claude Code converteix un inventari de Cèrcol a .osd i el proposa al repositori.</li>\n</ul>"
        }
      },
      {
        "id": "te8",
        "title": "MCP públic útil de Cèrcol [needs-ADR]",
        "why": "El món MCP és menut i calent; és on miren els recruiters d'AI tooling. Però publicar l'MCP intern seria senyal buit.",
        "aud": [
          "A"
        ],
        "pay": [
          "Ocupabilitat",
          "Autoritat"
        ],
        "eff": "Alt",
        "action": {
          "type": "do",
          "html": "<ul class=\"ulist\">\n  <li>No publicar l'MCP intern (túnel SSH, read-only sobre BigQuery): ningú de fora el pot usar i toca el VPS compartit.</li>\n  <li>El moviment fort: un MCP públic xicotet que deixe una IA administrar i puntuar els instruments gratuïts de Cèrcol i tornar el rol. Llistable, útil, i demostra domini d'MCP.</li>\n  <li>Necessita ADR (subdomini públic, exposició, VPS compartit) abans de codi. Després, publicar-lo als registres (oficial, PulseMCP, Smithery).</li>\n</ul>"
        }
      },
      {
        "id": "te9",
        "title": "Lightning talk a Copenhaguen",
        "why": "El teu nom a la pàgina d'un meetup és un altre listing, i el networking és el ping que busques.",
        "aud": [],
        "pay": [
          "Ocupabilitat"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "do",
          "html": "<ul class=\"ulist\">\n  <li>Meetup de Copenhaguen (dbt Meetup, PyData CPH, o un d'MCP/AI) sobre el pipeline SEO+MCP, que tens viscut.</li>\n  <li>Tu apliques; jo munte l'abstract, l'esquema i les slides.</li>\n</ul>"
        }
      }
    ]
  },
  {
    "id": "a10",
    "title": "Citable",
    "sub": "Investigat el 22/08/2026 per quatre agents, un per àmbit. Reverificat a mà després, i dues troballes van caure: que el nom eixia trencat a l'IPIP (no, la pàgina declara windows-1252 i el byte és correcte) i la URL de la pàgina de traduccions (era un 404). La troballa que ho ordena tot: quasi res d'ací espera més respostes.",
    "tasks": [
      {
        "id": "ct1",
        "title": "Enviar l'avís de consentiment",
        "why": "L'única passa del pla que empitjora mentre espera. Cada revista de dades demana consentiment, anonimització i declaració ètica, i el consentiment no es pot demanar cap arrere: les respostes recollides abans que això existisca no seran publicables mai. Amb 41 respostes, això encara costa poc.",
        "aud": [
          "U"
        ],
        "pay": [
          "Base"
        ],
        "eff": "Baix",
        "action": {
          "type": "do",
          "html": "<ul class=\"ulist\"><li>Una casella que diga clarament que les respostes es podran publicar com a conjunt de dades obert i anonimitzat, CC0 o CC BY.</li><li>Nota de protecció de dades per als visitants de la UE.</li><li>A partir d'ahí, comptar dues xifres, no una: respostes completes, i parelles completes jo+Testimoni. Les parelles són l'actiu rar.</li></ul>"
        },
        "done": false
      },
      {
        "id": "ct3",
        "title": "DOI del programari a Zenodo",
        "why": "Converteix Cèrcol de lloc web en objecte citable. Un DOI de concepte per al projecte i un per versió, propagat a Software Heritage. Cada llistat posterior pot apuntar-hi. Una hora.",
        "aud": [
          "A"
        ],
        "pay": [
          "Autoritat"
        ],
        "eff": "Baix",
        "action": {
          "type": "link",
          "url": "https://help.zenodo.org/docs/github/enable-repository/",
          "label": "Obri la guia de Zenodo",
          "copyLabel": "Copia el CITATION.cff",
          "copy": "cff-version: 1.2.0\ntitle: Cèrcol\nmessage: If you use this software, please cite it as below.\ntype: software\nauthors:\n  - family-names: Matoses\n    given-names: Miquel\nrepository-code: 'https://github.com/cercol/cercol'\nurl: 'https://cercol.team'\nlicense: MIT",
          "html": "<p class=\"meta\">Connecta el compte de GitHub, activa el repositori, etiqueta v1.0.0. Afig el CITATION.cff i el distintiu del DOI al README i a /science.</p>"
        },
        "done": false
      },
      {
        "id": "ct4",
        "title": "Dipòsit a PsychArchives (ZPID)",
        "why": "El DOI més barat que hi ha en psicologia. Autoservei, gratis per davall d'1 GB, només comprovació formal, sense revisió per parells, sense requisit d'afiliació, i normalment un o dos dies laborables.",
        "aud": [
          "A"
        ],
        "pay": [
          "Autoritat"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "link",
          "url": "https://www.psycharchives.org/en/contribute",
          "label": "Obri PsychArchives",
          "copyLabel": "Copia l'adreça de contacte",
          "copy": "psycharchives-submission@leibniz-psychology.org",
          "html": "<p class=\"meta\">Diposita el codi de puntuació i el joc d'ítems alemany com a objectes citables, CC BY-SA. Més avant, el conjunt de dades.</p>"
        },
        "done": false
      },
      {
        "id": "ct5",
        "title": "Projecte OSF per a la metodologia",
        "why": "Una pàgina citable de com funciona la puntuació, separada de l'aplicació. És el que citarà un revisor, o un model de llenguatge, quan descriga el mètode. DOI gratuït.",
        "aud": [
          "A"
        ],
        "pay": [
          "Autoritat",
          "GEO"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "link",
          "url": "https://help.osf.io/article/392-create-a-doi",
          "label": "Obri la guia de DOI d'OSF",
          "copyLabel": "Copia el guió de continguts",
          "copy": "Contents of the OSF project:\n1. Item-to-scale mappings for all four instruments\n2. Scoring formulas (client-side, as shipped)\n3. Six-language translation protocol from SCIENCE.md\n4. Norm sources and how they are applied\n5. Witness scoring logic and the role centroids",
          "html": "<p class=\"meta\">Crea el projecte, fes-lo públic, encunya el DOI.</p>"
        },
        "done": false
      },
      {
        "id": "ct6",
        "title": "Afegir el català a la pàgina de traduccions de l'IPIP",
        "why": "Quaranta llengües llistades a newItemTranslations.htm, de l'àrab al gal·lés, cadascuna acreditada a qui la va aportar. El català no hi és, i el francés tampoc. La pàgina demana explícitament que qui haja traduït ítems escriga a Johnson, així que el correu és l'acció que ells conviden a fer. L'única mesura Big Five validada en català que s'ha trobat és el TIPI de 10 ítems (Renau et al. 2013), que al seu propi resum es diu la primera.",
        "aud": [
          "A"
        ],
        "pay": [
          "Autoritat"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "email",
          "to": "j5j@psu.edu",
          "subject": "Catalan translation of the IPIP-NEO items",
          "body": "Dear Professor Johnson,\n\nThank you again for the two listings in July. People have arrived at the repository through them.\n\nI am writing about a different page. newItemTranslations.htm asks anyone who has translated IPIP items to get in touch, so: Cèrcol runs a full Catalan/Valencian translation of the IPIP-NEO items, and Catalan is not among the languages listed there. I would be glad to contribute it in whatever form is most useful to you.\n\nTo be precise about what it is, since the page rightly notes that accuracy is not verified: an open item set with a documented translation methodology, not a validated instrument. Validation is in progress and I would not want the entry to claim otherwise. The only validated Catalan Big Five measure I can find is the 10-item TIPI (Renau et al., 2013), which describes itself as the first, so a 120-item set may be the largest open one in the language. That is exactly why I would rather it were findable from your page than only from mine.\n\nThe items, the mapping and the method are here: https://github.com/cercol/cercol/blob/main/SCIENCE.md\n\nWith thanks,\nMiquel"
        },
        "done": false
      },
      {
        "id": "ct7",
        "title": "Escriure a Anna Vedel (Aarhus)",
        "why": "Va traduir i validar exactament l'instrument danés que fas córrer, i va coescriure el BFI-2 danés. Dinamarca no té un buit d'instruments, en té un de lliurament: res danés, lliure i obert l'administra amb informe, ni cobreix avaluació entre iguals ni rols d'equip. Col·laboradora, no porter.",
        "aud": [
          "A"
        ],
        "pay": [
          "Autoritat"
        ],
        "eff": "Baix",
        "action": {
          "type": "do",
          "html": "<ul class=\"ulist\"><li>Ofereix el que el seu article de 2018 no va poder recollir: una plataforma oberta i viva, una capa d'avaluació entre iguals, i un conjunt de dades danés anonimitzat.</li><li>Steven Ludeke (SDU) és el segon nom.</li><li>Aclareix amb ella la llicència de reutilització de la versió danesa abans de res: la pàgina de l'IPIP no en declara cap.</li></ul>"
        },
        "done": false
      },
      {
        "id": "ct8",
        "title": "Xarxa danesa de reproductibilitat",
        "why": "Oberta explícitament a qualsevol etapa de carrera i a gent de fora de la universitat. L'entrada danesa més barata, i una via cap a la gent de mètodes de KU, AU, AAU i SDU.",
        "aud": [
          "A"
        ],
        "pay": [
          "Autoritat"
        ],
        "eff": "Baix",
        "action": {
          "type": "link",
          "url": "https://danish-repro.github.io/",
          "label": "Obri Danish Reproducibility Network",
          "copyLabel": "Copia el correu",
          "copy": "danish.repro@gmail.com",
          "html": "<p class=\"meta\">Apunta't a la llista. No cal demostrar res.</p>"
        },
        "done": false
      },
      {
        "id": "ct9",
        "title": "Escriure a William Revelle (personality-project)",
        "why": "Convida explícitament a suggerir enllaços i correccions, i publica el seu correu. La llista no acadèmica encara va carregada d'enllaços de l'època MBTI, així que un instrument obert basat en l'IPIP és una millora real. El llegeixen estudiants i qui fa servir el paquet psych d'R.",
        "aud": [
          "A"
        ],
        "pay": [
          "Autoritat",
          "Trànsit"
        ],
        "eff": "Baix",
        "action": {
          "type": "email",
          "to": "revelle@northwestern.edu",
          "subject": "An open IPIP-NEO implementation in six languages",
          "body": "Dear Professor Revelle,\n\nYour site says suggestions for links and corrections are always welcome, so here is one you may or may not want.\n\nCèrcol (https://cercol.team) is an open-source implementation of the IPIP-NEO, 60 and 120 items, scored in the browser with the published keys, in six languages. The item sourcing and the scoring pipeline are public and citable, including the limitations not yet solved: https://github.com/cercol/cercol/blob/main/SCIENCE.md\n\nJohn Johnson added it to two pages on ipip.ori.org in July. If your non-academic list is still open to additions, an open IPIP-sourced instrument may be a more useful destination for a student than some of what is currently linked there.\n\nWith respect,\nMiquel Matoses"
        },
        "done": false
      },
      {
        "id": "ct10",
        "title": "Llistar a Softcatalà (El Rebost)",
        "why": "L'índex canònic del programari en català, i alimenta Softvalencià. Enviament autoservei, moderat. Necessita interfície en català i llicència oberta: les dues coses ja les compleix.",
        "aud": [
          "U"
        ],
        "pay": [
          "Trànsit"
        ],
        "eff": "Baix",
        "action": {
          "type": "link",
          "url": "https://www.softcatala.org/programes/",
          "label": "Obri El Rebost",
          "copyLabel": "Copia la descripció",
          "copy": "Cèrcol és una avaluació de personalitat de codi obert per a equips, basada en el model dels cinc grans i en el banc d'ítems IPIP de domini públic. Quatre instruments, sis llengües, amb traducció completa al català. La puntuació es fa al navegador i el codi és públic.",
          "html": "<p class=\"meta\">Cerca primer el nom per si ja hi és, i després omple nom, web, descripció, categoria, autor, llicència i logo.</p>"
        },
        "done": false
      },
      {
        "id": "ct11",
        "title": "Dipòsit del codi font a HAL",
        "why": "Fa Cèrcol citable dins de les bibliografies acadèmiques franceses, amb arxiu automàtic a Software Heritage. Qualsevol persona amb compte pot dipositar-hi.",
        "aud": [
          "A"
        ],
        "pay": [
          "Autoritat"
        ],
        "eff": "Baix",
        "action": {
          "type": "link",
          "url": "http://doc.hal.science/en/deposer/deposer-le-code-source/",
          "label": "Obri la guia de HAL",
          "copyLabel": "",
          "copy": "",
          "html": "<p class=\"meta\">Necessita llicència lliure, un domini, autors i almenys una afiliació.</p>"
        },
        "done": false
      },
      {
        "id": "ct12",
        "title": "Article a Psiara (COPC)",
        "why": "El llegeixen els psicòlegs col·legiats catalans. Publicació web contínua més un PDF maquetat tres vegades l'any.",
        "aud": [
          "A"
        ],
        "pay": [
          "Autoritat",
          "Trànsit"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "do",
          "html": "<ul class=\"ulist\"><li>Un article d'interès professional sobre eines obertes d'avaluació en català, no una promoció del producte.</li><li>Envia'l en Word a comunicacio@copc.cat.</li><li><b>Verifica l'adreça abans d'enviar</b>: copc.cat bloqueja la consulta automàtica i no la vaig poder obrir.</li></ul>"
        },
        "done": false
      },
      {
        "id": "ct13",
        "title": "Open Test Archive (ZPID Leibniz)",
        "why": "Casa curada i amb DOI per als instruments mateixos, a l'arxiu que els psicòlegs de parla alemanya consulten a propòsit. 262 tests d'accés obert. Les sis llengües hi juguen a favor com a material suplementari. Com que els ítems són IPIP de domini públic, el problema de drets que atura la majoria no t'afecta.",
        "aud": [
          "A"
        ],
        "pay": [
          "Autoritat"
        ],
        "eff": "Alt",
        "action": {
          "type": "link",
          "url": "https://www.testarchiv.eu/en/veroeffentlichen",
          "label": "Obri les instruccions de publicació",
          "copyLabel": "Copia el correu",
          "copy": "testarchiv@leibniz-psychology.org",
          "html": "<p class=\"meta\">Vol consentiment signat, l'instrument en la seua plantilla, una descripció estructurada, fiabilitats i una descripció de mostra o barems. Les fiabilitats són la part que necessita dades.</p>"
        },
        "done": false
      },
      {
        "id": "ct14",
        "title": "Personality Science, tipus Projects & Data",
        "why": "Accés obert diamant, sense quota, avalada per cinc associacions de personalitat, i un tipus d'article que anomena literalment recursos, plataformes i conjunts de dades. La revista que millor encaixa de tota la recerca.",
        "aud": [
          "A"
        ],
        "pay": [
          "Autoritat"
        ],
        "eff": "Alt",
        "action": {
          "type": "link",
          "url": "https://journals.sagepub.com/author-instructions/ppp",
          "label": "Obri les instruccions per a autors",
          "copyLabel": "",
          "copy": "",
          "html": "<p class=\"meta\">Unes 1.000 autoavaluacions, o uns quants centenars de parelles completes jo+Testimoni. El disseny multilingüe amb parelles és la novetat, no el recompte.</p>"
        },
        "done": false
      },
      {
        "id": "ct15",
        "title": "Journal of Open Psychology Data",
        "why": "Article de dades revisat per parells. Els conjunts de dades no han de ser importants; els resultats negatius hi són benvinguts explícitament.",
        "aud": [
          "A"
        ],
        "pay": [
          "Autoritat"
        ],
        "eff": "Alt",
        "action": {
          "type": "link",
          "url": "https://openpsychologydata.metajnl.com/about/submissions/",
          "label": "Obri les normes d'enviament",
          "copyLabel": "",
          "copy": "",
          "html": "<p class=\"meta\">Unes 500 respostes consentides amb demografia. Quota de 536 £, amb exempcions. El que tomba els enviaments és una secció de Reuse Potential fluixa.</p>"
        },
        "done": false
      },
      {
        "id": "ct16",
        "title": "ZIS (GESIS)",
        "why": "Repositori obert d'escales de ciències socials, un DOI per instrument, publicar-hi és gratuït. Transferir un instrument a un context nou hi qualifica, i una traducció documentada amb dades ho és.",
        "aud": [
          "A"
        ],
        "pay": [
          "Autoritat"
        ],
        "eff": "Alt",
        "action": {
          "type": "link",
          "url": "https://zis.gesis.org/infotexte/Publikationsprozess.html",
          "label": "Obri el procés de publicació",
          "copyLabel": "",
          "copy": "",
          "html": "<p class=\"meta\">Vol proves de fiabilitat i validesa amb respostes reals.</p>"
        },
        "done": false
      },
      {
        "id": "ct17",
        "title": "Psicothema",
        "why": "La revista de psicologia espanyola de més impacte, publicada amb el COP. Les seues normes de 2026 exigeixen materials i dades obertes, que és la teua posició natural.",
        "aud": [
          "A"
        ],
        "pay": [
          "Autoritat"
        ],
        "eff": "Alt",
        "action": {
          "type": "link",
          "url": "https://www.psicothema.com/envio",
          "label": "Obri el portal d'enviament",
          "copyLabel": "",
          "copy": "",
          "html": "<p class=\"meta\">Un estudi de validació real amb mostra espanyola. Una descripció del web es rebutja d'entrada.</p>"
        },
        "done": false
      },
      {
        "id": "ct18",
        "title": "Aloma (Blanquerna, URL)",
        "why": "Accepta català, sense quotes, i és la revista que va publicar el TIPI català el 2013. El precedent exacte per a una validació en català.",
        "aud": [
          "A"
        ],
        "pay": [
          "Autoritat"
        ],
        "eff": "Alt",
        "action": {
          "type": "link",
          "url": "https://revistaaloma.blanquerna.edu/index.php/aloma",
          "label": "Obri Aloma",
          "copyLabel": "",
          "copy": "",
          "html": "<p class=\"meta\">Parla amb els editors abans d'enviar res.</p>"
        },
        "done": false
      },
      {
        "id": "ct19",
        "title": "Validar el joc d'ítems francés",
        "why": "El buit més gran de tota la recerca. Les dues traduccions franceses de l'IPIP-NEO són explícitament no validades, inclosa la que fas servir, els autors de la qual diuen que la validació està pendent. L'única opció validada és de nivell de domini, sense facetes, i amb llicència només per a recerca. No hi ha cap repositori obert de tests francòfon. Un Big Five validat, obert i amb facetes en francés no existeix hui.",
        "aud": [
          "A"
        ],
        "pay": [
          "Autoritat"
        ],
        "eff": "Alt",
        "action": {
          "type": "do",
          "html": "<ul class=\"ulist\"><li>Necessita respostes en francès en quantitat.</li><li>No hi ha ningú a qui desplacar: només dues traduccions que els seus propis autors diuen que estan pendents de validar.</li></ul>"
        },
        "done": false
      },
      {
        "id": "ct20",
        "title": "Element a Wikidata",
        "why": "Defensable quan existisquen dos o tres DOI i el llistat de l'IPIP, perquè allí la notabilitat vol dir identificable i referenciat, no famós. Wikipedia és una altra cosa i la resposta honesta és encara no, potser mai, i només si altres et citen.",
        "aud": [
          "A"
        ],
        "pay": [
          "GEO",
          "Autoritat"
        ],
        "eff": "Mitjà",
        "action": {
          "type": "link",
          "url": "https://www.wikidata.org/wiki/Wikidata:Notability",
          "label": "Obri les normes de notabilitat",
          "copyLabel": "",
          "copy": "",
          "html": "<p class=\"meta\">Espera els DOI. Un element creat per un mateix atrau peticions d'esborrat, així que que siga escarit i factual.</p>"
        },
        "done": false
      },
      {
        "id": "ct21",
        "title": "Revisió final de Sandre Llopis",
        "why": "L'últim filtre abans de parlar amb cap investigador, i el que cap agent pot substituir: una persona nativa amb formació filològica llegint els ítems sencers. Va després d'haver corregit tot el que sabíem corregir, no abans, perquè el seu temps val i no s'ha de gastar en el que ja hem detectat nosaltres. Convidar-lo a fer la Lluna Plena no és cortesia: 120 ítems llegits mentre s'hi respon és la lectura que troba el que una taula de correccions no ensenya. El compte no cal preparar-lo a mà: qui entra i verifica el correu rep la llicència beta automàticament mentre en queden.",
        "aud": [
          "A"
        ],
        "pay": [
          "Base",
          "Autoritat"
        ],
        "eff": "Baix",
        "action": {
          "type": "email",
          "to": "llopisdepau2023@gmail.com",
          "subject": "Un favor de filòleg: els ítems catalans de Cèrcol",
          "body": "Sandre,\n\nEt volia demanar un favor de la teua especialitat.\n\nCèrcol és un test de personalitat de codi obert que estic fent, basat en el banc d'ítems IPIP, que és de domini públic i el que fa servir la recerca de veres. Va en sis llengües, i el català és una d'elles.\n\nEls ítems catalans els vam passar per una revisió a fons i van eixir prou tocats: formes que no existien, un parell de castellanismes amb terminació catalana, i un ítem que directament mesurava una altra cosa que l'original. Ja està tot corregit i unificat en català central. Però abans d'oferir el joc a l'IPIP perquè el llisten, m'agradaria que li pegara una ullada algú que sap de veres, i eixe eres tu.\n\nEl que et demanaria és el que jo no puc fer: llegir-los com a text, no com a taula de correccions. Són 190 frases curtes en primera persona, del tipus \"Em preocupo per les coses\" o \"No m'agrada cridar l'atenció\". El que busque és si alguna sona a traducció, si hi ha res que un parlant no diria, i si el registre és el que toca: han de ser frases planeres, no literàries.\n\nLa manera més còmoda de veure'ls en context és fent el test llarg, que en són 120. Entres amb aquest mateix correu i ja tens accés complet: en som en fase beta i les llicències de la Lluna Plena van soltes. https://cercol.team/full-moon\n\nI si de pas et ve de gust el resultat, és teu. El càlcul és obert i està documentat, per si el vols mirar per dins.\n\nSense presses i sense compromís. Si no et ve bé, m'ho dius i ja està.\n\nUna abraçada,\nMiquel"
        },
        "done": false
      }
    ]
  }
]

/** Every step, flattened, in plan order. */
export const PLAN_TASKS = PLAN_SECTIONS.flatMap((s) => s.tasks.map((t) => ({ ...t, section: s.id })))

/** Audience and payoff tags, as used across the plan. */
export const AUDIENCE = { U: 'Usuaris', A: 'Acadèmic' }
export const PAYOFFS = ['Base', 'Trànsit', 'Autoritat', 'GEO', 'Ocupabilitat']
export const EFFORTS = ['Baix', 'Mitjà', 'Alt']

/**
 * The first step that is not done, in plan order. The panel leads with it:
 * a list of ninety-one things is a list nobody starts.
 */
export function nextTask(status = {}) {
  return PLAN_TASKS.find((t) => (status[t.id]?.status ?? (t.done ? 'done' : 'todo')) !== 'done') || null
}

/** Effective state: D1 wins, the plan's own flag is the fallback. */
export function taskStatus(task, status = {}) {
  return status[task.id]?.status ?? (task.done ? 'done' : 'todo')
}
