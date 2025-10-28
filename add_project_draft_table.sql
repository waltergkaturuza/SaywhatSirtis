-- Add ProjectDraft table for draft saving functionality
-- This script safely adds the new table without affecting existing data

CREATE TABLE IF NOT EXISTS "ProjectDraft" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectCode" TEXT,
    "projectTitle" TEXT,
    "projectGoal" TEXT,
    "description" TEXT,
    "projectLead" TEXT,
    "projectTeam" JSONB,
    "selectedCategories" JSONB,
    "startDate" TEXT,
    "endDate" TEXT,
    "selectedCountries" JSONB,
    "selectedProvinces" JSONB,
    "uploadedDocuments" JSONB,
    "implementingOrganizations" JSONB,
    "selectedFrequencies" JSONB,
    "frequencyDates" JSONB,
    "selectedMethodologies" JSONB,
    "totalBudget" TEXT,
    "fundingSource" TEXT,
    "resultsFramework" JSONB,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectDraft_pkey" PRIMARY KEY ("id")
);

-- Create index on userId for better performance
CREATE INDEX IF NOT EXISTS "ProjectDraft_userId_idx" ON "ProjectDraft"("userId");

-- Add foreign key constraint to users table
ALTER TABLE "ProjectDraft" 
ADD CONSTRAINT "ProjectDraft_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add trigger to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_project_draft_updated_at 
    BEFORE UPDATE ON "ProjectDraft" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the table was created
SELECT 'ProjectDraft table created successfully' as status;
