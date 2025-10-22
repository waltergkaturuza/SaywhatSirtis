-- Show sample data from the table
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
