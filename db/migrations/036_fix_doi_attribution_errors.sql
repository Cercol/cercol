-- Migration 036: resolve the two DOI attribution errors left open by 035
--
-- Migration 035 deliberately left two dead DOIs in place because they were
-- attribution errors, not digit errors: the cited paper did not support the
-- sentence it was attached to, so swapping in a resolvable DOI would have
-- turned a visibly broken link into an invisibly false citation. Both needed
-- an editorial decision. Those decisions are made here, and they are
-- different, because the two claims are not in the same situation.
--
-- 1. five-personality-science-myths-that-wont-die
--    "High Conscientiousness ... worse performance in roles requiring creative
--     improvisation (Judge et al., 1999, DOI: 10.1037/0021-9010.84.6.929)"
--
--    The CLAIM is well supported; only the citation was wrong. LePine,
--    Colquitt & Erez (2000), "Adaptability to Changing Task Contexts: Effects
--    of General Cognitive Ability, Conscientiousness, and Openness to
--    Experience", Personnel Psychology 53(3), 563-593, found precisely this:
--    after an unforeseen change in task context, LOWER Conscientiousness
--    produced better decisions, an effect the authors traced to the
--    dependability facets (order, dutifulness, deliberation) rather than the
--    volition facets. So the citation is replaced wholesale, author-year and
--    DOI together, rather than repointing "Judge et al., 1999" at a DOI that
--    is not theirs. The parenthetical is byte-identical in all six languages,
--    so one replace covers the corpus.
--
-- 2. personality-and-communication-style-direct-vs-diplomatic
--    "Research by Roberts and colleagues (2005, doi:10.1037/0022-3514.89.1.122)
--     found that Conscientiousness was the strongest Big Five predictor of
--     communication formality, structured documentation habits, and preference
--     for procedurally clear information exchange."
--
--    Here the CLAIM itself is the problem. No such finding exists: Roberts,
--    Chernyshenko, Stark & Goldberg (2005) is an investigation of the
--    hierarchical factor structure of Conscientiousness across seven
--    inventories and makes no communication claim, and a literature search
--    turned up no study isolating communication formality or documentation
--    habits as a Big Five outcome. There is no correct DOI to substitute,
--    because the sentence describes a study that was never run.
--
--    Inventing a plausible-looking replacement is exactly the failure mode
--    this whole thread of migrations exists to stop, so the sentence is
--    rewritten instead: it keeps the substance (these habits do follow from
--    what Conscientiousness measures) and drops the false empirical framing,
--    saying plainly that this is an inference from the trait rather than a
--    research finding. Rewritten in all six languages; the replacement text
--    was generated against the live strings so the needles match exactly.
--
-- Idempotent: replace() on an absent needle is a no-op. Apply through
-- .github/workflows/apply-migrations.yml.
--
-- 035 declared both DOIs as retired to keep its own header passing the CI
-- gate. This migration retires them for real, so the declarations end here:
-- doi-check: retires 10.1037/0021-9010.84.6.929
-- doi-check: retires 10.1037/0022-3514.89.1.122

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Wrong citation, sound claim: repoint to the paper that actually found it.
-- ---------------------------------------------------------------------------

UPDATE blog_posts SET content = (
  SELECT jsonb_object_agg(
    key,
    CASE WHEN jsonb_typeof(value) = 'string'
         THEN to_jsonb(replace(value #>> '{}',
                '(Judge et al., 1999, DOI: 10.1037/0021-9010.84.6.929)',
                '(LePine et al., 2000, DOI: 10.1111/j.1744-6570.2000.tb00214.x)'))
         ELSE value END)
  FROM jsonb_each(content))
WHERE slug = 'five-personality-science-myths-that-wont-die'
  AND content <> '{}'::jsonb;

-- ---------------------------------------------------------------------------
-- 2. No such study: rewrite the sentence, one language at a time.
-- ---------------------------------------------------------------------------

-- [en] 260 chars
--   OLD: Research by Roberts and colleagues (2005, doi:10.1037/0022-3514.89.1.122) found that Conscienti...
UPDATE blog_posts SET content = jsonb_set(content, '{en}',
  to_jsonb(replace(content ->> 'en',
    'Research by Roberts and colleagues (2005, doi:10.1037/0022-3514.89.1.122) found that Conscientiousness was the strongest Big Five predictor of communication formality, structured documentation habits, and preference for procedurally clear information exchange.',
    'This pattern follows from what Conscientiousness measures (orderliness, deliberation and planfulness) rather than from research isolating communication formality as an outcome.')))
WHERE slug = 'personality-and-communication-style-direct-vs-diplomatic' AND content ->> 'en' IS NOT NULL;

-- [ca] 291 chars
--   OLD: La recerca de Roberts i col·legues (2005, doi:10.1037/0022-3514.89.1.122) va trobar que Conscie...
UPDATE blog_posts SET content = jsonb_set(content, '{ca}',
  to_jsonb(replace(content ->> 'ca',
    'La recerca de Roberts i col·legues (2005, doi:10.1037/0022-3514.89.1.122) va trobar que Conscientiousness era el predictor del Big Five més fort de la formalitat comunicativa, dels hàbits de documentació estructurada i de la preferència per un intercanvi d''informació procedimentalment clar.',
    'Aquest patró es dedueix del que mesura la Conscientiousness (ordre, deliberació i planificació) més que no pas de recerca que aïlli la formalitat comunicativa com a resultat.')))
WHERE slug = 'personality-and-communication-style-direct-vs-diplomatic' AND content ->> 'ca' IS NOT NULL;

-- [es] 298 chars
--   OLD: La investigación de Roberts y colegas (2005, doi:10.1037/0022-3514.89.1.122) encontró que Consc...
UPDATE blog_posts SET content = jsonb_set(content, '{es}',
  to_jsonb(replace(content ->> 'es',
    'La investigación de Roberts y colegas (2005, doi:10.1037/0022-3514.89.1.122) encontró que Conscientiousness era el predictor del Big Five más fuerte de la formalidad comunicativa, los hábitos de documentación estructurada y la preferencia por el intercambio de información procedimentalmente claro.',
    'Este patrón se deduce de lo que mide la Conscientiousness (orden, deliberación y planificación) más que de investigación que aísle la formalidad comunicativa como resultado.')))
WHERE slug = 'personality-and-communication-style-direct-vs-diplomatic' AND content ->> 'es' IS NOT NULL;

-- [fr] 299 chars
--   OLD: La recherche de Roberts et ses collègues (2005, doi:10.1037/0022-3514.89.1.122) a trouvé que Co...
UPDATE blog_posts SET content = jsonb_set(content, '{fr}',
  to_jsonb(replace(content ->> 'fr',
    'La recherche de Roberts et ses collègues (2005, doi:10.1037/0022-3514.89.1.122) a trouvé que Conscientiousness était le prédicteur Big Five le plus fort de la formalité communicative, des habitudes de documentation structurée et de la préférence pour un échange d''informations procéduralement clair.',
    'Ce schéma découle de ce que mesure la Conscientiousness (ordre, délibération et planification) plutôt que de recherches isolant la formalité communicative comme résultat.')))
WHERE slug = 'personality-and-communication-style-direct-vs-diplomatic' AND content ->> 'fr' IS NOT NULL;

-- [de] 277 chars
--   OLD: Die Forschung von Roberts und Kollegen (2005, doi:10.1037/0022-3514.89.1.122) fand, dass Consci...
UPDATE blog_posts SET content = jsonb_set(content, '{de}',
  to_jsonb(replace(content ->> 'de',
    'Die Forschung von Roberts und Kollegen (2005, doi:10.1037/0022-3514.89.1.122) fand, dass Conscientiousness der stärkste Big-Five-Prädiktor von Kommunikationsformalität, strukturierten Dokumentationsgewohnheiten und der Präferenz für prozedural klaren Informationsaustausch war.',
    'Dieses Muster ergibt sich aus dem, was Conscientiousness misst (Ordnungsliebe, Bedachtsamkeit und Planungsverhalten), und nicht aus Forschung, die Kommunikationsformalität als Ergebnis isoliert.')))
WHERE slug = 'personality-and-communication-style-direct-vs-diplomatic' AND content ->> 'de' IS NOT NULL;

-- [da] 264 chars
--   OLD: Forskning af Roberts og kolleger (2005, doi:10.1037/0022-3514.89.1.122) fandt, at Conscientious...
UPDATE blog_posts SET content = jsonb_set(content, '{da}',
  to_jsonb(replace(content ->> 'da',
    'Forskning af Roberts og kolleger (2005, doi:10.1037/0022-3514.89.1.122) fandt, at Conscientiousness var den stærkeste Big Five-forudsiger af kommunikationsformalitet, strukturerede dokumentationsvaner og præference for proceduremæssigt klar informationsudveksling.',
    'Dette mønster følger af, hvad Conscientiousness måler (ordenssans, omtanke og planlægning), snarere end af forskning, der isolerer kommunikationsformalitet som udfald.')))
WHERE slug = 'personality-and-communication-style-direct-vs-diplomatic' AND content ->> 'da' IS NOT NULL;

COMMIT;
