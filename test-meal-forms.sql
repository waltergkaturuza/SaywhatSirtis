-- Test script to check the data types and structure
-- Check meal_forms table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'meal_forms' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check projects table structure  
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check users table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test a simple query to see if the joins work
SELECT 
  f.id, f.name, f.project_id,
  p.id as project_id_from_projects,
  p.name as project_name
FROM public.meal_forms f
LEFT JOIN public.projects p ON f.project_id::text = p.id
LIMIT 5;
