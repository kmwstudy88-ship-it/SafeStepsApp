create or replace function public.safesteps_can_manage_ai_explainability(
  p_user_id uuid,
  p_organisation_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    public.safesteps_can_manage_ai_governance(p_user_id, p_organisation_id)
    or public.has_resource_permission(p_user_id, 'organisation', p_organisation_id, 'ai_explainability.manage')
    or public.has_resource_permission(p_user_id, 'global', null, 'ai_explainability.manage'),
    false
  );
$$;

revoke all on function public.safesteps_can_manage_ai_explainability(uuid, uuid) from public;
grant execute on function public.safesteps_can_manage_ai_explainability(uuid, uuid) to authenticated;

create table if not exists public.ai_explanation_templates (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  template_code text not null,
  template_version integer not null,
  audience_type text not null check (audience_type in ('internal_technical', 'worker', 'supervisor', 'parent', 'child', 'court', 'governance', 'public_disclosure')),
  explanation_type text not null check (explanation_type in ('ai_use_disclosure', 'plain_language', 'technical', 'evidence_lineage', 'confidence_uncertainty', 'correction_rights', 'review_rights', 'appeal_rights', 'court_package')),
  title text not null,
  body_template text not null,
  required_sections text[] not null default '{}'::text[],
  readability_level text not null default 'plain_english',
  accessibility_modes text[] not null default array['screen_reader']::text[],
  cultural_adaptation_required boolean not null default false,
  child_safe_required boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'approved', 'suspended', 'retired')),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organisation_id, template_code, template_version)
);

create table if not exists public.ai_explanations (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  explanation_reference text not null unique,
  inference_request_id uuid references public.ai_inference_requests(id) on delete set null,
  output_lineage_record_id uuid references public.ai_output_lineage_records(id) on delete set null,
  use_case_id uuid references public.ai_use_cases(id) on delete set null,
  model_version_id uuid references public.ai_model_versions(id) on delete set null,
  prompt_version_id uuid references public.ai_prompt_versions(id) on delete set null,
  prompt_bundle_id uuid references public.ai_prompt_bundles(id) on delete set null,
  workflow_run_id uuid references public.ai_workflow_execution_runs(id) on delete set null,
  audience_type text not null check (audience_type in ('worker', 'supervisor', 'parent', 'child', 'court', 'governance')),
  explanation_status text not null default 'draft' check (explanation_status in ('draft', 'ready_for_review', 'approved', 'published', 'corrected', 'withdrawn', 'superseded')),
  human_review_required boolean not null default true,
  human_reviewed_by uuid references auth.users(id) on delete set null,
  human_reviewed_at timestamptz,
  generated_by_service text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_explanation_versions (
  id uuid primary key default gen_random_uuid(),
  explanation_id uuid not null references public.ai_explanations(id) on delete cascade,
  version integer not null,
  template_id uuid references public.ai_explanation_templates(id) on delete set null,
  explanation_text text not null,
  structured_explanation jsonb not null default '{}'::jsonb,
  evidence_summary jsonb not null default '[]'::jsonb,
  limitation_summary jsonb not null default '[]'::jsonb,
  correction_notice text,
  change_reason text not null,
  content_hash text not null,
  prepared_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (explanation_id, version)
);

create table if not exists public.ai_decision_decomposition_steps (
  id uuid primary key default gen_random_uuid(),
  explanation_version_id uuid not null references public.ai_explanation_versions(id) on delete cascade,
  step_order integer not null,
  statement text not null,
  statement_type text not null check (statement_type in ('observation', 'inference', 'summary', 'limitation', 'uncertainty', 'alternative_interpretation', 'unsupported_claim')),
  evidence_weighting text not null default 'not_weighted' check (evidence_weighting in ('not_weighted', 'weak', 'moderate', 'strong', 'conflicting', 'insufficient')),
  confidence_label text,
  unsupported boolean not null default false,
  human_review_required boolean not null default false,
  created_at timestamptz not null default now(),
  unique (explanation_version_id, step_order)
);

create table if not exists public.ai_evidence_lineage (
  id uuid primary key default gen_random_uuid(),
  explanation_version_id uuid references public.ai_explanation_versions(id) on delete cascade,
  decomposition_step_id uuid references public.ai_decision_decomposition_steps(id) on delete cascade,
  output_citation_id uuid references public.ai_output_citations(id) on delete set null,
  source_resource_type text not null,
  source_resource_id uuid,
  source_reference text,
  source_version text,
  evidence_timestamp timestamptz,
  source_hash text,
  relationship text not null check (relationship in ('supports', 'partially_supports', 'challenges', 'contradicts', 'contextualises', 'limits', 'source', 'not_used')),
  superseded_status text not null default 'not_checked' check (superseded_status in ('not_checked', 'current', 'superseded', 'corrected', 'withdrawn')),
  contradiction_status text not null default 'not_checked' check (contradiction_status in ('not_checked', 'none_found', 'contradiction_found', 'needs_resolution')),
  access_decision_reference text,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_confidence_explanations (
  id uuid primary key default gen_random_uuid(),
  explanation_version_id uuid not null references public.ai_explanation_versions(id) on delete cascade,
  confidence_label text not null check (confidence_label in ('not_available', 'low', 'moderate', 'high', 'calibrated_numeric_available')),
  numeric_confidence numeric(5,2) check (numeric_confidence is null or (numeric_confidence >= 0 and numeric_confidence <= 100)),
  calibration_reference_id uuid references public.ai_calibration_assessments(id) on delete set null,
  confidence_rationale text not null,
  display_warning text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_uncertainty_assessments (
  id uuid primary key default gen_random_uuid(),
  explanation_version_id uuid not null references public.ai_explanation_versions(id) on delete cascade,
  uncertainty_type text not null check (uncertainty_type in ('unknown', 'uncertain', 'unavailable', 'missing_evidence', 'contradictory_evidence', 'low_quality_source', 'language_limitation', 'model_limitation')),
  uncertainty_level text not null check (uncertainty_level in ('low', 'moderate', 'high', 'material')),
  description text not null,
  required_action text not null check (required_action in ('label_only', 'request_more_evidence', 'human_review', 'second_review', 'block_output', 'correction_required')),
  created_at timestamptz not null default now()
);

create table if not exists public.ai_explanation_requests (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  explanation_id uuid references public.ai_explanations(id) on delete set null,
  requested_by uuid references auth.users(id) on delete set null,
  requester_role text not null check (requester_role in ('parent', 'child', 'worker', 'supervisor', 'court', 'governance', 'advocate')),
  request_type text not null check (request_type in ('plain_language', 'technical_detail', 'evidence_lineage', 'confidence_uncertainty', 'review_rights', 'correction_pathway', 'court_package', 'accessible_format', 'translation')),
  request_reason text,
  status text not null default 'submitted' check (status in ('submitted', 'in_progress', 'fulfilled', 'declined', 'withdrawn')),
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_explanation_views (
  id uuid primary key default gen_random_uuid(),
  explanation_version_id uuid not null references public.ai_explanation_versions(id) on delete cascade,
  viewed_by uuid references auth.users(id) on delete set null,
  viewer_role text,
  view_context text not null check (view_context in ('app', 'report', 'court_export', 'audit_export', 'supervisor_review', 'child_workspace', 'parent_workspace')),
  accessibility_mode text,
  viewed_at timestamptz not null default now()
);

create table if not exists public.ai_explanation_feedback (
  id uuid primary key default gen_random_uuid(),
  explanation_version_id uuid not null references public.ai_explanation_versions(id) on delete cascade,
  submitted_by uuid references auth.users(id) on delete set null,
  submitter_role text,
  feedback_type text not null check (feedback_type in ('understood', 'not_understood', 'inaccurate', 'incomplete', 'culturally_inappropriate', 'accessibility_issue', 'translation_issue', 'too_technical', 'helpful')),
  rating integer check (rating is null or (rating >= 1 and rating <= 5)),
  feedback_text text,
  action_required boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_contestability_requests (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  explanation_id uuid references public.ai_explanations(id) on delete set null,
  inference_request_id uuid references public.ai_inference_requests(id) on delete set null,
  requested_by uuid references auth.users(id) on delete set null,
  requester_role text not null check (requester_role in ('parent', 'child', 'worker', 'supervisor', 'advocate', 'court')),
  contestability_type text not null check (contestability_type in ('review_request', 'correction_request', 'appeal', 'independent_review', 'supervisor_escalation', 'human_review_request')),
  grounds text not null,
  priority text not null default 'standard' check (priority in ('low', 'standard', 'high', 'urgent')),
  status text not null default 'submitted' check (status in ('submitted', 'triaged', 'in_review', 'resolved', 'escalated', 'closed', 'withdrawn')),
  due_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_review_requests (
  id uuid primary key default gen_random_uuid(),
  contestability_request_id uuid not null references public.ai_contestability_requests(id) on delete cascade,
  review_level text not null check (review_level in ('worker_review', 'supervisor_review', 'second_review', 'independent_review', 'governance_review')),
  assigned_to uuid references auth.users(id) on delete set null,
  review_scope jsonb not null default '{}'::jsonb,
  status text not null default 'open' check (status in ('open', 'assigned', 'completed', 'escalated', 'cancelled')),
  assigned_at timestamptz,
  completed_at timestamptz
);

create table if not exists public.ai_review_outcomes (
  id uuid primary key default gen_random_uuid(),
  review_request_id uuid not null references public.ai_review_requests(id) on delete cascade,
  outcome text not null check (outcome in ('upheld', 'partially_upheld', 'not_upheld', 'correction_required', 'explanation_reissued', 'human_override_required', 'appeal_rights_provided')),
  rationale text not null,
  actions_required jsonb not null default '[]'::jsonb,
  decided_by uuid references auth.users(id) on delete set null,
  decided_at timestamptz not null default now()
);

create table if not exists public.ai_appeals (
  id uuid primary key default gen_random_uuid(),
  contestability_request_id uuid references public.ai_contestability_requests(id) on delete cascade,
  appeal_reference text not null unique,
  appeal_level text not null check (appeal_level in ('internal_supervisor', 'independent_reviewer', 'governance_body', 'court_or_tribunal')),
  appeal_reason text not null,
  status text not null default 'submitted' check (status in ('submitted', 'accepted', 'in_review', 'decided', 'withdrawn', 'closed')),
  outcome text,
  decided_by uuid references auth.users(id) on delete set null,
  submitted_at timestamptz not null default now(),
  decided_at timestamptz
);

create table if not exists public.ai_correction_requests (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  explanation_id uuid references public.ai_explanations(id) on delete set null,
  output_lineage_record_id uuid references public.ai_output_lineage_records(id) on delete set null,
  requested_by uuid references auth.users(id) on delete set null,
  correction_type text not null check (correction_type in ('incorrect_output', 'incorrect_evidence_link', 'incorrect_citation', 'missing_evidence', 'superseded_evidence', 'misleading_uncertainty', 'accessibility_or_language')),
  description text not null,
  status text not null default 'submitted' check (status in ('submitted', 'accepted', 'rejected', 'implemented', 'propagated', 'closed')),
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create table if not exists public.ai_correction_actions (
  id uuid primary key default gen_random_uuid(),
  correction_request_id uuid not null references public.ai_correction_requests(id) on delete cascade,
  action_type text not null check (action_type in ('update_explanation', 'withdraw_explanation', 'correct_citation', 'add_missing_evidence', 'mark_output_invalid', 'notify_reviewer', 'trigger_model_impact_review', 'update_training_exclusion')),
  action_status text not null default 'pending' check (action_status in ('pending', 'in_progress', 'completed', 'cancelled')),
  action_summary text not null,
  performed_by uuid references auth.users(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_override_records (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  explanation_id uuid references public.ai_explanations(id) on delete set null,
  inference_request_id uuid references public.ai_inference_requests(id) on delete set null,
  human_review_decision_id uuid references public.ai_human_review_decisions(id) on delete set null,
  override_type text not null check (override_type in ('reject_output', 'amend_output', 'escalate', 'downgrade_confidence', 'add_contradiction', 'require_second_review', 'withdraw_release')),
  override_reason text not null,
  required_justification text not null,
  overridden_by uuid references auth.users(id) on delete set null,
  override_at timestamptz not null default now()
);

create table if not exists public.ai_override_patterns (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  pattern_code text not null,
  pattern_period_start timestamptz not null,
  pattern_period_end timestamptz not null,
  override_count integer not null default 0,
  affected_model_version_ids uuid[] not null default '{}'::uuid[],
  affected_prompt_version_ids uuid[] not null default '{}'::uuid[],
  pattern_summary text not null,
  corrective_action_required boolean not null default false,
  status text not null default 'open' check (status in ('open', 'investigating', 'actioned', 'closed')),
  created_at timestamptz not null default now(),
  unique (organisation_id, pattern_code, pattern_period_start)
);

create table if not exists public.ai_accessibility_versions (
  id uuid primary key default gen_random_uuid(),
  explanation_version_id uuid not null references public.ai_explanation_versions(id) on delete cascade,
  accessibility_mode text not null check (accessibility_mode in ('plain_english', 'easy_read', 'screen_reader', 'audio', 'symbol_supported', 'translated', 'child_friendly')),
  language_code text,
  content_reference text,
  content_hash text not null,
  prepared_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (explanation_version_id, accessibility_mode, language_code)
);

create table if not exists public.ai_child_explanations (
  id uuid primary key default gen_random_uuid(),
  explanation_id uuid not null references public.ai_explanations(id) on delete cascade,
  age_band text not null check (age_band in ('under_7', '7_9', '10_12', '13_15', '16_17')),
  safety_message text not null,
  child_friendly_text text not null,
  visual_mode_available boolean not null default false,
  unnecessary_detail_removed boolean not null default true,
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_parent_explanations (
  id uuid primary key default gen_random_uuid(),
  explanation_id uuid not null references public.ai_explanations(id) on delete cascade,
  plain_language_summary text not null,
  information_used jsonb not null default '[]'::jsonb,
  information_not_used jsonb not null default '[]'::jsonb,
  review_rights_text text not null,
  correction_rights_text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_worker_explanations (
  id uuid primary key default gen_random_uuid(),
  explanation_id uuid not null references public.ai_explanations(id) on delete cascade,
  supporting_evidence_panel jsonb not null default '[]'::jsonb,
  confidence_rationale text,
  missing_evidence_alerts jsonb not null default '[]'::jsonb,
  contradiction_alerts jsonb not null default '[]'::jsonb,
  alternative_interpretations jsonb not null default '[]'::jsonb,
  human_review_prompts jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_supervisor_explanations (
  id uuid primary key default gen_random_uuid(),
  explanation_id uuid not null references public.ai_explanations(id) on delete cascade,
  full_reasoning_history jsonb not null default '[]'::jsonb,
  version_comparisons jsonb not null default '[]'::jsonb,
  override_history jsonb not null default '[]'::jsonb,
  human_edits jsonb not null default '[]'::jsonb,
  governance_references jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_court_disclosures (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  explanation_id uuid references public.ai_explanations(id) on delete set null,
  report_id uuid references public.reports(id) on delete set null,
  disclosure_reference text not null unique,
  ai_involvement_summary text not null,
  human_review_evidence jsonb not null default '{}'::jsonb,
  source_lineage_summary jsonb not null default '[]'::jsonb,
  version_history jsonb not null default '[]'::jsonb,
  audit_integrity_hash text not null,
  release_status text not null default 'draft' check (release_status in ('draft', 'approved', 'released', 'withdrawn')),
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_transparency_packages (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  package_reference text not null unique,
  package_type text not null check (package_type in ('parent', 'child', 'worker', 'supervisor', 'court', 'governance', 'regulator')),
  explanation_ids uuid[] not null default '{}'::uuid[],
  contestability_request_ids uuid[] not null default '{}'::uuid[],
  correction_request_ids uuid[] not null default '{}'::uuid[],
  court_disclosure_ids uuid[] not null default '{}'::uuid[],
  manifest jsonb not null default '{}'::jsonb,
  package_hash text not null,
  status text not null default 'generated' check (status in ('generated', 'approved', 'released', 'withdrawn')),
  generated_by uuid references auth.users(id) on delete set null,
  generated_at timestamptz not null default now()
);

create table if not exists public.ai_explanation_quality_reviews (
  id uuid primary key default gen_random_uuid(),
  explanation_version_id uuid not null references public.ai_explanation_versions(id) on delete cascade,
  review_type text not null check (review_type in ('readability', 'accuracy', 'completeness', 'faithfulness', 'cultural_appropriateness', 'accessibility', 'child_comprehension', 'translation_quality')),
  score numeric(5,2) check (score is null or (score >= 0 and score <= 100)),
  outcome text not null check (outcome in ('passed', 'needs_changes', 'failed', 'waived')),
  findings jsonb not null default '[]'::jsonb,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz not null default now()
);

create table if not exists public.ai_contestability_metrics (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  metric_period_start timestamptz not null,
  metric_period_end timestamptz not null,
  review_request_count integer not null default 0,
  successful_appeal_count integer not null default 0,
  correction_count integer not null default 0,
  human_override_count integer not null default 0,
  average_time_to_resolution_hours numeric,
  repeated_issue_summary jsonb not null default '[]'::jsonb,
  explanation_satisfaction_score numeric(5,2),
  created_at timestamptz not null default now()
);

create table if not exists public.ai_explainability_audit_events (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete set null,
  explanation_id uuid references public.ai_explanations(id) on delete set null,
  contestability_request_id uuid references public.ai_contestability_requests(id) on delete set null,
  event_type text not null,
  event_description text not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  service_identity text,
  previous_hash text,
  new_hash text,
  event_payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists idx_ai_explanations_org_status on public.ai_explanations(organisation_id, explanation_status);
create index if not exists idx_ai_explanation_versions_explanation on public.ai_explanation_versions(explanation_id, version);
create index if not exists idx_ai_evidence_lineage_version on public.ai_evidence_lineage(explanation_version_id, relationship);
create index if not exists idx_ai_contestability_org_status on public.ai_contestability_requests(organisation_id, status, priority);
create index if not exists idx_ai_correction_requests_org_status on public.ai_correction_requests(organisation_id, status);
create index if not exists idx_ai_override_records_org_time on public.ai_override_records(organisation_id, override_at desc);
create index if not exists idx_ai_court_disclosures_org_status on public.ai_court_disclosures(organisation_id, release_status);
create index if not exists idx_ai_transparency_packages_org on public.ai_transparency_packages(organisation_id, generated_at desc);
create index if not exists idx_ai_explainability_audit_org_time on public.ai_explainability_audit_events(organisation_id, occurred_at desc);

alter table public.ai_explanation_templates enable row level security;
alter table public.ai_explanations enable row level security;
alter table public.ai_explanation_versions enable row level security;
alter table public.ai_decision_decomposition_steps enable row level security;
alter table public.ai_evidence_lineage enable row level security;
alter table public.ai_confidence_explanations enable row level security;
alter table public.ai_uncertainty_assessments enable row level security;
alter table public.ai_explanation_requests enable row level security;
alter table public.ai_explanation_views enable row level security;
alter table public.ai_explanation_feedback enable row level security;
alter table public.ai_contestability_requests enable row level security;
alter table public.ai_review_requests enable row level security;
alter table public.ai_review_outcomes enable row level security;
alter table public.ai_appeals enable row level security;
alter table public.ai_correction_requests enable row level security;
alter table public.ai_correction_actions enable row level security;
alter table public.ai_override_records enable row level security;
alter table public.ai_override_patterns enable row level security;
alter table public.ai_accessibility_versions enable row level security;
alter table public.ai_child_explanations enable row level security;
alter table public.ai_parent_explanations enable row level security;
alter table public.ai_worker_explanations enable row level security;
alter table public.ai_supervisor_explanations enable row level security;
alter table public.ai_court_disclosures enable row level security;
alter table public.ai_transparency_packages enable row level security;
alter table public.ai_explanation_quality_reviews enable row level security;
alter table public.ai_contestability_metrics enable row level security;
alter table public.ai_explainability_audit_events enable row level security;

create policy "AI explanation templates managed by explainability admins" on public.ai_explanation_templates for all to authenticated using (public.safesteps_can_manage_ai_explainability(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_explainability(auth.uid(), organisation_id));
create policy "AI explanations managed by explainability admins" on public.ai_explanations for all to authenticated using (public.safesteps_can_manage_ai_explainability(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_explainability(auth.uid(), organisation_id));
create policy "AI explanation requests managed by explainability admins or requester" on public.ai_explanation_requests for all to authenticated using (requested_by = auth.uid() or public.safesteps_can_manage_ai_explainability(auth.uid(), organisation_id)) with check (requested_by = auth.uid() or public.safesteps_can_manage_ai_explainability(auth.uid(), organisation_id));
create policy "AI contestability requests managed by explainability admins or requester" on public.ai_contestability_requests for all to authenticated using (requested_by = auth.uid() or public.safesteps_can_manage_ai_explainability(auth.uid(), organisation_id)) with check (requested_by = auth.uid() or public.safesteps_can_manage_ai_explainability(auth.uid(), organisation_id));
create policy "AI correction requests managed by explainability admins or requester" on public.ai_correction_requests for all to authenticated using (requested_by = auth.uid() or public.safesteps_can_manage_ai_explainability(auth.uid(), organisation_id)) with check (requested_by = auth.uid() or public.safesteps_can_manage_ai_explainability(auth.uid(), organisation_id));
create policy "AI override records managed by explainability admins" on public.ai_override_records for all to authenticated using (public.safesteps_can_manage_ai_explainability(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_explainability(auth.uid(), organisation_id));
create policy "AI override patterns managed by explainability admins" on public.ai_override_patterns for all to authenticated using (public.safesteps_can_manage_ai_explainability(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_explainability(auth.uid(), organisation_id));
create policy "AI court disclosures managed by explainability admins" on public.ai_court_disclosures for all to authenticated using (public.safesteps_can_manage_ai_explainability(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_explainability(auth.uid(), organisation_id));
create policy "AI transparency packages managed by explainability admins" on public.ai_transparency_packages for all to authenticated using (public.safesteps_can_manage_ai_explainability(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_explainability(auth.uid(), organisation_id));
create policy "AI contestability metrics managed by explainability admins" on public.ai_contestability_metrics for all to authenticated using (public.safesteps_can_manage_ai_explainability(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_explainability(auth.uid(), organisation_id));
create policy "AI explainability audit readable by admins" on public.ai_explainability_audit_events for select to authenticated using (public.safesteps_can_manage_ai_explainability(auth.uid(), organisation_id) or public.has_resource_permission(auth.uid(), 'global', null, 'ai_audit.read'));
create policy "AI explainability audit appendable by actor" on public.ai_explainability_audit_events for insert to authenticated with check (actor_user_id = auth.uid());

create policy "AI explanation versions managed through explanation" on public.ai_explanation_versions for all to authenticated using (exists (select 1 from public.ai_explanations e where e.id = explanation_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id))) with check (exists (select 1 from public.ai_explanations e where e.id = explanation_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id)));
create policy "AI decomposition steps managed through version" on public.ai_decision_decomposition_steps for all to authenticated using (exists (select 1 from public.ai_explanation_versions v join public.ai_explanations e on e.id = v.explanation_id where v.id = explanation_version_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id))) with check (exists (select 1 from public.ai_explanation_versions v join public.ai_explanations e on e.id = v.explanation_id where v.id = explanation_version_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id)));
create policy "AI evidence lineage managed through version" on public.ai_evidence_lineage for all to authenticated using (exists (select 1 from public.ai_explanation_versions v join public.ai_explanations e on e.id = v.explanation_id where v.id = explanation_version_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id))) with check (exists (select 1 from public.ai_explanation_versions v join public.ai_explanations e on e.id = v.explanation_id where v.id = explanation_version_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id)));
create policy "AI confidence explanations managed through version" on public.ai_confidence_explanations for all to authenticated using (exists (select 1 from public.ai_explanation_versions v join public.ai_explanations e on e.id = v.explanation_id where v.id = explanation_version_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id))) with check (exists (select 1 from public.ai_explanation_versions v join public.ai_explanations e on e.id = v.explanation_id where v.id = explanation_version_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id)));
create policy "AI uncertainty assessments managed through version" on public.ai_uncertainty_assessments for all to authenticated using (exists (select 1 from public.ai_explanation_versions v join public.ai_explanations e on e.id = v.explanation_id where v.id = explanation_version_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id))) with check (exists (select 1 from public.ai_explanation_versions v join public.ai_explanations e on e.id = v.explanation_id where v.id = explanation_version_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id)));
create policy "AI explanation views managed through version" on public.ai_explanation_views for all to authenticated using (viewed_by = auth.uid() or exists (select 1 from public.ai_explanation_versions v join public.ai_explanations e on e.id = v.explanation_id where v.id = explanation_version_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id))) with check (viewed_by = auth.uid() or exists (select 1 from public.ai_explanation_versions v join public.ai_explanations e on e.id = v.explanation_id where v.id = explanation_version_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id)));
create policy "AI explanation feedback managed through version" on public.ai_explanation_feedback for all to authenticated using (submitted_by = auth.uid() or exists (select 1 from public.ai_explanation_versions v join public.ai_explanations e on e.id = v.explanation_id where v.id = explanation_version_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id))) with check (submitted_by = auth.uid() or exists (select 1 from public.ai_explanation_versions v join public.ai_explanations e on e.id = v.explanation_id where v.id = explanation_version_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id)));
create policy "AI review requests managed through contestability" on public.ai_review_requests for all to authenticated using (exists (select 1 from public.ai_contestability_requests c where c.id = contestability_request_id and (c.requested_by = auth.uid() or public.safesteps_can_manage_ai_explainability(auth.uid(), c.organisation_id)))) with check (exists (select 1 from public.ai_contestability_requests c where c.id = contestability_request_id and public.safesteps_can_manage_ai_explainability(auth.uid(), c.organisation_id)));
create policy "AI review outcomes managed through review" on public.ai_review_outcomes for all to authenticated using (exists (select 1 from public.ai_review_requests r join public.ai_contestability_requests c on c.id = r.contestability_request_id where r.id = review_request_id and (c.requested_by = auth.uid() or public.safesteps_can_manage_ai_explainability(auth.uid(), c.organisation_id)))) with check (exists (select 1 from public.ai_review_requests r join public.ai_contestability_requests c on c.id = r.contestability_request_id where r.id = review_request_id and public.safesteps_can_manage_ai_explainability(auth.uid(), c.organisation_id)));
create policy "AI appeals managed through contestability" on public.ai_appeals for all to authenticated using (exists (select 1 from public.ai_contestability_requests c where c.id = contestability_request_id and (c.requested_by = auth.uid() or public.safesteps_can_manage_ai_explainability(auth.uid(), c.organisation_id)))) with check (exists (select 1 from public.ai_contestability_requests c where c.id = contestability_request_id and public.safesteps_can_manage_ai_explainability(auth.uid(), c.organisation_id)));
create policy "AI correction actions managed through correction" on public.ai_correction_actions for all to authenticated using (exists (select 1 from public.ai_correction_requests c where c.id = correction_request_id and public.safesteps_can_manage_ai_explainability(auth.uid(), c.organisation_id))) with check (exists (select 1 from public.ai_correction_requests c where c.id = correction_request_id and public.safesteps_can_manage_ai_explainability(auth.uid(), c.organisation_id)));
create policy "AI accessibility versions managed through version" on public.ai_accessibility_versions for all to authenticated using (exists (select 1 from public.ai_explanation_versions v join public.ai_explanations e on e.id = v.explanation_id where v.id = explanation_version_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id))) with check (exists (select 1 from public.ai_explanation_versions v join public.ai_explanations e on e.id = v.explanation_id where v.id = explanation_version_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id)));
create policy "AI audience explanations managed through explanation" on public.ai_child_explanations for all to authenticated using (exists (select 1 from public.ai_explanations e where e.id = explanation_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id))) with check (exists (select 1 from public.ai_explanations e where e.id = explanation_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id)));
create policy "AI parent explanations managed through explanation" on public.ai_parent_explanations for all to authenticated using (exists (select 1 from public.ai_explanations e where e.id = explanation_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id))) with check (exists (select 1 from public.ai_explanations e where e.id = explanation_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id)));
create policy "AI worker explanations managed through explanation" on public.ai_worker_explanations for all to authenticated using (exists (select 1 from public.ai_explanations e where e.id = explanation_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id))) with check (exists (select 1 from public.ai_explanations e where e.id = explanation_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id)));
create policy "AI supervisor explanations managed through explanation" on public.ai_supervisor_explanations for all to authenticated using (exists (select 1 from public.ai_explanations e where e.id = explanation_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id))) with check (exists (select 1 from public.ai_explanations e where e.id = explanation_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id)));
create policy "AI quality reviews managed through version" on public.ai_explanation_quality_reviews for all to authenticated using (exists (select 1 from public.ai_explanation_versions v join public.ai_explanations e on e.id = v.explanation_id where v.id = explanation_version_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id))) with check (exists (select 1 from public.ai_explanation_versions v join public.ai_explanations e on e.id = v.explanation_id where v.id = explanation_version_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id)));

insert into public.security_permissions (permission_code, description, resource_type, action, risk_level)
values
  ('ai_explainability.manage', 'Manage AI explanations, decision decomposition, evidence lineage, confidence and uncertainty explanations, audience-specific explanations, and transparency packages.', 'organisation', 'manage_ai_explainability', 'high_impact'),
  ('ai_contestability.manage', 'Manage AI contestability requests, review requests, appeal pathways, correction actions, and review outcomes.', 'organisation', 'manage_ai_contestability', 'high_impact'),
  ('ai_override.review', 'Review human overrides, override patterns, correction propagation, and model impact from overrides.', 'organisation', 'review_ai_override', 'high_impact'),
  ('ai_court_disclosure.approve', 'Approve AI court disclosures, report transparency packages, source lineage summaries, and audit-integrity release records.', 'organisation', 'approve_ai_court_disclosure', 'high_impact')
on conflict (permission_code) do nothing;

insert into public.security_roles (role_code, name, description, role_scope, high_privilege)
values
  ('ai_explainability_manager', 'AI Explainability Manager', 'Responsible for AI explanations, transparency packages, contestability, corrections, overrides, and court disclosure governance.', 'organisation', true)
on conflict (role_code) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.security_roles r
join public.security_permissions p on p.permission_code in (
  'ai_explainability.manage',
  'ai_contestability.manage',
  'ai_override.review',
  'ai_court_disclosure.approve',
  'ai_audit.read'
)
where r.role_code in ('ai_explainability_manager', 'ai_governance_lead')
on conflict do nothing;

insert into public.ai_explanation_templates (
  template_code,
  template_version,
  audience_type,
  explanation_type,
  title,
  body_template,
  required_sections,
  readability_level,
  accessibility_modes,
  cultural_adaptation_required,
  child_safe_required,
  status
)
values
  ('parent_ai_use_plain_language', 1, 'parent', 'plain_language', 'AI use explanation for parents', 'Explains what AI helped with, what information was used, what was not used, and how to request review or correction.', array['ai_involvement','information_used','limits','review_rights','correction_rights'], 'plain_english', array['screen_reader','translated','easy_read'], true, false, 'approved'),
  ('child_safe_ai_explanation', 1, 'child', 'plain_language', 'Child-safe AI explanation', 'Explains AI involvement using age-appropriate and safety-focused language without exposing unnecessary adult or technical details.', array['what_happened','who_reviewed','who_to_ask_for_help'], 'child_friendly', array['screen_reader','audio','symbol_supported'], true, true, 'approved'),
  ('court_ai_transparency_disclosure', 1, 'court', 'court_package', 'Court AI transparency disclosure', 'Discloses AI involvement, human review, source lineage, model and prompt versions, and audit integrity for report packages.', array['ai_involvement','human_review','source_lineage','version_history','audit_integrity'], 'formal', array['screen_reader'], false, false, 'approved')
on conflict (organisation_id, template_code, template_version) do update
set title = excluded.title,
    body_template = excluded.body_template,
    required_sections = excluded.required_sections,
    readability_level = excluded.readability_level,
    accessibility_modes = excluded.accessibility_modes,
    cultural_adaptation_required = excluded.cultural_adaptation_required,
    child_safe_required = excluded.child_safe_required,
    status = excluded.status;
