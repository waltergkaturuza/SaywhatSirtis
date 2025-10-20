-- Fix meal_forms.project_id column type to match projects.id (TEXT)
-- First, drop any existing foreign key constraints on project_id
ALTER TABLE public.meal_forms DROP CONSTRAINT IF EXISTS meal_forms_project_id_fkey;

-- Change the project_id column from UUID to TEXT
ALTER TABLE public.meal_forms 
ALTER COLUMN project_id TYPE TEXT;

-- Re-add the foreign key constraint with correct types
ALTER TABLE public.meal_forms 
ADD CONSTRAINT meal_forms_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_meal_forms_project_id ON public.meal_forms(project_id);
