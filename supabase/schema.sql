-- =====================================================
-- Lalooply Database Schema + RLS Policies
-- Run this in Supabase SQL Editor
-- =====================================================

-- -------------------------
-- profiles table
-- -------------------------
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null default 'Anon',
  coins integer not null default 60,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Profiles: readable by all authenticated users, writable only by owner
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- -------------------------
-- surveys table
-- -------------------------
create table if not exists public.surveys (
  id uuid default gen_random_uuid() primary key,
  area text not null,
  questions jsonb not null default '[]',
  asker_id uuid references public.profiles(id) on delete cascade not null,
  asker_name text not null,
  created_at timestamptz not null default now()
);

alter table public.surveys enable row level security;

-- Surveys: readable by all authenticated users, writable only by asker
create policy "surveys_select_authenticated"
  on public.surveys for select
  to authenticated
  using (true);

create policy "surveys_insert_own"
  on public.surveys for insert
  to authenticated
  with check (auth.uid() = asker_id);

create policy "surveys_update_own"
  on public.surveys for update
  to authenticated
  using (auth.uid() = asker_id);

create policy "surveys_delete_own"
  on public.surveys for delete
  to authenticated
  using (auth.uid() = asker_id);

-- -------------------------
-- answers table
-- -------------------------
create table if not exists public.answers (
  id uuid default gen_random_uuid() primary key,
  survey_id uuid references public.surveys(id) on delete cascade not null,
  responder_id uuid references public.profiles(id) on delete cascade not null,
  responder_name text not null,
  responses jsonb not null default '[]',
  created_at timestamptz not null default now(),
  unique(survey_id, responder_id)
);

alter table public.answers enable row level security;

-- Answers: readable by all authenticated users, writable only by responder
create policy "answers_select_authenticated"
  on public.answers for select
  to authenticated
  using (true);

create policy "answers_insert_own"
  on public.answers for insert
  to authenticated
  with check (auth.uid() = responder_id);

-- -------------------------
-- RPC: adjust_coins (server-side coin changes)
-- -------------------------
create or replace function public.adjust_coins(user_id uuid, amount integer)
returns void
language plpgsql
security definer
as $$
begin
  update public.profiles
  set coins = coins + amount
  where id = user_id;
end;
$$;

-- Grant execute to authenticated users
grant execute on function public.adjust_coins(uuid, integer) to authenticated;

-- -------------------------
-- Trigger: auto-create profile on auth.users insert
-- -------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, name, coins)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Anon'),
    60
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
