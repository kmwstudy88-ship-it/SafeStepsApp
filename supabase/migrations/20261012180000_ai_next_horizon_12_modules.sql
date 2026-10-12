-- ============================================================================
-- SafeSteps Next-Horizon 12-Module Expansion Migration
-- Covers:
--  1-2. Stealth Disguise, Duress PIN, Tech-Abuse Audit & Living DFV Safety Plan Vault
--  3.   Pre/During/Post Contact Visit Co-Regulation & Child Transition Decoder
--  4.   Safety-Gated Restorative Family Meeting & Child-Parent Repair Studio
--  5.   24/7 Addiction Urge-Surfing, High-Risk Calendar & MAT Routine Shield
--  6.   Child Trauma Sleep Coach & Neurodivergent Low-Arousal Household Toolkit
--  7.   Kinship, Foster & Grandparent Carer Secondary Trauma (ProQOL) & Contact Coach
--  8.   First Nations Cultural SEWB 7-Domain Yarning Map & Cultural Worker Co-Sign
--  9.   Court Report & SAFER Annexure Auto-Compiler
--  10.  360° Multi-Informant Convergence Portal
--  11.  Closed-Loop Adaptive Micro-Lesson & 7/14/30-Day Spaced Re-Test Prescriber
--  12.  Child Three Houses, 5-Finger Safety Network Hand & Worry Monster Playroom
-- ============================================================================

-- 1. Encrypted Living DFV Safety Plan, Duress PIN & Tech-Safety Vault
CREATE TABLE IF NOT EXISTS public.dfv_living_safety_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  case_id uuid NULL,
  stealth_cloak_enabled boolean NOT NULL DEFAULT true,
  primary_pin_sha256 text NULL,
  duress_pin_sha256 text NULL,
  duress_silent_alert_contacts jsonb NOT NULL DEFAULT '[]'::jsonb,
  tech_safety_audit jsonb NOT NULL DEFAULT '{}'::jsonb,
  encrypted_safety_plan_ciphertext text NOT NULL,
  safety_plan_summary_redacted jsonb NOT NULL DEFAULT '{}'::jsonb,
  dvo_avo_conditions jsonb NOT NULL DEFAULT '[]'::jsonb,
  audit_sha256 text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dfv_living_safety_plans_owner
  ON public.dfv_living_safety_plans(owner_user_id);

ALTER TABLE public.dfv_living_safety_plans ENABLE ROW LEVEL SECURITY;

-- Strict Survivor Isolation: ONLY the owner_user_id can read/write their safety plan vault
CREATE POLICY dfv_living_safety_plans_strict_owner_isolation
  ON public.dfv_living_safety_plans
  FOR ALL
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

-- 2. Contact Visit Pre/During/Post Co-Regulation & Child Transition Logs
CREATE TABLE IF NOT EXISTS public.contact_visit_coaching_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NULL,
  parent_or_carer_user_id uuid NOT NULL,
  visit_id uuid NULL,
  visit_phase text NOT NULL CHECK (visit_phase IN ('pre_visit_grounding', 'during_visit_coregulation', 'post_visit_transition')),
  parent_arousal_0_to_10 integer NOT NULL DEFAULT 3 CHECK (parent_arousal_0_to_10 BETWEEN 0 AND 10),
  child_observed_signals jsonb NOT NULL DEFAULT '[]'::jsonb,
  attachment_transition_formulation text NOT NULL,
  co_regulation_micro_script text NOT NULL,
  avoided_misattribution_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  audit_sha256 text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_visit_coaching_user
  ON public.contact_visit_coaching_logs(parent_or_carer_user_id, created_at DESC);

ALTER TABLE public.contact_visit_coaching_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY contact_visit_coaching_owner_policy
  ON public.contact_visit_coaching_logs
  FOR ALL
  USING (auth.uid() = parent_or_carer_user_id)
  WITH CHECK (auth.uid() = parent_or_carer_user_id);

-- 3. Safety-Gated Restorative Family Meeting & Child-Parent Repair Studio
CREATE TABLE IF NOT EXISTS public.restorative_family_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NULL,
  creator_user_id uuid NOT NULL,
  couples_dfv_stage text NOT NULL,
  clinician_safety_clearance boolean NOT NULL DEFAULT false,
  survivor_felt_safety_score integer NOT NULL CHECK (survivor_felt_safety_score BETWEEN 0 AND 10),
  meeting_permitted boolean NOT NULL DEFAULT false,
  rupture_repair_draft text NOT NULL,
  sanitized_child_centred_apology text NOT NULL,
  excuse_or_child_blame_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  voice_of_child_cards jsonb NOT NULL DEFAULT '[]'::jsonb,
  turn_taking_minutes integer NOT NULL DEFAULT 3,
  audit_sha256 text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.restorative_family_meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY restorative_family_meetings_owner_policy
  ON public.restorative_family_meetings
  FOR ALL
  USING (auth.uid() = creator_user_id)
  WITH CHECK (auth.uid() = creator_user_id);

-- 4. 24/7 Addiction Urge-Surfing, High-Risk Trigger Calendar & MAT Shield
CREATE TABLE IF NOT EXISTS public.addiction_recovery_shields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_user_id uuid NOT NULL,
  case_id uuid NULL,
  craving_before_0_to_10 integer NOT NULL CHECK (craving_before_0_to_10 BETWEEN 0 AND 10),
  craving_after_0_to_10 integer NOT NULL CHECK (craving_after_0_to_10 BETWEEN 0 AND 10),
  urge_surf_seconds_completed integer NOT NULL DEFAULT 90,
  halt_s_triggers jsonb NOT NULL DEFAULT '[]'::jsonb,
  high_risk_calendar_events jsonb NOT NULL DEFAULT '[]'::jsonb,
  mat_adherence_checked boolean NOT NULL DEFAULT false,
  lapse_occurred boolean NOT NULL DEFAULT false,
  child_safe_care_arranged boolean NOT NULL DEFAULT true,
  non_punitive_reset_plan jsonb NOT NULL DEFAULT '{}'::jsonb,
  audit_sha256 text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.addiction_recovery_shields ENABLE ROW LEVEL SECURITY;

CREATE POLICY addiction_recovery_shields_owner_policy
  ON public.addiction_recovery_shields
  FOR ALL
  USING (auth.uid() = participant_user_id)
  WITH CHECK (auth.uid() = participant_user_id);

-- 5. Child Trauma Sleep/Nightmare Coach & Neurodivergent Low-Arousal Household Profiles
CREATE TABLE IF NOT EXISTS public.neuro_sleep_household_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_user_id uuid NOT NULL,
  case_id uuid NULL,
  neurodivergent_traits jsonb NOT NULL DEFAULT '[]'::jsonb,
  sensory_triggers jsonb NOT NULL DEFAULT '[]'::jsonb,
  sleep_distress_signals jsonb NOT NULL DEFAULT '[]'::jsonb,
  low_arousal_household_plan jsonb NOT NULL DEFAULT '{}'::jsonb,
  bedtime_coregulation_script text NOT NULL,
  chunked_visual_schedule jsonb NOT NULL DEFAULT '[]'::jsonb,
  audit_sha256 text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.neuro_sleep_household_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY neuro_sleep_household_profiles_owner_policy
  ON public.neuro_sleep_household_profiles
  FOR ALL
  USING (auth.uid() = participant_user_id)
  WITH CHECK (auth.uid() = participant_user_id);

-- 6. Kinship, Foster & Grandparent Carer Secondary Trauma (ProQOL) & Contact Logs
CREATE TABLE IF NOT EXISTS public.kinship_carer_support_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carer_user_id uuid NOT NULL,
  case_id uuid NULL,
  carer_type text NOT NULL CHECK (carer_type IN ('kinship_grandparent', 'kinship_relative', 'foster_carer', 'kith_and_kin')),
  compassion_satisfaction_score integer NOT NULL,
  burnout_score integer NOT NULL,
  secondary_traumatic_stress_score integer NOT NULL,
  placement_stability_band text NOT NULL,
  birth_parent_boundary_script text NOT NULL,
  respite_and_support_recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  audit_sha256 text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.kinship_carer_support_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY kinship_carer_support_logs_owner_policy
  ON public.kinship_carer_support_logs
  FOR ALL
  USING (auth.uid() = carer_user_id)
  WITH CHECK (auth.uid() = carer_user_id);

-- 7. First Nations Cultural SEWB 7-Domain Yarning Maps & Cultural Worker Co-Sign
CREATE TABLE IF NOT EXISTS public.cultural_sewb_yarning_maps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_user_id uuid NOT NULL,
  case_id uuid NULL,
  domain_body text NOT NULL DEFAULT '',
  domain_mind_emotions text NOT NULL DEFAULT '',
  domain_family_kinship text NOT NULL DEFAULT '',
  domain_community text NOT NULL DEFAULT '',
  domain_culture text NOT NULL DEFAULT '',
  domain_country text NOT NULL DEFAULT '',
  domain_spirit_ancestors text NOT NULL DEFAULT '',
  cultural_strengths_weave jsonb NOT NULL DEFAULT '[]'::jsonb,
  anti_bias_kinship_guardrail_notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  cultural_worker_co_signed boolean NOT NULL DEFAULT false,
  cultural_worker_name text NULL,
  cultural_worker_signed_at timestamptz NULL,
  audit_sha256 text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cultural_sewb_yarning_maps ENABLE ROW LEVEL SECURITY;

CREATE POLICY cultural_sewb_yarning_maps_owner_policy
  ON public.cultural_sewb_yarning_maps
  FOR ALL
  USING (auth.uid() = participant_user_id)
  WITH CHECK (auth.uid() = participant_user_id);

-- 8. 360° Multi-Informant Convergence Portal
CREATE TABLE IF NOT EXISTS public.multi_informant_360_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL,
  subject_user_id uuid NOT NULL,
  informant_role text NOT NULL CHECK (informant_role IN ('contact_supervisor', 'teacher_early_childhood', 'aod_counsellor', 'gp_clinician', 'kinship_carer', 'child_safety_worker')),
  informant_name text NOT NULL,
  observed_domain text NOT NULL,
  rating_0_to_100 integer NOT NULL CHECK (rating_0_to_100 BETWEEN 0 AND 100),
  behavioral_observation_notes text NOT NULL,
  convergence_alignment text NOT NULL CHECK (convergence_alignment IN ('convergent', 'minor_divergence', 'critical_discrepancy')),
  audit_sha256 text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.multi_informant_360_observations ENABLE ROW LEVEL SECURITY;

CREATE POLICY multi_informant_360_observations_read_policy
  ON public.multi_informant_360_observations
  FOR SELECT
  USING (auth.uid() = subject_user_id);

-- 9. Closed-Loop Adaptive Micro-Lesson & Spaced Retention Re-Test Prescriptions
CREATE TABLE IF NOT EXISTS public.adaptive_micro_prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_user_id uuid NOT NULL,
  case_id uuid NULL,
  triggered_by_source text NOT NULL,
  target_competency_domain text NOT NULL,
  micro_lesson_id text NOT NULL,
  micro_lesson_title text NOT NULL,
  three_minute_practice_drill text NOT NULL,
  retest_7d_due_at timestamptz NOT NULL,
  retest_14d_due_at timestamptz NOT NULL,
  retest_30d_due_at timestamptz NOT NULL,
  completion_status text NOT NULL DEFAULT 'prescribed' CHECK (completion_status IN ('prescribed', 'lesson_completed', 'retest_7d_passed', 'retest_14d_passed', 'retest_30d_mastered')),
  audit_sha256 text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.adaptive_micro_prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY adaptive_micro_prescriptions_owner_policy
  ON public.adaptive_micro_prescriptions
  FOR ALL
  USING (auth.uid() = participant_user_id)
  WITH CHECK (auth.uid() = participant_user_id);

-- 10. Child Three Houses, 5-Finger Safety Network Hand & Worry Monster Playroom
CREATE TABLE IF NOT EXISTS public.child_three_houses_playroom (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_user_id uuid NOT NULL,
  case_id uuid NULL,
  age_band text NOT NULL CHECK (age_band IN ('5-8', '9-12', '13-17')),
  house_of_good_things jsonb NOT NULL DEFAULT '[]'::jsonb,
  house_of_worries jsonb NOT NULL DEFAULT '[]'::jsonb,
  house_of_dreams jsonb NOT NULL DEFAULT '[]'::jsonb,
  five_finger_trusted_adults jsonb NOT NULL DEFAULT '[]'::jsonb,
  worry_monster_intensity_0_to_10 integer NOT NULL DEFAULT 2 CHECK (worry_monster_intensity_0_to_10 BETWEEN 0 AND 10),
  safety_tier text NOT NULL DEFAULT 'tier_4_green',
  protective_response_message text NOT NULL,
  audit_sha256 text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.child_three_houses_playroom ENABLE ROW LEVEL SECURITY;

-- Strict Child Privacy Isolation: Only the child user can access their playroom rows directly
CREATE POLICY child_three_houses_playroom_strict_child_isolation
  ON public.child_three_houses_playroom
  FOR ALL
  USING (auth.uid() = child_user_id)
  WITH CHECK (auth.uid() = child_user_id);
