-- SafeSteps identity, tenant security, and report explanation foundation.
-- This migration extends existing SafeSteps case/report work without replacing
-- the earlier parent, child, evidence, and court-report snapshot tables.

create extension if not exists pgcrypto;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  preferred_name text,
  user_type text not null,
  status text not null default 'active',
  preferred_language text,
  timezone text not null default 'Australia/Brisbane',
  accessibility_preferences jsonb not null default '{}'::jsonb,
  last_active_at timestamptz,
  deactivated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_profiles_type_valid check (
    user_type in (
      'parent','carer','child','young_person','worker','reviewer',
      'supervisor','administrator','court_user','external_professional',
      'support_person','service_account'
    )
  ),
  constraint user_profiles_status_valid check (
    status in ('pending','active','suspended','deactivated','locked','deceased')
  )
);

create table if not exists public.organisations (
  id uuid primary key default gen_random_uuid(),
  organisation_code text not null unique,
  name text not null,
  organisation_type text not null,
  status text not null default 'active',
  parent_organisation_id uuid references public.organisations(id) on delete restrict,
  jurisdiction_code text,
  timezone text not null default 'Australia/Brisbane',
  data_region text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organisations_type_valid check (
    organisation_type in (
      'safesteps','child_protection','family_support','community_service',
      'health_service','legal_service','court','school','research','other'
    )
  ),
  constraint organisations_status_valid check (
    status in ('pending','active','suspended','closed','archived')
  )
);

create table if not exists public.organisation_memberships (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  membership_type text not null,
  status text not null default 'invited',
  employee_reference text,
  external_identity_reference text,
  starts_at timestamptz,
  ends_at timestamptz,
  invited_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint organisation_memberships_unique unique (organisation_id, user_id),
  constraint organisation_memberships_status_valid check (
    status in ('invited','pending_verification','active','suspended','ended','revoked')
  )
);

create table if not exists public.security_roles (
  id uuid primary key default gen_random_uuid(),
  role_code text not null unique,
  name text not null,
  description text,
  role_scope text not null,
  system_role boolean not null default false,
  high_privilege boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint security_roles_scope_valid check (
    role_scope in ('global','organisation','case','family','resource','workflow')
  )
);

create table if not exists public.security_permissions (
  id uuid primary key default gen_random_uuid(),
  permission_code text not null unique,
  description text not null,
  resource_type text not null,
  action text not null,
  risk_level text not null default 'standard',
  created_at timestamptz not null default now(),
  constraint security_permissions_risk_valid check (
    risk_level in ('low','standard','sensitive','high_impact','system_only')
  )
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.security_roles(id) on delete cascade,
  permission_id uuid not null references public.security_permissions(id) on delete cascade,
  conditions jsonb not null default '{}'::jsonb,
  primary key (role_id, permission_id)
);

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete restrict,
  family_reference text not null unique,
  display_name text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  closed_at timestamptz,
  constraint families_status_valid check (
    status in ('intake','active','review','closed','archived')
  )
);

alter table public.families
  add column if not exists organisation_id uuid references public.organisations(id) on delete restrict,
  add column if not exists family_reference text,
  add column if not exists display_name text,
  add column if not exists status text not null default 'active',
  add column if not exists closed_at timestamptz;

update public.families
set family_reference = coalesce(family_reference, 'LEGACY-FAMILY-' || id::text),
    display_name = coalesce(display_name, name)
where family_reference is null
   or display_name is null;

create unique index if not exists families_family_reference_unique
  on public.families(family_reference)
  where family_reference is not null;

alter table public.cases
  add column if not exists organisation_id uuid references public.organisations(id) on delete restrict,
  add column if not exists family_id uuid references public.families(id) on delete restrict,
  add column if not exists case_reference text,
  add column if not exists case_type text,
  add column if not exists opened_at timestamptz not null default now(),
  add column if not exists closed_at timestamptz,
  add column if not exists current_stage text,
  add column if not exists primary_worker_id uuid references auth.users(id) on delete set null,
  add column if not exists record_version integer not null default 1;

create unique index if not exists cases_case_reference_unique
  on public.cases(case_reference)
  where case_reference is not null;

create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  child_profile_id uuid references public.child_profiles(id) on delete set null,
  relationship_type text not null,
  relationship_description text,
  parental_responsibility_status text,
  lives_in_household boolean,
  contact_status text,
  effective_from date,
  effective_to date,
  created_at timestamptz not null default now()
);

alter table public.family_members
  add column if not exists child_profile_id uuid references public.child_profiles(id) on delete set null,
  add column if not exists relationship_type text,
  add column if not exists relationship_description text,
  add column if not exists parental_responsibility_status text,
  add column if not exists lives_in_household boolean,
  add column if not exists contact_status text,
  add column if not exists effective_from date,
  add column if not exists effective_to date;

create table if not exists public.case_participants (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  child_profile_id uuid references public.child_profiles(id) on delete cascade,
  participant_type text not null,
  relationship_to_case text,
  status text not null default 'active',
  visibility_level text not null default 'standard',
  allowed_actions text[] not null default '{}',
  denied_actions text[] not null default '{}',
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  added_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint case_participants_identity_present check (
    user_id is not null or child_profile_id is not null
  )
);

create index if not exists idx_organisation_memberships_user_org
  on public.organisation_memberships(user_id, organisation_id);
create index if not exists idx_case_participants_user_case
  on public.case_participants(user_id, case_id);

create table if not exists public.user_role_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.security_roles(id) on delete restrict,
  organisation_id uuid references public.organisations(id) on delete cascade,
  case_id uuid references public.cases(id) on delete cascade,
  family_id uuid references public.families(id) on delete cascade,
  resource_type text,
  resource_id uuid,
  status text not null default 'active',
  starts_at timestamptz,
  ends_at timestamptz,
  assigned_by uuid references auth.users(id) on delete set null,
  reason text,
  created_at timestamptz not null default now(),
  constraint user_role_assignments_scope_present check (
    organisation_id is not null
    or case_id is not null
    or family_id is not null
    or resource_id is not null
  )
);

create table if not exists public.child_private_records (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid not null references public.child_profiles(id) on delete cascade,
  case_id uuid references public.cases(id) on delete restrict,
  record_type text not null,
  title text,
  content jsonb not null,
  visibility_mode text not null default 'child_only',
  safety_sensitive boolean not null default false,
  legal_restriction boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint child_private_records_visibility check (
    visibility_mode in (
      'child_only','selected_people','assigned_worker','parent_shared',
      'professional_team','court_authorised','restricted'
    )
  )
);

create table if not exists public.child_record_shares (
  id uuid primary key default gen_random_uuid(),
  child_private_record_id uuid not null references public.child_private_records(id) on delete cascade,
  shared_with_user_id uuid references auth.users(id) on delete cascade,
  shared_with_role text,
  permission_level text not null default 'read',
  shared_by uuid references auth.users(id) on delete set null,
  share_reason text,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null
);

create table if not exists public.delegated_authorities (
  id uuid primary key default gen_random_uuid(),
  grantor_user_id uuid not null references auth.users(id) on delete cascade,
  delegate_user_id uuid not null references auth.users(id) on delete cascade,
  organisation_id uuid references public.organisations(id) on delete restrict,
  case_id uuid references public.cases(id) on delete cascade,
  authority_type text not null,
  allowed_actions text[] not null default '{}',
  denied_actions text[] not null default '{}',
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  status text not null default 'active',
  granted_reason text,
  revoked_reason text,
  created_at timestamptz not null default now(),
  constraint delegated_authorities_not_self check (grantor_user_id <> delegate_user_id)
);

create table if not exists public.temporary_access_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  case_id uuid references public.cases(id) on delete cascade,
  resource_type text,
  resource_id uuid,
  permission_codes text[] not null,
  reason text not null,
  starts_at timestamptz not null,
  expires_at timestamptz not null,
  approved_by uuid not null references auth.users(id) on delete restrict,
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint temporary_access_grants_dates check (expires_at > starts_at)
);

create table if not exists public.emergency_access_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  organisation_id uuid not null references public.organisations(id) on delete restrict,
  case_id uuid references public.cases(id) on delete restrict,
  resource_type text,
  resource_id uuid,
  reason_code text not null,
  detailed_reason text not null,
  access_scope text[] not null,
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  supervisor_notified_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  review_outcome text,
  reviewed_at timestamptz,
  constraint emergency_access_duration check (expires_at <= started_at + interval '4 hours')
);

create table if not exists public.permission_decision_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  organisation_id uuid,
  case_id uuid,
  permission_code text not null,
  resource_type text not null,
  resource_id uuid,
  decision text not null,
  reason_codes text[] not null default '{}',
  policy_version text not null,
  request_id uuid,
  correlation_id uuid,
  evaluated_at timestamptz not null default now(),
  constraint permission_decision_valid check (
    decision in ('allow','deny','allow_with_restrictions')
  )
);

create or replace function public.safesteps_is_active_member(
  target_user_id uuid,
  target_organisation_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organisation_memberships om
    where om.user_id = target_user_id
      and om.organisation_id = target_organisation_id
      and om.status = 'active'
      and (om.starts_at is null or om.starts_at <= now())
      and (om.ends_at is null or om.ends_at > now())
  );
$$;

create or replace function public.has_case_permission(
  p_user_id uuid,
  p_case_id uuid,
  p_permission_code text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.case_participants cp
    join public.cases c on c.id = cp.case_id
    join public.user_role_assignments ura
      on ura.user_id = cp.user_id
     and (
       ura.case_id = cp.case_id
       or ura.organisation_id = c.organisation_id
     )
    join public.role_permissions rp on rp.role_id = ura.role_id
    join public.security_permissions p on p.id = rp.permission_id
    where cp.case_id = p_case_id
      and cp.user_id = p_user_id
      and cp.status = 'active'
      and ura.status = 'active'
      and p.permission_code = p_permission_code
      and (cp.effective_to is null or cp.effective_to > now())
      and (ura.starts_at is null or ura.starts_at <= now())
      and (ura.ends_at is null or ura.ends_at > now())
      and (
        c.organisation_id is null
        or public.safesteps_is_active_member(p_user_id, c.organisation_id)
      )
  )
  or exists (
    select 1
    from public.temporary_access_grants tag
    where tag.user_id = p_user_id
      and tag.case_id = p_case_id
      and p_permission_code = any(tag.permission_codes)
      and tag.revoked_at is null
      and tag.starts_at <= now()
      and tag.expires_at > now()
  );
$$;

create or replace function public.has_resource_permission(
  p_user_id uuid,
  p_resource_type text,
  p_resource_id uuid,
  p_permission_code text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_role_assignments ura
    join public.role_permissions rp on rp.role_id = ura.role_id
    join public.security_permissions p on p.id = rp.permission_id
    where ura.user_id = p_user_id
      and ura.resource_type = p_resource_type
      and ura.resource_id = p_resource_id
      and ura.status = 'active'
      and p.permission_code = p_permission_code
      and (ura.starts_at is null or ura.starts_at <= now())
      and (ura.ends_at is null or ura.ends_at > now())
  );
$$;

revoke all on function public.safesteps_is_active_member(uuid, uuid) from public;
revoke all on function public.has_case_permission(uuid, uuid, text) from public;
revoke all on function public.has_resource_permission(uuid, text, uuid, text) from public;
grant execute on function public.safesteps_is_active_member(uuid, uuid) to authenticated;
grant execute on function public.has_case_permission(uuid, uuid, text) to authenticated;
grant execute on function public.has_resource_permission(uuid, text, uuid, text) to authenticated;

create table if not exists public.report_templates (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  template_code text not null,
  template_name text not null,
  report_type text not null,
  audience_type text not null,
  jurisdiction_code text,
  language_code text not null default 'en-AU',
  version integer not null,
  status text not null default 'draft',
  template_schema jsonb not null,
  rendering_config jsonb not null default '{}'::jsonb,
  requires_human_review boolean not null default true,
  requires_independent_approval boolean not null default false,
  effective_from timestamptz,
  retired_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint report_templates_unique_version unique (organisation_id, template_code, version)
);

create table if not exists public.report_template_sections (
  id uuid primary key default gen_random_uuid(),
  report_template_id uuid not null references public.report_templates(id) on delete cascade,
  section_code text not null,
  title text not null,
  section_type text not null,
  display_order integer not null,
  required boolean not null default false,
  repeatable boolean not null default false,
  visibility_rules jsonb not null default '{}'::jsonb,
  content_rules jsonb not null default '{}'::jsonb,
  constraint report_template_sections_unique unique (report_template_id, section_code)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  report_reference text not null unique,
  organisation_id uuid not null references public.organisations(id) on delete restrict,
  case_id uuid references public.cases(id) on delete restrict,
  person_id uuid references auth.users(id) on delete restrict,
  report_template_id uuid not null references public.report_templates(id) on delete restrict,
  report_type text not null,
  audience_type text not null,
  purpose text not null,
  status text not null default 'requested',
  current_version integer not null default 1,
  requested_by uuid references auth.users(id) on delete set null,
  primary_author_id uuid references auth.users(id) on delete set null,
  current_reviewer_id uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  requested_at timestamptz not null default now(),
  draft_created_at timestamptz,
  approved_at timestamptz,
  released_at timestamptz,
  withdrawn_at timestamptz,
  record_version integer not null default 1,
  constraint reports_status_valid check (
    status in (
      'requested','authorisation_review','snapshotting','drafting','draft',
      'quality_review','information_requested','approval_pending','approved',
      'rendering','ready','released','withdrawn','superseded','failed'
    )
  )
);

create table if not exists public.report_snapshots (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  snapshot_version integer not null,
  snapshot_cutoff_at timestamptz not null,
  evidence_item_versions jsonb not null default '[]'::jsonb,
  assessment_versions jsonb not null default '[]'::jsonb,
  competency_versions jsonb not null default '[]'::jsonb,
  review_versions jsonb not null default '[]'::jsonb,
  appeal_versions jsonb not null default '[]'::jsonb,
  context_versions jsonb not null default '[]'::jsonb,
  consent_versions jsonb not null default '[]'::jsonb,
  snapshot_payload jsonb not null,
  snapshot_hash text not null,
  created_by_service text not null,
  created_at timestamptz not null default now(),
  constraint report_snapshots_unique_version unique (report_id, snapshot_version)
);

create table if not exists public.report_claims (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  report_version integer not null,
  claim_code text,
  claim_category text not null,
  claim_text text not null,
  claim_type text not null,
  impact_level text not null default 'standard',
  confidence_level text,
  evidence_sufficiency text,
  status text not null default 'draft',
  authored_by_type text not null,
  authored_by_user_id uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  constraint report_claims_type_valid check (
    claim_type in (
      'documented_fact','direct_observation','reported_information',
      'professional_interpretation','assessment_finding','competency_finding',
      'risk_finding','strength_finding','limitation','recommendation',
      'legal_or_policy_requirement'
    )
  )
);

create table if not exists public.report_claim_evidence_links (
  id uuid primary key default gen_random_uuid(),
  report_claim_id uuid not null references public.report_claims(id) on delete cascade,
  evidence_item_id uuid not null references public.evidence_items(id) on delete restrict,
  evidence_version integer,
  relationship_type text not null,
  relevance_strength numeric(5,2),
  evidentiary_weight numeric(8,4),
  excerpt_reference text,
  page_or_timestamp_reference text,
  explanation text,
  included_in_final boolean not null default true,
  created_at timestamptz not null default now(),
  constraint report_claim_evidence_relationship check (
    relationship_type in (
      'supports','partially_supports','neutral','challenges','contradicts',
      'contextualises','limits','source_of_claim'
    )
  )
);

create table if not exists public.report_claim_quality_checks (
  id uuid primary key default gen_random_uuid(),
  report_claim_id uuid not null references public.report_claims(id) on delete cascade,
  supporting_evidence_present boolean,
  challenging_evidence_reviewed boolean,
  contradiction_check_completed boolean,
  alternative_explanations_completed boolean,
  context_review_completed boolean,
  source_dependency_checked boolean,
  procedural_fairness_completed boolean,
  language_proportionate boolean,
  confidence_supported boolean,
  reviewer_qualified boolean,
  exceptions jsonb not null default '[]'::jsonb,
  completed_by uuid references auth.users(id) on delete set null,
  completed_at timestamptz
);

create table if not exists public.report_observation_blocks (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  report_version integer not null,
  occurred_at timestamptz,
  context text,
  observation_text text not null,
  interpretation_text text,
  conclusion_text text,
  observer_user_id uuid references auth.users(id) on delete set null,
  interpretation_author_id uuid references auth.users(id) on delete set null,
  evidence_item_id uuid references public.evidence_items(id) on delete restrict,
  limitations text,
  created_at timestamptz not null default now()
);

create table if not exists public.report_findings (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  report_version integer not null,
  finding_code text,
  finding_domain text not null,
  finding_text text not null,
  finding_status text not null,
  impact_level text not null,
  confidence_level text,
  evidence_sufficiency text,
  effective_period_start date,
  effective_period_end date,
  limitations text,
  unresolved_questions text,
  requires_human_confirmation boolean not null default false,
  confirmed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.report_recommendations (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  report_version integer not null,
  recommendation_code text,
  recommendation_text text not null,
  recommendation_type text not null,
  priority text not null default 'normal',
  rationale text not null,
  linked_finding_ids uuid[] not null default '{}',
  linked_competency_ids uuid[] not null default '{}',
  responsible_party_type text,
  responsible_user_id uuid references auth.users(id) on delete set null,
  support_required text,
  expected_evidence text,
  due_at timestamptz,
  review_at timestamptz,
  mandatory_status text not null default 'recommended',
  created_at timestamptz not null default now()
);

create table if not exists public.report_subject_responses (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  report_version integer not null,
  responding_user_id uuid references auth.users(id) on delete set null,
  response_type text not null,
  response_text text not null,
  related_claim_ids uuid[] not null default '{}',
  related_finding_ids uuid[] not null default '{}',
  evidence_ids uuid[] not null default '{}',
  submitted_at timestamptz not null default now(),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewer_response text,
  incorporated_into_report boolean
);

create table if not exists public.report_approvals (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  report_version integer not null,
  approval_stage text not null,
  required_role text,
  required_credential text,
  approver_user_id uuid references auth.users(id) on delete set null,
  decision text not null,
  decision_reason text,
  conflict_confirmed_clear boolean,
  independence_confirmed boolean,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  constraint report_approvals_decision_valid check (
    decision in ('approved','rejected','changes_requested','abstained')
  )
);

create table if not exists public.report_versions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  version_number integer not null,
  version_status text not null default 'draft',
  content jsonb not null,
  content_hash text not null,
  change_type text not null,
  change_summary text,
  based_on_version integer,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  released_at timestamptz,
  constraint report_versions_unique unique (report_id, version_number),
  constraint report_versions_status_valid check (
    version_status in ('draft','review','approved','released','withdrawn','superseded')
  )
);

create table if not exists public.report_corrections (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  affected_version integer not null,
  correction_type text not null,
  correction_description text not null,
  requested_by uuid references auth.users(id) on delete set null,
  status text not null default 'submitted',
  material_change boolean not null default false,
  reviewed_by uuid references auth.users(id) on delete set null,
  review_outcome text,
  replacement_version integer,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.report_withdrawals (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete restrict,
  report_version integer not null,
  withdrawal_reason text not null,
  withdrawal_category text not null,
  initiated_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  replacement_report_id uuid references public.reports(id) on delete set null,
  recipient_notification_required boolean not null default true,
  notification_completed_at timestamptz,
  withdrawn_at timestamptz not null default now()
);

create table if not exists public.report_evidence_manifest_items (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  report_version integer not null,
  manifest_reference text not null,
  evidence_item_id uuid not null references public.evidence_items(id) on delete restrict,
  evidence_version integer,
  source_summary text,
  occurred_at timestamptz,
  integrity_status text,
  authenticity_status text,
  review_status text,
  limitations text,
  display_order integer not null,
  constraint report_manifest_reference_unique unique (
    report_id,
    report_version,
    manifest_reference
  )
);

create table if not exists public.report_rendered_files (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  report_version integer not null,
  file_format text not null,
  language_code text not null,
  storage_bucket text not null,
  storage_path text not null,
  file_hash_sha256 text not null,
  size_bytes bigint not null,
  template_version integer not null,
  renderer_version text not null,
  digitally_signed boolean not null default false,
  signature_reference text,
  generated_at timestamptz not null default now(),
  constraint report_rendered_files_unique unique (
    report_id,
    report_version,
    file_format,
    language_code
  )
);

create table if not exists public.report_recipients (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  report_version integer not null,
  recipient_type text not null,
  recipient_user_id uuid references auth.users(id) on delete set null,
  recipient_organisation_id uuid references public.organisations(id) on delete set null,
  external_recipient_reference text,
  release_purpose text not null,
  access_scope text not null,
  approved_by uuid references auth.users(id) on delete set null,
  released_at timestamptz,
  access_expires_at timestamptz,
  revoked_at timestamptz,
  revocation_reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.report_access_events (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete restrict,
  report_version integer not null,
  user_id uuid references auth.users(id) on delete set null,
  recipient_id uuid references public.report_recipients(id) on delete set null,
  action text not null,
  purpose text,
  access_granted boolean not null,
  denial_reason text,
  session_reference text,
  ip_hash text,
  occurred_at timestamptz not null default now()
);

create table if not exists public.report_jurisdiction_rules (
  id uuid primary key default gen_random_uuid(),
  jurisdiction_code text not null,
  report_type text not null,
  rule_version integer not null,
  required_sections text[] not null default '{}',
  prohibited_content_rules jsonb not null default '{}'::jsonb,
  required_declarations jsonb not null default '{}'::jsonb,
  approval_requirements jsonb not null default '{}'::jsonb,
  release_requirements jsonb not null default '{}'::jsonb,
  effective_from date not null,
  effective_to date,
  status text not null default 'active',
  constraint report_jurisdiction_rules_unique unique (
    jurisdiction_code,
    report_type,
    rule_version
  )
);

create table if not exists public.report_language_flags (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  report_version integer not null,
  flag_code text not null,
  severity text not null,
  status text not null default 'open',
  explanation text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint report_language_flags_severity_valid check (
    severity in ('low','medium','high','critical')
  )
);

create or replace function public.prevent_released_report_mutation()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if old.version_status = 'released' then
    raise exception 'Released report versions are immutable';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_released_report_mutation_trigger on public.report_versions;
create trigger prevent_released_report_mutation_trigger
before update or delete on public.report_versions
for each row execute function public.prevent_released_report_mutation();

create or replace function public.can_release_report(
  p_report_id uuid,
  p_report_version integer
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    exists (
      select 1
      from public.report_versions rv
      where rv.report_id = p_report_id
        and rv.version_number = p_report_version
        and rv.version_status = 'approved'
    )
    and exists (
      select 1
      from public.report_approvals ra
      where ra.report_id = p_report_id
        and ra.report_version = p_report_version
        and ra.decision = 'approved'
        and ra.approved_at is not null
    )
    and not exists (
      select 1
      from public.report_language_flags rlf
      where rlf.report_id = p_report_id
        and rlf.report_version = p_report_version
        and rlf.severity = 'critical'
        and rlf.status = 'open'
    )
    and not exists (
      select 1
      from public.report_corrections rc
      where rc.report_id = p_report_id
        and rc.affected_version = p_report_version
        and rc.material_change = true
        and rc.status in ('submitted','reviewing','accepted')
    )
    and not exists (
      select 1
      from public.report_withdrawals rw
      where rw.report_id = p_report_id
        and rw.report_version = p_report_version
    );
$$;

revoke all on function public.can_release_report(uuid, integer) from public;
grant execute on function public.can_release_report(uuid, integer) to authenticated;

create or replace function public.can_read_report(p_report_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.reports r
    where r.id = p_report_id
      and (
        r.requested_by = p_user_id
        or r.primary_author_id = p_user_id
        or r.current_reviewer_id = p_user_id
        or r.approved_by = p_user_id
        or (
          r.case_id is not null
          and public.has_case_permission(p_user_id, r.case_id, 'report.read')
        )
        or exists (
          select 1
          from public.report_recipients rr
          where rr.report_id = r.id
            and rr.recipient_user_id = p_user_id
            and rr.released_at is not null
            and rr.revoked_at is null
            and (rr.access_expires_at is null or rr.access_expires_at > now())
        )
      )
  );
$$;

create or replace function public.can_write_report(p_report_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.reports r
    where r.id = p_report_id
      and (
        r.primary_author_id = p_user_id
        or r.current_reviewer_id = p_user_id
        or (
          r.case_id is not null
          and public.has_case_permission(p_user_id, r.case_id, 'report.generate')
        )
      )
      and r.status not in ('released','withdrawn','superseded')
  );
$$;

revoke all on function public.can_read_report(uuid, uuid) from public;
revoke all on function public.can_write_report(uuid, uuid) from public;
grant execute on function public.can_read_report(uuid, uuid) to authenticated;
grant execute on function public.can_write_report(uuid, uuid) to authenticated;

alter table public.user_profiles enable row level security;
alter table public.organisations enable row level security;
alter table public.organisation_memberships enable row level security;
alter table public.security_roles enable row level security;
alter table public.security_permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.case_participants enable row level security;
alter table public.user_role_assignments enable row level security;
alter table public.child_private_records enable row level security;
alter table public.child_record_shares enable row level security;
alter table public.delegated_authorities enable row level security;
alter table public.temporary_access_grants enable row level security;
alter table public.emergency_access_events enable row level security;
alter table public.permission_decision_logs enable row level security;
alter table public.report_templates enable row level security;
alter table public.report_template_sections enable row level security;
alter table public.reports enable row level security;
alter table public.report_snapshots enable row level security;
alter table public.report_claims enable row level security;
alter table public.report_claim_evidence_links enable row level security;
alter table public.report_claim_quality_checks enable row level security;
alter table public.report_observation_blocks enable row level security;
alter table public.report_findings enable row level security;
alter table public.report_recommendations enable row level security;
alter table public.report_subject_responses enable row level security;
alter table public.report_approvals enable row level security;
alter table public.report_versions enable row level security;
alter table public.report_corrections enable row level security;
alter table public.report_withdrawals enable row level security;
alter table public.report_evidence_manifest_items enable row level security;
alter table public.report_rendered_files enable row level security;
alter table public.report_recipients enable row level security;
alter table public.report_access_events enable row level security;
alter table public.report_jurisdiction_rules enable row level security;
alter table public.report_language_flags enable row level security;

drop policy if exists user_profiles_self_read on public.user_profiles;
create policy user_profiles_self_read on public.user_profiles
for select to authenticated
using (id = (select auth.uid()));

drop policy if exists organisations_members_read on public.organisations;
create policy organisations_members_read on public.organisations
for select to authenticated
using (public.safesteps_is_active_member((select auth.uid()), id));

drop policy if exists organisation_memberships_self_read on public.organisation_memberships;
create policy organisation_memberships_self_read on public.organisation_memberships
for select to authenticated
using (
  user_id = (select auth.uid())
  or public.has_resource_permission((select auth.uid()), 'organisation', organisation_id, 'membership.read')
);

drop policy if exists families_member_read on public.families;
create policy families_member_read on public.families
for select to authenticated
using (public.safesteps_is_active_member((select auth.uid()), organisation_id));

drop policy if exists case_participants_case_read on public.case_participants;
create policy case_participants_case_read on public.case_participants
for select to authenticated
using (
  user_id = (select auth.uid())
  or public.has_case_permission((select auth.uid()), case_id, 'case.read')
);

drop policy if exists child_private_record_child_read on public.child_private_records;
create policy child_private_record_child_read on public.child_private_records
for select to authenticated
using (
  exists (
    select 1
    from public.child_profiles cp
    where cp.id = child_private_records.child_profile_id
      and cp.child_user_id = (select auth.uid())
  )
);

drop policy if exists child_private_record_shared_read on public.child_private_records;
create policy child_private_record_shared_read on public.child_private_records
for select to authenticated
using (
  exists (
    select 1
    from public.child_record_shares crs
    where crs.child_private_record_id = child_private_records.id
      and crs.shared_with_user_id = (select auth.uid())
      and crs.revoked_at is null
      and (crs.ends_at is null or crs.ends_at > now())
  )
);

drop policy if exists report_case_authorised_read on public.reports;
create policy report_case_authorised_read on public.reports
for select to authenticated
using (
  requested_by = (select auth.uid())
  or primary_author_id = (select auth.uid())
  or current_reviewer_id = (select auth.uid())
  or approved_by = (select auth.uid())
  or (
    case_id is not null
    and public.has_case_permission((select auth.uid()), case_id, 'report.read')
  )
);

drop policy if exists report_recipient_read on public.reports;
create policy report_recipient_read on public.reports
for select to authenticated
using (
  exists (
    select 1
    from public.report_recipients rr
    where rr.report_id = reports.id
      and rr.recipient_user_id = (select auth.uid())
      and rr.released_at is not null
      and rr.revoked_at is null
      and (rr.access_expires_at is null or rr.access_expires_at > now())
  )
);

drop policy if exists report_case_authorised_insert on public.reports;
create policy report_case_authorised_insert on public.reports
for insert to authenticated
with check (
  requested_by = (select auth.uid())
  and (
    case_id is null
    or public.has_case_permission((select auth.uid()), case_id, 'report.generate')
  )
);

drop policy if exists report_versions_read on public.report_versions;
create policy report_versions_read on public.report_versions
for select to authenticated
using (public.can_read_report(report_id, (select auth.uid())));

drop policy if exists report_versions_author_insert on public.report_versions;
create policy report_versions_author_insert on public.report_versions
for insert to authenticated
with check (public.can_write_report(report_id, (select auth.uid())));

drop policy if exists report_recipients_user_read on public.report_recipients;
create policy report_recipients_user_read on public.report_recipients
for select to authenticated
using (
  recipient_user_id = (select auth.uid())
  or public.has_case_permission(
    (select auth.uid()),
    (select r.case_id from public.reports r where r.id = report_recipients.report_id),
    'report.release'
  )
);

drop policy if exists report_access_events_insert_own on public.report_access_events;
create policy report_access_events_insert_own on public.report_access_events
for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists report_child_tables_read on public.report_snapshots;
create policy report_child_tables_read on public.report_snapshots
for select to authenticated
using (public.can_read_report(report_id, (select auth.uid())));

drop policy if exists report_claims_read on public.report_claims;
create policy report_claims_read on public.report_claims
for select to authenticated
using (public.can_read_report(report_id, (select auth.uid())));

drop policy if exists report_claims_write on public.report_claims;
create policy report_claims_write on public.report_claims
for insert to authenticated
with check (public.can_write_report(report_id, (select auth.uid())));

drop policy if exists report_claim_evidence_links_read on public.report_claim_evidence_links;
create policy report_claim_evidence_links_read on public.report_claim_evidence_links
for select to authenticated
using (
  exists (
    select 1
    from public.report_claims rc
    where rc.id = report_claim_evidence_links.report_claim_id
      and public.can_read_report(rc.report_id, (select auth.uid()))
  )
);

drop policy if exists report_claim_quality_checks_read on public.report_claim_quality_checks;
create policy report_claim_quality_checks_read on public.report_claim_quality_checks
for select to authenticated
using (
  exists (
    select 1
    from public.report_claims rc
    where rc.id = report_claim_quality_checks.report_claim_id
      and public.can_read_report(rc.report_id, (select auth.uid()))
  )
);

drop policy if exists report_observation_blocks_read on public.report_observation_blocks;
create policy report_observation_blocks_read on public.report_observation_blocks
for select to authenticated
using (public.can_read_report(report_id, (select auth.uid())));

drop policy if exists report_findings_read on public.report_findings;
create policy report_findings_read on public.report_findings
for select to authenticated
using (public.can_read_report(report_id, (select auth.uid())));

drop policy if exists report_recommendations_read on public.report_recommendations;
create policy report_recommendations_read on public.report_recommendations
for select to authenticated
using (public.can_read_report(report_id, (select auth.uid())));

drop policy if exists report_subject_responses_read on public.report_subject_responses;
create policy report_subject_responses_read on public.report_subject_responses
for select to authenticated
using (
  responding_user_id = (select auth.uid())
  or public.can_read_report(report_id, (select auth.uid()))
);

drop policy if exists report_subject_responses_insert_own on public.report_subject_responses;
create policy report_subject_responses_insert_own on public.report_subject_responses
for insert to authenticated
with check (responding_user_id = (select auth.uid()));

drop policy if exists report_approvals_read on public.report_approvals;
create policy report_approvals_read on public.report_approvals
for select to authenticated
using (
  approver_user_id = (select auth.uid())
  or public.can_read_report(report_id, (select auth.uid()))
);

drop policy if exists report_corrections_read on public.report_corrections;
create policy report_corrections_read on public.report_corrections
for select to authenticated
using (
  requested_by = (select auth.uid())
  or public.can_read_report(report_id, (select auth.uid()))
);

drop policy if exists report_withdrawals_read on public.report_withdrawals;
create policy report_withdrawals_read on public.report_withdrawals
for select to authenticated
using (public.can_read_report(report_id, (select auth.uid())));

drop policy if exists report_manifest_items_read on public.report_evidence_manifest_items;
create policy report_manifest_items_read on public.report_evidence_manifest_items
for select to authenticated
using (public.can_read_report(report_id, (select auth.uid())));

drop policy if exists report_rendered_files_read on public.report_rendered_files;
create policy report_rendered_files_read on public.report_rendered_files
for select to authenticated
using (public.can_read_report(report_id, (select auth.uid())));

drop policy if exists report_language_flags_read on public.report_language_flags;
create policy report_language_flags_read on public.report_language_flags
for select to authenticated
using (public.can_read_report(report_id, (select auth.uid())));

insert into public.security_roles (role_code, name, description, role_scope, system_role, high_privilege)
values
  ('parent', 'Parent', 'Parent or carer participant with scoped access to their own case information.', 'case', true, false),
  ('case_worker', 'Case worker', 'Assigned worker with case-scoped operational access.', 'case', true, false),
  ('assessment_reviewer', 'Assessment reviewer', 'Reviewer role for assigned assessment and evidence review tasks.', 'workflow', true, true),
  ('report_approver', 'Report approver', 'Independent approver for high-impact reports and releases.', 'workflow', true, true),
  ('court_reader', 'Court reader', 'Purpose-bound recipient for released court material.', 'resource', true, true),
  ('organisation_admin', 'Organisation administrator', 'Organisation-scoped membership and case administration.', 'organisation', true, true),
  ('security_admin', 'Security administrator', 'Security review and access-review administration.', 'organisation', true, true),
  ('system_worker', 'System worker', 'Narrow service-worker role for background workflow tasks.', 'workflow', true, true)
on conflict (role_code) do nothing;

insert into public.security_permissions (permission_code, description, resource_type, action, risk_level)
values
  ('case.read', 'Read an explicitly assigned case.', 'case', 'read', 'standard'),
  ('case.update', 'Update non-protected fields on an explicitly assigned case.', 'case', 'update', 'sensitive'),
  ('case.assign_worker', 'Assign or change workers for a case.', 'case', 'assign_worker', 'high_impact'),
  ('membership.read', 'Read organisation membership records within authorised scope.', 'membership', 'read', 'sensitive'),
  ('evidence.read', 'Read evidence permitted by case and resource controls.', 'evidence', 'read', 'sensitive'),
  ('evidence.export', 'Export evidence with purpose-specific audit.', 'evidence', 'export', 'high_impact'),
  ('child_record.read_shared', 'Read child-private records expressly shared with the user.', 'child_record', 'read_shared', 'sensitive'),
  ('child_record.read_private', 'Read child-private records under child, court, or safety authority.', 'child_record', 'read_private', 'high_impact'),
  ('report.read', 'Read report drafts or released reports in authorised scope.', 'report', 'read', 'sensitive'),
  ('report.generate', 'Request or generate a report draft.', 'report', 'generate', 'sensitive'),
  ('report.approve', 'Approve a reviewed report version.', 'report', 'approve', 'high_impact'),
  ('report.release', 'Release an approved report to recipients.', 'report', 'release', 'high_impact'),
  ('audit.read', 'Read sensitive audit and access decision logs.', 'audit', 'read', 'high_impact')
on conflict (permission_code) do nothing;
