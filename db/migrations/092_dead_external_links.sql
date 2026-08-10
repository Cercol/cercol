-- 092: the five external links in the corpus that are actually dead.
--
-- The weekly digest reports broken external links, and it had been reporting
-- two. A full sweep of all 229 unique external URLs in blog_posts, fetched
-- with a browser User-Agent, found that both of those numbers were wrong in
-- opposite directions.
--
-- The digest's own two: doi.org/10.2307/1170497 is genuinely dead, and
-- openpsychometrics.org/_rawdata/ answers 200. The second was a transient
-- connection failure reported as breakage, so nothing here touches it.
--
-- What the digest could not see is that roughly thirty-five doi.org URLs
-- answer 403 to an unauthenticated client. Those are publisher anti-bot
-- rules, not link rot: every one of them resolves in a browser, and the
-- Crossref metadata for each is intact. They are deliberately untouched. A
-- link checker that treats 403 as breakage would have rewritten the entire
-- citation apparatus of the corpus over a header.
--
-- The five that are really dead, each replaced with a target checked to
-- answer 200 and to be the same source rather than a near neighbour:
--
--   10.2307/1170497 -> 10.3102/00346543063004467
--     Pittenger, "The Utility of the Myers-Briggs Type Indicator", Review of
--     Educational Research, 1993. The JSTOR DOI and the SAGE DOI carry
--     identical Crossref metadata (same title, same author, same journal,
--     same year); only the JSTOR resolution target has rotted. This is the
--     same paper, so the citation is preserved rather than substituted.
--     Replaced as a bare DOI so the visible "doi:..." label moves with the
--     href instead of contradicting it.
--
--   wiki/16Personalities -> www.16personalities.com
--     The anchor text reads "16Personalities.com" and pointed at a Wikipedia
--     article that has never existed. The article already links that same
--     site elsewhere, so this restores the link the anchor text promises.
--
--   wiki/Arousal_theory_of_extraversion -> wiki/Extraversion_and_introversion
--     No such Wikipedia article. The anchor is "Hans Eysenck's arousal theory
--     of extraversion", which is a section of the article now linked.
--
--   wiki/Dual_concern_model -> wiki/Conflict_resolution#Dual_concern
--     No such Wikipedia article either. The concept is a named section of
--     Conflict resolution, so this deep-links the section rather than
--     dropping the reader at the top of a long page.
--
--   kilmanndiagnostics.com/overview-thomas-kilmann-conflict-mode-instrument-tki/
--     -> kilmanndiagnostics.com/brief-overview-of-the-tki-assessment/
--     The publisher reorganised its site. The replacement is the equivalent
--     page, taken from the site's own current navigation rather than guessed.
--
-- Every replacement is a plain string substitution across all six language
-- bodies at once, because a dead URL is dead in every translation and the
-- URLs are not themselves translated.

BEGIN;

-- Pittenger 1993: JSTOR DOI replaced by the live SAGE DOI. Bare form, so
-- both the markdown label and the href are rewritten by one substitution.
UPDATE blog_posts
   SET content = (
         SELECT jsonb_object_agg(k, to_jsonb(replace(v #>> '{}',
                  '10.2307/1170497', '10.3102/00346543063004467')))
           FROM jsonb_each(content) AS e(k, v)
       ),
       updated_at = now()
 WHERE content::text LIKE '%10.2307/1170497%';

UPDATE blog_posts
   SET content = (
         SELECT jsonb_object_agg(k, to_jsonb(replace(v #>> '{}',
                  'https://en.wikipedia.org/wiki/16Personalities',
                  'https://www.16personalities.com')))
           FROM jsonb_each(content) AS e(k, v)
       ),
       updated_at = now()
 WHERE content::text LIKE '%en.wikipedia.org/wiki/16Personalities%';

UPDATE blog_posts
   SET content = (
         SELECT jsonb_object_agg(k, to_jsonb(replace(v #>> '{}',
                  'https://en.wikipedia.org/wiki/Arousal_theory_of_extraversion',
                  'https://en.wikipedia.org/wiki/Extraversion_and_introversion')))
           FROM jsonb_each(content) AS e(k, v)
       ),
       updated_at = now()
 WHERE content::text LIKE '%Arousal_theory_of_extraversion%';

UPDATE blog_posts
   SET content = (
         SELECT jsonb_object_agg(k, to_jsonb(replace(v #>> '{}',
                  'https://en.wikipedia.org/wiki/Dual_concern_model',
                  'https://en.wikipedia.org/wiki/Conflict_resolution#Dual_concern')))
           FROM jsonb_each(content) AS e(k, v)
       ),
       updated_at = now()
 WHERE content::text LIKE '%Dual_concern_model%';

UPDATE blog_posts
   SET content = (
         SELECT jsonb_object_agg(k, to_jsonb(replace(v #>> '{}',
                  'https://kilmanndiagnostics.com/overview-thomas-kilmann-conflict-mode-instrument-tki/',
                  'https://kilmanndiagnostics.com/brief-overview-of-the-tki-assessment/')))
           FROM jsonb_each(content) AS e(k, v)
       ),
       updated_at = now()
 WHERE content::text LIKE '%overview-thomas-kilmann-conflict-mode-instrument-tki/%';

DO $$
DECLARE bad integer;
BEGIN
  SELECT count(*) INTO bad FROM blog_posts WHERE jsonb_typeof(content) <> 'object';
  IF bad > 0 THEN RAISE EXCEPTION 'blog_posts: % row(s) with a non-object content', bad; END IF;

  -- None of the five dead URLs may survive in any language.
  SELECT count(*) INTO bad FROM blog_posts
   WHERE content::text LIKE '%10.2307/1170497%'
      OR content::text LIKE '%en.wikipedia.org/wiki/16Personalities%'
      OR content::text LIKE '%Arousal_theory_of_extraversion%'
      OR content::text LIKE '%Dual_concern_model%'
      OR content::text LIKE '%overview-thomas-kilmann-conflict-mode-instrument-tki/%';
  IF bad > 0 THEN RAISE EXCEPTION 'blog_posts: % body(ies) still carry a dead link', bad; END IF;

  -- The live Pittenger DOI must have landed wherever the dead one was, and
  -- the 403-answering DOIs must not have been touched: 10.2307/2666999
  -- (Edmondson) is the control, a JSTOR DOI that resolves and stays.
  SELECT count(*) INTO bad FROM blog_posts
   WHERE content::text LIKE '%10.3102/00346543063004467%';
  IF bad < 1 THEN RAISE EXCEPTION 'blog_posts: the replacement Pittenger DOI is absent'; END IF;

  SELECT count(*) INTO bad FROM blog_posts
   WHERE content::text LIKE '%10.2307/2666999%';
  IF bad < 1 THEN RAISE EXCEPTION 'blog_posts: the Edmondson DOI was collateral damage'; END IF;
END $$;

COMMIT;
