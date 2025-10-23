-- Simple SQL script to check Community Water Program project data
-- Run this directly in your Supabase SQL editor

-- 1. Find projects with "water" or "community" in the name
SELECT 
    id,
    name,
    description,
    "createdAt",
    "resultsFramework" IS NOT NULL as has_results_framework
FROM projects 
WHERE LOWER(name) LIKE '%water%' 
   OR LOWER(name) LIKE '%community%'
   OR LOWER(name) LIKE '%community water%'
ORDER BY "createdAt" DESC;

-- 2. Check the structure of resultsFramework for any project
SELECT 
    id,
    name,
    "resultsFramework",
    jsonb_typeof("resultsFramework") as framework_type
FROM projects 
WHERE "resultsFramework" IS NOT NULL
ORDER BY "createdAt" DESC
LIMIT 3;

-- 3. Check if any project has objectives in their resultsFramework
SELECT 
    id,
    name,
    "resultsFramework"->'objectives' as objectives,
    jsonb_array_length("resultsFramework"->'objectives') as objectives_count
FROM projects 
WHERE "resultsFramework" IS NOT NULL 
  AND "resultsFramework" != '{}'
  AND "resultsFramework" != 'null'
ORDER BY "createdAt" DESC
LIMIT 5;
