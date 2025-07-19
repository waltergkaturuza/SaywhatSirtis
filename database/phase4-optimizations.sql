-- Phase 4: Enterprise Database Optimizations
-- This file contains SQL optimizations and database improvements for production readiness

-- Performance Indexes for Critical Queries
-- User authentication and session management
CREATE INDEX IF NOT EXISTS idx_users_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON "User"(role);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON "Session"("userId");
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON "Session"("expires");

-- Employee and HR optimizations
CREATE INDEX IF NOT EXISTS idx_employees_department ON "Employee"(department);
CREATE INDEX IF NOT EXISTS idx_employees_position ON "Employee"(position);
CREATE INDEX IF NOT EXISTS idx_employees_start_date ON "Employee"("startDate");
CREATE INDEX IF NOT EXISTS idx_employees_status ON "Employee"(status);

-- Payroll performance indexes
CREATE INDEX IF NOT EXISTS idx_payroll_employee_id ON "Payroll"("employeeId");
CREATE INDEX IF NOT EXISTS idx_payroll_period ON "Payroll"("payPeriodStart", "payPeriodEnd");
CREATE INDEX IF NOT EXISTS idx_payroll_processed ON "Payroll"("processedAt");

-- Project and task management indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON "Project"(status);
CREATE INDEX IF NOT EXISTS idx_projects_start_date ON "Project"("startDate");
CREATE INDEX IF NOT EXISTS idx_projects_end_date ON "Project"("endDate");
CREATE INDEX IF NOT EXISTS idx_projects_manager ON "Project"("managerId");

-- Inventory tracking optimizations
CREATE INDEX IF NOT EXISTS idx_inventory_category ON "InventoryItem"(category);
CREATE INDEX IF NOT EXISTS idx_inventory_location ON "InventoryItem"(location);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON "InventoryItem"(status);
CREATE INDEX IF NOT EXISTS idx_inventory_last_updated ON "InventoryItem"("lastUpdated");

-- Call center performance indexes
CREATE INDEX IF NOT EXISTS idx_calls_agent_id ON "Call"("agentId");
CREATE INDEX IF NOT EXISTS idx_calls_date ON "Call"("callDate");
CREATE INDEX IF NOT EXISTS idx_calls_status ON "Call"(status);
CREATE INDEX IF NOT EXISTS idx_calls_customer_id ON "Call"("customerId");

-- Audit trail indexes for compliance
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON "AuditLog"("timestamp");
CREATE INDEX IF NOT EXISTS idx_audit_action ON "AuditLog"(action);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON "AuditLog"("entityType", "entityId");

-- Document management indexes
CREATE INDEX IF NOT EXISTS idx_documents_type ON "Document"(type);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON "Document"("uploadedBy");
CREATE INDEX IF NOT EXISTS idx_documents_upload_date ON "Document"("uploadDate");
CREATE INDEX IF NOT EXISTS idx_documents_status ON "Document"(status);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_employees_dept_status ON "Employee"(department, status);
CREATE INDEX IF NOT EXISTS idx_projects_status_manager ON "Project"(status, "managerId");
CREATE INDEX IF NOT EXISTS idx_calls_agent_date ON "Call"("agentId", "callDate");
CREATE INDEX IF NOT EXISTS idx_payroll_employee_period ON "Payroll"("employeeId", "payPeriodStart");

-- Performance monitoring views
CREATE OR REPLACE VIEW employee_performance_summary AS
SELECT 
    e.id,
    e.name,
    e.department,
    e.position,
    COUNT(p.id) as project_count,
    AVG(CASE WHEN p.status = 'completed' THEN 100 ELSE 0 END) as completion_rate,
    e."lastPerformanceReview"
FROM "Employee" e
LEFT JOIN "Project" p ON p."managerId" = e.id
WHERE e.status = 'active'
GROUP BY e.id, e.name, e.department, e.position, e."lastPerformanceReview";

-- Department productivity summary
CREATE OR REPLACE VIEW department_productivity AS
SELECT 
    department,
    COUNT(*) as employee_count,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_employees,
    AVG(salary) as avg_salary,
    COUNT(CASE WHEN "lastPerformanceReview" > NOW() - INTERVAL '1 year' THEN 1 END) as recent_reviews
FROM "Employee"
GROUP BY department;

-- Project timeline view for dashboard
CREATE OR REPLACE VIEW project_timeline AS
SELECT 
    id,
    name,
    status,
    "startDate",
    "endDate",
    "managerId",
    CASE 
        WHEN "endDate" < NOW() AND status != 'completed' THEN 'overdue'
        WHEN "endDate" - NOW() <= INTERVAL '7 days' THEN 'due_soon'
        ELSE 'on_track'
    END as timeline_status
FROM "Project"
WHERE status IN ('active', 'planning', 'in_progress');

-- Call center performance metrics
CREATE OR REPLACE VIEW call_center_metrics AS
SELECT 
    "agentId",
    DATE("callDate") as call_date,
    COUNT(*) as total_calls,
    AVG(EXTRACT(EPOCH FROM ("endTime" - "startTime"))/60) as avg_duration_minutes,
    COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_calls,
    COUNT(CASE WHEN "satisfactionRating" >= 4 THEN 1 END) as satisfied_customers
FROM "Call"
WHERE "callDate" >= NOW() - INTERVAL '30 days'
GROUP BY "agentId", DATE("callDate");

-- Monthly inventory turnover
CREATE OR REPLACE VIEW inventory_turnover AS
SELECT 
    category,
    location,
    COUNT(*) as total_items,
    COUNT(CASE WHEN status = 'in_stock' THEN 1 END) as available_items,
    COUNT(CASE WHEN "lastUpdated" > NOW() - INTERVAL '30 days' THEN 1 END) as recently_updated,
    AVG(quantity) as avg_quantity
FROM "InventoryItem"
GROUP BY category, location;

-- Database maintenance procedures
-- Auto-cleanup for old sessions (run daily)
DELETE FROM "Session" WHERE "expires" < NOW() - INTERVAL '7 days';

-- Archive old audit logs (run monthly)
-- CREATE TABLE IF NOT EXISTS "AuditLogArchive" (LIKE "AuditLog" INCLUDING ALL);
-- INSERT INTO "AuditLogArchive" SELECT * FROM "AuditLog" WHERE "timestamp" < NOW() - INTERVAL '1 year';
-- DELETE FROM "AuditLog" WHERE "timestamp" < NOW() - INTERVAL '1 year';

-- Update statistics for query optimizer
ANALYZE "User", "Employee", "Project", "Call", "InventoryItem", "Payroll", "Document", "AuditLog";

-- Connection pool settings (for application configuration)
-- Max connections: 100
-- Idle timeout: 30 seconds
-- Connection lifetime: 1 hour
-- Statement timeout: 30 seconds
