-- Safely add conditional logic and indicator mapping columns to meal_forms table
-- This script handles existing data by providing default values

-- Add conditional logic column with default empty array
ALTER TABLE public.meal_forms 
ADD COLUMN IF NOT EXISTS conditional_logic JSONB DEFAULT '[]'::jsonb;

-- Add indicator mapping column with default empty array  
ALTER TABLE public.meal_forms 
ADD COLUMN IF NOT EXISTS indicator_mappings JSONB DEFAULT '[]'::jsonb;

-- Update existing rows to have the default values
UPDATE public.meal_forms 
SET conditional_logic = '[]'::jsonb 
WHERE conditional_logic IS NULL;

UPDATE public.meal_forms 
SET indicator_mappings = '[]'::jsonb 
WHERE indicator_mappings IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.meal_forms.conditional_logic IS 'Stores conditional logic rules for form fields (show/hide/require based on other field values)';
COMMENT ON COLUMN public.meal_forms.indicator_mappings IS 'Stores mappings between form fields and MEAL indicators for automatic data aggregation';

-- Create indexes for better performance on JSONB queries
CREATE INDEX IF NOT EXISTS idx_meal_forms_conditional_logic ON public.meal_forms USING GIN (conditional_logic);
CREATE INDEX IF NOT EXISTS idx_meal_forms_indicator_mappings ON public.meal_forms USING GIN (indicator_mappings);

-- Verify the changes
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'meal_forms' 
AND column_name IN ('conditional_logic', 'indicator_mappings')
ORDER BY column_name;
