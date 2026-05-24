-- Revoke public execute on security definer functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;

-- Grant execute to specific roles if needed (authenticated usually needs has_role for policies)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
-- handle_new_user is only for the trigger (postgres role), so PUBLIC is definitely not needed.
