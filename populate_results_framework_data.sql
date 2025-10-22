-- Populate missing resultsFramework data for existing projects
-- This script ensures all existing projects have a proper resultsFramework structure

-- Update projects that don't have resultsFramework or have null/empty resultsFramework
UPDATE projects 
SET "resultsFramework" = '{"objectives": [], "projectDuration": 1}'::jsonb
WHERE "resultsFramework" IS NULL 
   OR "resultsFramework" = '{}'::jsonb
   OR "resultsFramework" = 'null'::jsonb;

-- Update projects that have resultsFramework but missing projectDuration
UPDATE projects 
SET "resultsFramework" = jsonb_set(
    COALESCE("resultsFramework", '{}'::jsonb),
    '{projectDuration}',
    '1'::jsonb
)
WHERE "resultsFramework" IS NOT NULL 
  AND ("resultsFramework"->>'projectDuration' IS NULL 
       OR "resultsFramework"->>'projectDuration' = 'null');

-- Update projects that have resultsFramework but missing objectives array
UPDATE projects 
SET "resultsFramework" = jsonb_set(
    COALESCE("resultsFramework", '{}'::jsonb),
    '{objectives}',
    '[]'::jsonb
)
WHERE "resultsFramework" IS NOT NULL 
  AND ("resultsFramework"->>'objectives' IS NULL 
       OR "resultsFramework"->>'objectives' = 'null');

-- Ensure all outcomes have indicators arrays
UPDATE projects 
SET "resultsFramework" = (
    SELECT jsonb_agg(
        jsonb_set(
            jsonb_set(
                obj,
                '{outcomes}',
                COALESCE(
                    (
                        SELECT jsonb_agg(
                            jsonb_set(
                                outcome,
                                '{indicators}',
                                COALESCE(outcome->'indicators', '[]'::jsonb)
                            )
                        )
                        FROM jsonb_array_elements(obj->'outcomes') AS outcome
                    ),
                    '[]'::jsonb
                )
            ),
            '{outputs}',
            COALESCE(
                (
                    SELECT jsonb_agg(
                        jsonb_set(
                            output,
                            '{indicators}',
                            COALESCE(output->'indicators', '[]'::jsonb)
                        )
                    )
                    FROM jsonb_array_elements(obj->'outputs') AS output
                ),
                '[]'::jsonb
            )
        )
    )
    FROM jsonb_array_elements("resultsFramework"->'objectives') AS obj
)
WHERE "resultsFramework" IS NOT NULL 
  AND "resultsFramework"->'objectives' IS NOT NULL;

-- Verify the updates
SELECT 
    id,
    name,
    "resultsFramework"->>'projectDuration' as project_duration,
    jsonb_array_length("resultsFramework"->'objectives') as objectives_count
FROM projects 
WHERE "resultsFramework" IS NOT NULL
ORDER BY "updatedAt" DESC
LIMIT 10;
