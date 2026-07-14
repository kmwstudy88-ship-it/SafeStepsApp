create table if not exists public.case_sessions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.reunification_cases(id) on delete cascade,
  parent_user_id uuid references auth.users(id) on delete set null,
  worker_user_id uuid references auth.users(id) on delete set null,
  session_type text not null default 'worker_session'
    check (session_type in ('intake', 'worker_session', 'supervision', 'home_visit', 'contact_review', 'exit_review')),
  scheduled_start_at timestamptz not null,
  scheduled_end_at timestamptz,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'confirmed', 'completed', 'missed', 'cancelled')),
  phase text,
  course_context text,
  agenda jsonb not null default '[]'::jsonb,
  notes text not null default '',
  parent_confirmed_at timestamptz,
  audio_consent boolean not null default false,
  audio_file_path text,
  transcript_text text,
  transcript_metadata jsonb not null default '{}'::jsonb,
  rubric_score numeric(5,2),
  missed_reason text,
  alert_generated boolean not null default false,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.case_sessions enable row level security;

drop policy if exists case_sessions_select on public.case_sessions;
create policy case_sessions_select
on public.case_sessions for select
to authenticated
using (
  parent_user_id = (select auth.uid())
  or worker_user_id = (select auth.uid())
  or created_by = (select auth.uid())
  or public.can_manage_assessments()
);

drop policy if exists case_sessions_insert on public.case_sessions;
create policy case_sessions_insert
on public.case_sessions for insert
to authenticated
with check (
  created_by = (select auth.uid())
  or worker_user_id = (select auth.uid())
  or public.can_manage_assessments()
);

drop policy if exists case_sessions_update on public.case_sessions;
create policy case_sessions_update
on public.case_sessions for update
to authenticated
using (
  parent_user_id = (select auth.uid())
  or worker_user_id = (select auth.uid())
  or created_by = (select auth.uid())
  or public.can_manage_assessments()
)
with check (
  parent_user_id = (select auth.uid())
  or worker_user_id = (select auth.uid())
  or created_by = (select auth.uid())
  or public.can_manage_assessments()
);

create index if not exists idx_case_sessions_case_scheduled
  on public.case_sessions(case_id, scheduled_start_at desc);

create index if not exists idx_case_sessions_parent_scheduled
  on public.case_sessions(parent_user_id, scheduled_start_at desc);

create index if not exists idx_case_sessions_worker_status
  on public.case_sessions(worker_user_id, status, scheduled_start_at);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'assessment_records_session_id_fkey'
      and conrelid = 'public.assessment_records'::regclass
  ) then
    alter table public.assessment_records
      add constraint assessment_records_session_id_fkey
      foreign key (session_id) references public.case_sessions(id) on delete set null;
  end if;
end $$;
