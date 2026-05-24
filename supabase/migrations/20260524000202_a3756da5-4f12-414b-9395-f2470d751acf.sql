-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own photos or public photos" ON public.photos;
DROP POLICY IF EXISTS "Users can view their own albums" ON public.albums;
DROP POLICY IF EXISTS "Users can view comments on accessible photos" ON public.comments;

-- Create more permissive viewing policies for authenticated users
-- Since only allowed emails can sign up/in, all authenticated users are trusted family members
CREATE POLICY "Authenticated users can view all photos"
ON public.photos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view all albums"
ON public.albums FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view all comments"
ON public.comments FOR SELECT
TO authenticated
USING (true);

-- Update storage policies as well so they can actually see the image files
DROP POLICY IF EXISTS "Public photos are viewable by everyone" ON storage.objects;
CREATE POLICY "Authenticated users can view all photo files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'photos');
