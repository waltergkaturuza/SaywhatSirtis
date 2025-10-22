-- Fix meal_indicators table by adding missing columns
-- Run this in your Supabase SQL editor

-- Add missing columns to meal_indicators table
ALTER TABLE meal_indicators ADD COLUMN IF NOT EXISTS "current" FLOAT DEFAULT 0;
ALTER TABLE meal_indicators ADD COLUMN IF NOT EXISTS "last_updated_by" TEXT;
ALTER TABLE meal_indicators ADD COLUMN IF NOT EXISTS "last_updated_at" TIMESTAMP;
ALTER TABLE meal_indicators ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE meal_indicators ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'on-track';

-- Update existing records to have default values
UPDATE meal_indicators 
SET 
  "current" = 0,
  "status" = 'on-track',
  "last_updated_at" = "updatedAt"
WHERE "current" IS NULL;

-- Verify the columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'meal_indicators' 
  AND column_name IN ('current', 'last_updated_by', 'last_updated_at', 'notes', 'status')
ORDER BY column_name;
