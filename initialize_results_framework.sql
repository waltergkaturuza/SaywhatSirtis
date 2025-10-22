-- Simple initialization script for resultsFramework data
-- Run this if the complex script above has issues

-- Step 1: Add resultsFramework column if it doesn't exist
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "resultsFramework" JSONB;

-- Step 2: Set default values for projects without resultsFramework
UPDATE projects 
SET "resultsFramework" = '{"objectives": [], "projectDuration": 1}'::jsonb
WHERE "resultsFramework" IS NULL;

-- Step 3: Ensure all projects have the basic structure
UPDATE projects 
SET "resultsFramework" = jsonb_build_object(
    'objectives', COALESCE("resultsFramework"->'objectives', '[]'::jsonb),
    'projectDuration', COALESCE(("resultsFramework"->>'projectDuration')::int, 1)
)
WHERE "resultsFramework" IS NOT NULL;

-- Step 4: Verify the results
SELECT 
    COUNT(*) as total_projects,
    COUNT(CASE WHEN "resultsFramework" IS NOT NULL THEN 1 END) as projects_with_results_framework,
    COUNT(CASE WHEN "resultsFramework"->>'projectDuration' IS NOT NULL THEN 1 END) as projects_with_duration
FROM projects;
