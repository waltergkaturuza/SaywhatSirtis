-- Add missing fields to meal_indicators table for progress tracking and audit trail
ALTER TABLE meal_indicators ADD COLUMN IF NOT EXISTS "current" FLOAT DEFAULT 0;
ALTER TABLE meal_indicators ADD COLUMN IF NOT EXISTS "lastUpdatedBy" TEXT;
ALTER TABLE meal_indicators ADD COLUMN IF NOT EXISTS "lastUpdatedAt" TIMESTAMP;
ALTER TABLE meal_indicators ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE meal_indicators ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'on-track';

-- Update existing records to have default values
UPDATE meal_indicators 
SET 
  "current" = 0,
  "status" = 'on-track',
  "lastUpdatedAt" = "updatedAt"
WHERE "current" IS NULL;

-- Verify the changes
SELECT 
  COUNT(*) as total_indicators,
  COUNT(CASE WHEN "current" IS NOT NULL THEN 1 END) as with_current,
  COUNT(CASE WHEN "lastUpdatedBy" IS NOT NULL THEN 1 END) as with_updater,
  COUNT(CASE WHEN "lastUpdatedAt" IS NOT NULL THEN 1 END) as with_timestamp,
  COUNT(CASE WHEN "notes" IS NOT NULL THEN 1 END) as with_notes,
  COUNT(CASE WHEN "status" IS NOT NULL THEN 1 END) as with_status
FROM meal_indicators;

-- Show sample data
SELECT 
  id,
  name,
  "current",
  target,
  unit,
  "lastUpdatedBy",
  "lastUpdatedAt",
  "status",
  notes
FROM meal_indicators
LIMIT 5;
