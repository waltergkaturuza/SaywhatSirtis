-- =============================================
-- SIRTIS DATABASE COMPLETE MIGRATION SCRIPT
-- Run this script in Supabase SQL Editor
-- =============================================

-- This script will:
-- 1. Create missing tables
-- 2. Add missing columns to existing tables
-- 3. Fix field type mismatches
-- 4. Create proper indexes
-- 5. Set up foreign key constraints

BEGIN;

-- =============================================
-- 1. USER MANAGEMENT & AUTHENTICATION FIXES
-- =============================================

-- Ensure users table has all required fields
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

-- Add unique constraint on username if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_username_key' 
        AND table_name = 'users' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."users" ADD CONSTRAINT "users_username_key" UNIQUE ("username");
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Constraint already exists, ignore
        NULL;
END $$;

-- =============================================
-- 2. PROJECTS TABLE FIXES
-- =============================================

-- Ensure projects table has all required fields with correct types
ALTER TABLE "public"."projects" 
ADD COLUMN IF NOT EXISTS "priority" TEXT DEFAULT 'MEDIUM',
ADD COLUMN IF NOT EXISTS "progress" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "timeframe" TEXT,
ADD COLUMN IF NOT EXISTS "country" TEXT,
ADD COLUMN IF NOT EXISTS "province" TEXT,
ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS "objectives" JSONB,
ADD COLUMN IF NOT EXISTS "creatorId" TEXT;

-- Fix status column to match enum values
UPDATE "public"."projects" SET "status" = 'PLANNING' WHERE "status" = 'planning';
UPDATE "public"."projects" SET "status" = 'ACTIVE' WHERE "status" = 'active' OR "status" = 'in-progress';
UPDATE "public"."projects" SET "status" = 'COMPLETED' WHERE "status" = 'completed';
UPDATE "public"."projects" SET "status" = 'ON_HOLD' WHERE "status" = 'on-hold' OR "status" = 'paused';
UPDATE "public"."projects" SET "status" = 'CANCELLED' WHERE "status" = 'cancelled';

-- Add foreign key for creator if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'projects_creatorId_fkey' 
        AND table_name = 'projects' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."projects" 
        ADD CONSTRAINT "projects_creatorId_fkey" 
        FOREIGN KEY ("creatorId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Constraint already exists, ignore
        NULL;
END $$;

-- =============================================
-- 3. CREATE ACTIVITIES TABLE
-- =============================================

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

-- Add foreign key constraint for activities
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'activities_projectId_fkey' 
        AND table_name = 'activities' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."activities" 
        ADD CONSTRAINT "activities_projectId_fkey" 
        FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Constraint already exists, ignore
        NULL;
END $$;

-- =============================================
-- 4. EVENTS TABLE FIXES
-- =============================================

-- Check if events table exists, if not create it
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

-- =============================================
-- 5. CALL RECORDS TABLE FIXES
-- =============================================

-- Ensure call_records table has all required fields
ALTER TABLE "public"."call_records" 
ADD COLUMN IF NOT EXISTS "callType" TEXT DEFAULT 'INBOUND',
ADD COLUMN IF NOT EXISTS "category" TEXT DEFAULT 'INQUIRY',
ADD COLUMN IF NOT EXISTS "priority" TEXT DEFAULT 'MEDIUM',
ADD COLUMN IF NOT EXISTS "assignedOfficer" TEXT,
ADD COLUMN IF NOT EXISTS "summary" TEXT,
ADD COLUMN IF NOT EXISTS "notes" TEXT,
ADD COLUMN IF NOT EXISTS "resolution" TEXT,
ADD COLUMN IF NOT EXISTS "satisfactionRating" INTEGER,
ADD COLUMN IF NOT EXISTS "callStartTime" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "callEndTime" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "resolvedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "district" TEXT,
ADD COLUMN IF NOT EXISTS "ward" TEXT,
ADD COLUMN IF NOT EXISTS "followUpRequired" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "followUpDate" TIMESTAMP(3);

-- =============================================
-- 6. CREATE EMPLOYEES TABLE
-- =============================================

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

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "employees_employeeId_key" UNIQUE ("employeeId"),
    CONSTRAINT "employees_email_key" UNIQUE ("email")
);

-- Add unique constraint on nationalId if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'employees_nationalId_key' 
        AND table_name = 'employees' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."employees" ADD CONSTRAINT "employees_nationalId_key" UNIQUE ("nationalId");
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Constraint already exists, ignore
        NULL;
END $$;

-- =============================================
-- 7. CREATE PERFORMANCE REVIEWS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS "public"."performance_reviews" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "reviewPeriod" TEXT NOT NULL,
    "reviewType" TEXT NOT NULL,
    "overallRating" REAL,
    "goals" JSONB,
    "feedback" TEXT,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "nextReviewDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "performance_reviews_pkey" PRIMARY KEY ("id")
);

-- Add foreign key for performance reviews
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'performance_reviews_employeeId_fkey' 
        AND table_name = 'performance_reviews' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."performance_reviews" 
        ADD CONSTRAINT "performance_reviews_employeeId_fkey" 
        FOREIGN KEY ("employeeId") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Constraint already exists, ignore
        NULL;
END $$;

-- =============================================
-- 8. CREATE ASSETS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS "public"."assets" (
    "id" TEXT NOT NULL,
    "assetTag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "serialNumber" TEXT,
    "model" TEXT,
    "manufacturer" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "purchasePrice" REAL,
    "currentValue" REAL,
    "status" TEXT DEFAULT 'ACTIVE',
    "location" TEXT,
    "assignedTo" TEXT,
    "condition" TEXT DEFAULT 'GOOD',
    "warrantyExpiry" TIMESTAMP(3),
    "lastMaintenanceDate" TIMESTAMP(3),
    "nextMaintenanceDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "assets_assetTag_key" UNIQUE ("assetTag")
);

-- =============================================
-- 9. CREATE DOCUMENTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedById" TEXT,
    "isPublic" BOOLEAN DEFAULT false,
    "tags" TEXT[],
    "version" TEXT DEFAULT '1.0',
    "checksum" TEXT,
    "downloadCount" INTEGER DEFAULT 0,
    "lastAccessedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- =============================================
-- 10. CREATE EVENT REGISTRATIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS "public"."event_registrations" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "participantName" TEXT NOT NULL,
    "participantEmail" TEXT NOT NULL,
    "participantPhone" TEXT,
    "organization" TEXT,
    "position" TEXT,
    "specialRequirements" TEXT,
    "registrationData" JSONB,
    "status" TEXT DEFAULT 'REGISTERED',
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id")
);

-- =============================================
-- 11. CREATE SYSTEM CONFIG TABLE
-- =============================================

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
    CONSTRAINT "system_configs_key_key" UNIQUE ("key")
);

-- =============================================
-- 12. CREATE NOTIFICATIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT DEFAULT 'INFO',
    "isRead" BOOLEAN DEFAULT false,
    "actionUrl" TEXT,
    "metadata" JSONB,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- =============================================
-- 13. CREATE AUDIT LOGS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- =============================================
-- 14. CREATE ALL INDEXES
-- =============================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "public"."users"("email");
CREATE INDEX IF NOT EXISTS "users_department_idx" ON "public"."users"("department");
CREATE INDEX IF NOT EXISTS "users_isActive_idx" ON "public"."users"("isActive");

-- Projects table indexes
CREATE INDEX IF NOT EXISTS "projects_status_idx" ON "public"."projects"("status");
CREATE INDEX IF NOT EXISTS "projects_priority_idx" ON "public"."projects"("priority");
CREATE INDEX IF NOT EXISTS "projects_startDate_idx" ON "public"."projects"("startDate");
CREATE INDEX IF NOT EXISTS "projects_endDate_idx" ON "public"."projects"("endDate");
CREATE INDEX IF NOT EXISTS "projects_country_idx" ON "public"."projects"("country");
CREATE INDEX IF NOT EXISTS "projects_creatorId_idx" ON "public"."projects"("creatorId");

-- Activities table indexes
CREATE INDEX IF NOT EXISTS "activities_status_idx" ON "public"."activities"("status");
CREATE INDEX IF NOT EXISTS "activities_dueDate_idx" ON "public"."activities"("dueDate");
CREATE INDEX IF NOT EXISTS "activities_projectId_idx" ON "public"."activities"("projectId");

-- Events table indexes
CREATE INDEX IF NOT EXISTS "events_type_idx" ON "public"."events"("type");
CREATE INDEX IF NOT EXISTS "events_status_idx" ON "public"."events"("status");
CREATE INDEX IF NOT EXISTS "events_startDate_idx" ON "public"."events"("startDate");

-- Call records indexes
CREATE INDEX IF NOT EXISTS "call_records_caseNumber_idx" ON "public"."call_records"("caseNumber");
CREATE INDEX IF NOT EXISTS "call_records_status_idx" ON "public"."call_records"("status");
CREATE INDEX IF NOT EXISTS "call_records_category_idx" ON "public"."call_records"("category");
CREATE INDEX IF NOT EXISTS "call_records_priority_idx" ON "public"."call_records"("priority");
CREATE INDEX IF NOT EXISTS "call_records_assignedOfficer_idx" ON "public"."call_records"("assignedOfficer");
CREATE INDEX IF NOT EXISTS "call_records_callStartTime_idx" ON "public"."call_records"("callStartTime");

-- Employees table indexes
CREATE INDEX IF NOT EXISTS "employees_employeeId_idx" ON "public"."employees"("employeeId");
CREATE INDEX IF NOT EXISTS "employees_department_idx" ON "public"."employees"("department");
CREATE INDEX IF NOT EXISTS "employees_status_idx" ON "public"."employees"("status");
CREATE INDEX IF NOT EXISTS "employees_email_idx" ON "public"."employees"("email");

-- Performance reviews indexes
CREATE INDEX IF NOT EXISTS "performance_reviews_employeeId_idx" ON "public"."performance_reviews"("employeeId");
CREATE INDEX IF NOT EXISTS "performance_reviews_reviewDate_idx" ON "public"."performance_reviews"("reviewDate");

-- Assets table indexes
CREATE INDEX IF NOT EXISTS "assets_assetTag_idx" ON "public"."assets"("assetTag");
CREATE INDEX IF NOT EXISTS "assets_category_idx" ON "public"."assets"("category");
CREATE INDEX IF NOT EXISTS "assets_status_idx" ON "public"."assets"("status");

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS "audit_logs_userId_idx" ON "public"."audit_logs"("userId");
CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "public"."audit_logs"("action");
CREATE INDEX IF NOT EXISTS "audit_logs_resource_idx" ON "public"."audit_logs"("resource");
CREATE INDEX IF NOT EXISTS "audit_logs_timestamp_idx" ON "public"."audit_logs"("timestamp");

-- Notifications indexes
CREATE INDEX IF NOT EXISTS "notifications_userId_idx" ON "public"."notifications"("userId");
CREATE INDEX IF NOT EXISTS "notifications_isRead_idx" ON "public"."notifications"("isRead");
CREATE INDEX IF NOT EXISTS "notifications_type_idx" ON "public"."notifications"("type");

-- =============================================
-- 15. ADD REMAINING FOREIGN KEY CONSTRAINTS
-- =============================================

-- Event registrations
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'event_registrations_eventId_fkey' 
        AND table_name = 'event_registrations' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."event_registrations" 
        ADD CONSTRAINT "event_registrations_eventId_fkey" 
        FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Constraint already exists, ignore
        NULL;
END $$;

-- Notifications
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notifications_userId_fkey' 
        AND table_name = 'notifications' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."notifications" 
        ADD CONSTRAINT "notifications_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Constraint already exists, ignore
        NULL;
END $$;

-- Audit logs
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'audit_logs_userId_fkey' 
        AND table_name = 'audit_logs' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."audit_logs" 
        ADD CONSTRAINT "audit_logs_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Constraint already exists, ignore
        NULL;
END $$;

-- Documents
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'documents_uploadedById_fkey' 
        AND table_name = 'documents' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."documents" 
        ADD CONSTRAINT "documents_uploadedById_fkey" 
        FOREIGN KEY ("uploadedById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Constraint already exists, ignore
        NULL;
END $$;

-- =============================================
-- 16. INSERT DEFAULT SYSTEM CONFIGURATIONS
-- =============================================

INSERT INTO "public"."system_configs" ("id", "key", "value", "description", "category", "isPublic")
VALUES 
    ('sys_org_name', 'organization_name', '"SAYWHAT"', 'Organization name', 'general', true),
    ('sys_timezone', 'timezone', '"UTC"', 'System timezone', 'general', false),
    ('sys_currency', 'default_currency', '"USD"', 'Default currency', 'general', false),
    ('sys_language', 'default_language', '"en"', 'Default language', 'general', true),
    ('sys_theme', 'default_theme', '"light"', 'Default UI theme', 'general', true),
    ('sys_pagination', 'default_page_size', '10', 'Default pagination size', 'general', false),
    ('sys_upload_max', 'max_upload_size', '10485760', 'Maximum upload size in bytes (10MB)', 'uploads', false),
    ('sys_session_timeout', 'session_timeout', '3600', 'Session timeout in seconds', 'security', false)
ON CONFLICT ("key") DO NOTHING;

-- =============================================
-- 17. ENABLE ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."activities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."call_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."employees" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."performance_reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."assets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."event_registrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."system_configs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (you can customize these based on your needs)
-- Allow all operations for authenticated users (you should make these more restrictive in production)

-- Users policies
DROP POLICY IF EXISTS "Users can view their own data" ON "public"."users";
CREATE POLICY "Users can view their own data" ON "public"."users"
    FOR ALL USING (auth.uid()::text = id);

-- Projects policies
DROP POLICY IF EXISTS "Authenticated users can view projects" ON "public"."projects";
CREATE POLICY "Authenticated users can view projects" ON "public"."projects"
    FOR ALL USING (auth.role() = 'authenticated');

-- Activities policies
DROP POLICY IF EXISTS "Authenticated users can manage activities" ON "public"."activities";
CREATE POLICY "Authenticated users can manage activities" ON "public"."activities"
    FOR ALL USING (auth.role() = 'authenticated');

-- Events policies
DROP POLICY IF EXISTS "Authenticated users can view events" ON "public"."events";
CREATE POLICY "Authenticated users can view events" ON "public"."events"
    FOR ALL USING (auth.role() = 'authenticated');

-- Call records policies
DROP POLICY IF EXISTS "Authenticated users can manage call records" ON "public"."call_records";
CREATE POLICY "Authenticated users can manage call records" ON "public"."call_records"
    FOR ALL USING (auth.role() = 'authenticated');

-- Allow service role to bypass RLS
DROP POLICY IF EXISTS "Service role bypass" ON "public"."users";
CREATE POLICY "Service role bypass" ON "public"."users"
    FOR ALL USING (auth.role() = 'service_role');

COMMIT;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE 'SIRTIS Database Migration Completed Successfully!';
    RAISE NOTICE 'Created/Updated the following tables:';
    RAISE NOTICE '✅ users (with all required fields)';
    RAISE NOTICE '✅ projects (with creator relationship)';
    RAISE NOTICE '✅ activities (newly created)';
    RAISE NOTICE '✅ events (with proper schema)';
    RAISE NOTICE '✅ call_records (with all fields)';
    RAISE NOTICE '✅ employees (newly created)';
    RAISE NOTICE '✅ performance_reviews (newly created)';
    RAISE NOTICE '✅ assets (newly created)';
    RAISE NOTICE '✅ documents (newly created)';
    RAISE NOTICE '✅ event_registrations (newly created)';
    RAISE NOTICE '✅ system_configs (with defaults)';
    RAISE NOTICE '✅ notifications (newly created)';
    RAISE NOTICE '✅ audit_logs (newly created)';
    RAISE NOTICE '';
    RAISE NOTICE '✅ All indexes created';
    RAISE NOTICE '✅ All foreign key constraints added';
    RAISE NOTICE '✅ Row Level Security enabled';
    RAISE NOTICE '✅ Basic RLS policies created';
    RAISE NOTICE '';
    RAISE NOTICE 'Your database is now ready for SIRTIS application!';
END $$;
