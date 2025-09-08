-- Migration script to add supervisor, benefits, and archive fields to Employee table
-- This should be run in production database

BEGIN;

-- Add supervisor-related fields
ALTER TABLE employees ADD COLUMN IF NOT EXISTS supervisor_id TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS is_supervisor BOOLEAN DEFAULT FALSE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS is_reviewer BOOLEAN DEFAULT FALSE;

-- Add benefits fields
ALTER TABLE employees ADD COLUMN IF NOT EXISTS medical_aid BOOLEAN DEFAULT FALSE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS funeral_cover BOOLEAN DEFAULT FALSE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS vehicle_benefit BOOLEAN DEFAULT FALSE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS fuel_allowance BOOLEAN DEFAULT FALSE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS airtime_allowance BOOLEAN DEFAULT FALSE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS other_benefits TEXT[] DEFAULT '{}';

-- Add archive-related fields
ALTER TABLE employees ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS archive_reason TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS access_revoked BOOLEAN DEFAULT FALSE;

-- Create foreign key constraint for supervisor (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_employee_supervisor'
    ) THEN
        ALTER TABLE employees ADD CONSTRAINT fk_employee_supervisor 
        FOREIGN KEY (supervisor_id) REFERENCES employees(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_employees_supervisor_id ON employees(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_employees_is_supervisor ON employees(is_supervisor);
CREATE INDEX IF NOT EXISTS idx_employees_is_reviewer ON employees(is_reviewer);
CREATE INDEX IF NOT EXISTS idx_employees_archived_at ON employees(archived_at);

COMMIT;

-- Verify the migration
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'employees' 
    AND column_name IN (
        'supervisor_id', 'is_supervisor', 'is_reviewer',
        'medical_aid', 'funeral_cover', 'vehicle_benefit', 
        'fuel_allowance', 'airtime_allowance', 'other_benefits',
        'archived_at', 'archive_reason', 'access_revoked'
    )
ORDER BY column_name;
