-- =============================================================================
-- Backfill: move "Other (cumulative, not tagged by year)" into current year
-- =============================================================================
-- The UI shows untagged progress when indicator.current exceeds the sum of
-- incrementBy on updateHistory rows that have reportingYearIndex or matching
-- reportingYearLabel. This script appends one synthetic history row with the
-- untagged amount tagged to the "current" reporting year.
--
-- Year index matches the app fallback in project-indicators.tsx
-- (getCurrentProjectYearInfo): months elapsed since startDate / 12, clamped by
-- resultsFramework.projectDuration and number of target years; after endDate
-- uses the last year.
--
-- Usage (Supabase SQL Editor):
--   1) Run sections 1–2 (functions).
--   2) SELECT * FROM meal_preview_untagged_backfill(now());
--   3) Run section 3 inside BEGIN … COMMIT after review.
-- Safe to re-run: no untagged amount => no change.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Helpers
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION meal_parse_numeric_text(val text)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(
    NULLIF(
      regexp_replace(COALESCE(trim(val), ''), '[^0-9.\-]', '', 'g'),
      ''
    )::numeric,
    0
  );
$$;


CREATE OR REPLACE FUNCTION meal_sorted_target_labels(targets jsonb)
RETURNS text[]
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  keys text[];
BEGIN
  IF targets IS NULL OR jsonb_typeof(targets) <> 'object' THEN
    RETURN ARRAY[]::text[];
  END IF;
  SELECT array_agg(k ORDER BY COALESCE(substring(k FROM '(\d+)')::int, 0), k)
  INTO keys
  FROM jsonb_object_keys(targets) AS k;
  RETURN COALESCE(keys, ARRAY[]::text[]);
END;
$$;


CREATE OR REPLACE FUNCTION meal_tagged_increment_sum(indicator jsonb, target_labels text[])
RETURNS numeric
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  elem jsonb;
  inc numeric;
  n int;
  idx int;
  lbl text;
  j int;
  sum_tagged numeric := 0;
BEGIN
  n := COALESCE(array_length(target_labels, 1), 0);
  IF n = 0 THEN
    RETURN 0;
  END IF;

  FOR elem IN
    SELECT value FROM jsonb_array_elements(COALESCE(indicator->'updateHistory', '[]'::jsonb)) AS t(value)
  LOOP
    inc := meal_parse_numeric_text(elem->>'incrementBy');
    CONTINUE WHEN inc IS NULL OR inc = 0;

    IF jsonb_typeof(elem->'reportingYearIndex') = 'number' THEN
      idx := (elem->'reportingYearIndex')::text::int;
      IF idx >= 0 AND idx < n THEN
        sum_tagged := sum_tagged + inc;
        CONTINUE;
      END IF;
    END IF;

    lbl := elem->>'reportingYearLabel';
    IF lbl IS NOT NULL THEN
      FOR j IN 1..n LOOP
        IF target_labels[j] = lbl THEN
          sum_tagged := sum_tagged + inc;
          EXIT;
        END IF;
      END LOOP;
    END IF;
  END LOOP;

  RETURN sum_tagged;
END;
$$;


CREATE OR REPLACE FUNCTION meal_current_year_index(
  p_start timestamptz,
  p_end timestamptz,
  fw_duration int,
  target_count int,
  p_now timestamptz
)
RETURNS int
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  year_idx int := 0;
  max_idx int;
  months_diff int;
BEGIN
  IF target_count IS NULL OR target_count <= 0 THEN
    RETURN 0;
  END IF;

  max_idx := target_count - 1;
  IF fw_duration IS NOT NULL AND fw_duration > 0 THEN
    max_idx := LEAST(max_idx, fw_duration - 1);
  END IF;

  IF p_start IS NOT NULL THEN
    IF p_now::date <= p_start::date THEN
      year_idx := 0;
    ELSE
      months_diff :=
        (EXTRACT(YEAR FROM p_now)::int - EXTRACT(YEAR FROM p_start)::int) * 12
        + (EXTRACT(MONTH FROM p_now)::int - EXTRACT(MONTH FROM p_start)::int);
      year_idx := FLOOR(months_diff / 12.0)::int;
    END IF;
  END IF;

  IF p_end IS NOT NULL AND p_now::date > p_end::date THEN
    year_idx := max_idx;
  END IF;

  year_idx := LEAST(GREATEST(year_idx, 0), max_idx);
  RETURN year_idx;
END;
$$;


-- -----------------------------------------------------------------------------
-- 2) Walk framework JSON and append one backfill row per indicator when needed
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION meal_process_single_indicator(
  ind jsonb,
  p_start timestamptz,
  p_end timestamptz,
  fw_duration int,
  p_now timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  labels text[];
  n int;
  year_idx int;
  year_lbl text;
  current_val numeric;
  tagged_sum numeric;
  untagged numeric;
  new_entry jsonb;
  hist jsonb;
  prev_val numeric;
BEGIN
  labels := meal_sorted_target_labels(ind->'targets');
  n := COALESCE(array_length(labels, 1), 0);
  IF n = 0 THEN
    RETURN ind;
  END IF;

  current_val := meal_parse_numeric_text(ind->>'current');
  tagged_sum := meal_tagged_increment_sum(ind, labels);
  untagged := GREATEST(current_val - tagged_sum, 0);
  IF untagged <= 0 THEN
    RETURN ind;
  END IF;

  year_idx := meal_current_year_index(p_start, p_end, fw_duration, n, p_now);
  year_lbl := labels[year_idx + 1];
  prev_val := current_val - untagged;

  new_entry := jsonb_build_object(
    'value', to_jsonb(current_val),
    'incrementBy', to_jsonb(untagged),
    'previousValue', to_jsonb(prev_val),
    'updatedBy', 'Supabase migration (untagged to current year)',
    'updatedAt', to_jsonb(p_now),
    'notes', format(
      'Backfill: attributed %s untagged cumulative progress to %s (index %s) from project dates.',
      untagged,
      year_lbl,
      year_idx
    ),
    'reportingYearIndex', year_idx,
    'reportingYearLabel', year_lbl
  );

  hist := COALESCE(ind->'updateHistory', '[]'::jsonb) || jsonb_build_array(new_entry);
  RETURN jsonb_set(ind, '{updateHistory}', hist);
END;
$$;


CREATE OR REPLACE FUNCTION meal_process_indicators_array(
  indicators jsonb,
  p_start timestamptz,
  p_end timestamptz,
  fw_duration int,
  p_now timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  i int;
  len int;
  new_arr jsonb := '[]'::jsonb;
BEGIN
  IF indicators IS NULL OR jsonb_typeof(indicators) <> 'array' THEN
    RETURN COALESCE(indicators, '[]'::jsonb);
  END IF;
  len := jsonb_array_length(indicators);
  FOR i IN 0..len - 1 LOOP
    new_arr := new_arr || jsonb_build_array(
      meal_process_single_indicator(indicators->i, p_start, p_end, fw_duration, p_now)
    );
  END LOOP;
  RETURN new_arr;
END;
$$;


CREATE OR REPLACE FUNCTION meal_process_outputs_array(
  outputs jsonb,
  p_start timestamptz,
  p_end timestamptz,
  fw_duration int,
  p_now timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  i int;
  len int;
  out_el jsonb;
  new_arr jsonb := '[]'::jsonb;
BEGIN
  IF outputs IS NULL OR jsonb_typeof(outputs) <> 'array' THEN
    RETURN COALESCE(outputs, '[]'::jsonb);
  END IF;
  len := jsonb_array_length(outputs);
  FOR i IN 0..len - 1 LOOP
    out_el := outputs->i;
    out_el := jsonb_set(
      out_el,
      '{indicators}',
      meal_process_indicators_array(out_el->'indicators', p_start, p_end, fw_duration, p_now)
    );
    new_arr := new_arr || jsonb_build_array(out_el);
  END LOOP;
  RETURN new_arr;
END;
$$;


CREATE OR REPLACE FUNCTION meal_process_outcome_node(
  outcome jsonb,
  p_start timestamptz,
  p_end timestamptz,
  fw_duration int,
  p_now timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  oc jsonb := outcome;
BEGIN
  oc := jsonb_set(
    oc,
    '{indicators}',
    meal_process_indicators_array(oc->'indicators', p_start, p_end, fw_duration, p_now)
  );
  oc := jsonb_set(
    oc,
    '{outputs}',
    meal_process_outputs_array(oc->'outputs', p_start, p_end, fw_duration, p_now)
  );
  RETURN oc;
END;
$$;


CREATE OR REPLACE FUNCTION meal_process_objectives_array(
  objectives jsonb,
  p_start timestamptz,
  p_end timestamptz,
  fw_duration int,
  p_now timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  i int;
  j int;
  len_o int;
  len_oc int;
  obj jsonb;
  outcomes jsonb;
  new_outcomes jsonb;
  new_objs jsonb := '[]'::jsonb;
BEGIN
  IF objectives IS NULL OR jsonb_typeof(objectives) <> 'array' THEN
    RETURN COALESCE(objectives, '[]'::jsonb);
  END IF;
  len_o := jsonb_array_length(objectives);
  FOR i IN 0..len_o - 1 LOOP
    obj := objectives->i;
    outcomes := obj->'outcomes';
    new_outcomes := '[]'::jsonb;
    IF outcomes IS NOT NULL AND jsonb_typeof(outcomes) = 'array' THEN
      len_oc := jsonb_array_length(outcomes);
      FOR j IN 0..len_oc - 1 LOOP
        new_outcomes := new_outcomes || jsonb_build_array(
          meal_process_outcome_node(outcomes->j, p_start, p_end, fw_duration, p_now)
        );
      END LOOP;
    END IF;
    obj := jsonb_set(obj, '{outcomes}', new_outcomes);
    new_objs := new_objs || jsonb_build_array(obj);
  END LOOP;
  RETURN new_objs;
END;
$$;


CREATE OR REPLACE FUNCTION meal_backfill_untagged_in_framework(
  fw jsonb,
  p_start timestamptz,
  p_end timestamptz,
  p_now timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  duration int;
BEGIN
  IF fw IS NULL OR jsonb_typeof(fw) <> 'object' THEN
    RETURN fw;
  END IF;
  duration := NULLIF(trim(fw->>'projectDuration'), '')::int;
  RETURN jsonb_set(
    fw,
    '{objectives}',
    meal_process_objectives_array(fw->'objectives', p_start, p_end, duration, p_now)
  );
END;
$$;


CREATE OR REPLACE FUNCTION meal_preview_untagged_backfill(p_now timestamptz DEFAULT now())
RETURNS TABLE (
  project_id text,
  project_name text,
  indicator_id text,
  description_preview text,
  n_years int,
  year_idx int,
  reporting_year_label text,
  current_val numeric,
  tagged_sum numeric,
  untagged numeric
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH expanded AS (
    SELECT
      p.id::text AS pid,
      p.name::text AS pname,
      p."startDate" AS sdt,
      p."endDate" AS edt,
      (NULLIF(trim(p."resultsFramework"->>'projectDuration'), ''))::int AS dur,
      ind.value AS indicator
    FROM projects p
    CROSS JOIN LATERAL jsonb_path_query(
      p."resultsFramework",
      '$.objectives[*].outcomes[*].indicators[*]'
    ) AS ind(value)
    WHERE p."resultsFramework" IS NOT NULL
      AND jsonb_typeof(p."resultsFramework") = 'object'
    UNION ALL
    SELECT
      p.id::text,
      p.name::text,
      p."startDate",
      p."endDate",
      (NULLIF(trim(p."resultsFramework"->>'projectDuration'), ''))::int,
      ind.value
    FROM projects p
    CROSS JOIN LATERAL jsonb_path_query(
      p."resultsFramework",
      '$.objectives[*].outcomes[*].outputs[*].indicators[*]'
    ) AS ind(value)
    WHERE p."resultsFramework" IS NOT NULL
      AND jsonb_typeof(p."resultsFramework") = 'object'
  ),
  computed AS (
    SELECT
      e.*,
      meal_sorted_target_labels(e.indicator->'targets') AS lbls
    FROM expanded e
  )
  SELECT
    c.pid,
    c.pname,
    c.indicator->>'id',
    left(c.indicator->>'description', 80),
    cardinality(c.lbls),
    meal_current_year_index(c.sdt, c.edt, c.dur, cardinality(c.lbls), p_now),
    c.lbls[meal_current_year_index(c.sdt, c.edt, c.dur, cardinality(c.lbls), p_now) + 1],
    meal_parse_numeric_text(c.indicator->>'current'),
    meal_tagged_increment_sum(c.indicator, c.lbls),
    GREATEST(
      meal_parse_numeric_text(c.indicator->>'current') - meal_tagged_increment_sum(c.indicator, c.lbls),
      0
    )
  FROM computed c
  WHERE cardinality(c.lbls) > 0
    AND GREATEST(
      meal_parse_numeric_text(c.indicator->>'current') - meal_tagged_increment_sum(c.indicator, c.lbls),
      0
    ) > 0;
END;
$$;


-- -----------------------------------------------------------------------------
-- 3) Apply (run after preview). Use a transaction.
-- -----------------------------------------------------------------------------
-- SELECT * FROM meal_preview_untagged_backfill(now());
--
-- BEGIN;
-- UPDATE projects p
-- SET "resultsFramework" = meal_backfill_untagged_in_framework(
--   p."resultsFramework",
--   p."startDate",
--   p."endDate",
--   now()
-- )
-- WHERE p."resultsFramework" IS NOT NULL
--   AND jsonb_typeof(p."resultsFramework") = 'object';
-- COMMIT;


-- -----------------------------------------------------------------------------
-- 4) Optional cleanup after migration
-- -----------------------------------------------------------------------------
-- DROP FUNCTION IF EXISTS meal_preview_untagged_backfill(timestamptz);
-- DROP FUNCTION IF EXISTS meal_backfill_untagged_in_framework(jsonb,timestamptz,timestamptz,timestamptz);
-- DROP FUNCTION IF EXISTS meal_process_objectives_array(jsonb,timestamptz,timestamptz,int,timestamptz);
-- DROP FUNCTION IF EXISTS meal_process_outcome_node(jsonb,timestamptz,timestamptz,int,timestamptz);
-- DROP FUNCTION IF EXISTS meal_process_outputs_array(jsonb,timestamptz,timestamptz,int,timestamptz);
-- DROP FUNCTION IF EXISTS meal_process_indicators_array(jsonb,timestamptz,timestamptz,int,timestamptz);
-- DROP FUNCTION IF EXISTS meal_process_single_indicator(jsonb,timestamptz,timestamptz,int,timestamptz);
-- DROP FUNCTION IF EXISTS meal_current_year_index(timestamptz,timestamptz,int,int,timestamptz);
-- DROP FUNCTION IF EXISTS meal_sorted_target_labels(jsonb);
-- DROP FUNCTION IF EXISTS meal_tagged_increment_sum(jsonb,text[]);
-- DROP FUNCTION IF EXISTS meal_parse_numeric_text(text);
