-- SafeSteps Personal AI Support: consent-led, minimum-necessary persistence.
-- Verbatim disclosures are deliberately excluded from ordinary chat storage.

create table if not exists public.personal_ai_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  purpose text not null check (purpose in ('ai_support','conversation_storage','human_handoff')),
  policy_version text not null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  expires_at timestamptz,
  unique (user_id, purpose, policy_version, granted_at)
);

create table if not exists public.personal_ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  current_flow_id text,
  current_state text not null default 'start' check (current_state in ('start','reflect','clarify','safety_check','support','escalate','document','close')),
  risk_level text not null default 'low' check (risk_level in ('low','medium','high','critical')),
  status text not null default 'active' check (status in ('active','completed','escalated','archived')),
  title text,
  retention_until timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
  ,legal_hold boolean not null default false
);

create table if not exists public.personal_ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.personal_ai_conversations(id) on delete cascade,
  sender text not null check (sender in ('user','assistant','system')),
  content text not null check (char_length(content) between 1 and 2000),
  risk_level text check (risk_level in ('low','medium','high','critical')),
  intent_label text,
  routing_confidence numeric(4,3) check (routing_confidence between 0 and 1),
  retention_until timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now()
  ,legal_hold boolean not null default false
);

create table if not exists public.personal_ai_interaction_notes (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.personal_ai_conversations(id) on delete cascade,
  flow_id text,
  risk_level text not null check (risk_level in ('low','medium','high','critical')),
  safety_check_result text check (char_length(safety_check_result) <= 500),
  actions_taken text[] not null default '{}',
  resources_offered text[] not null default '{}',
  escalation_status text not null default 'none',
  completion_state text,
  retention_until timestamptz not null default (now() + interval '90 days'),
  created_at timestamptz not null default now()
  ,legal_hold boolean not null default false
);

create table if not exists public.personal_ai_safety_events (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.personal_ai_conversations(id) on delete cascade,
  risk_level text not null check (risk_level in ('high','critical')),
  escalation_type text not null,
  immediate_risk boolean not null default false,
  signal_ids text[] not null default '{}',
  action_shown text not null check (char_length(action_shown) <= 1000),
  human_handoff_offered boolean not null default false,
  retention_until timestamptz not null default (now() + interval '365 days'),
  created_at timestamptz not null default now()
  ,legal_hold boolean not null default false
);

create table if not exists public.personal_ai_handoffs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid references public.personal_ai_conversations(id) on delete set null,
  flow_id text,
  reason_code text not null,
  summary text not null check (char_length(summary) <= 1000),
  urgency text not null check (urgency in ('low','medium','high','critical')),
  status text not null default 'queued' check (status in ('queued','assigned','in_review','resolved','escalated_to_emergency','closed')),
  assigned_to_user_id uuid references auth.users(id) on delete set null,
  user_consented_to_share boolean not null default false,
  automatic_emergency_dispatch boolean not null default false check (automatic_emergency_dispatch = false),
  retention_until timestamptz not null default (now() + interval '365 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
  ,legal_hold boolean not null default false
);

create table if not exists public.personal_ai_audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  retention_until timestamptz not null default (now() + interval '730 days'),
  created_at timestamptz not null default now()
  ,legal_hold boolean not null default false
);

create table if not exists public.personal_ai_retention_policies (
  table_name text primary key check (table_name in ('personal_ai_messages','personal_ai_interaction_notes','personal_ai_safety_events','personal_ai_handoffs','personal_ai_audit_logs')),
  retention_days integer not null check (retention_days between 1 and 3650),
  deletion_enabled boolean not null default false,
  policy_basis text not null,
  reviewed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.personal_ai_referrals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  stealth_label text not null default 'Support option',
  category text not null check (category in ('crisis','domestic_violence','child_protection','mental_health','substance_use','parenting_support','legal_support','family_support','housing','general')),
  jurisdiction text not null check (jurisdiction in ('AU_NSW','AU_VIC','AU_QLD','AU_WA','AU_SA','AU_TAS','AU_ACT','AU_NT','GLOBAL','OTHER')),
  description text not null,
  phone text,
  sms text,
  website text,
  email text,
  hours text,
  after_hours boolean not null default false,
  crisis_only boolean not null default false,
  safe_for_monitored_device boolean not null default false,
  language_tags text[] not null default '{en}',
  eligibility_notes text,
  keywords text[] not null default '{}',
  status text not null default 'pending_review' check (status in ('active','inactive','expired','pending_review')),
  source_url text not null,
  source_type text not null check (source_type in ('government','ngo','charity','clinic','helpline','internal')),
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  backup_owner_user_id uuid references auth.users(id) on delete set null,
  verified_by_user_id uuid references auth.users(id) on delete set null,
  second_approved_by_user_id uuid references auth.users(id) on delete set null,
  requires_two_person_approval boolean not null default false,
  review_frequency_days integer not null check (review_frequency_days between 1 and 365),
  last_verified_at timestamptz,
  next_review_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (phone is not null or sms is not null or website is not null or email is not null),
  check (not requires_two_person_approval or second_approved_by_user_id is null or second_approved_by_user_id <> verified_by_user_id)
);

create table if not exists public.personal_ai_referral_verifications (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null references public.personal_ai_referrals(id) on delete cascade,
  verified_by_user_id uuid not null references auth.users(id) on delete restrict,
  result text not null check (result in ('verified','updated','expired','inactive','invalid')),
  checks jsonb not null default '{}'::jsonb,
  notes text check (char_length(notes) <= 1000),
  verified_at timestamptz not null default now()
);

insert into public.personal_ai_retention_policies(table_name, retention_days, deletion_enabled, policy_basis) values
('personal_ai_messages', 30, false, 'Provisional minimum-necessary period; enable only after privacy and legal review.'),
('personal_ai_interaction_notes', 90, false, 'Provisional period pending safeguarding and jurisdiction review.'),
('personal_ai_safety_events', 365, false, 'Provisional period pending incident and safeguarding review.'),
('personal_ai_handoffs', 365, false, 'Provisional period pending service and legal review.'),
('personal_ai_audit_logs', 730, false, 'Provisional governance period pending privacy review.')
on conflict (table_name) do nothing;

create index if not exists personal_ai_conversations_owner_idx on public.personal_ai_conversations(user_id, updated_at desc);
create index if not exists personal_ai_messages_conversation_idx on public.personal_ai_messages(conversation_id, created_at);
create index if not exists personal_ai_handoffs_queue_idx on public.personal_ai_handoffs(status, urgency, created_at);
create index if not exists personal_ai_safety_events_conversation_idx on public.personal_ai_safety_events(conversation_id, created_at desc);
create index if not exists personal_ai_audit_target_idx on public.personal_ai_audit_logs(target_type, target_id, created_at desc);
create index if not exists personal_ai_referrals_lookup_idx on public.personal_ai_referrals(jurisdiction, category, status, next_review_at);
create index if not exists personal_ai_referral_verifications_idx on public.personal_ai_referral_verifications(referral_id, verified_at desc);

alter table public.personal_ai_consents enable row level security;
alter table public.personal_ai_conversations enable row level security;
alter table public.personal_ai_messages enable row level security;
alter table public.personal_ai_interaction_notes enable row level security;
alter table public.personal_ai_safety_events enable row level security;
alter table public.personal_ai_handoffs enable row level security;
alter table public.personal_ai_audit_logs enable row level security;
alter table public.personal_ai_retention_policies enable row level security;
alter table public.personal_ai_referrals enable row level security;
alter table public.personal_ai_referral_verifications enable row level security;

revoke all on public.personal_ai_consents, public.personal_ai_conversations, public.personal_ai_messages,
  public.personal_ai_interaction_notes, public.personal_ai_safety_events, public.personal_ai_handoffs,
  public.personal_ai_audit_logs from anon, authenticated;
revoke all on public.personal_ai_retention_policies from anon, authenticated;
revoke all on public.personal_ai_referrals, public.personal_ai_referral_verifications from anon, authenticated;
grant select, insert, update, delete on public.personal_ai_consents, public.personal_ai_conversations to authenticated;
grant select, insert, delete on public.personal_ai_messages to authenticated;
grant select on public.personal_ai_interaction_notes, public.personal_ai_safety_events to authenticated;
grant select, insert, update on public.personal_ai_handoffs to authenticated;
grant select on public.personal_ai_audit_logs to authenticated;
grant select, update on public.personal_ai_retention_policies to authenticated;
grant select, insert, update on public.personal_ai_referrals, public.personal_ai_referral_verifications to authenticated;

create policy personal_ai_consents_owner on public.personal_ai_consents for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy personal_ai_conversations_owner on public.personal_ai_conversations for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy personal_ai_messages_owner_read on public.personal_ai_messages for select to authenticated
using (exists (select 1 from public.personal_ai_conversations c where c.id = conversation_id and c.user_id = (select auth.uid())));
create policy personal_ai_messages_owner_insert on public.personal_ai_messages for insert to authenticated
with check (sender = 'user' and exists (select 1 from public.personal_ai_conversations c where c.id = conversation_id and c.user_id = (select auth.uid())));
create policy personal_ai_messages_owner_delete on public.personal_ai_messages for delete to authenticated
using (exists (select 1 from public.personal_ai_conversations c where c.id = conversation_id and c.user_id = (select auth.uid())));
create policy personal_ai_notes_owner_read on public.personal_ai_interaction_notes for select to authenticated
using (exists (select 1 from public.personal_ai_conversations c where c.id = conversation_id and c.user_id = (select auth.uid())));
create policy personal_ai_safety_events_owner on public.personal_ai_safety_events for select to authenticated
using (exists (select 1 from public.personal_ai_conversations c where c.id = conversation_id and c.user_id = (select auth.uid())));
create policy personal_ai_handoffs_owner_read on public.personal_ai_handoffs for select to authenticated
using (user_id = (select auth.uid()));
create policy personal_ai_handoffs_owner_insert on public.personal_ai_handoffs for insert to authenticated
with check (user_id = (select auth.uid()) and user_consented_to_share = true and automatic_emergency_dispatch = false);
create policy personal_ai_handoffs_assignee_read on public.personal_ai_handoffs for select to authenticated
using (assigned_to_user_id = (select auth.uid()) or public.current_user_has_role('admin'));
create policy personal_ai_handoffs_staff_update on public.personal_ai_handoffs for update to authenticated
using (assigned_to_user_id = (select auth.uid()) or public.current_user_has_role('admin'))
with check (assigned_to_user_id = (select auth.uid()) or public.current_user_has_role('admin'));
create policy personal_ai_audit_admin_read on public.personal_ai_audit_logs for select to authenticated
using (public.current_user_has_role('admin'));
create policy personal_ai_retention_admin_read on public.personal_ai_retention_policies for select to authenticated
using (public.current_user_has_role('admin'));
create policy personal_ai_retention_admin_update on public.personal_ai_retention_policies for update to authenticated
using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));
create policy personal_ai_referrals_verified_read on public.personal_ai_referrals for select to authenticated
using (status = 'active' and next_review_at >= now() and (not requires_two_person_approval or second_approved_by_user_id is not null));
create policy personal_ai_referrals_admin_read on public.personal_ai_referrals for select to authenticated
using (public.current_user_has_role('admin') or public.current_user_has_role('caseworker'));
create policy personal_ai_referrals_admin_insert on public.personal_ai_referrals for insert to authenticated
with check (public.current_user_has_role('admin'));
create policy personal_ai_referrals_admin_update on public.personal_ai_referrals for update to authenticated
using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));
create policy personal_ai_referral_verifications_staff_read on public.personal_ai_referral_verifications for select to authenticated
using (public.current_user_has_role('admin') or public.current_user_has_role('caseworker'));
create policy personal_ai_referral_verifications_admin_insert on public.personal_ai_referral_verifications for insert to authenticated
with check (public.current_user_has_role('admin') and verified_by_user_id = (select auth.uid()));

create schema if not exists private;
create or replace function private.purge_expired_personal_ai_records()
returns bigint
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare deleted_count bigint := 0; affected bigint;
begin
  delete from public.personal_ai_messages r using public.personal_ai_retention_policies p
    where p.table_name = 'personal_ai_messages' and p.deletion_enabled and not r.legal_hold and r.retention_until < now();
  get diagnostics affected = row_count; deleted_count := deleted_count + affected;
  delete from public.personal_ai_interaction_notes r using public.personal_ai_retention_policies p
    where p.table_name = 'personal_ai_interaction_notes' and p.deletion_enabled and not r.legal_hold and r.retention_until < now();
  get diagnostics affected = row_count; deleted_count := deleted_count + affected;
  delete from public.personal_ai_safety_events r using public.personal_ai_retention_policies p
    where p.table_name = 'personal_ai_safety_events' and p.deletion_enabled and not r.legal_hold and r.retention_until < now();
  get diagnostics affected = row_count; deleted_count := deleted_count + affected;
  delete from public.personal_ai_handoffs r using public.personal_ai_retention_policies p
    where p.table_name = 'personal_ai_handoffs' and p.deletion_enabled and not r.legal_hold and r.retention_until < now();
  get diagnostics affected = row_count; deleted_count := deleted_count + affected;
  delete from public.personal_ai_audit_logs r using public.personal_ai_retention_policies p
    where p.table_name = 'personal_ai_audit_logs' and p.deletion_enabled and not r.legal_hold and r.retention_until < now();
  get diagnostics affected = row_count; return deleted_count + affected;
end;
$$;
revoke all on function private.purge_expired_personal_ai_records() from public, anon, authenticated;
grant execute on function private.purge_expired_personal_ai_records() to service_role;

comment on table public.personal_ai_messages is 'Consent-led short-retention AI support messages. Do not store raw duplicate content or verbatim safeguarding disclosures.';
comment on table public.personal_ai_handoffs is 'Human review queue only. The database constraint prohibits automatic emergency dispatch.';
