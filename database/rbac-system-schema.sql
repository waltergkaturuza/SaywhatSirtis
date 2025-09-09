-- =================================================================
-- SIRTIS Robust Role-Based Access Control (RBAC) System
-- Database Schema Implementation
-- =================================================================

-- Drop existing tables if they exist (for clean implementation)
DROP TABLE IF EXISTS user_role_assignments CASCADE;
DROP TABLE IF EXISTS role_group_memberships CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS role_groups CASCADE;
DROP TABLE IF EXISTS system_permissions CASCADE;
DROP TABLE IF EXISTS system_roles CASCADE;

-- =================================================================
-- 1. SYSTEM ROLES TABLE
-- =================================================================
CREATE TABLE system_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Role Hierarchy
    level INTEGER NOT NULL DEFAULT 1, -- 1=Basic, 2=Advanced, 3=Admin, 4=System Admin
    parent_role_id UUID REFERENCES system_roles(id),
    
    -- Role Categorization
    category VARCHAR(50) NOT NULL, -- 'user', 'department', 'system'
    department VARCHAR(100), -- Department this role belongs to
    
    -- Role Properties
    is_system_role BOOLEAN DEFAULT FALSE, -- Cannot be deleted
    is_active BOOLEAN DEFAULT TRUE,
    max_users INTEGER, -- Maximum users that can have this role
    
    -- Audit Fields
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    CONSTRAINT valid_level CHECK (level BETWEEN 1 AND 4)
);

-- Create indexes for system_roles
CREATE INDEX idx_system_roles_level ON system_roles(level);
CREATE INDEX idx_system_roles_category ON system_roles(category);
CREATE INDEX idx_system_roles_department ON system_roles(department);
CREATE INDEX idx_system_roles_active ON system_roles(is_active);

-- =================================================================
-- 2. SYSTEM PERMISSIONS TABLE
-- =================================================================
CREATE TABLE system_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Permission Categorization
    module VARCHAR(50) NOT NULL, -- 'hr', 'callcenter', 'programs', etc.
    category VARCHAR(50) NOT NULL, -- 'access', 'crud', 'admin'
    action VARCHAR(50) NOT NULL, -- 'view', 'create', 'edit', 'delete'
    
    -- Permission Scope
    scope VARCHAR(50) DEFAULT 'own', -- 'own', 'team', 'department', 'organization'
    security_level INTEGER DEFAULT 1, -- 1=Public, 2=Confidential, 3=Secret, 4=TopSecret
    
    -- Permission Properties
    is_system_permission BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    requires_approval BOOLEAN DEFAULT FALSE,
    
    -- Audit Fields
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_security_level CHECK (security_level BETWEEN 1 AND 4)
);

-- Create indexes for system_permissions
CREATE INDEX idx_system_permissions_module ON system_permissions(module);
CREATE INDEX idx_system_permissions_category ON system_permissions(category);
CREATE INDEX idx_system_permissions_action ON system_permissions(action);
CREATE INDEX idx_system_permissions_scope ON system_permissions(scope);
CREATE INDEX idx_system_permissions_security ON system_permissions(security_level);

-- =================================================================
-- 3. ROLE PERMISSIONS (Many-to-Many)
-- =================================================================
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES system_roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES system_permissions(id) ON DELETE CASCADE,
    
    -- Permission Customization
    is_granted BOOLEAN DEFAULT TRUE,
    is_inherited BOOLEAN DEFAULT FALSE, -- From parent role
    conditions JSONB, -- Custom conditions for this permission
    
    -- Audit Fields
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(role_id, permission_id)
);

-- Create indexes for role_permissions
CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);
CREATE INDEX idx_role_permissions_granted ON role_permissions(is_granted);

-- =================================================================
-- 4. ROLE GROUPS TABLE
-- =================================================================
CREATE TABLE role_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Group Properties
    group_type VARCHAR(50) DEFAULT 'custom', -- 'predefined', 'custom', 'department'
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Group Settings
    auto_assign_rules JSONB, -- Rules for automatic user assignment
    max_members INTEGER,
    
    -- Audit Fields
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for role_groups
CREATE INDEX idx_role_groups_type ON role_groups(group_type);
CREATE INDEX idx_role_groups_department ON role_groups(department);
CREATE INDEX idx_role_groups_active ON role_groups(is_active);

-- =================================================================
-- 5. ROLE GROUP MEMBERSHIPS (Groups contain Roles)
-- =================================================================
CREATE TABLE role_group_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES role_groups(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES system_roles(id) ON DELETE CASCADE,
    
    -- Membership Properties
    is_primary BOOLEAN DEFAULT FALSE, -- Primary role in the group
    priority INTEGER DEFAULT 1, -- Role priority within group
    
    -- Audit Fields
    added_by UUID REFERENCES users(id),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(group_id, role_id)
);

-- Create indexes for role_group_memberships
CREATE INDEX idx_group_memberships_group ON role_group_memberships(group_id);
CREATE INDEX idx_group_memberships_role ON role_group_memberships(role_id);

-- =================================================================
-- 6. USER ROLE ASSIGNMENTS
-- =================================================================
CREATE TABLE user_role_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES system_roles(id) ON DELETE SET NULL,
    group_id UUID REFERENCES role_groups(id) ON DELETE SET NULL,
    
    -- Assignment Properties
    assignment_type VARCHAR(50) NOT NULL, -- 'direct', 'group', 'inherited'
    is_active BOOLEAN DEFAULT TRUE,
    is_temporary BOOLEAN DEFAULT FALSE,
    
    -- Temporary Assignment
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP,
    
    -- Assignment Context
    context JSONB, -- Additional context for the assignment
    
    -- Audit Fields
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_by UUID REFERENCES users(id),
    revoked_at TIMESTAMP,
    
    CONSTRAINT assignment_target_check CHECK (
        (role_id IS NOT NULL AND group_id IS NULL) OR 
        (role_id IS NULL AND group_id IS NOT NULL)
    ),
    CONSTRAINT valid_assignment_type CHECK (
        assignment_type IN ('direct', 'group', 'inherited')
    )
);

-- Create indexes for user_role_assignments
CREATE INDEX idx_user_roles_user ON user_role_assignments(user_id);
CREATE INDEX idx_user_roles_role ON user_role_assignments(role_id);
CREATE INDEX idx_user_roles_group ON user_role_assignments(group_id);
CREATE INDEX idx_user_roles_active ON user_role_assignments(is_active);
CREATE INDEX idx_user_roles_type ON user_role_assignments(assignment_type);
CREATE INDEX idx_user_roles_valid ON user_role_assignments(valid_from, valid_until);

-- =================================================================
-- 7. VIEWS FOR EASY QUERYING
-- =================================================================

-- View: User Effective Permissions
CREATE OR REPLACE VIEW user_effective_permissions AS
SELECT DISTINCT
    u.id as user_id,
    u.email,
    u.first_name,
    u.last_name,
    sr.id as role_id,
    sr.name as role_name,
    sr.level as role_level,
    sp.id as permission_id,
    sp.name as permission_name,
    sp.module,
    sp.category,
    sp.action,
    sp.scope,
    sp.security_level,
    ura.assignment_type,
    rg.name as group_name
FROM users u
JOIN user_role_assignments ura ON u.id = ura.user_id
LEFT JOIN system_roles sr ON ura.role_id = sr.id
LEFT JOIN role_groups rg ON ura.group_id = rg.id
LEFT JOIN role_group_memberships rgm ON rg.id = rgm.group_id
LEFT JOIN system_roles sr2 ON rgm.role_id = sr2.id
JOIN role_permissions rp ON COALESCE(sr.id, sr2.id) = rp.role_id
JOIN system_permissions sp ON rp.permission_id = sp.id
WHERE ura.is_active = true
    AND (ura.valid_until IS NULL OR ura.valid_until > CURRENT_TIMESTAMP)
    AND rp.is_granted = true
    AND sr.is_active = true
    AND sp.is_active = true;

-- View: Role Hierarchy
CREATE OR REPLACE VIEW role_hierarchy AS
WITH RECURSIVE role_tree AS (
    -- Base case: roles without parents
    SELECT id, name, display_name, level, parent_role_id, 
           ARRAY[name] as path, 0 as depth
    FROM system_roles 
    WHERE parent_role_id IS NULL
    
    UNION ALL
    
    -- Recursive case: roles with parents
    SELECT sr.id, sr.name, sr.display_name, sr.level, sr.parent_role_id,
           rt.path || sr.name, rt.depth + 1
    FROM system_roles sr
    JOIN role_tree rt ON sr.parent_role_id = rt.id
)
SELECT * FROM role_tree;

-- =================================================================
-- 8. SECURITY FUNCTIONS
-- =================================================================

-- Function: Check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(
    p_user_id UUID,
    p_permission_name VARCHAR,
    p_scope VARCHAR DEFAULT 'own'
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_effective_permissions
        WHERE user_id = p_user_id
        AND permission_name = p_permission_name
        AND (scope = p_scope OR scope = 'organization')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user permissions for module
CREATE OR REPLACE FUNCTION get_user_module_permissions(
    p_user_id UUID,
    p_module VARCHAR
) RETURNS TABLE(
    permission_name VARCHAR,
    action VARCHAR,
    scope VARCHAR,
    security_level INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT 
        uep.permission_name,
        uep.action,
        uep.scope,
        uep.security_level
    FROM user_effective_permissions uep
    WHERE uep.user_id = p_user_id
    AND uep.module = p_module;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- 9. AUDIT TRIGGERS
-- =================================================================

-- Function for audit logging
CREATE OR REPLACE FUNCTION audit_rbac_changes() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (action, resource, resource_id, details)
        VALUES (TG_OP, TG_TABLE_NAME, NEW.id::text, row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (action, resource, resource_id, details)
        VALUES (TG_OP, TG_TABLE_NAME, NEW.id::text, 
                json_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW)));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (action, resource, resource_id, details)
        VALUES (TG_OP, TG_TABLE_NAME, OLD.id::text, row_to_json(OLD));
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers
CREATE TRIGGER audit_system_roles 
    AFTER INSERT OR UPDATE OR DELETE ON system_roles
    FOR EACH ROW EXECUTE FUNCTION audit_rbac_changes();

CREATE TRIGGER audit_role_permissions 
    AFTER INSERT OR UPDATE OR DELETE ON role_permissions
    FOR EACH ROW EXECUTE FUNCTION audit_rbac_changes();

CREATE TRIGGER audit_user_role_assignments 
    AFTER INSERT OR UPDATE OR DELETE ON user_role_assignments
    FOR EACH ROW EXECUTE FUNCTION audit_rbac_changes();

-- =================================================================
-- 10. INITIAL DATA SEEDING
-- =================================================================

-- Insert predefined role groups matching user requirements
INSERT INTO role_groups (name, display_name, description, group_type) VALUES
('basic_user_1', 'Basic User 1', 'Entry level access with read-only permissions', 'predefined'),
('basic_user_2', 'Basic User 2', 'Enhanced basic access with limited editing', 'predefined'),
('advance_user_1', 'Advance User 1', 'Advanced operations access with approval rights', 'predefined'),
('advance_user_2', 'Advance User 2', 'Senior advanced access with cross-department visibility', 'predefined'),
('administrator', 'Administrator', 'Department administration capabilities', 'predefined'),
('system_administrator', 'System Administrator', 'Full system access and configuration', 'predefined');

-- Insert system permissions for all modules
INSERT INTO system_permissions (name, display_name, description, module, category, action, scope, security_level) VALUES
-- Call Centre Permissions
('callcenter.view', 'View Call Centre', 'Access to view call centre data', 'callcenter', 'access', 'view', 'own', 1),
('callcenter.create', 'Create Calls', 'Create new call records', 'callcenter', 'crud', 'create', 'own', 1),
('callcenter.edit_own', 'Edit Own Calls', 'Edit own call records', 'callcenter', 'crud', 'edit', 'own', 1),
('callcenter.edit_all', 'Edit All Calls', 'Edit all call records', 'callcenter', 'crud', 'edit', 'department', 2),
('callcenter.delete', 'Delete Calls', 'Delete call records', 'callcenter', 'crud', 'delete', 'team', 3),
('callcenter.manage', 'Manage Call Centre', 'Full call centre management', 'callcenter', 'admin', 'manage', 'organization', 3),

-- HR Permissions
('hr.view', 'View HR Data', 'Access to view HR information', 'hr', 'access', 'view', 'own', 1),
('hr.employees.create', 'Create Employees', 'Add new employee records', 'hr', 'crud', 'create', 'department', 2),
('hr.employees.edit', 'Edit Employees', 'Modify employee information', 'hr', 'crud', 'edit', 'department', 2),
('hr.employees.delete', 'Delete Employees', 'Remove employee records', 'hr', 'crud', 'delete', 'department', 3),
('hr.payroll', 'Payroll Management', 'Access to payroll data', 'hr', 'admin', 'manage', 'department', 4),
('hr.performance', 'Performance Management', 'Manage performance reviews', 'hr', 'admin', 'manage', 'team', 2),

-- Programs Permissions  
('programs.view', 'View Programs', 'Access to view program data', 'programs', 'access', 'view', 'own', 1),
('programs.create', 'Create Programs', 'Create new programs', 'programs', 'crud', 'create', 'team', 2),
('programs.edit', 'Edit Programs', 'Modify program details', 'programs', 'crud', 'edit', 'team', 2),
('programs.delete', 'Delete Programs', 'Remove programs', 'programs', 'crud', 'delete', 'department', 3),
('programs.approve', 'Approve Programs', 'Approve program changes', 'programs', 'admin', 'approve', 'department', 3),

-- Document Repository Permissions
('documents.view_public', 'View Public Documents', 'Access to public documents', 'documents', 'access', 'view', 'organization', 1),
('documents.view_confidential', 'View Confidential Documents', 'Access to confidential documents', 'documents', 'access', 'view', 'department', 2),
('documents.view_secret', 'View Secret Documents', 'Access to secret documents', 'documents', 'access', 'view', 'team', 3),
('documents.view_topsecret', 'View Top Secret Documents', 'Access to top secret documents', 'documents', 'access', 'view', 'own', 4),
('documents.create', 'Create Documents', 'Upload and create documents', 'documents', 'crud', 'create', 'own', 1),
('documents.edit', 'Edit Documents', 'Modify documents', 'documents', 'crud', 'edit', 'team', 2),

-- Dashboard Permissions
('dashboard.view', 'View Dashboard', 'Access to main dashboard', 'dashboard', 'access', 'view', 'own', 1),
('dashboard.analytics', 'View Analytics', 'Access to analytics dashboard', 'dashboard', 'access', 'view', 'department', 2),
('dashboard.reports', 'Generate Reports', 'Create and view reports', 'dashboard', 'crud', 'create', 'department', 2),

-- Inventory Permissions
('inventory.view', 'View Inventory', 'Access to inventory data', 'inventory', 'access', 'view', 'own', 1),
('inventory.manage', 'Manage Inventory', 'Full inventory management', 'inventory', 'admin', 'manage', 'department', 2),

-- System Administration
('system.users', 'User Management', 'Manage system users', 'system', 'admin', 'manage', 'organization', 4),
('system.roles', 'Role Management', 'Manage roles and permissions', 'system', 'admin', 'manage', 'organization', 4),
('system.config', 'System Configuration', 'Configure system settings', 'system', 'admin', 'manage', 'organization', 4);

-- Create system roles matching the hierarchy
INSERT INTO system_roles (name, display_name, description, level, category, is_system_role) VALUES
('basic_user_1', 'Basic User 1', 'Entry level system access', 1, 'user', true),
('basic_user_2', 'Basic User 2', 'Enhanced basic system access', 1, 'user', true),
('advance_user_1', 'Advance User 1', 'Advanced operational access', 2, 'user', true),
('advance_user_2', 'Advance User 2', 'Senior advanced access', 2, 'user', true),
('administrator', 'Administrator', 'Department administrator', 3, 'department', true),
('system_administrator', 'System Administrator', 'Full system administrator', 4, 'system', true);

COMMIT;
