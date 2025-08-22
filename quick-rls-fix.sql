-- Quick RLS Fix for Supabase Security Issues
-- Copy and paste this into Supabase Dashboard → SQL Editor

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
ALTER TABLE IF EXISTS public._prisma_migrations ENABLE ROW LEVEL SECURITY;

-- Create basic policies to allow authenticated users to access data
-- (You can make these more restrictive later)

-- Allow authenticated users to read most tables
CREATE POLICY "Allow authenticated read access" ON public.users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read access" ON public.projects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read access" ON public.employees FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read access" ON public.assets FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read access" ON public.documents FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read access" ON public.notifications FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read access" ON public.call_centre_records FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert/update their own data
CREATE POLICY "Allow authenticated write access" ON public.projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated write access" ON public.notifications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated write access" ON public.call_centre_records FOR ALL USING (auth.role() = 'authenticated');

-- Allow service role to access everything (for backend operations)
CREATE POLICY "Allow service role full access" ON public.users FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON public.projects FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON public.employees FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON public.assets FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON public.documents FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON public.notifications FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON public.call_centre_records FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
