create extension if not exists pgcrypto;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  role_key text not null unique,
  role_name text not null,
  created_at timestamptz not null default now()
);

insert into public.roles (role_key, role_name)
values
  ('parent', 'Parent'),
  ('case_worker', 'Case Worker'),
  ('supervisor', 'Supervisor'),
  ('admin', 'Administrator')
on conflict (role_key) do update set role_name = excluded.role_name;

alter table public.users
  add column if not exists display_name text,
  add column if not exists role_id uuid references public.roles(id),
  add column if not exists is_active boolean not null default true;

create table if not exists public.team_memberships (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  membership_role text not null check (membership_role in ('worker', 'supervisor')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (team_id, user_id)
);

create index if not exists team_memberships_user_active_idx
  on public.team_memberships(user_id, is_active);

create table if not exists public.case_assignments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  assignment_role text not null check (assignment_role in ('parent', 'case_worker', 'supervisor')),
  is_active boolean not null default true,
  assigned_at timestamptz not null default now(),
  unique (case_id, user_id, assignment_role)
);

create index if not exists case_assignments_case_active_idx
  on public.case_assignments(case_id, is_active);
create index if not exists case_assignments_user_active_idx
  on public.case_assignments(user_id, is_active);

alter table public.cases
  add column if not exists parent_user_id uuid references public.users(id),
  add column if not exists owner_user_id uuid references public.users(id),
  add column if not exists updated_at timestamptz not null default now();

alter table public.documents
  add column if not exists case_id uuid references public.cases(id) on delete cascade,
  add column if not exists uploaded_by uuid references public.users(id),
  add column if not exists file_name text,
  add column if not exists mime_type text,
  add column if not exists storage_path text,
  add column if not exists parsed_text text,
  add column if not exists processing_status text not null default 'uploaded' check (processing_status in ('uploaded', 'processing', 'completed', 'failed')),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists documents_case_status_idx
  on public.documents(case_id, processing_status);

alter table public.evidence
  add column if not exists case_id uuid references public.cases(id) on delete cascade,
  add column if not exists document_id uuid references public.documents(id) on delete set null,
  add column if not exists created_by uuid references public.users(id),
  add column if not exists evidence_type text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists evidence_case_created_idx
  on public.evidence(case_id, created_at desc);

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  document_id uuid references public.documents(id) on delete set null,
  created_by uuid references public.users(id),
  provider text,
  model text,
  section_results jsonb not null default '[]'::jsonb,
  fairness_result jsonb not null default '{}'::jsonb,
  risk_result jsonb not null default '{}'::jsonb,
  summary text,
  status text not null default 'completed' check (status in ('queued', 'processing', 'completed', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists analyses_case_created_idx
  on public.analyses(case_id, created_at desc);

create table if not exists public.risk_assessments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  analysis_id uuid references public.analyses(id) on delete set null,
  assessed_by uuid references public.users(id),
  risk_score integer not null check (risk_score between 0 and 100),
  risk_level text not null check (risk_level in ('low', 'moderate', 'high', 'critical')),
  escalation_required boolean not null default false,
  factors jsonb not null default '[]'::jsonb,
  computed_at timestamptz not null default now()
);

create index if not exists risk_assessments_case_computed_idx
  on public.risk_assessments(case_id, computed_at desc);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.cases(id) on delete cascade,
  document_id uuid references public.documents(id) on delete set null,
  analysis_id uuid references public.analyses(id) on delete set null,
  actor_user_id uuid references public.users(id),
  event_type text not null,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists events_case_created_idx
  on public.events(case_id, created_at desc);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.cases(id) on delete set null,
  actor_user_id uuid references public.users(id),
  action text not null,
  resource_type text not null,
  resource_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_case_created_idx
  on public.audit_logs(case_id, created_at desc);
create index if not exists audit_logs_actor_created_idx
  on public.audit_logs(actor_user_id, created_at desc);

create or replace function public.current_app_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.users where auth_user_id = auth.uid() and is_active = true limit 1;
$$;

create or replace function public.current_role_key()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select r.role_key
  from public.users u
  left join public.roles r on r.id = u.role_id
  where u.id = public.current_app_user_id()
  limit 1;
$$;

create or replace function public.case_visible_to_current_user(target_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  with me as (
    select public.current_app_user_id() as user_id,
           coalesce(public.current_role_key(), '') as role_key
  )
  select exists (
    select 1
    from me
    where me.role_key = 'admin'
      or exists (
        select 1
        from public.case_assignments ca
        where ca.case_id = target_case_id
          and ca.user_id = me.user_id
          and ca.is_active
      )
      or exists (
        select 1
        from public.cases c
        where c.id = target_case_id
          and c.parent_user_id = me.user_id
      )
      or (
        me.role_key = 'supervisor'
        and exists (
          select 1
          from public.team_memberships supervisor_tm
          join public.team_memberships worker_tm
            on worker_tm.team_id = supervisor_tm.team_id
           and worker_tm.membership_role = 'worker'
           and worker_tm.is_active
          join public.case_assignments worker_ca
            on worker_ca.user_id = worker_tm.user_id
           and worker_ca.case_id = target_case_id
           and worker_ca.assignment_role = 'case_worker'
           and worker_ca.is_active
          where supervisor_tm.user_id = me.user_id
            and supervisor_tm.membership_role = 'supervisor'
            and supervisor_tm.is_active
        )
      )
  );
$$;

alter table public.users enable row level security;
alter table public.roles enable row level security;
alter table public.team_memberships enable row level security;
alter table public.case_assignments enable row level security;
alter table public.cases enable row level security;
alter table public.documents enable row level security;
alter table public.evidence enable row level security;
alter table public.analyses enable row level security;
alter table public.risk_assessments enable row level security;
alter table public.events enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists users_self_read on public.users;
create policy users_self_read on public.users
for select to authenticated
using (id = public.current_app_user_id() or coalesce(public.current_role_key(), '') in ('supervisor', 'admin'));

drop policy if exists roles_read_authenticated on public.roles;
create policy roles_read_authenticated on public.roles
for select to authenticated
using (true);

drop policy if exists team_memberships_visible_to_team on public.team_memberships;
create policy team_memberships_visible_to_team on public.team_memberships
for select to authenticated
using (
  user_id = public.current_app_user_id()
  or exists (
    select 1
    from public.team_memberships me
    where me.team_id = team_memberships.team_id
      and me.user_id = public.current_app_user_id()
      and me.is_active
  )
  or coalesce(public.current_role_key(), '') = 'admin'
);

drop policy if exists case_assignments_visible_for_case_access on public.case_assignments;
create policy case_assignments_visible_for_case_access on public.case_assignments
for select to authenticated
using (public.case_visible_to_current_user(case_id));

drop policy if exists case_assignments_manage_by_supervisors on public.case_assignments;
drop policy if exists case_assignments_insert_manage_by_supervisors on public.case_assignments;
drop policy if exists case_assignments_update_manage_by_supervisors on public.case_assignments;
drop policy if exists case_assignments_delete_manage_by_supervisors on public.case_assignments;

create policy case_assignments_insert_manage_by_supervisors on public.case_assignments
for insert to authenticated
with check (
  coalesce(public.current_role_key(), '') = 'admin'
  or (
    coalesce(public.current_role_key(), '') = 'supervisor'
    and public.case_visible_to_current_user(case_id)
  )
);

create policy case_assignments_update_manage_by_supervisors on public.case_assignments
for update to authenticated
using (coalesce(public.current_role_key(), '') in ('supervisor', 'admin'))
with check (coalesce(public.current_role_key(), '') in ('supervisor', 'admin'));

create policy case_assignments_delete_manage_by_supervisors on public.case_assignments
for delete to authenticated
using (coalesce(public.current_role_key(), '') in ('supervisor', 'admin'));

drop policy if exists cases_access_by_assignment_or_parent on public.cases;
create policy cases_access_by_assignment_or_parent on public.cases
for select to authenticated
using (public.case_visible_to_current_user(id));

drop policy if exists cases_manage_by_supervisor_admin on public.cases;
drop policy if exists cases_insert_by_supervisor_admin on public.cases;
drop policy if exists cases_delete_by_supervisor_admin on public.cases;

create policy cases_insert_by_supervisor_admin on public.cases
for insert to authenticated
with check (
  coalesce(public.current_role_key(), '') = 'admin'
  or coalesce(public.current_role_key(), '') = 'supervisor'
);

create policy cases_manage_by_supervisor_admin on public.cases
for update to authenticated
using (
  coalesce(public.current_role_key(), '') = 'admin'
  or (
    coalesce(public.current_role_key(), '') = 'supervisor'
    and public.case_visible_to_current_user(id)
  )
)
with check (
  coalesce(public.current_role_key(), '') = 'admin'
  or (
    coalesce(public.current_role_key(), '') = 'supervisor'
    and public.case_visible_to_current_user(id)
  )
);

create policy cases_delete_by_supervisor_admin on public.cases
for delete to authenticated
using (
  coalesce(public.current_role_key(), '') = 'admin'
  or (
    coalesce(public.current_role_key(), '') = 'supervisor'
    and public.case_visible_to_current_user(id)
  )
);

drop policy if exists documents_case_access on public.documents;
create policy documents_case_access on public.documents
for select to authenticated
using (case_id is not null and public.case_visible_to_current_user(case_id));

drop policy if exists documents_insert_by_case_access on public.documents;
create policy documents_insert_by_case_access on public.documents
for insert to authenticated
with check (
  case_id is not null
  and public.case_visible_to_current_user(case_id)
  and (
    uploaded_by is null
    or uploaded_by = public.current_app_user_id()
    or coalesce(public.current_role_key(), '') = 'admin'
  )
);

drop policy if exists documents_update_by_case_workers on public.documents;
create policy documents_update_by_case_workers on public.documents
for update to authenticated
using (case_id is not null and public.case_visible_to_current_user(case_id))
with check (case_id is not null and public.case_visible_to_current_user(case_id));

drop policy if exists evidence_case_access on public.evidence;
create policy evidence_case_access on public.evidence
for all to authenticated
using (case_id is not null and public.case_visible_to_current_user(case_id))
with check (case_id is not null and public.case_visible_to_current_user(case_id));

drop policy if exists analyses_case_access on public.analyses;
create policy analyses_case_access on public.analyses
for all to authenticated
using (public.case_visible_to_current_user(case_id))
with check (public.case_visible_to_current_user(case_id));

drop policy if exists risk_assessments_case_access on public.risk_assessments;
create policy risk_assessments_case_access on public.risk_assessments
for all to authenticated
using (public.case_visible_to_current_user(case_id))
with check (public.case_visible_to_current_user(case_id));

drop policy if exists events_case_access on public.events;
create policy events_case_access on public.events
for all to authenticated
using (case_id is null or public.case_visible_to_current_user(case_id))
with check (case_id is null or public.case_visible_to_current_user(case_id));

drop policy if exists audit_logs_read_by_case_access on public.audit_logs;
create policy audit_logs_read_by_case_access on public.audit_logs
for select to authenticated
using (
  actor_user_id = public.current_app_user_id()
  or (case_id is not null and public.case_visible_to_current_user(case_id))
  or coalesce(public.current_role_key(), '') in ('supervisor', 'admin')
);

drop policy if exists audit_logs_insert_only on public.audit_logs;
create policy audit_logs_insert_only on public.audit_logs
for insert to authenticated
with check (
  actor_user_id = public.current_app_user_id()
  and (case_id is null or public.case_visible_to_current_user(case_id))
);

create or replace function public.prevent_audit_log_mutation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  raise exception 'audit_logs are immutable';
end;
$$;

drop trigger if exists prevent_audit_log_update on public.audit_logs;
create trigger prevent_audit_log_update
before update on public.audit_logs
for each row
execute function public.prevent_audit_log_mutation();

drop trigger if exists prevent_audit_log_delete on public.audit_logs;
create trigger prevent_audit_log_delete
before delete on public.audit_logs
for each row
execute function public.prevent_audit_log_mutation();
