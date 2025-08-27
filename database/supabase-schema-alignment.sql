-- SIRTIS Schema Alignment Script
-- This script ensures the Supabase database matches the updated Prisma schema
-- Run this directly in Supabase SQL Editor

-- First, let's ensure all tables exist with correct structure
-- and add any missing fields or constraints

-- =============================================
-- USERS TABLE UPDATES
-- =============================================
DO $$ 
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone_number') THEN
        ALTER TABLE users ADD COLUMN phone_number TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'department') THEN
        ALTER TABLE users ADD COLUMN department TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'position') THEN
        ALTER TABLE users ADD COLUMN position TEXT;
    END IF;
END $$;

-- =============================================
-- PROJECTS TABLE UPDATES
-- =============================================
DO $$ 
BEGIN
    -- Ensure status and priority are TEXT fields (not enums)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'status' AND data_type != 'text') THEN
        ALTER TABLE projects ALTER COLUMN status TYPE TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'priority' AND data_type != 'text') THEN
        ALTER TABLE projects ALTER COLUMN priority TYPE TEXT;
    END IF;
    
    -- Set default values
    ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'PLANNING';
    ALTER TABLE projects ALTER COLUMN priority SET DEFAULT 'MEDIUM';
    
    -- Add missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'timeframe') THEN
        ALTER TABLE projects ADD COLUMN timeframe TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'country') THEN
        ALTER TABLE projects ADD COLUMN country TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'province') THEN
        ALTER TABLE projects ADD COLUMN province TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'actual_spent') THEN
        ALTER TABLE projects ADD COLUMN actual_spent DOUBLE PRECISION DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'currency') THEN
        ALTER TABLE projects ADD COLUMN currency TEXT DEFAULT 'USD';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'objectives') THEN
        ALTER TABLE projects ADD COLUMN objectives JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'creator_id') THEN
        ALTER TABLE projects ADD COLUMN creator_id TEXT;
    END IF;
END $$;

-- =============================================
-- CALL_RECORDS TABLE UPDATES
-- =============================================
DO $$ 
BEGIN
    -- First, let's check what columns actually exist and fix naming
    -- Handle both camelCase and snake_case column names
    
    -- Check for callType vs call_type
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'call_records' AND column_name = 'calltype') THEN
        -- Rename to match Prisma expectation
        ALTER TABLE call_records RENAME COLUMN calltype TO call_type;
    END IF;
    
    -- Ensure all enum fields are converted to TEXT (using actual column names)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'call_records' AND column_name = 'call_type') THEN
        ALTER TABLE call_records ALTER COLUMN call_type TYPE TEXT;
        ALTER TABLE call_records ALTER COLUMN call_type SET DEFAULT 'INBOUND';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'call_records' AND column_name = 'calltype') THEN
        ALTER TABLE call_records ALTER COLUMN calltype TYPE TEXT;
        ALTER TABLE call_records ALTER COLUMN calltype SET DEFAULT 'INBOUND';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'call_records' AND column_name = 'category') THEN
        ALTER TABLE call_records ALTER COLUMN category TYPE TEXT;
        ALTER TABLE call_records ALTER COLUMN category SET DEFAULT 'INQUIRY';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'call_records' AND column_name = 'priority') THEN
        ALTER TABLE call_records ALTER COLUMN priority TYPE TEXT;
        ALTER TABLE call_records ALTER COLUMN priority SET DEFAULT 'MEDIUM';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'call_records' AND column_name = 'status') THEN
        ALTER TABLE call_records ALTER COLUMN status TYPE TEXT;
        ALTER TABLE call_records ALTER COLUMN status SET DEFAULT 'OPEN';
    END IF;
    
    -- Add missing fields that Prisma expects
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'call_records' AND column_name = 'subject') THEN
        ALTER TABLE call_records ADD COLUMN subject TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'call_records' AND column_name = 'description') THEN
        ALTER TABLE call_records ADD COLUMN description TEXT;
    END IF;
END $$;

-- =============================================
-- EMPLOYEES TABLE UPDATES
-- =============================================
DO $$ 
BEGIN
    -- Ensure status is TEXT field (not enum)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'status' AND data_type != 'text') THEN
        ALTER TABLE employees ALTER COLUMN status TYPE TEXT;
    END IF;
    
    -- Set default value
    ALTER TABLE employees ALTER COLUMN status SET DEFAULT 'ACTIVE';
    
    -- Add missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'date_of_birth') THEN
        ALTER TABLE employees ADD COLUMN date_of_birth TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'national_id') THEN
        ALTER TABLE employees ADD COLUMN national_id TEXT UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'address') THEN
        ALTER TABLE employees ADD COLUMN address TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'emergency_contact') THEN
        ALTER TABLE employees ADD COLUMN emergency_contact TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'contract_type') THEN
        ALTER TABLE employees ADD COLUMN contract_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'reporting_to') THEN
        ALTER TABLE employees ADD COLUMN reporting_to TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'work_location') THEN
        ALTER TABLE employees ADD COLUMN work_location TEXT;
    END IF;
END $$;

-- =============================================
-- ASSETS TABLE UPDATES
-- =============================================
DO $$ 
BEGIN
    -- Create assets table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assets') THEN
        CREATE TABLE assets (
            id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
            asset_tag TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            category TEXT,
            description TEXT,
            serial_number TEXT,
            model TEXT,
            manufacturer TEXT,
            purchase_date TIMESTAMP,
            purchase_price DOUBLE PRECISION,
            current_value DOUBLE PRECISION,
            status TEXT DEFAULT 'ACTIVE',
            location TEXT,
            assigned_to TEXT,
            last_maintenance TIMESTAMP,
            next_maintenance TIMESTAMP,
            warranty_expiry TIMESTAMP,
            rfid_tag TEXT UNIQUE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        
        -- Create indexes
        CREATE INDEX idx_assets_asset_tag ON assets(asset_tag);
        CREATE INDEX idx_assets_category ON assets(category);
        CREATE INDEX idx_assets_status ON assets(status);
        CREATE INDEX idx_assets_assigned_to ON assets(assigned_to);
    ELSE
        -- Ensure category and status are TEXT fields
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'category' AND data_type != 'text') THEN
            ALTER TABLE assets ALTER COLUMN category TYPE TEXT;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'status' AND data_type != 'text') THEN
            ALTER TABLE assets ALTER COLUMN status TYPE TEXT;
        END IF;
        
        -- Set default value
        ALTER TABLE assets ALTER COLUMN status SET DEFAULT 'ACTIVE';
    END IF;
END $$;

-- =============================================
-- PERFORMANCE_REVIEWS TABLE
-- =============================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'performance_reviews') THEN
        CREATE TABLE performance_reviews (
            id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
            employee_id TEXT NOT NULL,
            reviewer_id TEXT,
            review_date TIMESTAMP NOT NULL,
            review_period_start TIMESTAMP NOT NULL,
            review_period_end TIMESTAMP NOT NULL,
            overall_rating INTEGER,
            goals TEXT,
            achievements TEXT,
            areas_for_improvement TEXT,
            comments TEXT,
            status TEXT DEFAULT 'DRAFT',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
        );
        
        CREATE INDEX idx_performance_reviews_employee_id ON performance_reviews(employee_id);
        CREATE INDEX idx_performance_reviews_review_date ON performance_reviews(review_date);
    END IF;
END $$;

-- =============================================
-- ENSURE ALL REQUIRED INDEXES EXIST
-- =============================================

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);
CREATE INDEX IF NOT EXISTS idx_projects_start_date ON projects(start_date);
CREATE INDEX IF NOT EXISTS idx_projects_end_date ON projects(end_date);
CREATE INDEX IF NOT EXISTS idx_projects_country ON projects(country);

-- Activities indexes
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_due_date ON activities(due_date);
CREATE INDEX IF NOT EXISTS idx_activities_project_id ON activities(project_id);

-- Call records indexes
CREATE INDEX IF NOT EXISTS idx_call_records_case_number ON call_records(case_number);
CREATE INDEX IF NOT EXISTS idx_call_records_status ON call_records(status);
CREATE INDEX IF NOT EXISTS idx_call_records_priority ON call_records(priority);
CREATE INDEX IF NOT EXISTS idx_call_records_created_at ON call_records(created_at);

-- Employees indexes
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Verify table structures
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('projects', 'call_records', 'employees', 'assets', 'activities', 'events')
ORDER BY table_name, ordinal_position;

-- Show table counts
SELECT 
    'projects' as table_name, COUNT(*) as record_count FROM projects
UNION ALL
SELECT 'call_records', COUNT(*) FROM call_records
UNION ALL
SELECT 'employees', COUNT(*) FROM employees
UNION ALL
SELECT 'activities', COUNT(*) FROM activities
UNION ALL
SELECT 'events', COUNT(*) FROM events
UNION ALL
SELECT 'assets', COUNT(*) FROM assets;

NOTIFY pgsql, 'SIRTIS schema alignment completed successfully!';
