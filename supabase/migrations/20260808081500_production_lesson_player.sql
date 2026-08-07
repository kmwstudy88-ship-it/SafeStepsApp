-- SafeSteps production lesson-player infrastructure.
-- Adds production curriculum columns and privacy-preserving lesson response storage.
-- Curriculum content is imported separately and remains subject to governance review.

begin;

alter table public.courses
  add column if not exists content_key text,
  add column if not exists category text,
  add column if not exists sort_order integer not null default 0,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create unique index if not exists courses_content_key_unique
  on public.courses(content_key)
  where content_key is not null;

alter table public.lessons
  add column if not exists content_key text,
  add column if not exists course_sequence integer,
  add column if not exists global_lesson_number integer,
  add column if not exists subtitle text,
  add column if not exists module text,
  add column if not exists level text,
  add column if not exists learning_objectives jsonb not null default '[]'::jsonb,
  add column if not exists progression_rules jsonb not null default '{}'::jsonb,
  add column if not exists accessibility_spec jsonb not null default '{}'::jsonb,
  add column if not exists production_content jsonb not null default '{}'::jsonb,
  add column if not exists screen_sequence jsonb not null default '[]'::jsonb,
  add column if not exists analytics_events jsonb not null default '[]'::jsonb,
  add column if not exists source_schema_version text,
  add column if not exists source_pack_version text;

create unique index if not exists lessons_content_key_unique
  on public.lessons(content_key)
  where content_key is not null;

create unique index if not exists lessons_course_sequence_unique
  on public.lessons(course_id, course_sequence)
  where course_id is not null and course_sequence is not null;

create index if not exists lessons_global_lesson_number_idx
  on public.lessons(global_lesson_number);

create index if not exists lessons_production_content_gin
  on public.lessons using gin(production_content);

create table if not exists public.lesson_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  enrolment_id uuid references public.enrolments(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  current_step text not null default 'definition',
  completed_steps text[] not null default '{}'::text[],
  response_data jsonb not null default '{}'::jsonb,
  quiz_score numeric(5,2),
  quiz_passed boolean not null default false,
  assessment_status text not null default 'not_started'
    check (assessment_status in ('not_started','draft','submitted','reviewed')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists lesson_responses_enrolment_unique
  on public.lesson_responses(user_id, lesson_id, enrolment_id)
  where enrolment_id is not null;

create unique index if not exists lesson_responses_standalone_unique
  on public.lesson_responses(user_id, lesson_id)
  where enrolment_id is null;

create index if not exists lesson_responses_user_lesson_idx
  on public.lesson_responses(user_id, lesson_id);

create index if not exists lesson_responses_enrolment_idx
  on public.lesson_responses(enrolment_id);

alter table public.lesson_responses enable row level security;

drop trigger if exists trg_lesson_responses_updated on public.lesson_responses;
create trigger trg_lesson_responses_updated
before update on public.lesson_responses
for each row execute function public.set_updated_at();

drop policy if exists lesson_responses_select on public.lesson_responses;
create policy lesson_responses_select
on public.lesson_responses
for select
to authenticated
using (
  user_id = auth.uid()
  or public.current_user_has_role('admin')
  or exists (
    select 1
    from public.enrolments e
    where e.id = lesson_responses.enrolment_id
      and public.current_user_can_view_program(e.program_id)
  )
);

drop policy if exists lesson_responses_insert_own on public.lesson_responses;
create policy lesson_responses_insert_own
on public.lesson_responses
for insert
to authenticated
with check (
  user_id = auth.uid()
  and (
    enrolment_id is null
    or exists (
      select 1
      from public.enrolments e
      where e.id = lesson_responses.enrolment_id
        and e.user_id = auth.uid()
    )
  )
);

drop policy if exists lesson_responses_update_own on public.lesson_responses;
create policy lesson_responses_update_own
on public.lesson_responses
for update
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and (
    enrolment_id is null
    or exists (
      select 1
      from public.enrolments e
      where e.id = lesson_responses.enrolment_id
        and e.user_id = auth.uid()
    )
  )
);

drop policy if exists lesson_responses_delete_own on public.lesson_responses;
create policy lesson_responses_delete_own
on public.lesson_responses
for delete
to authenticated
using (user_id = auth.uid());

revoke all on table public.lesson_responses from public, anon;
grant select, insert, update, delete on table public.lesson_responses to authenticated;
grant all on table public.lesson_responses to service_role;

commit;
