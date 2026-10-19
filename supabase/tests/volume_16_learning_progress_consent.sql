begin;

select plan(11);

select ok(
  to_regclass('public.learning_progress_sharing_consents') is not null,
  'learning progress sharing consent table exists'
);

select ok(
  (
    select relrowsecurity
    from pg_class
    where oid = 'public.learning_progress_sharing_consents'::regclass
  ),
  'learning progress sharing consent uses row-level security'
);

select ok(
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'learning_course_progress'
      and column_name = 'assessment_score_percentage'
  ),
  'course progress stores the latest assessment score'
);

select ok(
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'learning_course_progress'
      and column_name = 'assessment_passed'
  ),
  'course progress stores assessment pass status'
);

select ok(
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'learning_course_progress'
      and column_name = 'result_source'
      and column_default like '%client_reported_unverified%'
  ),
  'client-scored course results are explicitly unverified'
);

select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'learning_progress_sharing_consents'
      and policyname = 'Learning sharing consent managed by owner'
      and with_check like '%user_id = auth.uid()%'
  ),
  'only the learner can grant their own sharing consent'
);

select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'learning_progress_sharing_consents'
      and policyname = 'Learning sharing consent visible to assigned practitioner'
      and qual like '%share_with_assigned_practitioner%'
      and qual like '%assigned_by_user_id = auth.uid()%'
  ),
  'assigned practitioners can read only an active sharing consent'
);

select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'learning_course_progress'
      and policyname = 'Learning course progress visible with consent'
      and qual like '%share_with_assigned_practitioner%'
      and qual like '%assigned_by_user_id = auth.uid()%'
  ),
  'practitioner progress reads require active learner consent and assignment'
);

select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'learning_course_progress'
      and policyname = 'Learning course progress writable by participant'
      and with_check like '%user_id = auth.uid()%'
  ),
  'learners can write only progress for their own enrolment'
);

select ok(
  exists (
    select 1
    from public.learning_courses
    where course_code = 'understanding_harm_basic'
      and course_version = 1
      and lifecycle_status = 'active'
      and review_status = 'production_draft'
  ),
  'Understanding Harm metadata is active and labelled as a production draft'
);

select ok(
  not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'learning_reflection_responses',
        'learning_journals',
        'learning_journal_entries'
      )
      and coalesce(qual, '') like '%learning_progress_sharing_consents%'
  ),
  'progress sharing consent does not expose reflections or journals'
);

select * from finish();
rollback;
