create extension if not exists pgcrypto;

alter table public.organisations
  add column if not exists tenant_id uuid,
  add column if not exists tenant_region_code text,
  add column if not exists tenant_business_unit_code text;

alter table public.cases
  add column if not exists tenant_id uuid;

alter table public.families
  add column if not exists tenant_id uuid;

alter table public.community_service_providers
  add column if not exists tenant_id uuid;

alter table public.community_services
  add column if not exists tenant_id uuid;

create table if not exists public.platform_tenants (
  id uuid primary key default gen_random_uuid(),
  tenant_reference text not null unique,
  tenant_slug text not null unique,
  tenant_name text not null,
  legal_entity_name text,
  tenant_type text not null,
  primary_jurisdiction_code text,
  supported_jurisdiction_codes text[] not null default '{}',
  data_residency_region text not null,
  primary_timezone text not null default 'Australia/Brisbane',
  default_language_code text not null default 'en-AU',
  tenant_status text not null default 'provisioning',
  activated_at timestamptz,
  suspended_at timestamptz,
  terminated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint platform_tenants_status_check check (tenant_status in ('provisioning','active','suspended','termination_pending','terminated','archived'))
);

alter table public.organisations drop constraint if exists organisations_tenant_id_fkey;
alter table public.organisations
  add constraint organisations_tenant_id_fkey
  foreign key (tenant_id) references public.platform_tenants(id) on delete set null not valid;

alter table public.cases drop constraint if exists cases_tenant_id_fkey;
alter table public.cases
  add constraint cases_tenant_id_fkey
  foreign key (tenant_id) references public.platform_tenants(id) on delete set null not valid;

alter table public.families drop constraint if exists families_tenant_id_fkey;
alter table public.families
  add constraint families_tenant_id_fkey
  foreign key (tenant_id) references public.platform_tenants(id) on delete set null not valid;

alter table public.community_service_providers drop constraint if exists community_service_providers_tenant_id_fkey;
alter table public.community_service_providers
  add constraint community_service_providers_tenant_id_fkey
  foreign key (tenant_id) references public.platform_tenants(id) on delete set null not valid;

alter table public.community_services drop constraint if exists community_services_tenant_id_fkey;
alter table public.community_services
  add constraint community_services_tenant_id_fkey
  foreign key (tenant_id) references public.platform_tenants(id) on delete set null not valid;

create table if not exists public.platform_tenant_domains (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  domain_name text not null unique,
  domain_type text not null,
  verification_status text not null default 'pending',
  verification_token_hash text,
  ssl_status text not null default 'pending',
  primary_domain boolean not null default false,
  verified_at timestamptz,
  active boolean not null default true
);

create table if not exists public.platform_tenant_environments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  environment_code text not null,
  environment_type text not null,
  region_code text not null,
  deployment_reference text,
  database_isolation_mode text not null,
  storage_isolation_mode text not null,
  public_access_enabled boolean not null default false,
  test_data_only boolean not null default false,
  environment_status text not null default 'provisioning',
  created_at timestamptz not null default now(),
  unique (tenant_id, environment_code)
);

create table if not exists public.platform_tenant_organisations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  organisation_role text not null,
  data_controller_role text,
  service_delivery_role text,
  joined_at timestamptz not null default now(),
  exited_at timestamptz,
  status text not null default 'active',
  unique (tenant_id, organisation_id)
);

create table if not exists public.platform_tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  membership_role text not null,
  organisation_id uuid references public.organisations(id) on delete set null,
  access_scope jsonb not null default '{}'::jsonb,
  membership_status text not null default 'active',
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  unique (tenant_id, user_id, membership_role, effective_from)
);

create table if not exists public.platform_tenant_role_definitions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.platform_tenants(id) on delete cascade,
  role_code text not null,
  role_name text not null,
  role_description text not null,
  role_category text not null,
  permission_bundle jsonb not null,
  prohibited_permissions text[] not null default '{}',
  system_role boolean not null default false,
  tenant_customisable boolean not null default true,
  active boolean not null default true,
  unique (tenant_id, role_code)
);

create table if not exists public.platform_tenant_permission_grants (
  id uuid primary key default gen_random_uuid(),
  tenant_membership_id uuid not null references public.platform_tenant_memberships(id) on delete cascade,
  permission_code text not null,
  permission_scope jsonb not null default '{}'::jsonb,
  grant_reason text not null,
  granted_by_user_id uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz
);

create table if not exists public.platform_tenant_data_registry (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  data_entity_type text not null,
  data_entity_reference text not null,
  source_table text not null,
  ownership_type text not null,
  isolation_class text not null,
  shared_record boolean not null default false,
  shared_authority_reference text,
  created_at timestamptz not null default now(),
  unique (tenant_id, data_entity_type, data_entity_reference)
);

create table if not exists public.platform_cross_tenant_sharing_agreements (
  id uuid primary key default gen_random_uuid(),
  agreement_reference text not null unique,
  source_tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  destination_tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  agreement_purpose text not null,
  permitted_data_categories text[] not null default '{}',
  prohibited_data_categories text[] not null default '{}',
  permitted_subject_types text[] not null default '{}',
  consent_requirements jsonb not null,
  legal_basis text not null,
  approval_requirements jsonb not null,
  retention_rules jsonb not null,
  effective_from timestamptz not null,
  effective_to timestamptz,
  agreement_status text not null default 'draft',
  check (source_tenant_id <> destination_tenant_id)
);

create table if not exists public.platform_cross_tenant_access_grants (
  id uuid primary key default gen_random_uuid(),
  sharing_agreement_id uuid not null references public.platform_cross_tenant_sharing_agreements(id) on delete cascade,
  source_record_type text not null,
  source_record_reference text not null,
  destination_principal_type text not null,
  destination_principal_reference text not null,
  access_level text not null,
  access_reason text not null,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz
);

create table if not exists public.platform_jurisdiction_packs (
  id uuid primary key default gen_random_uuid(),
  jurisdiction_code text not null,
  pack_version integer not null,
  jurisdiction_name text not null,
  legal_framework_summary text not null,
  policy_framework_summary text not null,
  terminology_configuration jsonb not null,
  statutory_timeframes jsonb not null,
  mandatory_reporting_rules jsonb not null,
  information_sharing_rules jsonb not null,
  records_retention_rules jsonb not null,
  court_reporting_rules jsonb not null,
  supported_program_types text[] not null default '{}',
  effective_from date not null,
  effective_to date,
  lifecycle_status text not null default 'draft',
  unique (jurisdiction_code, pack_version)
);

create table if not exists public.platform_tenant_jurisdiction_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  jurisdiction_pack_id uuid not null references public.platform_jurisdiction_packs(id) on delete restrict,
  primary_assignment boolean not null default false,
  configuration_overrides jsonb not null default '{}'::jsonb,
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  unique (tenant_id, jurisdiction_pack_id, effective_from)
);

create table if not exists public.platform_regional_configurations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  region_code text not null,
  region_name text not null,
  jurisdiction_code text not null,
  timezone_code text not null,
  service_area_geometry jsonb,
  rurality_classification text,
  emergency_contact_configuration jsonb not null,
  local_service_defaults jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  unique (tenant_id, region_code)
);

create table if not exists public.platform_branding_profiles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  branding_reference text not null unique,
  branding_name text not null,
  organisation_display_name text not null,
  product_display_name text not null default 'SafeSteps',
  logo_light_reference text,
  logo_dark_reference text,
  application_icon_reference text,
  favicon_reference text,
  primary_colour text,
  secondary_colour text,
  accent_colour text,
  background_colour text,
  typography_configuration jsonb not null default '{}'::jsonb,
  support_contact_text text,
  footer_text text,
  safety_disclaimer_text text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.platform_theme_definitions (
  id uuid primary key default gen_random_uuid(),
  theme_code text not null,
  theme_version integer not null,
  theme_name text not null,
  theme_description text not null,
  design_tokens jsonb not null,
  component_overrides jsonb not null default '{}'::jsonb,
  accessibility_validation_status text not null default 'pending',
  minimum_contrast_compliant boolean not null default false,
  reduced_motion_supported boolean not null default true,
  lifecycle_status text not null default 'draft',
  unique (theme_code, theme_version)
);

create table if not exists public.platform_tenant_theme_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  theme_definition_id uuid not null references public.platform_theme_definitions(id) on delete restrict,
  audience_type text not null,
  tenant_overrides jsonb not null default '{}'::jsonb,
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  unique (tenant_id, audience_type, effective_from)
);

create table if not exists public.platform_language_packs (
  id uuid primary key default gen_random_uuid(),
  language_code text not null,
  pack_version integer not null,
  language_name text not null,
  native_language_name text not null,
  text_direction text not null default 'ltr',
  translation_entries jsonb not null,
  locale_formatting jsonb not null,
  reading_level_variants jsonb not null default '{}'::jsonb,
  human_review_status text not null default 'pending',
  community_review_status text not null default 'not_required',
  lifecycle_status text not null default 'draft',
  unique (language_code, pack_version)
);

create table if not exists public.platform_tenant_language_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  language_pack_id uuid not null references public.platform_language_packs(id) on delete restrict,
  default_language boolean not null default false,
  child_interface_enabled boolean not null default true,
  parent_interface_enabled boolean not null default true,
  worker_interface_enabled boolean not null default true,
  active boolean not null default true,
  unique (tenant_id, language_pack_id)
);

create table if not exists public.platform_cultural_content_packs (
  id uuid primary key default gen_random_uuid(),
  cultural_pack_code text not null,
  pack_version integer not null,
  cultural_group_name text not null,
  pack_description text not null,
  terminology_guidance jsonb not null,
  imagery_guidance jsonb not null,
  family_structure_guidance jsonb not null,
  communication_guidance jsonb not null,
  cultural_safety_guidance jsonb not null,
  prohibited_assumptions jsonb not null default '[]'::jsonb,
  community_author_reference text,
  community_review_status text not null default 'pending',
  lifecycle_status text not null default 'draft',
  unique (cultural_pack_code, pack_version)
);

create table if not exists public.platform_tenant_cultural_pack_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  cultural_content_pack_id uuid not null references public.platform_cultural_content_packs(id) on delete restrict,
  supported_region_codes text[] not null default '{}',
  audience_types text[] not null default '{}',
  precedence_order integer not null default 100,
  active boolean not null default true,
  unique (tenant_id, cultural_content_pack_id)
);

create table if not exists public.platform_terminology_packs (
  id uuid primary key default gen_random_uuid(),
  terminology_code text not null,
  terminology_version integer not null,
  terminology_name text not null,
  jurisdiction_code text,
  term_mappings jsonb not null,
  prohibited_terms jsonb not null default '[]'::jsonb,
  preferred_language_guidance jsonb not null default '{}'::jsonb,
  effective_from date,
  effective_to date,
  lifecycle_status text not null default 'draft',
  unique (terminology_code, terminology_version)
);

create table if not exists public.platform_feature_definitions (
  id uuid primary key default gen_random_uuid(),
  feature_code text not null unique,
  feature_name text not null,
  feature_description text not null,
  feature_category text not null,
  safety_critical boolean not null default false,
  child_privacy_critical boolean not null default false,
  core_platform_feature boolean not null default false,
  dependency_features text[] not null default '{}',
  incompatible_features text[] not null default '{}',
  minimum_plan_code text,
  lifecycle_status text not null default 'active'
);

create table if not exists public.platform_tenant_license_plans (
  id uuid primary key default gen_random_uuid(),
  plan_code text not null unique,
  plan_name text not null,
  plan_description text not null,
  allowed_feature_codes text[] not null default '{}',
  max_organisations integer,
  max_active_cases integer,
  billing_model text not null default 'contract',
  safety_features_included boolean not null default true,
  lifecycle_status text not null default 'active'
);

create table if not exists public.platform_tenant_subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  license_plan_id uuid not null references public.platform_tenant_license_plans(id) on delete restrict,
  subscription_status text not null default 'active',
  started_at timestamptz not null default now(),
  renews_at timestamptz,
  suspended_at timestamptz,
  suspension_reason text,
  billing_contact jsonb not null default '{}'::jsonb,
  safety_access_preserved boolean not null default true,
  unique (tenant_id, license_plan_id, started_at)
);

create table if not exists public.platform_tenant_feature_flags (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  feature_definition_id uuid not null references public.platform_feature_definitions(id) on delete cascade,
  enabled boolean not null default false,
  rollout_percentage numeric not null default 100,
  audience_rules jsonb not null default '{}'::jsonb,
  configuration jsonb not null default '{}'::jsonb,
  governance_approved boolean not null default false,
  enabled_by_user_id uuid references auth.users(id) on delete set null,
  enabled_at timestamptz,
  disabled_at timestamptz,
  unique (tenant_id, feature_definition_id),
  constraint tenant_feature_rollout_check check (rollout_percentage >= 0 and rollout_percentage <= 100)
);

create table if not exists public.platform_feature_rollout_cohorts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  cohort_reference text not null unique,
  cohort_name text not null,
  inclusion_rules jsonb not null,
  exclusion_rules jsonb not null default '[]'::jsonb,
  active boolean not null default true
);

create table if not exists public.platform_configuration_schemas (
  id uuid primary key default gen_random_uuid(),
  configuration_code text not null,
  schema_version integer not null,
  configuration_name text not null,
  configuration_description text not null,
  json_schema jsonb not null,
  default_configuration jsonb not null,
  validation_rules jsonb not null default '[]'::jsonb,
  safety_restrictions jsonb not null default '[]'::jsonb,
  lifecycle_status text not null default 'draft',
  unique (configuration_code, schema_version)
);

create table if not exists public.platform_tenant_configurations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  configuration_schema_id uuid not null references public.platform_configuration_schemas(id) on delete restrict,
  configuration_scope text not null,
  scope_reference text,
  configuration_value jsonb not null,
  configuration_status text not null default 'draft',
  effective_from timestamptz,
  effective_to timestamptz,
  approved_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.platform_tenant_workflow_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  workflow_code text not null,
  workflow_version integer not null,
  workflow_name text not null,
  workflow_description text not null,
  workflow_definition jsonb not null,
  approval_rules jsonb not null,
  escalation_rules jsonb not null,
  protected_steps text[] not null default '{}',
  lifecycle_status text not null default 'draft',
  unique (tenant_id, workflow_code, workflow_version)
);

create table if not exists public.platform_tenant_form_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  form_code text not null,
  form_version integer not null,
  form_name text not null,
  form_purpose text not null,
  form_schema jsonb not null,
  display_schema jsonb not null,
  validation_schema jsonb not null,
  audience_types text[] not null,
  contains_sensitive_data boolean not null default false,
  child_facing boolean not null default false,
  lifecycle_status text not null default 'draft',
  unique (tenant_id, form_code, form_version)
);

create table if not exists public.platform_tenant_report_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  report_code text not null,
  report_version integer not null,
  report_name text not null,
  report_audience text not null,
  report_schema jsonb not null,
  disclosure_rules jsonb not null,
  ai_disclosure_required boolean not null default true,
  court_export_compatible boolean not null default false,
  lifecycle_status text not null default 'draft',
  unique (tenant_id, report_code, report_version)
);

create table if not exists public.platform_billing_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  subscription_id uuid references public.platform_tenant_subscriptions(id) on delete set null,
  event_type text not null,
  billing_period_start date,
  billing_period_end date,
  amount_cents integer,
  currency_code text not null default 'AUD',
  billing_status text not null default 'recorded',
  safety_access_impact text not null default 'none',
  created_at timestamptz not null default now()
);

create table if not exists public.platform_tenant_storage_policies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  storage_area text not null,
  residency_region text not null,
  encryption_profile text not null,
  backup_profile text not null,
  disaster_recovery_profile text not null,
  active boolean not null default true,
  unique (tenant_id, storage_area)
);

create table if not exists public.platform_tenant_data_retention_policies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  record_category text not null,
  retention_basis text not null,
  retention_period_months integer not null,
  legal_hold_supported boolean not null default true,
  child_record_protection text not null default 'protected',
  deletion_requires_review boolean not null default true,
  active boolean not null default true,
  unique (tenant_id, record_category)
);

create table if not exists public.platform_tenant_export_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  requested_by_user_id uuid references auth.users(id) on delete set null,
  approved_by_user_id uuid references auth.users(id) on delete set null,
  export_purpose text not null,
  export_scope jsonb not null,
  includes_child_content boolean not null default false,
  child_privacy_approval_recorded boolean not null default false,
  tenant_scope_verified boolean not null default false,
  legal_basis text,
  retention_basis text,
  export_status text not null default 'requested',
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  completed_at timestamptz
);

create table if not exists public.platform_tenant_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  requested_by_user_id uuid references auth.users(id) on delete set null,
  approved_by_user_id uuid references auth.users(id) on delete set null,
  deletion_reason text not null,
  retention_review_completed boolean not null default false,
  legal_hold_active boolean not null default true,
  export_or_archive_completed boolean not null default false,
  safety_record_preservation_plan jsonb not null default '{}'::jsonb,
  deletion_status text not null default 'requested',
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  scheduled_deletion_at timestamptz
);

create table if not exists public.platform_tenant_integration_endpoints (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  endpoint_reference text not null unique,
  endpoint_name text not null,
  integration_type text not null,
  endpoint_url text,
  data_categories text[] not null default '{}',
  credential_required boolean not null default true,
  active boolean not null default false,
  security_review_status text not null default 'pending'
);

create table if not exists public.platform_tenant_api_credentials (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  credential_reference text not null unique,
  credential_name text not null,
  credential_hash text not null,
  permission_scopes text[] not null default '{}',
  issued_by_user_id uuid references auth.users(id) on delete set null,
  issued_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz
);

create table if not exists public.platform_tenant_deployment_releases (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  environment_id uuid references public.platform_tenant_environments(id) on delete set null,
  release_reference text not null,
  release_version text not null,
  release_channel text not null,
  release_status text not null default 'planned',
  configuration_snapshot jsonb not null default '{}'::jsonb,
  rollback_release_id uuid references public.platform_tenant_deployment_releases(id) on delete set null,
  approved_by_user_id uuid references auth.users(id) on delete set null,
  deployed_at timestamptz,
  unique (tenant_id, release_reference)
);

create table if not exists public.platform_tenant_operational_status_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  environment_id uuid references public.platform_tenant_environments(id) on delete set null,
  event_type text not null,
  severity text not null default 'info',
  status_summary text not null,
  impact_summary text,
  safety_impact boolean not null default false,
  started_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.platform_tenant_compliance_attestations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  attestation_type text not null,
  attestation_period_start date not null,
  attestation_period_end date not null,
  attestation_status text not null default 'draft',
  attested_by_user_id uuid references auth.users(id) on delete set null,
  evidence_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  attested_at timestamptz
);

create table if not exists public.platform_tenant_audit_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.platform_tenants(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  event_summary text not null,
  affected_table text,
  affected_record_id uuid,
  before_state jsonb,
  after_state jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_platform_tenant_orgs_tenant on public.platform_tenant_organisations(tenant_id, status);
create index if not exists idx_platform_tenant_orgs_org on public.platform_tenant_organisations(organisation_id, status);
create index if not exists idx_platform_tenant_memberships_user on public.platform_tenant_memberships(user_id, membership_status);
create index if not exists idx_platform_tenant_data_registry_tenant_table on public.platform_tenant_data_registry(tenant_id, source_table);
create index if not exists idx_platform_cross_tenant_agreements_source on public.platform_cross_tenant_sharing_agreements(source_tenant_id, agreement_status);
create index if not exists idx_platform_cross_tenant_agreements_destination on public.platform_cross_tenant_sharing_agreements(destination_tenant_id, agreement_status);
create index if not exists idx_platform_tenant_feature_flags_tenant on public.platform_tenant_feature_flags(tenant_id, enabled);
create index if not exists idx_platform_tenant_exports_tenant_status on public.platform_tenant_export_requests(tenant_id, export_status);
create index if not exists idx_platform_tenant_deletions_tenant_status on public.platform_tenant_deletion_requests(tenant_id, deletion_status);
create index if not exists idx_platform_tenant_audit_tenant_created on public.platform_tenant_audit_events(tenant_id, created_at desc);

create or replace function public.safesteps_can_manage_platform_tenant(
  p_user_id uuid,
  p_tenant_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_has_role('admin'), false)
    or coalesce(public.has_resource_permission(p_user_id, 'tenant', p_tenant_id, 'tenant.manage'), false)
    or exists (
      select 1
      from public.platform_tenant_memberships tm
      where tm.tenant_id = p_tenant_id
        and tm.user_id = p_user_id
        and tm.membership_status = 'active'
        and tm.membership_role in ('tenant_admin','tenant_security_admin','tenant_platform_admin')
        and tm.effective_from <= now()
        and (tm.effective_to is null or tm.effective_to > now())
    )
    or exists (
      select 1
      from public.platform_tenant_organisations torg
      where torg.tenant_id = p_tenant_id
        and torg.status = 'active'
        and public.safesteps_can_admin_organisation(p_user_id, torg.organisation_id)
    );
$$;

create or replace function public.safesteps_can_access_platform_tenant_config(
  p_user_id uuid,
  p_tenant_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.safesteps_can_manage_platform_tenant(p_user_id, p_tenant_id)
    or coalesce(public.has_resource_permission(p_user_id, 'tenant', p_tenant_id, 'tenant_config.read'), false)
    or exists (
      select 1
      from public.platform_tenant_memberships tm
      where tm.tenant_id = p_tenant_id
        and tm.user_id = p_user_id
        and tm.membership_status = 'active'
        and tm.effective_from <= now()
        and (tm.effective_to is null or tm.effective_to > now())
    )
    or exists (
      select 1
      from public.platform_tenant_organisations torg
      where torg.tenant_id = p_tenant_id
        and torg.status = 'active'
        and public.safesteps_is_active_member(p_user_id, torg.organisation_id)
    );
$$;

create or replace function public.can_activate_platform_tenant_feature(p_feature_flag_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.platform_tenant_feature_flags f
    join public.platform_feature_definitions d on d.id = f.feature_definition_id
    left join public.platform_tenant_subscriptions s
      on s.tenant_id = f.tenant_id
      and s.subscription_status = 'active'
    left join public.platform_tenant_license_plans lp on lp.id = s.license_plan_id
    where f.id = p_feature_flag_id
      and d.lifecycle_status = 'active'
      and (
        lp.id is null
        or lp.allowed_feature_codes = '{}'
        or d.feature_code = any(lp.allowed_feature_codes)
        or d.safety_critical = true
      )
      and f.governance_approved = true
      and not ((d.safety_critical = true or d.child_privacy_critical = true) and f.enabled = false)
      and coalesce(s.safety_access_preserved, true) = true
  );
$$;

create or replace function public.can_export_platform_tenant_data(p_export_request_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.platform_tenant_export_requests er
    where er.id = p_export_request_id
      and er.approved_by_user_id is not null
      and er.tenant_scope_verified = true
      and er.export_purpose <> ''
      and er.legal_basis is not null
      and er.retention_basis is not null
      and (er.includes_child_content = false or er.child_privacy_approval_recorded = true)
      and er.export_status in ('approved','ready','processing')
  );
$$;

create or replace function public.can_delete_platform_tenant(p_deletion_request_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.platform_tenant_deletion_requests dr
    where dr.id = p_deletion_request_id
      and dr.approved_by_user_id is not null
      and dr.retention_review_completed = true
      and dr.legal_hold_active = false
      and dr.export_or_archive_completed = true
      and dr.safety_record_preservation_plan <> '{}'::jsonb
      and dr.deletion_status in ('approved','scheduled')
  );
$$;

revoke all on function public.safesteps_can_manage_platform_tenant(uuid, uuid) from public;
revoke all on function public.safesteps_can_access_platform_tenant_config(uuid, uuid) from public;
revoke all on function public.can_activate_platform_tenant_feature(uuid) from public;
revoke all on function public.can_export_platform_tenant_data(uuid) from public;
revoke all on function public.can_delete_platform_tenant(uuid) from public;
grant execute on function public.safesteps_can_manage_platform_tenant(uuid, uuid) to authenticated;
grant execute on function public.safesteps_can_access_platform_tenant_config(uuid, uuid) to authenticated;
grant execute on function public.can_activate_platform_tenant_feature(uuid) to authenticated;
grant execute on function public.can_export_platform_tenant_data(uuid) to authenticated;
grant execute on function public.can_delete_platform_tenant(uuid) to authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'platform_tenants',
    'platform_tenant_domains',
    'platform_tenant_environments',
    'platform_tenant_organisations',
    'platform_tenant_memberships',
    'platform_tenant_role_definitions',
    'platform_tenant_permission_grants',
    'platform_tenant_data_registry',
    'platform_cross_tenant_sharing_agreements',
    'platform_cross_tenant_access_grants',
    'platform_jurisdiction_packs',
    'platform_tenant_jurisdiction_assignments',
    'platform_regional_configurations',
    'platform_branding_profiles',
    'platform_theme_definitions',
    'platform_tenant_theme_assignments',
    'platform_language_packs',
    'platform_tenant_language_assignments',
    'platform_cultural_content_packs',
    'platform_tenant_cultural_pack_assignments',
    'platform_terminology_packs',
    'platform_feature_definitions',
    'platform_tenant_license_plans',
    'platform_tenant_subscriptions',
    'platform_tenant_feature_flags',
    'platform_feature_rollout_cohorts',
    'platform_configuration_schemas',
    'platform_tenant_configurations',
    'platform_tenant_workflow_templates',
    'platform_tenant_form_templates',
    'platform_tenant_report_templates',
    'platform_billing_events',
    'platform_tenant_storage_policies',
    'platform_tenant_data_retention_policies',
    'platform_tenant_export_requests',
    'platform_tenant_deletion_requests',
    'platform_tenant_integration_endpoints',
    'platform_tenant_api_credentials',
    'platform_tenant_deployment_releases',
    'platform_tenant_operational_status_events',
    'platform_tenant_compliance_attestations',
    'platform_tenant_audit_events'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

grant select, insert, update on
  public.platform_tenants,
  public.platform_tenant_domains,
  public.platform_tenant_environments,
  public.platform_tenant_organisations,
  public.platform_tenant_memberships,
  public.platform_tenant_role_definitions,
  public.platform_tenant_permission_grants,
  public.platform_tenant_data_registry,
  public.platform_cross_tenant_sharing_agreements,
  public.platform_cross_tenant_access_grants,
  public.platform_jurisdiction_packs,
  public.platform_tenant_jurisdiction_assignments,
  public.platform_regional_configurations,
  public.platform_branding_profiles,
  public.platform_theme_definitions,
  public.platform_tenant_theme_assignments,
  public.platform_language_packs,
  public.platform_tenant_language_assignments,
  public.platform_cultural_content_packs,
  public.platform_tenant_cultural_pack_assignments,
  public.platform_terminology_packs,
  public.platform_feature_definitions,
  public.platform_tenant_license_plans,
  public.platform_tenant_subscriptions,
  public.platform_tenant_feature_flags,
  public.platform_feature_rollout_cohorts,
  public.platform_configuration_schemas,
  public.platform_tenant_configurations,
  public.platform_tenant_workflow_templates,
  public.platform_tenant_form_templates,
  public.platform_tenant_report_templates,
  public.platform_billing_events,
  public.platform_tenant_storage_policies,
  public.platform_tenant_data_retention_policies,
  public.platform_tenant_export_requests,
  public.platform_tenant_deletion_requests,
  public.platform_tenant_integration_endpoints,
  public.platform_tenant_api_credentials,
  public.platform_tenant_deployment_releases,
  public.platform_tenant_operational_status_events,
  public.platform_tenant_compliance_attestations,
  public.platform_tenant_audit_events
to authenticated;

create policy "Platform tenants config readable" on public.platform_tenants for select to authenticated using (public.safesteps_can_access_platform_tenant_config(auth.uid(), id));
create policy "Platform tenants managed" on public.platform_tenants for all to authenticated using (public.safesteps_can_manage_platform_tenant(auth.uid(), id)) with check (public.safesteps_can_manage_platform_tenant(auth.uid(), id));

create policy "Platform tenant child config readable" on public.platform_tenant_domains for select to authenticated using (public.safesteps_can_access_platform_tenant_config(auth.uid(), tenant_id));
create policy "Platform tenant domains managed" on public.platform_tenant_domains for all to authenticated using (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id)) with check (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id));
create policy "Platform tenant environments accessible" on public.platform_tenant_environments for all to authenticated using (public.safesteps_can_access_platform_tenant_config(auth.uid(), tenant_id)) with check (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id));
create policy "Platform tenant organisations accessible" on public.platform_tenant_organisations for all to authenticated using (public.safesteps_can_access_platform_tenant_config(auth.uid(), tenant_id)) with check (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id));
create policy "Platform tenant memberships accessible" on public.platform_tenant_memberships for all to authenticated using (user_id = auth.uid() or public.safesteps_can_access_platform_tenant_config(auth.uid(), tenant_id)) with check (user_id = auth.uid() or public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id));
create policy "Platform tenant roles accessible" on public.platform_tenant_role_definitions for all to authenticated using (tenant_id is null or public.safesteps_can_access_platform_tenant_config(auth.uid(), tenant_id)) with check (tenant_id is null or public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id));
create policy "Platform tenant permission grants accessible" on public.platform_tenant_permission_grants for all to authenticated using (exists (select 1 from public.platform_tenant_memberships tm where tm.id = tenant_membership_id and (tm.user_id = auth.uid() or public.safesteps_can_access_platform_tenant_config(auth.uid(), tm.tenant_id)))) with check (exists (select 1 from public.platform_tenant_memberships tm where tm.id = tenant_membership_id and public.safesteps_can_manage_platform_tenant(auth.uid(), tm.tenant_id)));
create policy "Platform tenant data registry accessible" on public.platform_tenant_data_registry for all to authenticated using (public.safesteps_can_access_platform_tenant_config(auth.uid(), tenant_id)) with check (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id));
create policy "Platform tenant sharing agreements accessible" on public.platform_cross_tenant_sharing_agreements for all to authenticated using (public.safesteps_can_access_platform_tenant_config(auth.uid(), source_tenant_id) or public.safesteps_can_access_platform_tenant_config(auth.uid(), destination_tenant_id)) with check (public.safesteps_can_manage_platform_tenant(auth.uid(), source_tenant_id) and public.safesteps_can_access_platform_tenant_config(auth.uid(), destination_tenant_id));
create policy "Platform tenant access grants accessible" on public.platform_cross_tenant_access_grants for all to authenticated using (exists (select 1 from public.platform_cross_tenant_sharing_agreements a where a.id = sharing_agreement_id and (public.safesteps_can_access_platform_tenant_config(auth.uid(), a.source_tenant_id) or public.safesteps_can_access_platform_tenant_config(auth.uid(), a.destination_tenant_id)))) with check (exists (select 1 from public.platform_cross_tenant_sharing_agreements a where a.id = sharing_agreement_id and public.safesteps_can_manage_platform_tenant(auth.uid(), a.source_tenant_id)));

create policy "Platform jurisdiction packs readable" on public.platform_jurisdiction_packs for select to authenticated using (lifecycle_status in ('published','active') or public.current_user_has_role('admin'));
create policy "Platform jurisdiction packs managed" on public.platform_jurisdiction_packs for all to authenticated using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));
create policy "Platform tenant jurisdiction assignments accessible" on public.platform_tenant_jurisdiction_assignments for all to authenticated using (public.safesteps_can_access_platform_tenant_config(auth.uid(), tenant_id)) with check (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id));
create policy "Platform regional configurations accessible" on public.platform_regional_configurations for all to authenticated using (public.safesteps_can_access_platform_tenant_config(auth.uid(), tenant_id)) with check (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id));
create policy "Platform branding profiles accessible" on public.platform_branding_profiles for all to authenticated using (public.safesteps_can_access_platform_tenant_config(auth.uid(), tenant_id)) with check (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id));
create policy "Platform themes readable" on public.platform_theme_definitions for select to authenticated using (lifecycle_status in ('published','active') or public.current_user_has_role('admin'));
create policy "Platform themes managed" on public.platform_theme_definitions for all to authenticated using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));
create policy "Platform tenant themes accessible" on public.platform_tenant_theme_assignments for all to authenticated using (public.safesteps_can_access_platform_tenant_config(auth.uid(), tenant_id)) with check (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id));
create policy "Platform language packs readable" on public.platform_language_packs for select to authenticated using (lifecycle_status in ('published','active') or public.current_user_has_role('admin'));
create policy "Platform language packs managed" on public.platform_language_packs for all to authenticated using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));
create policy "Platform tenant languages accessible" on public.platform_tenant_language_assignments for all to authenticated using (public.safesteps_can_access_platform_tenant_config(auth.uid(), tenant_id)) with check (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id));
create policy "Platform cultural packs readable" on public.platform_cultural_content_packs for select to authenticated using (lifecycle_status in ('published','active') or public.current_user_has_role('admin'));
create policy "Platform cultural packs managed" on public.platform_cultural_content_packs for all to authenticated using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));
create policy "Platform tenant cultural packs accessible" on public.platform_tenant_cultural_pack_assignments for all to authenticated using (public.safesteps_can_access_platform_tenant_config(auth.uid(), tenant_id)) with check (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id));
create policy "Platform terminology packs readable" on public.platform_terminology_packs for select to authenticated using (lifecycle_status in ('published','active') or public.current_user_has_role('admin'));
create policy "Platform terminology packs managed" on public.platform_terminology_packs for all to authenticated using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));

create policy "Platform feature definitions readable" on public.platform_feature_definitions for select to authenticated using (lifecycle_status = 'active' or public.current_user_has_role('admin'));
create policy "Platform feature definitions managed" on public.platform_feature_definitions for all to authenticated using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));
create policy "Platform license plans readable" on public.platform_tenant_license_plans for select to authenticated using (lifecycle_status = 'active' or public.current_user_has_role('admin'));
create policy "Platform license plans managed" on public.platform_tenant_license_plans for all to authenticated using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));
create policy "Platform tenant subscriptions accessible" on public.platform_tenant_subscriptions for all to authenticated using (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id)) with check (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id));
create policy "Platform tenant feature flags accessible" on public.platform_tenant_feature_flags for all to authenticated using (public.safesteps_can_access_platform_tenant_config(auth.uid(), tenant_id)) with check (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id));
create policy "Platform feature cohorts accessible" on public.platform_feature_rollout_cohorts for all to authenticated using (public.safesteps_can_access_platform_tenant_config(auth.uid(), tenant_id)) with check (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id));
create policy "Platform configuration schemas readable" on public.platform_configuration_schemas for select to authenticated using (lifecycle_status in ('published','active') or public.current_user_has_role('admin'));
create policy "Platform configuration schemas managed" on public.platform_configuration_schemas for all to authenticated using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));
create policy "Platform tenant configurations accessible" on public.platform_tenant_configurations for all to authenticated using (public.safesteps_can_access_platform_tenant_config(auth.uid(), tenant_id)) with check (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id));
create policy "Platform tenant workflows accessible" on public.platform_tenant_workflow_templates for all to authenticated using (public.safesteps_can_access_platform_tenant_config(auth.uid(), tenant_id)) with check (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id));
create policy "Platform tenant forms accessible" on public.platform_tenant_form_templates for all to authenticated using (public.safesteps_can_access_platform_tenant_config(auth.uid(), tenant_id)) with check (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id));
create policy "Platform tenant reports accessible" on public.platform_tenant_report_templates for all to authenticated using (public.safesteps_can_access_platform_tenant_config(auth.uid(), tenant_id)) with check (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id));
create policy "Platform billing events accessible" on public.platform_billing_events for all to authenticated using (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id)) with check (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id));
create policy "Platform tenant storage policies accessible" on public.platform_tenant_storage_policies for all to authenticated using (public.safesteps_can_access_platform_tenant_config(auth.uid(), tenant_id)) with check (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id));
create policy "Platform tenant retention policies accessible" on public.platform_tenant_data_retention_policies for all to authenticated using (public.safesteps_can_access_platform_tenant_config(auth.uid(), tenant_id)) with check (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id));
create policy "Platform tenant exports accessible" on public.platform_tenant_export_requests for all to authenticated using (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id) or requested_by_user_id = auth.uid()) with check (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id) or requested_by_user_id = auth.uid());
create policy "Platform tenant deletions accessible" on public.platform_tenant_deletion_requests for all to authenticated using (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id)) with check (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id));
create policy "Platform tenant integrations accessible" on public.platform_tenant_integration_endpoints for all to authenticated using (public.safesteps_can_access_platform_tenant_config(auth.uid(), tenant_id)) with check (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id));
create policy "Platform tenant api credentials managed" on public.platform_tenant_api_credentials for all to authenticated using (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id)) with check (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id));
create policy "Platform tenant releases accessible" on public.platform_tenant_deployment_releases for all to authenticated using (public.safesteps_can_access_platform_tenant_config(auth.uid(), tenant_id)) with check (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id));
create policy "Platform tenant status events accessible" on public.platform_tenant_operational_status_events for all to authenticated using (public.safesteps_can_access_platform_tenant_config(auth.uid(), tenant_id)) with check (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id));
create policy "Platform tenant attestations accessible" on public.platform_tenant_compliance_attestations for all to authenticated using (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id)) with check (public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id));
create policy "Platform tenant audit readable" on public.platform_tenant_audit_events for select to authenticated using (tenant_id is not null and public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id) or public.has_resource_permission(auth.uid(), 'global', null, 'platform_audit.read'));
create policy "Platform tenant audit appendable" on public.platform_tenant_audit_events for insert to authenticated with check (actor_user_id = auth.uid() or (tenant_id is not null and public.safesteps_can_manage_platform_tenant(auth.uid(), tenant_id)));

create or replace view public.platform_tenant_configuration_summary
with (security_invoker = true)
as
select
  t.id as tenant_id,
  t.tenant_reference,
  t.tenant_slug,
  t.tenant_name,
  t.tenant_type,
  t.tenant_status,
  t.data_residency_region,
  count(distinct o.organisation_id) as organisation_count,
  count(distinct d.id) filter (where d.active = true) as active_domain_count,
  count(distinct e.id) filter (where e.environment_status in ('active','ready','deployed')) as active_environment_count,
  count(distinct f.id) filter (where f.enabled = true) as enabled_feature_count,
  max(a.created_at) as last_audit_event_at
from public.platform_tenants t
left join public.platform_tenant_organisations o on o.tenant_id = t.id and o.status = 'active'
left join public.platform_tenant_domains d on d.tenant_id = t.id
left join public.platform_tenant_environments e on e.tenant_id = t.id
left join public.platform_tenant_feature_flags f on f.tenant_id = t.id
left join public.platform_tenant_audit_events a on a.tenant_id = t.id
group by t.id;

create or replace view public.platform_tenant_release_readiness_queue
with (security_invoker = true)
as
select
  r.id as release_id,
  r.tenant_id,
  t.tenant_name,
  r.release_reference,
  r.release_version,
  r.release_channel,
  r.release_status,
  r.approved_by_user_id,
  exists (
    select 1
    from public.platform_tenant_feature_flags f
    join public.platform_feature_definitions d on d.id = f.feature_definition_id
    where f.tenant_id = r.tenant_id
      and (d.safety_critical = true or d.child_privacy_critical = true)
      and f.enabled = false
  ) as has_disabled_protected_feature,
  exists (
    select 1
    from public.platform_tenant_storage_policies sp
    where sp.tenant_id = r.tenant_id
      and sp.active = true
  ) as has_storage_policy,
  exists (
    select 1
    from public.platform_tenant_data_retention_policies rp
    where rp.tenant_id = r.tenant_id
      and rp.active = true
  ) as has_retention_policy
from public.platform_tenant_deployment_releases r
join public.platform_tenants t on t.id = r.tenant_id
where r.release_status in ('planned','pending_approval','ready');

grant select on public.platform_tenant_configuration_summary to authenticated;
grant select on public.platform_tenant_release_readiness_queue to authenticated;

insert into public.security_permissions (permission_code, description, resource_type, action, risk_level)
values
  ('tenant.manage', 'Create and administer tenant configuration without granting automatic case-content access.', 'tenant', 'manage', 'high_impact'),
  ('tenant_config.read', 'Read tenant configuration and operational metadata.', 'tenant', 'read_config', 'sensitive'),
  ('tenant_branding.manage', 'Manage white-label branding while preserving SafeSteps safety standards.', 'tenant_branding', 'manage', 'sensitive'),
  ('tenant_feature.manage', 'Manage tenant feature flags and controlled rollout settings.', 'tenant_feature', 'manage', 'high_impact'),
  ('tenant_billing.manage', 'Manage tenant licensing, subscriptions, billing events and commercial status.', 'tenant_billing', 'manage', 'sensitive'),
  ('tenant_data_export.approve', 'Approve complete, scoped and lawful tenant data exports.', 'tenant_export', 'approve', 'high_impact'),
  ('tenant_delete.approve', 'Approve tenant termination after retention, export and legal-hold checks.', 'tenant_lifecycle', 'approve_delete', 'high_impact'),
  ('platform_audit.read', 'Read tenant configuration and platform audit records.', 'platform_audit', 'read', 'sensitive')
on conflict (permission_code) do update set
  description = excluded.description,
  resource_type = excluded.resource_type,
  action = excluded.action,
  risk_level = excluded.risk_level;

insert into public.platform_feature_definitions (
  feature_code,
  feature_name,
  feature_description,
  feature_category,
  safety_critical,
  child_privacy_critical,
  core_platform_feature,
  minimum_plan_code
)
values
  ('safety_escalation', 'Safety escalation', 'Safety escalation, crisis routing and human review workflows.', 'safety', true, false, true, null),
  ('child_privacy_controls', 'Child privacy controls', 'Child-mediated sharing, privacy review and parent visibility controls.', 'privacy', true, true, true, null),
  ('court_export', 'Court export', 'Court and tribunal export package generation with audit lineage.', 'reporting', false, false, false, 'professional'),
  ('white_label_branding', 'White-label branding', 'Tenant brand, theme, domain and terminology customisation.', 'configuration', false, false, false, 'professional'),
  ('community_services', 'Community services', 'Tenant-enabled service directory, referrals, bookings and provider integrations.', 'services', false, false, false, 'standard')
on conflict (feature_code) do update set
  feature_name = excluded.feature_name,
  feature_description = excluded.feature_description,
  feature_category = excluded.feature_category,
  safety_critical = excluded.safety_critical,
  child_privacy_critical = excluded.child_privacy_critical,
  core_platform_feature = excluded.core_platform_feature,
  minimum_plan_code = excluded.minimum_plan_code;

insert into public.platform_tenant_license_plans (
  plan_code,
  plan_name,
  plan_description,
  allowed_feature_codes,
  max_organisations,
  billing_model,
  safety_features_included
)
values
  ('essential', 'Essential Tenant', 'Core SafeSteps tenant operations with mandatory safety and privacy protections.', array['safety_escalation','child_privacy_controls','community_services'], 3, 'contract', true),
  ('professional', 'Professional Tenant', 'Adds white-label branding, court exports and advanced service configuration.', array['safety_escalation','child_privacy_controls','community_services','court_export','white_label_branding'], 25, 'contract', true),
  ('enterprise', 'Enterprise Tenant', 'Enterprise tenancy, integrations, analytics, multi-region operation and advanced governance.', '{}', null, 'enterprise_contract', true)
on conflict (plan_code) do update set
  plan_name = excluded.plan_name,
  plan_description = excluded.plan_description,
  allowed_feature_codes = excluded.allowed_feature_codes,
  max_organisations = excluded.max_organisations,
  billing_model = excluded.billing_model,
  safety_features_included = excluded.safety_features_included;
