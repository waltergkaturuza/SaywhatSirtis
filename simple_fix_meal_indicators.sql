-- Simple fix for meal_indicators table
-- Run this in your Supabase SQL editor

-- Add missing columns one by one
ALTER TABLE meal_indicators ADD COLUMN IF NOT EXISTS current FLOAT DEFAULT 0;
ALTER TABLE meal_indicators ADD COLUMN IF NOT EXISTS last_updated_by TEXT;
ALTER TABLE meal_indicators ADD COLUMN IF NOT EXISTS last_updated_at TIMESTAMP;
ALTER TABLE meal_indicators ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE meal_indicators ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'on-track';

-- Update existing records
UPDATE meal_indicators 
SET 
  current = 0,
  status = 'on-track',
  last_updated_at = updated_at
WHERE current IS NULL;

-- Check if columns were added successfully
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'meal_indicators' 
  AND column_name IN ('current', 'last_updated_by', 'last_updated_at', 'notes', 'status');
