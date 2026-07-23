create table if not exists public.platform_tenants (
  id uuid primary key default gen_random_uuid(),
  tenant_reference text not null unique,
  tenant_slug citext not null unique,
  tenant_name text not null,
  legal_entity_name text,
  tenant_type text not null,
  primary_jurisdiction_code text,
  supported_jurisdiction_codes text[] not null default '{}',
  data_residency_region text not null default 'australia-east',
  primary_timezone text not null default 'Australia/Brisbane',
  default_language_code text not null default 'en-AU',
  tenant_status text not null default 'provisioning',
  activated_at timestamptz,
  suspended_at timestamptz,
  terminated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.platform_tenants
  add column if not exists tenant_reference text,
  add column if not exists tenant_slug citext,
  add column if not exists tenant_name text,
  add column if not exists legal_entity_name text,
  add column if not exists tenant_type text,
  add column if not exists primary_jurisdiction_code text,
  add column if not exists supported_jurisdiction_codes text[] not null default '{}',
  add column if not exists data_residency_region text not null default 'australia-east',
  add column if not exists primary_timezone text not null default 'Australia/Brisbane',
  add column if not exists default_language_code text not null default 'en-AU',
  add column if not exists tenant_status text not null default 'provisioning',
  add column if not exists activated_at timestamptz,
  add column if not exists suspended_at timestamptz,
  add column if not exists terminated_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists platform_tenants_reference_unique_idx
  on public.platform_tenants (tenant_reference);

create unique index if not exists platform_tenants_slug_unique_idx
  on public.platform_tenants (tenant_slug);

create index if not exists platform_tenants_status_idx
  on public.platform_tenants (tenant_status);

create index if not exists platform_tenants_slug_trgm_idx
  on public.platform_tenants using gin (tenant_slug gin_trgm_ops);
