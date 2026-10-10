-- Ensure RLS policies can evaluate the admin helper for both public roles.
grant execute on function public.is_admin() to anon, authenticated;
