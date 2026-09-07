create extension if not exists pgcrypto;

create table if not exists public.learning_frameworks (
  id uuid primary key default gen_random_uuid(),
  framework_code text not null unique,
  framework_name text not null,
  audience text not null,
  purpose text not null,
  age_range text,
  trauma_informed boolean not null default true,
  culturally_adaptable boolean not null default true,
  evidence_required boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'active', 'retired')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_course_frameworks (
  id uuid primary key default gen_random_uuid(),
  framework_id uuid not null references public.learning_frameworks(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  program_id uuid references public.programs(id) on delete set null,
  framework_version integer not null default 1,
  delivery_mode text not null default 'guided',
  minimum_completion_percentage numeric not null default 100,
  requires_reflection boolean not null default true,
  requires_evidence boolean not null default false,
  status text not null default 'active' check (status in ('draft', 'active', 'retired')),
  created_at timestamptz not null default now(),
  unique (framework_id, course_id, framework_version)
);

create table if not exists public.learning_pathways (
  id uuid primary key default gen_random_uuid(),
  pathway_code text not null unique,
  pathway_name text not null,
  pathway_type text not null,
  target_audience text not null,
  description text not null,
  recommended_duration_days integer,
  entry_criteria jsonb not null default '{}'::jsonb,
  completion_criteria jsonb not null default '{}'::jsonb,
  safety_notes text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_pathway_items (
  id uuid primary key default gen_random_uuid(),
  pathway_id uuid not null references public.learning_pathways(id) on delete cascade,
  item_type text not null check (item_type in ('program', 'course', 'lesson', 'challenge', 'activity', 'knowledge_check', 'scenario')),
  item_id uuid not null,
  sequence_number integer not null,
  required boolean not null default true,
  unlock_rule jsonb not null default '{}'::jsonb,
  expected_minutes integer,
  created_at timestamptz not null default now(),
  unique (pathway_id, sequence_number)
);

create table if not exists public.learning_outcomes (
  id uuid primary key default gen_random_uuid(),
  outcome_code text not null unique,
  outcome_title text not null,
  outcome_description text not null,
  domain text not null,
  audience text not null,
  developmental_stage text,
  observable_indicators jsonb not null default '[]'::jsonb,
  evidence_examples jsonb not null default '[]'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.learning_competencies (
  id uuid primary key default gen_random_uuid(),
  competency_code text not null unique,
  competency_name text not null,
  competency_description text not null,
  competency_domain text not null,
  level_count integer not null default 4,
  court_relevant boolean not null default false,
  child_safe boolean not null default true,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.learning_competency_levels (
  id uuid primary key default gen_random_uuid(),
  competency_id uuid not null references public.learning_competencies(id) on delete cascade,
  level_number integer not null,
  level_label text not null,
  level_description text not null,
  behaviour_indicators jsonb not null default '[]'::jsonb,
  evidence_requirements jsonb not null default '[]'::jsonb,
  unique (competency_id, level_number)
);

create table if not exists public.learning_content_outcome_links (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('program', 'course', 'lesson', 'challenge', 'activity', 'scenario', 'story')),
  content_id uuid not null,
  outcome_id uuid not null references public.learning_outcomes(id) on delete cascade,
  competency_id uuid references public.learning_competencies(id) on delete set null,
  evidence_strength text not null default 'supporting',
  created_at timestamptz not null default now(),
  unique (content_type, content_id, outcome_id)
);

create table if not exists public.learning_knowledge_checks (
  id uuid primary key default gen_random_uuid(),
  check_code text not null unique,
  lesson_id uuid references public.lessons(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  check_type text not null check (check_type in ('quiz', 'reflection', 'scenario_choice', 'sequence', 'short_answer')),
  pass_threshold_percentage numeric not null default 80,
  max_attempts integer,
  requires_human_review boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.learning_knowledge_check_items (
  id uuid primary key default gen_random_uuid(),
  knowledge_check_id uuid not null references public.learning_knowledge_checks(id) on delete cascade,
  item_number integer not null,
  prompt text not null,
  response_schema jsonb not null default '{}'::jsonb,
  correct_response jsonb,
  scoring_guidance text,
  safety_flag_rules jsonb not null default '[]'::jsonb,
  unique (knowledge_check_id, item_number)
);

create table if not exists public.learning_knowledge_check_attempts (
  id uuid primary key default gen_random_uuid(),
  knowledge_check_id uuid not null references public.learning_knowledge_checks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  enrolment_id uuid references public.enrolments(id) on delete set null,
  attempt_number integer not null,
  responses jsonb not null default '{}'::jsonb,
  score_percentage numeric,
  passed boolean not null default false,
  safety_review_required boolean not null default false,
  completed_at timestamptz not null default now(),
  unique (knowledge_check_id, user_id, attempt_number)
);

create table if not exists public.learning_scenarios (
  id uuid primary key default gen_random_uuid(),
  scenario_code text not null unique,
  scenario_title text not null,
  scenario_context text not null,
  audience text not null,
  developmental_stage text,
  risk_sensitivity text not null default 'standard',
  expected_skills jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.learning_scenario_steps (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.learning_scenarios(id) on delete cascade,
  step_number integer not null,
  prompt text not null,
  choices jsonb not null default '[]'::jsonb,
  feedback_rules jsonb not null default '[]'::jsonb,
  escalation_rules jsonb not null default '[]'::jsonb,
  unique (scenario_id, step_number)
);

create table if not exists public.learning_scenario_attempts (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.learning_scenarios(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  child_user_id uuid,
  enrolment_id uuid references public.enrolments(id) on delete set null,
  responses jsonb not null default '[]'::jsonb,
  learning_feedback text,
  safety_flags jsonb not null default '[]'::jsonb,
  completed_at timestamptz not null default now()
);

create table if not exists public.learning_interactive_activities (
  id uuid primary key default gen_random_uuid(),
  activity_code text not null unique,
  activity_title text not null,
  activity_type text not null check (activity_type in ('worksheet', 'role_play', 'family_activity', 'game', 'drawing', 'audio_reflection', 'practice_task')),
  audience text not null,
  instructions text not null,
  estimated_minutes integer,
  requires_evidence_upload boolean not null default false,
  child_participation_allowed boolean not null default false,
  safety_constraints jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.learning_activity_completions (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.learning_interactive_activities(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  enrolment_id uuid references public.enrolments(id) on delete set null,
  child_user_id uuid,
  completion_notes text,
  evidence_item_ids uuid[] not null default '{}',
  shared_with_worker boolean not null default false,
  completed_at timestamptz not null default now(),
  unique (activity_id, user_id, completed_at)
);

create table if not exists public.learning_challenge_templates (
  id uuid primary key default gen_random_uuid(),
  challenge_code text not null unique,
  challenge_title text not null,
  challenge_type text not null check (challenge_type in ('parent', 'child', 'daily', 'weekly_mission', 'family')),
  audience text not null,
  description text not null,
  required_minutes integer,
  evidence_required boolean not null default false,
  minimum_age_group text,
  safety_review_required boolean not null default false,
  recurrence_rule jsonb not null default '{}'::jsonb,
  reward_points integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.learning_challenge_assignments (
  id uuid primary key default gen_random_uuid(),
  challenge_template_id uuid not null references public.learning_challenge_templates(id) on delete cascade,
  assigned_to_user_id uuid not null references auth.users(id) on delete cascade,
  child_user_id uuid,
  enrolment_id uuid references public.enrolments(id) on delete set null,
  assigned_by uuid references auth.users(id) on delete set null,
  due_at timestamptz,
  status text not null default 'assigned' check (status in ('assigned', 'accepted', 'in_progress', 'completed', 'skipped', 'withdrawn')),
  evidence_required boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.learning_challenge_evidence_requirements (
  id uuid primary key default gen_random_uuid(),
  challenge_template_id uuid not null references public.learning_challenge_templates(id) on delete cascade,
  evidence_type text not null,
  description text not null,
  mandatory boolean not null default true,
  privacy_level text not null default 'participant_controlled',
  created_at timestamptz not null default now()
);

create table if not exists public.learning_weekly_missions (
  id uuid primary key default gen_random_uuid(),
  mission_code text not null unique,
  pathway_id uuid references public.learning_pathways(id) on delete set null,
  program_id uuid references public.programs(id) on delete set null,
  week_number integer not null,
  mission_title text not null,
  mission_summary text not null,
  required_challenge_count integer not null default 1,
  reflection_prompt text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.learning_monthly_programs (
  id uuid primary key default gen_random_uuid(),
  monthly_program_code text not null unique,
  program_id uuid references public.programs(id) on delete set null,
  month_number integer not null,
  monthly_topic text not null,
  learning_goal text not null,
  pathway_id uuid references public.learning_pathways(id) on delete set null,
  certificate_eligible boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.learning_reflection_journals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  child_user_id uuid,
  enrolment_id uuid references public.enrolments(id) on delete set null,
  content_type text not null,
  content_id uuid,
  prompt text not null,
  response text not null,
  visibility text not null default 'private' check (visibility in ('private', 'worker', 'court_export_candidate')),
  safety_flags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.learning_video_lessons (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade,
  video_reference text not null unique,
  title text not null,
  duration_seconds integer not null,
  transcript_reference text,
  captions_available boolean not null default false,
  audio_description_available boolean not null default false,
  interactive_cue_points jsonb not null default '[]'::jsonb,
  safety_review_status text not null default 'pending',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.learning_video_progress (
  id uuid primary key default gen_random_uuid(),
  video_lesson_id uuid not null references public.learning_video_lessons(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  watched_seconds integer not null default 0,
  completed boolean not null default false,
  cue_responses jsonb not null default '{}'::jsonb,
  last_watched_at timestamptz not null default now(),
  unique (video_lesson_id, user_id)
);

create table if not exists public.learning_storybooks (
  id uuid primary key default gen_random_uuid(),
  storybook_code text not null unique,
  title text not null,
  audience text not null,
  age_group text not null,
  theme text not null,
  story_summary text not null,
  pages jsonb not null default '[]'::jsonb,
  caregiver_guidance text,
  child_privacy_mode text not null default 'child_controlled',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.learning_family_activities (
  id uuid primary key default gen_random_uuid(),
  family_activity_code text not null unique,
  title text not null,
  description text not null,
  activity_goal text not null,
  recommended_participants text[] not null default '{}',
  safety_preconditions jsonb not null default '[]'::jsonb,
  evidence_prompt text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.learning_badges (
  id uuid primary key default gen_random_uuid(),
  badge_code text not null unique,
  badge_name text not null,
  badge_description text not null,
  badge_category text not null,
  award_rule jsonb not null default '{}'::jsonb,
  points_value integer not null default 0,
  child_safe_label text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.learning_badge_awards (
  id uuid primary key default gen_random_uuid(),
  badge_id uuid not null references public.learning_badges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  child_user_id uuid,
  source_type text not null,
  source_id uuid,
  awarded_by uuid references auth.users(id) on delete set null,
  shared_with_child boolean not null default false,
  awarded_at timestamptz not null default now(),
  unique (badge_id, user_id, source_type, source_id)
);

create table if not exists public.learning_streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  streak_type text not null,
  current_count integer not null default 0,
  longest_count integer not null default 0,
  last_activity_date date,
  streak_status text not null default 'active',
  updated_at timestamptz not null default now(),
  unique (user_id, streak_type)
);

create table if not exists public.learning_certificate_requirements (
  id uuid primary key default gen_random_uuid(),
  requirement_code text not null unique,
  certificate_type text not null,
  course_id uuid references public.courses(id) on delete cascade,
  program_id uuid references public.programs(id) on delete cascade,
  required_outcome_ids uuid[] not null default '{}',
  required_competency_ids uuid[] not null default '{}',
  minimum_lesson_completion_percentage numeric not null default 100,
  minimum_challenge_completion_count integer not null default 0,
  evidence_required boolean not null default false,
  supervisor_review_required boolean not null default false,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.learning_certificate_eligibility (
  id uuid primary key default gen_random_uuid(),
  requirement_id uuid not null references public.learning_certificate_requirements(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  enrolment_id uuid references public.enrolments(id) on delete set null,
  eligible boolean not null default false,
  blockers jsonb not null default '[]'::jsonb,
  calculated_at timestamptz not null default now(),
  reviewed_by uuid references auth.users(id) on delete set null,
  unique (requirement_id, user_id, enrolment_id)
);

create table if not exists public.learning_personalisation_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  child_user_id uuid,
  preferred_language text,
  accessibility_needs jsonb not null default '[]'::jsonb,
  learning_preferences jsonb not null default '{}'::jsonb,
  safety_constraints jsonb not null default '[]'::jsonb,
  ai_personalisation_allowed boolean not null default false,
  human_review_required boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (user_id, child_user_id)
);

create table if not exists public.learning_personalisation_recommendations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.learning_personalisation_profiles(id) on delete cascade,
  recommendation_reference text not null unique,
  recommended_item_type text not null,
  recommended_item_id uuid not null,
  reason_summary text not null,
  evidence_signals jsonb not null default '[]'::jsonb,
  ai_generated boolean not null default false,
  confidence_level text not null default 'medium',
  human_review_status text not null default 'not_required',
  accepted_by_user boolean,
  created_at timestamptz not null default now()
);

create table if not exists public.learning_safety_reviews (
  id uuid primary key default gen_random_uuid(),
  content_type text not null,
  content_id uuid not null,
  review_reason text not null,
  child_safety_status text not null,
  family_violence_status text not null default 'not_applicable',
  accessibility_status text not null default 'not_reviewed',
  cultural_review_status text not null default 'not_reviewed',
  reviewer_id uuid references auth.users(id) on delete set null,
  findings jsonb not null default '[]'::jsonb,
  reviewed_at timestamptz not null default now(),
  unique (content_type, content_id, review_reason)
);

create table if not exists public.learning_progress_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  enrolment_id uuid references public.enrolments(id) on delete set null,
  snapshot_date date not null default current_date,
  lesson_completion_percentage numeric not null default 0,
  challenge_completion_count integer not null default 0,
  competency_progress jsonb not null default '{}'::jsonb,
  certificate_progress jsonb not null default '{}'::jsonb,
  safety_review_pending_count integer not null default 0,
  calculated_at timestamptz not null default now(),
  unique (user_id, enrolment_id, snapshot_date)
);

create table if not exists public.learning_audit_events (
  id uuid primary key default gen_random_uuid(),
  event_reference text not null unique,
  event_category text not null,
  event_action text not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  child_user_id uuid,
  target_type text not null,
  target_id uuid,
  previous_state_hash text,
  new_state_hash text,
  event_metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create or replace function public.can_complete_learning_challenge(
  p_assignment_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.learning_challenge_assignments a
    left join public.learning_challenge_templates t on t.id = a.challenge_template_id
    where a.id = p_assignment_id
      and a.assigned_to_user_id = p_user_id
      and a.status in ('assigned', 'accepted', 'in_progress')
      and (
        coalesce(a.evidence_required, false) = false
        or exists (
          select 1
          from public.evidence_items e
          where e.owner_id = p_user_id
            and e.status in ('stored', 'shared')
            and e.created_at >= a.created_at
        )
      )
      and coalesce(t.safety_review_required, false) = false
  );
$$;

create or replace function public.can_issue_learning_certificate(
  p_requirement_id uuid,
  p_user_id uuid,
  p_enrolment_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.learning_certificate_eligibility e
    join public.learning_certificate_requirements r on r.id = e.requirement_id
    where e.requirement_id = p_requirement_id
      and e.user_id = p_user_id
      and (p_enrolment_id is null or e.enrolment_id = p_enrolment_id)
      and e.eligible = true
      and jsonb_array_length(e.blockers) = 0
      and (
        r.supervisor_review_required = false
        or e.reviewed_by is not null
      )
  );
$$;

create or replace function public.can_use_ai_learning_personalisation(
  p_profile_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.learning_personalisation_profiles p
    where p.id = p_profile_id
      and p.user_id = p_user_id
      and p.ai_personalisation_allowed = true
      and p.human_review_required = false
      and jsonb_array_length(p.safety_constraints) = 0
  );
$$;

create index if not exists idx_learning_pathway_items_pathway on public.learning_pathway_items(pathway_id, sequence_number);
create index if not exists idx_learning_outcomes_domain on public.learning_outcomes(domain, audience);
create index if not exists idx_learning_knowledge_attempts_user on public.learning_knowledge_check_attempts(user_id, completed_at desc);
create index if not exists idx_learning_scenario_attempts_user on public.learning_scenario_attempts(user_id, completed_at desc);
create index if not exists idx_learning_activity_completions_user on public.learning_activity_completions(user_id, completed_at desc);
create index if not exists idx_learning_challenge_assignments_user on public.learning_challenge_assignments(assigned_to_user_id, status, due_at);
create index if not exists idx_learning_reflection_journals_user on public.learning_reflection_journals(user_id, created_at desc);
create index if not exists idx_learning_video_progress_user on public.learning_video_progress(user_id, last_watched_at desc);
create index if not exists idx_learning_badge_awards_user on public.learning_badge_awards(user_id, awarded_at desc);
create index if not exists idx_learning_progress_snapshots_user on public.learning_progress_snapshots(user_id, snapshot_date desc);
create index if not exists idx_learning_audit_events_target on public.learning_audit_events(target_type, target_id, occurred_at desc);

grant select, insert, update on
  public.learning_frameworks,
  public.learning_course_frameworks,
  public.learning_pathways,
  public.learning_pathway_items,
  public.learning_outcomes,
  public.learning_competencies,
  public.learning_competency_levels,
  public.learning_content_outcome_links,
  public.learning_knowledge_checks,
  public.learning_knowledge_check_items,
  public.learning_knowledge_check_attempts,
  public.learning_scenarios,
  public.learning_scenario_steps,
  public.learning_scenario_attempts,
  public.learning_interactive_activities,
  public.learning_activity_completions,
  public.learning_challenge_templates,
  public.learning_challenge_assignments,
  public.learning_challenge_evidence_requirements,
  public.learning_weekly_missions,
  public.learning_monthly_programs,
  public.learning_reflection_journals,
  public.learning_video_lessons,
  public.learning_video_progress,
  public.learning_storybooks,
  public.learning_family_activities,
  public.learning_badges,
  public.learning_badge_awards,
  public.learning_streaks,
  public.learning_certificate_requirements,
  public.learning_certificate_eligibility,
  public.learning_personalisation_profiles,
  public.learning_personalisation_recommendations,
  public.learning_safety_reviews,
  public.learning_progress_snapshots,
  public.learning_audit_events
to authenticated;

alter table public.learning_frameworks enable row level security;
alter table public.learning_course_frameworks enable row level security;
alter table public.learning_pathways enable row level security;
alter table public.learning_pathway_items enable row level security;
alter table public.learning_outcomes enable row level security;
alter table public.learning_competencies enable row level security;
alter table public.learning_competency_levels enable row level security;
alter table public.learning_content_outcome_links enable row level security;
alter table public.learning_knowledge_checks enable row level security;
alter table public.learning_knowledge_check_items enable row level security;
alter table public.learning_knowledge_check_attempts enable row level security;
alter table public.learning_scenarios enable row level security;
alter table public.learning_scenario_steps enable row level security;
alter table public.learning_scenario_attempts enable row level security;
alter table public.learning_interactive_activities enable row level security;
alter table public.learning_activity_completions enable row level security;
alter table public.learning_challenge_templates enable row level security;
alter table public.learning_challenge_assignments enable row level security;
alter table public.learning_challenge_evidence_requirements enable row level security;
alter table public.learning_weekly_missions enable row level security;
alter table public.learning_monthly_programs enable row level security;
alter table public.learning_reflection_journals enable row level security;
alter table public.learning_video_lessons enable row level security;
alter table public.learning_video_progress enable row level security;
alter table public.learning_storybooks enable row level security;
alter table public.learning_family_activities enable row level security;
alter table public.learning_badges enable row level security;
alter table public.learning_badge_awards enable row level security;
alter table public.learning_streaks enable row level security;
alter table public.learning_certificate_requirements enable row level security;
alter table public.learning_certificate_eligibility enable row level security;
alter table public.learning_personalisation_profiles enable row level security;
alter table public.learning_personalisation_recommendations enable row level security;
alter table public.learning_safety_reviews enable row level security;
alter table public.learning_progress_snapshots enable row level security;
alter table public.learning_audit_events enable row level security;

create policy "Learning catalogue readable by signed-in users" on public.learning_frameworks for select to authenticated using (status in ('active', 'draft') or public.current_user_has_role('admin'));
create policy "Learning catalogue managed by admins" on public.learning_frameworks for all to authenticated using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));

create policy "Learning pathways readable by signed-in users" on public.learning_pathways for select to authenticated using (status = 'published' or public.current_user_has_role('admin'));
create policy "Learning pathways managed by admins" on public.learning_pathways for all to authenticated using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));

create policy "Learning content readable by signed-in users" on public.learning_outcomes for select to authenticated using (status = 'active' or public.current_user_has_role('admin'));
create policy "Learning content managed by admins" on public.learning_outcomes for all to authenticated using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));

create policy "Learning competency catalogue readable" on public.learning_competencies for select to authenticated using (status = 'active' or public.current_user_has_role('admin'));
create policy "Learning competency catalogue managed by admins" on public.learning_competencies for all to authenticated using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));

create policy "Learning challenge templates readable" on public.learning_challenge_templates for select to authenticated using (status = 'published' or public.current_user_has_role('admin'));
create policy "Learning challenge templates managed by admins" on public.learning_challenge_templates for all to authenticated using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));

create policy "Learning user attempts are owner visible" on public.learning_knowledge_check_attempts for select to authenticated using (user_id = auth.uid() or public.current_user_has_role('admin'));
create policy "Learning user attempts are owner writable" on public.learning_knowledge_check_attempts for insert to authenticated with check (user_id = auth.uid() or public.current_user_has_role('admin'));

create policy "Learning scenario attempts are owner visible" on public.learning_scenario_attempts for select to authenticated using (user_id = auth.uid() or public.current_user_has_role('admin'));
create policy "Learning scenario attempts are owner writable" on public.learning_scenario_attempts for insert to authenticated with check (user_id = auth.uid() or public.current_user_has_role('admin'));

create policy "Learning activity completions are owner visible" on public.learning_activity_completions for select to authenticated using (user_id = auth.uid() or public.current_user_has_role('admin'));
create policy "Learning activity completions are owner writable" on public.learning_activity_completions for insert to authenticated with check (user_id = auth.uid() or public.current_user_has_role('admin'));

create policy "Learning challenge assignments visible to participant" on public.learning_challenge_assignments for select to authenticated using (assigned_to_user_id = auth.uid() or assigned_by = auth.uid() or public.current_user_has_role('admin'));
create policy "Learning challenge assignments writable by participant or admin" on public.learning_challenge_assignments for all to authenticated using (assigned_to_user_id = auth.uid() or public.current_user_has_role('admin')) with check (assigned_to_user_id = auth.uid() or public.current_user_has_role('admin'));

create policy "Learning journals are owner visible" on public.learning_reflection_journals for select to authenticated using (user_id = auth.uid() or public.current_user_has_role('admin'));
create policy "Learning journals are owner writable" on public.learning_reflection_journals for insert to authenticated with check (user_id = auth.uid() or public.current_user_has_role('admin'));

create policy "Learning video progress is owner visible" on public.learning_video_progress for select to authenticated using (user_id = auth.uid() or public.current_user_has_role('admin'));
create policy "Learning video progress is owner writable" on public.learning_video_progress for all to authenticated using (user_id = auth.uid() or public.current_user_has_role('admin')) with check (user_id = auth.uid() or public.current_user_has_role('admin'));

create policy "Learning badge awards are owner visible" on public.learning_badge_awards for select to authenticated using (user_id = auth.uid() or public.current_user_has_role('admin'));
create policy "Learning badge awards managed by admins" on public.learning_badge_awards for all to authenticated using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));

create policy "Learning streaks are owner visible" on public.learning_streaks for select to authenticated using (user_id = auth.uid() or public.current_user_has_role('admin'));
create policy "Learning streaks are owner writable" on public.learning_streaks for all to authenticated using (user_id = auth.uid() or public.current_user_has_role('admin')) with check (user_id = auth.uid() or public.current_user_has_role('admin'));

create policy "Learning certificate eligibility visible to owner" on public.learning_certificate_eligibility for select to authenticated using (user_id = auth.uid() or public.current_user_has_role('admin'));
create policy "Learning certificate eligibility managed by admins" on public.learning_certificate_eligibility for all to authenticated using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));

create policy "Learning personalisation profiles visible to owner" on public.learning_personalisation_profiles for select to authenticated using (user_id = auth.uid() or public.current_user_has_role('admin'));
create policy "Learning personalisation profiles writable by owner" on public.learning_personalisation_profiles for all to authenticated using (user_id = auth.uid() or public.current_user_has_role('admin')) with check (user_id = auth.uid() or public.current_user_has_role('admin'));

create policy "Learning personalisation recommendations visible to owner" on public.learning_personalisation_recommendations for select to authenticated using (exists (select 1 from public.learning_personalisation_profiles p where p.id = profile_id and (p.user_id = auth.uid() or public.current_user_has_role('admin'))));
create policy "Learning safety reviews managed by admins" on public.learning_safety_reviews for all to authenticated using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));
create policy "Learning progress snapshots visible to owner" on public.learning_progress_snapshots for select to authenticated using (user_id = auth.uid() or public.current_user_has_role('admin'));
create policy "Learning audit appendable" on public.learning_audit_events for insert to authenticated with check (actor_user_id = auth.uid() or public.current_user_has_role('admin'));
create policy "Learning audit readable by admins" on public.learning_audit_events for select to authenticated using (public.current_user_has_role('admin'));

revoke all on function public.can_complete_learning_challenge(uuid, uuid) from public;
revoke all on function public.can_issue_learning_certificate(uuid, uuid, uuid) from public;
revoke all on function public.can_use_ai_learning_personalisation(uuid, uuid) from public;
grant execute on function public.can_complete_learning_challenge(uuid, uuid) to authenticated;
grant execute on function public.can_issue_learning_certificate(uuid, uuid, uuid) to authenticated;
grant execute on function public.can_use_ai_learning_personalisation(uuid, uuid) to authenticated;
