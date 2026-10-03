-- CampusTech admin moderation, reports, and upload safeguards
alter table public.profiles add column if not exists is_admin boolean not null default false;
alter table public.items add column if not exists contact text;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public
as $$ select coalesce((select is_admin from public.profiles where id = auth.uid()), false); $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.prevent_is_admin_change() returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if new.is_admin is distinct from old.is_admin and not public.is_admin() then
    raise exception 'Only an admin can change is_admin';
  end if;
  return new;
end;
$$;
drop trigger if exists profiles_lock_is_admin on public.profiles;
create trigger profiles_lock_is_admin before update on public.profiles for each row execute function public.prevent_is_admin_change();

-- If the Auth account has already been created in the dashboard, this marks its profile immediately.
update public.profiles set is_admin = true where lower(email) = 'admin@campustech.local';

create table if not exists public.reports(
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null check(char_length(reason) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists reports_created_idx on public.reports(created_at desc);
alter table public.reports enable row level security;

-- Replace item/return/contact write policies with owner-or-admin policies.
drop policy if exists "owners update own items" on public.items;
drop policy if exists "owners delete own items" on public.items;
create policy "owners or admins update items" on public.items for update to authenticated using(user_id=auth.uid() or public.is_admin()) with check(user_id=auth.uid() or public.is_admin());
create policy "owners or admins delete items" on public.items for delete to authenticated using(user_id=auth.uid() or public.is_admin());

drop policy if exists "owners update contact" on public.item_contacts;
create policy "owners or admins update contact" on public.item_contacts for update to authenticated using(public.is_admin() or exists(select 1 from public.items i where i.id=item_id and i.user_id=auth.uid()));
drop policy if exists "owners delete contact" on public.item_contacts;
create policy "owners or admins delete contact" on public.item_contacts for delete to authenticated using(public.is_admin() or exists(select 1 from public.items i where i.id=item_id and i.user_id=auth.uid()));

create policy "admins read all returns" on public.returns for select to authenticated using(public.is_admin());
create policy "admins update returns" on public.returns for update to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "admins delete returns" on public.returns for delete to authenticated using(public.is_admin());
create policy "admins insert returns" on public.returns for insert to authenticated with check(public.is_admin());

create policy "signed-in users report images" on public.reports for insert to authenticated with check(reporter_id=auth.uid());
create policy "admins read reports" on public.reports for select to authenticated using(public.is_admin());
create policy "admins delete reports" on public.reports for delete to authenticated using(public.is_admin());

-- Storage metadata policies are defense-in-depth; client-side validation remains the user-facing filter.
update storage.buckets set file_size_limit=2097152, allowed_mime_types=array['image/jpeg','image/png','image/webp'] where id='item-images';
drop policy if exists "authenticated upload item images" on storage.objects;
create policy "authenticated upload item images" on storage.objects for insert to authenticated with check(
  bucket_id='item-images' and (storage.foldername(name))[1]=auth.uid()::text
  and (metadata->>'mimetype') in ('image/jpeg','image/png','image/webp')
  and coalesce((metadata->>'size')::bigint, 0) <= 2097152
);
drop policy if exists "admins delete item images" on storage.objects;
create policy "admins delete item images" on storage.objects for delete to authenticated using(bucket_id='item-images' and (owner_id=auth.uid()::text or public.is_admin()));
