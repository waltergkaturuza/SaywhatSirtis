-- SIRTIS Enum to Text Conversion Script
-- This script converts remaining enum fields to TEXT to match Prisma schema
-- Run this directly in Supabase SQL Editor

-- =============================================
-- EMPLOYEES TABLE - Convert Enums to TEXT
-- =============================================
DO $$ 
BEGIN
    -- Convert gender enum to text
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'gender' AND data_type = 'USER-DEFINED') THEN
        ALTER TABLE employees ALTER COLUMN gender TYPE TEXT;
        RAISE NOTICE 'Converted employees.gender from enum to TEXT';
    END IF;
    
    -- Convert employmentType enum to text
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'employmentType' AND data_type = 'USER-DEFINED') THEN
        ALTER TABLE employees ALTER COLUMN "employmentType" TYPE TEXT;
        ALTER TABLE employees ALTER COLUMN "employmentType" SET DEFAULT 'FULL_TIME';
        RAISE NOTICE 'Converted employees.employmentType from enum to TEXT';
    END IF;
    
    -- Convert status enum to text
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'status' AND data_type = 'USER-DEFINED') THEN
        ALTER TABLE employees ALTER COLUMN status TYPE TEXT;
        ALTER TABLE employees ALTER COLUMN status SET DEFAULT 'ACTIVE';
        RAISE NOTICE 'Converted employees.status from enum to TEXT';
    END IF;
    
    -- Add missing fields that Prisma expects
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'hireDate') THEN
        ALTER TABLE employees ADD COLUMN "hireDate" TIMESTAMP;
        -- Copy startDate to hireDate for compatibility
        UPDATE employees SET "hireDate" = "startDate" WHERE "startDate" IS NOT NULL;
        RAISE NOTICE 'Added employees.hireDate field';
    END IF;
    
    -- Rename phone to phoneNumber if needed for Prisma compatibility
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'phone') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'phoneNumber') THEN
            ALTER TABLE employees RENAME COLUMN phone TO "phoneNumber";
            RAISE NOTICE 'Renamed employees.phone to phoneNumber';
        END IF;
    END IF;
END $$;

-- =============================================
-- PROJECTS TABLE - Convert Enums to TEXT
-- =============================================
DO $$ 
BEGIN
    -- Convert status enum to text
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'status' AND data_type = 'USER-DEFINED') THEN
        ALTER TABLE projects ALTER COLUMN status TYPE TEXT;
        ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'PLANNING';
        RAISE NOTICE 'Converted projects.status from enum to TEXT';
    END IF;
    
    -- Convert priority enum to text
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'priority' AND data_type = 'USER-DEFINED') THEN
        ALTER TABLE projects ALTER COLUMN priority TYPE TEXT;
        ALTER TABLE projects ALTER COLUMN priority SET DEFAULT 'MEDIUM';
        RAISE NOTICE 'Converted projects.priority from enum to TEXT';
    END IF;
    
    -- Ensure progress is integer (Prisma expects Int)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'progress' AND data_type = 'double precision') THEN
        ALTER TABLE projects ALTER COLUMN progress TYPE INTEGER USING ROUND(progress)::INTEGER;
        ALTER TABLE projects ALTER COLUMN progress SET DEFAULT 0;
        RAISE NOTICE 'Converted projects.progress from double to integer';
    END IF;
    
    -- Ensure objectives is JSONB (Prisma expects Json)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'objectives' AND data_type = 'text') THEN
        ALTER TABLE projects ALTER COLUMN objectives TYPE JSONB USING CASE 
            WHEN objectives IS NULL THEN NULL
            WHEN objectives = '' THEN NULL
            ELSE objectives::JSONB 
        END;
        RAISE NOTICE 'Converted projects.objectives from text to JSONB';
    END IF;
END $$;

-- =============================================
-- ASSETS TABLE - Ensure Correct Structure
-- =============================================
DO $$ 
BEGIN
    -- Check if assets table exists and has the right structure
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assets') THEN
        -- Ensure category and status are TEXT
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'category' AND data_type = 'USER-DEFINED') THEN
            ALTER TABLE assets ALTER COLUMN category TYPE TEXT;
            RAISE NOTICE 'Converted assets.category from enum to TEXT';
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'status' AND data_type = 'USER-DEFINED') THEN
            ALTER TABLE assets ALTER COLUMN status TYPE TEXT;
            ALTER TABLE assets ALTER COLUMN status SET DEFAULT 'ACTIVE';
            RAISE NOTICE 'Converted assets.status from enum to TEXT';
        END IF;
        
        -- Rename assetTag to asset_tag if needed
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'asset_tag') THEN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'assetTag') THEN
                ALTER TABLE assets RENAME COLUMN asset_tag TO "assetTag";
                RAISE NOTICE 'Renamed assets.asset_tag to assetTag';
            END IF;
        END IF;
    END IF;
END $$;

-- =============================================
-- DROP UNUSED ENUM TYPES (Optional - be careful)
-- =============================================
-- Uncomment these if you want to remove the old enum types completely
-- Note: Only do this after confirming all tables are converted

/*
DO $$ 
BEGIN
    -- Drop enum types if they exist and are no longer used
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EmployeeStatus') THEN
        DROP TYPE IF EXISTS "EmployeeStatus" CASCADE;
        RAISE NOTICE 'Dropped EmployeeStatus enum type';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EmploymentType') THEN
        DROP TYPE IF EXISTS "EmploymentType" CASCADE;
        RAISE NOTICE 'Dropped EmploymentType enum type';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProjectStatus') THEN
        DROP TYPE IF EXISTS "ProjectStatus" CASCADE;
        RAISE NOTICE 'Dropped ProjectStatus enum type';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProjectPriority') THEN
        DROP TYPE IF EXISTS "ProjectPriority" CASCADE;
        RAISE NOTICE 'Dropped ProjectPriority enum type';
    END IF;
END $$;
*/

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Check that all enum fields are now TEXT
SELECT 
    table_name,
    column_name,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('employees', 'projects', 'assets', 'call_records')
AND column_name IN ('status', 'priority', 'gender', 'employmentType', 'category')
ORDER BY table_name, column_name;

-- Count records in key tables
SELECT 
    'employees' as table_name, COUNT(*) as record_count FROM employees
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'call_records', COUNT(*) FROM call_records
UNION ALL
SELECT 'assets', COUNT(*) FROM assets;

NOTIFY pgsql, 'SIRTIS enum to text conversion completed successfully!';
