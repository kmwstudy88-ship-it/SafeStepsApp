create table if not exists public.parent_profiles (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.reunification_cases(id) on delete cascade,
  owner_id uuid not null default auth.uid(),
  parent_role text not null default 'joint'
    check (parent_role in ('mother', 'father', 'joint', 'other_carer')),
  display_name text not null default '',
  identity jsonb not null default '{}'::jsonb,
  protective_capacities jsonb not null default '{}'::jsonb,
  risk_indicators jsonb not null default '{}'::jsonb,
  parenting_behaviors jsonb not null default '{}'::jsonb,
  engagement jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.parent_profiles enable row level security;

create unique index if not exists idx_parent_profiles_case_role
  on public.parent_profiles(case_id, parent_role);

create index if not exists idx_parent_profiles_owner_case
  on public.parent_profiles(owner_id, case_id);

drop trigger if exists set_parent_profiles_updated_at on public.parent_profiles;
create trigger set_parent_profiles_updated_at
  before update on public.parent_profiles
  for each row execute function public.set_updated_at();

drop policy if exists parent_profiles_select on public.parent_profiles;
create policy parent_profiles_select on public.parent_profiles
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists parent_profiles_insert on public.parent_profiles;
create policy parent_profiles_insert on public.parent_profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

drop policy if exists parent_profiles_update on public.parent_profiles;
create policy parent_profiles_update on public.parent_profiles
  for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
