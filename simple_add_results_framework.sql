-- Simple script to add resultsFramework column
-- This avoids any column name issues

-- Step 1: Add the resultsFramework column
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "resultsFramework" JSONB;

-- Step 2: Set default values for existing projects
UPDATE projects 
SET "resultsFramework" = '{"objectives": [], "projectDuration": 1}'::jsonb
WHERE "resultsFramework" IS NULL;

-- Step 3: Verify the column was added
SELECT 
    COUNT(*) as total_projects,
    COUNT(CASE WHEN "resultsFramework" IS NOT NULL THEN 1 END) as projects_with_results_framework
FROM projects;

-- Step 4: Show sample data (without ORDER BY to avoid column issues)
SELECT 
    id,
    name,
    "resultsFramework"->>'projectDuration' as project_duration,
    jsonb_array_length("resultsFramework"->'objectives') as objectives_count
FROM projects 
WHERE "resultsFramework" IS NOT NULL
LIMIT 5;
