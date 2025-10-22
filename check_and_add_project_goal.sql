-- Check if projectGoal column exists and add it if missing
-- This script will safely add the projectGoal column to the projects table

-- First, check if the column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'projects' AND column_name = 'projectGoal';

-- Add the column if it doesn't exist
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "projectGoal" TEXT;

-- Update existing projects with a default goal if they don't have one
UPDATE projects 
SET "projectGoal" = 'To be defined' 
WHERE "projectGoal" IS NULL OR "projectGoal" = '';

-- Verify the column was added and show sample data
SELECT 
    id,
    name,
    "projectGoal",
    "createdAt"
FROM projects 
ORDER BY "createdAt" DESC 
LIMIT 5;
