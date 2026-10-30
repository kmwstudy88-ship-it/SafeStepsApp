-- SafeSteps Reunification Architecture Safeguards Migration
-- Authority: docs/architecture/SAFESTEPS_CANONICAL_SCHEMA.md
-- Scope:
--   1. Resolves community_service_referrals.tenant_id boundary (Section 1.1)
--   2. Defines canonical operational-case-scoped (cases.id + platform_tenants.id) tables for:
--      - Economic & Concrete Supports (ECS) requests & disbursements (Poverty != Neglect safeguard)
--      - Systemic service barrier & agency waitlist compliance-clock tolling
--      - Lived-experience Parent Partner peer mentorship attendance logs (confidential notes excluded from surveillance)
--      - 12-month post-reunification graduated step-down support plans (service cliff prevention)

do $migration$
begin

-- 0. Ensure safesteps_has_case_access(uuid) helper exists if migration is applied standalone
do $fn$
begin
  if to_regprocedure('public.safesteps_has_case_access(uuid)') is null then
    execute $sql$
      create function public.safesteps_has_case_access(target_case_id uuid)
      returns boolean
      language sql
      stable
      security invoker
      set search_path = public
      as $body$
        select (select auth.uid()) is not null and target_case_id is not null;
      $body$;
    $sql$;
  end if;
end
$fn$;

-- 1. Resolve community_service_referrals tenant boundary (Section 1.1)
alter table if exists public.community_service_referrals
  add column if not exists tenant_id uuid references public.platform_tenants(id),
  add column if not exists compliance_clock_paused boolean not null default false,
  add column if not exists waitlist_weeks integer check (waitlist_weeks is null or waitlist_weeks >= 0);

create index if not exists community_service_referrals_tenant_id_idx
  on public.community_service_referrals(tenant_id);

-- 2. Economic & Concrete Supports (ECS) Ledger (anchored to canonical cases.id & platform_tenants.id)
create table if not exists public.case_concrete_support_requests (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete restrict,
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  requested_by_user_id uuid not null references auth.users(id) on delete restrict,
  category text not null check (
    category in (
      'rent_or_eviction_prevention',
      'utility_arrears_relief',
      'emergency_groceries_or_formula',
      'transport_vouchers_or_vehicle_repair',
      'childcare_subsidy_or_voucher',
      'beds_cribs_or_safety_hardware'
    )
  ),
  amount_aud numeric(10, 2) not null check (amount_aud > 0),
  urgency text not null check (urgency in ('immediate_24h', 'urgent_72h', 'standard_7d')),
  status text not null default 'requested' check (
    status in ('requested', 'approved', 'disbursed', 'stabilized_verified')
  ),
  rationale text not null,
  poverty_decoupled_from_neglect boolean not null default true check (poverty_decoupled_from_neglect = true),
  disbursed_at timestamptz,
  stabilization_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists case_concrete_support_requests_case_tenant_idx
  on public.case_concrete_support_requests(case_id, tenant_id);

alter table public.case_concrete_support_requests enable row level security;

revoke all on public.case_concrete_support_requests from public, anon;
grant select, insert, update on public.case_concrete_support_requests to authenticated, service_role;

drop policy if exists case_concrete_support_requests_service_manage on public.case_concrete_support_requests;
create policy case_concrete_support_requests_service_manage
  on public.case_concrete_support_requests
  for all
  to service_role, postgres
  using (true)
  with check (true);

drop policy if exists case_concrete_support_requests_authenticated_access on public.case_concrete_support_requests;
create policy case_concrete_support_requests_authenticated_access
  on public.case_concrete_support_requests
  for all
  to authenticated
  using (
    (select auth.uid()) = requested_by_user_id
    or public.safesteps_has_case_access(case_id)
  )
  with check (
    (select auth.uid()) = requested_by_user_id
    or public.safesteps_has_case_access(case_id)
  );

-- 3. Systemic Service Barrier & Compliance-Clock Tolling Ledger
create table if not exists public.case_service_barrier_logs (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete restrict,
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  mandated_service_name text not null,
  barrier_type text not null check (
    barrier_type in (
      'agency_waitlist',
      'public_transit_deficit',
      'work_shift_conflict',
      'childcare_unavailability',
      'culturally_responsive_provider_shortage'
    )
  ),
  waitlist_weeks integer not null default 0 check (waitlist_weeks >= 0),
  compliance_timer_paused boolean not null default true,
  alternative_interim_support text not null,
  documented_by text not null,
  documented_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists case_service_barrier_logs_case_tenant_idx
  on public.case_service_barrier_logs(case_id, tenant_id);

alter table public.case_service_barrier_logs enable row level security;

revoke all on public.case_service_barrier_logs from public, anon;
grant select, insert, update on public.case_service_barrier_logs to authenticated, service_role;

drop policy if exists case_service_barrier_logs_service_manage on public.case_service_barrier_logs;
create policy case_service_barrier_logs_service_manage
  on public.case_service_barrier_logs
  for all
  to service_role, postgres
  using (true)
  with check (true);

drop policy if exists case_service_barrier_logs_authenticated_access on public.case_service_barrier_logs;
create policy case_service_barrier_logs_authenticated_access
  on public.case_service_barrier_logs
  for all
  to authenticated
  using (public.safesteps_has_case_access(case_id))
  with check (public.safesteps_has_case_access(case_id));

-- 4. Lived-Experience Parent Partner Peer Mentorship Logs (confidential advocacy boundary)
create table if not exists public.case_parent_partner_sessions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete restrict,
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  mentor_id text not null,
  mentor_name text not null,
  session_date timestamptz not null default now(),
  focus_domain text not null check (
    focus_domain in (
      'system_navigation',
      'court_and_ftm_prep',
      'shame_resilience_and_hope',
      'visit_transition_support',
      'concrete_resource_connection'
    )
  ),
  parent_reflection_summary text not null,
  confidential_from_adversarial_fact_finding boolean not null default true check (confidential_from_adversarial_fact_finding = true),
  created_at timestamptz not null default now()
);

create index if not exists case_parent_partner_sessions_case_tenant_idx
  on public.case_parent_partner_sessions(case_id, tenant_id);

alter table public.case_parent_partner_sessions enable row level security;

revoke all on public.case_parent_partner_sessions from public, anon;
grant select, insert on public.case_parent_partner_sessions to authenticated, service_role;

drop policy if exists case_parent_partner_sessions_service_manage on public.case_parent_partner_sessions;
create policy case_parent_partner_sessions_service_manage
  on public.case_parent_partner_sessions
  for all
  to service_role, postgres
  using (true)
  with check (true);

drop policy if exists case_parent_partner_sessions_authenticated_access on public.case_parent_partner_sessions;
create policy case_parent_partner_sessions_authenticated_access
  on public.case_parent_partner_sessions
  for all
  to authenticated
  using (public.safesteps_has_case_access(case_id))
  with check (public.safesteps_has_case_access(case_id));

-- 5. 12-Month Post-Reunification Graduated Step-Down Support Plans
create table if not exists public.case_post_reunification_step_down_plans (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null unique references public.cases(id) on delete restrict,
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  reunification_date date not null,
  current_phase text not null check (
    current_phase in (
      'months_1_3_intensive',
      'months_4_6_transitional',
      'months_7_12_community_sustained',
      'graduated_complete'
    )
  ),
  ecs_continuity_guaranteed boolean not null default true,
  childcare_subsidy_active boolean not null default true,
  respite_care_hours_monthly integer not null default 16 check (respite_care_hours_monthly >= 0),
  parent_partner_check_in_cadence text not null default 'weekly',
  non_punitive_support_only boolean not null default true check (non_punitive_support_only = true),
  last_check_in_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.case_post_reunification_step_down_plans enable row level security;

revoke all on public.case_post_reunification_step_down_plans from public, anon;
grant select, insert, update on public.case_post_reunification_step_down_plans to authenticated, service_role;

drop policy if exists case_post_reunification_step_down_plans_service_manage on public.case_post_reunification_step_down_plans;
create policy case_post_reunification_step_down_plans_service_manage
  on public.case_post_reunification_step_down_plans
  for all
  to service_role, postgres
  using (true)
  with check (true);

drop policy if exists case_post_reunification_step_down_plans_authenticated_access on public.case_post_reunification_step_down_plans;
create policy case_post_reunification_step_down_plans_authenticated_access
  on public.case_post_reunification_step_down_plans
  for all
  to authenticated
  using (public.safesteps_has_case_access(case_id))
  with check (public.safesteps_has_case_access(case_id));

end
$migration$;
