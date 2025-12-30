
-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create albums table
CREATE TABLE public.albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    cover_photo_url TEXT,
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create photos table
CREATE TABLE public.photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    album_id UUID REFERENCES public.albums(id) ON DELETE SET NULL,
    title TEXT,
    description TEXT,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    width INTEGER,
    height INTEGER,
    taken_at TIMESTAMP WITH TIME ZONE,
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    is_public BOOLEAN NOT NULL DEFAULT false,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comments table
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    photo_id UUID REFERENCES public.photos(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity_log table
CREATE TABLE public.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, display_name)
    VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'user');
    
    RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_albums_updated_at
    BEFORE UPDATE ON public.albums
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_photos_updated_at
    BEFORE UPDATE ON public.photos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for albums
CREATE POLICY "Users can view their own albums"
    ON public.albums FOR SELECT
    USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own albums"
    ON public.albums FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own albums"
    ON public.albums FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own albums"
    ON public.albums FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for photos
CREATE POLICY "Users can view their own photos or public photos"
    ON public.photos FOR SELECT
    USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can upload their own photos"
    ON public.photos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photos"
    ON public.photos FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos"
    ON public.photos FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for comments
CREATE POLICY "Users can view comments on accessible photos"
    ON public.comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.photos
            WHERE photos.id = comments.photo_id
            AND (photos.user_id = auth.uid() OR photos.is_public = true)
        )
    );

CREATE POLICY "Users can create comments"
    ON public.comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
    ON public.comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
    ON public.comments FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for activity_log
CREATE POLICY "Users can view their own activity"
    ON public.activity_log FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can log their own activity"
    ON public.activity_log FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_photos_user_id ON public.photos(user_id);
CREATE INDEX idx_photos_album_id ON public.photos(album_id);
CREATE INDEX idx_photos_created_at ON public.photos(created_at DESC);
CREATE INDEX idx_albums_user_id ON public.albums(user_id);
CREATE INDEX idx_comments_photo_id ON public.comments(photo_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at DESC);

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true);

-- Storage policies for photos bucket
CREATE POLICY "Users can view their own photos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own photos"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own photos"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own photos"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public access to photos in public bucket
CREATE POLICY "Public photos are viewable by everyone"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'photos');

-- Enable realtime for photos and comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.photos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
