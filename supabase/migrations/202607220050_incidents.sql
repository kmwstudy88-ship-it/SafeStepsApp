create table if not exists public.safety_incidents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_id uuid references public.cases(id) on delete cascade,
  incident_reference text not null,
  incident_type text not null,
  incident_severity text not null,
  incident_status text not null default 'open',
  occurred_at timestamptz not null,
  reported_at timestamptz not null default now(),
  reporter_user_id uuid references auth.users(id) on delete set null,
  incident_summary text not null,
  immediate_actions jsonb not null default '[]'::jsonb,
  mandatory_notification_required boolean not null default false,
  mandatory_notification_completed boolean not null default false,
  linked_evidence_ids uuid[] not null default '{}'::uuid[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, incident_reference)
);

create table if not exists public.mandatory_notifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  incident_id uuid references public.safety_incidents(id) on delete cascade,
  notification_type text not null,
  notified_party text not null,
  notification_reference text,
  notification_status text not null default 'required',
  due_at timestamptz,
  completed_at timestamptz,
  completed_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
