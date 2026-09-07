create extension if not exists pgcrypto;

create table if not exists public.assessment_frameworks (
  id uuid primary key default gen_random_uuid(),
  framework_code text not null unique,
  framework_name text not null,
  framework_description text not null,
  audience_types text[] not null default '{}',
  court_relevant boolean not null default false,
  human_review_required boolean not null default true,
  lifecycle_status text not null default 'draft',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.assessment_template_versions (
  id uuid primary key default gen_random_uuid(),
  framework_id uuid references public.assessment_frameworks(id) on delete cascade,
  template_code text not null,
  template_version integer not null,
  template_name text not null,
  assessment_type text not null,
  target_subject text not null,
  domains jsonb not null default '[]'::jsonb,
  scoring_model jsonb not null default '{}'::jsonb,
  evidence_requirements jsonb not null default '[]'::jsonb,
  lifecycle_status text not null default 'draft',
  approved_by uuid references auth.users(id) on delete set null,
  effective_from timestamptz,
  constraint assessment_template_version_unique unique (template_code, template_version)
);

create table if not exists public.assessment_rubrics (
  id uuid primary key default gen_random_uuid(),
  rubric_code text not null,
  rubric_version integer not null,
  rubric_name text not null,
  rubric_domain text not null,
  rating_scale jsonb not null,
  anchor_descriptions jsonb not null default '[]'::jsonb,
  requires_evidence boolean not null default true,
  human_review_required boolean not null default true,
  active boolean not null default true,
  constraint assessment_rubric_unique unique (rubric_code, rubric_version)
);

create table if not exists public.assessment_behaviour_rating_items (
  id uuid primary key default gen_random_uuid(),
  template_version_id uuid references public.assessment_template_versions(id) on delete cascade,
  rubric_id uuid references public.assessment_rubrics(id) on delete set null,
  item_code text not null,
  item_text text not null,
  domain text not null,
  protective_factor_codes text[] not null default '{}',
  risk_factor_codes text[] not null default '{}',
  evidence_required boolean not null default true,
  display_order integer not null default 0,
  unique (template_version_id, item_code)
);

create table if not exists public.assessment_protective_factors (
  id uuid primary key default gen_random_uuid(),
  factor_code text not null unique,
  factor_name text not null,
  factor_description text not null,
  factor_domain text not null,
  observable_indicators jsonb not null default '[]'::jsonb,
  evidence_examples jsonb not null default '[]'::jsonb,
  active boolean not null default true
);

create table if not exists public.assessment_risk_factors (
  id uuid primary key default gen_random_uuid(),
  factor_code text not null unique,
  factor_name text not null,
  factor_description text not null,
  factor_domain text not null,
  severity_guidance jsonb not null default '{}'::jsonb,
  required_review_level text not null default 'qualified_reviewer',
  active boolean not null default true
);

create table if not exists public.assessment_records (
  id uuid primary key default gen_random_uuid(),
  assessment_reference text not null unique,
  template_version_id uuid references public.assessment_template_versions(id) on delete restrict,
  case_id uuid references public.cases(id) on delete set null,
  parent_user_id uuid references auth.users(id) on delete set null,
  child_user_id uuid,
  subject_type text not null,
  subject_reference text,
  assessment_status text not null default 'draft',
  assessment_started_at timestamptz not null default now(),
  assessment_completed_at timestamptz,
  completed_by uuid references auth.users(id) on delete set null,
  human_review_status text not null default 'pending'
);

alter table public.assessment_records add column if not exists assessment_reference text;
alter table public.assessment_records add column if not exists template_version_id uuid references public.assessment_template_versions(id) on delete restrict;
alter table public.assessment_records add column if not exists case_id uuid references public.cases(id) on delete set null;
alter table public.assessment_records add column if not exists parent_user_id uuid references auth.users(id) on delete set null;
alter table public.assessment_records add column if not exists child_user_id uuid;
alter table public.assessment_records add column if not exists subject_type text not null default 'parent';
alter table public.assessment_records add column if not exists subject_reference text;
alter table public.assessment_records add column if not exists assessment_status text not null default 'draft';
alter table public.assessment_records add column if not exists assessment_started_at timestamptz not null default now();
alter table public.assessment_records add column if not exists assessment_completed_at timestamptz;
alter table public.assessment_records add column if not exists completed_by uuid references auth.users(id) on delete set null;
alter table public.assessment_records add column if not exists human_review_status text not null default 'pending';

create table if not exists public.assessment_responses_structured (
  id uuid primary key default gen_random_uuid(),
  assessment_record_id uuid not null references public.assessment_records(id) on delete cascade,
  item_id uuid references public.assessment_behaviour_rating_items(id) on delete set null,
  response_value jsonb not null,
  response_text text,
  confidence_level text not null default 'medium',
  evidence_item_ids uuid[] not null default '{}',
  recorded_by uuid references auth.users(id) on delete set null,
  recorded_at timestamptz not null default now()
);

create table if not exists public.assessment_scores (
  id uuid primary key default gen_random_uuid(),
  assessment_record_id uuid not null references public.assessment_records(id) on delete cascade,
  score_reference text not null unique,
  domain text not null,
  raw_score numeric,
  normalized_score numeric,
  risk_level text,
  protective_strength text,
  confidence_status text not null default 'provisional',
  evidence_count integer not null default 0,
  calculated_at timestamptz not null default now()
);

alter table public.assessment_scores add column if not exists assessment_record_id uuid references public.assessment_records(id) on delete cascade;
alter table public.assessment_scores add column if not exists score_reference text;
alter table public.assessment_scores add column if not exists domain text not null default 'overall';
alter table public.assessment_scores add column if not exists raw_score numeric;
alter table public.assessment_scores add column if not exists normalized_score numeric;
alter table public.assessment_scores add column if not exists risk_level text;
alter table public.assessment_scores add column if not exists protective_strength text;
alter table public.assessment_scores add column if not exists confidence_status text not null default 'provisional';
alter table public.assessment_scores add column if not exists evidence_count integer not null default 0;
alter table public.assessment_scores add column if not exists calculated_at timestamptz not null default now();

create table if not exists public.assessment_score_overrides (
  id uuid primary key default gen_random_uuid(),
  assessment_score_id uuid not null references public.assessment_scores(id) on delete cascade,
  override_reason text not null,
  previous_score numeric,
  override_score numeric,
  critical_override boolean not null default false,
  evidence_summary text not null,
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.assessment_evidence_maps (
  id uuid primary key default gen_random_uuid(),
  assessment_record_id uuid not null references public.assessment_records(id) on delete cascade,
  evidence_item_id uuid references public.evidence_items(id) on delete set null,
  linked_learning_evidence_submission_id uuid references public.learning_evidence_submissions(id) on delete set null,
  evidence_role text not null,
  supports_domain text,
  supports_factor_code text,
  evidence_strength text not null default 'supporting',
  reliability_status text not null default 'unreviewed',
  contradiction_flag boolean not null default false,
  mapped_by uuid references auth.users(id) on delete set null,
  mapped_at timestamptz not null default now()
);

create table if not exists public.evidence_upload_batches (
  id uuid primary key default gen_random_uuid(),
  batch_reference text not null unique,
  owner_user_id uuid references auth.users(id) on delete set null,
  case_id uuid references public.cases(id) on delete set null,
  upload_context text not null,
  expected_item_count integer,
  received_item_count integer not null default 0,
  integrity_status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.evidence_timeline_events (
  id uuid primary key default gen_random_uuid(),
  timeline_reference text not null unique,
  case_id uuid references public.cases(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  child_user_id uuid,
  event_type text not null,
  event_title text not null,
  event_summary text,
  event_at timestamptz not null,
  source_table text,
  source_id uuid,
  evidence_item_ids uuid[] not null default '{}',
  visibility text not null default 'worker_review'
);

create table if not exists public.parent_progress_assessments (
  id uuid primary key default gen_random_uuid(),
  progress_reference text not null unique,
  parent_user_id uuid references auth.users(id) on delete cascade,
  case_id uuid references public.cases(id) on delete set null,
  assessment_period_start date not null,
  assessment_period_end date not null,
  learning_completion_summary jsonb not null default '{}'::jsonb,
  behaviour_change_summary jsonb not null default '{}'::jsonb,
  evidence_summary jsonb not null default '{}'::jsonb,
  worker_review_status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.child_progress_assessments (
  id uuid primary key default gen_random_uuid(),
  progress_reference text not null unique,
  child_user_id uuid not null,
  case_id uuid references public.cases(id) on delete set null,
  wellbeing_summary jsonb not null default '{}'::jsonb,
  voice_of_child_summary jsonb not null default '{}'::jsonb,
  contact_response_summary jsonb not null default '{}'::jsonb,
  privacy_constraints jsonb not null default '[]'::jsonb,
  recorded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.worker_observation_records (
  id uuid primary key default gen_random_uuid(),
  observation_reference text not null unique,
  case_id uuid references public.cases(id) on delete set null,
  worker_user_id uuid references auth.users(id) on delete set null,
  parent_user_id uuid references auth.users(id) on delete set null,
  child_user_id uuid,
  observation_type text not null,
  observation_context text not null,
  factual_observations text not null,
  interpretation_notes text,
  evidence_item_ids uuid[] not null default '{}',
  observed_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.home_visit_records (
  id uuid primary key default gen_random_uuid(),
  visit_reference text not null unique,
  case_id uuid references public.cases(id) on delete set null,
  worker_user_id uuid references auth.users(id) on delete set null,
  parent_user_id uuid references auth.users(id) on delete set null,
  visit_started_at timestamptz not null,
  visit_ended_at timestamptz,
  home_environment_observations jsonb not null default '{}'::jsonb,
  safety_observations jsonb not null default '{}'::jsonb,
  strengths_observed jsonb not null default '[]'::jsonb,
  concerns_observed jsonb not null default '[]'::jsonb,
  follow_up_required boolean not null default false
);

create table if not exists public.direct_observation_sessions (
  id uuid primary key default gen_random_uuid(),
  session_reference text not null unique,
  case_id uuid references public.cases(id) on delete set null,
  observer_user_id uuid references auth.users(id) on delete set null,
  parent_user_id uuid references auth.users(id) on delete set null,
  child_user_id uuid,
  setting text not null,
  observation_start_at timestamptz not null,
  observation_end_at timestamptz,
  interaction_summary text not null,
  attunement_indicators jsonb not null default '[]'::jsonb,
  safety_indicators jsonb not null default '[]'::jsonb,
  repair_indicators jsonb not null default '[]'::jsonb
);

create table if not exists public.collateral_report_records (
  id uuid primary key default gen_random_uuid(),
  report_reference text not null unique,
  case_id uuid references public.cases(id) on delete set null,
  source_type text not null,
  source_name text,
  report_date date,
  report_summary text not null,
  claims_made jsonb not null default '[]'::jsonb,
  evidence_item_id uuid references public.evidence_items(id) on delete set null,
  reliability_status text not null default 'unreviewed',
  recorded_at timestamptz not null default now()
);

create table if not exists public.reunification_readiness_assessments_v17 (
  id uuid primary key default gen_random_uuid(),
  readiness_reference text not null unique,
  case_id uuid references public.cases(id) on delete set null,
  parent_user_id uuid references auth.users(id) on delete set null,
  child_user_id uuid,
  assessment_record_id uuid references public.assessment_records(id) on delete set null,
  readiness_domain_scores jsonb not null default '{}'::jsonb,
  critical_barriers jsonb not null default '[]'::jsonb,
  protective_factors jsonb not null default '[]'::jsonb,
  recommendation text not null default 'human_review_required',
  confidence_status text not null default 'provisional',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz
);

create table if not exists public.reunification_readiness_panels (
  id uuid primary key default gen_random_uuid(),
  panel_reference text not null unique,
  readiness_assessment_id uuid not null references public.reunification_readiness_assessments_v17(id) on delete cascade,
  panel_type text not null,
  required_roles text[] not null default '{}',
  decision_status text not null default 'pending',
  decision_summary text,
  decided_at timestamptz
);

create table if not exists public.court_report_assessment_packages (
  id uuid primary key default gen_random_uuid(),
  package_reference text not null unique,
  case_id uuid references public.cases(id) on delete set null,
  report_id uuid references public.reports(id) on delete set null,
  assessment_record_ids uuid[] not null default '{}',
  evidence_manifest jsonb not null default '[]'::jsonb,
  readiness_assessment_id uuid references public.reunification_readiness_assessments_v17(id) on delete set null,
  source_separation_confirmed boolean not null default false,
  supervisor_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.longitudinal_outcome_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_reference text not null unique,
  case_id uuid references public.cases(id) on delete set null,
  parent_user_id uuid references auth.users(id) on delete set null,
  child_user_id uuid,
  snapshot_date date not null,
  period_label text not null,
  assessment_summary jsonb not null default '{}'::jsonb,
  evidence_summary jsonb not null default '{}'::jsonb,
  reunification_summary jsonb not null default '{}'::jsonb,
  outcome_indicators jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.assessment_framework_audit_events (
  id uuid primary key default gen_random_uuid(),
  event_reference text not null unique,
  event_category text not null,
  event_action text not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  case_id uuid references public.cases(id) on delete set null,
  target_type text not null,
  target_id uuid,
  event_metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create or replace function public.can_finalize_assessment_record(p_assessment_record_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.assessment_records r
    join public.assessment_template_versions t on t.id = r.template_version_id
    where r.id = p_assessment_record_id
      and r.assessment_status in ('draft', 'in_review')
      and r.human_review_status = 'approved'
      and exists (select 1 from public.assessment_responses_structured rs where rs.assessment_record_id = r.id)
      and not exists (
        select 1
        from public.assessment_scores s
        where s.assessment_record_id = r.id
          and s.confidence_status in ('unsupported', 'insufficient_evidence')
      )
      and (
        jsonb_array_length(t.evidence_requirements) = 0
        or exists (select 1 from public.assessment_evidence_maps m where m.assessment_record_id = r.id)
      )
  );
$$;

create or replace function public.can_export_court_assessment_package(p_package_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.court_report_assessment_packages p
    where p.id = p_package_id
      and p.source_separation_confirmed = true
      and p.supervisor_approved = true
      and jsonb_array_length(p.evidence_manifest) > 0
  );
$$;

create or replace function public.can_rely_on_reunification_readiness(p_readiness_assessment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.reunification_readiness_assessments_v17 r
    where r.id = p_readiness_assessment_id
      and r.reviewed_by is not null
      and r.confidence_status in ('reviewed', 'high_confidence')
      and jsonb_array_length(r.critical_barriers) = 0
  );
$$;

create index if not exists idx_assessment_records_case_status on public.assessment_records(case_id, assessment_status, human_review_status);
create index if not exists idx_assessment_evidence_maps_record on public.assessment_evidence_maps(assessment_record_id, reliability_status);
create index if not exists idx_evidence_timeline_case_time on public.evidence_timeline_events(case_id, event_at desc);
create index if not exists idx_parent_progress_case_period on public.parent_progress_assessments(case_id, assessment_period_end desc);
create index if not exists idx_child_progress_case_time on public.child_progress_assessments(case_id, created_at desc);
create index if not exists idx_worker_observations_case_time on public.worker_observation_records(case_id, observed_at desc);
create index if not exists idx_readiness_case_review on public.reunification_readiness_assessments_v17(case_id, reviewed_at desc);
create index if not exists idx_longitudinal_case_snapshot on public.longitudinal_outcome_snapshots(case_id, snapshot_date desc);

grant select, insert, update on
  public.assessment_frameworks,
  public.assessment_template_versions,
  public.assessment_rubrics,
  public.assessment_behaviour_rating_items,
  public.assessment_protective_factors,
  public.assessment_risk_factors,
  public.assessment_records,
  public.assessment_responses_structured,
  public.assessment_scores,
  public.assessment_score_overrides,
  public.assessment_evidence_maps,
  public.evidence_upload_batches,
  public.evidence_timeline_events,
  public.parent_progress_assessments,
  public.child_progress_assessments,
  public.worker_observation_records,
  public.home_visit_records,
  public.direct_observation_sessions,
  public.collateral_report_records,
  public.reunification_readiness_assessments_v17,
  public.reunification_readiness_panels,
  public.court_report_assessment_packages,
  public.longitudinal_outcome_snapshots,
  public.assessment_framework_audit_events
to authenticated;

alter table public.assessment_frameworks enable row level security;
alter table public.assessment_template_versions enable row level security;
alter table public.assessment_rubrics enable row level security;
alter table public.assessment_behaviour_rating_items enable row level security;
alter table public.assessment_protective_factors enable row level security;
alter table public.assessment_risk_factors enable row level security;
alter table public.assessment_records enable row level security;
alter table public.assessment_responses_structured enable row level security;
alter table public.assessment_scores enable row level security;
alter table public.assessment_score_overrides enable row level security;
alter table public.assessment_evidence_maps enable row level security;
alter table public.evidence_upload_batches enable row level security;
alter table public.evidence_timeline_events enable row level security;
alter table public.parent_progress_assessments enable row level security;
alter table public.child_progress_assessments enable row level security;
alter table public.worker_observation_records enable row level security;
alter table public.home_visit_records enable row level security;
alter table public.direct_observation_sessions enable row level security;
alter table public.collateral_report_records enable row level security;
alter table public.reunification_readiness_assessments_v17 enable row level security;
alter table public.reunification_readiness_panels enable row level security;
alter table public.court_report_assessment_packages enable row level security;
alter table public.longitudinal_outcome_snapshots enable row level security;
alter table public.assessment_framework_audit_events enable row level security;

create policy "Assessment catalogues readable by signed-in users" on public.assessment_frameworks for select to authenticated using (lifecycle_status in ('active', 'published') or public.current_user_has_role('admin'));
create policy "Assessment catalogues managed by admins" on public.assessment_frameworks for all to authenticated using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));
create policy "Assessment templates readable by signed-in users" on public.assessment_template_versions for select to authenticated using (lifecycle_status in ('active', 'published') or public.current_user_has_role('admin'));
create policy "Assessment templates managed by admins" on public.assessment_template_versions for all to authenticated using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));
create policy "Assessment rubrics readable by signed-in users" on public.assessment_rubrics for select to authenticated using (active = true or public.current_user_has_role('admin'));
create policy "Assessment factor libraries readable by signed-in users" on public.assessment_protective_factors for select to authenticated using (active = true or public.current_user_has_role('admin'));
create policy "Assessment risk libraries readable by signed-in users" on public.assessment_risk_factors for select to authenticated using (active = true or public.current_user_has_role('admin'));
create policy "Assessment records case access" on public.assessment_records for all to authenticated using (parent_user_id = auth.uid() or completed_by = auth.uid() or public.current_user_has_role('admin')) with check (parent_user_id = auth.uid() or completed_by = auth.uid() or public.current_user_has_role('admin'));
create policy "Assessment child progress worker access" on public.child_progress_assessments for all to authenticated using (recorded_by = auth.uid() or public.current_user_has_role('admin')) with check (recorded_by = auth.uid() or public.current_user_has_role('admin'));
create policy "Assessment parent progress participant access" on public.parent_progress_assessments for all to authenticated using (parent_user_id = auth.uid() or public.current_user_has_role('admin')) with check (parent_user_id = auth.uid() or public.current_user_has_role('admin'));
create policy "Assessment worker observations author access" on public.worker_observation_records for all to authenticated using (worker_user_id = auth.uid() or public.current_user_has_role('admin')) with check (worker_user_id = auth.uid() or public.current_user_has_role('admin'));
create policy "Assessment evidence maps linked record access" on public.assessment_evidence_maps for all to authenticated using (exists (select 1 from public.assessment_records r where r.id = assessment_record_id and (r.parent_user_id = auth.uid() or r.completed_by = auth.uid() or public.current_user_has_role('admin')))) with check (exists (select 1 from public.assessment_records r where r.id = assessment_record_id and (r.parent_user_id = auth.uid() or r.completed_by = auth.uid() or public.current_user_has_role('admin'))));
create policy "Assessment audit appendable" on public.assessment_framework_audit_events for insert to authenticated with check (actor_user_id = auth.uid() or public.current_user_has_role('admin'));
create policy "Assessment audit readable by admins" on public.assessment_framework_audit_events for select to authenticated using (public.current_user_has_role('admin'));

revoke all on function public.can_finalize_assessment_record(uuid) from public;
revoke all on function public.can_export_court_assessment_package(uuid) from public;
revoke all on function public.can_rely_on_reunification_readiness(uuid) from public;
grant execute on function public.can_finalize_assessment_record(uuid) to authenticated;
grant execute on function public.can_export_court_assessment_package(uuid) to authenticated;
grant execute on function public.can_rely_on_reunification_readiness(uuid) to authenticated;
