
-- =========================================================
-- SafeSteps compatibility patch for existing tables
-- Existing tables may be missing new bulk-platform columns.
-- =========================================================

alter table public.lesson_progress add column if not exists enrolment_id uuid;
alter table public.lesson_progress add column if not exists lesson_id uuid;
alter table public.lesson_progress add column if not exists user_id uuid;
alter table public.lesson_progress add column if not exists status text default 'locked';
alter table public.lesson_progress add column if not exists current_step text default 'reflection';
alter table public.lesson_progress add column if not exists attempts integer default 0;
alter table public.lesson_progress add column if not exists completed_at timestamptz;
alter table public.lesson_progress add column if not exists created_at timestamptz default now();
alter table public.lesson_progress add column if not exists updated_at timestamptz default now();

alter table public.notifications add column if not exists user_id uuid;
alter table public.notifications add column if not exists title text;
alter table public.notifications add column if not exists body text;
alter table public.notifications add column if not exists notification_type text default 'reminder';
alter table public.notifications add column if not exists due_at timestamptz;
alter table public.notifications add column if not exists read_at timestamptz;
alter table public.notifications add column if not exists related_table text;
alter table public.notifications add column if not exists related_id uuid;
alter table public.notifications add column if not exists created_by uuid;
alter table public.notifications add column if not exists created_at timestamptz default now();

-- SafeSteps bulk platform tables and RLS
-- Run with: npx supabase db push
-- Or paste this file into the Supabase SQL editor.

create extension if not exists "pgcrypto";

create table if not exists public.app_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('parent','facilitator','admin','caseworker','court_viewer')),
  program_id uuid null,
  created_at timestamptz not null default now(),
  unique(user_id, role, program_id)
);

create or replace function public.current_user_has_role(role_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = role_name
  );
$$;

create or replace function public.current_user_can_view_program(target_program_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and (
        ur.role = 'admin'
        or (ur.role in ('facilitator','caseworker','court_viewer') and (ur.program_id = target_program_id or ur.program_id is null))
      )
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  risk_level text check (risk_level in ('low','medium','high','custom','standalone')),
  duration_weeks integer not null default 12,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references public.programs(id) on delete cascade,
  title text not null,
  description text,
  standalone boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete set null,
  program_id uuid references public.programs(id) on delete set null,
  title text not null,
  description text,
  resource_type text not null default 'article' check (resource_type in ('article','worksheet','video','audio','download','link','policy','court_resource')),
  url text,
  body_markdown text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  day_number integer not null default 1,
  summary text,
  content_markdown text,
  checkpoint jsonb not null default '{}'::jsonb,
  scenario jsonb not null default '{}'::jsonb,
  practice jsonb not null default '{}'::jsonb,
  estimated_minutes integer not null default 20,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bundles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bundle_items (
  id uuid primary key default gen_random_uuid(),
  bundle_id uuid not null references public.bundles(id) on delete cascade,
  item_type text not null check (item_type in ('program','course','resource','lesson')),
  item_id uuid not null,
  sort_order integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.enrolments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_id uuid references public.programs(id) on delete set null,
  course_id uuid references public.courses(id) on delete set null,
  enrolment_type text not null default 'program' check (enrolment_type in ('program','standalone_course')),
  state text not null default 'active' check (state in ('invited','active','paused','completed','withdrawn')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  lock_reason text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  enrolment_id uuid references public.enrolments(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  phase text not null check (phase in ('start','end','review','standalone')),
  prompt text not null,
  answer text not null,
  private_to_participant boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.facilitator_notes (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references public.programs(id) on delete set null,
  enrolment_id uuid references public.enrolments(id) on delete cascade,
  learner_id uuid references auth.users(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  note_type text not null default 'general' check (note_type in ('general','risk','strength','follow_up','court_summary','private')),
  visibility text not null default 'private_facilitator' check (visibility in ('private_facilitator','shared_with_parent','admin_only')),
  note text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  enrolment_id uuid not null references public.enrolments(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'locked' check (status in ('locked','unlocked','in_progress','completed')),
  current_step text not null default 'reflection',
  attempts integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(enrolment_id, lesson_id)
);

create table if not exists public.review_snapshots (
  id uuid primary key default gen_random_uuid(),
  enrolment_id uuid not null references public.enrolments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  review_type text not null check (review_type in ('baseline','month_review','final_review')),
  review_month integer,
  metrics jsonb not null default '{}'::jsonb,
  narrative text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  enrolment_id uuid references public.enrolments(id) on delete set null,
  course_id uuid references public.courses(id) on delete set null,
  program_id uuid references public.programs(id) on delete set null,
  certificate_type text not null check (certificate_type in ('standalone_course','program_level','program_completion')),
  level_title text not null,
  certificate_number text not null unique,
  issued_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  notification_type text not null default 'reminder' check (notification_type in ('reminder','lesson_due','review_due','certificate','admin_message','system')),
  due_at timestamptz,
  read_at timestamptz,
  related_table text,
  related_id uuid,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_roles_user on public.user_roles(user_id);
create index if not exists idx_enrolments_user on public.enrolments(user_id);
create index if not exists idx_reflections_enrolment on public.reflections(enrolment_id);
create index if not exists idx_notes_enrolment on public.facilitator_notes(enrolment_id);
create index if not exists idx_progress_enrolment on public.lesson_progress(enrolment_id);
create index if not exists idx_snapshots_enrolment on public.review_snapshots(enrolment_id);
create index if not exists idx_notifications_user_due on public.notifications(user_id, due_at);

alter table public.app_profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.programs enable row level security;
alter table public.courses enable row level security;
alter table public.resources enable row level security;
alter table public.lessons enable row level security;
alter table public.bundles enable row level security;
alter table public.bundle_items enable row level security;
alter table public.enrolments enable row level security;
alter table public.reflections enable row level security;
alter table public.facilitator_notes enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.review_snapshots enable row level security;
alter table public.certificates enable row level security;
alter table public.notifications enable row level security;

-- Triggers
drop trigger if exists trg_programs_updated on public.programs;
create trigger trg_programs_updated before update on public.programs for each row execute function public.set_updated_at();
drop trigger if exists trg_courses_updated on public.courses;
create trigger trg_courses_updated before update on public.courses for each row execute function public.set_updated_at();
drop trigger if exists trg_resources_updated on public.resources;
create trigger trg_resources_updated before update on public.resources for each row execute function public.set_updated_at();
drop trigger if exists trg_lessons_updated on public.lessons;
create trigger trg_lessons_updated before update on public.lessons for each row execute function public.set_updated_at();
drop trigger if exists trg_enrolments_updated on public.enrolments;
create trigger trg_enrolments_updated before update on public.enrolments for each row execute function public.set_updated_at();
drop trigger if exists trg_notes_updated on public.facilitator_notes;
create trigger trg_notes_updated before update on public.facilitator_notes for each row execute function public.set_updated_at();
drop trigger if exists trg_progress_updated on public.lesson_progress;
create trigger trg_progress_updated before update on public.lesson_progress for each row execute function public.set_updated_at();

-- Policies are dropped and recreated so this migration can be re-run while building.
drop policy if exists app_profiles_select on public.app_profiles;
create policy app_profiles_select on public.app_profiles for select using (id = auth.uid() or public.current_user_has_role('admin'));
drop policy if exists app_profiles_update on public.app_profiles;
create policy app_profiles_update on public.app_profiles for update using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists app_profiles_insert on public.app_profiles;
create policy app_profiles_insert on public.app_profiles for insert with check (id = auth.uid());

drop policy if exists user_roles_select on public.user_roles;
create policy user_roles_select on public.user_roles for select using (user_id = auth.uid() or public.current_user_has_role('admin'));
drop policy if exists user_roles_write_admin on public.user_roles;
create policy user_roles_write_admin on public.user_roles for all using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));


-- =========================================================
-- Forced compatibility fix before program policies
-- =========================================================
alter table public.programs add column if not exists status text default 'draft';
alter table public.programs add column if not exists title text;
alter table public.programs add column if not exists description text;
alter table public.programs add column if not exists risk_level text;
alter table public.programs add column if not exists duration_weeks integer default 12;
alter table public.programs add column if not exists created_by uuid;
alter table public.programs add column if not exists created_at timestamptz default now();
alter table public.programs add column if not exists updated_at timestamptz default now();
drop policy if exists programs_select on public.programs;
create policy programs_select on public.programs for select using (status = 'published' or public.current_user_has_role('admin') or public.current_user_can_view_program(id));
drop policy if exists programs_write_admin on public.programs;
create policy programs_write_admin on public.programs for all using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));

drop policy if exists courses_select on public.courses;
create policy courses_select on public.courses for select using (status = 'published' or public.current_user_has_role('admin') or program_id is null or public.current_user_can_view_program(program_id));
drop policy if exists courses_write_admin on public.courses;
create policy courses_write_admin on public.courses for all using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));

drop policy if exists resources_select on public.resources;
create policy resources_select on public.resources for select using (status = 'published' or public.current_user_has_role('admin') or program_id is null or public.current_user_can_view_program(program_id));
drop policy if exists resources_write_admin on public.resources;
create policy resources_write_admin on public.resources for all using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));


-- =========================================================
-- Forced compatibility fix before lesson policies
-- =========================================================
alter table public.lessons add column if not exists status text default 'draft';
alter table public.lessons add column if not exists course_id uuid;
alter table public.lessons add column if not exists title text;
alter table public.lessons add column if not exists day_number integer default 1;
alter table public.lessons add column if not exists summary text;
alter table public.lessons add column if not exists content_markdown text;
alter table public.lessons add column if not exists checkpoint jsonb default '{}'::jsonb;
alter table public.lessons add column if not exists scenario jsonb default '{}'::jsonb;
alter table public.lessons add column if not exists practice jsonb default '{}'::jsonb;
alter table public.lessons add column if not exists estimated_minutes integer default 20;
alter table public.lessons add column if not exists created_by uuid;
alter table public.lessons add column if not exists created_at timestamptz default now();
alter table public.lessons add column if not exists updated_at timestamptz default now();
drop policy if exists lessons_select on public.lessons;
create policy lessons_select on public.lessons for select using (status = 'published' or public.current_user_has_role('admin'));
drop policy if exists lessons_write_admin on public.lessons;
create policy lessons_write_admin on public.lessons for all using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));

drop policy if exists bundles_select on public.bundles;
create policy bundles_select on public.bundles for select using (status = 'published' or public.current_user_has_role('admin'));
drop policy if exists bundles_write_admin on public.bundles;
create policy bundles_write_admin on public.bundles for all using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));

drop policy if exists bundle_items_select on public.bundle_items;
create policy bundle_items_select on public.bundle_items for select using (true);
drop policy if exists bundle_items_write_admin on public.bundle_items;
create policy bundle_items_write_admin on public.bundle_items for all using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));

drop policy if exists enrolments_select on public.enrolments;
create policy enrolments_select on public.enrolments for select using (user_id = auth.uid() or public.current_user_has_role('admin') or public.current_user_can_view_program(program_id));
drop policy if exists enrolments_insert_staff on public.enrolments;
create policy enrolments_insert_staff on public.enrolments for insert with check (user_id = auth.uid() or public.current_user_has_role('admin') or public.current_user_can_view_program(program_id));
drop policy if exists enrolments_update_staff on public.enrolments;
create policy enrolments_update_staff on public.enrolments for update using (user_id = auth.uid() or public.current_user_has_role('admin') or public.current_user_can_view_program(program_id)) with check (user_id = auth.uid() or public.current_user_has_role('admin') or public.current_user_can_view_program(program_id));

drop policy if exists reflections_select on public.reflections;
create policy reflections_select on public.reflections for select using (user_id = auth.uid() or public.current_user_has_role('admin') or exists (select 1 from public.enrolments e where e.id = enrolment_id and public.current_user_can_view_program(e.program_id)));
drop policy if exists reflections_insert_own on public.reflections;
create policy reflections_insert_own on public.reflections for insert with check (user_id = auth.uid());
drop policy if exists reflections_update_own on public.reflections;
create policy reflections_update_own on public.reflections for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists notes_select on public.facilitator_notes;
create policy notes_select on public.facilitator_notes for select using (
  public.current_user_has_role('admin')
  or author_id = auth.uid()
  or (visibility = 'shared_with_parent' and learner_id = auth.uid())
  or (visibility <> 'admin_only' and public.current_user_can_view_program(program_id))
);
drop policy if exists notes_write_staff on public.facilitator_notes;
create policy notes_write_staff on public.facilitator_notes for all using (public.current_user_has_role('admin') or public.current_user_can_view_program(program_id)) with check (author_id = auth.uid() and (public.current_user_has_role('admin') or public.current_user_can_view_program(program_id)));

drop policy if exists progress_select on public.lesson_progress;
create policy progress_select on public.lesson_progress for select using (user_id = auth.uid() or public.current_user_has_role('admin') or exists (select 1 from public.enrolments e where e.id = enrolment_id and public.current_user_can_view_program(e.program_id)));
drop policy if exists progress_write on public.lesson_progress;
create policy progress_write on public.lesson_progress for all using (user_id = auth.uid() or public.current_user_has_role('admin')) with check (user_id = auth.uid() or public.current_user_has_role('admin'));

drop policy if exists snapshots_select on public.review_snapshots;
create policy snapshots_select on public.review_snapshots for select using (user_id = auth.uid() or public.current_user_has_role('admin') or exists (select 1 from public.enrolments e where e.id = enrolment_id and public.current_user_can_view_program(e.program_id)));
drop policy if exists snapshots_write on public.review_snapshots;
create policy snapshots_write on public.review_snapshots for all using (user_id = auth.uid() or public.current_user_has_role('admin') or exists (select 1 from public.enrolments e where e.id = enrolment_id and public.current_user_can_view_program(e.program_id))) with check (user_id = auth.uid() or public.current_user_has_role('admin') or exists (select 1 from public.enrolments e where e.id = enrolment_id and public.current_user_can_view_program(e.program_id)));

drop policy if exists certificates_select on public.certificates;
create policy certificates_select on public.certificates for select using (user_id = auth.uid() or public.current_user_has_role('admin') or public.current_user_can_view_program(program_id));
drop policy if exists certificates_write_staff on public.certificates;
create policy certificates_write_staff on public.certificates for all using (public.current_user_has_role('admin') or public.current_user_can_view_program(program_id)) with check (public.current_user_has_role('admin') or public.current_user_can_view_program(program_id));

drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications for select using (user_id = auth.uid() or public.current_user_has_role('admin'));
drop policy if exists notifications_insert on public.notifications;
create policy notifications_insert on public.notifications for insert with check (user_id = auth.uid() or public.current_user_has_role('admin'));
drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications for update using (user_id = auth.uid() or public.current_user_has_role('admin')) with check (user_id = auth.uid() or public.current_user_has_role('admin'));