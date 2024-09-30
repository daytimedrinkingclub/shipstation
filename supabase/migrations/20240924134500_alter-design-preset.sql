-- Rename the 'name' column to 'design_name'
ALTER TABLE public.design_presets
RENAME COLUMN name TO design_name;

-- Add a new column 'design_description'
ALTER TABLE public.design_presets
ADD COLUMN design_description TEXT;
