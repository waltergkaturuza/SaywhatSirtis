-- Department Model Migration Script
-- Creates the Department table and migrates existing employee departments
-- SAYWHAT SIRTIS HR System - Department Enhancement

-- Create Department table with proper structure (using Prisma naming convention)
CREATE TABLE IF NOT EXISTS "Department" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT,
    "manager" TEXT,
    "budget" DECIMAL(15,2),
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create unique index on department name
CREATE UNIQUE INDEX IF NOT EXISTS "Department_name_key" ON "Department"("name");

-- Create unique index on department code (if provided)
CREATE UNIQUE INDEX IF NOT EXISTS "Department_code_key" ON "Department"("code") WHERE "code" IS NOT NULL;

-- Insert default departments based on existing employee departments
-- This will extract unique departments from the current Employee table
INSERT INTO "Department" ("id", "name", "status") 
SELECT 
    'dept_' || LOWER(REPLACE(TRIM(department), ' ', '_')) || '_' || substr(md5(random()::text), 1, 8) as id,
    TRIM(department) as name,
    'ACTIVE' as status
FROM (
    SELECT DISTINCT department 
    FROM "Employee" 
    WHERE department IS NOT NULL 
    AND TRIM(department) != ''
) unique_depts
WHERE NOT EXISTS (
    SELECT 1 FROM "Department" WHERE "name" = TRIM(unique_depts.department)
);

-- Add departmentId column to Employee table
ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "departmentId" TEXT;

-- Update existing employees to reference the new Department table
UPDATE "Employee" 
SET "departmentId" = (
    SELECT "id" 
    FROM "Department" 
    WHERE "Department"."name" = TRIM("Employee"."department")
)
WHERE "department" IS NOT NULL 
AND TRIM("department") != ''
AND "departmentId" IS NULL;

-- Add foreign key constraint
-- Note: This is PostgreSQL syntax, adjust for your database if needed
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Employee_departmentId_fkey'
    ) THEN
        ALTER TABLE "Employee" 
        ADD CONSTRAINT "Employee_departmentId_fkey" 
        FOREIGN KEY ("departmentId") 
        REFERENCES "Department"("id") 
        ON DELETE SET NULL 
        ON UPDATE CASCADE;
    END IF;
END $$;
-- Note: This is optional and depends on your database setup

-- Create trigger to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_department_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_department_updated_at_trigger ON "Department";
CREATE TRIGGER update_department_updated_at_trigger
    BEFORE UPDATE ON "Department"
    FOR EACH ROW
    EXECUTE FUNCTION update_department_updated_at();

-- Insert some sample departments if none exist
INSERT INTO "Department" ("id", "name", "description", "code", "status") 
VALUES 
    ('dept_hr_default', 'Human Resources', 'Manages employee relations, recruitment, and HR policies', 'HR', 'ACTIVE'),
    ('dept_edo_default', 'Executive Directors Office', 'Executive leadership and strategic oversight', 'EDO', 'ACTIVE'),
    ('dept_rd_default', 'Executive Directors Office - Research and Development', 'Research and Development initiatives', 'R&D', 'ACTIVE'),
    ('dept_finance_default', 'Finance and Administration', 'Handles financial planning, accounting, and administration', 'FIN', 'ACTIVE'),
    ('dept_programs_default', 'Programs', 'Manages program implementation and monitoring', 'PROG', 'ACTIVE'),
    ('dept_gc_default', 'Grants and Compliance', 'Grant management and regulatory compliance', 'GC', 'ACTIVE'),
    ('dept_ca_default', 'Communications and Advocacy', 'Communications, outreach and advocacy activities', 'C&A', 'ACTIVE')
ON CONFLICT ("name") DO NOTHING;

-- Report migration results
SELECT 
    'Department Migration Complete' as status,
    (SELECT COUNT(*) FROM "Department") as total_departments,
    (SELECT COUNT(*) FROM "Employee" WHERE "departmentId" IS NOT NULL) as employees_with_departments,
    (SELECT COUNT(*) FROM "Employee" WHERE "departmentId" IS NULL) as employees_without_departments;

-- Show created departments
SELECT "id", "name", "code", "status", "createdAt" 
FROM "Department" 
ORDER BY "name";
-- ALTER TABLE employees ADD CONSTRAINT fk_employee_department 
-- FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;
