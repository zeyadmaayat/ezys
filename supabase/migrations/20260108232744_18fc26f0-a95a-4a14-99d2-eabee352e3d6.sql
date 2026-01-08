-- Drop existing public SELECT policies on content tables
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can view topics" ON public.topics;
DROP POLICY IF EXISTS "Anyone can view abbreviations" ON public.abbreviations;

-- Create new SELECT policies requiring authentication
CREATE POLICY "Authenticated users can view categories"
ON public.categories
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view topics"
ON public.topics
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view abbreviations"
ON public.abbreviations
FOR SELECT
TO authenticated
USING (true);