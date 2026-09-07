begin;

create table if not exists public.personal_ai_incidents (
  id uuid primary key default gen_random_uuid(),
  severity text not null check (severity in ('sev1','sev2','sev3','sev4')),
  title text not null check (char_length(title) between 5 and 200),
  summary text not null check (char_length(summary) between 10 and 2000),
  status text not null default 'open' check (status in ('open','contained','remediating','verified','closed')),
  affected_component text not null,
  user_impact text not null check (char_length(user_impact) <= 2000),
  detected_source text not null check (detected_source in ('automated_test','validator','staff_report','user_complaint','audit_review','monitoring','referral_verification','safety_event','other')),
  incident_commander_user_id uuid references auth.users(id) on delete set null,
  safeguarding_lead_user_id uuid references auth.users(id) on delete set null,
  engineering_lead_user_id uuid references auth.users(id) on delete set null,
  privacy_lead_user_id uuid references auth.users(id) on delete set null,
  containment_actions text[] not null default '{}',
  root_cause text,
  remediation_actions text[] not null default '{}',
  regression_tests_added text[] not null default '{}',
  reviewer_signoff text[] not null default '{}',
  mandatory_reporting_review_required boolean not null default false,
  privacy_review_required boolean not null default false,
  flow_disabled boolean not null default false,
  fallback_forced boolean not null default false,
  detected_by uuid not null references auth.users(id) on delete restrict,
  detected_at timestamptz not null default now(),
  contained_at timestamptz,
  verified_at timestamptz,
  closed_at timestamptz,
  updated_at timestamptz not null default now(),
  retention_until timestamptz not null default (now() + interval '7 years'),
  legal_hold boolean not null default true
);

create table if not exists public.personal_ai_incident_evidence (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.personal_ai_incidents(id) on delete restrict,
  evidence_type text not null check (evidence_type in ('request_id','conversation_id','flow_id','model_response_id','classification','validator','handoff','referral_change','staff_action','screenshot_reference','other')),
  reference_value text not null check (char_length(reference_value) <= 500),
  details jsonb not null default '{}'::jsonb,
  recorded_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.personal_ai_incident_actions (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.personal_ai_incidents(id) on delete restrict,
  action_type text not null check (action_type in ('detected','triaged','contained','access_restricted','fallback_forced','flow_disabled','referral_disabled','rollback','remediation','verification','communication','status_change','post_incident_review')),
  description text not null check (char_length(description) between 3 and 2000),
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists personal_ai_incidents_queue_idx on public.personal_ai_incidents(status,severity,detected_at);
create index if not exists personal_ai_incident_evidence_idx on public.personal_ai_incident_evidence(incident_id,created_at);
create index if not exists personal_ai_incident_actions_idx on public.personal_ai_incident_actions(incident_id,created_at);

alter table public.personal_ai_incidents enable row level security;
alter table public.personal_ai_incident_evidence enable row level security;
alter table public.personal_ai_incident_actions enable row level security;
revoke all on public.personal_ai_incidents, public.personal_ai_incident_evidence, public.personal_ai_incident_actions from anon, authenticated;
grant select,insert,update on public.personal_ai_incidents to authenticated;
grant select,insert on public.personal_ai_incident_evidence, public.personal_ai_incident_actions to authenticated;

create policy personal_ai_incidents_team_read on public.personal_ai_incidents for select to authenticated
using (public.current_user_has_role('admin') or public.current_user_has_role('caseworker'));
create policy personal_ai_incidents_staff_report on public.personal_ai_incidents for insert to authenticated
with check ((public.current_user_has_role('admin') or public.current_user_has_role('caseworker')) and detected_by = (select auth.uid()) and status = 'open');
create policy personal_ai_incidents_admin_update on public.personal_ai_incidents for update to authenticated
using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));
create policy personal_ai_incident_evidence_team_read on public.personal_ai_incident_evidence for select to authenticated
using (public.current_user_has_role('admin') or public.current_user_has_role('caseworker'));
create policy personal_ai_incident_evidence_team_insert on public.personal_ai_incident_evidence for insert to authenticated
with check ((public.current_user_has_role('admin') or public.current_user_has_role('caseworker')) and recorded_by = (select auth.uid()));
create policy personal_ai_incident_actions_team_read on public.personal_ai_incident_actions for select to authenticated
using (public.current_user_has_role('admin') or public.current_user_has_role('caseworker'));
create policy personal_ai_incident_actions_admin_insert on public.personal_ai_incident_actions for insert to authenticated
with check (public.current_user_has_role('admin') and actor_user_id = (select auth.uid()));

comment on table public.personal_ai_incidents is 'Restricted incident register. Preserve evidence, store minimum necessary content, and never use this table for automatic emergency dispatch.';
commit;
