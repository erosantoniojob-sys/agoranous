-- Execute uma vez no SQL Editor do projeto Supabase.
-- A chave composta é necessária para o upsert usado pela sincronização.
create table if not exists public.user_data (
  user_id uuid not null references auth.users(id) on delete cascade,
  collection text not null check (collection in ('media', 'learnings', 'profile', 'trails', 'chat', 'onboarding')),
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, collection)
);

-- O navegador não acessa esta tabela diretamente: somente as funções autenticadas
-- da Vercel usam a chave secreta do servidor, que ignora as políticas RLS.
alter table public.user_data enable row level security;

-- Também cobre bancos onde a tabela já existia sem a chave composta.
create unique index if not exists user_data_user_id_collection_key
on public.user_data (user_id, collection);

create or replace function public.set_user_data_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_data_updated_at on public.user_data;
create trigger set_user_data_updated_at
before update on public.user_data
for each row execute function public.set_user_data_updated_at();
