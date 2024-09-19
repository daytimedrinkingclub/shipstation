-- Create the code_versions table
CREATE TABLE public.code_versions (
    id SERIAL PRIMARY KEY,                            
    ship_slug TEXT NOT NULL,                         
    version INT NOT NULL,                            
    file_path VARCHAR(255) NOT NULL,                 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),-- Timestamp of creation
    CONSTRAINT fk_code_versions_ship_slug FOREIGN KEY (ship_slug) REFERENCES public.ships (slug)
);

-- Add an index for ship_slug to optimize queries
CREATE INDEX IF NOT EXISTS idx_code_versions_ship_slug
ON public.code_versions (ship_slug);


-- Alter the existing table to maintain consistency with other table definitions
ALTER TABLE code_refining_conversations
RENAME ship_id TO ship_slug;

-- If the table wasn't created in the public schema, move it to public
ALTER TABLE code_refining_conversations
SET SCHEMA public;

-- Drop existing constraints and recreate with new naming convention (if necessary)
ALTER TABLE public.code_refining_conversations
DROP CONSTRAINT IF EXISTS code_refining_conversations_ship_id_fkey;

-- Create the foreign key constraint linking ship_slug to ships(slug)
ALTER TABLE public.code_refining_conversations
ADD CONSTRAINT fk_code_refining_conversations_ship_slug
FOREIGN KEY (ship_slug) REFERENCES public.ships (slug);

-- Drop and recreate index with new column name
DROP INDEX IF EXISTS idx_code_refining_conversations_ship_id;
CREATE INDEX idx_code_refining_conversations_ship_slug ON public.code_refining_conversations (ship_slug);

-- Add a trigger to automatically update 'updated_at'
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger for 'updated_at' field on updates
CREATE TRIGGER update_code_refining_conversations_modtime
BEFORE UPDATE ON public.code_refining_conversations
FOR EACH ROW EXECUTE FUNCTION update_modified_column();
