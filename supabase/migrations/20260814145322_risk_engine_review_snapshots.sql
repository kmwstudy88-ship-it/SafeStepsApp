alter table public.safety_risk_assessments
  add column if not exists raw_risk_score numeric,
  add column if not exists contextual_risk_score numeric,
  add column if not exists applied_protective_mitigation numeric,
  add column if not exists confidence_score numeric,
  add column if not exists confidence_label text,
  add column if not exists calculation_version text,
  add column if not exists calculation_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists professional_review_status text not null default 'pending',
  add column if not exists reviewed_by_user_id uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewer_rationale text,
  add column if not exists automated_decision_permitted boolean not null default false,
  add column if not exists decision_boundary text not null default
    'Decision-support only. This result cannot determine removal, contact, parental capacity, guilt, or case outcome.';

alter table public.safety_risk_assessments
  drop constraint if exists safety_risk_assessments_raw_score_check,
  add constraint safety_risk_assessments_raw_score_check
    check (raw_risk_score is null or raw_risk_score between 0 and 100),
  drop constraint if exists safety_risk_assessments_contextual_score_check,
  add constraint safety_risk_assessments_contextual_score_check
    check (contextual_risk_score is null or contextual_risk_score between 0 and 100),
  drop constraint if exists safety_risk_assessments_mitigation_check,
  add constraint safety_risk_assessments_mitigation_check
    check (
      applied_protective_mitigation is null
      or (
        applied_protective_mitigation >= 0
        and raw_risk_score is not null
        and applied_protective_mitigation <= raw_risk_score * 0.35
      )
    ),
  drop constraint if exists safety_risk_assessments_confidence_score_check,
  add constraint safety_risk_assessments_confidence_score_check
    check (confidence_score is null or confidence_score between 0 and 1),
  drop constraint if exists safety_risk_assessments_confidence_label_check,
  add constraint safety_risk_assessments_confidence_label_check
    check (confidence_label is null or confidence_label in ('INSUFFICIENT','LOW','MODERATE','HIGH')),
  drop constraint if exists safety_risk_assessments_review_status_check,
  add constraint safety_risk_assessments_review_status_check
    check (professional_review_status in ('pending','accepted','revised','rejected')),
  drop constraint if exists safety_risk_assessments_no_automated_decision_check,
  add constraint safety_risk_assessments_no_automated_decision_check
    check (automated_decision_permitted = false),
  drop constraint if exists safety_risk_assessments_locked_review_check,
  add constraint safety_risk_assessments_locked_review_check
    check (
      not locked
      or (
        professional_review_status in ('accepted','revised')
        and reviewed_by_user_id is not null
        and reviewed_at is not null
        and length(trim(coalesce(reviewer_rationale, ''))) >= 20
      )
    );

create table if not exists public.safety_risk_calculation_snapshots (
  id uuid primary key default extensions.gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_id uuid not null references public.cases(id) on delete cascade,
  risk_assessment_id uuid not null references public.safety_risk_assessments(id) on delete cascade,
  calculation_version text not null,
  input_snapshot jsonb not null,
  output_snapshot jsonb not null,
  input_hash text generated always as (
    encode(extensions.digest(input_snapshot::text, 'sha256'), 'hex')
  ) stored,
  output_hash text generated always as (
    encode(extensions.digest(output_snapshot::text, 'sha256'), 'hex')
  ) stored,
  created_by_user_id uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  check (octet_length(input_snapshot::text) <= 1048576),
  check (octet_length(output_snapshot::text) <= 1048576),
  check (coalesce((output_snapshot ->> 'automatedDecisionPermitted')::boolean, false) = false),
  check (coalesce((output_snapshot ->> 'humanReviewRequired')::boolean, true) = true)
);

create index if not exists safety_risk_snapshots_assessment_created_idx
  on public.safety_risk_calculation_snapshots(risk_assessment_id, created_at desc);
create index if not exists safety_risk_snapshots_case_created_idx
  on public.safety_risk_calculation_snapshots(case_id, created_at desc);

create or replace function private.reject_risk_snapshot_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception 'SafeSteps risk calculation snapshots are append-only';
end;
$$;

revoke all on function private.reject_risk_snapshot_mutation() from public, anon, authenticated;

drop trigger if exists safety_risk_snapshot_no_update_delete
  on public.safety_risk_calculation_snapshots;
create trigger safety_risk_snapshot_no_update_delete
  before update or delete on public.safety_risk_calculation_snapshots
  for each row execute function private.reject_risk_snapshot_mutation();

alter table public.safety_risk_calculation_snapshots enable row level security;

drop policy if exists safety_risk_snapshots_select
  on public.safety_risk_calculation_snapshots;
create policy safety_risk_snapshots_select
on public.safety_risk_calculation_snapshots for select to authenticated
using (public.has_safety_access(case_id));

drop policy if exists safety_risk_snapshots_insert
  on public.safety_risk_calculation_snapshots;
create policy safety_risk_snapshots_insert
on public.safety_risk_calculation_snapshots for insert to authenticated
with check (
  created_by_user_id = (select auth.uid())
  and (
    public.has_permission(tenant_id, 'risk.review')
    or public.can_manage_safety(case_id)
  )
);

revoke all on public.safety_risk_calculation_snapshots from anon;
revoke all on public.safety_risk_calculation_snapshots from authenticated;
grant select, insert on public.safety_risk_calculation_snapshots to authenticated;

comment on column public.safety_risk_assessments.automated_decision_permitted is
  'Must remain false. Risk assessments support professional judgement and cannot make case decisions.';
comment on table public.safety_risk_calculation_snapshots is
  'Immutable inputs and outputs for reproducible, professionally reviewed risk calculations.';
