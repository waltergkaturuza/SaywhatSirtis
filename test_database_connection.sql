-- Test database connection and check if meal_indicators table has data
-- Run this in your Supabase SQL editor

-- 1. Check if the table exists and has the new columns
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'meal_indicators' 
ORDER BY column_name;

-- 2. Check how many indicators exist
SELECT COUNT(*) as total_indicators FROM meal_indicators;

-- 3. Show sample data from the table
SELECT 
  id,
  name,
  target,
  current,
  unit,
  status,
  last_updated_by,
  last_updated_at,
  notes,
  created_at,
  updated_at
FROM meal_indicators 
ORDER BY updated_at DESC 
LIMIT 5;

-- 4. Check if any indicators have been updated recently
SELECT 
  COUNT(*) as recently_updated,
  MAX(last_updated_at) as last_update_time
FROM meal_indicators 
WHERE last_updated_at IS NOT NULL;
