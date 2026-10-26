alter table public.organisations
  add column if not exists tenant_id uuid references public.platform_tenants(id) on delete restrict,
  add column if not exists organisation_reference text,
  add column if not exists organisation_name text,
  add column if not exists legal_name text,
  add column if not exists organisation_type text,
  add column if not exists parent_organisation_id uuid references public.organisations(id) on delete set null,
  add column if not exists jurisdiction_code text,
  add column if not exists region_code text,
  add column if not exists primary_email citext,
  add column if not exists primary_phone text,
  add column if not exists website_url text,
  add column if not exists organisation_status text not null default 'active',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists organisations_reference_unique_idx
  on public.organisations (tenant_id, organisation_reference)
  where organisation_reference is not null;

create unique index if not exists organisations_name_unique_idx
  on public.organisations (tenant_id, organisation_name)
  where organisation_name is not null;

create index if not exists organisations_tenant_idx
  on public.organisations (tenant_id);

create index if not exists organisations_tenant_status_idx
  on public.organisations (tenant_id, organisation_status);

create index if not exists organisations_parent_idx
  on public.organisations (parent_organisation_id);
