create table if not exists public.worker_teams (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  team_reference text not null,
  team_name text not null,
  team_description text,
  team_type text not null,
  team_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, team_reference),
  unique (organisation_id, team_name)
);

create table if not exists public.worker_team_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  team_id uuid not null references public.worker_teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  team_role text not null,
  membership_status text not null default 'active',
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists worker_team_memberships_active_idx
  on public.worker_team_memberships (team_id, user_id, team_role)
  where membership_status = 'active' and effective_to is null;
