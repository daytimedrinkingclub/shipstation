-- Remove screenshot_url column from ships table
ALTER TABLE public.ships
DROP COLUMN IF EXISTS screenshot_url;

-- Create website_likes table
CREATE TABLE public.website_likes (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  ship_slug TEXT NOT NULL REFERENCES public.ships(slug),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, ship_slug)
);

-- Add index for faster queries
CREATE INDEX idx_website_likes_ship_slug ON public.website_likes(ship_slug);

-- Add likes_count column to ships table
ALTER TABLE public.ships
ADD COLUMN likes_count INTEGER DEFAULT 0;

-- Create function to update likes_count
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.ships
    SET likes_count = likes_count + 1
    WHERE slug = NEW.ship_slug;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.ships
    SET likes_count = likes_count - 1
    WHERE slug = OLD.ship_slug;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update likes_count
CREATE TRIGGER update_ship_likes_count
AFTER INSERT OR DELETE ON public.website_likes
FOR EACH ROW EXECUTE FUNCTION update_likes_count();