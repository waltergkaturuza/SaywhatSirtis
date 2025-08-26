-- Create activities table manually
CREATE TABLE IF NOT EXISTS "public"."activities" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "activities_status_idx" ON "public"."activities"("status");
CREATE INDEX IF NOT EXISTS "activities_dueDate_idx" ON "public"."activities"("dueDate");
CREATE INDEX IF NOT EXISTS "activities_projectId_idx" ON "public"."activities"("projectId");

-- Add foreign key constraint
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_projectId_fkey" 
FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
