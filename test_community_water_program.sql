-- Test script to check if Community Water Program has indicators
-- This script will help us understand what data exists for this project

-- 1. Check if the project exists
SELECT 
    id,
    name,
    description,
    "resultsFramework" IS NOT NULL as has_results_framework,
    CASE 
        WHEN "resultsFramework" IS NULL THEN 'No Results Framework'
        WHEN "resultsFramework" = '{}' THEN 'Empty Results Framework'
        WHEN "resultsFramework" = 'null' THEN 'Null Results Framework'
        ELSE 'Has Results Framework'
    END as framework_status
FROM projects 
WHERE name ILIKE '%Community Water Program%' 
   OR name ILIKE '%water%' 
   OR name ILIKE '%community%'
ORDER BY "createdAt" DESC;

-- 2. If project exists, check its Results Framework structure
SELECT 
    id,
    name,
    "resultsFramework"->'objectives' as objectives,
    "resultsFramework"->'projectDuration' as project_duration,
    jsonb_array_length("resultsFramework"->'objectives') as objectives_count
FROM projects 
WHERE name ILIKE '%Community Water Program%' 
   OR name ILIKE '%water%' 
   OR name ILIKE '%community%'
ORDER BY "createdAt" DESC;

-- 3. Check if there are any indicators in the meal_indicators table
SELECT 
    COUNT(*) as total_indicators,
    COUNT(CASE WHEN project_id IS NOT NULL THEN 1 END) as indicators_with_project_id
FROM meal_indicators;

-- 4. Show sample of meal_indicators data
SELECT 
    id,
    project_id,
    name,
    level,
    target,
    current,
    unit,
    status
FROM meal_indicators 
ORDER BY created_at DESC 
LIMIT 5;
