create table if not exists public.user_data (
  user_id uuid not null references auth.users(id) on delete cascade,
  collection text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, collection)
);

-- Reparos idempotentes para projetos que executaram versões antigas deste
-- arquivo. O servidor já valida a lista de coleções; o CHECK legado impedia
-- coleções novas (como studium e journey) e deve ser removido.
alter table public.user_data
drop constraint if exists user_data_collection_check;

create unique index if not exists user_data_user_id_collection_key
on public.user_data (user_id, collection);

alter table public.user_data enable row level security;

-- As Functions usam a chave pública junto do JWT do usuário. O papel efetivo
-- é authenticated, e as policies abaixo restringem cada operação ao auth.uid().
grant select, insert, update, delete on table public.user_data to authenticated;

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
