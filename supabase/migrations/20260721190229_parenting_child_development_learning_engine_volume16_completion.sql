create extension if not exists pgcrypto;

create table if not exists public.learning_catalogues (
  id uuid primary key default gen_random_uuid(),
  catalogue_code text not null unique,
  catalogue_name text not null,
  catalogue_description text,
  audience_types text[] not null default '{}',
  supported_age_bands text[] not null default '{}',
  organisation_id uuid references public.organisations(id) on delete cascade,
  jurisdiction_codes text[] not null default '{}',
  language_codes text[] not null default '{en-AU}',
  public_access boolean not null default false,
  lifecycle_status text not null default 'draft',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.learning_categories (
  id uuid primary key default gen_random_uuid(),
  category_code text not null unique,
  category_name text not null,
  category_description text,
  parent_category_id uuid references public.learning_categories(id) on delete set null,
  audience_types text[] not null default '{}',
  age_bands text[] not null default '{}',
  icon_reference text,
  artwork_theme_code text,
  display_order integer not null default 0,
  active boolean not null default true
);

create table if not exists public.learning_programs (
  id uuid primary key default gen_random_uuid(),
  program_code text not null,
  program_version integer not null,
  program_name text not null,
  program_description text not null,
  catalogue_id uuid references public.learning_catalogues(id) on delete set null,
  source_program_id uuid references public.programs(id) on delete set null,
  primary_category_id uuid references public.learning_categories(id) on delete set null,
  audience_types text[] not null,
  eligible_age_bands text[] not null default '{}',
  duration_type text not null,
  duration_value integer not null,
  duration_unit text not null,
  estimated_total_minutes integer,
  minimum_completion_days integer,
  assignment_required boolean not null default false,
  self_enrolment_allowed boolean not null default true,
  evidence_required boolean not null default false,
  worker_review_required boolean not null default false,
  certificate_available boolean not null default true,
  risk_pathway text,
  court_relevant boolean not null default false,
  learning_outcomes jsonb not null default '[]'::jsonb,
  lifecycle_status text not null default 'draft',
  effective_from timestamptz,
  effective_to timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  constraint learning_program_unique unique (program_code, program_version)
);

create table if not exists public.learning_courses (
  id uuid primary key default gen_random_uuid(),
  course_code text not null,
  course_version integer not null,
  course_name text not null,
  course_description text not null,
  source_course_id uuid references public.courses(id) on delete set null,
  primary_category_id uuid references public.learning_categories(id) on delete set null,
  audience_types text[] not null,
  age_bands text[] not null default '{}',
  difficulty_level text not null default 'foundation',
  estimated_minutes integer,
  minimum_completion_minutes integer,
  prerequisite_course_ids uuid[] not null default '{}',
  prerequisite_competency_codes text[] not null default '{}',
  video_first boolean not null default true,
  reflection_required boolean not null default true,
  quiz_required boolean not null default true,
  activity_required boolean not null default true,
  evidence_task_required boolean not null default false,
  certificate_available boolean not null default true,
  court_relevant boolean not null default false,
  lifecycle_status text not null default 'draft',
  created_by uuid references auth.users(id) on delete set null,
  constraint learning_course_unique unique (course_code, course_version)
);

create table if not exists public.learning_program_courses (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.learning_programs(id) on delete cascade,
  course_id uuid not null references public.learning_courses(id) on delete restrict,
  sequence_number integer not null,
  mandatory boolean not null default true,
  unlock_rule jsonb not null default '{}'::jsonb,
  completion_weight numeric not null default 1,
  constraint learning_program_course_unique unique (program_id, course_id),
  constraint learning_program_course_sequence_unique unique (program_id, sequence_number)
);

create table if not exists public.learning_modules (
  id uuid primary key default gen_random_uuid(),
  module_code text not null,
  module_version integer not null,
  module_name text not null,
  module_description text,
  estimated_minutes integer,
  learning_outcomes jsonb not null default '[]'::jsonb,
  opening_definition_prompt text,
  closing_reflection_prompt text,
  lifecycle_status text not null default 'draft',
  constraint learning_module_unique unique (module_code, module_version)
);

create table if not exists public.learning_course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.learning_courses(id) on delete cascade,
  module_id uuid not null references public.learning_modules(id) on delete restrict,
  sequence_number integer not null,
  mandatory boolean not null default true,
  unlock_rule jsonb not null default '{}'::jsonb,
  constraint learning_course_module_unique unique (course_id, module_id),
  constraint learning_course_module_sequence_unique unique (course_id, sequence_number)
);

create table if not exists public.learning_weeks (
  id uuid primary key default gen_random_uuid(),
  week_code text not null,
  week_version integer not null,
  week_name text not null,
  week_description text,
  weekly_theme text not null,
  opening_meaning_prompt text,
  weekly_goal_prompt text,
  closing_review_prompt text,
  expected_days integer not null default 7,
  estimated_minutes integer,
  lifecycle_status text not null default 'draft',
  constraint learning_week_unique unique (week_code, week_version)
);

create table if not exists public.learning_module_weeks (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.learning_modules(id) on delete cascade,
  week_id uuid not null references public.learning_weeks(id) on delete restrict,
  sequence_number integer not null,
  constraint learning_module_week_unique unique (module_id, week_id),
  constraint learning_module_week_sequence_unique unique (module_id, sequence_number)
);

create table if not exists public.learning_lessons (
  id uuid primary key default gen_random_uuid(),
  lesson_code text not null,
  lesson_version integer not null,
  lesson_title text not null,
  lesson_summary text not null,
  source_lesson_id uuid references public.lessons(id) on delete set null,
  primary_category_id uuid references public.learning_categories(id) on delete set null,
  audience_types text[] not null,
  age_bands text[] not null default '{}',
  estimated_minutes integer not null default 30,
  minimum_active_minutes integer not null default 10,
  difficulty_level text not null default 'foundation',
  opening_question text not null,
  opening_question_helper_text text,
  learning_outcomes jsonb not null default '[]'::jsonb,
  key_messages jsonb not null default '[]'::jsonb,
  required_activity_count integer not null default 2,
  required_quiz_count integer not null default 1,
  required_reflection_count integer not null default 1,
  evidence_task_required boolean not null default false,
  worker_review_required boolean not null default false,
  court_relevant boolean not null default false,
  allow_skip boolean not null default false,
  completion_check_count integer not null default 2,
  video_first boolean not null default true,
  artwork_theme_code text,
  cultural_adaptation_supported boolean not null default true,
  lifecycle_status text not null default 'draft',
  created_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  constraint learning_lesson_unique unique (lesson_code, lesson_version)
);

create table if not exists public.learning_week_lessons (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references public.learning_weeks(id) on delete cascade,
  lesson_id uuid not null references public.learning_lessons(id) on delete restrict,
  day_number integer,
  sequence_number integer not null,
  mandatory boolean not null default true,
  unlock_rule jsonb not null default '{}'::jsonb,
  constraint learning_week_lesson_unique unique (week_id, lesson_id),
  constraint learning_week_lesson_sequence_unique unique (week_id, sequence_number)
);

create table if not exists public.learning_lesson_screens (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.learning_lessons(id) on delete cascade,
  screen_number integer not null,
  screen_type text not null,
  screen_title text not null,
  screen_subtitle text,
  body_content jsonb not null,
  interaction_config jsonb not null default '{}'::jsonb,
  artwork_reference text,
  background_theme_code text,
  requires_response boolean not null default false,
  minimum_response_characters integer,
  completion_rule jsonb not null default '{}'::jsonb,
  accessibility_label text,
  screen_reader_content text,
  constraint learning_lesson_screen_unique unique (lesson_id, screen_number)
);

create table if not exists public.learning_content_blocks (
  id uuid primary key default gen_random_uuid(),
  block_code text not null,
  block_version integer not null,
  block_type text not null,
  block_title text,
  content jsonb not null,
  supported_audiences text[] not null default '{}',
  supported_age_bands text[] not null default '{}',
  supported_languages text[] not null default '{en-AU}',
  accessibility_metadata jsonb not null default '{}'::jsonb,
  lifecycle_status text not null default 'draft',
  constraint learning_content_block_unique unique (block_code, block_version)
);

create table if not exists public.learning_screen_content_blocks (
  id uuid primary key default gen_random_uuid(),
  lesson_screen_id uuid not null references public.learning_lesson_screens(id) on delete cascade,
  content_block_id uuid not null references public.learning_content_blocks(id) on delete restrict,
  display_order integer not null,
  display_conditions jsonb not null default '{}'::jsonb,
  constraint learning_screen_block_unique unique (lesson_screen_id, content_block_id)
);

create table if not exists public.learning_videos (
  id uuid primary key default gen_random_uuid(),
  video_code text not null unique,
  video_title text not null,
  video_description text,
  storage_reference text not null,
  streaming_reference text,
  duration_seconds integer not null,
  presenter_type text,
  production_style text,
  language_code text not null default 'en-AU',
  transcript_reference text,
  captions_reference text,
  audio_description_reference text,
  child_safe boolean not null default false,
  trauma_sensitive boolean not null default true,
  minimum_watch_percentage numeric not null default 80,
  allow_speed_control boolean not null default true,
  lifecycle_status text not null default 'draft'
);

create table if not exists public.learning_video_segments (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.learning_videos(id) on delete cascade,
  segment_number integer not null,
  segment_title text not null,
  start_seconds integer not null,
  end_seconds integer not null,
  key_message text,
  reflection_prompt text,
  checkpoint_required boolean not null default false,
  constraint learning_video_segment_unique unique (video_id, segment_number)
);

create table if not exists public.learning_lesson_videos (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.learning_lessons(id) on delete cascade,
  video_id uuid not null references public.learning_videos(id) on delete restrict,
  display_order integer not null default 1,
  mandatory boolean not null default true,
  constraint learning_lesson_video_unique unique (lesson_id, video_id)
);

create table if not exists public.learning_activities (
  id uuid primary key default gen_random_uuid(),
  activity_code text not null,
  activity_version integer not null,
  activity_name text not null,
  activity_type text not null,
  instructions text not null,
  activity_config jsonb not null,
  expected_minutes integer,
  response_format text not null,
  minimum_response_requirements jsonb not null default '{}'::jsonb,
  evidence_capable boolean not null default false,
  family_participation_supported boolean not null default false,
  lifecycle_status text not null default 'draft',
  constraint learning_activity_unique unique (activity_code, activity_version)
);

create table if not exists public.learning_lesson_activities (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.learning_lessons(id) on delete cascade,
  activity_id uuid not null references public.learning_activities(id) on delete restrict,
  sequence_number integer not null,
  mandatory boolean not null default true,
  completion_weight numeric not null default 1,
  constraint learning_lesson_activity_unique unique (lesson_id, activity_id)
);

alter table public.learning_scenarios add column if not exists scenario_version integer not null default 1;
alter table public.learning_scenarios add column if not exists audience_types text[] not null default '{}';
alter table public.learning_scenarios add column if not exists age_bands text[] not null default '{}';
alter table public.learning_scenarios add column if not exists scenario_characters jsonb not null default '[]'::jsonb;
alter table public.learning_scenarios add column if not exists scenario_stages jsonb not null default '[]'::jsonb;
alter table public.learning_scenarios add column if not exists decision_points jsonb not null default '[]'::jsonb;
alter table public.learning_scenarios add column if not exists no_single_correct_answer boolean not null default false;
alter table public.learning_scenarios add column if not exists lifecycle_status text not null default 'draft';

create table if not exists public.learning_lesson_scenarios (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.learning_lessons(id) on delete cascade,
  scenario_id uuid not null references public.learning_scenarios(id) on delete restrict,
  sequence_number integer not null,
  mandatory boolean not null default true,
  constraint learning_lesson_scenario_unique unique (lesson_id, scenario_id)
);

create table if not exists public.learning_quizzes (
  id uuid primary key default gen_random_uuid(),
  quiz_code text not null,
  quiz_version integer not null,
  quiz_name text not null,
  quiz_description text,
  pass_percentage numeric not null default 70,
  maximum_attempts integer,
  allow_retry boolean not null default true,
  randomise_questions boolean not null default false,
  show_correct_answers boolean not null default true,
  remediation_required_on_failure boolean not null default true,
  lifecycle_status text not null default 'draft',
  constraint learning_quiz_unique unique (quiz_code, quiz_version)
);

create table if not exists public.learning_quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.learning_quizzes(id) on delete cascade,
  question_number integer not null,
  question_type text not null,
  question_text text not null,
  question_media_reference text,
  answer_options jsonb,
  correct_answer jsonb,
  scoring_rule jsonb not null,
  explanation_correct text,
  explanation_incorrect text,
  competency_codes text[] not null default '{}',
  constraint learning_quiz_question_unique unique (quiz_id, question_number)
);

create table if not exists public.learning_lesson_quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.learning_lessons(id) on delete cascade,
  quiz_id uuid not null references public.learning_quizzes(id) on delete restrict,
  mandatory boolean not null default true,
  sequence_number integer not null,
  constraint learning_lesson_quiz_unique unique (lesson_id, quiz_id)
);

create table if not exists public.learning_reflection_prompts (
  id uuid primary key default gen_random_uuid(),
  prompt_code text not null,
  prompt_version integer not null,
  prompt_type text not null,
  prompt_text text not null,
  helper_text text,
  audience_types text[] not null,
  age_bands text[] not null default '{}',
  minimum_characters integer,
  maximum_characters integer,
  sensitive_response boolean not null default false,
  worker_review_permitted boolean not null default true,
  parent_access_permitted boolean not null default true,
  lifecycle_status text not null default 'draft',
  constraint learning_reflection_prompt_unique unique (prompt_code, prompt_version)
);

create table if not exists public.learning_lesson_reflections (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.learning_lessons(id) on delete cascade,
  reflection_prompt_id uuid not null references public.learning_reflection_prompts(id) on delete restrict,
  sequence_number integer not null,
  mandatory boolean not null default true,
  constraint learning_lesson_reflection_unique unique (lesson_id, reflection_prompt_id)
);

create table if not exists public.learning_evidence_tasks (
  id uuid primary key default gen_random_uuid(),
  task_code text not null,
  task_version integer not null,
  task_name text not null,
  task_description text not null,
  acceptable_evidence_types text[] not null,
  prohibited_evidence_types text[] not null default '{}',
  child_participation_possible boolean not null default false,
  child_consent_required boolean not null default false,
  privacy_guidance text not null,
  safety_guidance text,
  worker_review_required boolean not null default false,
  rubric_code text,
  lifecycle_status text not null default 'draft',
  constraint learning_evidence_task_unique unique (task_code, task_version)
);

create table if not exists public.learning_lesson_evidence_tasks (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.learning_lessons(id) on delete cascade,
  evidence_task_id uuid not null references public.learning_evidence_tasks(id) on delete restrict,
  sequence_number integer not null,
  mandatory boolean not null default false,
  constraint learning_lesson_evidence_task_unique unique (lesson_id, evidence_task_id)
);

alter table public.learning_competencies add column if not exists audience_types text[] not null default '{}';
alter table public.learning_competencies add column if not exists level_definitions jsonb not null default '[]'::jsonb;
alter table public.learning_competencies add column if not exists evidence_requirements jsonb not null default '{}'::jsonb;
alter table public.learning_competencies add column if not exists review_required boolean not null default false;
alter table public.learning_competencies add column if not exists active boolean not null default true;

create table if not exists public.learning_lesson_competencies (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.learning_lessons(id) on delete cascade,
  competency_id uuid not null references public.learning_competencies(id) on delete cascade,
  competency_weight numeric not null default 1,
  expected_level text not null,
  constraint learning_lesson_competency_unique unique (lesson_id, competency_id)
);

create table if not exists public.learning_enrolments (
  id uuid primary key default gen_random_uuid(),
  enrolment_reference text not null unique,
  user_id uuid references auth.users(id) on delete cascade,
  child_user_id uuid,
  family_id uuid,
  case_id uuid references public.cases(id) on delete set null,
  program_id uuid references public.learning_programs(id) on delete restrict,
  course_id uuid references public.learning_courses(id) on delete restrict,
  enrolment_type text not null,
  assigned_by_user_id uuid references auth.users(id) on delete set null,
  assignment_reason text,
  court_or_case_relevant boolean not null default false,
  enrolled_at timestamptz not null default now(),
  required_start_at timestamptz,
  required_completion_at timestamptz,
  status text not null default 'active',
  constraint learning_enrolment_target_check check (program_id is not null or course_id is not null)
);

create table if not exists public.learning_enrolment_goals (
  id uuid primary key default gen_random_uuid(),
  enrolment_id uuid not null references public.learning_enrolments(id) on delete cascade,
  goal_type text not null,
  goal_description text not null,
  linked_competency_ids uuid[] not null default '{}',
  target_date date,
  goal_status text not null default 'active',
  created_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.learning_lesson_attempts (
  id uuid primary key default gen_random_uuid(),
  enrolment_id uuid not null references public.learning_enrolments(id) on delete cascade,
  lesson_id uuid not null references public.learning_lessons(id) on delete restrict,
  attempt_number integer not null,
  status text not null default 'started',
  started_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  completed_at timestamptz,
  active_seconds integer not null default 0,
  completion_percentage numeric not null default 0,
  opening_response_completed boolean not null default false,
  activities_completed integer not null default 0,
  quizzes_completed integer not null default 0,
  reflections_completed integer not null default 0,
  evidence_tasks_completed integer not null default 0,
  worker_review_status text not null default 'not_required',
  constraint learning_lesson_attempt_unique unique (enrolment_id, lesson_id, attempt_number)
);

create table if not exists public.learning_screen_progress (
  id uuid primary key default gen_random_uuid(),
  lesson_attempt_id uuid not null references public.learning_lesson_attempts(id) on delete cascade,
  lesson_screen_id uuid not null references public.learning_lesson_screens(id) on delete cascade,
  status text not null default 'not_started',
  first_opened_at timestamptz,
  last_opened_at timestamptz,
  completed_at timestamptz,
  active_seconds integer not null default 0,
  response_complete boolean not null default false,
  constraint learning_screen_progress_unique unique (lesson_attempt_id, lesson_screen_id)
);

create table if not exists public.learning_activity_responses (
  id uuid primary key default gen_random_uuid(),
  lesson_attempt_id uuid not null references public.learning_lesson_attempts(id) on delete cascade,
  activity_id uuid not null references public.learning_activities(id) on delete restrict,
  response_data jsonb not null,
  response_text text,
  completed boolean not null default false,
  submitted_at timestamptz,
  last_saved_at timestamptz not null default now(),
  worker_visible boolean not null default true,
  user_can_edit boolean not null default true,
  constraint learning_activity_response_unique unique (lesson_attempt_id, activity_id)
);

create table if not exists public.learning_reflection_responses (
  id uuid primary key default gen_random_uuid(),
  lesson_attempt_id uuid not null references public.learning_lesson_attempts(id) on delete cascade,
  reflection_prompt_id uuid not null references public.learning_reflection_prompts(id) on delete restrict,
  response_text text,
  response_data jsonb,
  privacy_level text not null default 'standard',
  shared_with_worker boolean not null default true,
  shared_with_parent boolean not null default true,
  saved_at timestamptz not null default now(),
  submitted_at timestamptz,
  constraint learning_reflection_response_unique unique (lesson_attempt_id, reflection_prompt_id)
);

create table if not exists public.learning_quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  lesson_attempt_id uuid not null references public.learning_lesson_attempts(id) on delete cascade,
  quiz_id uuid not null references public.learning_quizzes(id) on delete restrict,
  attempt_number integer not null,
  score_percentage numeric,
  passed boolean,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint learning_quiz_attempt_unique unique (lesson_attempt_id, quiz_id, attempt_number)
);

create table if not exists public.learning_quiz_answers (
  id uuid primary key default gen_random_uuid(),
  quiz_attempt_id uuid not null references public.learning_quiz_attempts(id) on delete cascade,
  quiz_question_id uuid not null references public.learning_quiz_questions(id) on delete cascade,
  submitted_answer jsonb,
  correct boolean,
  score_awarded numeric,
  answered_at timestamptz not null default now(),
  constraint learning_quiz_answer_unique unique (quiz_attempt_id, quiz_question_id)
);

alter table public.learning_video_progress add column if not exists lesson_attempt_id uuid references public.learning_lesson_attempts(id) on delete cascade;
alter table public.learning_video_progress add column if not exists video_id uuid references public.learning_videos(id) on delete cascade;
alter table public.learning_video_progress add column if not exists furthest_position_seconds integer not null default 0;
alter table public.learning_video_progress add column if not exists watch_percentage numeric not null default 0;
alter table public.learning_video_progress add column if not exists required_checkpoints_completed integer not null default 0;
alter table public.learning_video_progress add column if not exists first_started_at timestamptz;

create table if not exists public.learning_evidence_submissions (
  id uuid primary key default gen_random_uuid(),
  lesson_attempt_id uuid not null references public.learning_lesson_attempts(id) on delete cascade,
  evidence_task_id uuid not null references public.learning_evidence_tasks(id) on delete restrict,
  submission_reference text not null unique,
  evidence_type text not null,
  evidence_file_reference text,
  evidence_text text,
  evidence_metadata jsonb not null default '{}'::jsonb,
  child_visible boolean not null default false,
  child_consent_confirmed boolean,
  submission_status text not null default 'submitted',
  submitted_at timestamptz not null default now()
);

create table if not exists public.learning_evidence_reviews (
  id uuid primary key default gen_random_uuid(),
  evidence_submission_id uuid not null references public.learning_evidence_submissions(id) on delete cascade,
  reviewer_user_id uuid references auth.users(id) on delete set null,
  review_outcome text not null,
  review_comments text,
  rubric_scores jsonb not null default '{}'::jsonb,
  resubmission_required boolean not null default false,
  reviewed_at timestamptz not null default now()
);

create table if not exists public.learning_competency_progress (
  id uuid primary key default gen_random_uuid(),
  enrolment_id uuid not null references public.learning_enrolments(id) on delete cascade,
  competency_id uuid not null references public.learning_competencies(id) on delete cascade,
  current_level text not null,
  confidence_status text not null default 'emerging',
  evidence_count integer not null default 0,
  completed_lesson_count integer not null default 0,
  worker_confirmed boolean not null default false,
  first_demonstrated_at timestamptz,
  last_demonstrated_at timestamptz,
  constraint learning_competency_progress_unique unique (enrolment_id, competency_id)
);

create table if not exists public.learning_daily_challenges (
  id uuid primary key default gen_random_uuid(),
  challenge_code text not null,
  challenge_version integer not null,
  challenge_name text not null,
  challenge_description text not null,
  category_id uuid references public.learning_categories(id) on delete set null,
  audience_types text[] not null,
  age_bands text[] not null default '{}',
  expected_minutes integer not null default 10,
  challenge_type text not null,
  instructions jsonb not null,
  reflection_prompt text,
  evidence_optional boolean not null default true,
  difficulty_level text not null default 'foundation',
  lifecycle_status text not null default 'draft',
  constraint learning_daily_challenge_unique unique (challenge_code, challenge_version)
);

alter table public.learning_challenge_assignments add column if not exists enrolment_id uuid references public.learning_enrolments(id) on delete cascade;
alter table public.learning_challenge_assignments add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.learning_challenge_assignments add column if not exists daily_challenge_id uuid references public.learning_daily_challenges(id) on delete restrict;
alter table public.learning_challenge_assignments add column if not exists assigned_for_date date;
alter table public.learning_challenge_assignments add column if not exists assignment_source text not null default 'manual';
alter table public.learning_challenge_assignments add column if not exists mandatory boolean not null default false;

create table if not exists public.learning_challenge_completions (
  id uuid primary key default gen_random_uuid(),
  challenge_assignment_id uuid not null references public.learning_challenge_assignments(id) on delete cascade,
  response_text text,
  response_data jsonb,
  evidence_reference text,
  completed_at timestamptz,
  completion_status text not null default 'started',
  worker_review_status text not null default 'not_required'
);

alter table public.learning_weekly_missions add column if not exists mission_version integer not null default 1;
alter table public.learning_weekly_missions add column if not exists mission_name text;
alter table public.learning_weekly_missions add column if not exists mission_description text;
alter table public.learning_weekly_missions add column if not exists objective text;
alter table public.learning_weekly_missions add column if not exists task_definitions jsonb not null default '[]'::jsonb;
alter table public.learning_weekly_missions add column if not exists minimum_completed_tasks integer not null default 1;
alter table public.learning_weekly_missions add column if not exists family_participation_supported boolean not null default true;
alter table public.learning_weekly_missions add column if not exists evidence_required boolean not null default false;

create table if not exists public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  path_code text not null,
  path_version integer not null,
  path_name text not null,
  path_description text not null,
  target_audience_types text[] not null,
  entry_rules jsonb not null default '{}'::jsonb,
  path_steps jsonb not null default '[]'::jsonb,
  personalisation_supported boolean not null default true,
  lifecycle_status text not null default 'draft',
  constraint learning_path_unique unique (path_code, path_version)
);

create table if not exists public.learning_recommendations (
  id uuid primary key default gen_random_uuid(),
  recommendation_reference text not null unique,
  user_id uuid references auth.users(id) on delete cascade,
  child_user_id uuid,
  enrolment_id uuid references public.learning_enrolments(id) on delete set null,
  recommended_content_type text not null,
  recommended_content_id uuid not null,
  recommendation_reason text not null,
  signal_summary jsonb not null default '{}'::jsonb,
  ai_generated boolean not null default false,
  human_review_status text not null default 'not_required',
  accepted_at timestamptz,
  dismissed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.learning_progression_rules (
  id uuid primary key default gen_random_uuid(),
  rule_code text not null unique,
  rule_name text not null,
  applies_to_type text not null,
  applies_to_id uuid,
  rule_config jsonb not null,
  blocking boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.learning_completion_events (
  id uuid primary key default gen_random_uuid(),
  event_reference text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  enrolment_id uuid references public.learning_enrolments(id) on delete set null,
  completed_content_type text not null,
  completed_content_id uuid not null,
  completion_evidence jsonb not null default '{}'::jsonb,
  worker_review_required boolean not null default false,
  completed_at timestamptz not null default now()
);

create table if not exists public.learning_course_progress (
  id uuid primary key default gen_random_uuid(),
  enrolment_id uuid not null references public.learning_enrolments(id) on delete cascade,
  course_id uuid not null references public.learning_courses(id) on delete cascade,
  lesson_count integer not null default 0,
  completed_lesson_count integer not null default 0,
  required_lesson_count integer not null default 0,
  completed_required_lesson_count integer not null default 0,
  completion_percentage numeric not null default 0,
  status text not null default 'not_started',
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint learning_course_progress_unique unique (enrolment_id, course_id)
);

create table if not exists public.learning_program_progress (
  id uuid primary key default gen_random_uuid(),
  enrolment_id uuid not null references public.learning_enrolments(id) on delete cascade,
  program_id uuid not null references public.learning_programs(id) on delete cascade,
  course_count integer not null default 0,
  completed_course_count integer not null default 0,
  completion_percentage numeric not null default 0,
  competency_summary jsonb not null default '{}'::jsonb,
  evidence_summary jsonb not null default '{}'::jsonb,
  worker_review_status text not null default 'not_required',
  status text not null default 'not_started',
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint learning_program_progress_unique unique (enrolment_id, program_id)
);

create table if not exists public.learning_certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_reference text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  enrolment_id uuid references public.learning_enrolments(id) on delete set null,
  course_id uuid references public.learning_courses(id) on delete set null,
  program_id uuid references public.learning_programs(id) on delete set null,
  certificate_title text not null,
  certificate_type text not null,
  evidence_summary jsonb not null default '{}'::jsonb,
  issued_by uuid references auth.users(id) on delete set null,
  issued_at timestamptz not null default now()
);

alter table public.learning_badges add column if not exists badge_visual_reference text;
alter table public.learning_badges add column if not exists award_criteria jsonb not null default '{}'::jsonb;
alter table public.learning_badge_awards add column if not exists enrolment_id uuid references public.learning_enrolments(id) on delete set null;
alter table public.learning_streaks add column if not exists streak_start_date date;

create table if not exists public.learning_journals (
  id uuid primary key default gen_random_uuid(),
  journal_reference text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  child_user_id uuid,
  enrolment_id uuid references public.learning_enrolments(id) on delete set null,
  journal_type text not null,
  privacy_level text not null default 'private',
  created_at timestamptz not null default now()
);

create table if not exists public.learning_journal_entries (
  id uuid primary key default gen_random_uuid(),
  journal_id uuid not null references public.learning_journals(id) on delete cascade,
  prompt_reference text,
  entry_title text,
  entry_text text,
  entry_data jsonb not null default '{}'::jsonb,
  share_with_worker boolean not null default false,
  share_with_parent boolean not null default false,
  safety_flags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_assignments (
  id uuid primary key default gen_random_uuid(),
  assignment_reference text not null unique,
  user_id uuid references auth.users(id) on delete cascade,
  child_user_id uuid,
  assigned_content_type text not null,
  assigned_content_id uuid not null,
  assigned_by_user_id uuid references auth.users(id) on delete set null,
  reason text,
  mandatory boolean not null default false,
  due_at timestamptz,
  status text not null default 'assigned',
  created_at timestamptz not null default now()
);

create table if not exists public.learning_review_notes (
  id uuid primary key default gen_random_uuid(),
  review_reference text not null unique,
  enrolment_id uuid references public.learning_enrolments(id) on delete cascade,
  lesson_attempt_id uuid references public.learning_lesson_attempts(id) on delete cascade,
  reviewer_user_id uuid references auth.users(id) on delete set null,
  review_type text not null,
  note_text text not null,
  visibility text not null default 'worker_only',
  created_at timestamptz not null default now()
);

create table if not exists public.learning_cultural_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  child_user_id uuid,
  cultural_identity_notes text,
  language_preferences text[] not null default '{}',
  interpreter_required boolean not null default false,
  cultural_support_preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, child_user_id)
);

create table if not exists public.learning_content_adaptations (
  id uuid primary key default gen_random_uuid(),
  source_content_type text not null,
  source_content_id uuid not null,
  adaptation_type text not null,
  language_code text,
  cultural_context text,
  accessibility_context text,
  adapted_content jsonb not null,
  reviewed_by uuid references auth.users(id) on delete set null,
  lifecycle_status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists public.learning_accessibility_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  child_user_id uuid,
  plain_language_required boolean not null default false,
  easy_read_required boolean not null default false,
  screen_reader_required boolean not null default false,
  captions_required boolean not null default false,
  audio_description_required boolean not null default false,
  reduced_motion_required boolean not null default false,
  visual_supports_required boolean not null default false,
  accessibility_notes text,
  updated_at timestamptz not null default now(),
  unique (user_id, child_user_id)
);

create table if not exists public.learning_lesson_quality_reviews (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.learning_lessons(id) on delete cascade,
  review_reference text not null unique,
  reviewer_user_id uuid references auth.users(id) on delete set null,
  content_accuracy_status text not null,
  child_safety_status text not null,
  cultural_status text not null default 'not_reviewed',
  accessibility_status text not null default 'not_reviewed',
  evidence_task_status text not null default 'not_reviewed',
  publication_recommendation text not null,
  findings jsonb not null default '[]'::jsonb,
  reviewed_at timestamptz not null default now()
);

create or replace function public.can_publish_learning_lesson(p_lesson_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.learning_lessons l
    where l.id = p_lesson_id
      and l.lifecycle_status in ('draft', 'review')
      and exists (select 1 from public.learning_lesson_screens s where s.lesson_id = l.id)
      and exists (select 1 from public.learning_lesson_quality_reviews q where q.lesson_id = l.id and q.publication_recommendation in ('publish', 'publish_with_conditions'))
      and not exists (select 1 from public.learning_lesson_quality_reviews q where q.lesson_id = l.id and q.publication_recommendation = 'do_not_publish')
  );
$$;

create or replace function public.can_complete_learning_lesson(p_lesson_attempt_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.learning_lesson_attempts a
    join public.learning_lessons l on l.id = a.lesson_id
    where a.id = p_lesson_attempt_id
      and a.active_seconds >= (l.minimum_active_minutes * 60)
      and a.activities_completed >= l.required_activity_count
      and a.quizzes_completed >= l.required_quiz_count
      and a.reflections_completed >= l.required_reflection_count
      and (
        l.evidence_task_required = false
        or a.evidence_tasks_completed > 0
      )
      and (
        l.worker_review_required = false
        or a.worker_review_status = 'approved'
      )
  );
$$;

create or replace function public.can_complete_learning_course(p_enrolment_id uuid, p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.learning_course_progress p
    where p.enrolment_id = p_enrolment_id
      and p.course_id = p_course_id
      and p.completion_percentage >= 100
      and p.completed_required_lesson_count >= p.required_lesson_count
  );
$$;

create or replace function public.can_issue_structured_learning_certificate(p_enrolment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.learning_enrolments e
    left join public.learning_program_progress pp on pp.enrolment_id = e.id
    left join public.learning_course_progress cp on cp.enrolment_id = e.id
    where e.id = p_enrolment_id
      and (
        coalesce(pp.completion_percentage, 0) >= 100
        or coalesce(cp.completion_percentage, 0) >= 100
      )
      and coalesce(pp.worker_review_status, 'not_required') in ('not_required', 'approved')
  );
$$;

create index if not exists idx_learning_catalogues_org_status on public.learning_catalogues(organisation_id, lifecycle_status);
create index if not exists idx_learning_programs_catalogue_status on public.learning_programs(catalogue_id, lifecycle_status);
create index if not exists idx_learning_courses_status on public.learning_courses(lifecycle_status, court_relevant);
create index if not exists idx_learning_lessons_status on public.learning_lessons(lifecycle_status, court_relevant);
create index if not exists idx_learning_lesson_attempts_enrolment on public.learning_lesson_attempts(enrolment_id, lesson_id, status);
create index if not exists idx_learning_enrolments_user_status on public.learning_enrolments(user_id, status);
create index if not exists idx_learning_enrolments_child_status on public.learning_enrolments(child_user_id, status);
create index if not exists idx_learning_completion_events_user on public.learning_completion_events(user_id, completed_at desc);
create index if not exists idx_learning_assignments_user on public.learning_assignments(user_id, status, due_at);
create index if not exists idx_learning_review_notes_enrolment on public.learning_review_notes(enrolment_id, created_at desc);

grant select, insert, update on
  public.learning_catalogues,
  public.learning_categories,
  public.learning_programs,
  public.learning_courses,
  public.learning_program_courses,
  public.learning_modules,
  public.learning_course_modules,
  public.learning_weeks,
  public.learning_module_weeks,
  public.learning_lessons,
  public.learning_week_lessons,
  public.learning_lesson_screens,
  public.learning_content_blocks,
  public.learning_screen_content_blocks,
  public.learning_videos,
  public.learning_video_segments,
  public.learning_lesson_videos,
  public.learning_activities,
  public.learning_lesson_activities,
  public.learning_lesson_scenarios,
  public.learning_quizzes,
  public.learning_quiz_questions,
  public.learning_lesson_quizzes,
  public.learning_reflection_prompts,
  public.learning_lesson_reflections,
  public.learning_evidence_tasks,
  public.learning_lesson_evidence_tasks,
  public.learning_lesson_competencies,
  public.learning_enrolments,
  public.learning_enrolment_goals,
  public.learning_lesson_attempts,
  public.learning_screen_progress,
  public.learning_activity_responses,
  public.learning_reflection_responses,
  public.learning_quiz_attempts,
  public.learning_quiz_answers,
  public.learning_evidence_submissions,
  public.learning_evidence_reviews,
  public.learning_competency_progress,
  public.learning_daily_challenges,
  public.learning_challenge_completions,
  public.learning_paths,
  public.learning_recommendations,
  public.learning_progression_rules,
  public.learning_completion_events,
  public.learning_course_progress,
  public.learning_program_progress,
  public.learning_certificates,
  public.learning_journals,
  public.learning_journal_entries,
  public.learning_assignments,
  public.learning_review_notes,
  public.learning_cultural_profiles,
  public.learning_content_adaptations,
  public.learning_accessibility_profiles,
  public.learning_lesson_quality_reviews
to authenticated;

alter table public.learning_catalogues enable row level security;
alter table public.learning_categories enable row level security;
alter table public.learning_programs enable row level security;
alter table public.learning_courses enable row level security;
alter table public.learning_program_courses enable row level security;
alter table public.learning_modules enable row level security;
alter table public.learning_course_modules enable row level security;
alter table public.learning_weeks enable row level security;
alter table public.learning_module_weeks enable row level security;
alter table public.learning_lessons enable row level security;
alter table public.learning_week_lessons enable row level security;
alter table public.learning_lesson_screens enable row level security;
alter table public.learning_content_blocks enable row level security;
alter table public.learning_screen_content_blocks enable row level security;
alter table public.learning_videos enable row level security;
alter table public.learning_video_segments enable row level security;
alter table public.learning_lesson_videos enable row level security;
alter table public.learning_activities enable row level security;
alter table public.learning_lesson_activities enable row level security;
alter table public.learning_lesson_scenarios enable row level security;
alter table public.learning_quizzes enable row level security;
alter table public.learning_quiz_questions enable row level security;
alter table public.learning_lesson_quizzes enable row level security;
alter table public.learning_reflection_prompts enable row level security;
alter table public.learning_lesson_reflections enable row level security;
alter table public.learning_evidence_tasks enable row level security;
alter table public.learning_lesson_evidence_tasks enable row level security;
alter table public.learning_lesson_competencies enable row level security;
alter table public.learning_enrolments enable row level security;
alter table public.learning_enrolment_goals enable row level security;
alter table public.learning_lesson_attempts enable row level security;
alter table public.learning_screen_progress enable row level security;
alter table public.learning_activity_responses enable row level security;
alter table public.learning_reflection_responses enable row level security;
alter table public.learning_quiz_attempts enable row level security;
alter table public.learning_quiz_answers enable row level security;
alter table public.learning_evidence_submissions enable row level security;
alter table public.learning_evidence_reviews enable row level security;
alter table public.learning_competency_progress enable row level security;
alter table public.learning_daily_challenges enable row level security;
alter table public.learning_challenge_completions enable row level security;
alter table public.learning_paths enable row level security;
alter table public.learning_recommendations enable row level security;
alter table public.learning_progression_rules enable row level security;
alter table public.learning_completion_events enable row level security;
alter table public.learning_course_progress enable row level security;
alter table public.learning_program_progress enable row level security;
alter table public.learning_certificates enable row level security;
alter table public.learning_journals enable row level security;
alter table public.learning_journal_entries enable row level security;
alter table public.learning_assignments enable row level security;
alter table public.learning_review_notes enable row level security;
alter table public.learning_cultural_profiles enable row level security;
alter table public.learning_content_adaptations enable row level security;
alter table public.learning_accessibility_profiles enable row level security;
alter table public.learning_lesson_quality_reviews enable row level security;

create policy "Structured learning catalogues readable" on public.learning_catalogues for select to authenticated using (public_access = true or lifecycle_status = 'published' or public.current_user_has_role('admin'));
create policy "Structured learning catalogues managed by admins" on public.learning_catalogues for all to authenticated using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));
create policy "Structured learning categories readable" on public.learning_categories for select to authenticated using (active = true or public.current_user_has_role('admin'));
create policy "Structured learning categories managed by admins" on public.learning_categories for all to authenticated using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));
create policy "Structured learning programs readable" on public.learning_programs for select to authenticated using (lifecycle_status in ('published', 'active') or public.current_user_has_role('admin'));
create policy "Structured learning programs managed by admins" on public.learning_programs for all to authenticated using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));
create policy "Structured learning courses readable" on public.learning_courses for select to authenticated using (lifecycle_status in ('published', 'active') or public.current_user_has_role('admin'));
create policy "Structured learning courses managed by admins" on public.learning_courses for all to authenticated using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));
create policy "Structured learning lessons readable" on public.learning_lessons for select to authenticated using (lifecycle_status in ('published', 'active') or public.current_user_has_role('admin'));
create policy "Structured learning lessons managed by admins" on public.learning_lessons for all to authenticated using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));
create policy "Learning enrolments visible to participants" on public.learning_enrolments for select to authenticated using (user_id = auth.uid() or assigned_by_user_id = auth.uid() or public.current_user_has_role('admin'));
create policy "Learning enrolments writable by participant or admin" on public.learning_enrolments for all to authenticated using (user_id = auth.uid() or public.current_user_has_role('admin')) with check (user_id = auth.uid() or public.current_user_has_role('admin'));
create policy "Learning attempts visible to enrolment participant" on public.learning_lesson_attempts for select to authenticated using (exists (select 1 from public.learning_enrolments e where e.id = enrolment_id and (e.user_id = auth.uid() or public.current_user_has_role('admin'))));
create policy "Learning attempts writable by enrolment participant" on public.learning_lesson_attempts for all to authenticated using (exists (select 1 from public.learning_enrolments e where e.id = enrolment_id and (e.user_id = auth.uid() or public.current_user_has_role('admin')))) with check (exists (select 1 from public.learning_enrolments e where e.id = enrolment_id and (e.user_id = auth.uid() or public.current_user_has_role('admin'))));
create policy "Learning evidence submissions visible by enrolment" on public.learning_evidence_submissions for select to authenticated using (exists (select 1 from public.learning_lesson_attempts a join public.learning_enrolments e on e.id = a.enrolment_id where a.id = lesson_attempt_id and (e.user_id = auth.uid() or public.current_user_has_role('admin'))));
create policy "Learning evidence submissions writable by enrolment" on public.learning_evidence_submissions for insert to authenticated with check (exists (select 1 from public.learning_lesson_attempts a join public.learning_enrolments e on e.id = a.enrolment_id where a.id = lesson_attempt_id and (e.user_id = auth.uid() or public.current_user_has_role('admin'))));
create policy "Learning review notes managed by staff" on public.learning_review_notes for all to authenticated using (public.current_user_has_role('admin') or reviewer_user_id = auth.uid()) with check (public.current_user_has_role('admin') or reviewer_user_id = auth.uid());
create policy "Learning journals visible to owner" on public.learning_journals for select to authenticated using (user_id = auth.uid() or public.current_user_has_role('admin'));
create policy "Learning journals writable by owner" on public.learning_journals for all to authenticated using (user_id = auth.uid() or public.current_user_has_role('admin')) with check (user_id = auth.uid() or public.current_user_has_role('admin'));
create policy "Learning recommendations visible to owner" on public.learning_recommendations for select to authenticated using (user_id = auth.uid() or public.current_user_has_role('admin'));
create policy "Learning recommendations managed by admin" on public.learning_recommendations for all to authenticated using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));
create policy "Learning adaptations managed by admins" on public.learning_content_adaptations for all to authenticated using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));
create policy "Learning accessibility profiles visible to owner" on public.learning_accessibility_profiles for select to authenticated using (user_id = auth.uid() or public.current_user_has_role('admin'));
create policy "Learning accessibility profiles writable by owner" on public.learning_accessibility_profiles for all to authenticated using (user_id = auth.uid() or public.current_user_has_role('admin')) with check (user_id = auth.uid() or public.current_user_has_role('admin'));
create policy "Learning quality reviews managed by admins" on public.learning_lesson_quality_reviews for all to authenticated using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));

revoke all on function public.can_publish_learning_lesson(uuid) from public;
revoke all on function public.can_complete_learning_lesson(uuid) from public;
revoke all on function public.can_complete_learning_course(uuid, uuid) from public;
revoke all on function public.can_issue_structured_learning_certificate(uuid) from public;
grant execute on function public.can_publish_learning_lesson(uuid) to authenticated;
grant execute on function public.can_complete_learning_lesson(uuid) to authenticated;
grant execute on function public.can_complete_learning_course(uuid, uuid) to authenticated;
grant execute on function public.can_issue_structured_learning_certificate(uuid) to authenticated;
