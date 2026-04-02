-- meal_indicators was not in the initial migration; ensure the table exists for shadow DB / fresh replays.
CREATE TABLE IF NOT EXISTS "meal_indicators" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "baseline" DOUBLE PRECISION,
    "target" DOUBLE PRECISION,
    "current" DOUBLE PRECISION DEFAULT 0,
    "unit" TEXT,
    "status" TEXT DEFAULT 'on-track',
    "notes" TEXT,
    "lastUpdatedBy" TEXT,
    "lastUpdatedAt" TIMESTAMP(3),
    "disaggregation" JSONB,
    "mapping" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "meal_indicators_pkey" PRIMARY KEY ("id")
);

-- Safe when column was added manually or a previous deploy partially ran.
ALTER TABLE "meal_indicators" ADD COLUMN IF NOT EXISTS "projectId" TEXT;

CREATE INDEX IF NOT EXISTS "meal_indicators_projectId_idx" ON "meal_indicators"("projectId");
