-- Update existing MEAL forms to have proper user tracking and project assignments
-- This script will fix forms created before the new system was implemented

-- 1. Update forms that have null created_by to use the System Administrator
UPDATE public.meal_forms 
SET created_by = 'e5eb3c1e-30cd-4966-928e-9b9a15b8e0f5'::uuid
WHERE created_by IS NULL;

-- 2. Update forms that have '1' as updated_by to use proper UUID
UPDATE public.meal_forms 
SET updated_by = 'e5eb3c1e-30cd-4966-928e-9b9a15b8e0f5'::uuid
WHERE updated_by = '1';

-- 3. Set updated_by to created_by for forms that don't have updated_by
UPDATE public.meal_forms 
SET updated_by = created_by
WHERE updated_by IS NULL AND created_by IS NOT NULL;

-- 4. Add project assignments for existing forms (you can customize this)
-- Example: Assign all forms to "Community Water Program" if they don't have projects
INSERT INTO public.meal_form_projects (project_id, form_id)
SELECT 
    '85764a19-3e31-4a54-8e5b-fbca45f2f560'::uuid as project_id,  -- Community Water Program ID
    id as form_id
FROM public.meal_forms 
WHERE id NOT IN (
    SELECT DISTINCT form_id FROM public.meal_form_projects
);

-- 5. Verify the updates
SELECT 
    f.name,
    f.created_by,
    f.updated_by,
    p.name as project_name,
    array_agg(mfp.project_id) as assigned_projects
FROM public.meal_forms f
LEFT JOIN public.projects p ON f.project_id = p.id
LEFT JOIN public.meal_form_projects mfp ON f.id = mfp.form_id
GROUP BY f.id, f.name, f.created_by, f.updated_by, p.name
ORDER BY f.created_at DESC;
