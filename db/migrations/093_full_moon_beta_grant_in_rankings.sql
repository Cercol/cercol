-- 093: Full Moon is a paid product AND free right now, and the rankings
-- article only said the first half.
--
-- 074 changed this article's description of Full Moon from "free" to "a
-- one-time paid purchase". That change was right and is not being undone
-- here. The article had been ranking Cercol first in a list of free tests
-- on the strength of claims about our own product that were false, and a
-- paid instrument sitting second in a free-test ranking was one of them.
-- Cercol stays at number two, and the ranking is untouched.
--
-- What 074 could not have known is that the sentence it wrote is now only
-- half true. BETA_TOTAL is 500 free Full Moon licences and GET /beta reports
-- 489 remaining, so a new account gets Full Moon at no cost today. The
-- runbook already records that this makes seo.instruments.description and
-- auth.confirmBody go stale when the grant ends, and it notes that the blog
-- carried the same claim. The blog now carries the opposite one: an article
-- titled "the best free personality tests" describes as paid the instrument
-- of which we are giving away five hundred licences.
--
-- Neither "free" nor "a one-time paid purchase" is the accurate sentence.
-- Both facts are true at once and both are load-bearing for a reader
-- deciding whether to start, so all three places now state both: the pricing
-- line, the comparison table row, and the closing section where the Witness
-- assessment is introduced. The claim is verifiable against GET /beta rather
-- than being a marketing adjective.
--
-- This is deliberately a bounded claim ("while the open beta lasts") rather
-- than a bare "free", so that when the grant reaches zero the sentence
-- becomes merely out of date rather than false. The runbook entry is
-- extended in the same commit to name these three strings, because a meta
-- description and a blog body both keep serving the old text for a while
-- after they change.
--
-- Translations of the added clause are machine-drafted and flagged for human
-- review in the pull request, matching how the localized CTA copy is handled.
-- The grammatical gender of "beta" follows each language (la beta oberta,
-- la beta abierta, la beta ouverte, die offene Beta, den abne beta), and the
-- appositive form is used in the closing section so the adjective agrees
-- with the instrument rather than with the Witness assessment.

BEGIN;

UPDATE blog_posts
   SET content = jsonb_set(content, '{en}', to_jsonb(
         replace(replace(replace(content->>'en',
           'is a one-time paid purchase.',
           'is a one-time paid purchase, and is free to new accounts while the open beta lasts.'),
           'New Moon and First Quarter free, Full Moon paid |',
           'New Moon and First Quarter free, Full Moon paid (free during the open beta) |'),
           'part of the paid Full Moon Cèrcol, invites',
           'part of Full Moon Cèrcol, free to new accounts during the open beta, invites')
       )),
       updated_at = now()
 WHERE slug = 'best-free-personality-tests-for-teams-2026';

UPDATE blog_posts
   SET content = jsonb_set(content, '{ca}', to_jsonb(
         replace(replace(replace(content->>'ca',
           'és una compra de pagament única.',
           'és una compra de pagament única, i és gratuït per als comptes nous mentre dure la beta oberta.'),
           'Lluna Nova i Quart Creixent gratuïts, Lluna Plena de pagament |',
           'Lluna Nova i Quart Creixent gratuïts, Lluna Plena de pagament (gratuïta durant la beta oberta) |'),
           'que forma part del Cèrcol de Lluna Plena de pagament, convida',
           'que forma part del Cèrcol de Lluna Plena, gratuït per als comptes nous durant la beta oberta, convida')
       )),
       updated_at = now()
 WHERE slug = 'best-free-personality-tests-for-teams-2026';

UPDATE blog_posts
   SET content = jsonb_set(content, '{es}', to_jsonb(
         replace(replace(replace(content->>'es',
           'es una compra de pago único.',
           'es una compra de pago único, y es gratuito para las cuentas nuevas mientras dure la beta abierta.'),
           'Luna Nueva y Cuarto Creciente gratis, Luna Llena de pago |',
           'Luna Nueva y Cuarto Creciente gratis, Luna Llena de pago (gratis durante la beta abierta) |'),
           'incluida en el Cèrcol de Luna Llena de pago, permite',
           'incluida en el Cèrcol de Luna Llena, gratuito para las cuentas nuevas durante la beta abierta, permite')
       )),
       updated_at = now()
 WHERE slug = 'best-free-personality-tests-for-teams-2026';

UPDATE blog_posts
   SET content = jsonb_set(content, '{fr}', to_jsonb(
         replace(replace(replace(content->>'fr',
           'est un achat payant, réglé une seule fois.',
           'est un achat payant, réglé une seule fois, et il est gratuit pour les nouveaux comptes pendant la bêta ouverte.'),
           'Nouvelle Lune et Premier Quartier gratuits, Pleine Lune payant |',
           'Nouvelle Lune et Premier Quartier gratuits, Pleine Lune payant (gratuit pendant la bêta ouverte) |'),
           'incluse dans le Cèrcol de Pleine Lune payant, invite',
           'incluse dans le Cèrcol de Pleine Lune, gratuit pour les nouveaux comptes pendant la bêta ouverte, invite')
       )),
       updated_at = now()
 WHERE slug = 'best-free-personality-tests-for-teams-2026';

UPDATE blog_posts
   SET content = jsonb_set(content, '{de}', to_jsonb(
         replace(replace(replace(content->>'de',
           'ist ein einmaliger kostenpflichtiger Kauf.',
           'ist ein einmaliger kostenpflichtiger Kauf und für neue Konten kostenlos, solange die offene Beta läuft.'),
           'Neumond und Erstes Viertel kostenlos, Vollmond kostenpflichtig |',
           'Neumond und Erstes Viertel kostenlos, Vollmond kostenpflichtig (während der offenen Beta kostenlos) |'),
           'Teil des kostenpflichtigen Cèrcol des Vollmondes, lädt',
           'Teil des Cèrcol des Vollmondes, für neue Konten während der offenen Beta kostenlos, lädt')
       )),
       updated_at = now()
 WHERE slug = 'best-free-personality-tests-for-teams-2026';

UPDATE blog_posts
   SET content = jsonb_set(content, '{da}', to_jsonb(
         replace(replace(replace(content->>'da',
           'er et engangskøb, man betaler for.',
           'er et engangskøb, man betaler for, og det er gratis for nye konti, så længe den åbne beta varer.'),
           'Nymåne og Første Kvarter gratis, Fuldmåne betalt |',
           'Nymåne og Første Kvarter gratis, Fuldmåne betalt (gratis under den åbne beta) |'),
           'som er en del af den betalte Fuldmåne Cèrcol, inviterer',
           'som er en del af Fuldmåne Cèrcol, gratis for nye konti under den åbne beta, inviterer')
       )),
       updated_at = now()
 WHERE slug = 'best-free-personality-tests-for-teams-2026';

DO $$
DECLARE bad integer;
BEGIN
  SELECT count(*) INTO bad FROM blog_posts WHERE jsonb_typeof(content) <> 'object';
  IF bad > 0 THEN RAISE EXCEPTION 'blog_posts: % row(s) with a non-object content', bad; END IF;

  -- Not one of the eighteen replaced sentences may survive. Counting the
  -- word "beta" would not do: these bodies discuss beta weights, so a
  -- threshold could pass while a replacement had silently been a no-op.
  -- The strings are long, and one stray character turns replace() into an
  -- identity function without any error, so the absence of the old text is
  -- the only assertion that actually proves the edit landed.
  SELECT count(*) INTO bad FROM blog_posts
   WHERE slug = 'best-free-personality-tests-for-teams-2026'
     AND (content->>'en' LIKE '%is a one-time paid purchase.%'
       OR content->>'en' LIKE '%Full Moon paid |%'
       OR content->>'en' LIKE '%part of the paid Full Moon%'
       OR content->>'ca' LIKE '%és una compra de pagament única.%'
       OR content->>'ca' LIKE '%Lluna Plena de pagament |%'
       OR content->>'ca' LIKE '%Lluna Plena de pagament, convida%'
       OR content->>'es' LIKE '%es una compra de pago único.%'
       OR content->>'es' LIKE '%Luna Llena de pago |%'
       OR content->>'es' LIKE '%Luna Llena de pago, permite%'
       OR content->>'fr' LIKE '%réglé une seule fois.%'
       OR content->>'fr' LIKE '%Pleine Lune payant |%'
       OR content->>'fr' LIKE '%Pleine Lune payant, invite%'
       OR content->>'de' LIKE '%kostenpflichtiger Kauf.%'
       OR content->>'de' LIKE '%Vollmond kostenpflichtig |%'
       OR content->>'de' LIKE '%Teil des kostenpflichtigen Cèrcol%'
       OR content->>'da' LIKE '%er et engangskøb, man betaler for.%'
       OR content->>'da' LIKE '%Fuldmåne betalt |%'
       OR content->>'da' LIKE '%den betalte Fuldmåne%');
  IF bad > 0 THEN RAISE EXCEPTION 'rankings article: a pre-093 pricing sentence survived the replace'; END IF;

  -- Cercol stays at number two. 074 put it there for a reason and this
  -- migration is not a route back to number one.
  SELECT count(*) INTO bad FROM blog_posts
   WHERE slug = 'best-free-personality-tests-for-teams-2026'
     AND content->>'en' NOT LIKE '%### 2. Cèrcol%';
  IF bad > 0 THEN RAISE EXCEPTION 'rankings article: Cercol is no longer ranked second';
  END IF;
END $$;

COMMIT;
