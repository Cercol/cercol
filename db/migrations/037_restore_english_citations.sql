-- Migration 037: restore the citations the English bodies lost in SEO rewrites
--
-- A corpus audit of all 108 articles compared citation density across the six
-- languages. Exactly two articles are skewed, and in both the English body is
-- the one missing what the translations kept. This is the tail of the SEO
-- title/meta/body rewrite tranches (migrations 020-024): the English versions
-- were restructured for search and their reference apparatus did not survive,
-- while ca/es/fr/de/da retained the originals.
--
-- That inverts the usual worry. The translations were not inventing sources;
-- English was the language that stopped showing its work. Spot-check:
-- blind-spots-in-teams [en] lists "Hofstee, de Raad & Goldberg (1992), JPSP
-- 63(1), 146-163" and the Catalan cites 10.1037/0022-3514.63.1.146 for it.
-- Same paper, same pages. Nothing fabricated in either direction.
--
-- English is the SEO-primary language and the one an LLM is most likely to
-- quote, so it is the worst place in the corpus to have uncited claims.
--
--   big-five-vs-disc-vs-belbin [en]
--       Had no source list at all, only "Further reading" internal links,
--       while making falsifiable claims about DISC's psychometric validity
--       and Belbin's inventory. The four sources its translations carry are
--       inserted as a "## Sources" section ahead of "## Further reading",
--       which is where the 26 other English articles using that heading put
--       it. All four DOIs are the post-034 corrected ones.
--
--   blind-spots-in-teams [en]
--       Had the richer source list of the two languages (four entries against
--       Catalan's two) but carried no DOIs at all. Three of the four are
--       resolver-linked here. Kenny & West (2008), "Zero acquaintance", is a
--       chapter in First Impressions (Guilford Press) with no registered DOI,
--       so it stays plain text rather than being pointed at something
--       approximate: a missing DOI is honest, a wrong one is not.
--
-- The DOIs added here were all confirmed to return 302 at doi.org before this
-- migration was written, and the CI gate re-checks them on every change.
--
-- Statement text was generated against the live bodies so the needles match
-- exactly, and each replace is anchored on a string asserted to occur exactly
-- once.
--
-- Idempotency needs a guard here, unlike migrations 034-036. Those replaced a
-- dead DOI with a live one, so old and new were disjoint and a re-run simply
-- found no needle. These statements ADD text around a needle they keep, so
-- the replacement contains the needle and a second run would insert a second
-- copy. A first draft did exactly that: the local re-run test produced two
-- "## Sources" headings and duplicated doi links. Each statement therefore
-- carries a WHERE guard on the thing it adds, and the re-run test is part of
-- how this migration was verified.
-- Apply through .github/workflows/apply-migrations.yml.

BEGIN;

-- big-five-vs-disc-vs-belbin [en]: insert a Sources section ahead of Further reading
UPDATE blog_posts SET content = jsonb_set(content, '{en}',
  to_jsonb(replace(content ->> 'en',
    '## Further reading',
    '## Sources

- Goldberg, L. R., et al. (2006). The International Personality Item Pool and the future of public-domain personality measures. *Journal of Research in Personality*, 40, 84–96. [doi:10.1016/j.jrp.2005.08.007](https://doi.org/10.1016/j.jrp.2005.08.007)
- Barrick, M. R., & Mount, M. K. (1991). The Big Five personality dimensions and job performance: A meta-analysis. *Personnel Psychology*, 44(1), 1–26. [doi:10.1111/j.1744-6570.1991.tb00688.x](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x)
- Furnham, A., Steele, H., & Pendleton, D. (1993). A psychometric assessment of the Belbin Team-Role Self-Perception Inventory. *Journal of Occupational and Organizational Psychology*, 66(3), 245–257. [doi:10.1111/j.2044-8325.1993.tb00535.x](https://doi.org/10.1111/j.2044-8325.1993.tb00535.x)
- Nestsiarovich, A., & Pons, A. (2020). Team roles grounded in personality circumplex: A systematic review. *PLoS ONE*, 15(3), e0230069. [doi:10.1371/journal.pone.0230069](https://doi.org/10.1371/journal.pone.0230069)

## Further reading')))
WHERE slug = 'big-five-vs-disc-vs-belbin' AND content ->> 'en' IS NOT NULL
  AND content ->> 'en' NOT LIKE '%## Sources%';

-- blind-spots-in-teams [en]: attach 10.1037/0022-3514.63.1.146
UPDATE blog_posts SET content = jsonb_set(content, '{en}',
  to_jsonb(replace(content ->> 'en',
    'Hofstee, W. K. B., de Raad, B., & Goldberg, L. R. (1992). Integration of the Big Five and circumplex approaches to trait structure. *Journal of Personality and Social Psychology*, 63(1), 146–163.',
    'Hofstee, W. K. B., de Raad, B., & Goldberg, L. R. (1992). Integration of the Big Five and circumplex approaches to trait structure. *Journal of Personality and Social Psychology*, 63(1), 146–163. [doi:10.1037/0022-3514.63.1.146](https://doi.org/10.1037/0022-3514.63.1.146)')))
WHERE slug = 'blind-spots-in-teams' AND content ->> 'en' IS NOT NULL
  AND content ->> 'en' NOT LIKE '%10.1037/0022-3514.63.1.146%';

-- blind-spots-in-teams [en]: attach 10.1111/j.1467-6494.1993.tb00781.x
UPDATE blog_posts SET content = jsonb_set(content, '{en}',
  to_jsonb(replace(content ->> 'en',
    'John, O. P., & Robins, R. W. (1993). Determinants of interjudge agreement on personality traits. *Journal of Personality*, 61(4), 521–551.',
    'John, O. P., & Robins, R. W. (1993). Determinants of interjudge agreement on personality traits. *Journal of Personality*, 61(4), 521–551. [doi:10.1111/j.1467-6494.1993.tb00781.x](https://doi.org/10.1111/j.1467-6494.1993.tb00781.x)')))
WHERE slug = 'blind-spots-in-teams' AND content ->> 'en' IS NOT NULL
  AND content ->> 'en' NOT LIKE '%10.1111/j.1467-6494.1993.tb00781.x%';

-- blind-spots-in-teams [en]: attach 10.1037/a0017908
UPDATE blog_posts SET content = jsonb_set(content, '{en}',
  to_jsonb(replace(content ->> 'en',
    'Vazire, S. (2010). Who knows what about a person? *Journal of Personality and Social Psychology*, 98(2), 281–300.',
    'Vazire, S. (2010). Who knows what about a person? *Journal of Personality and Social Psychology*, 98(2), 281–300. [doi:10.1037/a0017908](https://doi.org/10.1037/a0017908)')))
WHERE slug = 'blind-spots-in-teams' AND content ->> 'en' IS NOT NULL
  AND content ->> 'en' NOT LIKE '%10.1037/a0017908%';

COMMIT;
