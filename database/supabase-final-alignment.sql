-- Final alignment script for Supabase database
-- This script ensures all enum fields are converted to TEXT to match Prisma schema

DO $$
BEGIN
    -- Convert projects.status from enum to TEXT
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'status' 
        AND data_type = 'USER-DEFINED'
    ) THEN
        -- First, add a temporary column
        ALTER TABLE projects ADD COLUMN status_temp TEXT;
        
        -- Copy data with CAST
        UPDATE projects SET status_temp = status::TEXT;
        
        -- Drop the old column
        ALTER TABLE projects DROP COLUMN status;
        
        -- Rename the temp column
        ALTER TABLE projects RENAME COLUMN status_temp TO status;
        
        -- Set default value
        ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'PLANNING';
        ALTER TABLE projects ALTER COLUMN status SET NOT NULL;
        
        RAISE NOTICE 'Converted projects.status from enum to TEXT';
    END IF;
    
    -- Convert projects.priority from enum to TEXT
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'priority' 
        AND data_type = 'USER-DEFINED'
    ) THEN
        -- First, add a temporary column
        ALTER TABLE projects ADD COLUMN priority_temp TEXT;
        
        -- Copy data with CAST
        UPDATE projects SET priority_temp = priority::TEXT;
        
        -- Drop the old column
        ALTER TABLE projects DROP COLUMN priority;
        
        -- Rename the temp column
        ALTER TABLE projects RENAME COLUMN priority_temp TO priority;
        
        -- Set default value
        ALTER TABLE projects ALTER COLUMN priority SET DEFAULT 'MEDIUM';
        ALTER TABLE projects ALTER COLUMN priority SET NOT NULL;
        
        RAISE NOTICE 'Converted projects.priority from enum to TEXT';
    END IF;
    
    -- Drop the enum types if they exist and are no longer used
    BEGIN
        DROP TYPE IF EXISTS "ProjectStatus" CASCADE;
        RAISE NOTICE 'Dropped ProjectStatus enum type';
    EXCEPTION
        WHEN others THEN
            RAISE NOTICE 'ProjectStatus enum type not found or in use';
    END;
    
    BEGIN
        DROP TYPE IF EXISTS "ProjectPriority" CASCADE;
        RAISE NOTICE 'Dropped ProjectPriority enum type';
    EXCEPTION
        WHEN others THEN
            RAISE NOTICE 'ProjectPriority enum type not found or in use';
    END;
    
END $$;

-- Verify the changes
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND column_name IN ('status', 'priority')
ORDER BY column_name;
