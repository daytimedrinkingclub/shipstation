-- Step 1: Add new ship_id column to the tables
ALTER TABLE public.code_versions ADD COLUMN ship_id INTEGER;
ALTER TABLE public.code_refining_conversations ADD COLUMN ship_id INTEGER;
ALTER TABLE public.website_likes ADD COLUMN ship_id INTEGER;

-- Step 2: Update the new ship_id columns with the corresponding id from ships table
UPDATE public.code_versions cv
SET ship_id = s.id
FROM public.ships s
WHERE cv.ship_slug = s.slug;

UPDATE public.code_refining_conversations crc
SET ship_id = s.id
FROM public.ships s
WHERE crc.ship_slug = s.slug;

UPDATE public.website_likes wl
SET ship_id = s.id
FROM public.ships s
WHERE wl.ship_slug = s.slug;

-- Step 3: Drop the old foreign key constraints
ALTER TABLE public.code_versions DROP CONSTRAINT fk_code_versions_ship_slug;
ALTER TABLE public.code_refining_conversations DROP CONSTRAINT fk_code_refining_conversations_ship_slug;
ALTER TABLE public.website_likes DROP CONSTRAINT website_likes_ship_slug_fkey;

-- Step 4: Add new foreign key constraints
ALTER TABLE public.code_versions
ADD CONSTRAINT fk_code_versions_ship_id FOREIGN KEY (ship_id) REFERENCES public.ships(id);

ALTER TABLE public.code_refining_conversations
ADD CONSTRAINT fk_code_refining_conversations_ship_id FOREIGN KEY (ship_id) REFERENCES public.ships(id);

ALTER TABLE public.website_likes
ADD CONSTRAINT fk_website_likes_ship_id FOREIGN KEY (ship_id) REFERENCES public.ships(id);

-- Step 5: Drop the old ship_slug columns
ALTER TABLE public.code_versions DROP COLUMN ship_slug;
ALTER TABLE public.code_refining_conversations DROP COLUMN ship_slug;
ALTER TABLE public.website_likes DROP COLUMN ship_slug;

-- Step 6: Recreate indexes with new column
DROP INDEX IF EXISTS idx_code_versions_ship_slug;
CREATE INDEX idx_code_versions_ship_id ON public.code_versions(ship_id);

DROP INDEX IF EXISTS idx_code_refining_conversations_ship_slug;
CREATE INDEX idx_code_refining_conversations_ship_id ON public.code_refining_conversations(ship_id);

DROP INDEX IF EXISTS idx_website_likes_ship_slug;
CREATE INDEX idx_website_likes_ship_id ON public.website_likes(ship_id);

-- Step 7: Update the unique constraint for website_likes
DO $$
BEGIN
  -- Check if the constraint exists before trying to drop it
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'website_likes_user_id_ship_slug_key'
      AND table_name = 'website_likes'
  ) THEN
    ALTER TABLE public.website_likes
    DROP CONSTRAINT website_likes_user_id_ship_slug_key;
  END IF;

  -- Add the new constraint
  ALTER TABLE public.website_likes
  ADD CONSTRAINT website_likes_user_id_ship_id_key UNIQUE (user_id, ship_id);
END $$;

-- Step 8: Update the trigger function for website_likes
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.ships
    SET likes_count = likes_count + 1
    WHERE id = NEW.ship_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.ships
    SET likes_count = likes_count - 1
    WHERE id = OLD.ship_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
