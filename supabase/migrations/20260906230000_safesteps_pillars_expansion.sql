-- =============================================================
-- Migration: 20260906230000_safesteps_pillars_expansion.sql
-- SafeSteps 4 Pillars: Roleplay Scenarios, Standard Clinical
-- Assessments (CAPES, KEPS, PAFAS, FPS), Contact Visit Companion,
-- and Cryptographically Sealed Court Report Exports.
-- =============================================================

-- 1. Scenario Simulation Runs
create table if not exists public.scenario_simulation_runs (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.reunification_cases(id) on delete cascade,
  user_id uuid not null,
  scenario_id text not null,
  de_escalation_score integer not null check (de_escalation_score between 0 and 100),
  emotional_regulation_score integer not null check (emotional_regulation_score between 0 and 100),
  connection_score integer not null check (connection_score between 0 and 100),
  proficiency text not null check (proficiency in ('Emerging', 'Developing', 'Demonstrated', 'Sustained Under Stress')),
  choices_taken jsonb not null default '[]'::jsonb,
  completed_at timestamptz not null default now()
);

create index if not exists scenario_simulation_runs_case_idx
  on public.scenario_simulation_runs (case_id, completed_at desc);

create index if not exists scenario_simulation_runs_user_idx
  on public.scenario_simulation_runs (user_id, completed_at desc);

alter table public.scenario_simulation_runs enable row level security;

drop policy if exists scenario_simulation_runs_select on public.scenario_simulation_runs;
create policy scenario_simulation_runs_select on public.scenario_simulation_runs
for select to authenticated
using (
  user_id = (select auth.uid())
  or (case_id is not null and public.safesteps_has_case_access(case_id))
);

drop policy if exists scenario_simulation_runs_insert on public.scenario_simulation_runs;
create policy scenario_simulation_runs_insert on public.scenario_simulation_runs
for insert to authenticated
with check (
  user_id = (select auth.uid())
  and (case_id is null or public.safesteps_has_case_access(case_id))
);


-- 2. Clinical Assessment Submissions (CAPES, KEPS, PAFAS, FPS)
create table if not exists public.clinical_assessment_submissions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.reunification_cases(id) on delete cascade,
  user_id uuid not null,
  assessment_id text not null check (assessment_id in ('CAPES', 'KEPS', 'PAFAS', 'FPS')),
  total_score numeric not null,
  max_possible_score numeric not null,
  percentage integer not null check (percentage between 0 and 100),
  mean_score numeric,
  clinical_band text not null check (clinical_band in ('Low Concern / High Efficacy', 'Moderate / Support Indicated', 'Elevated Concern')),
  responses jsonb not null default '{}'::jsonb,
  subscale_breakdown jsonb not null default '{}'::jsonb,
  completed_at timestamptz not null default now()
);

create index if not exists clinical_assessments_case_idx
  on public.clinical_assessment_submissions (case_id, assessment_id, completed_at desc);

create index if not exists clinical_assessments_user_idx
  on public.clinical_assessment_submissions (user_id, completed_at desc);

alter table public.clinical_assessment_submissions enable row level security;

drop policy if exists clinical_assessments_select on public.clinical_assessment_submissions;
create policy clinical_assessments_select on public.clinical_assessment_submissions
for select to authenticated
using (
  user_id = (select auth.uid())
  or (case_id is not null and public.safesteps_has_case_access(case_id))
);

drop policy if exists clinical_assessments_insert on public.clinical_assessment_submissions;
create policy clinical_assessments_insert on public.clinical_assessment_submissions
for insert to authenticated
with check (
  user_id = (select auth.uid())
  and (case_id is null or public.safesteps_has_case_access(case_id))
);


-- 3. Supervised Contact Visit Companion Sessions
create table if not exists public.contact_visit_companion_sessions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.reunification_cases(id) on delete cascade,
  participant_id uuid not null,
  planned_duration_minutes integer not null default 60,
  actual_duration_minutes integer,
  phases_completed jsonb not null default '[]'::jsonb,
  activities_engaged jsonb not null default '[]'::jsonb,
  reflection_notes text,
  recorded_at timestamptz not null default now()
);

create index if not exists contact_visit_companion_case_idx
  on public.contact_visit_companion_sessions (case_id, recorded_at desc);

alter table public.contact_visit_companion_sessions enable row level security;

drop policy if exists contact_visit_companion_select on public.contact_visit_companion_sessions;
create policy contact_visit_companion_select on public.contact_visit_companion_sessions
for select to authenticated
using (
  participant_id = (select auth.uid())
  or (case_id is not null and public.safesteps_has_case_access(case_id))
);

drop policy if exists contact_visit_companion_insert on public.contact_visit_companion_sessions;
create policy contact_visit_companion_insert on public.contact_visit_companion_sessions
for insert to authenticated
with check (
  participant_id = (select auth.uid())
  and (case_id is null or public.safesteps_has_case_access(case_id))
);


-- 4. Sealed Court Progress Report Exports
create table if not exists public.court_report_exports (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.reunification_cases(id) on delete cascade,
  generated_by uuid not null,
  report_period text not null,
  sha256_hash text not null check (length(sha256_hash) = 64),
  report_data jsonb not null,
  exported_at timestamptz not null default now()
);

create index if not exists court_report_exports_case_idx
  on public.court_report_exports (case_id, exported_at desc);

alter table public.court_report_exports enable row level security;

drop policy if exists court_report_exports_select on public.court_report_exports;
create policy court_report_exports_select on public.court_report_exports
for select to authenticated
using (public.safesteps_has_case_access(case_id));

drop policy if exists court_report_exports_insert on public.court_report_exports;
create policy court_report_exports_insert on public.court_report_exports
for insert to authenticated
with check (
  generated_by = (select auth.uid())
  and public.safesteps_has_case_access(case_id)
);
