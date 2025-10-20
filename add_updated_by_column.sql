-- Add updated_by column to meal_forms table
ALTER TABLE public.meal_forms 
ADD COLUMN IF NOT EXISTS updated_by TEXT;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_meal_forms_updated_by ON public.meal_forms(updated_by);

-- Add foreign key constraint if needed (optional)
-- ALTER TABLE public.meal_forms 
-- ADD CONSTRAINT fk_meal_forms_updated_by 
-- FOREIGN KEY (updated_by) REFERENCES public.users(id);
