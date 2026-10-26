create table if not exists public.role_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role_definition_id uuid not null references public.role_definitions(id) on delete restrict,
  scope_type text not null,
  scope_reference uuid,
  assignment_status text not null default 'active',
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  assigned_by_user_id uuid references auth.users(id) on delete set null,
  assignment_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint role_assignments_period_check check (effective_to is null or effective_to > effective_from)
);

create index if not exists role_assignments_user_idx
  on public.role_assignments (user_id, assignment_status);

create index if not exists role_assignments_tenant_idx
  on public.role_assignments (tenant_id, assignment_status);

create index if not exists role_assignments_scope_idx
  on public.role_assignments (scope_type, scope_reference);
