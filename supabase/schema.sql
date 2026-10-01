create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('lost', 'found')),
  title text not null check (char_length(title) between 1 and 100),
  description text not null check (char_length(description) between 1 and 1000),
  category text not null check (char_length(category) between 1 and 40),
  location text not null check (char_length(location) between 1 and 120),
  date date not null,
  contact text not null check (char_length(contact) between 1 and 180),
  image_data text not null default '' check (char_length(image_data) <= 140000),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_name text not null default '' check (char_length(user_name) <= 180),
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now()
);

create index if not exists items_created_at_idx on public.items (created_at desc);
create index if not exists items_type_idx on public.items (type);
create index if not exists items_category_idx on public.items (category);

alter table public.items enable row level security;

create policy "Authenticated users can read items"
  on public.items for select to authenticated using (true);
create policy "Users can create their own items"
  on public.items for insert to authenticated with check (auth.uid() = user_id);
create policy "Owners can update their own items"
  on public.items for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Owners can delete their own items"
  on public.items for delete to authenticated using (auth.uid() = user_id);
