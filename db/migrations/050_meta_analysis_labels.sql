-- 050: stop calling primary studies meta-analyses.
--
-- "A meta-analysis of X" is a claim about how strong the evidence is, and
-- it was attached to five papers that are not one: a systematic mapping
-- study, a structural model comparison, a cross-cultural survey, a
-- four-sample investigation and a 16-week experiment. Readers who take the
-- word at face value are being told the finding rests on pooled evidence
-- across many studies when it rests on one.
--
-- Found by check_doi_attribution.py, which now compares the claim in the
-- text against the Crossref title. Two more it flagged are false positives
-- and are deliberately untouched: Judge, Bono and Ilies (2002) and Schmidt
-- and Hunter (1998) genuinely are meta-analyses whose titles say "review".
--
-- Also repairs a replacement 046 missed. It looked for "Hudson & Roberts
-- (2014)" and the text reads "Hudson & Roberts (2014, DOI: ...", with no
-- closing parenthesis, so the author and year correction never landed.
--
-- Applied to every language, because the wording is shared.

BEGIN;

-- five-personality-science-myths-that-wont-die
--   046 missed this: the text has no closing paren after the year, so the earlier replacement never matched
--   Hudson and Fraley (2015) is a 16-week volitional-change experiment, not a meta-analysis
UPDATE blog_posts SET content = jsonb_set(content, '{en}', to_jsonb(replace(replace(content->>'en', 'Hudson & Roberts (2014,', 'Hudson & Fraley (2015,'), 'A meta-analysis by Hudson & Fraley', 'An experimental study by Hudson & Fraley'))),
       updated_at = now()
 WHERE slug = 'five-personality-science-myths-that-wont-die' AND content ? 'en' AND length(content->>'en') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{ca}', to_jsonb(replace(replace(content->>'ca', 'Hudson & Roberts (2014,', 'Hudson & Fraley (2015,'), 'A meta-analysis by Hudson & Fraley', 'An experimental study by Hudson & Fraley'))),
       updated_at = now()
 WHERE slug = 'five-personality-science-myths-that-wont-die' AND content ? 'ca' AND length(content->>'ca') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{es}', to_jsonb(replace(replace(content->>'es', 'Hudson & Roberts (2014,', 'Hudson & Fraley (2015,'), 'A meta-analysis by Hudson & Fraley', 'An experimental study by Hudson & Fraley'))),
       updated_at = now()
 WHERE slug = 'five-personality-science-myths-that-wont-die' AND content ? 'es' AND length(content->>'es') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{fr}', to_jsonb(replace(replace(content->>'fr', 'Hudson & Roberts (2014,', 'Hudson & Fraley (2015,'), 'A meta-analysis by Hudson & Fraley', 'An experimental study by Hudson & Fraley'))),
       updated_at = now()
 WHERE slug = 'five-personality-science-myths-that-wont-die' AND content ? 'fr' AND length(content->>'fr') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{de}', to_jsonb(replace(replace(content->>'de', 'Hudson & Roberts (2014,', 'Hudson & Fraley (2015,'), 'A meta-analysis by Hudson & Fraley', 'An experimental study by Hudson & Fraley'))),
       updated_at = now()
 WHERE slug = 'five-personality-science-myths-that-wont-die' AND content ? 'de' AND length(content->>'de') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{da}', to_jsonb(replace(replace(content->>'da', 'Hudson & Roberts (2014,', 'Hudson & Fraley (2015,'), 'A meta-analysis by Hudson & Fraley', 'An experimental study by Hudson & Fraley'))),
       updated_at = now()
 WHERE slug = 'five-personality-science-myths-that-wont-die' AND content ? 'da' AND length(content->>'da') > 0;

-- software-engineer-personality-what-research-shows
--   Crossref title: Forty years of research on personality in software engineering: A mapping study
UPDATE blog_posts SET content = jsonb_set(content, '{en}', to_jsonb(replace(content->>'en', 'A later meta-analysis by Cruz, Capretz, and colleagues', 'A later systematic mapping study by Cruz, Capretz, and colleagues'))),
       updated_at = now()
 WHERE slug = 'software-engineer-personality-what-research-shows' AND content ? 'en' AND length(content->>'en') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{ca}', to_jsonb(replace(content->>'ca', 'A later meta-analysis by Cruz, Capretz, and colleagues', 'A later systematic mapping study by Cruz, Capretz, and colleagues'))),
       updated_at = now()
 WHERE slug = 'software-engineer-personality-what-research-shows' AND content ? 'ca' AND length(content->>'ca') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{es}', to_jsonb(replace(content->>'es', 'A later meta-analysis by Cruz, Capretz, and colleagues', 'A later systematic mapping study by Cruz, Capretz, and colleagues'))),
       updated_at = now()
 WHERE slug = 'software-engineer-personality-what-research-shows' AND content ? 'es' AND length(content->>'es') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{fr}', to_jsonb(replace(content->>'fr', 'A later meta-analysis by Cruz, Capretz, and colleagues', 'A later systematic mapping study by Cruz, Capretz, and colleagues'))),
       updated_at = now()
 WHERE slug = 'software-engineer-personality-what-research-shows' AND content ? 'fr' AND length(content->>'fr') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{de}', to_jsonb(replace(content->>'de', 'A later meta-analysis by Cruz, Capretz, and colleagues', 'A later systematic mapping study by Cruz, Capretz, and colleagues'))),
       updated_at = now()
 WHERE slug = 'software-engineer-personality-what-research-shows' AND content ? 'de' AND length(content->>'de') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{da}', to_jsonb(replace(content->>'da', 'A later meta-analysis by Cruz, Capretz, and colleagues', 'A later systematic mapping study by Cruz, Capretz, and colleagues'))),
       updated_at = now()
 WHERE slug = 'software-engineer-personality-what-research-shows' AND content ? 'da' AND length(content->>'da') > 0;

-- personality-and-decision-making-how-big-five-shapes-judgment
--   Crossref title: A comparison of three structural models for personality
UPDATE blog_posts SET content = jsonb_set(content, '{en}', to_jsonb(replace(content->>'en', '(1993), a meta-analytic study of personality and sensation-seeking', '(1993), a structural comparison of personality models'))),
       updated_at = now()
 WHERE slug = 'personality-and-decision-making-how-big-five-shapes-judgment' AND content ? 'en' AND length(content->>'en') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{ca}', to_jsonb(replace(content->>'ca', '(1993), a meta-analytic study of personality and sensation-seeking', '(1993), a structural comparison of personality models'))),
       updated_at = now()
 WHERE slug = 'personality-and-decision-making-how-big-five-shapes-judgment' AND content ? 'ca' AND length(content->>'ca') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{es}', to_jsonb(replace(content->>'es', '(1993), a meta-analytic study of personality and sensation-seeking', '(1993), a structural comparison of personality models'))),
       updated_at = now()
 WHERE slug = 'personality-and-decision-making-how-big-five-shapes-judgment' AND content ? 'es' AND length(content->>'es') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{fr}', to_jsonb(replace(content->>'fr', '(1993), a meta-analytic study of personality and sensation-seeking', '(1993), a structural comparison of personality models'))),
       updated_at = now()
 WHERE slug = 'personality-and-decision-making-how-big-five-shapes-judgment' AND content ? 'fr' AND length(content->>'fr') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{de}', to_jsonb(replace(content->>'de', '(1993), a meta-analytic study of personality and sensation-seeking', '(1993), a structural comparison of personality models'))),
       updated_at = now()
 WHERE slug = 'personality-and-decision-making-how-big-five-shapes-judgment' AND content ? 'de' AND length(content->>'de') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{da}', to_jsonb(replace(content->>'da', '(1993), a meta-analytic study of personality and sensation-seeking', '(1993), a structural comparison of personality models'))),
       updated_at = now()
 WHERE slug = 'personality-and-decision-making-how-big-five-shapes-judgment' AND content ? 'da' AND length(content->>'da') > 0;

-- gender-and-personality-what-big-five-research-says
--   Schmitt et al. (2008) surveyed 55 cultures directly; it does not pool prior studies
UPDATE blog_posts SET content = jsonb_set(content, '{en}', to_jsonb(replace(content->>'en', 'A comprehensive meta-analysis by Schmitt et al', 'A large cross-cultural survey by Schmitt et al'))),
       updated_at = now()
 WHERE slug = 'gender-and-personality-what-big-five-research-says' AND content ? 'en' AND length(content->>'en') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{ca}', to_jsonb(replace(content->>'ca', 'A comprehensive meta-analysis by Schmitt et al', 'A large cross-cultural survey by Schmitt et al'))),
       updated_at = now()
 WHERE slug = 'gender-and-personality-what-big-five-research-says' AND content ? 'ca' AND length(content->>'ca') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{es}', to_jsonb(replace(content->>'es', 'A comprehensive meta-analysis by Schmitt et al', 'A large cross-cultural survey by Schmitt et al'))),
       updated_at = now()
 WHERE slug = 'gender-and-personality-what-big-five-research-says' AND content ? 'es' AND length(content->>'es') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{fr}', to_jsonb(replace(content->>'fr', 'A comprehensive meta-analysis by Schmitt et al', 'A large cross-cultural survey by Schmitt et al'))),
       updated_at = now()
 WHERE slug = 'gender-and-personality-what-big-five-research-says' AND content ? 'fr' AND length(content->>'fr') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{de}', to_jsonb(replace(content->>'de', 'A comprehensive meta-analysis by Schmitt et al', 'A large cross-cultural survey by Schmitt et al'))),
       updated_at = now()
 WHERE slug = 'gender-and-personality-what-big-five-research-says' AND content ? 'de' AND length(content->>'de') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{da}', to_jsonb(replace(content->>'da', 'A comprehensive meta-analysis by Schmitt et al', 'A large cross-cultural survey by Schmitt et al'))),
       updated_at = now()
 WHERE slug = 'gender-and-personality-what-big-five-research-says' AND content ? 'da' AND length(content->>'da') > 0;

-- agreeableness-at-work-the-hidden-cost-of-being-too-nice
--   Judge, Livingston and Hurst (2012) report four samples of their own, not a pooled analysis
UPDATE blog_posts SET content = jsonb_set(content, '{en}', to_jsonb(replace(content->>'en', 'a large-scale meta-analysis of income and personality conducted by Judge, Livingston, and Hurst', 'a four-study investigation of income and personality by Judge, Livingston, and Hurst'))),
       updated_at = now()
 WHERE slug = 'agreeableness-at-work-the-hidden-cost-of-being-too-nice' AND content ? 'en' AND length(content->>'en') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{ca}', to_jsonb(replace(content->>'ca', 'a large-scale meta-analysis of income and personality conducted by Judge, Livingston, and Hurst', 'a four-study investigation of income and personality by Judge, Livingston, and Hurst'))),
       updated_at = now()
 WHERE slug = 'agreeableness-at-work-the-hidden-cost-of-being-too-nice' AND content ? 'ca' AND length(content->>'ca') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{es}', to_jsonb(replace(content->>'es', 'a large-scale meta-analysis of income and personality conducted by Judge, Livingston, and Hurst', 'a four-study investigation of income and personality by Judge, Livingston, and Hurst'))),
       updated_at = now()
 WHERE slug = 'agreeableness-at-work-the-hidden-cost-of-being-too-nice' AND content ? 'es' AND length(content->>'es') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{fr}', to_jsonb(replace(content->>'fr', 'a large-scale meta-analysis of income and personality conducted by Judge, Livingston, and Hurst', 'a four-study investigation of income and personality by Judge, Livingston, and Hurst'))),
       updated_at = now()
 WHERE slug = 'agreeableness-at-work-the-hidden-cost-of-being-too-nice' AND content ? 'fr' AND length(content->>'fr') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{de}', to_jsonb(replace(content->>'de', 'a large-scale meta-analysis of income and personality conducted by Judge, Livingston, and Hurst', 'a four-study investigation of income and personality by Judge, Livingston, and Hurst'))),
       updated_at = now()
 WHERE slug = 'agreeableness-at-work-the-hidden-cost-of-being-too-nice' AND content ? 'de' AND length(content->>'de') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{da}', to_jsonb(replace(content->>'da', 'a large-scale meta-analysis of income and personality conducted by Judge, Livingston, and Hurst', 'a four-study investigation of income and personality by Judge, Livingston, and Hurst'))),
       updated_at = now()
 WHERE slug = 'agreeableness-at-work-the-hidden-cost-of-being-too-nice' AND content ? 'da' AND length(content->>'da') > 0;

COMMIT;
