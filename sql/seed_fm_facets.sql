-- Phase 13.13 seed: populate facets for fullMoon rows that have none.
-- Values are normally distributed (mean=3.0, SD=0.6), clamped to [1,5], 2 dp.
-- Run manually in the Supabase SQL editor. Never run more than once per environment.

WITH facet_keys AS (
  SELECT unnest(ARRAY[
    'hearth','gather','command','drive','thrill','radiance',
    'faith','edge','gift','yield','shadow','shield',
    'mastery','structure','oath','quest','will','counsel',
    'vigil','blaze','hollow','veil','surge','fracture',
    'dream','craft','resonance','drift','prism','compass'
  ]) AS k
),
rows_needing_facets AS (
  SELECT id FROM results
  WHERE instrument = 'fullMoon'
    AND facets IS NULL
),
generated AS (
  SELECT
    r.id,
    k.k,
    ROUND(
      GREATEST(1, LEAST(5,
        3.0 + 0.6 * sqrt(-2.0 * ln(random())) * cos(2.0 * pi() * random())
      ))::numeric,
      2
    ) AS v
  FROM rows_needing_facets r
  CROSS JOIN facet_keys k
),
aggregated AS (
  SELECT id, jsonb_object_agg(k, v) AS facets
  FROM generated
  GROUP BY id
)
UPDATE results r
SET facets = a.facets
FROM aggregated a
WHERE r.id = a.id;
