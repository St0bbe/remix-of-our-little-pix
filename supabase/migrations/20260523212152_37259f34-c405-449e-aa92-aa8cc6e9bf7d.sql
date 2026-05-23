
-- 1. Lock down allowed_emails writes (only service role / definer functions can write)
CREATE POLICY "Block client inserts on allowed_emails"
ON public.allowed_emails FOR INSERT TO authenticated, anon
WITH CHECK (false);

CREATE POLICY "Block client updates on allowed_emails"
ON public.allowed_emails FOR UPDATE TO authenticated, anon
USING (false);

CREATE POLICY "Block client deletes on allowed_emails"
ON public.allowed_emails FOR DELETE TO authenticated, anon
USING (false);

-- 2. Restrict profiles SELECT to authenticated users only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT TO authenticated
USING (true);
