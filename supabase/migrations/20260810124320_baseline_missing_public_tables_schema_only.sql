create table if not exists public.activities (
  id uuid default gen_random_uuid() not null,
  lesson_id uuid not null,
  activity_number integer not null,
  title text not null,
  instructions text,
  created_at timestamp with time zone default now()
);
create table if not exists public.casefiles (
  case_id text not null,
  account_mode text,
  created_at timestamp without time zone default now(),
  relationship_assessment jsonb
);
create table if not exists public.curriculum (
  curriculum_id uuid default gen_random_uuid() not null,
  case_id text,
  week integer,
  lesson_title text,
  homework_status text,
  reflection text,
  updated_at timestamp without time zone default now()
);
create table if not exists public.documents (
  id uuid default gen_random_uuid() not null,
  user_id uuid,
  family_id uuid,
  file_url text,
  created_at timestamp without time zone default now()
);
create table if not exists public.evidence (
  id uuid default gen_random_uuid() not null,
  child_id uuid not null,
  activity_id uuid,
  note text,
  media_url text,
  created_at timestamp with time zone default now()
);
create table if not exists public.forensic_scores (
  score_id uuid default gen_random_uuid() not null,
  case_id text,
  parent_id text,
  risk_score integer,
  protective_score integer,
  reflective_functioning integer,
  risk_level text,
  created_at timestamp without time zone default now()
);
create table if not exists public.messaging_messages (
  id uuid default gen_random_uuid() not null,
  thread_id uuid not null,
  created_at timestamp with time zone default now() not null,
  created_by uuid default auth.uid() not null,
  body text not null
);
create table if not exists public.messaging_thread_summaries (
  id uuid default gen_random_uuid() not null,
  thread_id uuid not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  created_by uuid default auth.uid() not null,
  summary text not null,
  last_message_id uuid
);
create table if not exists public.messaging_threads (
  id uuid default gen_random_uuid() not null,
  created_at timestamp with time zone default now() not null,
  created_by uuid default auth.uid() not null,
  title text,
  owner_user_id uuid default auth.uid() not null
);
create table if not exists public.parents (
  parent_id text not null,
  case_id text,
  role text,
  account_linked boolean,
  identity jsonb,
  protective_capacities jsonb,
  risk_indicators jsonb,
  parenting_behaviors jsonb,
  engagement jsonb
);
create table if not exists public.progress (
  id uuid default gen_random_uuid() not null,
  child_id uuid not null,
  program_id uuid not null,
  lesson_id uuid,
  activity_id uuid,
  status text not null,
  updated_at timestamp with time zone default now()
);
create table if not exists public.user_settings (
  id uuid default gen_random_uuid() not null,
  user_id uuid not null,
  setting_key text not null,
  setting_value text,
  updated_at timestamp with time zone default now()
);
create table if not exists public.user_video_progress (
  id uuid default gen_random_uuid() not null,
  user_id uuid not null,
  video_resource_id text not null,
  definition_response text,
  max_watch_percentage integer default 0 not null,
  assessment_passed boolean default false not null,
  reflection_submitted boolean default false not null,
  practice_task_completed boolean default false not null,
  evidence_submitted boolean default false not null,
  completion_locked boolean default true not null,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
create table if not exists public.verified_people_directory (
  id uuid default gen_random_uuid() not null,
  user_id uuid,
  display_label text not null,
  role text not null,
  organisation text,
  active boolean default true not null,
  created_at timestamp with time zone default now() not null
);
create table if not exists public.video_admin_audit_events (
  id uuid default gen_random_uuid() not null,
  actor_user_id uuid,
  video_resource_id text,
  action text not null,
  reason text not null,
  previous_state jsonb default '{}'::jsonb not null,
  next_state jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default now() not null
);
create table if not exists public.video_assessment_attempts (
  id uuid default gen_random_uuid() not null,
  user_id uuid not null,
  video_resource_id text not null,
  answers jsonb not null,
  score integer not null,
  passed boolean not null,
  created_at timestamp with time zone default now() not null
);
create table if not exists public.video_case_assignment_audit_events (
  id uuid default gen_random_uuid() not null,
  assignment_id uuid,
  actor_user_id uuid,
  action text not null,
  reason text not null,
  previous_state jsonb default '{}'::jsonb not null,
  next_state jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default now() not null
);
create table if not exists public.video_case_assignments (
  id uuid default gen_random_uuid() not null,
  parent_user_id uuid not null,
  worker_user_id uuid not null,
  parent_display_label text not null,
  access_scope text not null,
  assignment_status text default 'active'::text not null,
  assignment_reason text not null,
  assigned_by uuid,
  ended_by uuid,
  ended_at timestamp with time zone,
  access_grant_id uuid,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
create table if not exists public.video_curriculum_mappings (
  id text not null,
  video_resource_id text not null,
  course_ids text[] not null,
  lesson_title text not null,
  video_role text not null,
  required boolean default true not null,
  watch_percentage_required integer default 90 not null,
  reflection_required boolean default true not null,
  assessment_required boolean default true not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
create table if not exists public.video_deployment_checks (
  id uuid default gen_random_uuid() not null,
  check_key text not null,
  check_status text not null,
  details text,
  created_at timestamp with time zone default now() not null
);
create table if not exists public.video_feature_flags (
  flag_key text not null,
  enabled boolean default false not null,
  description text not null,
  updated_at timestamp with time zone default now() not null
);
create table if not exists public.video_lesson_contents (
  id text not null,
  video_resource_id text not null,
  lesson_title text not null,
  parent_definition_prompt text not null,
  introduction text not null,
  teaching_points text[] not null,
  practice_task text not null,
  reflection_prompt text not null,
  assessment_questions jsonb not null,
  optional_evidence_upload_types jsonb default '["written_reflection", "routine_chart", "voice_note", "parent_created_example", "optional_photo_or_video"]'::jsonb not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
create table if not exists public.video_notification_outbox (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    notification_type text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    deep_link text,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    sent_at timestamp with time zone
);

create table if not exists public.video_notification_delivery_attempts (
  id uuid default gen_random_uuid() not null,
  outbox_id uuid not null,
  device_id uuid,
  provider_status text not null,
  provider_response jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default now() not null
);
create table if not exists public.video_notification_devices (
  id uuid default gen_random_uuid() not null,
  user_id uuid not null,
  expo_push_token text not null,
  platform text,
  device_label text,
  active boolean default true not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
create table if not exists public.video_notification_preferences (
  user_id uuid not null,
  review_notifications boolean default true not null,
  delivery_notifications boolean default true not null,
  dispute_notifications boolean default true not null,
  quiet_hours_start time without time zone,
  quiet_hours_end time without time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
create table if not exists public.video_practice_tasks (
  id uuid default gen_random_uuid() not null,
  user_id uuid not null,
  video_resource_id text not null,
  response text not null,
  evidence_item_id uuid,
  created_at timestamp with time zone default now() not null
);
create table if not exists public.video_progress_report_snapshots (
  id uuid default gen_random_uuid() not null,
  parent_user_id uuid not null,
  created_by uuid,
  reporting_period_start timestamp with time zone,
  reporting_period_end timestamp with time zone default now() not null,
  reporting_reason text not null,
  evidence_access_scope text not null,
  report_data jsonb not null,
  content_hash text not null,
  interpretation_warning text default 'This report records participation, assessment performance, reflection and reported practice. It does not by itself establish sustained behavioural change, parenting capacity or child safety.'::text not null,
  created_at timestamp with time zone default now() not null
);
create table if not exists public.video_providers (
  id text not null,
  name text not null,
  licence_type text not null,
  licence_status text not null,
  required_attribution text not null,
  download_allowed boolean default false not null,
  editing_allowed boolean default false not null,
  rehosting_allowed boolean default false not null,
  licence_checked_at date,
  next_review_at date,
  notes text
);
create table if not exists public.video_reflections (
  id uuid default gen_random_uuid() not null,
  user_id uuid not null,
  video_resource_id text not null,
  reflection text not null,
  created_at timestamp with time zone default now() not null
);
create table if not exists public.video_release_records (
  id uuid default gen_random_uuid() not null,
  release_version text not null,
  release_status text not null,
  release_notes text not null,
  created_by uuid,
  created_at timestamp with time zone default now() not null
);
create table if not exists public.video_report_access_authorities (
  id uuid default gen_random_uuid() not null,
  parent_user_id uuid not null,
  authorised_user_id uuid not null,
  access_scope text not null,
  authority_type text not null,
  authority_label text not null,
  active boolean default true not null,
  starts_at timestamp with time zone default now() not null,
  expires_at timestamp with time zone,
  withdrawn_at timestamp with time zone,
  withdrawn_by uuid,
  withdrawal_reason text,
  created_by uuid,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
create table if not exists public.video_report_access_grants (
  id uuid default gen_random_uuid() not null,
  parent_user_id uuid not null,
  reviewer_user_id uuid not null,
  parent_display_label text not null,
  access_scope text not null,
  expires_at timestamp with time zone not null,
  reason text not null,
  active boolean default true not null,
  granted_by uuid,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
create table if not exists public.video_report_attestations (
  id uuid default gen_random_uuid() not null,
  snapshot_id uuid not null,
  export_file_id uuid,
  signer_user_id uuid,
  signer_label text not null,
  attestation_text text not null,
  snapshot_content_hash text not null,
  export_file_sha256 text,
  revoked_at timestamp with time zone,
  revoked_by uuid,
  revocation_reason text,
  created_at timestamp with time zone default now() not null
);
create table if not exists public.video_report_delivery_events (
  id uuid default gen_random_uuid() not null,
  delivery_id uuid not null,
  event_type text not null,
  metadata jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default now() not null
);
create table if not exists public.video_report_delivery_purposes (
  id uuid default gen_random_uuid() not null,
  purpose_code text not null,
  description text not null,
  active boolean default true not null,
  created_at timestamp with time zone default now() not null
);
create table if not exists public.video_report_dispute_responses (
  id uuid default gen_random_uuid() not null,
  dispute_id uuid not null,
  reviewer_user_id uuid,
  decision text not null,
  response_notes text not null,
  correction_statement text,
  superseding_snapshot_id uuid,
  created_at timestamp with time zone default now() not null
);
create table if not exists public.video_report_disputes (
  id uuid default gen_random_uuid() not null,
  snapshot_id uuid not null,
  parent_user_id uuid not null,
  dispute_type text not null,
  requested_outcome text not null,
  dispute_statement text not null,
  status text default 'submitted'::text not null,
  submitted_by uuid,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
create table if not exists public.video_report_export_audit_events (
  id uuid default gen_random_uuid() not null,
  actor_user_id uuid,
  snapshot_id uuid,
  export_file_id uuid,
  action text not null,
  reason text not null,
  metadata jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default now() not null
);
create table if not exists public.video_report_export_files (
  id uuid default gen_random_uuid() not null,
  snapshot_id uuid not null,
  parent_user_id uuid not null,
  requested_by uuid,
  export_type text not null,
  storage_bucket text default 'video-report-exports'::text not null,
  storage_path text not null,
  file_sha256 text not null,
  signed_url_expires_at timestamp with time zone not null,
  created_at timestamp with time zone default now() not null
);
create table if not exists public.video_report_legal_holds (
  id uuid default gen_random_uuid() not null,
  parent_user_id uuid,
  snapshot_id uuid,
  hold_reason text not null,
  active boolean default true not null,
  created_by uuid,
  released_by uuid,
  released_at timestamp with time zone,
  release_reason text,
  created_at timestamp with time zone default now() not null
);
create table if not exists public.video_report_retention_rules (
  id uuid default gen_random_uuid() not null,
  rule_code text not null,
  description text not null,
  retention_period interval not null,
  deletion_enabled boolean default false not null,
  created_at timestamp with time zone default now() not null
);
create table if not exists public.video_report_review_history (
  id uuid default gen_random_uuid() not null,
  review_request_id uuid not null,
  actor_user_id uuid,
  action text not null,
  notes text,
  previous_status text,
  next_status text not null,
  created_at timestamp with time zone default now() not null
);
create table if not exists public.video_report_review_requests (
  id uuid default gen_random_uuid() not null,
  snapshot_id uuid not null,
  parent_user_id uuid not null,
  submitted_by uuid,
  assigned_reviewer_id uuid,
  review_status text default 'submitted'::text not null,
  submission_reason text not null,
  reviewer_notes text,
  decision_reason text,
  decided_by uuid,
  decided_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
create table if not exists public.video_report_review_schedules (
  id uuid default gen_random_uuid() not null,
  parent_user_id uuid not null,
  assigned_reviewer_id uuid,
  cadence text not null,
  next_review_due_at timestamp with time zone not null,
  active boolean default true not null,
  schedule_reason text not null,
  created_by uuid,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
create table if not exists public.video_report_system_health_events (
  id uuid default gen_random_uuid() not null,
  event_type text not null,
  severity text not null,
  message text not null,
  metadata jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default now() not null
);
create table if not exists public.video_report_verification_codes (
  id uuid default gen_random_uuid() not null,
  snapshot_id uuid not null,
  export_file_id uuid,
  verification_code text not null,
  privacy_label text not null,
  snapshot_content_hash text not null,
  export_file_sha256 text,
  revoked_at timestamp with time zone,
  revoked_by uuid,
  revocation_reason text,
  created_at timestamp with time zone default now() not null
);
create table if not exists public.video_resources (
  id text not null,
  provider_id text not null,
  title text not null,
  topic text not null,
  publication_status text default 'draft'::text not null,
  source_url text,
  embed_url text,
  embed_code_status text default 'missing'::text not null,
  licence_status text not null,
  licence_type text not null,
  attribution text not null,
  download_permission boolean default false not null,
  editing_permission boolean default false not null,
  rehosting_permission boolean default false not null,
  captions_verified boolean default false not null,
  transcript_verified boolean default false not null,
  accessibility_verified boolean default false not null,
  licence_checked_at date,
  next_review_at date,
  knowledge_check jsonb not null,
  parent_definition_prompt text not null,
  reflection_prompt text not null,
  practice_task text not null,
  optional_evidence_upload_types jsonb not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  attribution_review_status text default 'pending'::text not null,
  clinical_review_status text default 'pending'::text not null,
  cultural_review_status text default 'pending'::text not null
);
create table if not exists public.video_watch_events (
  id uuid default gen_random_uuid() not null,
  user_id uuid not null,
  video_resource_id text not null,
  event_type text not null,
  current_time_seconds numeric,
  duration_seconds numeric,
  watch_percentage integer default 0 not null,
  created_at timestamp with time zone default now() not null
);
create table if not exists public.weeks (
  id uuid default gen_random_uuid() not null,
  program_id uuid,
  week_number integer not null,
  title text,
  created_at timestamp without time zone default now()
);
