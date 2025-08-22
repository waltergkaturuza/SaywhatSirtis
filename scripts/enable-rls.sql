-- Enable Row Level Security (RLS) for all SIRTIS tables
-- This fixes the security warnings in Supabase

-- Enable RLS on all tables
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.verificationtokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.call_centre_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.call_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.call_follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.appraisals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.training_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.asset_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inventory_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users

-- Users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid()::text = id OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role IN ('ADMIN', 'SUPER_ADMIN')
    ));

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = id OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role IN ('ADMIN', 'SUPER_ADMIN')
    ));

-- Projects table policies
DROP POLICY IF EXISTS "Users can view projects based on role" ON public.projects;
CREATE POLICY "Users can view projects based on role" ON public.projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::text 
            AND (role IN ('ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER') OR id = creator_id)
        )
    );

DROP POLICY IF EXISTS "Project managers can create projects" ON public.projects;
CREATE POLICY "Project managers can create projects" ON public.projects
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::text 
            AND role IN ('ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER')
        )
    );

-- Employees table policies
DROP POLICY IF EXISTS "HR and admins can view employees" ON public.employees;
CREATE POLICY "HR and admins can view employees" ON public.employees
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::text 
            AND role IN ('ADMIN', 'SUPER_ADMIN', 'HR_MANAGER')
        )
    );

-- Assets table policies
DROP POLICY IF EXISTS "Users can view assets" ON public.assets;
CREATE POLICY "Users can view assets" ON public.assets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::text 
            AND role IN ('ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER', 'EMPLOYEE')
        )
    );

-- Call centre records policies
DROP POLICY IF EXISTS "Call centre agents can manage calls" ON public.call_centre_records;
CREATE POLICY "Call centre agents can manage calls" ON public.call_centre_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::text 
            AND role IN ('ADMIN', 'SUPER_ADMIN', 'CALL_CENTRE_AGENT')
        )
    );

-- Documents table policies
DROP POLICY IF EXISTS "Users can view public documents" ON public.documents;
CREATE POLICY "Users can view public documents" ON public.documents
    FOR SELECT USING (
        is_public = true OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::text 
            AND (role IN ('ADMIN', 'SUPER_ADMIN') OR id = uploaded_by)
        )
    );

-- Notifications table policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid()::text);

-- Audit logs (read-only for admins)
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::text 
            AND role IN ('ADMIN', 'SUPER_ADMIN')
        )
    );

-- System settings (admins only)
DROP POLICY IF EXISTS "Admins can manage system settings" ON public.system_settings;
CREATE POLICY "Admins can manage system settings" ON public.system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::text 
            AND role IN ('ADMIN', 'SUPER_ADMIN')
        )
    );

-- Generic policies for other tables (authenticated users can read, admins can modify)
DO $$
DECLARE
    table_name TEXT;
    tables TEXT[] := ARRAY[
        'accounts', 'sessions', 'verificationtokens',
        'project_activities', 'project_reports',
        'call_attachments', 'call_follow_ups',
        'departments', 'appraisals', 'leave_requests',
        'attendance_records', 'payroll_records',
        'trainings', 'training_enrollments',
        'asset_assignments', 'maintenance_records',
        'inventory_audits'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables
    LOOP
        -- Enable authenticated read access
        EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can read %I" ON public.%I', table_name, table_name);
        EXECUTE format('CREATE POLICY "Authenticated users can read %I" ON public.%I FOR SELECT USING (auth.role() = ''authenticated'')', table_name, table_name);
        
        -- Enable admin write access
        EXECUTE format('DROP POLICY IF EXISTS "Admins can manage %I" ON public.%I', table_name, table_name);
        EXECUTE format('CREATE POLICY "Admins can manage %I" ON public.%I FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role IN (''ADMIN'', ''SUPER_ADMIN'')))', table_name, table_name);
    END LOOP;
END $$;

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create a function to get current user role (useful for RLS policies)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.users WHERE id = auth.uid()::text;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;

COMMIT;
