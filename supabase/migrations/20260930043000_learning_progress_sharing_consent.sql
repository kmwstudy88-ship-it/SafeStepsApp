-- Consent-gated practitioner visibility for structured learning progress.
-- This migration does not expose reflection or journal content.

alter table public.learning_courses
  add column if not exists review_status text not null default 'unreviewed',
  add column if not exists review_notice text;

alter table public.learning_course_progress
  add column if not exists assessment_score_percentage numeric
    check (
      assessment_score_percentage is null
      or assessment_score_percentage between 0 and 100
    ),
  add column if not exists assessment_passed boolean not null default false,
  add column if not exists assessment_attempts integer not null default 0
    check (assessment_attempts >= 0),
  add column if not exists result_source text not null
    default 'client_reported_unverified'
    check (result_source in ('client_reported_unverified', 'server_verified'));

create table if not exists public.learning_progress_sharing_consents (
  id uuid primary key default gen_random_uuid(),
  enrolment_id uuid not null unique
    references public.learning_enrolments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  share_with_assigned_practitioner boolean not null default false,
  consented_at timestamptz,
  withdrawn_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learning_progress_sharing_consent_state_check check (
    not share_with_assigned_practitioner or consented_at is not null
  )
);

create index if not exists idx_learning_progress_sharing_consents_user
  on public.learning_progress_sharing_consents(user_id);

drop trigger if exists trg_learning_progress_sharing_consents_updated
  on public.learning_progress_sharing_consents;
create trigger trg_learning_progress_sharing_consents_updated
before update on public.learning_progress_sharing_consents
for each row execute function public.set_updated_at();

alter table public.learning_progress_sharing_consents enable row level security;

drop policy if exists "Learning sharing consent visible to owner"
  on public.learning_progress_sharing_consents;
create policy "Learning sharing consent visible to owner"
on public.learning_progress_sharing_consents
for select to authenticated
using (user_id = auth.uid());

drop policy if exists "Learning sharing consent managed by owner"
  on public.learning_progress_sharing_consents;
create policy "Learning sharing consent managed by owner"
on public.learning_progress_sharing_consents
for all to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.learning_enrolments enrolment
    where enrolment.id = enrolment_id
      and enrolment.user_id = auth.uid()
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.learning_enrolments enrolment
    where enrolment.id = enrolment_id
      and enrolment.user_id = auth.uid()
  )
);

drop policy if exists "Learning sharing consent visible to assigned practitioner"
  on public.learning_progress_sharing_consents;
create policy "Learning sharing consent visible to assigned practitioner"
on public.learning_progress_sharing_consents
for select to authenticated
using (
  share_with_assigned_practitioner
  and exists (
    select 1
    from public.learning_enrolments enrolment
    where enrolment.id = enrolment_id
      and enrolment.assigned_by_user_id = auth.uid()
  )
);

drop policy if exists "Learning sharing consent managed by admin"
  on public.learning_progress_sharing_consents;
create policy "Learning sharing consent managed by admin"
on public.learning_progress_sharing_consents
for all to authenticated
using (public.current_user_has_role('admin'))
with check (public.current_user_has_role('admin'));

drop policy if exists "Learning course progress visible to participant"
  on public.learning_course_progress;
create policy "Learning course progress visible to participant"
on public.learning_course_progress
for select to authenticated
using (
  exists (
    select 1
    from public.learning_enrolments enrolment
    where enrolment.id = enrolment_id
      and enrolment.user_id = auth.uid()
  )
);

drop policy if exists "Learning course progress writable by participant"
  on public.learning_course_progress;
create policy "Learning course progress writable by participant"
on public.learning_course_progress
for all to authenticated
using (
  exists (
    select 1
    from public.learning_enrolments enrolment
    where enrolment.id = enrolment_id
      and enrolment.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.learning_enrolments enrolment
    where enrolment.id = enrolment_id
      and enrolment.user_id = auth.uid()
  )
);

drop policy if exists "Learning course progress visible with consent"
  on public.learning_course_progress;
create policy "Learning course progress visible with consent"
on public.learning_course_progress
for select to authenticated
using (
  exists (
    select 1
    from public.learning_enrolments enrolment
    join public.learning_progress_sharing_consents consent
      on consent.enrolment_id = enrolment.id
    where enrolment.id = enrolment_id
      and enrolment.assigned_by_user_id = auth.uid()
      and consent.share_with_assigned_practitioner
  )
);

drop policy if exists "Learning course progress managed by admin"
  on public.learning_course_progress;
create policy "Learning course progress managed by admin"
on public.learning_course_progress
for all to authenticated
using (public.current_user_has_role('admin'))
with check (public.current_user_has_role('admin'));

grant select, insert, update, delete
  on public.learning_progress_sharing_consents to authenticated;
grant select, insert, update
  on public.learning_course_progress to authenticated;

insert into public.learning_courses (
  course_code,
  course_version,
  course_name,
  course_description,
  audience_types,
  difficulty_level,
  estimated_minutes,
  minimum_completion_minutes,
  video_first,
  reflection_required,
  quiz_required,
  activity_required,
  evidence_task_required,
  certificate_available,
  court_relevant,
  lifecycle_status,
  review_status,
  review_notice
)
values (
  'understanding_harm_basic',
  1,
  'Understanding Harm',
  'A six-lesson foundation course for recognising harm, understanding child impact, taking accountability, repairing relationships, and planning protective parenting responses.',
  array['referred_parent', 'voluntary_parent', 'caregiver'],
  'foundation',
  270,
  180,
  false,
  true,
  true,
  true,
  false,
  true,
  false,
  'active',
  'production_draft',
  'Production draft — not validated or approved. Safeguarding, cultural, clinical, legal, and lived-experience review is required.'
)
on conflict (course_code, course_version) do update
set
  course_name = excluded.course_name,
  course_description = excluded.course_description,
  audience_types = excluded.audience_types,
  difficulty_level = excluded.difficulty_level,
  estimated_minutes = excluded.estimated_minutes,
  minimum_completion_minutes = excluded.minimum_completion_minutes,
  video_first = excluded.video_first,
  reflection_required = excluded.reflection_required,
  quiz_required = excluded.quiz_required,
  activity_required = excluded.activity_required,
  evidence_task_required = excluded.evidence_task_required,
  certificate_available = excluded.certificate_available,
  court_relevant = excluded.court_relevant,
  lifecycle_status = excluded.lifecycle_status,
  review_status = excluded.review_status,
  review_notice = excluded.review_notice;
