-- Remove the public policy
DROP POLICY IF EXISTS "Anyone can check allowed emails" ON public.allowed_emails;

-- Create a policy that only allows service role to access (for edge functions)
-- No public access at all
CREATE POLICY "Only service role can access allowed emails" 
ON public.allowed_emails 
FOR SELECT 
USING (false);