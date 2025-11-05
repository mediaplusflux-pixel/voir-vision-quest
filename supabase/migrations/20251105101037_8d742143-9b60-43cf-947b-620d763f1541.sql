-- Drop existing restrictive RLS policies for media_library
DROP POLICY IF EXISTS "Users can view their own media" ON public.media_library;
DROP POLICY IF EXISTS "Users can insert their own media" ON public.media_library;
DROP POLICY IF EXISTS "Users can update their own media" ON public.media_library;
DROP POLICY IF EXISTS "Users can delete their own media" ON public.media_library;
DROP POLICY IF EXISTS "Admins can view all media" ON public.media_library;

-- Create new permissive policies for anonymous access
CREATE POLICY "Anyone can view media"
ON public.media_library
FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can insert media"
ON public.media_library
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can update media"
ON public.media_library
FOR UPDATE
TO public
USING (true);

CREATE POLICY "Anyone can delete media"
ON public.media_library
FOR DELETE
TO public
USING (true);