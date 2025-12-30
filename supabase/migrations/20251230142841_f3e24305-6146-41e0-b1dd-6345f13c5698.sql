-- Create table for allowed emails
CREATE TABLE public.allowed_emails (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can view (for checking their own email)
CREATE POLICY "Anyone can check allowed emails" 
ON public.allowed_emails 
FOR SELECT 
USING (true);

-- Insert the two allowed emails
INSERT INTO public.allowed_emails (email) VALUES 
    ('thaisapgalk@gmail.com'),
    ('emersonstobbe02@gmail.com');