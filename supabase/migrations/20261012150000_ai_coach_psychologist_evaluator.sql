-- Migration: 20261012150000_ai_coach_psychologist_evaluator.sql
-- SafeSteps Personal AI Support Coach, Psychological Formulation Companion ("AI Psychologist"),
-- and 10-Engine Longitudinal Evaluator across Child, Parent, Couples/Families (DFV Restoration),
-- DFV, Addiction (AOD), Mental Health, Perinatal, Neurodiversity/ABI, Cultural SEWB & Parenting.

create extension if not exists "pgcrypto";

-- 1. AI Support Coaching Sessions
create table if not exists public.ai_support_sessions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid,
  participant_user_id uuid not null,
  partner_user_id uuid,
  persona_mode text not null check (
    persona_mode in (
      'child_support_coach',
      'parent_support_coach',
      'couples_dfv_restoration_coach',
      'family_repair_coach',
      'dfv_safety_coach',
      'dfv_accountability_coach',
      'addiction_recovery_coach',
      'mental_health_stabilisation_coach',
      'perinatal_infant_coach',
      'neurodiversity_executive_scaffold_coach',
      'cultural_sewb_coach',
      'ai_psychologist_formulation',
      'ai_longitudinal_evaluator'
    )
  ),
  interaction_form text not null default 'reflective_dialogue' check (
    interaction_form in (
      'reflective_dialogue',
      'sjt_vignette',
      'stress_roleplay_simulator',
      'teach_back_perspective_switch',
      'somatic_body_map',
      'ema_micro_pulse',
      'safe_partner_message_bridge',
      'shared_timeout_contract',
      'spaced_retention_retest',
      'easy_read_scaffold'
    )
  ),
  clinical_pathway text not null,
  couples_restoration_stage text check (
    couples_restoration_stage is null or couples_restoration_stage in (
      'stage_1_containment_individual',
      'stage_2_parallel_synchronised',
      'stage_3_conjoint_safety_gated',
      'stage_4_whole_family_integration'
    )
  ),
  conjoint_clearance_state text not null default 'not_applicable' check (
    conjoint_clearance_state in (
      'not_applicable',
      'blocked_crisis_or_coercive_control',
      'parallel_only',
      'clinician_cleared_conjoint',
      'paused_safety_pivot'
    )
  ),
  child_age_band text check (
    child_age_band is null or child_age_band in ('5-8', '9-12', '13-17')
  ),
  accessibility_mode text not null default 'standard' check (
    accessibility_mode in ('standard', 'easy_read', 'low_stimulation', 'audio_first', 'cultural_yarning')
  ),
  window_of_tolerance_state text not null default 'regulated' check (
    window_of_tolerance_state in ('regulated', 'hyper_aroused', 'hypo_aroused', 'crisis_override')
  ),
  safety_status text not null default 'safe' check (
    safety_status in ('safe', 'elevated_watch', 'parallel_pivot_triggered', 'tier1_crisis_halt')
  ),
  provider_tier_used text not null default 'tier3_deterministic_local' check (
    provider_tier_used in ('tier1_gemini', 'tier2_openai', 'tier3_deterministic_local')
  ),
  child_share_with_parent boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. AI Support Messages (Turn-by-Turn Coaching, Roleplay, Teach-Back & Safety Gate Audit)
create table if not exists public.ai_support_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.ai_support_sessions(id) on delete cascade,
  sender_role text not null check (sender_role in ('user', 'assistant', 'system_safety_gate')),
  interaction_form text not null default 'reflective_dialogue',
  redacted_content text not null,
  detected_risk_domains text[] not null default '{}',
  safety_gate_triggered boolean not null default false,
  safety_tier text check (safety_tier is null or safety_tier in ('tier_1_immediate', 'tier_2_clinical_review', 'tier_3_supportive')),
  reflective_functioning_score numeric(5,2),
  anti_gaming_authenticity_score numeric(5,2),
  provider_tier text not null default 'tier3_deterministic_local',
  audit_sha256 text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 3. Private Pre/Post Couples & Family DFV Felt-Safety Check-Ins (Never Shared With Partner)
create table if not exists public.ai_couples_dfv_safety_checks (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.ai_support_sessions(id) on delete cascade,
  case_id uuid,
  participant_user_id uuid not null,
  check_phase text not null check (check_phase in ('pre_session', 'mid_session_pulse', 'post_session')),
  felt_safety_score integer not null check (felt_safety_score between 0 and 10),
  fear_of_retaliation boolean not null default false,
  coerced_to_participate boolean not null default false,
  immediate_danger boolean not null default false,
  silent_pivot_triggered boolean not null default false,
  recommended_mode text not null check (
    recommended_mode in ('proceed_conjoint', 'parallel_safe', 'individual_stabilisation_only', 'tier1_crisis_halt')
  ),
  private_notes_redacted text,
  audit_sha256 text not null,
  created_at timestamptz not null default now()
);

-- 4. Clinical, Parenting, Child, Perinatal, Neurodiversity & Validity Screenings (50+ Scales)
create table if not exists public.ai_clinical_screenings (
  id uuid primary key default gen_random_uuid(),
  case_id uuid,
  participant_user_id uuid not null,
  session_id uuid references public.ai_support_sessions(id) on delete set null,
  scale_id text not null,
  scale_category text not null,
  administration_form text not null default 'standard_scale' check (
    administration_form in (
      'standard_scale',
      'sjt_vignette',
      'ema_micro_pulse',
      'somatic_body_map',
      'spaced_retest',
      'external_clinician_import'
    )
  ),
  raw_score numeric(8,2) not null,
  normalized_score numeric(6,2) not null,
  band_id text not null,
  band_label text not null,
  subscale_scores jsonb not null default '{}'::jsonb,
  validity_metrics jsonb not null default '{}'::jsonb,
  critical_override_triggered boolean not null default false,
  critical_override_reason text,
  rci_from_baseline numeric(6,2),
  rci_classification text check (
    rci_classification is null or rci_classification in (
      'clinically_significant_improvement',
      'reliable_improvement',
      'no_reliable_change',
      'reliable_deterioration'
    )
  ),
  responses jsonb not null default '[]'::jsonb,
  requires_supervisor_review boolean not null default false,
  audit_sha256 text not null,
  assessed_at timestamptz not null default now()
);

-- 5. Non-Diagnostic 5P Psychological Formulations ("AI Psychologist" Companion)
create table if not exists public.ai_psychological_formulations (
  id uuid primary key default gen_random_uuid(),
  case_id uuid,
  participant_user_id uuid not null,
  presenting_factors text[] not null default '{}',
  predisposing_factors text[] not null default '{}',
  precipitating_factors text[] not null default '{}',
  perpetuating_factors text[] not null default '{}',
  protective_factors text[] not null default '{}',
  intersectional_synthesis text not null,
  safe_and_together_summary jsonb not null default '{}'::jsonb,
  couples_dfv_restoration_summary jsonb not null default '{}'::jsonb,
  neurodiversity_sensory_accommodations text[] not null default '{}',
  cultural_sewb_considerations text[] not null default '{}',
  external_tier3_4_psych_summaries jsonb not null default '[]'::jsonb,
  recommended_interventions jsonb not null default '[]'::jsonb,
  confidence_score numeric(4,2) not null check (confidence_score between 0 and 1),
  uncertainty_disclosure text,
  review_state text not null default 'draft_requires_clinician_review' check (
    review_state in (
      'draft_requires_clinician_review',
      'clinician_approved',
      'clinician_amended',
      'contested'
    )
  ),
  reviewed_by_user_id uuid,
  reviewed_at timestamptz,
  clinician_notes text,
  audit_sha256 text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. 10-Engine Longitudinal Evaluator Assessments
create table if not exists public.ai_evaluator_assessments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid,
  participant_user_id uuid not null,
  overall_readiness_score numeric(5,2) not null,
  overall_risk_band text not null check (overall_risk_band in ('Critical', 'High', 'Moderate', 'Ready')),
  confidence_score numeric(4,2) not null check (confidence_score between 0 and 1),
  uncertainty_disclosure text,
  anti_gaming_evaluation jsonb not null default '{}'::jsonb,
  safe_and_together_evaluation jsonb not null default '{}'::jsonb,
  couples_dfv_restoration_evaluation jsonb not null default '{}'::jsonb,
  reflective_functioning_evaluation jsonb not null default '{}'::jsonb,
  tri_morbid_intersectionality_evaluation jsonb not null default '{}'::jsonb,
  rci_longitudinal_evaluation jsonb not null default '{}'::jsonb,
  neurodiversity_fairness_evaluation jsonb not null default '{}'::jsonb,
  cultural_sewb_evaluation jsonb not null default '{}'::jsonb,
  psychometric_validity_evaluation jsonb not null default '{}'::jsonb,
  multi_informant_convergence_evaluation jsonb not null default '{}'::jsonb,
  safer_judgement jsonb not null default '{}'::jsonb,
  psychometric_competency_profiles jsonb not null default '[]'::jsonb,
  review_state text not null default 'draft_requires_clinician_review' check (
    review_state in (
      'draft_requires_clinician_review',
      'clinician_approved',
      'clinician_amended',
      'contested'
    )
  ),
  reviewed_by_user_id uuid,
  reviewed_at timestamptz,
  clinician_notes text,
  audit_sha256 text not null,
  evaluated_at timestamptz not null default now()
);

-- 7. Deterministic Pre/Post Safety Gate Crisis Escalations
create table if not exists public.ai_crisis_escalations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.ai_support_sessions(id) on delete set null,
  case_id uuid,
  participant_user_id uuid not null,
  escalation_tier text not null check (
    escalation_tier in ('tier_1_immediate_halt', 'tier_2_urgent_clinician', 'tier_3_safety_pivot')
  ),
  trigger_domains text[] not null default '{}',
  redacted_trigger_excerpt text not null,
  emergency_resources_displayed jsonb not null default '[]'::jsonb,
  resolved boolean not null default false,
  resolved_by_user_id uuid,
  resolved_at timestamptz,
  audit_sha256 text not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_ai_support_sessions_user on public.ai_support_sessions(participant_user_id, created_at desc);
create index if not exists idx_ai_support_sessions_case on public.ai_support_sessions(case_id, created_at desc);
create index if not exists idx_ai_support_messages_session on public.ai_support_messages(session_id, created_at asc);
create index if not exists idx_ai_couples_dfv_safety_user on public.ai_couples_dfv_safety_checks(participant_user_id, created_at desc);
create index if not exists idx_ai_clinical_screenings_user_scale on public.ai_clinical_screenings(participant_user_id, scale_id, assessed_at desc);
create index if not exists idx_ai_psych_formulations_case on public.ai_psychological_formulations(case_id, created_at desc);
create index if not exists idx_ai_evaluator_assessments_case on public.ai_evaluator_assessments(case_id, evaluated_at desc);
create index if not exists idx_ai_crisis_escalations_case on public.ai_crisis_escalations(case_id, created_at desc);

-- Row-Level Security (RLS)
alter table public.ai_support_sessions enable row level security;
alter table public.ai_support_messages enable row level security;
alter table public.ai_couples_dfv_safety_checks enable row level security;
alter table public.ai_clinical_screenings enable row level security;
alter table public.ai_psychological_formulations enable row level security;
alter table public.ai_evaluator_assessments enable row level security;
alter table public.ai_crisis_escalations enable row level security;

-- Participants can access their own sessions; child sessions remain strictly private to the child unless child_share_with_parent is true
create policy ai_support_sessions_participant_policy on public.ai_support_sessions
  for all
  using (auth.uid() = participant_user_id)
  with check (auth.uid() = participant_user_id);

-- Private DFV Felt-Safety Checks are NEVER readable by a partner; only the authoring participant can read/insert their own check-in
create policy ai_couples_dfv_safety_private_policy on public.ai_couples_dfv_safety_checks
  for all
  using (auth.uid() = participant_user_id)
  with check (auth.uid() = participant_user_id);

create policy ai_clinical_screenings_participant_policy on public.ai_clinical_screenings
  for all
  using (auth.uid() = participant_user_id)
  with check (auth.uid() = participant_user_id);

create policy ai_psych_formulations_participant_read on public.ai_psychological_formulations
  for select
  using (auth.uid() = participant_user_id or auth.uid() = reviewed_by_user_id);

create policy ai_evaluator_assessments_participant_read on public.ai_evaluator_assessments
  for select
  using (auth.uid() = participant_user_id or auth.uid() = reviewed_by_user_id);
