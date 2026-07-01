-- SAFE STEPS ASSESSMENT DATA MODEL
-- Metadata-driven assessment instruments, immutable scoring records,
-- contradiction/collateral tracking, and reunification readiness rollups.

create extension if not exists pgcrypto;

create or replace function public.current_assessment_app_role()
returns text
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '');
$$;

create or replace function public.can_manage_assessments()
returns boolean
language sql
stable
as $$
  select public.current_assessment_app_role() in ('caseworker', 'admin', 'super_admin', 'clinician', 'supervisor');
$$;

create table if not exists public.reunification_cases (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid(),
  parent_user_id uuid,
  worker_user_id uuid,
  case_number text,
  family_label text,
  program_phase integer not null default 0 check (program_phase between 0 and 4),
  status text not null default 'active' check (status in ('active', 'on_hold', 'completed', 'exited')),
  opened_date date not null default current_date,
  closed_date date,
  consent_signed boolean not null default false,
  consent_date date,
  informed_of text[] not null default array[]::text[],
  baseline_complete boolean not null default false,
  overall_progress_score numeric(5,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assessment_instruments (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  version text not null default '1.0',
  description text,
  instrument_type text not null check (
    instrument_type in (
      'safety',
      'risk',
      'protective_capacity',
      'parenting_capacity',
      'readiness',
      'substance_use',
      'mental_health',
      'custom'
    )
  ),
  scoring_method text not null default 'weighted_average' check (
    scoring_method in ('sum', 'weighted_average', 'rubric', 'rule_based')
  ),
  restricted_tool boolean not null default false,
  requires_licensed_assessor boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.assessment_domains (
  id uuid primary key default gen_random_uuid(),
  instrument_id uuid not null references public.assessment_instruments(id) on delete cascade,
  name text not null,
  description text,
  weight numeric(8,3) not null default 1.0,
  display_order integer not null default 0,
  unique(instrument_id, name)
);

create table if not exists public.assessment_items (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid not null references public.assessment_domains(id) on delete cascade,
  item_key text not null,
  prompt text not null,
  item_type text not null check (item_type in ('likert', 'multiple_choice', 'yes_no', 'numeric', 'narrative')),
  weight numeric(8,3) not null default 1.0,
  max_value numeric(8,2),
  display_order integer not null default 0,
  is_critical boolean not null default false,
  unique(domain_id, item_key)
);

create table if not exists public.assessment_item_response_options (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.assessment_items(id) on delete cascade,
  label text not null,
  value text not null,
  score numeric(8,2) not null default 0,
  display_order integer not null default 0,
  unique(item_id, value)
);

create table if not exists public.assessment_scoring_bands (
  id uuid primary key default gen_random_uuid(),
  instrument_id uuid not null references public.assessment_instruments(id) on delete cascade,
  label text not null,
  min_score numeric(6,2) not null,
  max_score numeric(6,2) not null,
  recommendation text,
  requires_supervisor_review boolean not null default false,
  display_order integer not null default 0,
  check (min_score <= max_score)
);

create table if not exists public.assessment_critical_overrides (
  id uuid primary key default gen_random_uuid(),
  instrument_id uuid not null references public.assessment_instruments(id) on delete cascade,
  item_id uuid not null references public.assessment_items(id) on delete cascade,
  trigger_option_id uuid references public.assessment_item_response_options(id) on delete cascade,
  forced_band_id uuid not null references public.assessment_scoring_bands(id) on delete cascade,
  reason text not null,
  requires_supervisor_review boolean not null default true
);

create table if not exists public.assessment_records (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.reunification_cases(id) on delete cascade,
  parent_user_id uuid,
  worker_user_id uuid,
  instrument_id uuid not null references public.assessment_instruments(id),
  phase integer not null default 0 check (phase between 0 and 4),
  assessment_date timestamptz not null default now(),
  session_id uuid,
  administered_by text,
  administrator_qualification text,
  platform text,
  source_type text not null default 'safesteps_app' check (
    source_type in ('safesteps_app', 'external_platform', 'paper', 'professional_report')
  ),
  narrative_summary text,
  report_file_path text,
  status text not null default 'completed' check (status in ('draft', 'completed', 'superseded', 'voided')),
  supersedes_assessment_id uuid references public.assessment_records(id),
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.assessment_responses (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessment_records(id) on delete cascade,
  item_id uuid not null references public.assessment_items(id),
  selected_option_id uuid references public.assessment_item_response_options(id),
  numeric_value numeric(10,2),
  narrative_value text,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  unique(assessment_id, item_id)
);

create table if not exists public.assessment_domain_scores (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessment_records(id) on delete cascade,
  domain_id uuid not null references public.assessment_domains(id),
  raw_score numeric(10,2) not null,
  max_possible numeric(10,2) not null,
  normalized_score numeric(6,2) not null,
  created_at timestamptz not null default now(),
  unique(assessment_id, domain_id)
);

create table if not exists public.assessment_scores (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null unique references public.assessment_records(id) on delete cascade,
  overall_score numeric(6,2) not null,
  band_id uuid references public.assessment_scoring_bands(id),
  band_label text,
  override_triggered boolean not null default false,
  override_id uuid references public.assessment_critical_overrides(id),
  requires_supervisor_review boolean not null default false,
  recommendation text,
  created_at timestamptz not null default now()
);

create table if not exists public.assessment_contradictions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.reunification_cases(id) on delete cascade,
  parent_user_id uuid,
  worker_user_id uuid,
  detected_at timestamptz not null default now(),
  phase integer check (phase between 0 and 4),
  contradiction_type text not null,
  description text not null,
  source_a text,
  source_b text,
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high', 'critical')),
  include_in_report boolean not null default true,
  supervisor_notified boolean not null default false,
  worker_notes text,
  resolved_at timestamptz,
  created_by uuid not null default auth.uid()
);

create table if not exists public.assessment_collaterals (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.reunification_cases(id) on delete cascade,
  parent_user_id uuid,
  worker_user_id uuid,
  source_name text not null,
  source_role text,
  received_at timestamptz not null default now(),
  consent_or_authority text,
  summary text not null,
  alignment_with_self_report text check (
    alignment_with_self_report in ('aligned', 'partially_aligned', 'contradictory', 'unclear')
  ),
  risk_notes text,
  protective_notes text,
  attachment_path text,
  created_by uuid not null default auth.uid()
);

create table if not exists public.service_providers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid(),
  name text not null,
  provider_type text not null,
  contact_name text,
  phone text,
  email text,
  address text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.case_plan_goals (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.reunification_cases(id) on delete cascade,
  parent_user_id uuid,
  title text not null,
  description text,
  domain text,
  target_date date,
  status text not null default 'not_started' check (
    status in ('not_started', 'in_progress', 'completed', 'blocked', 'closed')
  ),
  progress_score numeric(5,2) check (progress_score between 0 and 100),
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.case_plan_objectives (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.case_plan_goals(id) on delete cascade,
  case_id uuid not null references public.reunification_cases(id) on delete cascade,
  title text not null,
  description text,
  evidence_required boolean not null default false,
  due_date date,
  status text not null default 'not_started' check (
    status in ('not_started', 'in_progress', 'completed', 'blocked', 'closed')
  ),
  progress_score numeric(5,2) check (progress_score between 0 and 100),
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.case_service_referrals (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.reunification_cases(id) on delete cascade,
  parent_user_id uuid,
  provider_id uuid references public.service_providers(id),
  service_type text not null,
  provider_name text,
  referral_date date not null default current_date,
  status text not null default 'referred' check (
    status in ('referred', 'engaged', 'completed', 'declined', 'discontinued')
  ),
  completion_weight numeric(6,2) not null default 1,
  notes text,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.case_safety_plans (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.reunification_cases(id) on delete cascade,
  parent_user_id uuid,
  worker_user_id uuid,
  title text not null,
  risk_triggers text[] not null default array[]::text[],
  safety_actions text[] not null default array[]::text[],
  safe_people text[] not null default array[]::text[],
  emergency_contacts jsonb not null default '[]'::jsonb,
  child_specific_needs text,
  review_date date,
  status text not null default 'active' check (status in ('draft', 'active', 'superseded', 'closed')),
  attachment_path text,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.case_court_hearings (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.reunification_cases(id) on delete cascade,
  hearing_date date not null,
  hearing_type text,
  court_name text,
  orders_summary text,
  next_steps text,
  report_due_date date,
  outcome text,
  attachment_path text,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.case_progress_notes (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.reunification_cases(id) on delete cascade,
  parent_user_id uuid,
  worker_user_id uuid,
  note_type text not null default 'case_note' check (
    note_type in ('case_note', 'supervision_note', 'contact_note', 'risk_note', 'strength_note', 'report_note')
  ),
  title text,
  body text not null,
  phase integer check (phase between 0 and 4),
  include_in_report boolean not null default false,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.case_visitations (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.reunification_cases(id) on delete cascade,
  parent_user_id uuid,
  visit_date date not null,
  visit_type text,
  quality_score numeric(5,2) check (quality_score between 0 and 100),
  incident_count integer not null default 0 check (incident_count >= 0),
  observation_summary text,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.case_milestones (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.reunification_cases(id) on delete cascade,
  parent_user_id uuid,
  title text not null,
  status text not null default 'not_started' check (
    status in ('not_started', 'in_progress', 'completed', 'blocked')
  ),
  progress_score numeric(5,2) check (progress_score between 0 and 100),
  due_date date,
  completed_at timestamptz,
  notes text,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.reunification_readiness_indices (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.reunification_cases(id) on delete cascade,
  parent_user_id uuid,
  computed_at timestamptz not null default now(),
  assessment_signal numeric(6,2),
  service_signal numeric(6,2),
  visitation_signal numeric(6,2),
  milestone_signal numeric(6,2),
  composite_score numeric(6,2),
  recommendation text not null,
  flags text[] not null default array[]::text[],
  suppressed_by_override boolean not null default false,
  created_by uuid not null default auth.uid()
);

-- Rerun guards for databases where an earlier push created a subset of these
-- tables before all RLS policy columns were present.
alter table if exists public.reunification_cases add column if not exists owner_id uuid default auth.uid();
alter table if exists public.reunification_cases add column if not exists parent_user_id uuid;
alter table if exists public.reunification_cases add column if not exists worker_user_id uuid;

alter table if exists public.assessment_records add column if not exists parent_user_id uuid;
alter table if exists public.assessment_records add column if not exists worker_user_id uuid;
alter table if exists public.assessment_records add column if not exists created_by uuid default auth.uid();

alter table if exists public.assessment_responses add column if not exists created_by uuid default auth.uid();

alter table if exists public.assessment_contradictions add column if not exists worker_user_id uuid;
alter table if exists public.assessment_contradictions add column if not exists created_by uuid default auth.uid();

alter table if exists public.assessment_collaterals add column if not exists worker_user_id uuid;
alter table if exists public.assessment_collaterals add column if not exists created_by uuid default auth.uid();

alter table if exists public.service_providers add column if not exists owner_id uuid default auth.uid();

alter table if exists public.case_plan_goals add column if not exists parent_user_id uuid;
alter table if exists public.case_plan_goals add column if not exists created_by uuid default auth.uid();

alter table if exists public.case_plan_objectives add column if not exists goal_id uuid;
alter table if exists public.case_plan_objectives add column if not exists created_by uuid default auth.uid();

alter table if exists public.case_service_referrals add column if not exists parent_user_id uuid;
alter table if exists public.case_service_referrals add column if not exists created_by uuid default auth.uid();

alter table if exists public.case_safety_plans add column if not exists parent_user_id uuid;
alter table if exists public.case_safety_plans add column if not exists worker_user_id uuid;
alter table if exists public.case_safety_plans add column if not exists created_by uuid default auth.uid();

alter table if exists public.case_court_hearings add column if not exists created_by uuid default auth.uid();

alter table if exists public.case_progress_notes add column if not exists parent_user_id uuid;
alter table if exists public.case_progress_notes add column if not exists worker_user_id uuid;
alter table if exists public.case_progress_notes add column if not exists created_by uuid default auth.uid();

alter table if exists public.case_visitations add column if not exists parent_user_id uuid;
alter table if exists public.case_visitations add column if not exists created_by uuid default auth.uid();

alter table if exists public.case_milestones add column if not exists parent_user_id uuid;
alter table if exists public.case_milestones add column if not exists created_by uuid default auth.uid();

alter table if exists public.reunification_readiness_indices add column if not exists parent_user_id uuid;
alter table if exists public.reunification_readiness_indices add column if not exists created_by uuid default auth.uid();

alter table public.reunification_cases enable row level security;
alter table public.assessment_instruments enable row level security;
alter table public.assessment_domains enable row level security;
alter table public.assessment_items enable row level security;
alter table public.assessment_item_response_options enable row level security;
alter table public.assessment_scoring_bands enable row level security;
alter table public.assessment_critical_overrides enable row level security;
alter table public.assessment_records enable row level security;
alter table public.assessment_responses enable row level security;
alter table public.assessment_domain_scores enable row level security;
alter table public.assessment_scores enable row level security;
alter table public.assessment_contradictions enable row level security;
alter table public.assessment_collaterals enable row level security;
alter table public.service_providers enable row level security;
alter table public.case_plan_goals enable row level security;
alter table public.case_plan_objectives enable row level security;
alter table public.case_service_referrals enable row level security;
alter table public.case_safety_plans enable row level security;
alter table public.case_court_hearings enable row level security;
alter table public.case_progress_notes enable row level security;
alter table public.case_visitations enable row level security;
alter table public.case_milestones enable row level security;
alter table public.reunification_readiness_indices enable row level security;

drop policy if exists assessment_metadata_select on public.assessment_instruments;
create policy assessment_metadata_select on public.assessment_instruments
for select to authenticated
using (true);

drop policy if exists assessment_metadata_manage on public.assessment_instruments;
create policy assessment_metadata_manage on public.assessment_instruments
for all to authenticated
using (public.can_manage_assessments())
with check (public.can_manage_assessments());

drop policy if exists assessment_domains_select on public.assessment_domains;
create policy assessment_domains_select on public.assessment_domains for select to authenticated using (true);
drop policy if exists assessment_domains_manage on public.assessment_domains;
create policy assessment_domains_manage on public.assessment_domains for all to authenticated using (public.can_manage_assessments()) with check (public.can_manage_assessments());

drop policy if exists assessment_items_select on public.assessment_items;
create policy assessment_items_select on public.assessment_items for select to authenticated using (true);
drop policy if exists assessment_items_manage on public.assessment_items;
create policy assessment_items_manage on public.assessment_items for all to authenticated using (public.can_manage_assessments()) with check (public.can_manage_assessments());

drop policy if exists assessment_options_select on public.assessment_item_response_options;
create policy assessment_options_select on public.assessment_item_response_options for select to authenticated using (true);
drop policy if exists assessment_options_manage on public.assessment_item_response_options;
create policy assessment_options_manage on public.assessment_item_response_options for all to authenticated using (public.can_manage_assessments()) with check (public.can_manage_assessments());

drop policy if exists assessment_bands_select on public.assessment_scoring_bands;
create policy assessment_bands_select on public.assessment_scoring_bands for select to authenticated using (true);
drop policy if exists assessment_bands_manage on public.assessment_scoring_bands;
create policy assessment_bands_manage on public.assessment_scoring_bands for all to authenticated using (public.can_manage_assessments()) with check (public.can_manage_assessments());

drop policy if exists assessment_overrides_select on public.assessment_critical_overrides;
create policy assessment_overrides_select on public.assessment_critical_overrides for select to authenticated using (public.can_manage_assessments());
drop policy if exists assessment_overrides_manage on public.assessment_critical_overrides;
create policy assessment_overrides_manage on public.assessment_critical_overrides for all to authenticated using (public.can_manage_assessments()) with check (public.can_manage_assessments());

drop policy if exists reunification_cases_select on public.reunification_cases;
create policy reunification_cases_select on public.reunification_cases
for select to authenticated
using (
  owner_id = (select auth.uid())
  or parent_user_id = (select auth.uid())
  or worker_user_id = (select auth.uid())
  or public.can_manage_assessments()
);

drop policy if exists reunification_cases_insert on public.reunification_cases;
create policy reunification_cases_insert on public.reunification_cases
for insert to authenticated
with check (
  owner_id = (select auth.uid())
  or parent_user_id = (select auth.uid())
  or worker_user_id = (select auth.uid())
  or public.can_manage_assessments()
);

drop policy if exists reunification_cases_update on public.reunification_cases;
create policy reunification_cases_update on public.reunification_cases
for update to authenticated
using (
  owner_id = (select auth.uid())
  or worker_user_id = (select auth.uid())
  or public.can_manage_assessments()
)
with check (
  owner_id = (select auth.uid())
  or worker_user_id = (select auth.uid())
  or public.can_manage_assessments()
);

drop policy if exists assessment_records_select on public.assessment_records;
create policy assessment_records_select on public.assessment_records
for select to authenticated
using (
  parent_user_id = (select auth.uid())
  or worker_user_id = (select auth.uid())
  or created_by = (select auth.uid())
  or public.can_manage_assessments()
);

drop policy if exists assessment_records_insert on public.assessment_records;
create policy assessment_records_insert on public.assessment_records
for insert to authenticated
with check (
  created_by = (select auth.uid())
  or worker_user_id = (select auth.uid())
  or public.can_manage_assessments()
);

drop policy if exists assessment_records_update on public.assessment_records;
create policy assessment_records_update on public.assessment_records
for update to authenticated
using (
  created_by = (select auth.uid())
  or worker_user_id = (select auth.uid())
  or public.can_manage_assessments()
)
with check (
  created_by = (select auth.uid())
  or worker_user_id = (select auth.uid())
  or public.can_manage_assessments()
);

drop policy if exists assessment_child_rows_select on public.assessment_responses;
create policy assessment_child_rows_select on public.assessment_responses
for select to authenticated
using (
  exists (
    select 1 from public.assessment_records r
    where r.id = assessment_id
    and (
      r.parent_user_id = (select auth.uid())
      or r.worker_user_id = (select auth.uid())
      or r.created_by = (select auth.uid())
      or public.can_manage_assessments()
    )
  )
);

drop policy if exists assessment_child_rows_insert on public.assessment_responses;
create policy assessment_child_rows_insert on public.assessment_responses
for insert to authenticated
with check (
  created_by = (select auth.uid())
  or public.can_manage_assessments()
);

drop policy if exists assessment_domain_scores_select on public.assessment_domain_scores;
create policy assessment_domain_scores_select on public.assessment_domain_scores
for select to authenticated
using (
  exists (
    select 1 from public.assessment_records r
    where r.id = assessment_id
    and (
      r.parent_user_id = (select auth.uid())
      or r.worker_user_id = (select auth.uid())
      or r.created_by = (select auth.uid())
      or public.can_manage_assessments()
    )
  )
);

drop policy if exists assessment_domain_scores_manage on public.assessment_domain_scores;
create policy assessment_domain_scores_manage on public.assessment_domain_scores
for all to authenticated
using (public.can_manage_assessments())
with check (public.can_manage_assessments());

drop policy if exists assessment_scores_select on public.assessment_scores;
create policy assessment_scores_select on public.assessment_scores
for select to authenticated
using (
  exists (
    select 1 from public.assessment_records r
    where r.id = assessment_id
    and (
      r.parent_user_id = (select auth.uid())
      or r.worker_user_id = (select auth.uid())
      or r.created_by = (select auth.uid())
      or public.can_manage_assessments()
    )
  )
);

drop policy if exists assessment_scores_manage on public.assessment_scores;
create policy assessment_scores_manage on public.assessment_scores
for all to authenticated
using (public.can_manage_assessments())
with check (public.can_manage_assessments());

drop policy if exists assessment_worker_case_rows on public.assessment_contradictions;
create policy assessment_worker_case_rows on public.assessment_contradictions
for all to authenticated
using (
  worker_user_id = (select auth.uid())
  or created_by = (select auth.uid())
  or public.can_manage_assessments()
)
with check (
  worker_user_id = (select auth.uid())
  or created_by = (select auth.uid())
  or public.can_manage_assessments()
);

drop policy if exists assessment_collaterals_worker_rows on public.assessment_collaterals;
create policy assessment_collaterals_worker_rows on public.assessment_collaterals
for all to authenticated
using (
  worker_user_id = (select auth.uid())
  or created_by = (select auth.uid())
  or public.can_manage_assessments()
)
with check (
  worker_user_id = (select auth.uid())
  or created_by = (select auth.uid())
  or public.can_manage_assessments()
);

drop policy if exists service_providers_rows on public.service_providers;
create policy service_providers_rows on public.service_providers
for all to authenticated
using (
  owner_id = (select auth.uid())
  or public.can_manage_assessments()
)
with check (
  owner_id = (select auth.uid())
  or public.can_manage_assessments()
);

drop policy if exists case_plan_goals_case_rows on public.case_plan_goals;
create policy case_plan_goals_case_rows on public.case_plan_goals
for all to authenticated
using (
  parent_user_id = (select auth.uid())
  or created_by = (select auth.uid())
  or public.can_manage_assessments()
)
with check (
  parent_user_id = (select auth.uid())
  or created_by = (select auth.uid())
  or public.can_manage_assessments()
);

drop policy if exists case_plan_objectives_case_rows on public.case_plan_objectives;
create policy case_plan_objectives_case_rows on public.case_plan_objectives
for all to authenticated
using (
  created_by = (select auth.uid())
  or public.can_manage_assessments()
  or exists (
    select 1 from public.case_plan_goals g
    where g.id = goal_id
    and g.parent_user_id = (select auth.uid())
  )
)
with check (
  created_by = (select auth.uid())
  or public.can_manage_assessments()
);

drop policy if exists case_referrals_case_rows on public.case_service_referrals;
create policy case_referrals_case_rows on public.case_service_referrals
for all to authenticated
using (
  parent_user_id = (select auth.uid())
  or created_by = (select auth.uid())
  or public.can_manage_assessments()
)
with check (
  parent_user_id = (select auth.uid())
  or created_by = (select auth.uid())
  or public.can_manage_assessments()
);

drop policy if exists case_safety_plans_case_rows on public.case_safety_plans;
create policy case_safety_plans_case_rows on public.case_safety_plans
for all to authenticated
using (
  parent_user_id = (select auth.uid())
  or worker_user_id = (select auth.uid())
  or created_by = (select auth.uid())
  or public.can_manage_assessments()
)
with check (
  parent_user_id = (select auth.uid())
  or worker_user_id = (select auth.uid())
  or created_by = (select auth.uid())
  or public.can_manage_assessments()
);

drop policy if exists case_court_hearings_worker_rows on public.case_court_hearings;
create policy case_court_hearings_worker_rows on public.case_court_hearings
for all to authenticated
using (
  created_by = (select auth.uid())
  or public.can_manage_assessments()
)
with check (
  created_by = (select auth.uid())
  or public.can_manage_assessments()
);

drop policy if exists case_progress_notes_worker_rows on public.case_progress_notes;
create policy case_progress_notes_worker_rows on public.case_progress_notes
for all to authenticated
using (
  parent_user_id = (select auth.uid())
  or worker_user_id = (select auth.uid())
  or created_by = (select auth.uid())
  or public.can_manage_assessments()
)
with check (
  parent_user_id = (select auth.uid())
  or worker_user_id = (select auth.uid())
  or created_by = (select auth.uid())
  or public.can_manage_assessments()
);

drop policy if exists case_visitations_case_rows on public.case_visitations;
create policy case_visitations_case_rows on public.case_visitations
for all to authenticated
using (
  parent_user_id = (select auth.uid())
  or created_by = (select auth.uid())
  or public.can_manage_assessments()
)
with check (
  parent_user_id = (select auth.uid())
  or created_by = (select auth.uid())
  or public.can_manage_assessments()
);

drop policy if exists case_milestones_case_rows on public.case_milestones;
create policy case_milestones_case_rows on public.case_milestones
for all to authenticated
using (
  parent_user_id = (select auth.uid())
  or created_by = (select auth.uid())
  or public.can_manage_assessments()
)
with check (
  parent_user_id = (select auth.uid())
  or created_by = (select auth.uid())
  or public.can_manage_assessments()
);

drop policy if exists readiness_indices_case_rows on public.reunification_readiness_indices;
create policy readiness_indices_case_rows on public.reunification_readiness_indices
for all to authenticated
using (
  parent_user_id = (select auth.uid())
  or created_by = (select auth.uid())
  or public.can_manage_assessments()
)
with check (
  parent_user_id = (select auth.uid())
  or created_by = (select auth.uid())
  or public.can_manage_assessments()
);

create index if not exists idx_reunification_cases_owner on public.reunification_cases(owner_id);
create index if not exists idx_reunification_cases_parent on public.reunification_cases(parent_user_id);
create index if not exists idx_reunification_cases_worker on public.reunification_cases(worker_user_id);
create index if not exists idx_assessment_records_case_date on public.assessment_records(case_id, assessment_date desc);
create index if not exists idx_assessment_records_parent on public.assessment_records(parent_user_id);
create index if not exists idx_assessment_responses_assessment on public.assessment_responses(assessment_id);
create index if not exists idx_assessment_domain_scores_assessment on public.assessment_domain_scores(assessment_id);
create index if not exists idx_assessment_contradictions_case on public.assessment_contradictions(case_id, severity);
create index if not exists idx_assessment_collaterals_case on public.assessment_collaterals(case_id, received_at desc);
create index if not exists idx_service_providers_owner on public.service_providers(owner_id, active);
create index if not exists idx_case_plan_goals_case on public.case_plan_goals(case_id, status);
create index if not exists idx_case_plan_objectives_goal on public.case_plan_objectives(goal_id, status);
create index if not exists idx_case_referrals_case on public.case_service_referrals(case_id, status);
create index if not exists idx_case_safety_plans_case on public.case_safety_plans(case_id, status);
create index if not exists idx_case_court_hearings_case on public.case_court_hearings(case_id, hearing_date desc);
create index if not exists idx_case_progress_notes_case on public.case_progress_notes(case_id, created_at desc);
create index if not exists idx_case_visitations_case on public.case_visitations(case_id, visit_date desc);
create index if not exists idx_case_milestones_case on public.case_milestones(case_id, status);
create index if not exists idx_readiness_indices_case on public.reunification_readiness_indices(case_id, computed_at desc);
