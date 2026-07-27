-- Migration 038: DOIs that resolve but point at the wrong paper
--
-- Every previous batch fixed DOIs that were DEAD. This one fixes DOIs that are
-- perfectly alive and cite the wrong work, which the resolution gate cannot
-- see by construction: it asks "does this identifier exist", never "is this
-- the paper you named".
--
-- A full-corpus attribution audit (168 citation instances, 65 distinct DOIs,
-- all 108 articles) compared the author and year each article asserts against
-- the Crossref record for the DOI it prints. 17 disagreed. The worst example:
-- a Neuroticism article cited "Alarcon et al. (2009) meta-analysis" against
-- 10.1002/job.4030140402, which resolves to a 1993 one-line notice titled
-- "Best paper prize 1992 ($750 prize)". Green on every check we had.
--
-- This migration lands only the subset where the intended paper was identified
-- with high confidence AND independently confirmed to support the claim being
-- made. Each replacement DOI was verified to return 302 twice: once by the
-- research pass, once again before this file was written.
--
--   five-personality-science-myths-that-wont-die
--       10.5465/amj.2011.0176 -> 10.5465/amj.2011.61968043
--       (Grant, Gino & Hofmann 2011, "Reversing the extraverted leadership
--        advantage", AMJ 54(3), 528-550. Wrong DOI was Lamin 2013 on business
--        groups.)
--   neuroticism-stress-resilience-at-work
--       10.1002/job.4030140402 -> 10.1080/02678370903282600
--       (Alarcon, Eschleman & Bowling 2009, "Relationships between personality
--        variables and burnout: A meta-analysis", Work & Stress 23(3), 244-263.)
--   what-is-agreeableness-the-cooperative-dimension
--       10.1037/0021-9010.92.3.595 -> 10.1037/a0033901
--       (Judge, Rodell, Klinger, Simon & Crawford 2013, "Hierarchical
--        representations of the five-factor model", JAP 98(6), 875-925. The
--        wrong DOI is Bell 2007, which is a CORRECT citation in three other
--        articles, so this replace is slug-scoped. A corpus-wide replace here
--        would break the articles that cite Bell properly.)
--   how-to-read-a-big-five-personality-report
--       10.1037/t07550-000 -> 10.1016/0191-8869(92)90236-I
--       (Costa & McCrae 1992, "Four ways five factors are basic", PAID 13(6),
--        653-665. Wrong DOI was the Big Five Inventory PsycTESTS record, a
--        database entry for a different instrument.)
--   using-cercol-for-team-development-a-practical-guide
--       10.1037/a0021322 -> 10.1037/a0021832
--       (Oh, Wang & Mount 2011, "Validity of observer ratings of the
--        five-factor model", JAP 96(4), 762-773. A digit transposition that
--        happened to land on a real word-production paper.)
--   what-is-the-ipip
--       10.1037/pas0000571 -> 10.1080/00223891.2017.1381968
--       (Maples-Keller et al. 2019, IPIP-NEO-60, J. Personality Assessment
--        101(1), 4-15.)
--
-- ALSO: drops a fabricated reference. "Nestsiarovich, A., & Pons, A. (2020).
-- Team roles grounded in personality circumplex: A systematic review. PLoS
-- ONE, 15(3), e0230069" does not exist. No such title is in Crossref, those
-- authors published nothing in PLOS ONE, and the DOI resolves to an unrelated
-- qualitative health-services paper. Their real 2020 work is a five-team
-- observational study in Behavioral Sciences, which is neither a systematic
-- review nor a Big Five comparison, so it cannot stand in. The entry is
-- removed rather than repointed.
--
-- Migration 037 copied that entry into the English body while restoring
-- citations there, so this removes it from all six languages at once.
-- Verifying my own fix is what surfaced it.
--
-- 11 further mismatches need prose rewrites, not DOI swaps, and are handled
-- separately: in those the correctly-attributed paper does not support the
-- sentence, so swapping the DOI would make a false claim look sourced.
--
-- Idempotent: the swaps replace a needle disjoint from their replacement; the
-- removals carry a LIKE guard. Verified with scripts/test_content_migration.sh.
--
-- doi-check: retires 10.5465/amj.2011.0176
-- doi-check: retires 10.1002/job.4030140402
-- doi-check: retires 10.1037/t07550-000
-- doi-check: retires 10.1037/a0021322
-- doi-check: retires 10.1037/pas0000571
-- doi-check: retires 10.1371/journal.pone.0230069

BEGIN;

-- [five-personality-science-myths-that-wont-die] 10.5465/amj.2011.0176 -> 10.5465/amj.2011.61968043
UPDATE blog_posts SET content = (
  SELECT jsonb_object_agg(key,
    CASE WHEN jsonb_typeof(value) = 'string'
         THEN to_jsonb(replace(value #>> '{}', '10.5465/amj.2011.0176', '10.5465/amj.2011.61968043'))
         ELSE value END)
  FROM jsonb_each(content))
WHERE slug = 'five-personality-science-myths-that-wont-die' AND content <> '{}'::jsonb;

-- [neuroticism-stress-resilience-at-work] 10.1002/job.4030140402 -> 10.1080/02678370903282600
UPDATE blog_posts SET content = (
  SELECT jsonb_object_agg(key,
    CASE WHEN jsonb_typeof(value) = 'string'
         THEN to_jsonb(replace(value #>> '{}', '10.1002/job.4030140402', '10.1080/02678370903282600'))
         ELSE value END)
  FROM jsonb_each(content))
WHERE slug = 'neuroticism-stress-resilience-at-work' AND content <> '{}'::jsonb;

-- [what-is-agreeableness-the-cooperative-dimension] 10.1037/0021-9010.92.3.595 -> 10.1037/a0033901
UPDATE blog_posts SET content = (
  SELECT jsonb_object_agg(key,
    CASE WHEN jsonb_typeof(value) = 'string'
         THEN to_jsonb(replace(value #>> '{}', '10.1037/0021-9010.92.3.595', '10.1037/a0033901'))
         ELSE value END)
  FROM jsonb_each(content))
WHERE slug = 'what-is-agreeableness-the-cooperative-dimension' AND content <> '{}'::jsonb;

-- [how-to-read-a-big-five-personality-report] 10.1037/t07550-000 -> 10.1016/0191-8869(92)90236-I
UPDATE blog_posts SET content = (
  SELECT jsonb_object_agg(key,
    CASE WHEN jsonb_typeof(value) = 'string'
         THEN to_jsonb(replace(value #>> '{}', '10.1037/t07550-000', '10.1016/0191-8869(92)90236-I'))
         ELSE value END)
  FROM jsonb_each(content))
WHERE slug = 'how-to-read-a-big-five-personality-report' AND content <> '{}'::jsonb;

-- [using-cercol-for-team-development-a-practical-guide] 10.1037/a0021322 -> 10.1037/a0021832
UPDATE blog_posts SET content = (
  SELECT jsonb_object_agg(key,
    CASE WHEN jsonb_typeof(value) = 'string'
         THEN to_jsonb(replace(value #>> '{}', '10.1037/a0021322', '10.1037/a0021832'))
         ELSE value END)
  FROM jsonb_each(content))
WHERE slug = 'using-cercol-for-team-development-a-practical-guide' AND content <> '{}'::jsonb;

-- [what-is-the-ipip] 10.1037/pas0000571 -> 10.1080/00223891.2017.1381968
UPDATE blog_posts SET content = (
  SELECT jsonb_object_agg(key,
    CASE WHEN jsonb_typeof(value) = 'string'
         THEN to_jsonb(replace(value #>> '{}', '10.1037/pas0000571', '10.1080/00223891.2017.1381968'))
         ELSE value END)
  FROM jsonb_each(content))
WHERE slug = 'what-is-the-ipip' AND content <> '{}'::jsonb;

-- [big-five-vs-disc-vs-belbin/en] drop fabricated Nestsiarovich & Pons entry
UPDATE blog_posts SET content = jsonb_set(content, '{en}',
  to_jsonb(replace(content ->> 'en', '
- Nestsiarovich, A., & Pons, A. (2020). Team roles grounded in personality circumplex: A systematic review. *PLoS ONE*, 15(3), e0230069. [doi:10.1371/journal.pone.0230069](https://doi.org/10.1371/journal.pone.0230069)', '')))
WHERE slug = 'big-five-vs-disc-vs-belbin' AND content ->> 'en' IS NOT NULL
  AND content ->> 'en' LIKE '%10.1371/journal.pone.0230069%';

-- [big-five-vs-disc-vs-belbin/ca] drop fabricated Nestsiarovich & Pons entry
UPDATE blog_posts SET content = jsonb_set(content, '{ca}',
  to_jsonb(replace(content ->> 'ca', '
> **Sobre Belbin i el Big Five:** [Nestsiarovich i Pons (2020)](https://doi.org/10.1371/journal.pone.0230069) van revisar els rols d''equip basats en el circumplex de personalitat i van trobar que els sistemes de rols basats en el Big Five mostren una fonamentació teòrica i empírica més sòlida que els marcs d''observació conductual com Belbin.', '')))
WHERE slug = 'big-five-vs-disc-vs-belbin' AND content ->> 'ca' IS NOT NULL
  AND content ->> 'ca' LIKE '%10.1371/journal.pone.0230069%';

-- [big-five-vs-disc-vs-belbin/es] drop fabricated Nestsiarovich & Pons entry
UPDATE blog_posts SET content = jsonb_set(content, '{es}',
  to_jsonb(replace(content ->> 'es', '
> **Sobre Belbin y el Big Five:** [Nestsiarovich y Pons (2020)](https://doi.org/10.1371/journal.pone.0230069) revisaron los roles de equipo basados en el circumplejo de personalidad y encontraron que los sistemas de roles basados en Big Five muestran una fundamentación teórica y empírica más sólida que los marcos de observación conductual como Belbin.', '')))
WHERE slug = 'big-five-vs-disc-vs-belbin' AND content ->> 'es' IS NOT NULL
  AND content ->> 'es' LIKE '%10.1371/journal.pone.0230069%';

-- [big-five-vs-disc-vs-belbin/fr] drop fabricated Nestsiarovich & Pons entry
UPDATE blog_posts SET content = jsonb_set(content, '{fr}',
  to_jsonb(replace(content ->> 'fr', '
> **Sur Belbin et le Big Five :** [Nestsiarovich & Pons (2020)](https://doi.org/10.1371/journal.pone.0230069) ont examiné les rôles d''équipe fondés sur le circonflexe de personnalité et ont constaté que les systèmes de rôles basés sur le Big Five présentent une base théorique et empirique plus solide que les cadres d''observation comportementale comme Belbin.', '')))
WHERE slug = 'big-five-vs-disc-vs-belbin' AND content ->> 'fr' IS NOT NULL
  AND content ->> 'fr' LIKE '%10.1371/journal.pone.0230069%';

-- [big-five-vs-disc-vs-belbin/de] drop fabricated Nestsiarovich & Pons entry
UPDATE blog_posts SET content = jsonb_set(content, '{de}',
  to_jsonb(replace(content ->> 'de', '
> **Zu Belbin und dem Big Five:** [Nestsiarovich & Pons (2020)](https://doi.org/10.1371/journal.pone.0230069) prüften Teamrollen basierend auf dem Persönlichkeitszirkumplexmodell und fanden, dass Big-Five-basierte Rollensysteme eine stärkere theoretische und empirische Grundlage zeigen als verhaltensbeobachtungsbasierte Rahmen wie Belbin.', '')))
WHERE slug = 'big-five-vs-disc-vs-belbin' AND content ->> 'de' IS NOT NULL
  AND content ->> 'de' LIKE '%10.1371/journal.pone.0230069%';

-- [big-five-vs-disc-vs-belbin/da] drop fabricated Nestsiarovich & Pons entry
UPDATE blog_posts SET content = jsonb_set(content, '{da}',
  to_jsonb(replace(content ->> 'da', '
> **Om Belbin og Big Five:** [Nestsiarovich & Pons (2020)](https://doi.org/10.1371/journal.pone.0230069) gennemgik teamroller baseret på personlighedscirkulæret og fandt, at Big Five-baserede rollesystemer viser stærkere teoretisk og empirisk grundlag end adfærdsbaserede rammer som Belbin.', '')))
WHERE slug = 'big-five-vs-disc-vs-belbin' AND content ->> 'da' IS NOT NULL
  AND content ->> 'da' LIKE '%10.1371/journal.pone.0230069%';

COMMIT;
