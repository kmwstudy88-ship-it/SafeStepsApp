alter table public.ai_explanations
  add column if not exists approved_for_release boolean not null default false;

create table if not exists public.ai_use_disclosures (
  id uuid primary key default gen_random_uuid(),
  explanation_id uuid not null references public.ai_explanations(id) on delete cascade,
  use_case_id uuid references public.ai_use_cases(id) on delete set null,
  ai_task_description text not null,
  prohibited_decision_description text not null,
  final_decision_human_controlled boolean not null default true,
  human_reviewer_role text,
  model_name_disclosed boolean not null default false,
  technical_detail_available boolean not null default true,
  correction_path_available boolean not null default true,
  review_path_available boolean not null default true,
  appeal_path_available boolean not null default true,
  disclosure_version text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_decision_components (
  id uuid primary key default gen_random_uuid(),
  explanation_id uuid references public.ai_explanations(id) on delete cascade,
  output_lineage_record_id uuid references public.ai_output_lineage_records(id) on delete set null,
  component_code text not null,
  component_type text not null check (component_type in ('observation', 'reported_statement', 'documented_event', 'professional_opinion', 'model_classification', 'deterministic_calculation', 'inference', 'alternative_interpretation', 'limitation', 'missing_information', 'contradiction', 'human_judgement', 'final_decision')),
  title text not null,
  content text not null,
  output_path text,
  sequence_number integer not null,
  material_to_outcome boolean not null default false,
  generated_by_ai boolean not null default true,
  human_confirmed boolean not null default false,
  human_modified boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'human_reviewed', 'accepted', 'amended', 'rejected', 'withdrawn')),
  created_at timestamptz not null default now(),
  unique (explanation_id, component_code)
);

create table if not exists public.ai_explanation_evidence_links (
  id uuid primary key default gen_random_uuid(),
  explanation_version_id uuid not null references public.ai_explanation_versions(id) on delete cascade,
  decision_component_id uuid references public.ai_decision_components(id) on delete cascade,
  source_resource_type text not null,
  source_resource_id uuid,
  source_resource_version integer,
  source_excerpt text,
  source_excerpt_hash text,
  evidence_relationship text not null check (evidence_relationship in ('supports', 'partially_supports', 'challenges', 'contradicts', 'contextualises', 'limits', 'supersedes')),
  evidence_status text not null check (evidence_status in ('verified_record', 'direct_observation', 'first_person_report', 'third_party_report', 'professional_opinion', 'unverified_allegation', 'disputed_information', 'corrected_information', 'superseded_information', 'ai_generated_draft', 'unknown_source_status')),
  source_date timestamptz,
  correction_status text not null default 'current' check (correction_status in ('current', 'corrected', 'disputed', 'superseded', 'withdrawn')),
  citation_verified boolean not null default false,
  access_verified boolean not null default false,
  sequence_number integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_evidence_assessments (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  source_resource_type text not null,
  source_resource_id uuid,
  source_resource_version integer,
  assessment_context text not null,
  directness_classification text,
  reliability_classification text,
  recency_classification text,
  corroboration_classification text,
  consistency_classification text,
  authenticity_verified boolean,
  correction_status text not null default 'current',
  limitations jsonb not null default '[]'::jsonb,
  assessed_by_service text,
  assessed_by_user_id uuid references auth.users(id) on delete set null,
  human_confirmed boolean not null default false,
  assessed_at timestamptz not null default now()
);

create table if not exists public.ai_contradiction_explanations (
  id uuid primary key default gen_random_uuid(),
  explanation_version_id uuid not null references public.ai_explanation_versions(id) on delete cascade,
  retrieval_contradiction_id uuid references public.ai_retrieval_contradictions(id) on delete set null,
  contradiction_summary text not null,
  source_a_explanation text not null,
  source_b_explanation text not null,
  materiality text not null check (materiality in ('low', 'moderate', 'high', 'critical')),
  resolution_status text not null default 'unresolved' check (resolution_status in ('unresolved', 'human_resolved', 'explained_without_resolution', 'not_material', 'withdrawn')),
  human_resolution text,
  unresolved_reason text,
  included_in_released_explanation boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_missing_information_records (
  id uuid primary key default gen_random_uuid(),
  explanation_id uuid references public.ai_explanations(id) on delete cascade,
  output_lineage_record_id uuid references public.ai_output_lineage_records(id) on delete set null,
  information_category text not null,
  description text not null,
  reason_code text not null check (reason_code in ('no_information_available', 'requested_not_received', 'not_authorised_for_ai_use', 'excluded_unreliable', 'processing_failed', 'outside_relevant_period', 'legally_restricted', 'child_private')),
  requested boolean not null default false,
  available_elsewhere boolean,
  authorised_for_use boolean,
  materiality text not null check (materiality in ('low', 'moderate', 'high', 'critical')),
  effect_on_output text not null,
  human_follow_up_required boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_child_explanation_responses (
  id uuid primary key default gen_random_uuid(),
  child_explanation_id uuid not null references public.ai_child_explanations(id) on delete cascade,
  child_user_id uuid references auth.users(id) on delete set null,
  response_type text not null check (response_type in ('understood', 'did_not_understand', 'wants_safe_person', 'wants_private_review', 'feels_worried', 'needs_help', 'no_response')),
  response_text text,
  worker_follow_up_required boolean not null default false,
  parent_visibility_allowed boolean not null default false,
  responded_at timestamptz not null default now()
);

create table if not exists public.ai_human_reviews (
  id uuid primary key default gen_random_uuid(),
  explanation_id uuid references public.ai_explanations(id) on delete cascade,
  contestability_request_id uuid references public.ai_contestability_requests(id) on delete set null,
  reviewer_user_id uuid references auth.users(id) on delete set null,
  reviewer_role text not null,
  review_type text not null check (review_type in ('source_check', 'explanation_check', 'child_safety_review', 'legal_review', 'technical_review', 'independent_review', 'appeal_review')),
  source_opened boolean not null default false,
  review_notes text,
  decision text not null check (decision in ('approved', 'approved_with_edits', 'changes_required', 'rejected', 'escalated', 'withdrawn')),
  conflict_declared boolean not null default false,
  completed_at timestamptz not null default now()
);

create table if not exists public.ai_human_edits (
  id uuid primary key default gen_random_uuid(),
  human_review_id uuid not null references public.ai_human_reviews(id) on delete cascade,
  explanation_version_id uuid references public.ai_explanation_versions(id) on delete set null,
  edit_type text not null check (edit_type in ('wording', 'evidence_link', 'uncertainty', 'limitation', 'correction_right', 'review_right', 'remove_restricted_content', 'add_contradiction', 'withdraw_claim')),
  original_text text,
  revised_text text,
  edit_reason text not null,
  edited_by uuid references auth.users(id) on delete set null,
  edited_at timestamptz not null default now()
);

create table if not exists public.ai_contestability_evidence (
  id uuid primary key default gen_random_uuid(),
  contestability_request_id uuid not null references public.ai_contestability_requests(id) on delete cascade,
  submitted_by uuid references auth.users(id) on delete set null,
  evidence_resource_type text not null,
  evidence_resource_id uuid,
  evidence_summary text not null,
  evidence_relationship text not null check (evidence_relationship in ('correction_support', 'review_support', 'appeal_support', 'context', 'contradiction', 'withdrawal_request')),
  access_restrictions jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now()
);

create table if not exists public.ai_contestability_triage (
  id uuid primary key default gen_random_uuid(),
  contestability_request_id uuid not null references public.ai_contestability_requests(id) on delete cascade,
  triaged_by uuid references auth.users(id) on delete set null,
  urgency text not null check (urgency in ('routine', 'priority', 'urgent', 'safety_critical')),
  pathway text not null check (pathway in ('correction', 'worker_review', 'supervisor_review', 'independent_review', 'appeal', 'incident_response', 'privacy_review')),
  output_reliance_should_pause boolean not null default false,
  report_release_should_pause boolean not null default false,
  automated_workflow_should_suspend boolean not null default false,
  triage_reason text not null,
  triaged_at timestamptz not null default now()
);

create table if not exists public.ai_review_conflicts (
  id uuid primary key default gen_random_uuid(),
  review_request_id uuid references public.ai_review_requests(id) on delete cascade,
  reviewer_user_id uuid references auth.users(id) on delete set null,
  conflict_type text not null,
  conflict_description text not null,
  management_action text not null,
  replacement_reviewer_id uuid references auth.users(id) on delete set null,
  recorded_at timestamptz not null default now()
);

create table if not exists public.ai_explanation_withdrawals (
  id uuid primary key default gen_random_uuid(),
  explanation_id uuid not null references public.ai_explanations(id) on delete cascade,
  withdrawn_version_id uuid references public.ai_explanation_versions(id) on delete set null,
  withdrawal_reason text not null,
  replacement_explanation_id uuid references public.ai_explanations(id) on delete set null,
  notice_required boolean not null default true,
  notice_sent_at timestamptz,
  withdrawn_by uuid references auth.users(id) on delete set null,
  withdrawn_at timestamptz not null default now()
);

create table if not exists public.ai_appeal_panels (
  id uuid primary key default gen_random_uuid(),
  appeal_id uuid not null references public.ai_appeals(id) on delete cascade,
  panel_reference text not null unique,
  panel_type text not null check (panel_type in ('internal', 'independent', 'governance', 'court_or_tribunal')),
  member_user_ids uuid[] not null default '{}'::uuid[],
  conflict_check_completed boolean not null default false,
  convened_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_appeal_outcomes (
  id uuid primary key default gen_random_uuid(),
  appeal_id uuid not null references public.ai_appeals(id) on delete cascade,
  panel_id uuid references public.ai_appeal_panels(id) on delete set null,
  outcome text not null check (outcome in ('upheld', 'partially_upheld', 'not_upheld', 'returned_for_review', 'correction_required', 'withdrawal_required')),
  reasons_plain_language text not null,
  remedies jsonb not null default '[]'::jsonb,
  next_review_options jsonb not null default '[]'::jsonb,
  decided_by uuid references auth.users(id) on delete set null,
  decided_at timestamptz not null default now()
);

create table if not exists public.ai_accessibility_variants (
  id uuid primary key default gen_random_uuid(),
  explanation_version_id uuid not null references public.ai_explanation_versions(id) on delete cascade,
  variant_type text not null check (variant_type in ('easy_read', 'plain_english', 'screen_reader', 'audio', 'symbol_supported', 'large_text', 'assisted_worker_script')),
  language_code text not null default 'en-AU',
  content_reference text,
  rendered_text text,
  validation_status text not null default 'pending' check (validation_status in ('pending', 'validated', 'failed', 'withdrawn')),
  validated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (explanation_version_id, variant_type, language_code)
);

create table if not exists public.ai_explanation_translations (
  id uuid primary key default gen_random_uuid(),
  explanation_version_id uuid not null references public.ai_explanation_versions(id) on delete cascade,
  language_code text not null,
  translation_method text not null check (translation_method in ('human', 'interpreter_assisted', 'machine_draft_human_validated', 'machine_draft_unreleased')),
  translated_text text not null,
  interpreter_required boolean not null default false,
  validation_status text not null default 'pending' check (validation_status in ('pending', 'validated', 'failed', 'withdrawn')),
  validated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (explanation_version_id, language_code)
);

create table if not exists public.ai_cultural_reviews (
  id uuid primary key default gen_random_uuid(),
  explanation_version_id uuid references public.ai_explanation_versions(id) on delete cascade,
  explanation_id uuid references public.ai_explanations(id) on delete cascade,
  review_scope text not null check (review_scope in ('first_nations', 'cald', 'interpreter', 'terminology', 'bias_check', 'community_review')),
  reviewer_user_id uuid references auth.users(id) on delete set null,
  findings jsonb not null default '[]'::jsonb,
  required_changes jsonb not null default '[]'::jsonb,
  outcome text not null check (outcome in ('passed', 'changes_required', 'failed', 'not_applicable')),
  reviewed_at timestamptz not null default now()
);

create table if not exists public.ai_explanation_validation_results (
  id uuid primary key default gen_random_uuid(),
  explanation_version_id uuid not null references public.ai_explanation_versions(id) on delete cascade,
  validation_type text not null check (validation_type in ('schema', 'citation', 'access', 'contradiction', 'uncertainty', 'human_review_statement', 'audience_authorisation', 'restricted_content', 'language', 'accessibility', 'appeal_pathway', 'release_gate')),
  outcome text not null check (outcome in ('passed', 'failed', 'warning', 'not_applicable')),
  validator_service text,
  validated_by uuid references auth.users(id) on delete set null,
  findings jsonb not null default '[]'::jsonb,
  validated_at timestamptz not null default now()
);

create table if not exists public.ai_contestability_service_levels (
  id uuid primary key default gen_random_uuid(),
  service_level_code text not null,
  service_level_version integer not null,
  request_type text not null,
  urgency text not null check (urgency in ('routine', 'priority', 'urgent', 'safety_critical')),
  acknowledgement_due_interval interval not null,
  triage_due_interval interval not null,
  resolution_due_interval interval,
  escalation_interval interval,
  escalation_role text,
  jurisdiction_code text,
  applicable_user_types text[] not null default '{}'::text[],
  effective_from timestamptz not null,
  expires_at timestamptz,
  unique (service_level_code, service_level_version)
);

create table if not exists public.ai_contestability_notifications (
  id uuid primary key default gen_random_uuid(),
  contestability_request_id uuid references public.ai_contestability_requests(id) on delete cascade,
  appeal_id uuid references public.ai_appeals(id) on delete cascade,
  recipient_user_id uuid references auth.users(id) on delete set null,
  notification_type text not null check (notification_type in ('received', 'paused', 'more_information_needed', 'reviewer_assigned', 'correction_accepted', 'correction_rejected', 'explanation_replaced', 'appeal_decided', 'timeframe_changed')),
  delivery_channel text not null check (delivery_channel in ('in_app', 'email', 'sms_safe_preview', 'worker_assisted', 'postal')),
  safe_preview_text text,
  content_reference text not null,
  delivery_status text not null default 'queued' check (delivery_status in ('queued', 'sent', 'delivered', 'failed', 'cancelled')),
  delivered_at timestamptz,
  acknowledged_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_use_disclosures_explanation on public.ai_use_disclosures(explanation_id);
create index if not exists idx_ai_decision_components_explanation on public.ai_decision_components(explanation_id, sequence_number);
create index if not exists idx_ai_explanation_evidence_links_version on public.ai_explanation_evidence_links(explanation_version_id, evidence_relationship);
create index if not exists idx_ai_evidence_assessments_org_source on public.ai_evidence_assessments(organisation_id, source_resource_type, source_resource_id);
create index if not exists idx_ai_contradiction_explanations_version on public.ai_contradiction_explanations(explanation_version_id);
create index if not exists idx_ai_missing_information_explanation on public.ai_missing_information_records(explanation_id);
create index if not exists idx_ai_human_reviews_explanation on public.ai_human_reviews(explanation_id, review_type);
create index if not exists idx_ai_contestability_triage_request on public.ai_contestability_triage(contestability_request_id);
create index if not exists idx_ai_explanation_withdrawals_explanation on public.ai_explanation_withdrawals(explanation_id, withdrawn_at desc);
create index if not exists idx_ai_validation_results_version on public.ai_explanation_validation_results(explanation_version_id, validation_type);
create index if not exists idx_ai_contestability_notifications_request on public.ai_contestability_notifications(contestability_request_id, delivery_status);

alter table public.ai_use_disclosures enable row level security;
alter table public.ai_decision_components enable row level security;
alter table public.ai_explanation_evidence_links enable row level security;
alter table public.ai_evidence_assessments enable row level security;
alter table public.ai_contradiction_explanations enable row level security;
alter table public.ai_missing_information_records enable row level security;
alter table public.ai_child_explanation_responses enable row level security;
alter table public.ai_human_reviews enable row level security;
alter table public.ai_human_edits enable row level security;
alter table public.ai_contestability_evidence enable row level security;
alter table public.ai_contestability_triage enable row level security;
alter table public.ai_review_conflicts enable row level security;
alter table public.ai_explanation_withdrawals enable row level security;
alter table public.ai_appeal_panels enable row level security;
alter table public.ai_appeal_outcomes enable row level security;
alter table public.ai_accessibility_variants enable row level security;
alter table public.ai_explanation_translations enable row level security;
alter table public.ai_cultural_reviews enable row level security;
alter table public.ai_explanation_validation_results enable row level security;
alter table public.ai_contestability_service_levels enable row level security;
alter table public.ai_contestability_notifications enable row level security;

create policy "AI use disclosures managed through explanation" on public.ai_use_disclosures for all to authenticated using (exists (select 1 from public.ai_explanations e where e.id = explanation_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id))) with check (exists (select 1 from public.ai_explanations e where e.id = explanation_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id)));
create policy "AI decision components managed through explanation" on public.ai_decision_components for all to authenticated using (exists (select 1 from public.ai_explanations e where e.id = explanation_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id))) with check (exists (select 1 from public.ai_explanations e where e.id = explanation_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id)));
create policy "AI explanation evidence links managed through version" on public.ai_explanation_evidence_links for all to authenticated using (exists (select 1 from public.ai_explanation_versions v join public.ai_explanations e on e.id = v.explanation_id where v.id = explanation_version_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id))) with check (exists (select 1 from public.ai_explanation_versions v join public.ai_explanations e on e.id = v.explanation_id where v.id = explanation_version_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id)));
create policy "AI evidence assessments managed by explainability admins" on public.ai_evidence_assessments for all to authenticated using (public.safesteps_can_manage_ai_explainability(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_ai_explainability(auth.uid(), organisation_id));
create policy "AI contradiction explanations managed through version" on public.ai_contradiction_explanations for all to authenticated using (exists (select 1 from public.ai_explanation_versions v join public.ai_explanations e on e.id = v.explanation_id where v.id = explanation_version_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id))) with check (exists (select 1 from public.ai_explanation_versions v join public.ai_explanations e on e.id = v.explanation_id where v.id = explanation_version_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id)));
create policy "AI missing information managed through explanation" on public.ai_missing_information_records for all to authenticated using (exists (select 1 from public.ai_explanations e where e.id = explanation_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id))) with check (exists (select 1 from public.ai_explanations e where e.id = explanation_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id)));
create policy "AI child responses managed through child explanation" on public.ai_child_explanation_responses for all to authenticated using (child_user_id = auth.uid() or exists (select 1 from public.ai_child_explanations ce join public.ai_explanations e on e.id = ce.explanation_id where ce.id = child_explanation_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id))) with check (child_user_id = auth.uid() or exists (select 1 from public.ai_child_explanations ce join public.ai_explanations e on e.id = ce.explanation_id where ce.id = child_explanation_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id)));
create policy "AI human reviews managed through explanation" on public.ai_human_reviews for all to authenticated using (exists (select 1 from public.ai_explanations e where e.id = explanation_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id))) with check (exists (select 1 from public.ai_explanations e where e.id = explanation_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id)));
create policy "AI human edits managed through review" on public.ai_human_edits for all to authenticated using (exists (select 1 from public.ai_human_reviews hr join public.ai_explanations e on e.id = hr.explanation_id where hr.id = human_review_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id))) with check (exists (select 1 from public.ai_human_reviews hr join public.ai_explanations e on e.id = hr.explanation_id where hr.id = human_review_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id)));
create policy "AI contestability evidence managed through request" on public.ai_contestability_evidence for all to authenticated using (submitted_by = auth.uid() or exists (select 1 from public.ai_contestability_requests c where c.id = contestability_request_id and (c.requested_by = auth.uid() or public.safesteps_can_manage_ai_explainability(auth.uid(), c.organisation_id)))) with check (submitted_by = auth.uid() or exists (select 1 from public.ai_contestability_requests c where c.id = contestability_request_id and public.safesteps_can_manage_ai_explainability(auth.uid(), c.organisation_id)));
create policy "AI contestability triage managed through request" on public.ai_contestability_triage for all to authenticated using (exists (select 1 from public.ai_contestability_requests c where c.id = contestability_request_id and public.safesteps_can_manage_ai_explainability(auth.uid(), c.organisation_id))) with check (exists (select 1 from public.ai_contestability_requests c where c.id = contestability_request_id and public.safesteps_can_manage_ai_explainability(auth.uid(), c.organisation_id)));
create policy "AI review conflicts managed through review" on public.ai_review_conflicts for all to authenticated using (exists (select 1 from public.ai_review_requests r join public.ai_contestability_requests c on c.id = r.contestability_request_id where r.id = review_request_id and public.safesteps_can_manage_ai_explainability(auth.uid(), c.organisation_id))) with check (exists (select 1 from public.ai_review_requests r join public.ai_contestability_requests c on c.id = r.contestability_request_id where r.id = review_request_id and public.safesteps_can_manage_ai_explainability(auth.uid(), c.organisation_id)));
create policy "AI explanation withdrawals managed through explanation" on public.ai_explanation_withdrawals for all to authenticated using (exists (select 1 from public.ai_explanations e where e.id = explanation_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id))) with check (exists (select 1 from public.ai_explanations e where e.id = explanation_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id)));
create policy "AI appeal panels managed through appeal" on public.ai_appeal_panels for all to authenticated using (exists (select 1 from public.ai_appeals a join public.ai_contestability_requests c on c.id = a.contestability_request_id where a.id = appeal_id and public.safesteps_can_manage_ai_explainability(auth.uid(), c.organisation_id))) with check (exists (select 1 from public.ai_appeals a join public.ai_contestability_requests c on c.id = a.contestability_request_id where a.id = appeal_id and public.safesteps_can_manage_ai_explainability(auth.uid(), c.organisation_id)));
create policy "AI appeal outcomes managed through appeal" on public.ai_appeal_outcomes for all to authenticated using (exists (select 1 from public.ai_appeals a join public.ai_contestability_requests c on c.id = a.contestability_request_id where a.id = appeal_id and (c.requested_by = auth.uid() or public.safesteps_can_manage_ai_explainability(auth.uid(), c.organisation_id)))) with check (exists (select 1 from public.ai_appeals a join public.ai_contestability_requests c on c.id = a.contestability_request_id where a.id = appeal_id and public.safesteps_can_manage_ai_explainability(auth.uid(), c.organisation_id)));
create policy "AI accessibility variants managed through version" on public.ai_accessibility_variants for all to authenticated using (exists (select 1 from public.ai_explanation_versions v join public.ai_explanations e on e.id = v.explanation_id where v.id = explanation_version_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id))) with check (exists (select 1 from public.ai_explanation_versions v join public.ai_explanations e on e.id = v.explanation_id where v.id = explanation_version_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id)));
create policy "AI translations managed through version" on public.ai_explanation_translations for all to authenticated using (exists (select 1 from public.ai_explanation_versions v join public.ai_explanations e on e.id = v.explanation_id where v.id = explanation_version_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id))) with check (exists (select 1 from public.ai_explanation_versions v join public.ai_explanations e on e.id = v.explanation_id where v.id = explanation_version_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id)));
create policy "AI cultural reviews managed through explanation" on public.ai_cultural_reviews for all to authenticated using (exists (select 1 from public.ai_explanations e where e.id = explanation_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id))) with check (exists (select 1 from public.ai_explanations e where e.id = explanation_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id)));
create policy "AI validation results managed through version" on public.ai_explanation_validation_results for all to authenticated using (exists (select 1 from public.ai_explanation_versions v join public.ai_explanations e on e.id = v.explanation_id where v.id = explanation_version_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id))) with check (exists (select 1 from public.ai_explanation_versions v join public.ai_explanations e on e.id = v.explanation_id where v.id = explanation_version_id and public.safesteps_can_manage_ai_explainability(auth.uid(), e.organisation_id)));
create policy "AI contestability service levels managed by global explainability admins" on public.ai_contestability_service_levels for all to authenticated using (public.has_resource_permission(auth.uid(), 'global', null, 'ai_explainability.manage')) with check (public.has_resource_permission(auth.uid(), 'global', null, 'ai_explainability.manage'));
create policy "AI contestability notifications managed through request" on public.ai_contestability_notifications for all to authenticated using (recipient_user_id = auth.uid() or exists (select 1 from public.ai_contestability_requests c where c.id = contestability_request_id and public.safesteps_can_manage_ai_explainability(auth.uid(), c.organisation_id))) with check (recipient_user_id = auth.uid() or exists (select 1 from public.ai_contestability_requests c where c.id = contestability_request_id and public.safesteps_can_manage_ai_explainability(auth.uid(), c.organisation_id)));

create or replace function public.can_release_ai_explanation(
  p_explanation_version_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.ai_explanation_versions ev
    join public.ai_explanations e on e.id = ev.explanation_id
    where ev.id = p_explanation_version_id
      and e.approved_for_release = true
      and e.explanation_status in ('approved', 'published')
      and ev.approved_at is not null
      and not exists (
        select 1
        from public.ai_explanation_validation_results vr
        where vr.explanation_version_id = ev.id
          and vr.outcome = 'failed'
      )
      and not exists (
        select 1
        from public.ai_explanation_evidence_links el
        where el.explanation_version_id = ev.id
          and (el.citation_verified = false or el.access_verified = false)
      )
      and not exists (
        select 1
        from public.ai_explanation_withdrawals ew
        where ew.explanation_id = e.id
          and ew.replacement_explanation_id is null
      )
  );
$$;

revoke all on function public.can_release_ai_explanation(uuid) from public;
grant execute on function public.can_release_ai_explanation(uuid) to authenticated;

create or replace function public.should_pause_ai_output_reliance(
  p_output_lineage_record_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.ai_contestability_requests cr
    join public.ai_contestability_triage ct on ct.contestability_request_id = cr.id
    where cr.status not in ('resolved', 'closed', 'withdrawn')
      and (
        ct.output_reliance_should_pause = true
        or ct.report_release_should_pause = true
        or ct.automated_workflow_should_suspend = true
      )
      and (
        cr.explanation_id in (
          select e.id
          from public.ai_explanations e
          where e.output_lineage_record_id = p_output_lineage_record_id
        )
      )
  );
$$;

revoke all on function public.should_pause_ai_output_reliance(uuid) from public;
grant execute on function public.should_pause_ai_output_reliance(uuid) to authenticated;

insert into public.ai_contestability_service_levels (
  service_level_code,
  service_level_version,
  request_type,
  urgency,
  acknowledgement_due_interval,
  triage_due_interval,
  resolution_due_interval,
  escalation_interval,
  escalation_role,
  jurisdiction_code,
  applicable_user_types,
  effective_from
)
values
  ('standard_ai_explanation_review', 1, 'review_request', 'routine', interval '2 days', interval '5 days', interval '20 days', interval '10 days', 'ai_explainability_manager', 'AU', array['parent', 'worker', 'supervisor'], now()),
  ('urgent_ai_safety_challenge', 1, 'review_request', 'safety_critical', interval '4 hours', interval '1 day', interval '5 days', interval '1 day', 'case_supervisor', 'AU', array['child', 'parent', 'worker', 'supervisor'], now()),
  ('formal_ai_appeal', 1, 'appeal', 'priority', interval '2 days', interval '5 days', interval '30 days', interval '10 days', 'ai_governance_lead', 'AU', array['parent', 'advocate', 'worker', 'supervisor'], now())
on conflict (service_level_code, service_level_version) do nothing;
