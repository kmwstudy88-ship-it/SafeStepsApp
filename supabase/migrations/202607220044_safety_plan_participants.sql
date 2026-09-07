create table if not exists public.safety_plan_participants (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  safety_plan_id uuid not null references public.safety_plans(id) on delete cascade,
  family_member_id uuid references public.family_members(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  participant_role text not null,
  participation_status text not null default 'active',
  visibility_scope text not null default 'worker',
  created_at timestamptz not null default now()
);

create table if not exists public.safety_goals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  safety_plan_id uuid not null references public.safety_plans(id) on delete cascade,
  goal_reference text not null,
  goal_title text not null,
  measurable_outcome text not null,
  owner_type text not null,
  owner_reference uuid,
  due_date date,
  evidence_required boolean not null default false,
  completion_percentage integer not null default 0,
  review_notes text,
  goal_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, goal_reference),
  constraint safety_goals_completion_check check (completion_percentage between 0 and 100)
);

create table if not exists public.safety_actions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  safety_plan_id uuid not null references public.safety_plans(id) on delete cascade,
  safety_goal_id uuid references public.safety_goals(id) on delete cascade,
  action_reference text not null,
  action_title text not null,
  action_type text not null,
  assigned_to_type text not null,
  assigned_to_reference uuid,
  due_at timestamptz,
  action_status text not null default 'open',
  evidence_required boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, action_reference)
);

create table if not exists public.safety_agreements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  safety_plan_id uuid not null references public.safety_plans(id) on delete cascade,
  agreement_type text not null,
  agreement_text text not null,
  agreed_by_user_id uuid references auth.users(id) on delete set null,
  agreed_at timestamptz,
  agreement_status text not null default 'proposed',
  created_at timestamptz not null default now()
);
