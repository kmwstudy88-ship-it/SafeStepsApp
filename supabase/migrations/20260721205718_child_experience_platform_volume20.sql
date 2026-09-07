create extension if not exists pgcrypto;

alter table public.child_profiles
  add column if not exists child_id uuid,
  add column if not exists developmental_age_band text,
  add column if not exists communication_modes text[] not null default '{}',
  add column if not exists privacy_review_status text not null default 'pending';

update public.child_profiles
set child_id = coalesce(child_id, id)
where child_id is null;

create unique index if not exists child_profiles_child_id_unique
  on public.child_profiles(child_id)
  where child_id is not null;

create table if not exists public.child_accounts (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null unique,
  user_id uuid unique references auth.users(id) on delete set null,
  account_reference text not null unique,
  account_mode text not null,
  authentication_method text not null,
  username_alias text,
  child_display_name text not null,
  independent_access_allowed boolean not null default false,
  parent_assisted_access_allowed boolean not null default false,
  worker_assisted_access_allowed boolean not null default true,
  shared_device_mode boolean not null default false,
  discreet_access_enabled boolean not null default false,
  account_status text not null default 'pending',
  activated_at timestamptz,
  suspended_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.child_development_profiles_v20 (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null unique,
  chronological_age_years numeric,
  developmental_age_band text,
  reading_level text,
  language_code text not null default 'en-AU',
  communication_modes text[] not null default '{}',
  preferred_response_modes text[] not null default '{}',
  attention_supports jsonb not null default '[]'::jsonb,
  sensory_supports jsonb not null default '[]'::jsonb,
  emotional_supports jsonb not null default '[]'::jsonb,
  disability_supports jsonb not null default '[]'::jsonb,
  neurodivergence_supports jsonb not null default '[]'::jsonb,
  interpreter_required boolean not null default false,
  communication_partner_required boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.child_interface_profiles (
  id uuid primary key default gen_random_uuid(),
  child_account_id uuid not null unique references public.child_accounts(id) on delete cascade,
  interface_age_mode text not null,
  visual_theme_code text,
  text_size text not null default 'standard',
  reading_support_enabled boolean not null default false,
  text_to_speech_enabled boolean not null default false,
  captions_enabled boolean not null default true,
  reduced_motion_enabled boolean not null default false,
  high_contrast_enabled boolean not null default false,
  symbol_support_enabled boolean not null default false,
  simplified_language_enabled boolean not null default false,
  session_length_minutes integer,
  break_prompt_interval_minutes integer,
  updated_at timestamptz not null default now()
);

create table if not exists public.child_consent_assent_records (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null,
  consent_type text not null,
  activity_or_feature_type text not null,
  activity_or_feature_reference text,
  legal_consent_status text not null default 'unknown',
  legal_consent_provider_reference text,
  child_assent_status text not null default 'not_requested',
  child_understanding_checked boolean not null default false,
  explanation_version text not null,
  explanation_method text not null,
  limitations_explained boolean not null default false,
  provided_at timestamptz,
  withdrawn_at timestamptz,
  recorded_by_user_id uuid references auth.users(id) on delete set null
);

create table if not exists public.child_privacy_profiles (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null unique,
  default_parent_access text not null default 'restricted',
  default_worker_access text not null default 'restricted',
  default_child_only_access text not null default 'enabled',
  allow_child_sharing_choices boolean not null default true,
  restricted_parent_references jsonb not null default '[]'::jsonb,
  restricted_worker_references jsonb not null default '[]'::jsonb,
  legal_access_limitations jsonb not null default '[]'::jsonb,
  safety_access_limitations jsonb not null default '[]'::jsonb,
  emergency_override_allowed boolean not null default true,
  reviewed_at timestamptz,
  review_due_at timestamptz
);

create table if not exists public.child_sharing_preferences (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null,
  content_category text not null,
  default_sharing_level text not null,
  allowed_recipient_types text[] not null default '{}',
  blocked_recipient_references jsonb not null default '[]'::jsonb,
  ask_before_each_share boolean not null default true,
  allow_withdrawal boolean not null default true,
  safety_override_explanation text,
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  unique (child_id, content_category, effective_from)
);

create table if not exists public.child_dashboard_configurations (
  id uuid primary key default gen_random_uuid(),
  child_account_id uuid not null unique references public.child_accounts(id) on delete cascade,
  enabled_widgets text[] not null default '{}',
  widget_order jsonb not null default '[]'::jsonb,
  show_feelings_checkin boolean not null default true,
  show_lessons boolean not null default true,
  show_tasks boolean not null default true,
  show_my_story boolean not null default true,
  show_visit_reflection boolean not null default true,
  show_safe_people boolean not null default true,
  show_achievements boolean not null default true,
  show_requests boolean not null default true,
  safety_help_button_visible boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.child_feeling_definitions (
  id uuid primary key default gen_random_uuid(),
  feeling_code text not null unique,
  feeling_name text not null,
  child_friendly_definition text not null,
  emotion_family text,
  intensity_levels jsonb not null default '[]'::jsonb,
  age_band_codes text[] not null default '{}',
  symbol_reference text,
  image_reference text,
  audio_reference text,
  active boolean not null default true
);

alter table public.child_feelings_checkins
  add column if not exists checkin_reference text,
  add column if not exists child_id uuid,
  add column if not exists checkin_context text not null default 'daily',
  add column if not exists primary_feeling_code text,
  add column if not exists additional_feeling_codes text[] not null default '{}',
  add column if not exists intensity_rating integer,
  add column if not exists body_sensation_codes text[] not null default '{}',
  add column if not exists child_response_text text,
  add column if not exists child_response_audio_reference text,
  add column if not exists child_response_drawing_reference text,
  add column if not exists wants_support boolean not null default false,
  add column if not exists wants_to_talk_to_reference text,
  add column if not exists immediate_safety_concern_indicated boolean not null default false,
  add column if not exists sharing_level text not null default 'child_only',
  add column if not exists completed_at timestamptz;

update public.child_feelings_checkins
set child_id = coalesce(child_id, child_user_id),
    checkin_reference = coalesce(checkin_reference, 'FEEL-' || id::text),
    primary_feeling_code = coalesce(primary_feeling_code, feeling),
    child_response_text = coalesce(child_response_text, note),
    completed_at = coalesce(completed_at, created_at)
where child_id is null or checkin_reference is null or completed_at is null;

create unique index if not exists child_feelings_checkins_reference_unique
  on public.child_feelings_checkins(checkin_reference)
  where checkin_reference is not null;

create table if not exists public.child_body_map_responses (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null,
  feelings_checkin_id uuid references public.child_feelings_checkins(id) on delete cascade,
  activity_reference text,
  marked_body_regions jsonb not null,
  sensation_descriptions jsonb not null default '[]'::jsonb,
  child_explanation text,
  sharing_level text not null default 'child_only',
  created_at timestamptz not null default now()
);

create table if not exists public.child_support_requests (
  id uuid primary key default gen_random_uuid(),
  request_reference text not null unique,
  child_id uuid not null,
  request_category text not null,
  request_title text,
  child_request_text text,
  child_request_audio_reference text,
  child_request_drawing_reference text,
  requested_recipient_type text,
  requested_recipient_reference text,
  urgency_selected_by_child text not null default 'not_sure',
  system_safety_priority text not null default 'routine',
  child_wants_private_response boolean not null default false,
  status text not null default 'submitted',
  submitted_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  resolved_at timestamptz
);

create table if not exists public.child_support_request_responses (
  id uuid primary key default gen_random_uuid(),
  child_support_request_id uuid not null references public.child_support_requests(id) on delete cascade,
  responder_user_id uuid references auth.users(id) on delete set null,
  response_type text not null,
  child_friendly_response text not null,
  action_summary text,
  expected_next_step text,
  expected_timeframe_text text,
  information_shared_with_others jsonb not null default '[]'::jsonb,
  sharing_reason text,
  child_understanding_checked boolean not null default false,
  responded_at timestamptz not null default now()
);

alter table public.child_safe_people
  add column if not exists child_id uuid,
  add column if not exists person_type text not null default 'person',
  add column if not exists person_reference text,
  add column if not exists person_display_name text,
  add column if not exists relationship_to_child text,
  add column if not exists child_selected boolean not null default false,
  add column if not exists adult_verified boolean not null default false,
  add column if not exists contact_allowed boolean not null default false,
  add column if not exists communication_methods text[] not null default '{}',
  add column if not exists safe_for_emergency_contact boolean not null default false,
  add column if not exists safe_for_emotional_support boolean not null default false,
  add column if not exists safe_for_transport boolean not null default false,
  add column if not exists contact_restrictions jsonb not null default '{}'::jsonb,
  add column if not exists active boolean not null default true;

update public.child_safe_people
set child_id = coalesce(child_id, child_user_id),
    person_display_name = coalesce(person_display_name, safe_person_name),
    relationship_to_child = coalesce(relationship_to_child, relationship),
    contact_allowed = coalesce(contact_allowed, can_contact)
where child_id is null or person_display_name is null;

create table if not exists public.child_safe_places (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null,
  place_name text not null,
  place_type text not null,
  location_reference text,
  child_selected boolean not null default false,
  adult_verified boolean not null default false,
  when_to_use text,
  how_to_get_there text,
  who_will_be_there text,
  safety_limitations text,
  active boolean not null default true
);

create table if not exists public.child_friendly_safety_plans (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null,
  source_safety_plan_id uuid,
  plan_version integer not null,
  plan_title text not null,
  when_i_might_need_help jsonb not null default '[]'::jsonb,
  signs_i_notice jsonb not null default '[]'::jsonb,
  things_i_can_do jsonb not null default '[]'::jsonb,
  safe_people jsonb not null default '[]'::jsonb,
  safe_places jsonb not null default '[]'::jsonb,
  how_to_get_help jsonb not null default '[]'::jsonb,
  emergency_steps jsonb not null default '[]'::jsonb,
  child_helped_create boolean not null default false,
  child_understanding_checked boolean not null default false,
  status text not null default 'draft',
  effective_from timestamptz,
  review_due_at timestamptz,
  unique (child_id, plan_version)
);

create table if not exists public.child_storybooks (
  id uuid primary key default gen_random_uuid(),
  storybook_reference text not null unique,
  child_id uuid not null,
  title text not null default 'My Story',
  storybook_type text not null default 'personal',
  child_controls_sharing boolean not null default true,
  default_sharing_level text not null default 'child_only',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.child_storybook_pages (
  id uuid primary key default gen_random_uuid(),
  child_storybook_id uuid not null references public.child_storybooks(id) on delete cascade,
  page_reference text not null unique,
  page_sequence integer not null,
  page_type text not null,
  page_title text,
  child_text text,
  child_audio_reference text,
  child_drawing_reference text,
  image_reference text,
  date_or_age_label text,
  people_referenced jsonb not null default '[]'::jsonb,
  sharing_level text not null default 'child_only',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (child_storybook_id, page_sequence)
);

create table if not exists public.child_wishes_views (
  id uuid primary key default gen_random_uuid(),
  record_reference text not null unique,
  child_id uuid not null,
  context_type text not null,
  context_reference text,
  child_wish_text text,
  child_view_text text,
  response_mode text not null,
  audio_reference text,
  drawing_reference text,
  importance_selected_by_child text,
  child_wants_action boolean not null default false,
  child_understands_limits boolean not null default false,
  sharing_level text not null default 'restricted_worker',
  recorded_at timestamptz not null default now()
);

create table if not exists public.child_choice_records (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null,
  choice_context text not null,
  choice_reference text,
  available_options jsonb not null,
  option_explanations jsonb not null,
  child_selection jsonb,
  child_did_not_choose boolean not null default false,
  support_person_present boolean not null default false,
  support_person_reference text,
  pressure_or_coercion_screened boolean not null default false,
  recorded_at timestamptz not null default now()
);

alter table public.child_visit_preparations
  add column if not exists preparation_reference text,
  add column if not exists child_id uuid,
  add column if not exists contact_visit_record_id uuid,
  add column if not exists how_child_feels_before text,
  add column if not exists questions_child_has jsonb not null default '[]'::jsonb,
  add column if not exists things_child_wants_to_do jsonb not null default '[]'::jsonb,
  add column if not exists things_child_does_not_want jsonb not null default '[]'::jsonb,
  add column if not exists support_child_wants jsonb not null default '[]'::jsonb,
  add column if not exists preferred_safe_person_reference text,
  add column if not exists child_wants_information_shared boolean not null default false,
  add column if not exists sharing_instructions jsonb not null default '{}'::jsonb,
  add column if not exists completed_at timestamptz;

update public.child_visit_preparations
set child_id = coalesce(child_id, child_user_id),
    preparation_reference = coalesce(preparation_reference, 'VISIT-PREP-' || id::text),
    how_child_feels_before = coalesce(how_child_feels_before, worries),
    completed_at = coalesce(completed_at, created_at)
where child_id is null or preparation_reference is null or completed_at is null;

create unique index if not exists child_visit_preparations_reference_unique
  on public.child_visit_preparations(preparation_reference)
  where preparation_reference is not null;

create table if not exists public.child_visit_experience_reflections (
  id uuid primary key default gen_random_uuid(),
  reflection_reference text not null unique,
  child_id uuid not null,
  contact_visit_record_id uuid,
  feeling_before text,
  feeling_during text,
  feeling_after text,
  what_went_well text,
  what_was_hard text,
  what_child_wants_next_time text,
  what_child_wants_changed text,
  child_felt_listened_to boolean,
  child_felt_safe boolean,
  wants_to_talk_to_someone boolean not null default false,
  requested_person_reference text,
  sharing_level text not null default 'restricted_worker',
  completed_at timestamptz not null default now()
);

alter table public.child_visit_reflections
  add column if not exists child_id uuid,
  add column if not exists reflection_reference text,
  add column if not exists sharing_level text not null default 'restricted_worker',
  add column if not exists child_felt_safe boolean,
  add column if not exists wants_to_talk_to_someone boolean not null default false;

update public.child_visit_reflections
set child_id = coalesce(child_id, child_user_id),
    reflection_reference = coalesce(reflection_reference, 'VISIT-REFLECT-' || id::text)
where child_id is null or reflection_reference is null;

create table if not exists public.child_visit_preferences (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null,
  person_reference text not null,
  preferred_visit_frequency text,
  preferred_visit_duration text,
  preferred_location_types text[] not null default '{}',
  preferred_activities jsonb not null default '[]'::jsonb,
  preferred_supervision_setting text,
  people_child_wants_present jsonb not null default '[]'::jsonb,
  people_child_does_not_want_present jsonb not null default '[]'::jsonb,
  comfort_needs jsonb not null default '[]'::jsonb,
  child_understands_preferences_not_guaranteed boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.child_learning_enrolments (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null,
  course_id uuid references public.learning_courses(id) on delete restrict,
  assigned_by_type text not null,
  assigned_by_reference text,
  assignment_reason text,
  required boolean not null default false,
  child_choice_status text not null default 'not_offered',
  age_adaptation_code text,
  accessibility_adaptation_code text,
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'active'
);

create table if not exists public.child_lesson_sessions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null,
  learning_lesson_id uuid references public.learning_lessons(id) on delete restrict,
  session_mode text not null,
  support_person_reference text,
  started_at timestamptz not null default now(),
  paused_at timestamptz,
  completed_at timestamptz,
  active_time_seconds integer not null default 0,
  emotional_load_rating text,
  break_count integer not null default 0,
  safety_concern_detected boolean not null default false,
  status text not null default 'in_progress'
);

create table if not exists public.child_activity_responses (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null,
  learning_activity_id uuid references public.learning_activities(id) on delete restrict,
  lesson_session_id uuid references public.child_lesson_sessions(id) on delete cascade,
  response_type text not null,
  response_data jsonb,
  response_text text,
  audio_reference text,
  drawing_reference text,
  child_experience_rating text,
  child_wants_to_save boolean not null default true,
  sharing_level text not null default 'child_only',
  completed_at timestamptz not null default now()
);

create table if not exists public.child_learning_games (
  id uuid primary key default gen_random_uuid(),
  game_code text not null,
  game_version integer not null,
  game_name text not null,
  child_friendly_description text not null,
  learning_domain text not null,
  supported_age_bands text[] not null default '{}',
  minimum_players integer not null default 1,
  maximum_players integer not null default 1,
  cooperative_play boolean not null default false,
  competitive_play boolean not null default false,
  parent_child_mode_available boolean not null default false,
  family_mode_available boolean not null default false,
  safety_rules jsonb not null default '[]'::jsonb,
  accessibility_options jsonb not null default '{}'::jsonb,
  game_configuration jsonb not null default '{}'::jsonb,
  lifecycle_status text not null default 'draft',
  unique (game_code, game_version)
);

create table if not exists public.child_game_sessions (
  id uuid primary key default gen_random_uuid(),
  game_session_reference text not null unique,
  child_learning_game_id uuid not null references public.child_learning_games(id) on delete restrict,
  child_id uuid,
  session_mode text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  game_outcome jsonb,
  skills_practised text[] not null default '{}',
  emotional_response text,
  conflict_occurred boolean not null default false,
  support_required boolean not null default false,
  status text not null default 'active'
);

create table if not exists public.child_game_session_participants (
  id uuid primary key default gen_random_uuid(),
  child_game_session_id uuid not null references public.child_game_sessions(id) on delete cascade,
  participant_type text not null,
  participant_reference text not null,
  participation_role text not null,
  consent_status text not null default 'not_required',
  joined_at timestamptz,
  left_at timestamptz,
  unique (child_game_session_id, participant_type, participant_reference)
);

create table if not exists public.child_daily_tasks (
  id uuid primary key default gen_random_uuid(),
  task_reference text not null unique,
  child_id uuid not null,
  task_type text not null,
  task_title text not null,
  child_friendly_instructions text not null,
  assigned_by_type text not null,
  assigned_by_reference text,
  required boolean not null default false,
  available_from timestamptz,
  due_at timestamptz,
  estimated_minutes integer,
  privacy_level text not null default 'child_only',
  status text not null default 'available'
);

create table if not exists public.child_task_responses (
  id uuid primary key default gen_random_uuid(),
  child_daily_task_id uuid not null references public.child_daily_tasks(id) on delete cascade,
  child_id uuid not null,
  response_type text not null,
  response_text text,
  response_data jsonb,
  audio_reference text,
  drawing_reference text,
  image_reference text,
  child_wants_to_share boolean not null default false,
  sharing_level text not null default 'child_only',
  submitted_at timestamptz not null default now()
);

create table if not exists public.child_achievement_definitions (
  id uuid primary key default gen_random_uuid(),
  achievement_code text not null unique,
  achievement_name text not null,
  child_friendly_description text not null,
  achievement_category text not null,
  eligibility_rule jsonb not null default '{}'::jsonb,
  badge_reference text,
  certificate_enabled boolean not null default false,
  comparative_ranking_prohibited boolean not null default true,
  active boolean not null default true
);

create table if not exists public.child_achievement_awards_v20 (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null,
  achievement_definition_id uuid not null references public.child_achievement_definitions(id) on delete restrict,
  award_reason text not null,
  award_context text,
  awarded_by_type text not null,
  awarded_by_reference text,
  child_visible boolean not null default true,
  parent_visible boolean not null default false,
  awarded_at timestamptz not null default now()
);

create table if not exists public.child_strength_records (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null,
  strength_category text not null,
  strength_description text not null,
  identified_by_type text not null,
  identified_by_reference text,
  child_agrees boolean,
  child_description text,
  evidence_or_example text,
  visible_to_child boolean not null default true,
  recorded_at timestamptz not null default now()
);

create table if not exists public.child_personal_goals (
  id uuid primary key default gen_random_uuid(),
  goal_reference text not null unique,
  child_id uuid not null,
  goal_title text not null,
  child_goal_description text not null,
  goal_category text not null,
  child_selected boolean not null default true,
  adult_supported boolean not null default false,
  success_description text,
  support_needed jsonb not null default '[]'::jsonb,
  target_date date,
  sharing_level text not null default 'restricted_worker',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.child_goal_progress_records (
  id uuid primary key default gen_random_uuid(),
  child_personal_goal_id uuid not null references public.child_personal_goals(id) on delete cascade,
  progress_status text not null,
  child_progress_text text,
  child_progress_audio_reference text,
  evidence_or_example text,
  support_received jsonb not null default '[]'::jsonb,
  barriers jsonb not null default '[]'::jsonb,
  recorded_at timestamptz not null default now()
);

create table if not exists public.child_journals (
  id uuid primary key default gen_random_uuid(),
  journal_reference text not null unique,
  child_id uuid not null,
  journal_name text not null,
  default_sharing_level text not null default 'child_only',
  child_controls_sharing boolean not null default true,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.child_journal_entries (
  id uuid primary key default gen_random_uuid(),
  child_journal_id uuid not null references public.child_journals(id) on delete cascade,
  entry_reference text not null unique,
  entry_title text,
  entry_text text,
  audio_reference text,
  drawing_reference text,
  image_reference text,
  feeling_codes text[] not null default '{}',
  sharing_level text not null default 'child_only',
  safety_review_status text not null default 'not_required',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.child_shared_items
  add column if not exists child_id uuid,
  add column if not exists source_type text,
  add column if not exists source_reference text,
  add column if not exists shared_with_type text,
  add column if not exists shared_with_reference text,
  add column if not exists sharing_reason text,
  add column if not exists child_initiated boolean not null default false,
  add column if not exists child_was_informed boolean not null default true,
  add column if not exists emergency_override_used boolean not null default false,
  add column if not exists emergency_override_reason text,
  add column if not exists shared_at timestamptz,
  add column if not exists access_withdrawn_at timestamptz;

update public.child_shared_items
set child_id = coalesce(child_id, child_user_id),
    source_type = coalesce(source_type, item_type),
    source_reference = coalesce(source_reference, item_id::text),
    shared_with_type = coalesce(shared_with_type, share_audience::text),
    shared_with_reference = coalesce(shared_with_reference, coalesce(parent_user_id::text, caseworker_user_id::text, 'unspecified')),
    shared_at = coalesce(shared_at, created_at)
where child_id is null or source_type is null or shared_at is null;

create table if not exists public.child_content_sharing_requests (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null,
  source_type text not null,
  source_reference text not null,
  requested_recipient_type text not null,
  requested_recipient_reference text not null,
  requested_by_type text not null,
  requested_by_reference text,
  child_decision_status text not null default 'pending',
  child_decision_explanation text,
  safety_override_review_required boolean not null default false,
  requested_at timestamptz not null default now(),
  decided_at timestamptz
);

create table if not exists public.child_decision_explanations (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null,
  case_decision_id uuid references public.case_decision_records(id) on delete set null,
  explanation_title text not null,
  explanation_text text not null,
  child_friendly_next_steps jsonb not null default '[]'::jsonb,
  explanation_method text not null default 'plain_language',
  child_understanding_checked boolean not null default false,
  provided_by_user_id uuid references auth.users(id) on delete set null,
  provided_at timestamptz not null default now()
);

create table if not exists public.child_notifications (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null,
  notification_type text not null,
  title text not null,
  body text not null,
  priority text not null default 'normal',
  action_reference text,
  read_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.child_platform_sessions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null,
  child_account_id uuid references public.child_accounts(id) on delete set null,
  session_mode text not null,
  supported_by_user_id uuid references auth.users(id) on delete set null,
  device_context jsonb not null default '{}'::jsonb,
  safe_exit_available boolean not null default true,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create table if not exists public.child_session_support_events (
  id uuid primary key default gen_random_uuid(),
  child_platform_session_id uuid not null references public.child_platform_sessions(id) on delete cascade,
  support_type text not null,
  support_person_reference text,
  child_requested_support boolean not null default false,
  event_notes text,
  occurred_at timestamptz not null default now()
);

create table if not exists public.child_content_safety_reviews (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null,
  source_type text not null,
  source_reference text not null,
  review_reason text not null,
  reviewer_user_id uuid references auth.users(id) on delete set null,
  review_outcome text not null default 'pending',
  child_informed boolean not null default false,
  parent_disclosure_allowed boolean not null default false,
  reviewed_at timestamptz
);

create table if not exists public.child_experience_safety_signals (
  id uuid primary key default gen_random_uuid(),
  signal_reference text not null unique,
  child_id uuid not null,
  source_type text not null,
  source_reference text not null,
  signal_category text not null,
  signal_summary text not null,
  direct_help_request boolean not null default false,
  immediate_danger_possible boolean not null default false,
  confidence_score numeric,
  human_review_required boolean not null default true,
  human_review_status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.child_experience_safety_signal_reviews (
  id uuid primary key default gen_random_uuid(),
  child_experience_safety_signal_id uuid not null references public.child_experience_safety_signals(id) on delete cascade,
  reviewer_user_id uuid references auth.users(id) on delete set null,
  review_outcome text not null,
  action_taken text,
  child_friendly_follow_up text,
  reviewed_at timestamptz not null default now()
);

create table if not exists public.child_record_corrections (
  id uuid primary key default gen_random_uuid(),
  correction_reference text not null unique,
  child_id uuid not null,
  source_type text not null,
  source_reference text not null,
  requested_by_type text not null,
  requested_by_reference text,
  correction_reason text not null,
  requested_change text not null,
  outcome text not null default 'pending',
  child_friendly_outcome text,
  created_at timestamptz not null default now()
);

create table if not exists public.child_complaints (
  id uuid primary key default gen_random_uuid(),
  complaint_reference text not null unique,
  child_id uuid not null,
  complaint_category text not null,
  complaint_text text,
  audio_reference text,
  drawing_reference text,
  complained_about_reference text,
  route_away_from_complained_about boolean not null default true,
  status text not null default 'submitted',
  submitted_at timestamptz not null default now()
);

create table if not exists public.child_complaint_responses (
  id uuid primary key default gen_random_uuid(),
  child_complaint_id uuid not null references public.child_complaints(id) on delete cascade,
  responder_user_id uuid references auth.users(id) on delete set null,
  child_friendly_response text not null,
  action_summary text,
  complaint_upheld boolean,
  next_steps text,
  responded_at timestamptz not null default now()
);

create table if not exists public.child_advocacy_requests (
  id uuid primary key default gen_random_uuid(),
  advocacy_reference text not null unique,
  child_id uuid not null,
  advocacy_type text not null,
  request_text text,
  preferred_advocate_type text,
  urgency text not null default 'routine',
  status text not null default 'submitted',
  submitted_at timestamptz not null default now(),
  actioned_at timestamptz
);

create index if not exists idx_child_accounts_child_user on public.child_accounts(child_id, user_id);
create index if not exists idx_child_support_requests_child_status on public.child_support_requests(child_id, status, system_safety_priority);
create index if not exists idx_child_storybook_pages_story_sequence on public.child_storybook_pages(child_storybook_id, page_sequence);
create index if not exists idx_child_daily_tasks_child_status_due on public.child_daily_tasks(child_id, status, due_at);
create index if not exists idx_child_notifications_child_unread on public.child_notifications(child_id, created_at desc) where read_at is null;
create index if not exists idx_child_safety_signals_review on public.child_experience_safety_signals(human_review_status, immediate_danger_possible, created_at desc);
create index if not exists idx_child_shared_items_child_source on public.child_shared_items(child_id, source_type, source_reference);

create or replace function public.safesteps_is_child_account_user_v20(p_user_id uuid, p_child_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.child_accounts a
    where a.child_id = p_child_id
      and a.user_id = p_user_id
      and a.account_status in ('active', 'pending')
  )
  or exists (
    select 1 from public.child_profiles p
    where coalesce(p.child_id, p.id) = p_child_id
      and p.child_user_id = p_user_id
  );
$$;

create or replace function public.safesteps_can_worker_access_child_v20(p_user_id uuid, p_child_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_has_role('admin')
    or public.current_user_has_role('caseworker')
    or public.current_user_has_role('worker')
    or public.has_resource_permission(p_user_id, 'global', null, 'child_experience.review')
    or exists (
      select 1 from public.child_profiles p
      where coalesce(p.child_id, p.id) = p_child_id
        and p.caseworker_user_id = p_user_id
    );
$$;

create or replace function public.can_share_child_content(
  p_child_id uuid,
  p_source_type text,
  p_source_reference text,
  p_recipient_type text,
  p_recipient_reference text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.child_content_sharing_requests r
    where r.child_id = p_child_id
      and r.source_type = p_source_type
      and r.source_reference = p_source_reference
      and r.requested_recipient_type = p_recipient_type
      and r.requested_recipient_reference = p_recipient_reference
      and r.child_decision_status = 'approved'
  )
  and not exists (
    select 1
    from public.child_privacy_profiles p
    where p.child_id = p_child_id
      and p_recipient_type = 'parent'
      and p.default_parent_access = 'blocked'
  );
$$;

create or replace function public.can_override_child_sharing_for_safety(
  p_child_id uuid,
  p_source_type text,
  p_source_reference text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.child_privacy_profiles p
    where p.child_id = p_child_id
      and p.emergency_override_allowed = true
  )
  and exists (
    select 1
    from public.child_experience_safety_signals s
    where s.child_id = p_child_id
      and s.source_type = p_source_type
      and s.source_reference = p_source_reference
      and (s.direct_help_request = true or s.immediate_danger_possible = true)
      and s.human_review_status = 'confirmed'
  );
$$;

create or replace function public.should_escalate_child_request(p_request_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.child_support_requests r
    where r.id = p_request_id
      and r.status in ('submitted', 'acknowledged')
      and (
        r.system_safety_priority in ('urgent', 'immediate')
        or r.request_category in ('feel_unsafe', 'need_help_now', 'do_not_want_contact')
      )
  );
$$;

create or replace function public.can_complete_child_lesson(p_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.child_lesson_sessions s
    where s.id = p_session_id
      and s.status = 'in_progress'
      and s.active_time_seconds > 0
      and (
        s.safety_concern_detected = false
        or exists (
          select 1
          from public.child_experience_safety_signal_reviews r
          join public.child_experience_safety_signals sig on sig.id = r.child_experience_safety_signal_id
          where sig.source_type = 'child_lesson_session'
            and sig.source_reference = s.id::text
        )
      )
  );
$$;

create or replace function public.can_close_child_support_request(p_request_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.child_support_requests r
    where r.id = p_request_id
      and r.status in ('responded', 'actioned')
      and exists (
        select 1
        from public.child_support_request_responses rr
        where rr.child_support_request_id = r.id
          and rr.child_friendly_response is not null
      )
  );
$$;

revoke all on function public.safesteps_is_child_account_user_v20(uuid, uuid) from public;
revoke all on function public.safesteps_can_worker_access_child_v20(uuid, uuid) from public;
revoke all on function public.can_share_child_content(uuid, text, text, text, text) from public;
revoke all on function public.can_override_child_sharing_for_safety(uuid, text, text) from public;
revoke all on function public.should_escalate_child_request(uuid) from public;
revoke all on function public.can_complete_child_lesson(uuid) from public;
revoke all on function public.can_close_child_support_request(uuid) from public;
grant execute on function public.safesteps_is_child_account_user_v20(uuid, uuid) to authenticated;
grant execute on function public.safesteps_can_worker_access_child_v20(uuid, uuid) to authenticated;
grant execute on function public.can_share_child_content(uuid, text, text, text, text) to authenticated;
grant execute on function public.can_override_child_sharing_for_safety(uuid, text, text) to authenticated;
grant execute on function public.should_escalate_child_request(uuid) to authenticated;
grant execute on function public.can_complete_child_lesson(uuid) to authenticated;
grant execute on function public.can_close_child_support_request(uuid) to authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'child_accounts',
    'child_development_profiles_v20',
    'child_interface_profiles',
    'child_consent_assent_records',
    'child_privacy_profiles',
    'child_sharing_preferences',
    'child_dashboard_configurations',
    'child_feeling_definitions',
    'child_body_map_responses',
    'child_support_requests',
    'child_support_request_responses',
    'child_safe_places',
    'child_friendly_safety_plans',
    'child_storybooks',
    'child_storybook_pages',
    'child_wishes_views',
    'child_choice_records',
    'child_visit_experience_reflections',
    'child_visit_preferences',
    'child_learning_enrolments',
    'child_lesson_sessions',
    'child_activity_responses',
    'child_learning_games',
    'child_game_sessions',
    'child_game_session_participants',
    'child_daily_tasks',
    'child_task_responses',
    'child_achievement_definitions',
    'child_achievement_awards_v20',
    'child_strength_records',
    'child_personal_goals',
    'child_goal_progress_records',
    'child_journals',
    'child_journal_entries',
    'child_content_sharing_requests',
    'child_decision_explanations',
    'child_notifications',
    'child_platform_sessions',
    'child_session_support_events',
    'child_content_safety_reviews',
    'child_experience_safety_signals',
    'child_experience_safety_signal_reviews',
    'child_record_corrections',
    'child_complaints',
    'child_complaint_responses',
    'child_advocacy_requests'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

grant select, insert, update on
  public.child_accounts,
  public.child_development_profiles_v20,
  public.child_interface_profiles,
  public.child_consent_assent_records,
  public.child_privacy_profiles,
  public.child_sharing_preferences,
  public.child_dashboard_configurations,
  public.child_body_map_responses,
  public.child_support_requests,
  public.child_support_request_responses,
  public.child_safe_places,
  public.child_friendly_safety_plans,
  public.child_storybooks,
  public.child_storybook_pages,
  public.child_wishes_views,
  public.child_choice_records,
  public.child_visit_experience_reflections,
  public.child_visit_preferences,
  public.child_learning_enrolments,
  public.child_lesson_sessions,
  public.child_activity_responses,
  public.child_game_sessions,
  public.child_game_session_participants,
  public.child_daily_tasks,
  public.child_task_responses,
  public.child_achievement_awards_v20,
  public.child_strength_records,
  public.child_personal_goals,
  public.child_goal_progress_records,
  public.child_journals,
  public.child_journal_entries,
  public.child_content_sharing_requests,
  public.child_decision_explanations,
  public.child_notifications,
  public.child_platform_sessions,
  public.child_session_support_events,
  public.child_content_safety_reviews,
  public.child_experience_safety_signals,
  public.child_experience_safety_signal_reviews,
  public.child_record_corrections,
  public.child_complaints,
  public.child_complaint_responses,
  public.child_advocacy_requests
to authenticated;

grant select on public.child_feeling_definitions, public.child_learning_games, public.child_achievement_definitions to authenticated;
grant insert, update on public.child_feeling_definitions, public.child_learning_games, public.child_achievement_definitions to authenticated;

create policy "Child v20 accounts" on public.child_accounts for all to authenticated using (user_id = auth.uid() or public.safesteps_can_worker_access_child_v20(auth.uid(), child_id)) with check (user_id = auth.uid() or public.safesteps_can_worker_access_child_v20(auth.uid(), child_id));
create policy "Child v20 development profiles" on public.child_development_profiles_v20 for all to authenticated using (public.safesteps_is_child_account_user_v20(auth.uid(), child_id) or public.safesteps_can_worker_access_child_v20(auth.uid(), child_id)) with check (public.safesteps_can_worker_access_child_v20(auth.uid(), child_id));
create policy "Child v20 interface profiles" on public.child_interface_profiles for all to authenticated using (exists (select 1 from public.child_accounts a where a.id = child_account_id and (a.user_id = auth.uid() or public.safesteps_can_worker_access_child_v20(auth.uid(), a.child_id)))) with check (exists (select 1 from public.child_accounts a where a.id = child_account_id and (a.user_id = auth.uid() or public.safesteps_can_worker_access_child_v20(auth.uid(), a.child_id))));
create policy "Child v20 privacy records" on public.child_privacy_profiles for all to authenticated using (public.safesteps_is_child_account_user_v20(auth.uid(), child_id) or public.safesteps_can_worker_access_child_v20(auth.uid(), child_id)) with check (public.safesteps_can_worker_access_child_v20(auth.uid(), child_id));
create policy "Child v20 sharing preferences" on public.child_sharing_preferences for all to authenticated using (public.safesteps_is_child_account_user_v20(auth.uid(), child_id) or public.safesteps_can_worker_access_child_v20(auth.uid(), child_id)) with check (public.safesteps_is_child_account_user_v20(auth.uid(), child_id) or public.safesteps_can_worker_access_child_v20(auth.uid(), child_id));
create policy "Child v20 dashboard configs" on public.child_dashboard_configurations for all to authenticated using (exists (select 1 from public.child_accounts a where a.id = child_account_id and (a.user_id = auth.uid() or public.safesteps_can_worker_access_child_v20(auth.uid(), a.child_id)))) with check (exists (select 1 from public.child_accounts a where a.id = child_account_id and public.safesteps_can_worker_access_child_v20(auth.uid(), a.child_id)));
create policy "Child v20 library readable" on public.child_feeling_definitions for select to authenticated using (active = true or public.current_user_has_role('admin'));
create policy "Child v20 games readable" on public.child_learning_games for select to authenticated using (lifecycle_status = 'active' or public.current_user_has_role('admin'));
create policy "Child v20 achievements readable" on public.child_achievement_definitions for select to authenticated using (active = true or public.current_user_has_role('admin'));

create policy "Child v20 support request access" on public.child_support_requests for all to authenticated using (public.safesteps_is_child_account_user_v20(auth.uid(), child_id) or public.safesteps_can_worker_access_child_v20(auth.uid(), child_id)) with check (public.safesteps_is_child_account_user_v20(auth.uid(), child_id) or public.safesteps_can_worker_access_child_v20(auth.uid(), child_id));
create policy "Child v20 child-owned records body maps" on public.child_body_map_responses for all to authenticated using (public.safesteps_is_child_account_user_v20(auth.uid(), child_id) or public.safesteps_can_worker_access_child_v20(auth.uid(), child_id)) with check (public.safesteps_is_child_account_user_v20(auth.uid(), child_id) or public.safesteps_can_worker_access_child_v20(auth.uid(), child_id));
create policy "Child v20 child-owned records safe places" on public.child_safe_places for all to authenticated using (public.safesteps_is_child_account_user_v20(auth.uid(), child_id) or public.safesteps_can_worker_access_child_v20(auth.uid(), child_id)) with check (public.safesteps_is_child_account_user_v20(auth.uid(), child_id) or public.safesteps_can_worker_access_child_v20(auth.uid(), child_id));
create policy "Child v20 child-owned records storybooks" on public.child_storybooks for all to authenticated using (public.safesteps_is_child_account_user_v20(auth.uid(), child_id) or public.safesteps_can_worker_access_child_v20(auth.uid(), child_id)) with check (public.safesteps_is_child_account_user_v20(auth.uid(), child_id) or public.safesteps_can_worker_access_child_v20(auth.uid(), child_id));
create policy "Child v20 child-owned records wishes" on public.child_wishes_views for all to authenticated using (public.safesteps_is_child_account_user_v20(auth.uid(), child_id) or public.safesteps_can_worker_access_child_v20(auth.uid(), child_id)) with check (public.safesteps_is_child_account_user_v20(auth.uid(), child_id) or public.safesteps_can_worker_access_child_v20(auth.uid(), child_id));
create policy "Child v20 child-owned records choices" on public.child_choice_records for all to authenticated using (public.safesteps_is_child_account_user_v20(auth.uid(), child_id) or public.safesteps_can_worker_access_child_v20(auth.uid(), child_id)) with check (public.safesteps_is_child_account_user_v20(auth.uid(), child_id) or public.safesteps_can_worker_access_child_v20(auth.uid(), child_id));
create policy "Child v20 child-owned records visits" on public.child_visit_experience_reflections for all to authenticated using (public.safesteps_is_child_account_user_v20(auth.uid(), child_id) or public.safesteps_can_worker_access_child_v20(auth.uid(), child_id)) with check (public.safesteps_is_child_account_user_v20(auth.uid(), child_id) or public.safesteps_can_worker_access_child_v20(auth.uid(), child_id));
create policy "Child v20 child-owned records learning" on public.child_lesson_sessions for all to authenticated using (public.safesteps_is_child_account_user_v20(auth.uid(), child_id) or public.safesteps_can_worker_access_child_v20(auth.uid(), child_id)) with check (public.safesteps_is_child_account_user_v20(auth.uid(), child_id) or public.safesteps_can_worker_access_child_v20(auth.uid(), child_id));
create policy "Child v20 child-owned records tasks" on public.child_daily_tasks for all to authenticated using (public.safesteps_is_child_account_user_v20(auth.uid(), child_id) or public.safesteps_can_worker_access_child_v20(auth.uid(), child_id)) with check (public.safesteps_can_worker_access_child_v20(auth.uid(), child_id));
create policy "Child v20 child-owned records journals" on public.child_journals for all to authenticated using (public.safesteps_is_child_account_user_v20(auth.uid(), child_id) or public.safesteps_can_worker_access_child_v20(auth.uid(), child_id)) with check (public.safesteps_is_child_account_user_v20(auth.uid(), child_id) or public.safesteps_can_worker_access_child_v20(auth.uid(), child_id));
create policy "Child v20 safety and complaints" on public.child_experience_safety_signals for all to authenticated using (public.safesteps_can_worker_access_child_v20(auth.uid(), child_id)) with check (public.safesteps_can_worker_access_child_v20(auth.uid(), child_id));
create policy "Child v20 complaints access" on public.child_complaints for all to authenticated using (public.safesteps_is_child_account_user_v20(auth.uid(), child_id) or public.safesteps_can_worker_access_child_v20(auth.uid(), child_id)) with check (public.safesteps_is_child_account_user_v20(auth.uid(), child_id) or public.safesteps_can_worker_access_child_v20(auth.uid(), child_id));
create policy "Child v20 advocacy access" on public.child_advocacy_requests for all to authenticated using (public.safesteps_is_child_account_user_v20(auth.uid(), child_id) or public.safesteps_can_worker_access_child_v20(auth.uid(), child_id)) with check (public.safesteps_is_child_account_user_v20(auth.uid(), child_id) or public.safesteps_can_worker_access_child_v20(auth.uid(), child_id));
create policy "Child v20 sharing requests access" on public.child_content_sharing_requests for all to authenticated using (public.safesteps_is_child_account_user_v20(auth.uid(), child_id) or public.safesteps_can_worker_access_child_v20(auth.uid(), child_id)) with check (public.safesteps_is_child_account_user_v20(auth.uid(), child_id) or public.safesteps_can_worker_access_child_v20(auth.uid(), child_id));

create or replace view public.child_dashboard_summary
with (security_invoker = true)
as
select
  ca.child_id,
  ca.child_display_name,
  ca.account_status,
  count(distinct n.id) filter (where n.read_at is null and (n.expires_at is null or n.expires_at > now())) as unread_notification_count,
  count(distinct t.id) filter (where t.status in ('available', 'in_progress')) as active_task_count,
  count(distinct r.id) filter (where r.status not in ('resolved', 'closed', 'cancelled')) as open_request_count,
  count(distinct a.id) as achievement_count,
  max(fc.completed_at) as latest_feelings_checkin_at
from public.child_accounts ca
left join public.child_notifications n on n.child_id = ca.child_id
left join public.child_daily_tasks t on t.child_id = ca.child_id
left join public.child_support_requests r on r.child_id = ca.child_id
left join public.child_achievement_awards_v20 a on a.child_id = ca.child_id
left join public.child_feelings_checkins fc on fc.child_id = ca.child_id
group by ca.child_id, ca.child_display_name, ca.account_status;

create or replace view public.worker_child_voice_queue
with (security_invoker = true)
as
select
  r.id as request_id,
  r.request_reference,
  r.child_id,
  r.request_category,
  r.system_safety_priority,
  r.status,
  r.submitted_at,
  r.acknowledged_at
from public.child_support_requests r
where r.status in ('submitted', 'acknowledged', 'under_review');

create or replace view public.child_experience_safety_review_queue
with (security_invoker = true)
as
select
  s.id as signal_id,
  s.signal_reference,
  s.child_id,
  s.signal_category,
  s.signal_summary,
  s.direct_help_request,
  s.immediate_danger_possible,
  s.confidence_score,
  s.created_at
from public.child_experience_safety_signals s
where s.human_review_required = true
  and s.human_review_status = 'pending';

create or replace view public.child_sharing_audit_view
with (security_invoker = true)
as
select
  si.child_id,
  si.source_type,
  si.source_reference,
  si.shared_with_type,
  si.shared_with_reference,
  si.child_initiated,
  si.child_was_informed,
  si.emergency_override_used,
  si.emergency_override_reason,
  si.shared_at,
  si.access_withdrawn_at
from public.child_shared_items si;

insert into public.security_permissions (permission_code, description, resource_type, action, risk_level)
values
  ('child_experience.review', 'Review child experience safety signals, child voice records, requests, complaints, and child-controlled sharing records.', 'child_experience', 'review', 'high_impact'),
  ('child_experience.configure', 'Configure child accounts, development profiles, privacy profiles, dashboards, and accessibility settings.', 'child_experience', 'configure', 'sensitive'),
  ('child_content_safety.review', 'Review restricted child content safety signals and emergency sharing overrides.', 'child_content_safety', 'review', 'high_impact'),
  ('child_advocacy.manage', 'Manage child advocacy and complaint pathways without routing complaints to the person complained about.', 'child_advocacy', 'manage', 'high_impact')
on conflict (permission_code) do update
set description = excluded.description,
    resource_type = excluded.resource_type,
    action = excluded.action,
    risk_level = excluded.risk_level;
