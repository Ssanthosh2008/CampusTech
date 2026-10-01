-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- Items
create table public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('lost','found')),
  title text not null check (char_length(title) <= 100),
  description text check (char_length(description) <= 1000),
  category text not null,
  location text,
  item_date date,
  contact text,
  image_url text,
  status text not null default 'open' check (status in ('open','returned')),
  created_at timestamptz default now()
);
create index items_created_idx on public.items (created_at desc);
create index items_status_idx on public.items (status);

-- Return details (one per item)
create table public.returns (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null unique references public.items(id) on delete cascade,
  recorded_by uuid not null references public.profiles(id),
  returned_to_name text not null,
  returned_to_contact text,
  returned_on date not null default current_date,
  handover_location text,
  verification_notes text,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Mark item as returned when a return record is added
create or replace function public.mark_item_returned()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.items set status = 'returned' where id = new.item_id;
  return new;
end; $$;
create trigger on_return_created after insert on public.returns
  for each row execute function public.mark_item_returned();
revoke execute on function public.mark_item_returned() from public, anon, authenticated;

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.returns enable row level security;

create policy "profiles readable by signed-in users" on public.profiles for select to authenticated using (true);
create policy "items readable by signed-in users" on public.items for select to authenticated using (true);
create policy "users insert own items" on public.items for insert to authenticated with check (user_id = auth.uid());
create policy "owners update own items" on public.items for update to authenticated using (user_id = auth.uid());
create policy "owners delete own items" on public.items for delete to authenticated using (user_id = auth.uid());
create policy "owners read return details" on public.returns for select to authenticated using (exists (select 1 from public.items i where i.id = item_id and i.user_id = auth.uid()));
create policy "owners add return details" on public.returns for insert to authenticated with check (recorded_by = auth.uid() and exists (select 1 from public.items i where i.id = item_id and i.user_id = auth.uid()));

-- Storage bucket and policies for optional item images.
insert into storage.buckets (id, name, public) values ('item-images', 'item-images', true) on conflict (id) do update set public = true;
create policy "public can view item images" on storage.objects for select using (bucket_id = 'item-images');
create policy "signed-in users can upload item images" on storage.objects for insert to authenticated with check (bucket_id = 'item-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "owners can delete item images" on storage.objects for delete to authenticated using (bucket_id = 'item-images' and (storage.foldername(name))[1] = auth.uid()::text);
