-- Direct Supabase Connection Test and Migration
-- Use this in Supabase SQL Editor at: https://yuwwqupyqpmkbqzvqiee.supabase.co

-- Test connection first
SELECT 'Database connection successful!' as status, now() as timestamp;

-- Check existing tables
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- =============================================
-- SAFE MIGRATION - PART 1: CORE TABLES
-- =============================================

-- 1. Add missing columns to users table
ALTER TABLE "public"."users" 
ADD COLUMN IF NOT EXISTS "username" TEXT,
ADD COLUMN IF NOT EXISTS "firstName" TEXT,
ADD COLUMN IF NOT EXISTS "lastName" TEXT,
ADD COLUMN IF NOT EXISTS "roles" TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "department" TEXT,
ADD COLUMN IF NOT EXISTS "position" TEXT,
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "lastLogin" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT,
ADD COLUMN IF NOT EXISTS "profileImage" TEXT,
ADD COLUMN IF NOT EXISTS "bio" TEXT,
ADD COLUMN IF NOT EXISTS "location" TEXT,
ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN DEFAULT false;

-- 2. Add missing columns to projects table
ALTER TABLE "public"."projects" 
ADD COLUMN IF NOT EXISTS "priority" TEXT DEFAULT 'MEDIUM',
ADD COLUMN IF NOT EXISTS "progress" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "timeframe" TEXT,
ADD COLUMN IF NOT EXISTS "country" TEXT,
ADD COLUMN IF NOT EXISTS "province" TEXT,
ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS "objectives" JSONB,
ADD COLUMN IF NOT EXISTS "creatorId" TEXT;

-- 3. Create activities table if not exists
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

-- 4. Create events table if not exists
CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'meeting',
    "status" TEXT NOT NULL DEFAULT 'planning',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "location" TEXT,
    "venue" TEXT,
    "capacity" INTEGER,
    "agenda" JSONB,
    "speakers" JSONB,
    "budget" REAL,
    "actualCost" REAL DEFAULT 0,
    "requiresRegistration" BOOLEAN DEFAULT false,
    "registrationDeadline" TIMESTAMP(3),
    "partners" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- 5. Create call_records table if not exists
CREATE TABLE IF NOT EXISTS "public"."call_records" (
    "id" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "callerName" TEXT NOT NULL,
    "callerPhone" TEXT,
    "callerEmail" TEXT,
    "callType" TEXT DEFAULT 'INBOUND',
    "category" TEXT DEFAULT 'INQUIRY',
    "priority" TEXT DEFAULT 'MEDIUM',
    "status" TEXT DEFAULT 'OPEN',
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "assignedOfficer" TEXT,
    "summary" TEXT,
    "notes" TEXT,
    "resolution" TEXT,
    "satisfactionRating" INTEGER,
    "callStartTime" TIMESTAMP(3),
    "callEndTime" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "district" TEXT,
    "ward" TEXT,
    "followUpRequired" BOOLEAN DEFAULT false,
    "followUpDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "call_records_pkey" PRIMARY KEY ("id")
);

-- 6. Create employees table
CREATE TABLE IF NOT EXISTS "public"."employees" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "position" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "hireDate" TIMESTAMP(3) NOT NULL,
    "salary" REAL,
    "status" TEXT DEFAULT 'ACTIVE',
    "dateOfBirth" TIMESTAMP(3),
    "nationalId" TEXT,
    "address" TEXT,
    "emergencyContact" TEXT,
    "contractType" TEXT,
    "reportingTo" TEXT,
    "workLocation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- 7. Create system_configs table
CREATE TABLE IF NOT EXISTS "public"."system_configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "category" TEXT DEFAULT 'general',
    "isPublic" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "system_configs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "system_configs_key_unique" UNIQUE ("key")
);

-- 8. Create basic indexes
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "public"."users"("email");
CREATE INDEX IF NOT EXISTS "projects_status_idx" ON "public"."projects"("status");
CREATE INDEX IF NOT EXISTS "activities_projectId_idx" ON "public"."activities"("projectId");
CREATE INDEX IF NOT EXISTS "call_records_status_idx" ON "public"."call_records"("status");

-- 9. Insert default system configurations (safe method)
INSERT INTO "public"."system_configs" ("id", "key", "value", "description", "category", "isPublic")
SELECT 
    'sys_org_name', 'organization_name', '"SAYWHAT"'::jsonb, 'Organization name', 'general', true
WHERE NOT EXISTS (SELECT 1 FROM "public"."system_configs" WHERE "key" = 'organization_name')
UNION ALL
SELECT 
    'sys_timezone', 'timezone', '"UTC"'::jsonb, 'System timezone', 'general', false
WHERE NOT EXISTS (SELECT 1 FROM "public"."system_configs" WHERE "key" = 'timezone')
UNION ALL
SELECT 
    'sys_currency', 'default_currency', '"USD"'::jsonb, 'Default currency', 'general', false
WHERE NOT EXISTS (SELECT 1 FROM "public"."system_configs" WHERE "key" = 'default_currency');

-- Check migration results
SELECT 'Migration completed successfully!' as status;

-- Show updated table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('users', 'projects', 'activities', 'events', 'call_records', 'employees', 'system_configs')
ORDER BY table_name, ordinal_position;
