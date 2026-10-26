-- SAFE STEPS CHILD SECTION PRIVACY LAYER
-- Creates isolated child-controlled tables with Supabase RLS.
-- Parents only see child-shared items through child_shared_items.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'child_share_audience') then
    create type public.child_share_audience as enum (
      'private',
      'parent',
      'caseworker',
      'both'
    );
  end if;
end $$;

create or replace function public.current_app_role()
returns text
language sql
stable
as $$
  select coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() -> 'user_metadata' ->> 'role',
    ''
  );
$$;

create or replace function public.is_caseworker_or_admin()
returns boolean
language sql
stable
as $$
  select public.current_app_role() in ('caseworker', 'admin', 'super_admin');
$$;

create table if not exists public.child_profiles (
  id uuid primary key default gen_random_uuid(),
  child_user_id uuid not null unique,
  display_name text,
  age_group text,
  caseworker_user_id uuid,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.child_feelings_checkins (
  id uuid primary key default gen_random_uuid(),
  child_user_id uuid not null,
  feeling text not null,
  body_signal text,
  note text,
  share_audience public.child_share_audience not null default 'private',
  created_at timestamptz not null default now()
);

create table if not exists public.child_tasks (
  id uuid primary key default gen_random_uuid(),
  child_user_id uuid not null,
  task_type text not null,
  title text not null,
  response_text text,
  share_audience public.child_share_audience not null default 'private',
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.child_evidence (
  id uuid primary key default gen_random_uuid(),
  child_user_id uuid not null,
  task_id uuid,
  lesson_id text,
  evidence_type text not null,
  title text,
  safe_description text,
  file_url text,
  metadata jsonb not null default '{}'::jsonb,
  share_audience public.child_share_audience not null default 'private',
  created_at timestamptz not null default now()
);

create table if not exists public.child_lessons_progress (
  id uuid primary key default gen_random_uuid(),
  child_user_id uuid not null,
  lesson_id text not null,
  lesson_title text not null,
  status text not null default 'not_started',
  share_audience public.child_share_audience not null default 'private',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(child_user_id, lesson_id)
);

create table if not exists public.child_visit_preparations (
  id uuid primary key default gen_random_uuid(),
  child_user_id uuid not null,
  visit_date date,
  hopes text,
  worries text,
  comfort_tools text,
  help_person text,
  share_audience public.child_share_audience not null default 'private',
  created_at timestamptz not null default now()
);

create table if not exists public.child_visit_reflections (
  id uuid primary key default gen_random_uuid(),
  child_user_id uuid not null,
  visit_date date,
  what_went_well text,
  what_felt_uncomfortable text,
  what_made_me_happy text,
  what_made_me_worried text,
  parent_work_on text,
  share_audience public.child_share_audience not null default 'private',
  created_at timestamptz not null default now()
);

create table if not exists public.child_safe_people (
  id uuid primary key default gen_random_uuid(),
  child_user_id uuid not null,
  safe_person_name text not null,
  relationship text,
  why_safe text,
  can_contact boolean not null default false,
  share_audience public.child_share_audience not null default 'private',
  created_at timestamptz not null default now()
);

create table if not exists public.child_achievements (
  id uuid primary key default gen_random_uuid(),
  child_user_id uuid not null,
  badge_title text not null,
  badge_description text,
  source_type text,
  source_id uuid,
  share_audience public.child_share_audience not null default 'private',
  earned_at timestamptz not null default now()
);

create table if not exists public.child_requests (
  id uuid primary key default gen_random_uuid(),
  child_user_id uuid not null,
  request_type text not null,
  message text,
  parent_user_id uuid,
  caseworker_user_id uuid,
  share_audience public.child_share_audience not null default 'private',
  status text not null default 'sent',
  created_at timestamptz not null default now()
);

create table if not exists public.child_shared_items (
  id uuid primary key default gen_random_uuid(),
  child_user_id uuid not null,
  item_type text not null,
  item_id uuid,
  item_title text,
  summary_text text,
  share_audience public.child_share_audience not null,
  parent_user_id uuid,
  caseworker_user_id uuid,
  shared_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);

alter table public.child_profiles enable row level security;
alter table public.child_feelings_checkins enable row level security;
alter table public.child_tasks enable row level security;
alter table public.child_evidence enable row level security;
alter table public.child_lessons_progress enable row level security;
alter table public.child_visit_preparations enable row level security;
alter table public.child_visit_reflections enable row level security;
alter table public.child_safe_people enable row level security;
alter table public.child_achievements enable row level security;
alter table public.child_requests enable row level security;
alter table public.child_shared_items enable row level security;

drop policy if exists child_profiles_select on public.child_profiles;
create policy child_profiles_select
on public.child_profiles
for select
using (
  child_user_id = auth.uid()
  or caseworker_user_id = auth.uid()
  or public.is_caseworker_or_admin()
);

drop policy if exists child_profiles_insert on public.child_profiles;
create policy child_profiles_insert
on public.child_profiles
for insert
with check (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
);

drop policy if exists child_profiles_update on public.child_profiles;
create policy child_profiles_update
on public.child_profiles
for update
using (
  child_user_id = auth.uid()
  or caseworker_user_id = auth.uid()
  or public.is_caseworker_or_admin()
)
with check (
  child_user_id = auth.uid()
  or caseworker_user_id = auth.uid()
  or public.is_caseworker_or_admin()
);

drop policy if exists child_feelings_select on public.child_feelings_checkins;
create policy child_feelings_select
on public.child_feelings_checkins
for select
using (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
);

drop policy if exists child_feelings_insert on public.child_feelings_checkins;
create policy child_feelings_insert
on public.child_feelings_checkins
for insert
with check (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
);

drop policy if exists child_feelings_update on public.child_feelings_checkins;
create policy child_feelings_update
on public.child_feelings_checkins
for update
using (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
)
with check (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
);

drop policy if exists child_tasks_select on public.child_tasks;
create policy child_tasks_select
on public.child_tasks
for select
using (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
);

drop policy if exists child_tasks_insert on public.child_tasks;
create policy child_tasks_insert
on public.child_tasks
for insert
with check (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
);

drop policy if exists child_tasks_update on public.child_tasks;
create policy child_tasks_update
on public.child_tasks
for update
using (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
)
with check (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
);

drop policy if exists child_evidence_select on public.child_evidence;
create policy child_evidence_select
on public.child_evidence
for select
using (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
);

drop policy if exists child_evidence_insert on public.child_evidence;
create policy child_evidence_insert
on public.child_evidence
for insert
with check (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
);

drop policy if exists child_evidence_update on public.child_evidence;
create policy child_evidence_update
on public.child_evidence
for update
using (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
)
with check (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
);

drop policy if exists child_lessons_progress_select on public.child_lessons_progress;
create policy child_lessons_progress_select
on public.child_lessons_progress
for select
using (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
);

drop policy if exists child_lessons_progress_insert on public.child_lessons_progress;
create policy child_lessons_progress_insert
on public.child_lessons_progress
for insert
with check (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
);

drop policy if exists child_lessons_progress_update on public.child_lessons_progress;
create policy child_lessons_progress_update
on public.child_lessons_progress
for update
using (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
)
with check (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
);

drop policy if exists child_visit_preparations_select on public.child_visit_preparations;
create policy child_visit_preparations_select
on public.child_visit_preparations
for select
using (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
);

drop policy if exists child_visit_preparations_insert on public.child_visit_preparations;
create policy child_visit_preparations_insert
on public.child_visit_preparations
for insert
with check (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
);

drop policy if exists child_visit_preparations_update on public.child_visit_preparations;
create policy child_visit_preparations_update
on public.child_visit_preparations
for update
using (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
)
with check (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
);

drop policy if exists child_visit_reflections_select on public.child_visit_reflections;
create policy child_visit_reflections_select
on public.child_visit_reflections
for select
using (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
);

drop policy if exists child_visit_reflections_insert on public.child_visit_reflections;
create policy child_visit_reflections_insert
on public.child_visit_reflections
for insert
with check (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
);

drop policy if exists child_visit_reflections_update on public.child_visit_reflections;
create policy child_visit_reflections_update
on public.child_visit_reflections
for update
using (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
)
with check (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
);

drop policy if exists child_safe_people_select on public.child_safe_people;
create policy child_safe_people_select
on public.child_safe_people
for select
using (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
);

drop policy if exists child_safe_people_insert on public.child_safe_people;
create policy child_safe_people_insert
on public.child_safe_people
for insert
with check (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
);

drop policy if exists child_safe_people_update on public.child_safe_people;
create policy child_safe_people_update
on public.child_safe_people
for update
using (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
)
with check (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
);

drop policy if exists child_achievements_select on public.child_achievements;
create policy child_achievements_select
on public.child_achievements
for select
using (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
);

drop policy if exists child_achievements_insert on public.child_achievements;
create policy child_achievements_insert
on public.child_achievements
for insert
with check (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
);

drop policy if exists child_requests_select on public.child_requests;
create policy child_requests_select
on public.child_requests
for select
using (
  child_user_id = auth.uid()
  or parent_user_id = auth.uid()
  or caseworker_user_id = auth.uid()
  or public.is_caseworker_or_admin()
);

drop policy if exists child_requests_insert on public.child_requests;
create policy child_requests_insert
on public.child_requests
for insert
with check (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
);

drop policy if exists child_requests_update on public.child_requests;
create policy child_requests_update
on public.child_requests
for update
using (
  child_user_id = auth.uid()
  or parent_user_id = auth.uid()
  or caseworker_user_id = auth.uid()
  or public.is_caseworker_or_admin()
)
with check (
  child_user_id = auth.uid()
  or parent_user_id = auth.uid()
  or caseworker_user_id = auth.uid()
  or public.is_caseworker_or_admin()
);

drop policy if exists child_shared_items_select on public.child_shared_items;
create policy child_shared_items_select
on public.child_shared_items
for select
using (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
  or (
    parent_user_id = auth.uid()
    and share_audience in ('parent', 'both')
  )
  or (
    caseworker_user_id = auth.uid()
    and share_audience in ('caseworker', 'both')
  )
);

drop policy if exists child_shared_items_insert on public.child_shared_items;
create policy child_shared_items_insert
on public.child_shared_items
for insert
with check (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
);

drop policy if exists child_shared_items_update on public.child_shared_items;
create policy child_shared_items_update
on public.child_shared_items
for update
using (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
)
with check (
  child_user_id = auth.uid()
  or public.is_caseworker_or_admin()
);

create index if not exists idx_child_profiles_child_user_id on public.child_profiles(child_user_id);
create index if not exists idx_child_profiles_caseworker_user_id on public.child_profiles(caseworker_user_id);

create index if not exists idx_child_feelings_child_user_id on public.child_feelings_checkins(child_user_id);
create index if not exists idx_child_tasks_child_user_id on public.child_tasks(child_user_id);
create index if not exists idx_child_evidence_child_user_id on public.child_evidence(child_user_id);
create index if not exists idx_child_lessons_progress_child_user_id on public.child_lessons_progress(child_user_id);
create index if not exists idx_child_visit_preparations_child_user_id on public.child_visit_preparations(child_user_id);
create index if not exists idx_child_visit_reflections_child_user_id on public.child_visit_reflections(child_user_id);
create index if not exists idx_child_safe_people_child_user_id on public.child_safe_people(child_user_id);
create index if not exists idx_child_achievements_child_user_id on public.child_achievements(child_user_id);
create index if not exists idx_child_requests_child_user_id on public.child_requests(child_user_id);
create index if not exists idx_child_requests_parent_user_id on public.child_requests(parent_user_id);
create index if not exists idx_child_shared_items_child_user_id on public.child_shared_items(child_user_id);
create index if not exists idx_child_shared_items_parent_user_id on public.child_shared_items(parent_user_id);
create index if not exists idx_child_shared_items_caseworker_user_id on public.child_shared_items(caseworker_user_id);
