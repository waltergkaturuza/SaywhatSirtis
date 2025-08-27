-- ULTRA SAFE SUPABASE MIGRATION SCRIPT
-- This script checks for table existence before doing anything
-- Run this in Supabase SQL Editor at: https://yuwwqupyqpmkbqzvqiee.supabase.co

-- Test connection
SELECT 'Database connection successful!' as status, now() as timestamp;

-- Show existing tables
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- =============================================
-- STEP 1: CREATE MISSING TABLES
-- =============================================

-- Create activities table
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

-- Create events table
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

-- Create call_records table
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

-- Create employees table
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

-- Create system_configs table
CREATE TABLE IF NOT EXISTS "public"."system_configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "category" TEXT DEFAULT 'general',
    "isPublic" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "system_configs_pkey" PRIMARY KEY ("id")
);

-- Create assets table
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
    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- Create documents table
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

-- Create notifications table
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

-- Create audit_logs table
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
-- STEP 2: ADD MISSING COLUMNS TO EXISTING TABLES
-- =============================================

-- Add columns to users table (only if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
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
        
        RAISE NOTICE 'Added missing columns to users table';
    ELSE
        RAISE NOTICE 'Users table does not exist - creating it';
        
        CREATE TABLE "public"."users" (
            "id" TEXT NOT NULL,
            "email" TEXT NOT NULL,
            "username" TEXT,
            "firstName" TEXT,
            "lastName" TEXT,
            "roles" TEXT[] DEFAULT '{}',
            "department" TEXT,
            "position" TEXT,
            "isActive" BOOLEAN DEFAULT true,
            "lastLogin" TIMESTAMP(3),
            "phoneNumber" TEXT,
            "profileImage" TEXT,
            "bio" TEXT,
            "location" TEXT,
            "twoFactorEnabled" BOOLEAN DEFAULT false,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "users_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

-- Add columns to projects table (only if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects' AND table_schema = 'public') THEN
        ALTER TABLE "public"."projects" 
        ADD COLUMN IF NOT EXISTS "priority" TEXT DEFAULT 'MEDIUM',
        ADD COLUMN IF NOT EXISTS "progress" INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "timeframe" TEXT,
        ADD COLUMN IF NOT EXISTS "country" TEXT,
        ADD COLUMN IF NOT EXISTS "province" TEXT,
        ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'USD',
        ADD COLUMN IF NOT EXISTS "objectives" JSONB,
        ADD COLUMN IF NOT EXISTS "creatorId" TEXT;
        
        RAISE NOTICE 'Added missing columns to projects table';
    ELSE
        RAISE NOTICE 'Projects table does not exist - creating it';
        
        CREATE TABLE "public"."projects" (
            "id" TEXT NOT NULL,
            "title" TEXT NOT NULL,
            "description" TEXT,
            "status" TEXT DEFAULT 'PLANNING',
            "priority" TEXT DEFAULT 'MEDIUM',
            "progress" INTEGER DEFAULT 0,
            "timeframe" TEXT,
            "country" TEXT,
            "province" TEXT,
            "currency" TEXT DEFAULT 'USD',
            "objectives" JSONB,
            "budget" REAL,
            "startDate" TIMESTAMP(3),
            "endDate" TIMESTAMP(3),
            "creatorId" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

-- =============================================
-- STEP 3: CREATE INDEXES
-- =============================================

-- Create all indexes safely
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "public"."users"("email");
CREATE INDEX IF NOT EXISTS "users_department_idx" ON "public"."users"("department");
CREATE INDEX IF NOT EXISTS "projects_status_idx" ON "public"."projects"("status");
CREATE INDEX IF NOT EXISTS "projects_priority_idx" ON "public"."projects"("priority");
CREATE INDEX IF NOT EXISTS "activities_projectId_idx" ON "public"."activities"("projectId");
CREATE INDEX IF NOT EXISTS "activities_status_idx" ON "public"."activities"("status");
CREATE INDEX IF NOT EXISTS "call_records_status_idx" ON "public"."call_records"("status");
CREATE INDEX IF NOT EXISTS "call_records_caseNumber_idx" ON "public"."call_records"("caseNumber");
CREATE INDEX IF NOT EXISTS "employees_employeeId_idx" ON "public"."employees"("employeeId");
CREATE INDEX IF NOT EXISTS "employees_department_idx" ON "public"."employees"("department");

-- =============================================
-- STEP 4: INSERT DEFAULT DATA
-- =============================================

-- Insert default system configurations
INSERT INTO "public"."system_configs" ("id", "key", "value", "description", "category", "isPublic")
VALUES 
    ('sys_org_name', 'organization_name', '"SAYWHAT"', 'Organization name', 'general', true),
    ('sys_timezone', 'timezone', '"UTC"', 'System timezone', 'general', false),
    ('sys_currency', 'default_currency', '"USD"', 'Default currency', 'general', false),
    ('sys_language', 'default_language', '"en"', 'Default language', 'general', true),
    ('sys_theme', 'default_theme', '"light"', 'Default UI theme', 'general', true)
ON CONFLICT ("key") DO NOTHING;

-- =============================================
-- STEP 5: SHOW RESULTS
-- =============================================

-- Show migration results
SELECT 'Migration completed successfully!' as status;

-- Show all tables that now exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Show detailed column structure for key tables
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('users', 'projects', 'activities', 'events', 'call_records', 'employees')
ORDER BY table_name, ordinal_position;
