create extension if not exists pgcrypto;

alter table public.families
  add column if not exists tenant_id uuid references public.platform_tenants(id) on delete restrict,
  add column if not exists family_display_name text,
  add column if not exists family_type text not null default 'household',
  add column if not exists family_status text not null default 'active',
  add column if not exists primary_language_code text not null default 'en-AU',
  add column if not exists preferred_contact_method text,
  add column if not exists cultural_context jsonb not null default '{}'::jsonb,
  add column if not exists accessibility_requirements jsonb not null default '[]'::jsonb,
  add column if not exists family_summary text,
  add column if not exists created_by_user_id uuid references auth.users(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now();

alter table public.families alter column organisation_id drop not null;

update public.families
set family_display_name = coalesce(family_display_name, display_name),
    family_status = coalesce(family_status, status, 'active')
where family_display_name is null
   or family_status is null;

create index if not exists families_tenant_status_idx
  on public.families (tenant_id, family_status);

create unique index if not exists families_tenant_reference_unique_idx
  on public.families (tenant_id, family_reference)
  where tenant_id is not null and family_reference is not null;

alter table public.family_members
  add column if not exists tenant_id uuid references public.platform_tenants(id) on delete restrict,
  add column if not exists profile_id uuid references public.profiles(id) on delete set null,
  add column if not exists member_reference text,
  add column if not exists member_type text,
  add column if not exists legal_first_name text,
  add column if not exists legal_middle_names text,
  add column if not exists legal_last_name text,
  add column if not exists preferred_name text,
  add column if not exists display_name text,
  add column if not exists date_of_birth date,
  add column if not exists primary_language_code text,
  add column if not exists interpreter_required boolean not null default false,
  add column if not exists member_status text not null default 'active',
  add column if not exists updated_at timestamptz not null default now();

update public.family_members fm
set tenant_id = f.tenant_id,
    member_type = coalesce(fm.member_type, fm.relationship_type, 'other'),
    member_reference = coalesce(fm.member_reference, 'FM-' || fm.id::text),
    member_status = coalesce(fm.member_status, fm.contact_status, 'active')
from public.families f
where f.id = fm.family_id
  and (fm.tenant_id is null or fm.member_type is null or fm.member_reference is null);

create index if not exists family_members_tenant_family_idx
  on public.family_members (tenant_id, family_id);

create unique index if not exists family_members_tenant_reference_unique_idx
  on public.family_members (tenant_id, member_reference)
  where tenant_id is not null and member_reference is not null;

create table if not exists public.adult_participants (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  family_member_id uuid not null unique references public.family_members(id) on delete cascade,
  adult_reference text not null,
  participant_category text not null,
  account_status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, adult_reference)
);

create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  family_member_id uuid not null unique references public.family_members(id) on delete cascade,
  child_reference text not null,
  developmental_stage text,
  school_year_level text,
  child_status text not null default 'active',
  communication_preferences jsonb not null default '{}'::jsonb,
  sensory_preferences jsonb not null default '{}'::jsonb,
  accessibility_requirements jsonb not null default '[]'::jsonb,
  child_account_status text not null default 'not_invited',
  child_voice_enabled boolean not null default true,
  independent_login_allowed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, child_reference)
);

create table if not exists public.relationship_type_definitions (
  relationship_type_code text primary key,
  relationship_type_name text not null,
  inverse_relationship_type_code text,
  relationship_category text not null,
  biological_possible boolean not null default false,
  guardianship_possible boolean not null default false,
  active boolean not null default true
);

create table if not exists public.family_relationships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  family_id uuid not null references public.families(id) on delete cascade,
  from_family_member_id uuid not null references public.family_members(id) on delete cascade,
  to_family_member_id uuid not null references public.family_members(id) on delete cascade,
  relationship_type text not null,
  biological_relationship boolean,
  relationship_status text not null default 'reported',
  confidence_level text not null default 'reported',
  source_type text not null default 'self_report',
  verified_at timestamptz,
  verified_by_user_id uuid references auth.users(id) on delete set null,
  effective_from date not null default current_date,
  effective_to date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint family_relationships_not_self check (from_family_member_id <> to_family_member_id),
  constraint family_relationships_period_check check (effective_to is null or effective_to > effective_from)
);

create table if not exists public.family_relationship_history (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid references public.family_relationships(id) on delete set null,
  tenant_id uuid references public.platform_tenants(id) on delete set null,
  event_type text not null,
  previous_state jsonb,
  resulting_state jsonb,
  actor_user_id uuid references auth.users(id) on delete set null,
  occurred_at timestamptz not null default now()
);

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  family_id uuid not null references public.families(id) on delete cascade,
  household_reference text not null,
  household_name text,
  household_type text not null default 'primary',
  household_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, household_reference)
);

create table if not exists public.household_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  household_id uuid not null references public.households(id) on delete cascade,
  family_member_id uuid not null references public.family_members(id) on delete cascade,
  membership_type text not null default 'resident',
  primary_household boolean not null default false,
  membership_status text not null default 'active',
  effective_from date not null default current_date,
  effective_to date,
  created_at timestamptz not null default now(),
  constraint household_memberships_period_check check (effective_to is null or effective_to > effective_from)
);

create unique index if not exists household_memberships_one_active_primary_idx
  on public.household_memberships (tenant_id, family_member_id)
  where primary_household = true and membership_status = 'active';

create table if not exists public.guardianship_records (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  child_id uuid not null references public.children(id) on delete cascade,
  guardian_family_member_id uuid not null references public.family_members(id) on delete cascade,
  guardianship_type text not null,
  guardianship_status text not null default 'reported',
  source_type text not null default 'reported',
  effective_from date not null default current_date,
  effective_to date,
  created_at timestamptz not null default now()
);

create table if not exists public.care_arrangements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  child_id uuid not null references public.children(id) on delete cascade,
  carer_family_member_id uuid references public.family_members(id) on delete set null,
  care_type text not null,
  care_status text not null default 'active',
  primary_arrangement boolean not null default false,
  source_type text not null default 'reported',
  effective_from date not null default current_date,
  effective_to date,
  created_at timestamptz not null default now()
);

create unique index if not exists care_arrangements_one_active_primary_idx
  on public.care_arrangements (tenant_id, child_id)
  where primary_arrangement = true and care_status = 'active';

create table if not exists public.family_contact_points (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  family_id uuid not null references public.families(id) on delete cascade,
  family_member_id uuid references public.family_members(id) on delete cascade,
  contact_type text not null,
  contact_value text not null,
  confidential boolean not null default false,
  contact_status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.family_addresses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  address_reference text not null,
  address_line_1 text,
  locality text,
  region_code text,
  postal_code text,
  country_code text not null default 'AU',
  confidential boolean not null default false,
  created_at timestamptz not null default now(),
  unique (tenant_id, address_reference)
);

create table if not exists public.family_address_links (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  address_id uuid not null references public.family_addresses(id) on delete cascade,
  family_id uuid references public.families(id) on delete cascade,
  family_member_id uuid references public.family_members(id) on delete cascade,
  link_type text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.child_privacy_settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  child_id uuid not null unique references public.children(id) on delete cascade,
  child_private_content_enabled boolean not null default true,
  guardian_identity_access boolean not null default true,
  parent_summary_access boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.child_sharing_grants (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  child_id uuid not null references public.children(id) on delete cascade,
  grantee_user_id uuid references auth.users(id) on delete cascade,
  grantee_family_member_id uuid references public.family_members(id) on delete cascade,
  sharing_scope text not null,
  grant_status text not null default 'active',
  granted_by_child boolean not null default false,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  withdrawn_at timestamptz
);

create table if not exists public.child_privacy_decisions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  child_id uuid not null references public.children(id) on delete cascade,
  decision_type text not null,
  decision_summary text not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
