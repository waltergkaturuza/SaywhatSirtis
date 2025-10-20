-- Add updated_by column to meal_forms table
ALTER TABLE public.meal_forms 
ADD COLUMN IF NOT EXISTS updated_by TEXT;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_meal_forms_updated_by ON public.meal_forms(updated_by);

-- Create junction table for form-project assignments
CREATE TABLE IF NOT EXISTS public.meal_form_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL,
  project_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(form_id, project_id)
);

-- Add foreign key constraints
ALTER TABLE public.meal_form_projects 
ADD CONSTRAINT fk_meal_form_projects_form_id 
FOREIGN KEY (form_id) REFERENCES public.meal_forms(id) ON DELETE CASCADE;

ALTER TABLE public.meal_form_projects 
ADD CONSTRAINT fk_meal_form_projects_project_id 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_meal_form_projects_form_id ON public.meal_form_projects(form_id);
CREATE INDEX IF NOT EXISTS idx_meal_form_projects_project_id ON public.meal_form_projects(project_id);

-- Enable RLS
ALTER TABLE public.meal_form_projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for meal_form_projects
CREATE POLICY "Users can view form projects they have access to" ON public.meal_form_projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meal_forms f 
      WHERE f.id = meal_form_projects.form_id
    )
  );

CREATE POLICY "MEAL admins can manage form projects" ON public.meal_form_projects
  FOR ALL USING (has_meal_admin());
