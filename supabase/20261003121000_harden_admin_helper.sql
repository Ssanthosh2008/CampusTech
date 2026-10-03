-- Keep the security-definer admin helper callable only from RLS/policy execution.
revoke all on function public.is_admin() from public, anon, authenticated;
create index if not exists reports_item_idx on public.reports(item_id);
create index if not exists reports_reporter_idx on public.reports(reporter_id);
