create table if not exists public.user_data (
  user_id uuid not null references auth.users(id) on delete cascade,
  collection text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, collection)
);

alter table public.user_data enable row level security;

drop policy if exists "Users can read their own Agora data" on public.user_data;
create policy "Users can read their own Agora data"
on public.user_data for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own Agora data" on public.user_data;
create policy "Users can insert their own Agora data"
on public.user_data for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own Agora data" on public.user_data;
create policy "Users can update their own Agora data"
on public.user_data for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own Agora data" on public.user_data;
create policy "Users can delete their own Agora data"
on public.user_data for delete
using (auth.uid() = user_id);
