create extension if not exists pgcrypto;

alter table public.organisations
  add column if not exists organisation_name text,
  add column if not exists legal_entity_name text,
  add column if not exists registration_number text,
  add column if not exists jurisdiction_codes text[] not null default '{}',
  add column if not exists service_regions text[] not null default '{}',
  add column if not exists contact_email text,
  add column if not exists contact_phone text,
  add column if not exists website_reference text,
  add column if not exists primary_address jsonb,
  add column if not exists operating_hours jsonb not null default '{}'::jsonb,
  add column if not exists active boolean not null default true;

update public.organisations
set organisation_name = coalesce(organisation_name, name)
where organisation_name is null;

alter table public.families
  add column if not exists family_display_name text,
  add column if not exists primary_language_code text not null default 'en-AU',
  add column if not exists interpreter_required boolean not null default false,
  add column if not exists cultural_identity_preferences jsonb not null default '{}'::jsonb,
  add column if not exists accessibility_requirements jsonb not null default '{}'::jsonb,
  add column if not exists primary_contact_method text,
  add column if not exists unsafe_contact_methods text[] not null default '{}',
  add column if not exists household_summary jsonb not null default '{}'::jsonb;

update public.families
set family_display_name = coalesce(family_display_name, display_name)
where family_display_name is null;

alter table public.family_members
  add column if not exists person_type text,
  add column if not exists person_reference text,
  add column if not exists family_role text,
  add column if not exists household_member boolean not null default false,
  add column if not exists legal_parent_or_guardian boolean not null default false,
  add column if not exists decision_making_authority text,
  add column if not exists contact_restrictions jsonb not null default '{}'::jsonb,
  add column if not exists active_from date,
  add column if not exists active_until date;

alter table public.cases
  add column if not exists organisation_unit_id uuid,
  add column if not exists service_program_id uuid,
  add column if not exists source_referral_id uuid,
  add column if not exists case_purpose text,
  add column if not exists jurisdiction_code text,
  add column if not exists legal_status text,
  add column if not exists priority_level text not null default 'standard',
  add column if not exists expected_end_at timestamptz,
  add column if not exists closure_reason text;

create table if not exists public.organisation_units (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  parent_unit_id uuid references public.organisation_units(id) on delete set null,
  unit_code text not null,
  unit_name text not null,
  unit_type text not null,
  jurisdiction_code text,
  service_region text,
  address jsonb,
  contact_details jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organisation_id, unit_code)
);

create table if not exists public.service_programs (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  program_code text not null,
  program_name text not null,
  program_description text not null,
  service_type text not null,
  target_groups text[] not null default '{}',
  eligibility_rules jsonb not null default '{}'::jsonb,
  exclusion_rules jsonb not null default '{}'::jsonb,
  minimum_duration_days integer,
  maximum_duration_days integer,
  funded_capacity integer,
  self_referral_allowed boolean not null default false,
  court_referral_allowed boolean not null default true,
  child_protection_referral_allowed boolean not null default true,
  active_from date,
  active_until date,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (organisation_id, program_code)
);

alter table public.cases
  drop constraint if exists cases_organisation_unit_id_fkey,
  drop constraint if exists cases_service_program_id_fkey,
  drop constraint if exists cases_source_referral_id_fkey;

alter table public.cases
  add constraint cases_organisation_unit_id_fkey foreign key (organisation_unit_id) references public.organisation_units(id) on delete set null not valid,
  add constraint cases_service_program_id_fkey foreign key (service_program_id) references public.service_programs(id) on delete set null not valid;

create table if not exists public.staff_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  organisation_unit_id uuid references public.organisation_units(id) on delete set null,
  staff_reference text not null unique,
  display_name text not null,
  staff_role text not null,
  professional_registration text,
  qualification_summary jsonb not null default '[]'::jsonb,
  specialist_capabilities text[] not null default '{}',
  language_capabilities text[] not null default '{}',
  employment_status text not null default 'active',
  availability_status text not null default 'available',
  maximum_active_cases integer,
  started_at date,
  ended_at date,
  created_at timestamptz not null default now()
);

create table if not exists public.case_teams (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  organisation_unit_id uuid references public.organisation_units(id) on delete set null,
  team_code text not null,
  team_name text not null,
  team_type text not null,
  service_program_ids uuid[] not null default '{}',
  specialist_domains text[] not null default '{}',
  supervisor_user_id uuid references auth.users(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organisation_id, team_code)
);

create table if not exists public.case_team_memberships (
  id uuid primary key default gen_random_uuid(),
  case_team_id uuid not null references public.case_teams(id) on delete cascade,
  staff_profile_id uuid not null references public.staff_profiles(id) on delete cascade,
  team_role text not null,
  allocation_weight numeric not null default 1,
  may_receive_urgent_cases boolean not null default false,
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  active boolean not null default true,
  unique (case_team_id, staff_profile_id, team_role)
);

create table if not exists public.referring_parties (
  id uuid primary key default gen_random_uuid(),
  party_reference text not null unique,
  party_type text not null,
  organisation_name text,
  person_name text,
  professional_role text,
  phone_number text,
  email_address text,
  address jsonb,
  identity_verified boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.case_referrals (
  id uuid primary key default gen_random_uuid(),
  referral_reference text not null unique,
  referring_party_id uuid references public.referring_parties(id) on delete set null,
  receiving_organisation_id uuid not null references public.organisations(id) on delete cascade,
  requested_service_program_id uuid references public.service_programs(id) on delete set null,
  referral_type text not null,
  referral_source text not null,
  family_reference text,
  parent_references jsonb not null default '[]'::jsonb,
  child_references jsonb not null default '[]'::jsonb,
  referral_reason text not null,
  presenting_needs jsonb not null default '[]'::jsonb,
  known_safety_concerns jsonb not null default '[]'::jsonb,
  urgency_level text not null default 'routine',
  legal_or_court_reference text,
  consent_status text not null default 'unknown',
  received_at timestamptz not null default now(),
  required_response_at timestamptz,
  status text not null default 'received'
);

alter table public.cases
  add constraint cases_source_referral_id_fkey foreign key (source_referral_id) references public.case_referrals(id) on delete set null not valid;

create table if not exists public.case_referral_documents (
  id uuid primary key default gen_random_uuid(),
  case_referral_id uuid not null references public.case_referrals(id) on delete cascade,
  document_type text not null,
  document_title text not null,
  evidence_item_id uuid references public.evidence_items(id) on delete set null,
  case_document_id uuid references public.case_documents(id) on delete set null,
  document_reference text,
  received_at timestamptz not null default now(),
  verified boolean not null default false,
  required_for_intake boolean not null default false
);

create table if not exists public.case_referral_screenings (
  id uuid primary key default gen_random_uuid(),
  case_referral_id uuid not null unique references public.case_referrals(id) on delete cascade,
  screened_by_user_id uuid references auth.users(id) on delete set null,
  immediate_safety_screen_status text not null,
  service_eligibility_status text not null,
  jurisdiction_status text not null,
  capacity_status text not null,
  missing_information jsonb not null default '[]'::jsonb,
  identified_conflicts jsonb not null default '[]'::jsonb,
  recommended_disposition text not null,
  screening_reason text not null,
  screened_at timestamptz not null default now()
);

create table if not exists public.case_referral_decisions (
  id uuid primary key default gen_random_uuid(),
  case_referral_id uuid not null references public.case_referrals(id) on delete cascade,
  decision text not null,
  decision_reason text not null,
  offered_service_program_id uuid references public.service_programs(id) on delete set null,
  alternative_service_references jsonb not null default '[]'::jsonb,
  decision_made_by_user_id uuid references auth.users(id) on delete set null,
  supervisor_approval_required boolean not null default false,
  supervisor_approved_by_user_id uuid references auth.users(id) on delete set null,
  decided_at timestamptz not null default now()
);

create table if not exists public.case_allocations_v19 (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  allocated_to_user_id uuid references auth.users(id) on delete set null,
  allocated_to_team_id uuid references public.case_teams(id) on delete set null,
  allocation_role text not null,
  primary_allocation boolean not null default false,
  allocation_percentage numeric,
  allocation_reason text not null,
  allocated_by_user_id uuid references auth.users(id) on delete set null,
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  status text not null default 'active',
  constraint case_allocations_v19_assignee_present check (allocated_to_user_id is not null or allocated_to_team_id is not null)
);

create table if not exists public.case_allocation_history_v19 (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  previous_allocation_id uuid references public.case_allocations_v19(id) on delete set null,
  new_allocation_id uuid references public.case_allocations_v19(id) on delete set null,
  change_type text not null,
  change_reason text not null,
  continuity_risk_identified boolean not null default false,
  family_notified boolean not null default false,
  changed_by_user_id uuid references auth.users(id) on delete set null,
  changed_at timestamptz not null default now()
);

create table if not exists public.case_handover_records (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  outgoing_user_id uuid references auth.users(id) on delete set null,
  incoming_user_id uuid references auth.users(id) on delete set null,
  handover_reason text not null,
  current_case_summary text not null,
  current_safety_summary text not null,
  current_plan_summary text not null,
  urgent_actions jsonb not null default '[]'::jsonb,
  upcoming_deadlines jsonb not null default '[]'::jsonb,
  unresolved_disputes jsonb not null default '[]'::jsonb,
  parent_view_summary text,
  child_view_summary text,
  outgoing_acknowledged_at timestamptz,
  incoming_acknowledged_at timestamptz,
  handover_completed_at timestamptz
);

create table if not exists public.case_plans (
  id uuid primary key default gen_random_uuid(),
  plan_reference text not null unique,
  case_id uuid not null references public.cases(id) on delete cascade,
  plan_version integer not null,
  plan_title text not null,
  plan_purpose text not null,
  current_strengths jsonb not null default '[]'::jsonb,
  identified_needs jsonb not null default '[]'::jsonb,
  current_risks jsonb not null default '[]'::jsonb,
  family_priorities jsonb not null default '[]'::jsonb,
  child_priorities jsonb not null default '[]'::jsonb,
  worker_priorities jsonb not null default '[]'::jsonb,
  planned_outcomes jsonb not null default '[]'::jsonb,
  created_with_family boolean not null default false,
  family_disagreement_recorded boolean not null default false,
  effective_from date not null,
  review_due_at timestamptz,
  status text not null default 'draft',
  approved_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (case_id, plan_version)
);

alter table public.case_plans add column if not exists plan_reference text;
alter table public.case_plans add column if not exists case_id uuid references public.cases(id) on delete cascade;
alter table public.case_plans add column if not exists plan_version integer not null default 1;
alter table public.case_plans add column if not exists plan_title text;
alter table public.case_plans add column if not exists plan_purpose text;
alter table public.case_plans add column if not exists current_strengths jsonb not null default '[]'::jsonb;
alter table public.case_plans add column if not exists identified_needs jsonb not null default '[]'::jsonb;
alter table public.case_plans add column if not exists current_risks jsonb not null default '[]'::jsonb;
alter table public.case_plans add column if not exists family_priorities jsonb not null default '[]'::jsonb;
alter table public.case_plans add column if not exists child_priorities jsonb not null default '[]'::jsonb;
alter table public.case_plans add column if not exists worker_priorities jsonb not null default '[]'::jsonb;
alter table public.case_plans add column if not exists planned_outcomes jsonb not null default '[]'::jsonb;
alter table public.case_plans add column if not exists created_with_family boolean not null default false;
alter table public.case_plans add column if not exists family_disagreement_recorded boolean not null default false;
alter table public.case_plans add column if not exists effective_from date;
alter table public.case_plans add column if not exists review_due_at timestamptz;
alter table public.case_plans add column if not exists status text not null default 'draft';
alter table public.case_plans add column if not exists approved_by_user_id uuid references auth.users(id) on delete set null;
alter table public.case_plans add column if not exists created_at timestamptz not null default now();
create unique index if not exists case_plans_plan_reference_unique
  on public.case_plans(plan_reference)
  where plan_reference is not null;
create unique index if not exists case_plans_case_version_unique
  on public.case_plans(case_id, plan_version)
  where case_id is not null;

create table if not exists public.case_plan_goals_v19 (
  id uuid primary key default gen_random_uuid(),
  case_plan_id uuid not null references public.case_plans(id) on delete cascade,
  goal_reference text not null unique,
  goal_title text not null,
  goal_description text not null,
  domain_code text,
  outcome_type text not null,
  success_indicators jsonb not null,
  evidence_expectations jsonb not null default '[]'::jsonb,
  responsible_parties jsonb not null,
  support_requirements jsonb not null default '[]'::jsonb,
  target_date date,
  priority text not null default 'standard',
  family_agreement_status text not null default 'unknown',
  child_agreement_status text not null default 'not_applicable',
  status text not null default 'active'
);

create table if not exists public.case_plan_actions_v19 (
  id uuid primary key default gen_random_uuid(),
  case_plan_goal_id uuid not null references public.case_plan_goals_v19(id) on delete cascade,
  action_reference text not null unique,
  action_description text not null,
  action_type text not null,
  responsible_party_type text not null,
  responsible_party_reference text not null,
  due_at timestamptz,
  recurring_rule text,
  completion_evidence_required boolean not null default false,
  evidence_types text[] not null default '{}',
  dependency_action_ids uuid[] not null default '{}',
  status text not null default 'planned',
  completed_at timestamptz,
  completion_summary text
);

create table if not exists public.case_family_disagreements (
  id uuid primary key default gen_random_uuid(),
  disagreement_reference text not null unique,
  case_id uuid not null references public.cases(id) on delete cascade,
  case_plan_id uuid references public.case_plans(id) on delete set null,
  participant_type text not null,
  participant_reference text not null,
  disputed_issue text not null,
  participant_position text not null,
  worker_position text,
  supporting_evidence_ids uuid[] not null default '{}',
  resolution_requested text,
  resolution_status text not null default 'unresolved',
  recorded_at timestamptz not null default now()
);

create table if not exists public.case_tasks (
  id uuid primary key default gen_random_uuid(),
  task_reference text not null unique,
  case_id uuid not null references public.cases(id) on delete cascade,
  related_goal_id uuid references public.case_plan_goals_v19(id) on delete set null,
  task_type text not null,
  task_title text not null,
  task_description text not null,
  assigned_to_type text not null,
  assigned_to_reference text not null,
  created_by_user_id uuid references auth.users(id) on delete set null,
  priority text not null default 'standard',
  scheduled_start_at timestamptz,
  due_at timestamptz,
  evidence_required boolean not null default false,
  status text not null default 'open',
  completed_at timestamptz,
  completion_summary text,
  created_at timestamptz not null default now()
);

create table if not exists public.case_appointments (
  id uuid primary key default gen_random_uuid(),
  appointment_reference text not null unique,
  case_id uuid not null references public.cases(id) on delete cascade,
  appointment_type text not null,
  appointment_title text not null,
  scheduled_start_at timestamptz not null,
  scheduled_end_at timestamptz,
  location_details jsonb not null default '{}'::jsonb,
  required_participants jsonb not null default '[]'::jsonb,
  appointment_status text not null default 'scheduled',
  missed_context text,
  cancellation_reason text,
  created_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.case_visit_records_v19 (
  id uuid primary key default gen_random_uuid(),
  visit_reference text not null unique,
  case_id uuid not null references public.cases(id) on delete cascade,
  visit_type text not null,
  visit_location_type text not null,
  scheduled_at timestamptz,
  actual_start_at timestamptz,
  actual_end_at timestamptz,
  worker_user_id uuid references auth.users(id) on delete set null,
  participants_present jsonb not null default '[]'::jsonb,
  factual_observations text,
  family_responses text,
  safety_context text,
  follow_up_required boolean not null default false,
  human_review_status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.case_supervision_reviews (
  id uuid primary key default gen_random_uuid(),
  review_reference text not null unique,
  case_id uuid not null references public.cases(id) on delete cascade,
  supervisor_user_id uuid references auth.users(id) on delete set null,
  worker_user_id uuid references auth.users(id) on delete set null,
  review_type text not null,
  review_summary text not null,
  identified_risks jsonb not null default '[]'::jsonb,
  required_actions jsonb not null default '[]'::jsonb,
  decision_review_required boolean not null default false,
  reviewed_at timestamptz not null default now()
);

create table if not exists public.case_decision_records (
  id uuid primary key default gen_random_uuid(),
  decision_reference text not null unique,
  case_id uuid not null references public.cases(id) on delete cascade,
  decision_type text not null,
  decision_summary text not null,
  factual_basis text not null,
  evidence_item_ids uuid[] not null default '{}',
  participant_views jsonb not null default '[]'::jsonb,
  family_disagreement_ids uuid[] not null default '{}',
  high_impact_decision boolean not null default false,
  ai_assisted boolean not null default false,
  ai_output_reference text,
  decision_made_by_user_id uuid references auth.users(id) on delete set null,
  supervisor_approved_by_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'draft',
  decided_at timestamptz
);

create table if not exists public.case_transfer_records (
  id uuid primary key default gen_random_uuid(),
  transfer_reference text not null unique,
  case_id uuid not null references public.cases(id) on delete cascade,
  from_organisation_id uuid references public.organisations(id) on delete set null,
  to_organisation_id uuid references public.organisations(id) on delete set null,
  from_team_id uuid references public.case_teams(id) on delete set null,
  to_team_id uuid references public.case_teams(id) on delete set null,
  transfer_reason text not null,
  handover_record_id uuid references public.case_handover_records(id) on delete set null,
  family_notified boolean not null default false,
  records_manifest jsonb not null default '[]'::jsonb,
  status text not null default 'planned',
  requested_by_user_id uuid references auth.users(id) on delete set null,
  approved_by_user_id uuid references auth.users(id) on delete set null,
  completed_at timestamptz
);

create table if not exists public.case_closure_records (
  id uuid primary key default gen_random_uuid(),
  closure_reference text not null unique,
  case_id uuid not null references public.cases(id) on delete cascade,
  closure_reason text not null,
  closure_summary text not null,
  outcomes_summary jsonb not null default '{}'::jsonb,
  unresolved_issues jsonb not null default '[]'::jsonb,
  family_views jsonb not null default '[]'::jsonb,
  child_views jsonb not null default '[]'::jsonb,
  records_access_summary text not null,
  follow_up_plan jsonb not null default '{}'::jsonb,
  supervisor_approved_by_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'draft',
  closed_by_user_id uuid references auth.users(id) on delete set null,
  closed_at timestamptz
);

create table if not exists public.case_operational_audit_events (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete set null,
  case_id uuid references public.cases(id) on delete cascade,
  event_type text not null,
  event_summary text not null,
  source_table text,
  source_id uuid,
  actor_user_id uuid references auth.users(id) on delete set null,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_service_programs_org_status on public.service_programs(organisation_id, status);
create index if not exists idx_staff_profiles_org_status on public.staff_profiles(organisation_id, employment_status, availability_status);
create index if not exists idx_case_referrals_org_status on public.case_referrals(receiving_organisation_id, status, urgency_level);
create index if not exists idx_case_referrals_response_due on public.case_referrals(required_response_at) where status in ('received', 'screening', 'awaiting_information');
create index if not exists idx_cases_v19_org_status_priority on public.cases(organisation_id, status, priority_level);
create index if not exists idx_case_allocations_v19_case_status on public.case_allocations_v19(case_id, status, primary_allocation);
create index if not exists idx_case_allocations_v19_worker on public.case_allocations_v19(allocated_to_user_id, status);
create index if not exists idx_case_tasks_case_due on public.case_tasks(case_id, status, due_at);
create index if not exists idx_case_appointments_case_time on public.case_appointments(case_id, scheduled_start_at desc);
create index if not exists idx_case_decisions_case_status on public.case_decision_records(case_id, status, high_impact_decision);
create index if not exists idx_case_operational_audit_case_time on public.case_operational_audit_events(case_id, occurred_at desc);

create or replace function public.safesteps_can_manage_casework(p_user_id uuid, p_organisation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    public.safesteps_can_admin_organisation(p_user_id, p_organisation_id)
    or public.has_resource_permission(p_user_id, 'organisation', p_organisation_id, 'case_management.manage')
    or public.has_resource_permission(p_user_id, 'organisation', p_organisation_id, 'casework.manage')
    or public.has_resource_permission(p_user_id, 'global', null, 'case_management.manage'),
    false
  );
$$;

create or replace function public.safesteps_can_access_case_v19(p_user_id uuid, p_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.cases c
    where c.id = p_case_id
      and (
        public.safesteps_can_manage_casework(p_user_id, c.organisation_id)
        or c.primary_worker_id = p_user_id
        or exists (
          select 1
          from public.case_allocations_v19 a
          where a.case_id = c.id
            and a.status = 'active'
            and a.allocated_to_user_id = p_user_id
            and (a.effective_to is null or a.effective_to > now())
        )
        or exists (
          select 1
          from public.case_participants cp
          where cp.case_id = c.id
            and cp.user_id = p_user_id
            and cp.status = 'active'
        )
      )
  );
$$;

create or replace function public.can_finalise_case_decision_v19(p_decision_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.case_decision_records d
    where d.id = p_decision_id
      and d.factual_basis is not null
      and length(trim(d.factual_basis)) > 0
      and jsonb_array_length(d.participant_views) > 0
      and (
        d.high_impact_decision = false
        or d.supervisor_approved_by_user_id is not null
      )
      and (
        d.ai_assisted = false
        or d.ai_output_reference is not null
      )
  );
$$;

create or replace function public.can_transfer_case_v19(p_transfer_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.case_transfer_records t
    left join public.case_handover_records h on h.id = t.handover_record_id
    where t.id = p_transfer_id
      and t.status in ('planned', 'approved')
      and t.approved_by_user_id is not null
      and t.family_notified = true
      and jsonb_array_length(t.records_manifest) > 0
      and h.handover_completed_at is not null
  );
$$;

create or replace function public.can_close_case_v19(p_closure_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.case_closure_records cl
    where cl.id = p_closure_id
      and cl.supervisor_approved_by_user_id is not null
      and length(trim(cl.closure_summary)) > 0
      and length(trim(cl.records_access_summary)) > 0
      and not exists (
        select 1
        from public.case_tasks t
        where t.case_id = cl.case_id
          and t.status not in ('completed', 'cancelled', 'closed')
          and t.priority in ('urgent', 'critical')
      )
      and not exists (
        select 1
        from public.case_decision_records d
        where d.case_id = cl.case_id
          and d.high_impact_decision = true
          and public.can_finalise_case_decision_v19(d.id) = false
      )
  );
$$;

revoke all on function public.safesteps_can_manage_casework(uuid, uuid) from public;
revoke all on function public.safesteps_can_access_case_v19(uuid, uuid) from public;
revoke all on function public.can_finalise_case_decision_v19(uuid) from public;
revoke all on function public.can_transfer_case_v19(uuid) from public;
revoke all on function public.can_close_case_v19(uuid) from public;
grant execute on function public.safesteps_can_manage_casework(uuid, uuid) to authenticated;
grant execute on function public.safesteps_can_access_case_v19(uuid, uuid) to authenticated;
grant execute on function public.can_finalise_case_decision_v19(uuid) to authenticated;
grant execute on function public.can_transfer_case_v19(uuid) to authenticated;
grant execute on function public.can_close_case_v19(uuid) to authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'organisation_units',
    'service_programs',
    'staff_profiles',
    'case_teams',
    'case_team_memberships',
    'referring_parties',
    'case_referrals',
    'case_referral_documents',
    'case_referral_screenings',
    'case_referral_decisions',
    'case_allocations_v19',
    'case_allocation_history_v19',
    'case_handover_records',
    'case_plans',
    'case_plan_goals_v19',
    'case_plan_actions_v19',
    'case_family_disagreements',
    'case_tasks',
    'case_appointments',
    'case_visit_records_v19',
    'case_supervision_reviews',
    'case_decision_records',
    'case_transfer_records',
    'case_closure_records',
    'case_operational_audit_events'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

grant select, insert, update on
  public.organisation_units,
  public.service_programs,
  public.staff_profiles,
  public.case_teams,
  public.case_team_memberships,
  public.referring_parties,
  public.case_referrals,
  public.case_referral_documents,
  public.case_referral_screenings,
  public.case_referral_decisions,
  public.case_allocations_v19,
  public.case_allocation_history_v19,
  public.case_handover_records,
  public.case_plans,
  public.case_plan_goals_v19,
  public.case_plan_actions_v19,
  public.case_family_disagreements,
  public.case_tasks,
  public.case_appointments,
  public.case_visit_records_v19,
  public.case_supervision_reviews,
  public.case_decision_records,
  public.case_transfer_records,
  public.case_closure_records,
  public.case_operational_audit_events
to authenticated;

create policy "Case management organisation units" on public.organisation_units for all to authenticated using (public.safesteps_can_manage_casework(auth.uid(), organisation_id) or public.safesteps_is_active_member(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_casework(auth.uid(), organisation_id));
create policy "Case management service programs" on public.service_programs for all to authenticated using (public.safesteps_can_manage_casework(auth.uid(), organisation_id) or public.safesteps_is_active_member(auth.uid(), organisation_id)) with check (public.safesteps_can_manage_casework(auth.uid(), organisation_id));
create policy "Case management staff profiles" on public.staff_profiles for all to authenticated using (user_id = auth.uid() or public.safesteps_can_manage_casework(auth.uid(), organisation_id)) with check (user_id = auth.uid() or public.safesteps_can_manage_casework(auth.uid(), organisation_id));
create policy "Case management teams" on public.case_teams for all to authenticated using (public.safesteps_can_manage_casework(auth.uid(), organisation_id) or supervisor_user_id = auth.uid()) with check (public.safesteps_can_manage_casework(auth.uid(), organisation_id));
create policy "Case management team memberships" on public.case_team_memberships for all to authenticated using (exists (select 1 from public.case_teams t where t.id = case_team_id and public.safesteps_can_manage_casework(auth.uid(), t.organisation_id))) with check (exists (select 1 from public.case_teams t where t.id = case_team_id and public.safesteps_can_manage_casework(auth.uid(), t.organisation_id)));
create policy "Case management referring parties" on public.referring_parties for all to authenticated using (public.current_user_has_role('admin') or public.has_resource_permission(auth.uid(), 'global', null, 'case_management.manage')) with check (public.current_user_has_role('admin') or public.has_resource_permission(auth.uid(), 'global', null, 'case_management.manage'));
create policy "Case management referrals" on public.case_referrals for all to authenticated using (public.safesteps_can_manage_casework(auth.uid(), receiving_organisation_id) or public.safesteps_is_active_member(auth.uid(), receiving_organisation_id)) with check (public.safesteps_can_manage_casework(auth.uid(), receiving_organisation_id));
create policy "Case management referral documents" on public.case_referral_documents for all to authenticated using (exists (select 1 from public.case_referrals r where r.id = case_referral_id and public.safesteps_can_manage_casework(auth.uid(), r.receiving_organisation_id))) with check (exists (select 1 from public.case_referrals r where r.id = case_referral_id and public.safesteps_can_manage_casework(auth.uid(), r.receiving_organisation_id)));
create policy "Case management referral screenings" on public.case_referral_screenings for all to authenticated using (screened_by_user_id = auth.uid() or exists (select 1 from public.case_referrals r where r.id = case_referral_id and public.safesteps_can_manage_casework(auth.uid(), r.receiving_organisation_id))) with check (screened_by_user_id = auth.uid() or exists (select 1 from public.case_referrals r where r.id = case_referral_id and public.safesteps_can_manage_casework(auth.uid(), r.receiving_organisation_id)));
create policy "Case management referral decisions" on public.case_referral_decisions for all to authenticated using (decision_made_by_user_id = auth.uid() or supervisor_approved_by_user_id = auth.uid() or exists (select 1 from public.case_referrals r where r.id = case_referral_id and public.safesteps_can_manage_casework(auth.uid(), r.receiving_organisation_id))) with check (decision_made_by_user_id = auth.uid() or exists (select 1 from public.case_referrals r where r.id = case_referral_id and public.safesteps_can_manage_casework(auth.uid(), r.receiving_organisation_id)));

create policy "Case operational records" on public.case_allocations_v19 for all to authenticated using (public.safesteps_can_access_case_v19(auth.uid(), case_id)) with check (public.safesteps_can_access_case_v19(auth.uid(), case_id));
create policy "Case allocation history records" on public.case_allocation_history_v19 for all to authenticated using (public.safesteps_can_access_case_v19(auth.uid(), case_id)) with check (public.safesteps_can_access_case_v19(auth.uid(), case_id));
create policy "Case handover records" on public.case_handover_records for all to authenticated using (outgoing_user_id = auth.uid() or incoming_user_id = auth.uid() or public.safesteps_can_access_case_v19(auth.uid(), case_id)) with check (outgoing_user_id = auth.uid() or incoming_user_id = auth.uid() or public.safesteps_can_access_case_v19(auth.uid(), case_id));
create policy "Case plans records" on public.case_plans for all to authenticated using (public.safesteps_can_access_case_v19(auth.uid(), case_id)) with check (public.safesteps_can_access_case_v19(auth.uid(), case_id));
create policy "Case plan goals records" on public.case_plan_goals_v19 for all to authenticated using (exists (select 1 from public.case_plans p where p.id = case_plan_id and public.safesteps_can_access_case_v19(auth.uid(), p.case_id))) with check (exists (select 1 from public.case_plans p where p.id = case_plan_id and public.safesteps_can_access_case_v19(auth.uid(), p.case_id)));
create policy "Case plan actions records" on public.case_plan_actions_v19 for all to authenticated using (exists (select 1 from public.case_plan_goals_v19 g join public.case_plans p on p.id = g.case_plan_id where g.id = case_plan_goal_id and public.safesteps_can_access_case_v19(auth.uid(), p.case_id))) with check (exists (select 1 from public.case_plan_goals_v19 g join public.case_plans p on p.id = g.case_plan_id where g.id = case_plan_goal_id and public.safesteps_can_access_case_v19(auth.uid(), p.case_id)));
create policy "Case family disagreement records" on public.case_family_disagreements for all to authenticated using (public.safesteps_can_access_case_v19(auth.uid(), case_id)) with check (public.safesteps_can_access_case_v19(auth.uid(), case_id));
create policy "Case task records" on public.case_tasks for all to authenticated using (created_by_user_id = auth.uid() or public.safesteps_can_access_case_v19(auth.uid(), case_id)) with check (created_by_user_id = auth.uid() or public.safesteps_can_access_case_v19(auth.uid(), case_id));
create policy "Case appointment records" on public.case_appointments for all to authenticated using (created_by_user_id = auth.uid() or public.safesteps_can_access_case_v19(auth.uid(), case_id)) with check (created_by_user_id = auth.uid() or public.safesteps_can_access_case_v19(auth.uid(), case_id));
create policy "Case visit records" on public.case_visit_records_v19 for all to authenticated using (worker_user_id = auth.uid() or public.safesteps_can_access_case_v19(auth.uid(), case_id)) with check (worker_user_id = auth.uid() or public.safesteps_can_access_case_v19(auth.uid(), case_id));
create policy "Case supervision reviews" on public.case_supervision_reviews for all to authenticated using (supervisor_user_id = auth.uid() or worker_user_id = auth.uid() or public.safesteps_can_access_case_v19(auth.uid(), case_id)) with check (supervisor_user_id = auth.uid() or worker_user_id = auth.uid() or public.safesteps_can_access_case_v19(auth.uid(), case_id));
create policy "Case decisions" on public.case_decision_records for all to authenticated using (decision_made_by_user_id = auth.uid() or supervisor_approved_by_user_id = auth.uid() or public.safesteps_can_access_case_v19(auth.uid(), case_id)) with check (decision_made_by_user_id = auth.uid() or public.safesteps_can_access_case_v19(auth.uid(), case_id));
create policy "Case transfers" on public.case_transfer_records for all to authenticated using (requested_by_user_id = auth.uid() or approved_by_user_id = auth.uid() or public.safesteps_can_access_case_v19(auth.uid(), case_id)) with check (requested_by_user_id = auth.uid() or public.safesteps_can_access_case_v19(auth.uid(), case_id));
create policy "Case closures" on public.case_closure_records for all to authenticated using (closed_by_user_id = auth.uid() or supervisor_approved_by_user_id = auth.uid() or public.safesteps_can_access_case_v19(auth.uid(), case_id)) with check (closed_by_user_id = auth.uid() or public.safesteps_can_access_case_v19(auth.uid(), case_id));
create policy "Case operational audit readable" on public.case_operational_audit_events for select to authenticated using (public.safesteps_can_access_case_v19(auth.uid(), case_id) or public.safesteps_can_manage_casework(auth.uid(), organisation_id));
create policy "Case operational audit appendable" on public.case_operational_audit_events for insert to authenticated with check (actor_user_id = auth.uid() or public.safesteps_can_manage_casework(auth.uid(), organisation_id));

create or replace view public.case_management_work_queue
with (security_invoker = true)
as
select
  c.id as case_id,
  c.case_reference,
  c.organisation_id,
  c.status,
  c.priority_level,
  count(distinct t.id) filter (where t.status not in ('completed', 'cancelled', 'closed')) as open_task_count,
  count(distinct t.id) filter (where t.status not in ('completed', 'cancelled', 'closed') and t.due_at < now()) as overdue_task_count,
  count(distinct a.id) filter (where a.appointment_status = 'scheduled' and a.scheduled_start_at >= now()) as upcoming_appointment_count,
  count(distinct d.id) filter (where d.high_impact_decision = true and public.can_finalise_case_decision_v19(d.id) = false) as high_impact_decisions_needing_review
from public.cases c
left join public.case_tasks t on t.case_id = c.id
left join public.case_appointments a on a.case_id = c.id
left join public.case_decision_records d on d.case_id = c.id
group by c.id, c.case_reference, c.organisation_id, c.status, c.priority_level;

create or replace view public.case_transfer_readiness_queue
with (security_invoker = true)
as
select
  t.id as transfer_id,
  t.transfer_reference,
  t.case_id,
  t.status,
  t.family_notified,
  t.completed_at,
  public.can_transfer_case_v19(t.id) as ready_to_transfer
from public.case_transfer_records t
where t.status in ('planned', 'approved');

insert into public.security_permissions (permission_code, description, resource_type, action, risk_level)
values
  ('case_management.manage', 'Manage case management programs, referrals, allocations, plans, tasks, visits, transfers, closures, and operational audit records.', 'case_management', 'manage', 'high_impact'),
  ('casework.manage', 'Manage assigned casework records and operational continuity tasks.', 'case', 'manage', 'sensitive'),
  ('case_decision.approve', 'Approve high-impact case decisions after human review.', 'case_decision', 'approve', 'high_impact'),
  ('case_transfer.approve', 'Approve case transfers after structured handover and records manifest review.', 'case_transfer', 'approve', 'high_impact'),
  ('case_closure.approve', 'Approve case closure after unresolved risks, records access, and family views are reviewed.', 'case_closure', 'approve', 'high_impact')
on conflict (permission_code) do update
set description = excluded.description,
    resource_type = excluded.resource_type,
    action = excluded.action,
    risk_level = excluded.risk_level;
