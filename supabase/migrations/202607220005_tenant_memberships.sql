create table if not exists public.tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  organisation_id uuid references public.organisations(id) on delete set null,
  membership_type text not null,
  access_scope jsonb not null default '{}'::jsonb,
  membership_status text not null default 'active',
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  invited_by_user_id uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  suspended_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tenant_memberships_period_check check (effective_to is null or effective_to > effective_from)
);

create index if not exists tenant_memberships_user_idx
  on public.tenant_memberships (user_id, membership_status);

create index if not exists tenant_memberships_tenant_idx
  on public.tenant_memberships (tenant_id, membership_status);

create index if not exists tenant_memberships_org_idx
  on public.tenant_memberships (organisation_id, membership_status);

create unique index if not exists tenant_memberships_one_active_type_idx
  on public.tenant_memberships (
    tenant_id,
    user_id,
    coalesce(organisation_id, '00000000-0000-0000-0000-000000000000'::uuid),
    membership_type
  )
  where membership_status = 'active' and revoked_at is null;
