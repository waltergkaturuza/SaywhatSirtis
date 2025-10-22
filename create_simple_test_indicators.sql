-- Create simple test indicators without project dependency
-- Run this in your Supabase SQL editor

-- Insert test indicators with a dummy project ID
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
  '00000000-0000-0000-0000-000000000000'::uuid, -- Dummy project ID
  'TEST-001',
  'Number of Beneficiaries Reached',
  'outcome',
  0,
  1000,
  0,
  'people',
  'on-track',
  'Test indicator for beneficiaries',
  'System',
  NOW(),
  '{"gender": true, "age": true}'::jsonb,
  '{"source": "surveys", "frequency": "monthly"}'::jsonb,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000'::uuid, -- Dummy project ID
  'TEST-002',
  'Training Sessions Completed',
  'output',
  0,
  50,
  0,
  'sessions',
  'on-track',
  'Test indicator for training',
  'System',
  NOW(),
  '{"type": true, "location": true}'::jsonb,
  '{"source": "attendance", "frequency": "weekly"}'::jsonb,
  NOW(),
  NOW()
);

-- Verify the indicators were created
SELECT COUNT(*) as total_indicators FROM meal_indicators;
