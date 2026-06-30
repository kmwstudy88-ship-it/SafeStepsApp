alter table public.assessments enable row level security;
alter table public.assessment_questions enable row level security;
alter table public.assessment_responses enable row level security;

drop policy if exists "Assessments are visible to signed in users" on public.assessments;
create policy "Assessments are visible to signed in users"
on public.assessments for select
to authenticated
using (true);

drop policy if exists "Assessment questions are visible to signed in users" on public.assessment_questions;
create policy "Assessment questions are visible to signed in users"
on public.assessment_questions for select
to authenticated
using (true);

drop policy if exists "Assessment responses are visible to owners" on public.assessment_responses;
create policy "Assessment responses are visible to owners"
on public.assessment_responses for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Assessment responses can be created by owners" on public.assessment_responses;
create policy "Assessment responses can be created by owners"
on public.assessment_responses for insert
to authenticated
with check ((select auth.uid()) = user_id);

insert into public.assessments (id, name, description)
values (
  '11111111-1111-4111-8111-111111111111',
  'SafeSteps Progress Check',
  'A short reflection to record confidence, safety, evidence, routines, and support.'
)
on conflict (id) do update
set
  name = excluded.name,
  description = excluded.description;

insert into public.assessment_questions (
  assessment_id,
  question_number,
  question_text,
  question_type
)
values
  ('11111111-1111-4111-8111-111111111111', 1, 'I understand what I need to work on this week.', 'scale_1_5'),
  ('11111111-1111-4111-8111-111111111111', 2, 'I have evidence saved that shows my progress.', 'scale_1_5'),
  ('11111111-1111-4111-8111-111111111111', 3, 'I feel confident explaining the changes I am making.', 'scale_1_5'),
  ('11111111-1111-4111-8111-111111111111', 4, 'My home and routines are becoming safer and more stable.', 'scale_1_5'),
  ('11111111-1111-4111-8111-111111111111', 5, 'I know what support I can ask for if I get stuck.', 'scale_1_5')
on conflict do nothing;
