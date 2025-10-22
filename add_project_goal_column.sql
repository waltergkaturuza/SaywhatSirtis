-- Add projectGoal column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "projectGoal" TEXT;
