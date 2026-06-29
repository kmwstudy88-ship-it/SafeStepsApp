-- SafeSteps core platform schema.
-- This migration creates the first usable product tables for the Expo app.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'parent' check (role in ('parent', 'worker', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.program_enrollments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  program_id text not null,
  status text not null default 'active' check (status in ('active', 'paused', 'completed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (owner_id, program_id)
);

create table if not exists public.user_tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  status text not null default 'ready' check (status in ('ready', 'in_progress', 'completed')),
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.evidence_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  notes text not null default '',
  file_path text,
  status text not null default 'stored' check (status in ('draft', 'stored', 'shared')),
  created_at timestamptz not null default now()
);

create table if not exists public.progress_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  label text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security invoker
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update
  set
    email = excluded.email,
    updated_at = now();

  insert into public.users (auth_user_id, role)
  values (new.id, 'parent')
  on conflict (auth_user_id) do update
  set role = public.users.role;

  return new;
exception when others then
  raise log 'SafeSteps handle_new_user failed for %: %', new.id, sqlerrm;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.program_enrollments enable row level security;
alter table public.user_tasks enable row level security;
alter table public.evidence_items enable row level security;
alter table public.progress_events enable row level security;

drop policy if exists "Profiles are visible to owners" on public.profiles;
create policy "Profiles are visible to owners"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Profiles can be updated by owners" on public.profiles;
create policy "Profiles can be updated by owners"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Enrollments are visible to owners" on public.program_enrollments;
create policy "Enrollments are visible to owners"
on public.program_enrollments for select
to authenticated
using ((select auth.uid()) = owner_id);

drop policy if exists "Enrollments can be created by owners" on public.program_enrollments;
create policy "Enrollments can be created by owners"
on public.program_enrollments for insert
to authenticated
with check ((select auth.uid()) = owner_id);

drop policy if exists "Enrollments can be updated by owners" on public.program_enrollments;
create policy "Enrollments can be updated by owners"
on public.program_enrollments for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

drop policy if exists "Tasks are visible to owners" on public.user_tasks;
create policy "Tasks are visible to owners"
on public.user_tasks for select
to authenticated
using ((select auth.uid()) = owner_id);

drop policy if exists "Tasks can be created by owners" on public.user_tasks;
create policy "Tasks can be created by owners"
on public.user_tasks for insert
to authenticated
with check ((select auth.uid()) = owner_id);

drop policy if exists "Tasks can be updated by owners" on public.user_tasks;
create policy "Tasks can be updated by owners"
on public.user_tasks for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

drop policy if exists "Evidence is visible to owners" on public.evidence_items;
create policy "Evidence is visible to owners"
on public.evidence_items for select
to authenticated
using ((select auth.uid()) = owner_id);

drop policy if exists "Evidence can be created by owners" on public.evidence_items;
create policy "Evidence can be created by owners"
on public.evidence_items for insert
to authenticated
with check ((select auth.uid()) = owner_id);

drop policy if exists "Evidence can be updated by owners" on public.evidence_items;
create policy "Evidence can be updated by owners"
on public.evidence_items for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

drop policy if exists "Progress is visible to owners" on public.progress_events;
create policy "Progress is visible to owners"
on public.progress_events for select
to authenticated
using ((select auth.uid()) = owner_id);

drop policy if exists "Progress can be created by owners" on public.progress_events;
create policy "Progress can be created by owners"
on public.progress_events for insert
to authenticated
with check ((select auth.uid()) = owner_id);
