-- Migration: Add missing fields to performance_plans table
-- Date: 2025-10-16
-- Description: Add planTitle, startDate, endDate, workflowStatus fields to performance_plans

-- Add new columns to performance_plans table
ALTER TABLE "performance_plans" 
  ADD COLUMN IF NOT EXISTS "planTitle" TEXT DEFAULT 'Annual Plan',
  ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "workflowStatus" TEXT DEFAULT 'draft';

-- Update existing records to have default values
UPDATE "performance_plans" 
SET "workflowStatus" = 'draft' 
WHERE "workflowStatus" IS NULL;

-- Optional: Set planTitle based on planPeriod or planYear for existing records
UPDATE "performance_plans" 
SET "planTitle" = 'Annual Plan ' || "planYear"::TEXT
WHERE "planTitle" IS NULL;

-- Add comments to document the new columns
COMMENT ON COLUMN "performance_plans"."planTitle" IS 'Title of the performance plan (e.g., Annual Plan)';
COMMENT ON COLUMN "performance_plans"."startDate" IS 'Start date of the performance plan period';
COMMENT ON COLUMN "performance_plans"."endDate" IS 'End date of the performance plan period';
COMMENT ON COLUMN "performance_plans"."workflowStatus" IS 'Current workflow status of the plan (draft, submitted, supervisor_review, etc.)';

