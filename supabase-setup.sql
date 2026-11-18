-- Packfall: Tabellen, Rechte und Regeln (einmal im SQL-Editor ausführen)

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null unique check (char_length(name) between 3 and 16),
  created_at timestamptz not null default now()
);

create table if not exists public.saves (
  user_id uuid primary key references auth.users on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.board (
  user_id uuid primary key references auth.users on delete cascade,
  name text not null,
  best_wave int not null default 0 check (best_wave between 0 and 100000),
  total_gems bigint not null default 0,
  runs int not null default 0,
  heroes int not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.saves enable row level security;
alter table public.board enable row level security;

drop policy if exists "profiles lesen" on public.profiles;
drop policy if exists "profiles eigenes anlegen" on public.profiles;
drop policy if exists "profiles eigenes ändern" on public.profiles;
create policy "profiles lesen" on public.profiles for select using (true);
create policy "profiles eigenes anlegen" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles eigenes ändern" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "saves nur eigene" on public.saves;
create policy "saves nur eigene" on public.saves for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "board lesen" on public.board;
drop policy if exists "board eigenes anlegen" on public.board;
drop policy if exists "board eigenes ändern" on public.board;
create policy "board lesen" on public.board for select using (true);
create policy "board eigenes anlegen" on public.board for insert with check (auth.uid() = user_id);
create policy "board eigenes ändern" on public.board for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.board to anon, authenticated;
grant insert, update on public.profiles, public.board to authenticated;
grant select, insert, update on public.saves to authenticated;

-- Ist ein Spielername noch frei? (ohne Login aufrufbar)
create or replace function public.name_free(n text) returns boolean
language sql security definer set search_path = public as $$
  select not exists (select 1 from public.profiles where lower(name) = lower(n));
$$;
revoke all on function public.name_free(text) from public;
grant execute on function public.name_free(text) to anon, authenticated;
