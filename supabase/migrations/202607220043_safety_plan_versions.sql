create table if not exists public.safety_plan_versions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  safety_plan_id uuid not null references public.safety_plans(id) on delete cascade,
  version_number integer not null,
  version_status text not null default 'draft',
  plan_snapshot jsonb not null default '{}'::jsonb,
  parent_actions jsonb not null default '[]'::jsonb,
  worker_actions jsonb not null default '[]'::jsonb,
  emergency_actions jsonb not null default '[]'::jsonb,
  approval_history jsonb not null default '[]'::jsonb,
  created_by_user_id uuid references auth.users(id) on delete set null,
  approved_by_user_id uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  unique (safety_plan_id, version_number)
);

alter table public.safety_plans add column if not exists active_version_id uuid;
alter table public.safety_plans drop constraint if exists safety_plans_active_version_id_fkey;
alter table public.safety_plans
  add constraint safety_plans_active_version_id_fkey
  foreign key (active_version_id) references public.safety_plan_versions(id) on delete set null not valid;
