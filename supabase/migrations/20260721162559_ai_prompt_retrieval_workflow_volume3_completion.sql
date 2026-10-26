create table if not exists public.ai_prompt_variables (
  id uuid primary key default gen_random_uuid(),
  prompt_version_id uuid not null references public.ai_prompt_versions(id) on delete cascade,
  variable_name text not null,
  variable_type text not null check (variable_type in ('text', 'number', 'boolean', 'uuid', 'date', 'enum', 'json', 'source_excerpt', 'classification_code', 'jurisdiction_code', 'language_code')),
  source_type text not null check (source_type in ('server_resolved', 'approved_registry', 'retrieved_evidence', 'validated_user_input', 'workflow_state', 'tool_result')),
  source_reference text,
  required boolean not null default true,
  validation_rule jsonb not null default '{}'::jsonb,
  sanitisation_rule jsonb not null default '{}'::jsonb,
  maximum_length integer,
  sensitive boolean not null default false,
  allow_user_control boolean not null default false,
  created_at timestamptz not null default now(),
  unique (prompt_version_id, variable_name)
);

create table if not exists public.ai_prompt_approval_requests (
  id uuid primary key default gen_random_uuid(),
  prompt_version_id uuid references public.ai_prompt_versions(id) on delete cascade,
  prompt_bundle_id uuid references public.ai_prompt_bundles(id) on delete cascade,
  requested_stage text not null check (requested_stage in ('prohibited_instruction_scan', 'privacy_review', 'security_review', 'child_safety_review', 'synthetic_test_suite', 'golden_dataset_evaluation', 'adversarial_testing', 'human_reviewer_evaluation', 'controlled_pilot', 'release_approval')),
  required_reviews jsonb not null default '[]'::jsonb,
  completed_reviews jsonb not null default '[]'::jsonb,
  unresolved_findings jsonb not null default '[]'::jsonb,
  status text not null default 'submitted' check (status in ('submitted', 'in_review', 'needs_changes', 'approved', 'rejected', 'withdrawn')),
  requested_by uuid references auth.users(id) on delete set null,
  decided_by uuid references auth.users(id) on delete set null,
  submitted_at timestamptz not null default now(),
  decided_at timestamptz,
  constraint ai_prompt_approval_requests_subject check (prompt_version_id is not null or prompt_bundle_id is not null)
);

create table if not exists public.ai_prompt_releases (
  id uuid primary key default gen_random_uuid(),
  release_reference text not null unique,
  prompt_bundle_id uuid not null references public.ai_prompt_bundles(id) on delete restrict,
  environment_code text not null check (environment_code in ('research_sandbox', 'development', 'automated_testing', 'security_testing', 'validation', 'controlled_pilot', 'staging', 'production', 'disaster_recovery', 'quarantine')),
  previous_release_id uuid references public.ai_prompt_releases(id) on delete set null,
  release_type text not null check (release_type in ('initial', 'patch', 'minor', 'major', 'rollback', 'emergency_suspension', 'retirement')),
  change_classification text not null check (change_classification in ('spelling_formatting_only', 'non_material_wording', 'variable_change', 'output_schema_change', 'policy_instruction_change', 'safety_instruction_change', 'tool_permission_change', 'retrieval_behaviour_change', 'human_review_change', 'major_task_redesign')),
  validation_evidence jsonb not null default '{}'::jsonb,
  rollback_bundle_id uuid references public.ai_prompt_bundles(id) on delete set null,
  status text not null default 'planned' check (status in ('planned', 'validating', 'approved', 'released', 'rolled_back', 'failed', 'retired')),
  approved_by uuid references auth.users(id) on delete set null,
  released_at timestamptz,
  rolled_back_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_retrieval_query_plans (
  id uuid primary key default gen_random_uuid(),
  retrieval_policy_id uuid not null references public.ai_retrieval_policies(id) on delete cascade,
  plan_version integer not null,
  query_stage text not null check (query_stage in ('supporting_evidence', 'challenging_evidence', 'contextual_evidence', 'alternative_explanations', 'limitations', 'corrections', 'subject_responses', 'appeal_information', 'general_retrieval')),
  query_type text not null check (query_type in ('keyword', 'semantic', 'hybrid', 'metadata_filter', 'relationship_graph', 'manual_selection')),
  query_template jsonb not null default '{}'::jsonb,
  source_filter_rules jsonb not null default '{}'::jsonb,
  ranking_rules jsonb not null default '{}'::jsonb,
  maximum_results integer not null check (maximum_results > 0),
  required boolean not null default true,
  created_at timestamptz not null default now(),
  unique (retrieval_policy_id, plan_version, query_stage)
);

create table if not exists public.ai_retrieval_results (
  id uuid primary key default gen_random_uuid(),
  workflow_run_id uuid references public.ai_workflow_execution_runs(id) on delete cascade,
  retrieval_policy_id uuid not null references public.ai_retrieval_policies(id) on delete restrict,
  query_plan_id uuid references public.ai_retrieval_query_plans(id) on delete set null,
  query_stage text not null,
  source_resource_type text not null,
  source_resource_id uuid,
  source_reference text,
  source_version text,
  relevance_score numeric(8,6),
  reliability_classification text,
  evidence_relationship text check (evidence_relationship in ('supports', 'partially_supports', 'challenges', 'contradicts', 'contextualises', 'limits', 'source', 'unknown')),
  access_decision_reference text,
  selection_reason text not null,
  included_in_context boolean not null default false,
  exclusion_reason text,
  retrieved_at timestamptz not null default now()
);

create table if not exists public.ai_retrieval_contradictions (
  id uuid primary key default gen_random_uuid(),
  workflow_run_id uuid references public.ai_workflow_execution_runs(id) on delete cascade,
  source_a_type text not null,
  source_a_id uuid,
  source_a_reference text,
  source_b_type text not null,
  source_b_id uuid,
  source_b_reference text,
  contradiction_type text not null check (contradiction_type in ('conflicting_fact', 'newer_supersedes_older', 'parent_disagreement', 'child_disagreement', 'professional_disagreement', 'inconsistent_observation', 'alternative_explanation', 'source_reliability_issue', 'incomplete_record')),
  contradiction_summary text not null,
  materiality text not null check (materiality in ('low', 'medium', 'high', 'critical')),
  machine_detected boolean not null default false,
  human_confirmed boolean not null default false,
  requires_resolution boolean not null default true,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_output_citations (
  id uuid primary key default gen_random_uuid(),
  output_lineage_record_id uuid references public.ai_output_lineage_records(id) on delete cascade,
  inference_request_id uuid references public.ai_inference_requests(id) on delete cascade,
  output_path text not null,
  claim_identifier text,
  source_resource_type text not null,
  source_resource_id uuid,
  source_reference text,
  source_version text,
  source_excerpt_hash text,
  relationship text not null check (relationship in ('supports', 'partially_supports', 'challenges', 'contradicts', 'contextualises', 'limits', 'source')),
  citation_status text not null default 'unverified' check (citation_status in ('unverified', 'verified', 'invalid', 'insufficient_support', 'superseded', 'cross_case_blocked', 'needs_human_review')),
  verified_by_service text,
  verified_by_user_id uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  constraint ai_output_citations_parent check (output_lineage_record_id is not null or inference_request_id is not null)
);

create table if not exists public.ai_context_packages (
  id uuid primary key default gen_random_uuid(),
  workflow_run_id uuid references public.ai_workflow_execution_runs(id) on delete cascade,
  inference_request_id uuid references public.ai_inference_requests(id) on delete cascade,
  retrieval_policy_id uuid not null references public.ai_retrieval_policies(id) on delete restrict,
  context_version integer not null,
  source_count integer not null default 0,
  estimated_token_count integer not null default 0,
  classification_codes text[] not null default '{}'::text[],
  child_data_included boolean not null default false,
  safety_data_included boolean not null default false,
  legal_data_included boolean not null default false,
  contradictory_sources_included boolean not null default false,
  transformation_manifest jsonb not null default '{}'::jsonb,
  context_hash text not null,
  created_at timestamptz not null default now(),
  unique (workflow_run_id, context_version),
  constraint ai_context_packages_parent check (workflow_run_id is not null or inference_request_id is not null)
);

create table if not exists public.ai_context_items (
  id uuid primary key default gen_random_uuid(),
  context_package_id uuid not null references public.ai_context_packages(id) on delete cascade,
  sequence_number integer not null,
  source_resource_type text not null,
  source_resource_id uuid,
  source_reference text,
  source_version text,
  content_role text not null check (content_role in ('retrieved_evidence', 'source_metadata', 'tool_result', 'user_content', 'limitation', 'contradiction', 'correction')),
  evidence_status text,
  source_date timestamptz,
  original_excerpt_hash text,
  transformed_excerpt_hash text not null,
  identifiers_removed boolean not null default false,
  embedded_instruction_removed boolean not null default false,
  token_estimate integer,
  created_at timestamptz not null default now(),
  unique (context_package_id, sequence_number)
);

create table if not exists public.ai_prompt_injection_scans (
  id uuid primary key default gen_random_uuid(),
  workflow_run_id uuid references public.ai_workflow_execution_runs(id) on delete cascade,
  inference_request_id uuid references public.ai_inference_requests(id) on delete cascade,
  scanned_content_type text not null check (scanned_content_type in ('user_input', 'uploaded_document', 'retrieved_evidence', 'tool_result', 'transcription', 'image_text', 'database_field', 'report', 'web_content')),
  scanned_resource_type text,
  scanned_resource_id uuid,
  scanned_resource_reference text,
  detector_code text not null,
  detector_version text not null,
  risk_score numeric(6,5),
  detected_patterns jsonb not null default '[]'::jsonb,
  outcome text not null check (outcome in ('no_concern', 'low_risk_instruction_like_text', 'suspicious_embedded_instruction', 'likely_prompt_injection', 'possible_data_exfiltration', 'possible_tool_abuse', 'possible_cross_tenant_request', 'unable_to_determine')),
  content_action text not null check (content_action in ('allow', 'strip_embedded_instruction', 'minimise_context', 'block', 'route_to_human_review', 'quarantine_source')),
  human_review_required boolean not null default false,
  reviewed_by uuid references auth.users(id) on delete set null,
  scanned_at timestamptz not null default now(),
  constraint ai_prompt_injection_scans_parent check (workflow_run_id is not null or inference_request_id is not null)
);

create table if not exists public.ai_tool_call_authorisations (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid not null references public.ai_tool_registry(id) on delete cascade,
  use_case_id uuid not null references public.ai_use_cases(id) on delete cascade,
  workflow_version_id uuid references public.ai_workflow_versions(id) on delete cascade,
  permitted_stages text[] not null,
  permitted_roles text[] not null default '{}'::text[],
  permitted_actions text[] not null default '{}'::text[],
  maximum_calls_per_run integer not null default 1 check (maximum_calls_per_run > 0),
  maximum_records_per_call integer,
  human_confirmation_required boolean not null default true,
  authorisation_conditions jsonb not null default '{}'::jsonb,
  approval_decision_id uuid references public.ai_governance_decisions(id) on delete restrict,
  effective_from timestamptz not null default now(),
  expires_at timestamptz,
  status text not null default 'active' check (status in ('active', 'suspended', 'expired', 'retired')),
  created_at timestamptz not null default now()
);

create table if not exists public.ai_tool_calls (
  id uuid primary key default gen_random_uuid(),
  workflow_run_id uuid references public.ai_workflow_execution_runs(id) on delete cascade,
  workflow_step_run_id uuid references public.ai_workflow_step_runs(id) on delete set null,
  inference_request_id uuid references public.ai_inference_requests(id) on delete set null,
  tool_id uuid not null references public.ai_tool_registry(id) on delete restrict,
  authorisation_id uuid references public.ai_tool_call_authorisations(id) on delete set null,
  requested_arguments jsonb not null default '{}'::jsonb,
  validated_arguments jsonb,
  authorisation_outcome text not null check (authorisation_outcome in ('allowed', 'blocked', 'human_confirmation_required', 'denied_no_authorisation', 'denied_scope', 'denied_call_limit', 'denied_suspension')),
  denial_reason text,
  human_confirmation_required boolean not null default false,
  human_confirmation_reference text,
  execution_status text not null default 'requested' check (execution_status in ('requested', 'validated', 'executing', 'completed', 'failed', 'blocked', 'cancelled')),
  idempotency_key text,
  result_reference text,
  result_hash text,
  requested_at timestamptz not null default now(),
  executed_at timestamptz,
  completed_at timestamptz,
  constraint ai_tool_calls_parent check (workflow_run_id is not null or inference_request_id is not null)
);

create index if not exists idx_ai_prompt_variables_version on public.ai_prompt_variables(prompt_version_id);
create index if not exists idx_ai_prompt_approval_requests_status on public.ai_prompt_approval_requests(status, submitted_at desc);
create index if not exists idx_ai_prompt_releases_bundle_env on public.ai_prompt_releases(prompt_bundle_id, environment_code, status);
create index if not exists idx_ai_retrieval_query_plans_policy on public.ai_retrieval_query_plans(retrieval_policy_id, plan_version);
create index if not exists idx_ai_retrieval_results_run_stage on public.ai_retrieval_results(workflow_run_id, query_stage);
create index if not exists idx_ai_retrieval_contradictions_run_materiality on public.ai_retrieval_contradictions(workflow_run_id, materiality);
create index if not exists idx_ai_output_citations_request on public.ai_output_citations(inference_request_id, citation_status);
create index if not exists idx_ai_context_packages_run on public.ai_context_packages(workflow_run_id, context_version);
create index if not exists idx_ai_context_items_package on public.ai_context_items(context_package_id, sequence_number);
create index if not exists idx_ai_prompt_injection_scans_request on public.ai_prompt_injection_scans(inference_request_id, outcome);
create index if not exists idx_ai_tool_call_authorisations_tool_status on public.ai_tool_call_authorisations(tool_id, status);
create index if not exists idx_ai_tool_calls_tool_status on public.ai_tool_calls(tool_id, execution_status, requested_at desc);

alter table public.ai_prompt_variables enable row level security;
alter table public.ai_prompt_approval_requests enable row level security;
alter table public.ai_prompt_releases enable row level security;
alter table public.ai_retrieval_query_plans enable row level security;
alter table public.ai_retrieval_results enable row level security;
alter table public.ai_retrieval_contradictions enable row level security;
alter table public.ai_output_citations enable row level security;
alter table public.ai_context_packages enable row level security;
alter table public.ai_context_items enable row level security;
alter table public.ai_prompt_injection_scans enable row level security;
alter table public.ai_tool_call_authorisations enable row level security;
alter table public.ai_tool_calls enable row level security;

create policy "AI prompt variables managed through prompt" on public.ai_prompt_variables for all to authenticated
using (exists (select 1 from public.ai_prompt_versions pv join public.ai_prompt_templates pt on pt.id = pv.prompt_template_id where pv.id = prompt_version_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), pt.organisation_id)))
with check (exists (select 1 from public.ai_prompt_versions pv join public.ai_prompt_templates pt on pt.id = pv.prompt_template_id where pv.id = prompt_version_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), pt.organisation_id)));

create policy "AI prompt approval requests managed by prompt admins" on public.ai_prompt_approval_requests for all to authenticated
using (
  exists (select 1 from public.ai_prompt_versions pv join public.ai_prompt_templates pt on pt.id = pv.prompt_template_id where pv.id = prompt_version_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), pt.organisation_id))
  or exists (select 1 from public.ai_prompt_bundles b where b.id = prompt_bundle_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), b.organisation_id))
)
with check (
  exists (select 1 from public.ai_prompt_versions pv join public.ai_prompt_templates pt on pt.id = pv.prompt_template_id where pv.id = prompt_version_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), pt.organisation_id))
  or exists (select 1 from public.ai_prompt_bundles b where b.id = prompt_bundle_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), b.organisation_id))
);

create policy "AI prompt releases managed through bundle" on public.ai_prompt_releases for all to authenticated
using (exists (select 1 from public.ai_prompt_bundles b where b.id = prompt_bundle_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), b.organisation_id)))
with check (exists (select 1 from public.ai_prompt_bundles b where b.id = prompt_bundle_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), b.organisation_id)));

create policy "AI retrieval query plans managed through policy" on public.ai_retrieval_query_plans for all to authenticated
using (exists (select 1 from public.ai_retrieval_policies p where p.id = retrieval_policy_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), p.organisation_id)))
with check (exists (select 1 from public.ai_retrieval_policies p where p.id = retrieval_policy_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), p.organisation_id)));

create policy "AI retrieval results managed through run" on public.ai_retrieval_results for all to authenticated
using (exists (select 1 from public.ai_workflow_execution_runs r where r.id = workflow_run_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), r.organisation_id)))
with check (exists (select 1 from public.ai_workflow_execution_runs r where r.id = workflow_run_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), r.organisation_id)));

create policy "AI retrieval contradictions managed through run" on public.ai_retrieval_contradictions for all to authenticated
using (exists (select 1 from public.ai_workflow_execution_runs r where r.id = workflow_run_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), r.organisation_id)))
with check (exists (select 1 from public.ai_workflow_execution_runs r where r.id = workflow_run_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), r.organisation_id)));

create policy "AI output citations readable through request" on public.ai_output_citations for select to authenticated
using (exists (select 1 from public.ai_inference_requests r where r.id = inference_request_id and (r.requested_by = auth.uid() or public.safesteps_can_manage_ai_operations(auth.uid(), r.organisation_id))));

create policy "AI output citations insertable by operations admins" on public.ai_output_citations for insert to authenticated
with check (exists (select 1 from public.ai_inference_requests r where r.id = inference_request_id and public.safesteps_can_manage_ai_operations(auth.uid(), r.organisation_id)));

create policy "AI context packages managed through run or request" on public.ai_context_packages for all to authenticated
using (
  exists (select 1 from public.ai_workflow_execution_runs r where r.id = workflow_run_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), r.organisation_id))
  or exists (select 1 from public.ai_inference_requests ir where ir.id = inference_request_id and public.safesteps_can_manage_ai_operations(auth.uid(), ir.organisation_id))
)
with check (
  exists (select 1 from public.ai_workflow_execution_runs r where r.id = workflow_run_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), r.organisation_id))
  or exists (select 1 from public.ai_inference_requests ir where ir.id = inference_request_id and public.safesteps_can_manage_ai_operations(auth.uid(), ir.organisation_id))
);

create policy "AI context items managed through package" on public.ai_context_items for all to authenticated
using (exists (select 1 from public.ai_context_packages p left join public.ai_workflow_execution_runs wr on wr.id = p.workflow_run_id left join public.ai_inference_requests ir on ir.id = p.inference_request_id where p.id = context_package_id and (public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), wr.organisation_id) or public.safesteps_can_manage_ai_operations(auth.uid(), ir.organisation_id))))
with check (exists (select 1 from public.ai_context_packages p left join public.ai_workflow_execution_runs wr on wr.id = p.workflow_run_id left join public.ai_inference_requests ir on ir.id = p.inference_request_id where p.id = context_package_id and (public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), wr.organisation_id) or public.safesteps_can_manage_ai_operations(auth.uid(), ir.organisation_id))));

create policy "AI prompt injection scans managed through run or request" on public.ai_prompt_injection_scans for all to authenticated
using (
  exists (select 1 from public.ai_workflow_execution_runs r where r.id = workflow_run_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), r.organisation_id))
  or exists (select 1 from public.ai_inference_requests ir where ir.id = inference_request_id and public.safesteps_can_manage_ai_operations(auth.uid(), ir.organisation_id))
)
with check (
  exists (select 1 from public.ai_workflow_execution_runs r where r.id = workflow_run_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), r.organisation_id))
  or exists (select 1 from public.ai_inference_requests ir where ir.id = inference_request_id and public.safesteps_can_manage_ai_operations(auth.uid(), ir.organisation_id))
);

create policy "AI tool call authorisations managed through tool" on public.ai_tool_call_authorisations for all to authenticated
using (exists (select 1 from public.ai_tool_registry t where t.id = tool_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), t.organisation_id)))
with check (exists (select 1 from public.ai_tool_registry t where t.id = tool_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), t.organisation_id)));

create policy "AI tool calls managed through tool" on public.ai_tool_calls for all to authenticated
using (exists (select 1 from public.ai_tool_registry t where t.id = tool_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), t.organisation_id)))
with check (exists (select 1 from public.ai_tool_registry t where t.id = tool_id and public.safesteps_can_manage_ai_prompt_workflow(auth.uid(), t.organisation_id)));

insert into public.security_permissions (permission_code, description, resource_type, action, risk_level)
values
  ('ai_prompt_variable.manage', 'Manage typed prompt variables, source restrictions, validation rules, and sanitisation rules.', 'organisation', 'manage_ai_prompt_variable', 'high_impact'),
  ('ai_prompt_release.approve', 'Approve prompt releases, release classifications, validation evidence, and rollback bundles.', 'organisation', 'approve_ai_prompt_release', 'high_impact'),
  ('ai_retrieval_result.review', 'Review retrieval results, evidence ranking, contradictory evidence, context packages, and citation quality.', 'organisation', 'review_ai_retrieval_result', 'high_impact'),
  ('ai_tool_call.review', 'Review tool-call authorisations, gateway outcomes, idempotency, and human confirmation records.', 'organisation', 'review_ai_tool_call', 'high_impact')
on conflict (permission_code) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.security_roles r
join public.security_permissions p on p.permission_code in (
  'ai_prompt_variable.manage',
  'ai_prompt_release.approve',
  'ai_retrieval_result.review',
  'ai_tool_call.review',
  'ai_prompt_workflow.manage',
  'ai_retrieval_policy.manage',
  'ai_tool_permission.manage',
  'ai_audit.read'
)
where r.role_code in ('ai_prompt_workflow_manager', 'ai_governance_lead')
on conflict do nothing;
