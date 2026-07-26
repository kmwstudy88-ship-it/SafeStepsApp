-- SafeSteps identity-security operations foundation.
-- Completes the operational security tables from the identity/RBAC layer after
-- the tenant, role, case-participant, and report foundations are in place.

create extension if not exists pgcrypto;

create table if not exists public.child_record_safety_overrides (
  id uuid primary key default gen_random_uuid(),
  child_private_record_id uuid not null references public.child_private_records(id) on delete restrict,
  authorised_user_id uuid not null references auth.users(id) on delete restrict,
  authority_type text not null,
  reason text not null,
  information_scope text not null,
  access_expires_at timestamptz,
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.case_transfers (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete restrict,
  from_organisation_id uuid references public.organisations(id) on delete restrict,
  to_organisation_id uuid references public.organisations(id) on delete restrict,
  from_worker_id uuid references auth.users(id) on delete set null,
  to_worker_id uuid references auth.users(id) on delete set null,
  transfer_reason text not null,
  transfer_scope text not null,
  status text not null default 'requested',
  requested_by uuid references auth.users(id) on delete set null,
  approved_by_from uuid references auth.users(id) on delete set null,
  approved_by_to uuid references auth.users(id) on delete set null,
  effective_at timestamptz,
  created_at timestamptz not null default now(),
  constraint case_transfers_status check (
    status in (
      'requested','reviewing','approved','rejected','scheduled',
      'completed','cancelled'
    )
  )
);

create table if not exists public.staff_offboarding_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  organisation_id uuid not null references public.organisations(id) on delete restrict,
  reason text not null,
  effective_at timestamptz not null,
  sessions_revoked boolean not null default false,
  assignments_removed boolean not null default false,
  tasks_reassigned boolean not null default false,
  tokens_revoked boolean not null default false,
  export_links_revoked boolean not null default false,
  completed_by uuid references auth.users(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.account_recovery_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  recovery_method text not null,
  status text not null default 'started',
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  risk_score numeric(5,2),
  additional_verification_required boolean not null default false,
  assisted_by uuid references auth.users(id) on delete set null,
  failure_reason text,
  metadata jsonb not null default '{}'::jsonb,
  constraint account_recovery_events_status_valid check (
    status in ('started','additional_verification','approved','rejected','completed','failed','cancelled')
  )
);

create table if not exists public.user_security_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  auth_session_reference text not null,
  device_reference text,
  platform text,
  client_version text,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz,
  revoked_at timestamptz,
  revocation_reason text,
  high_risk boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.signed_resource_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_type text not null,
  resource_id uuid not null,
  purpose text not null,
  action text not null,
  token_hash text not null,
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz,
  revoked_at timestamptz,
  issued_by_service text not null,
  constraint signed_resource_access_expiry check (expires_at > issued_at)
);

create unique index if not exists signed_resource_access_token_hash_unique
  on public.signed_resource_access(token_hash);

create table if not exists public.service_accounts (
  id uuid primary key default gen_random_uuid(),
  account_code text not null unique,
  name text not null,
  service_type text not null,
  status text not null default 'active',
  allowed_actions text[] not null default '{}',
  allowed_resource_types text[] not null default '{}',
  credential_rotated_at timestamptz,
  credential_expires_at timestamptz,
  created_at timestamptz not null default now(),
  constraint service_accounts_status_valid check (
    status in ('active','paused','rotating','expired','revoked','retired')
  )
);

create table if not exists public.access_review_campaigns (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  campaign_name text not null,
  review_scope text[] not null,
  status text not null default 'draft',
  starts_at timestamptz,
  due_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint access_review_campaigns_status_valid check (
    status in ('draft','scheduled','active','completed','cancelled')
  )
);

create table if not exists public.access_review_items (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.access_review_campaigns(id) on delete cascade,
  subject_user_id uuid references auth.users(id) on delete cascade,
  access_type text not null,
  access_reference_id uuid not null,
  current_access jsonb not null,
  review_status text not null default 'pending',
  reviewer_user_id uuid references auth.users(id) on delete set null,
  decision text,
  decision_reason text,
  reviewed_at timestamptz,
  constraint access_review_items_status_valid check (
    review_status in ('pending','reviewing','approved','revoked','changed','deferred')
  )
);

create table if not exists public.security_access_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  organisation_id uuid references public.organisations(id) on delete set null,
  alert_type text not null,
  severity text not null,
  description text not null,
  detection_data jsonb not null default '{}'::jsonb,
  status text not null default 'open',
  assigned_to uuid references auth.users(id) on delete set null,
  resolution text,
  resolved_at timestamptz,
  detected_at timestamptz not null default now(),
  constraint security_access_alerts_severity_valid check (
    severity in ('low','medium','high','critical')
  ),
  constraint security_access_alerts_status_valid check (
    status in ('open','triaged','investigating','resolved','dismissed')
  )
);

create table if not exists public.data_classifications (
  code text primary key,
  name text not null,
  description text not null,
  default_controls jsonb not null
);

create index if not exists idx_case_transfers_case_created
  on public.case_transfers(case_id, created_at desc);
create index if not exists idx_staff_offboarding_user_org
  on public.staff_offboarding_events(user_id, organisation_id);
create index if not exists idx_user_security_sessions_user_seen
  on public.user_security_sessions(user_id, last_seen_at desc);
create index if not exists idx_signed_resource_access_user_resource
  on public.signed_resource_access(user_id, resource_type, resource_id);
create index if not exists idx_access_review_items_campaign_status
  on public.access_review_items(campaign_id, review_status);
create index if not exists idx_security_access_alerts_org_status
  on public.security_access_alerts(organisation_id, status, detected_at desc);

create or replace function public.safesteps_can_admin_organisation(
  p_user_id uuid,
  p_organisation_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_resource_permission(p_user_id, 'organisation', p_organisation_id, 'organisation.manage')
    or public.has_resource_permission(p_user_id, 'organisation', p_organisation_id, 'security.manage')
    or exists (
      select 1
      from public.user_role_assignments ura
      join public.security_roles sr on sr.id = ura.role_id
      where ura.user_id = p_user_id
        and ura.organisation_id = p_organisation_id
        and ura.status = 'active'
        and sr.role_code in ('organisation_admin','security_admin')
        and (ura.starts_at is null or ura.starts_at <= now())
        and (ura.ends_at is null or ura.ends_at > now())
    );
$$;

revoke all on function public.safesteps_can_admin_organisation(uuid, uuid) from public;
grant execute on function public.safesteps_can_admin_organisation(uuid, uuid) to authenticated;

alter table public.child_record_safety_overrides enable row level security;
alter table public.case_transfers enable row level security;
alter table public.staff_offboarding_events enable row level security;
alter table public.account_recovery_events enable row level security;
alter table public.user_security_sessions enable row level security;
alter table public.signed_resource_access enable row level security;
alter table public.service_accounts enable row level security;
alter table public.access_review_campaigns enable row level security;
alter table public.access_review_items enable row level security;
alter table public.security_access_alerts enable row level security;
alter table public.data_classifications enable row level security;

drop policy if exists child_record_safety_overrides_read on public.child_record_safety_overrides;
create policy child_record_safety_overrides_read on public.child_record_safety_overrides
for select to authenticated
using (
  authorised_user_id = (select auth.uid())
  or approved_by = (select auth.uid())
  or exists (
    select 1
    from public.child_private_records cpr
    where cpr.id = child_record_safety_overrides.child_private_record_id
      and cpr.case_id is not null
      and public.has_case_permission((select auth.uid()), cpr.case_id, 'child_record.read_private')
  )
);

drop policy if exists child_record_safety_overrides_insert on public.child_record_safety_overrides;
create policy child_record_safety_overrides_insert on public.child_record_safety_overrides
for insert to authenticated
with check (
  authorised_user_id = (select auth.uid())
  and exists (
    select 1
    from public.child_private_records cpr
    where cpr.id = child_record_safety_overrides.child_private_record_id
      and cpr.case_id is not null
      and public.has_case_permission((select auth.uid()), cpr.case_id, 'child_record.read_private')
  )
);

drop policy if exists case_transfers_case_authorised_read on public.case_transfers;
create policy case_transfers_case_authorised_read on public.case_transfers
for select to authenticated
using (
  requested_by = (select auth.uid())
  or approved_by_from = (select auth.uid())
  or approved_by_to = (select auth.uid())
  or public.has_case_permission((select auth.uid()), case_id, 'case.read')
);

drop policy if exists case_transfers_case_authorised_insert on public.case_transfers;
create policy case_transfers_case_authorised_insert on public.case_transfers
for insert to authenticated
with check (
  requested_by = (select auth.uid())
  and public.has_case_permission((select auth.uid()), case_id, 'case.transfer')
);

drop policy if exists staff_offboarding_admin_read on public.staff_offboarding_events;
create policy staff_offboarding_admin_read on public.staff_offboarding_events
for select to authenticated
using (
  user_id = (select auth.uid())
  or completed_by = (select auth.uid())
  or public.safesteps_can_admin_organisation((select auth.uid()), organisation_id)
);

drop policy if exists account_recovery_self_or_assistant_read on public.account_recovery_events;
create policy account_recovery_self_or_assistant_read on public.account_recovery_events
for select to authenticated
using (
  user_id = (select auth.uid())
  or assisted_by = (select auth.uid())
);

drop policy if exists user_security_sessions_self_read on public.user_security_sessions;
create policy user_security_sessions_self_read on public.user_security_sessions
for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists user_security_sessions_self_update on public.user_security_sessions;
create policy user_security_sessions_self_update on public.user_security_sessions
for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists signed_resource_access_self_read on public.signed_resource_access;
create policy signed_resource_access_self_read on public.signed_resource_access
for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists service_accounts_security_admin_read on public.service_accounts;
create policy service_accounts_security_admin_read on public.service_accounts
for select to authenticated
using (
  exists (
    select 1
    from public.user_role_assignments ura
    join public.security_roles sr on sr.id = ura.role_id
    where ura.user_id = (select auth.uid())
      and ura.status = 'active'
      and sr.role_code = 'security_admin'
      and (ura.starts_at is null or ura.starts_at <= now())
      and (ura.ends_at is null or ura.ends_at > now())
  )
);

drop policy if exists access_review_campaigns_admin_read on public.access_review_campaigns;
create policy access_review_campaigns_admin_read on public.access_review_campaigns
for select to authenticated
using (
  created_by = (select auth.uid())
  or public.safesteps_can_admin_organisation((select auth.uid()), organisation_id)
);

drop policy if exists access_review_items_reviewer_read on public.access_review_items;
create policy access_review_items_reviewer_read on public.access_review_items
for select to authenticated
using (
  subject_user_id = (select auth.uid())
  or reviewer_user_id = (select auth.uid())
  or exists (
    select 1
    from public.access_review_campaigns arc
    where arc.id = access_review_items.campaign_id
      and public.safesteps_can_admin_organisation((select auth.uid()), arc.organisation_id)
  )
);

drop policy if exists security_access_alerts_admin_read on public.security_access_alerts;
create policy security_access_alerts_admin_read on public.security_access_alerts
for select to authenticated
using (
  assigned_to = (select auth.uid())
  or (
    organisation_id is not null
    and public.safesteps_can_admin_organisation((select auth.uid()), organisation_id)
  )
);

drop policy if exists data_classifications_read on public.data_classifications;
create policy data_classifications_read on public.data_classifications
for select to authenticated
using (true);

insert into public.security_permissions (permission_code, description, resource_type, action, risk_level)
values
  ('organisation.manage', 'Manage organisation-scoped settings and membership operations.', 'organisation', 'manage', 'high_impact'),
  ('security.manage', 'Manage security administration, service accounts, and access reviews.', 'security', 'manage', 'high_impact'),
  ('case.transfer', 'Request and approve controlled case transfers.', 'case', 'transfer', 'high_impact'),
  ('emergency_access.create', 'Create limited emergency access with justification and audit.', 'emergency_access', 'create', 'high_impact'),
  ('signed_access.issue', 'Issue purpose-bound signed resource access.', 'signed_access', 'issue', 'high_impact'),
  ('access_review.manage', 'Create and resolve access review campaigns.', 'access_review', 'manage', 'high_impact')
on conflict (permission_code) do nothing;

insert into public.data_classifications (code, name, description, default_controls)
values
  ('public', 'Public', 'Information approved for public release.', '{"rls_required": false, "export_review": false}'::jsonb),
  ('internal', 'Internal', 'Operational information for authorised SafeSteps users.', '{"rls_required": true, "export_review": false}'::jsonb),
  ('confidential', 'Confidential', 'Case or organisational information requiring scoped access.', '{"rls_required": true, "export_review": true}'::jsonb),
  ('sensitive', 'Sensitive', 'Evidence, assessment, or wellbeing information requiring purpose-bound access.', '{"rls_required": true, "export_review": true, "audit_access": true}'::jsonb),
  ('highly_sensitive', 'Highly Sensitive', 'High-impact safety, legal, health, or family violence information.', '{"rls_required": true, "export_review": true, "audit_access": true, "reauthentication": true}'::jsonb),
  ('legally_restricted', 'Legally Restricted', 'Information subject to legal, court, or records-governance restrictions.', '{"rls_required": true, "export_review": true, "legal_review": true, "reauthentication": true}'::jsonb),
  ('child_private', 'Child Private', 'Child-owned or child-private information with independent visibility controls.', '{"rls_required": true, "child_visibility_required": true, "parent_access_default": false, "safety_override_only": true}'::jsonb)
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description,
  default_controls = excluded.default_controls;

insert into public.service_accounts (
  account_code,
  name,
  service_type,
  allowed_actions,
  allowed_resource_types
)
values
  ('workflow-worker', 'Workflow Worker', 'background_worker', array['workflow.advance','workflow.repair'], array['workflow','case_task']),
  ('evidence-processor', 'Evidence Processor', 'background_worker', array['evidence.process','evidence.hash'], array['evidence','file']),
  ('notification-sender', 'Notification Sender', 'messaging_worker', array['notification.send'], array['notification']),
  ('report-generator', 'Report Generator', 'background_worker', array['report.draft','report.render'], array['report','evidence_manifest']),
  ('projection-builder', 'Projection Builder', 'background_worker', array['projection.refresh'], array['reporting_projection','metrics']),
  ('integrity-checker', 'Integrity Checker', 'background_worker', array['integrity.verify','hash.verify'], array['evidence','report','file'])
on conflict (account_code) do update
set
  name = excluded.name,
  service_type = excluded.service_type,
  allowed_actions = excluded.allowed_actions,
  allowed_resource_types = excluded.allowed_resource_types;
