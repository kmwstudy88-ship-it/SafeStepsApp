alter table public.ai_model_providers
  add column if not exists legal_name text,
  add column if not exists trading_name text,
  add column if not exists headquarters_country_code text,
  add column if not exists contracting_entity_country_code text,
  add column if not exists privacy_policy_reference text,
  add column if not exists security_documentation_reference text,
  add column if not exists subprocessor_reference text,
  add column if not exists service_status_reference text,
  add column if not exists data_processing_agreement_reference text,
  add column if not exists security_review_status text not null default 'not_started',
  add column if not exists privacy_review_status text not null default 'not_started',
  add column if not exists procurement_status text not null default 'candidate',
  add column if not exists overall_provider_risk text not null default 'unassessed',
  add column if not exists approval_expires_at timestamptz,
  add column if not exists suspended_at timestamptz,
  add column if not exists suspension_reason text;

alter table public.ai_models
  add column if not exists model_type text,
  add column if not exists ownership_type text,
  add column if not exists hosting_type text,
  add column if not exists open_weights boolean not null default false,
  add column if not exists source_available boolean not null default false,
  add column if not exists intended_capabilities text[] not null default '{}'::text[],
  add column if not exists unsupported_capabilities text[] not null default '{}'::text[],
  add column if not exists base_risk_classification text,
  add column if not exists technical_owner_role text,
  add column if not exists governance_owner_role text,
  add column if not exists first_registered_at timestamptz not null default now(),
  add column if not exists retired_at timestamptz;

alter table public.ai_model_versions
  add column if not exists provider_model_identifier text,
  add column if not exists release_date date,
  add column if not exists knowledge_cutoff_date date,
  add column if not exists architecture_summary text,
  add column if not exists parameter_scale_reference text,
  add column if not exists maximum_output_tokens integer,
  add column if not exists supported_languages text[] not null default '{}'::text[],
  add column if not exists provider_model_card_reference text,
  add column if not exists documentation_confidence text not null default 'provider_asserted_only',
  add column if not exists version_change_type text not null default 'new_version',
  add column if not exists predecessor_version_id uuid references public.ai_model_versions(id) on delete set null,
  add column if not exists approval_expires_at timestamptz;

create table if not exists public.ai_provider_assessments (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.ai_model_providers(id) on delete cascade,
  assessment_version integer not null,
  assessment_type text not null check (assessment_type in ('provider_due_diligence', 'security', 'privacy', 'resilience', 'legal', 'child_data', 'procurement')),
  corporate_risk_rating text,
  security_risk_rating text,
  privacy_risk_rating text,
  resilience_risk_rating text,
  legal_risk_rating text,
  child_data_risk_rating text,
  input_retention_status text,
  output_retention_status text,
  provider_training_status text,
  human_access_status text,
  data_regions text[] not null default '{}'::text[],
  subprocessors_reviewed boolean not null default false,
  contract_controls jsonb not null default '{}'::jsonb,
  unresolved_risks jsonb not null default '[]'::jsonb,
  required_mitigations jsonb not null default '[]'::jsonb,
  overall_outcome text not null check (overall_outcome in ('approved', 'approved_with_restrictions', 'synthetic_data_only', 'non_sensitive_data_only', 'pilot_only', 'local_hosting_only', 'remediation_required', 'suspended', 'rejected', 'retired')),
  assessed_by uuid references auth.users(id) on delete set null,
  independently_reviewed_by uuid references auth.users(id) on delete set null,
  completed_at timestamptz,
  review_due_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider_id, assessment_version, assessment_type)
);

create table if not exists public.ai_provider_contract_controls (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.ai_model_providers(id) on delete cascade,
  control_code text not null,
  control_category text not null check (control_category in ('training_use', 'retention', 'region', 'encryption', 'subprocessor', 'incident_notice', 'model_change_notice', 'termination', 'deletion', 'audit', 'availability', 'legal_request', 'ip_output', 'safety_cooperation')),
  requirement_text text not null,
  required boolean not null default true,
  contract_clause_reference text,
  implementation_status text not null default 'unverified' check (implementation_status in ('unverified', 'verified', 'exception_approved', 'missing', 'not_applicable')),
  exception_reference uuid,
  evidence_reference text,
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider_id, control_code)
);

create table if not exists public.ai_model_cards (
  id uuid primary key default gen_random_uuid(),
  model_version_id uuid not null references public.ai_model_versions(id) on delete cascade,
  card_version integer not null,
  summary text not null,
  intended_uses jsonb not null default '[]'::jsonb,
  prohibited_uses jsonb not null default '[]'::jsonb,
  training_data_summary text,
  training_data_disclosure_level text not null default 'unavailable' check (training_data_disclosure_level in ('complete', 'substantial', 'partial', 'minimal', 'unavailable', 'confidential', 'independently_verified', 'provider_asserted_only')),
  evaluation_summary jsonb not null default '{}'::jsonb,
  subgroup_evaluation_summary jsonb not null default '{}'::jsonb,
  known_limitations jsonb not null default '[]'::jsonb,
  foreseeable_misuse jsonb not null default '[]'::jsonb,
  input_constraints jsonb not null default '{}'::jsonb,
  output_constraints jsonb not null default '{}'::jsonb,
  human_oversight_requirements jsonb not null default '{}'::jsonb,
  privacy_requirements jsonb not null default '{}'::jsonb,
  security_requirements jsonb not null default '{}'::jsonb,
  monitoring_requirements jsonb not null default '{}'::jsonb,
  retirement_conditions jsonb not null default '{}'::jsonb,
  prepared_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (model_version_id, card_version)
);

create table if not exists public.ai_model_capability_approvals (
  id uuid primary key default gen_random_uuid(),
  model_version_id uuid not null references public.ai_model_versions(id) on delete cascade,
  capability_code text not null,
  approved_use_case_ids uuid[] not null default '{}'::uuid[],
  approved_input_modalities text[] not null default '{}'::text[],
  approved_output_modalities text[] not null default '{}'::text[],
  approved_languages text[] not null default '{}'::text[],
  approved_user_types text[] not null default '{}'::text[],
  approved_data_classifications text[] not null default '{}'::text[],
  prohibited_data_classifications text[] not null default '{}'::text[],
  approved_populations text[] not null default '{}'::text[],
  processing_regions text[] not null default '{}'::text[],
  maximum_risk_tier text not null check (maximum_risk_tier in ('low', 'medium', 'high', 'critical')),
  human_review_required boolean not null default true,
  conditions jsonb not null default '[]'::jsonb,
  approval_decision_id uuid references public.ai_governance_decisions(id) on delete restrict,
  effective_from timestamptz not null default now(),
  expires_at timestamptz,
  status text not null default 'active' check (status in ('active', 'suspended', 'expired', 'retired')),
  created_at timestamptz not null default now(),
  unique (model_version_id, capability_code, effective_from)
);

create table if not exists public.ai_data_eligibility_rules (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  rule_code text not null,
  use_case_id uuid references public.ai_use_cases(id) on delete cascade,
  model_version_id uuid references public.ai_model_versions(id) on delete cascade,
  capability_code text,
  data_classification text not null,
  child_data_allowed boolean not null default false,
  court_data_allowed boolean not null default false,
  health_data_allowed boolean not null default false,
  biometric_data_allowed boolean not null default false,
  allowed_processing_regions text[] not null default '{}'::text[],
  consent_or_authority_required boolean not null default true,
  user_notice_required boolean not null default true,
  human_review_required boolean not null default true,
  status text not null default 'draft' check (status in ('draft', 'approved', 'suspended', 'retired')),
  created_at timestamptz not null default now(),
  unique (organisation_id, rule_code)
);

create table if not exists public.ai_model_change_events (
  id uuid primary key default gen_random_uuid(),
  model_version_id uuid not null references public.ai_model_versions(id) on delete cascade,
  change_category text not null check (change_category in ('documentation_only', 'non_material_infrastructure', 'minor_model_revision', 'safety_filter_change', 'context_window_change', 'output_format_change', 'latency_capacity_change', 'training_data_refresh', 'fine_tuning_change', 'architecture_change', 'major_replacement', 'unknown_provider_change')),
  change_summary text not null,
  material_change boolean not null default true,
  assessment_required boolean not null default true,
  restricted_until_assessed boolean not null default true,
  detected_at timestamptz not null default now(),
  assessed_by uuid references auth.users(id) on delete set null,
  assessed_at timestamptz
);

create index if not exists idx_ai_provider_assessments_provider on public.ai_provider_assessments(provider_id, review_due_at);
create index if not exists idx_ai_provider_contract_controls_provider on public.ai_provider_contract_controls(provider_id, implementation_status);
create index if not exists idx_ai_model_cards_version on public.ai_model_cards(model_version_id, card_version);
create index if not exists idx_ai_model_capability_approvals_version on public.ai_model_capability_approvals(model_version_id, status);
create index if not exists idx_ai_data_eligibility_rules_model_use on public.ai_data_eligibility_rules(model_version_id, use_case_id, status);
create index if not exists idx_ai_model_change_events_version on public.ai_model_change_events(model_version_id, detected_at desc);

alter table public.ai_provider_assessments enable row level security;
alter table public.ai_provider_contract_controls enable row level security;
alter table public.ai_model_cards enable row level security;
alter table public.ai_model_capability_approvals enable row level security;
alter table public.ai_data_eligibility_rules enable row level security;
alter table public.ai_model_change_events enable row level security;

create policy "AI provider assessments managed through provider"
  on public.ai_provider_assessments for all to authenticated
  using (exists (select 1 from public.ai_model_providers p where p.id = provider_id and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), p.organisation_id)))
  with check (exists (select 1 from public.ai_model_providers p where p.id = provider_id and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), p.organisation_id)));

create policy "AI provider contract controls managed through provider"
  on public.ai_provider_contract_controls for all to authenticated
  using (exists (select 1 from public.ai_model_providers p where p.id = provider_id and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), p.organisation_id)))
  with check (exists (select 1 from public.ai_model_providers p where p.id = provider_id and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), p.organisation_id)));

create policy "AI model cards managed through version"
  on public.ai_model_cards for all to authenticated
  using (exists (select 1 from public.ai_model_versions v join public.ai_models m on m.id = v.model_id where v.id = model_version_id and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), m.organisation_id)))
  with check (exists (select 1 from public.ai_model_versions v join public.ai_models m on m.id = v.model_id where v.id = model_version_id and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), m.organisation_id)));

create policy "AI model capability approvals managed through version"
  on public.ai_model_capability_approvals for all to authenticated
  using (exists (select 1 from public.ai_model_versions v join public.ai_models m on m.id = v.model_id where v.id = model_version_id and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), m.organisation_id)))
  with check (exists (select 1 from public.ai_model_versions v join public.ai_models m on m.id = v.model_id where v.id = model_version_id and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), m.organisation_id)));

create policy "AI data eligibility rules managed by lifecycle admins"
  on public.ai_data_eligibility_rules for all to authenticated
  using (public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), organisation_id))
  with check (public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), organisation_id));

create policy "AI model change events managed through version"
  on public.ai_model_change_events for all to authenticated
  using (exists (select 1 from public.ai_model_versions v join public.ai_models m on m.id = v.model_id where v.id = model_version_id and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), m.organisation_id)))
  with check (exists (select 1 from public.ai_model_versions v join public.ai_models m on m.id = v.model_id where v.id = model_version_id and public.safesteps_can_manage_ai_model_lifecycle(auth.uid(), m.organisation_id)));

insert into public.security_permissions (permission_code, description, resource_type, action, risk_level)
values
  ('ai_provider_assessment.manage', 'Manage AI provider due diligence, privacy, security, resilience, legal, child-data, and procurement assessments.', 'organisation', 'manage_ai_provider_assessment', 'high_impact'),
  ('ai_model_card.approve', 'Approve SafeSteps model cards and model documentation confidence records.', 'organisation', 'approve_ai_model_card', 'high_impact'),
  ('ai_model_capability.approve', 'Approve capability-specific model use by use case, data classification, population, language, modality, and region.', 'organisation', 'approve_ai_model_capability', 'high_impact'),
  ('ai_data_eligibility.manage', 'Manage model data eligibility rules for use case, classification, child data, court data, region, notice, authority, and review requirements.', 'organisation', 'manage_ai_data_eligibility', 'high_impact')
on conflict (permission_code) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.security_roles r
join public.security_permissions p on p.permission_code in (
  'ai_provider_assessment.manage',
  'ai_model_card.approve',
  'ai_model_capability.approve',
  'ai_data_eligibility.manage'
)
where r.role_code in ('ai_model_lifecycle_manager', 'ai_governance_lead')
on conflict do nothing;

insert into public.ai_provider_contract_controls (
  provider_id,
  control_code,
  control_category,
  requirement_text,
  required
)
select p.id, control.control_code, control.control_category, control.requirement_text, true
from public.ai_model_providers p
cross join (
  values
    ('no_safesteps_data_training', 'training_use', 'Provider must not train, fine-tune, or improve models using SafeSteps data without explicit governance approval.'),
    ('defined_input_output_retention', 'retention', 'Provider must define input and output retention periods and support deletion.'),
    ('processing_region_controls', 'region', 'Provider must identify processing regions and support region restrictions where required.'),
    ('security_incident_notification', 'incident_notice', 'Provider must notify SafeSteps of security or safety incidents affecting model processing.'),
    ('model_change_notification', 'model_change_notice', 'Provider must notify SafeSteps of material model, safety-filter, context-window, or output-format changes.'),
    ('deletion_certification', 'deletion', 'Provider must provide deletion or termination assistance evidence where required.'),
    ('law_enforcement_request_handling', 'legal_request', 'Provider must define government, court, or law-enforcement request handling.')
) as control(control_code, control_category, requirement_text)
where p.provider_code in ('human_only', 'local_rules_engine')
on conflict (provider_id, control_code) do nothing;
