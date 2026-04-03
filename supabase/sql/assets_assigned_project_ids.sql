-- Multi-project linkage for inventory assets (run on DB if column missing)
ALTER TABLE assets
  ADD COLUMN IF NOT EXISTS "assignedProjectIds" text[] NOT NULL DEFAULT '{}';
