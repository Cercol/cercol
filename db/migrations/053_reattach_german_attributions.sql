-- 053: reattach the quotation attributions the German pass stranded.
--
-- Migration 043 enforced the project's no-em-dash rule across the German
-- corpus. In nine blockquotes the em dash was carrying an attribution, and
-- removing it welded the author straight onto the closing quotation mark:
--
--   ... sie habe stattgefunden.“ George Bernard Shaw
--
-- which reads as a typo rather than a citation. The convention allows a
-- hyphen, a colon or a pair of commas, so the hyphen goes back in.
--
-- Found because a translator working on an unrelated removal in the same
-- article noticed it and said so. A blanket punctuation substitution needs
-- a check for the places where the punctuation was doing work; this one
-- did not have it.

BEGIN;

UPDATE blog_posts SET content = jsonb_set(content, '{de}', to_jsonb(replace(content->>'de', '“ Jack Block,', '“ - Jack Block,'))),
       updated_at = now()
 WHERE slug = 'critiques-of-big-five-what-critics-say' AND content->>'de' LIKE '%“ Jack Block,%';
UPDATE blog_posts SET content = jsonb_set(content, '{de}', to_jsonb(replace(content->>'de', '“ Barrick & Mount (1991)', '“ - Barrick & Mount (1991)'))),
       updated_at = now()
 WHERE slug = 'disc-vs-big-five-why-four-styles-arent-enough' AND content->>'de' LIKE '%“ Barrick & Mount (1991)%';
UPDATE blog_posts SET content = jsonb_set(content, '{de}', to_jsonb(replace(content->>'de', '“ Staw & Ross,', '“ - Staw & Ross,'))),
       updated_at = now()
 WHERE slug = 'job-satisfaction-personality-what-predicts-it' AND content->>'de' LIKE '%“ Staw & Ross,%';
UPDATE blog_posts SET content = jsonb_set(content, '{de}', to_jsonb(replace(content->>'de', '“ George Bernard Shaw', '“ - George Bernard Shaw'))),
       updated_at = now()
 WHERE slug = 'personality-and-communication-style-direct-vs-diplomatic' AND content->>'de' LIKE '%“ George Bernard Shaw%';
UPDATE blog_posts SET content = jsonb_set(content, '{de}', to_jsonb(replace(content->>'de', '“ DeNeve & Cooper,', '“ - DeNeve & Cooper,'))),
       updated_at = now()
 WHERE slug = 'personality-and-happiness-what-big-five-predicts' AND content->>'de' LIKE '%“ DeNeve & Cooper,%';
UPDATE blog_posts SET content = jsonb_set(content, '{de}', to_jsonb(replace(content->>'de', '“ De Dreu & Weingart, 2003', '“ - De Dreu & Weingart, 2003'))),
       updated_at = now()
 WHERE slug = 'conflict-resolution-styles-personality' AND content->>'de' LIKE '%“ De Dreu & Weingart, 2003%';
UPDATE blog_posts SET content = jsonb_set(content, '{de}', to_jsonb(replace(content->>'de', '“ Daniel Goleman,', '“ - Daniel Goleman,'))),
       updated_at = now()
 WHERE slug = 'personality-and-leadership-styles-authoritative-coaching-democratic' AND content->>'de' LIKE '%“ Daniel Goleman,%';
UPDATE blog_posts SET content = jsonb_set(content, '{de}', to_jsonb(replace(content->>'de', '“ Lencioni,', '“ - Lencioni,'))),
       updated_at = now()
 WHERE slug = 'trust-in-teams-personality-foundations' AND content->>'de' LIKE '%“ Lencioni,%';
UPDATE blog_posts SET content = jsonb_set(content, '{de}', to_jsonb(replace(content->>'de', '“ Sinngemäß nach', '“ - Sinngemäß nach'))),
       updated_at = now()
 WHERE slug = 'personality-and-feedback-reception-why-some-people-reject-feedback' AND content->>'de' LIKE '%“ Sinngemäß nach%';

COMMIT;
