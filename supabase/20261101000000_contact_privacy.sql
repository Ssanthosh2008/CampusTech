-- Migration: Enforce contact privacy for lost and found items
-- Contact details should strictly be visible only to authenticated users.

-- 1. Create a secure RPC function to retrieve contact details for a specific item
create or replace function public.get_item_contact(target_item_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  item_contact text;
begin
  -- Require authentication
  if auth.uid() is null then
    raise exception 'Authentication required to view contact details';
  end if;

  -- First check item_contacts table
  select contact into item_contact
  from public.item_contacts
  where item_id = target_item_id;

  -- Fall back to items.contact if not found in item_contacts
  if item_contact is null then
    select contact into item_contact
    from public.items
    where id = target_item_id;
  end if;

  return item_contact;
end;
$$;

-- 2. Restrict execution permissions
revoke all on function public.get_item_contact(uuid) from public, anon;
grant execute on function public.get_item_contact(uuid) to authenticated;

-- 3. Ensure item_contacts RLS strictly allows only authenticated users to select
alter table public.item_contacts enable row level security;
drop policy if exists "contacts readable by signed-in" on public.item_contacts;
create policy "contacts readable by signed-in" on public.item_contacts
  for select to authenticated using (true);

