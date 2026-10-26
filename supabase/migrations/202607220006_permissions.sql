create table if not exists public.permission_definitions (
  id uuid primary key default gen_random_uuid(),
  permission_code text not null unique,
  permission_name text not null,
  permission_description text not null,
  permission_domain text not null,
  action_type text not null,
  sensitive_permission boolean not null default false,
  tenant_assignable boolean not null default true,
  requires_reason boolean not null default false,
  requires_step_up_authentication boolean not null default false,
  lifecycle_status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.role_definitions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.platform_tenants(id) on delete cascade,
  role_code text not null,
  role_name text not null,
  role_description text not null,
  role_category text not null,
  system_role boolean not null default false,
  tenant_customisable boolean not null default true,
  lifecycle_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint role_definitions_unique unique (tenant_id, role_code)
);

create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_definition_id uuid not null references public.role_definitions(id) on delete cascade,
  permission_definition_id uuid not null references public.permission_definitions(id) on delete cascade,
  permission_scope jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint role_permissions_unique unique (role_definition_id, permission_definition_id)
);

alter table public.role_permissions
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists role_definition_id uuid references public.role_definitions(id) on delete cascade,
  add column if not exists permission_definition_id uuid references public.permission_definitions(id) on delete cascade,
  add column if not exists permission_scope jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now();

create unique index if not exists role_permissions_canonical_unique_idx
  on public.role_permissions (role_definition_id, permission_definition_id)
  where role_definition_id is not null
    and permission_definition_id is not null;
