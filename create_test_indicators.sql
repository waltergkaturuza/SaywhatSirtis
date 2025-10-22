-- Create test indicators in the meal_indicators table
-- Run this in your Supabase SQL editor

-- Insert test indicators
INSERT INTO meal_indicators (
  id,
  project_id,
  code,
  name,
  level,
  baseline,
  target,
  current,
  unit,
  status,
  notes,
  last_updated_by,
  last_updated_at,
  disaggregation,
  mapping,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  (SELECT id FROM projects LIMIT 1), -- Use first project ID
  'IND-001',
  'Number of Beneficiaries Reached',
  'outcome',
  0,
  1000,
  0,
  'people',
  'on-track',
  'Initial test indicator',
  'System',
  NOW(),
  '{"gender": true, "age": true}'::jsonb,
  '{"source": "surveys", "frequency": "monthly"}'::jsonb,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM projects LIMIT 1), -- Use first project ID
  'IND-002',
  'Training Sessions Completed',
  'output',
  0,
  50,
  0,
  'sessions',
  'on-track',
  'Training delivery indicator',
  'System',
  NOW(),
  '{"type": true, "location": true}'::jsonb,
  '{"source": "attendance", "frequency": "weekly"}'::jsonb,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM projects LIMIT 1), -- Use first project ID
  'IND-003',
  'Water Quality Tests',
  'outcome',
  0,
  500,
  0,
  'tests',
  'on-track',
  'Water quality monitoring',
  'System',
  NOW(),
  '{"location": true, "source": true}'::jsonb,
  '{"source": "lab_reports", "frequency": "monthly"}'::jsonb,
  NOW(),
  NOW()
);

-- Verify the indicators were created
SELECT COUNT(*) as total_indicators FROM meal_indicators;

-- Show the created indicators
SELECT 
  id,
  name,
  target,
  current,
  unit,
  status,
  last_updated_by,
  last_updated_at,
  notes
FROM meal_indicators 
ORDER BY created_at DESC;
