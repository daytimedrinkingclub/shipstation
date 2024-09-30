-- Create the design_presets table
CREATE TABLE public.design_presets (
  id serial PRIMARY KEY,
  site_type VARCHAR(20) NOT NULL CHECK (site_type IN ('landing', 'portfolio')),
  name TEXT NOT NULL,
  sample_link TEXT,
  color_palette JSON NOT NULL,
  additive_prompt TEXT,
  fonts JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create a trigger to update the updated_at column on modification
CREATE TRIGGER update_design_presets_modtime
BEFORE UPDATE ON public.design_presets
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();