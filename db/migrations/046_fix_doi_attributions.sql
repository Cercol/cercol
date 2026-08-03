-- 046: DOIs that resolve but credit the wrong paper.
--
-- scripts/check_doi_attribution.py compares each DOI against its Crossref
-- record and flagged 17. An audit of all 17 found 5 script artefacts, 8
-- confirmed wrong DOIs, 3 it could not resolve, and 1 correct DOI with the
-- wrong journal printed next to it. This migration applies the 12 it could
-- confirm. The 3 unresolved ones are deliberately untouched: a confidently
-- wrong correction is worse than the error it replaces.
--
-- The worst of them: an article on agreeableness cited a paper about
-- gambling pop-up messages, one on software engineers cited a formal
-- calculus for attribute-based communication, and one on mentoring cited a
-- study of family instability in Mexican American families. All three
-- resolved perfectly, which is why check_dois.py never saw them.
--
-- Applied to every language, because the citations are shared.
--
-- doi-check: retires 10.1002/hrm.20409
--
-- doi-check: retires 10.1002/job.235
--
-- doi-check: retires 10.1037/0021-9010.92.3.595
--
-- doi-check: retires 10.1037/a0029882
--
-- doi-check: retires 10.1037/a0032863
--
-- doi-check: retires 10.1037/per0000021
--
-- doi-check: retires 10.1145/2695664.2695668
--
-- doi-check: retires 10.1371/journal.pone.0029265

BEGIN;

-- personality-science-evidence-based-hr-why-it-matters
--   10.1002/hrm.20409  ->  10.1111/j.1748-8583.2011.00173.x   (was Welbourne's editorial, now Rousseau and Barends (2011))
UPDATE blog_posts SET content = jsonb_set(content, '{en}', to_jsonb(replace(content->>'en', '10.1002/hrm.20409', '10.1111/j.1748-8583.2011.00173.x'))),
       updated_at = now()
 WHERE slug = 'personality-science-evidence-based-hr-why-it-matters' AND content ? 'en' AND length(content->>'en') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{ca}', to_jsonb(replace(content->>'ca', '10.1002/hrm.20409', '10.1111/j.1748-8583.2011.00173.x'))),
       updated_at = now()
 WHERE slug = 'personality-science-evidence-based-hr-why-it-matters' AND content ? 'ca' AND length(content->>'ca') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{es}', to_jsonb(replace(content->>'es', '10.1002/hrm.20409', '10.1111/j.1748-8583.2011.00173.x'))),
       updated_at = now()
 WHERE slug = 'personality-science-evidence-based-hr-why-it-matters' AND content ? 'es' AND length(content->>'es') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{fr}', to_jsonb(replace(content->>'fr', '10.1002/hrm.20409', '10.1111/j.1748-8583.2011.00173.x'))),
       updated_at = now()
 WHERE slug = 'personality-science-evidence-based-hr-why-it-matters' AND content ? 'fr' AND length(content->>'fr') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{de}', to_jsonb(replace(content->>'de', '10.1002/hrm.20409', '10.1111/j.1748-8583.2011.00173.x'))),
       updated_at = now()
 WHERE slug = 'personality-science-evidence-based-hr-why-it-matters' AND content ? 'de' AND length(content->>'de') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{da}', to_jsonb(replace(content->>'da', '10.1002/hrm.20409', '10.1111/j.1748-8583.2011.00173.x'))),
       updated_at = now()
 WHERE slug = 'personality-science-evidence-based-hr-why-it-matters' AND content ? 'da' AND length(content->>'da') > 0;

-- work-life-balance-personality-who-struggles-most
--   10.1002/job.235  ->  10.1016/j.jvb.2003.09.004   (was Pearce and Ensley on innovation, now Janssen et al. (2004))
UPDATE blog_posts SET content = jsonb_set(content, '{en}', to_jsonb(replace(content->>'en', '10.1002/job.235', '10.1016/j.jvb.2003.09.004'))),
       updated_at = now()
 WHERE slug = 'work-life-balance-personality-who-struggles-most' AND content ? 'en' AND length(content->>'en') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{ca}', to_jsonb(replace(content->>'ca', '10.1002/job.235', '10.1016/j.jvb.2003.09.004'))),
       updated_at = now()
 WHERE slug = 'work-life-balance-personality-who-struggles-most' AND content ? 'ca' AND length(content->>'ca') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{es}', to_jsonb(replace(content->>'es', '10.1002/job.235', '10.1016/j.jvb.2003.09.004'))),
       updated_at = now()
 WHERE slug = 'work-life-balance-personality-who-struggles-most' AND content ? 'es' AND length(content->>'es') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{fr}', to_jsonb(replace(content->>'fr', '10.1002/job.235', '10.1016/j.jvb.2003.09.004'))),
       updated_at = now()
 WHERE slug = 'work-life-balance-personality-who-struggles-most' AND content ? 'fr' AND length(content->>'fr') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{de}', to_jsonb(replace(content->>'de', '10.1002/job.235', '10.1016/j.jvb.2003.09.004'))),
       updated_at = now()
 WHERE slug = 'work-life-balance-personality-who-struggles-most' AND content ? 'de' AND length(content->>'de') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{da}', to_jsonb(replace(content->>'da', '10.1002/job.235', '10.1016/j.jvb.2003.09.004'))),
       updated_at = now()
 WHERE slug = 'work-life-balance-personality-who-struggles-most' AND content ? 'da' AND length(content->>'da') > 0;

-- what-is-conscientiousness-the-most-consistent-predictor-of-job-performance
--   10.1037/0021-9010.92.3.595  ->  10.1037/a0033901   (was Bell (2007), now Judge et al. (2013))
--   98*(4)  ->  98*(6)   (wrong issue number for Judge et al. (2013))
UPDATE blog_posts SET content = jsonb_set(content, '{en}', to_jsonb(replace(replace(content->>'en', '10.1037/0021-9010.92.3.595', '10.1037/a0033901'), '98*(4)', '98*(6)'))),
       updated_at = now()
 WHERE slug = 'what-is-conscientiousness-the-most-consistent-predictor-of-job-performance' AND content ? 'en' AND length(content->>'en') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{ca}', to_jsonb(replace(replace(content->>'ca', '10.1037/0021-9010.92.3.595', '10.1037/a0033901'), '98*(4)', '98*(6)'))),
       updated_at = now()
 WHERE slug = 'what-is-conscientiousness-the-most-consistent-predictor-of-job-performance' AND content ? 'ca' AND length(content->>'ca') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{es}', to_jsonb(replace(replace(content->>'es', '10.1037/0021-9010.92.3.595', '10.1037/a0033901'), '98*(4)', '98*(6)'))),
       updated_at = now()
 WHERE slug = 'what-is-conscientiousness-the-most-consistent-predictor-of-job-performance' AND content ? 'es' AND length(content->>'es') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{fr}', to_jsonb(replace(replace(content->>'fr', '10.1037/0021-9010.92.3.595', '10.1037/a0033901'), '98*(4)', '98*(6)'))),
       updated_at = now()
 WHERE slug = 'what-is-conscientiousness-the-most-consistent-predictor-of-job-performance' AND content ? 'fr' AND length(content->>'fr') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{de}', to_jsonb(replace(replace(content->>'de', '10.1037/0021-9010.92.3.595', '10.1037/a0033901'), '98*(4)', '98*(6)'))),
       updated_at = now()
 WHERE slug = 'what-is-conscientiousness-the-most-consistent-predictor-of-job-performance' AND content ? 'de' AND length(content->>'de') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{da}', to_jsonb(replace(replace(content->>'da', '10.1037/0021-9010.92.3.595', '10.1037/a0033901'), '98*(4)', '98*(6)'))),
       updated_at = now()
 WHERE slug = 'what-is-conscientiousness-the-most-consistent-predictor-of-job-performance' AND content ? 'da' AND length(content->>'da') > 0;

-- agreeableness-at-work-the-hidden-cost-of-being-too-nice
--   10.1037/a0029882  ->  10.1037/a0026021   (was Stewart and Wohl on gambling, now Judge et al. (2012))
UPDATE blog_posts SET content = jsonb_set(content, '{en}', to_jsonb(replace(content->>'en', '10.1037/a0029882', '10.1037/a0026021'))),
       updated_at = now()
 WHERE slug = 'agreeableness-at-work-the-hidden-cost-of-being-too-nice' AND content ? 'en' AND length(content->>'en') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{ca}', to_jsonb(replace(content->>'ca', '10.1037/a0029882', '10.1037/a0026021'))),
       updated_at = now()
 WHERE slug = 'agreeableness-at-work-the-hidden-cost-of-being-too-nice' AND content ? 'ca' AND length(content->>'ca') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{es}', to_jsonb(replace(content->>'es', '10.1037/a0029882', '10.1037/a0026021'))),
       updated_at = now()
 WHERE slug = 'agreeableness-at-work-the-hidden-cost-of-being-too-nice' AND content ? 'es' AND length(content->>'es') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{fr}', to_jsonb(replace(content->>'fr', '10.1037/a0029882', '10.1037/a0026021'))),
       updated_at = now()
 WHERE slug = 'agreeableness-at-work-the-hidden-cost-of-being-too-nice' AND content ? 'fr' AND length(content->>'fr') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{de}', to_jsonb(replace(content->>'de', '10.1037/a0029882', '10.1037/a0026021'))),
       updated_at = now()
 WHERE slug = 'agreeableness-at-work-the-hidden-cost-of-being-too-nice' AND content ? 'de' AND length(content->>'de') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{da}', to_jsonb(replace(content->>'da', '10.1037/a0029882', '10.1037/a0026021'))),
       updated_at = now()
 WHERE slug = 'agreeableness-at-work-the-hidden-cost-of-being-too-nice' AND content ? 'da' AND length(content->>'da') > 0;

-- personality-and-mentoring-what-makes-a-good-mentor
--   10.1037/a0032863  ->  10.1037/a0029279   (was Vargas et al. on family instability, now Eby et al. (2013))
UPDATE blog_posts SET content = jsonb_set(content, '{en}', to_jsonb(replace(content->>'en', '10.1037/a0032863', '10.1037/a0029279'))),
       updated_at = now()
 WHERE slug = 'personality-and-mentoring-what-makes-a-good-mentor' AND content ? 'en' AND length(content->>'en') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{ca}', to_jsonb(replace(content->>'ca', '10.1037/a0032863', '10.1037/a0029279'))),
       updated_at = now()
 WHERE slug = 'personality-and-mentoring-what-makes-a-good-mentor' AND content ? 'ca' AND length(content->>'ca') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{es}', to_jsonb(replace(content->>'es', '10.1037/a0032863', '10.1037/a0029279'))),
       updated_at = now()
 WHERE slug = 'personality-and-mentoring-what-makes-a-good-mentor' AND content ? 'es' AND length(content->>'es') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{fr}', to_jsonb(replace(content->>'fr', '10.1037/a0032863', '10.1037/a0029279'))),
       updated_at = now()
 WHERE slug = 'personality-and-mentoring-what-makes-a-good-mentor' AND content ? 'fr' AND length(content->>'fr') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{de}', to_jsonb(replace(content->>'de', '10.1037/a0032863', '10.1037/a0029279'))),
       updated_at = now()
 WHERE slug = 'personality-and-mentoring-what-makes-a-good-mentor' AND content ? 'de' AND length(content->>'de') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{da}', to_jsonb(replace(content->>'da', '10.1037/a0032863', '10.1037/a0029279'))),
       updated_at = now()
 WHERE slug = 'personality-and-mentoring-what-makes-a-good-mentor' AND content ? 'da' AND length(content->>'da') > 0;

-- five-personality-science-myths-that-wont-die
--   10.1037/per0000021  ->  10.1037/pspp0000021   (per/pspp transposition, now Hudson and Fraley (2015))
--   Hudson & Roberts (2014)  ->  Hudson & Fraley (2015)   (wrong second author and year)
UPDATE blog_posts SET content = jsonb_set(content, '{en}', to_jsonb(replace(replace(content->>'en', '10.1037/per0000021', '10.1037/pspp0000021'), 'Hudson & Roberts (2014)', 'Hudson & Fraley (2015)'))),
       updated_at = now()
 WHERE slug = 'five-personality-science-myths-that-wont-die' AND content ? 'en' AND length(content->>'en') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{ca}', to_jsonb(replace(replace(content->>'ca', '10.1037/per0000021', '10.1037/pspp0000021'), 'Hudson & Roberts (2014)', 'Hudson & Fraley (2015)'))),
       updated_at = now()
 WHERE slug = 'five-personality-science-myths-that-wont-die' AND content ? 'ca' AND length(content->>'ca') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{es}', to_jsonb(replace(replace(content->>'es', '10.1037/per0000021', '10.1037/pspp0000021'), 'Hudson & Roberts (2014)', 'Hudson & Fraley (2015)'))),
       updated_at = now()
 WHERE slug = 'five-personality-science-myths-that-wont-die' AND content ? 'es' AND length(content->>'es') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{fr}', to_jsonb(replace(replace(content->>'fr', '10.1037/per0000021', '10.1037/pspp0000021'), 'Hudson & Roberts (2014)', 'Hudson & Fraley (2015)'))),
       updated_at = now()
 WHERE slug = 'five-personality-science-myths-that-wont-die' AND content ? 'fr' AND length(content->>'fr') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{de}', to_jsonb(replace(replace(content->>'de', '10.1037/per0000021', '10.1037/pspp0000021'), 'Hudson & Roberts (2014)', 'Hudson & Fraley (2015)'))),
       updated_at = now()
 WHERE slug = 'five-personality-science-myths-that-wont-die' AND content ? 'de' AND length(content->>'de') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{da}', to_jsonb(replace(replace(content->>'da', '10.1037/per0000021', '10.1037/pspp0000021'), 'Hudson & Roberts (2014)', 'Hudson & Fraley (2015)'))),
       updated_at = now()
 WHERE slug = 'five-personality-science-myths-that-wont-die' AND content ? 'da' AND length(content->>'da') > 0;

-- software-engineer-personality-what-research-shows
--   10.1145/2695664.2695668  ->  10.1016/j.chb.2014.12.008   (was an ACM process-calculus paper, now Cruz et al. (2015))
UPDATE blog_posts SET content = jsonb_set(content, '{en}', to_jsonb(replace(content->>'en', '10.1145/2695664.2695668', '10.1016/j.chb.2014.12.008'))),
       updated_at = now()
 WHERE slug = 'software-engineer-personality-what-research-shows' AND content ? 'en' AND length(content->>'en') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{ca}', to_jsonb(replace(content->>'ca', '10.1145/2695664.2695668', '10.1016/j.chb.2014.12.008'))),
       updated_at = now()
 WHERE slug = 'software-engineer-personality-what-research-shows' AND content ? 'ca' AND length(content->>'ca') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{es}', to_jsonb(replace(content->>'es', '10.1145/2695664.2695668', '10.1016/j.chb.2014.12.008'))),
       updated_at = now()
 WHERE slug = 'software-engineer-personality-what-research-shows' AND content ? 'es' AND length(content->>'es') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{fr}', to_jsonb(replace(content->>'fr', '10.1145/2695664.2695668', '10.1016/j.chb.2014.12.008'))),
       updated_at = now()
 WHERE slug = 'software-engineer-personality-what-research-shows' AND content ? 'fr' AND length(content->>'fr') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{de}', to_jsonb(replace(content->>'de', '10.1145/2695664.2695668', '10.1016/j.chb.2014.12.008'))),
       updated_at = now()
 WHERE slug = 'software-engineer-personality-what-research-shows' AND content ? 'de' AND length(content->>'de') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{da}', to_jsonb(replace(content->>'da', '10.1145/2695664.2695668', '10.1016/j.chb.2014.12.008'))),
       updated_at = now()
 WHERE slug = 'software-engineer-personality-what-research-shows' AND content ? 'da' AND length(content->>'da') > 0;

-- gender-and-personality-what-big-five-research-says
--   10.1371/journal.pone.0029265  ->  10.1037/0022-3514.94.1.168   (was Del Giudice et al., now Schmitt et al. (2008))
UPDATE blog_posts SET content = jsonb_set(content, '{en}', to_jsonb(replace(content->>'en', '10.1371/journal.pone.0029265', '10.1037/0022-3514.94.1.168'))),
       updated_at = now()
 WHERE slug = 'gender-and-personality-what-big-five-research-says' AND content ? 'en' AND length(content->>'en') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{ca}', to_jsonb(replace(content->>'ca', '10.1371/journal.pone.0029265', '10.1037/0022-3514.94.1.168'))),
       updated_at = now()
 WHERE slug = 'gender-and-personality-what-big-five-research-says' AND content ? 'ca' AND length(content->>'ca') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{es}', to_jsonb(replace(content->>'es', '10.1371/journal.pone.0029265', '10.1037/0022-3514.94.1.168'))),
       updated_at = now()
 WHERE slug = 'gender-and-personality-what-big-five-research-says' AND content ? 'es' AND length(content->>'es') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{fr}', to_jsonb(replace(content->>'fr', '10.1371/journal.pone.0029265', '10.1037/0022-3514.94.1.168'))),
       updated_at = now()
 WHERE slug = 'gender-and-personality-what-big-five-research-says' AND content ? 'fr' AND length(content->>'fr') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{de}', to_jsonb(replace(content->>'de', '10.1371/journal.pone.0029265', '10.1037/0022-3514.94.1.168'))),
       updated_at = now()
 WHERE slug = 'gender-and-personality-what-big-five-research-says' AND content ? 'de' AND length(content->>'de') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{da}', to_jsonb(replace(content->>'da', '10.1371/journal.pone.0029265', '10.1037/0022-3514.94.1.168'))),
       updated_at = now()
 WHERE slug = 'gender-and-personality-what-big-five-research-says' AND content ? 'da' AND length(content->>'da') > 0;

-- what-is-the-ipip
--   Psychological Assessment*, 31(2), 154–164  ->  Journal of Personality Assessment*, 101(1), 4–15   (correct DOI, wrong journal printed beside it)
--   Psychological Assessment*, 31(2), 154-164  ->  Journal of Personality Assessment*, 101(1), 4-15   (same, hyphen variant)
UPDATE blog_posts SET content = jsonb_set(content, '{en}', to_jsonb(replace(replace(content->>'en', 'Psychological Assessment*, 31(2), 154–164', 'Journal of Personality Assessment*, 101(1), 4–15'), 'Psychological Assessment*, 31(2), 154-164', 'Journal of Personality Assessment*, 101(1), 4-15'))),
       updated_at = now()
 WHERE slug = 'what-is-the-ipip' AND content ? 'en' AND length(content->>'en') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{ca}', to_jsonb(replace(replace(content->>'ca', 'Psychological Assessment*, 31(2), 154–164', 'Journal of Personality Assessment*, 101(1), 4–15'), 'Psychological Assessment*, 31(2), 154-164', 'Journal of Personality Assessment*, 101(1), 4-15'))),
       updated_at = now()
 WHERE slug = 'what-is-the-ipip' AND content ? 'ca' AND length(content->>'ca') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{es}', to_jsonb(replace(replace(content->>'es', 'Psychological Assessment*, 31(2), 154–164', 'Journal of Personality Assessment*, 101(1), 4–15'), 'Psychological Assessment*, 31(2), 154-164', 'Journal of Personality Assessment*, 101(1), 4-15'))),
       updated_at = now()
 WHERE slug = 'what-is-the-ipip' AND content ? 'es' AND length(content->>'es') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{fr}', to_jsonb(replace(replace(content->>'fr', 'Psychological Assessment*, 31(2), 154–164', 'Journal of Personality Assessment*, 101(1), 4–15'), 'Psychological Assessment*, 31(2), 154-164', 'Journal of Personality Assessment*, 101(1), 4-15'))),
       updated_at = now()
 WHERE slug = 'what-is-the-ipip' AND content ? 'fr' AND length(content->>'fr') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{de}', to_jsonb(replace(replace(content->>'de', 'Psychological Assessment*, 31(2), 154–164', 'Journal of Personality Assessment*, 101(1), 4–15'), 'Psychological Assessment*, 31(2), 154-164', 'Journal of Personality Assessment*, 101(1), 4-15'))),
       updated_at = now()
 WHERE slug = 'what-is-the-ipip' AND content ? 'de' AND length(content->>'de') > 0;
UPDATE blog_posts SET content = jsonb_set(content, '{da}', to_jsonb(replace(replace(content->>'da', 'Psychological Assessment*, 31(2), 154–164', 'Journal of Personality Assessment*, 101(1), 4–15'), 'Psychological Assessment*, 31(2), 154-164', 'Journal of Personality Assessment*, 101(1), 4-15'))),
       updated_at = now()
 WHERE slug = 'what-is-the-ipip' AND content ? 'da' AND length(content->>'da') > 0;

COMMIT;
