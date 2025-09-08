-- Migration to add supervisor and benefits fields to Employee model
-- Execute this after updating the Prisma schema

BEGIN;

-- Add supervisor-related fields
ALTER TABLE employees ADD COLUMN supervisor_id VARCHAR;
ALTER TABLE employees ADD COLUMN is_supervisor BOOLEAN DEFAULT FALSE;
ALTER TABLE employees ADD COLUMN is_reviewer BOOLEAN DEFAULT FALSE;

-- Add benefits fields
ALTER TABLE employees ADD COLUMN medical_aid BOOLEAN DEFAULT FALSE;
ALTER TABLE employees ADD COLUMN funeral_cover BOOLEAN DEFAULT FALSE;
ALTER TABLE employees ADD COLUMN vehicle_benefit BOOLEAN DEFAULT FALSE;
ALTER TABLE employees ADD COLUMN fuel_allowance BOOLEAN DEFAULT FALSE;
ALTER TABLE employees ADD COLUMN airtime_allowance BOOLEAN DEFAULT FALSE;
ALTER TABLE employees ADD COLUMN other_benefits TEXT[];

-- Add archive-related fields
ALTER TABLE employees ADD COLUMN archived_at TIMESTAMP;
ALTER TABLE employees ADD COLUMN archive_reason VARCHAR;
ALTER TABLE employees ADD COLUMN access_revoked BOOLEAN DEFAULT FALSE;

-- Create foreign key constraint for supervisor
ALTER TABLE employees ADD CONSTRAINT fk_employee_supervisor 
  FOREIGN KEY (supervisor_id) REFERENCES employees(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_employees_supervisor_id ON employees(supervisor_id);
CREATE INDEX idx_employees_is_supervisor ON employees(is_supervisor);
CREATE INDEX idx_employees_is_reviewer ON employees(is_reviewer);
CREATE INDEX idx_employees_archived_at ON employees(archived_at);

COMMIT;
