create table if not exists public.safety_escalation_levels (
  escalation_level integer primary key,
  escalation_name text not null,
  escalation_description text not null,
  notification_due_minutes integer not null,
  acknowledgement_due_minutes integer not null,
  review_due_minutes integer not null,
  active boolean not null default true
);

create table if not exists public.safety_escalations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_id uuid references public.cases(id) on delete cascade,
  alert_id uuid references public.safety_alerts(id) on delete set null,
  crisis_event_id uuid references public.crisis_events(id) on delete set null,
  escalation_level integer not null references public.safety_escalation_levels(escalation_level) on delete restrict,
  escalation_status text not null default 'open',
  escalation_reason text not null,
  acknowledged_by_user_id uuid references auth.users(id) on delete set null,
  acknowledged_at timestamptz,
  review_due_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
