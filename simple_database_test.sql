-- Simple database test - run each query separately

-- Query 1: Check table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'meal_indicators' 
ORDER BY column_name;
