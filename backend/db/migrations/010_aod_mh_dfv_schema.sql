begin;

-- AOD/MH/DFV assessment context for one administration of the instrument.
-- The core SafeSteps assessment instance is public.assessment_records; this
-- table stores the instrument-specific timepoint and subject-role metadata.
create table if not exists public.aod_mh_dfv_assessment_context (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null unique references public.assessment_records(id) on delete cascade,
  case_id uuid not null references public.reunification_cases(id) on delete cascade,
  instrument_id uuid not null references public.assessment_instruments(id),
  timepoint_number integer not null check (timepoint_number >= 1),
  subject_role text not null check (
    subject_role in (
      'protective_parent',
      'other_caregiver',
      'perpetrator_tracked_separately'
    )
  ),
  composite_score numeric(5,2),
  band text,
  forced_band text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (case_id, instrument_id, timepoint_number, subject_role)
);

create index if not exists idx_aod_mh_dfv_context_case
  on public.aod_mh_dfv_assessment_context(case_id, instrument_id, timepoint_number);

create index if not exists idx_aod_mh_dfv_context_assessment
  on public.aod_mh_dfv_assessment_context(assessment_id);

drop trigger if exists trg_aod_mh_dfv_context_updated_at on public.aod_mh_dfv_assessment_context;
create trigger trg_aod_mh_dfv_context_updated_at
  before update on public.aod_mh_dfv_assessment_context
  for each row execute function public.set_updated_at();

-- Critical override log. Rows are append-only; corrections require a new
-- assessment record or a new log event linked to the same assessment context.
create table if not exists public.aod_mh_dfv_critical_override_log (
  id uuid primary key default gen_random_uuid(),
  context_id uuid not null references public.aod_mh_dfv_assessment_context(id) on delete cascade,
  assessment_id uuid not null references public.assessment_records(id) on delete cascade,
  override_code text not null,
  trigger_item text not null,
  trigger_value integer not null check (trigger_value between 0 and 4),
  rationale text,
  triggered_at timestamptz not null default now()
);

create index if not exists idx_aod_mh_dfv_override_context
  on public.aod_mh_dfv_critical_override_log(context_id, triggered_at desc);

create index if not exists idx_aod_mh_dfv_override_assessment
  on public.aod_mh_dfv_critical_override_log(assessment_id);

create or replace function public.prevent_aod_mh_dfv_override_log_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'aod_mh_dfv_critical_override_log is append-only; % not permitted', tg_op;
end;
$$;

drop trigger if exists trg_prevent_aod_mh_dfv_override_log_mutation
  on public.aod_mh_dfv_critical_override_log;
create trigger trg_prevent_aod_mh_dfv_override_log_mutation
  before update or delete on public.aod_mh_dfv_critical_override_log
  for each row execute function public.prevent_aod_mh_dfv_override_log_mutation();

-- Cross-domain rule flags raised during scoring for reports and supervisor review.
create table if not exists public.aod_mh_dfv_cross_domain_flags (
  id uuid primary key default gen_random_uuid(),
  context_id uuid not null references public.aod_mh_dfv_assessment_context(id) on delete cascade,
  assessment_id uuid not null references public.assessment_records(id) on delete cascade,
  rule_code text not null,
  flag_text text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_aod_mh_dfv_flags_context
  on public.aod_mh_dfv_cross_domain_flags(context_id, created_at desc);

create index if not exists idx_aod_mh_dfv_flags_assessment
  on public.aod_mh_dfv_cross_domain_flags(assessment_id);

alter table public.aod_mh_dfv_assessment_context enable row level security;
alter table public.aod_mh_dfv_critical_override_log enable row level security;
alter table public.aod_mh_dfv_cross_domain_flags enable row level security;

drop policy if exists aod_mh_dfv_context_select on public.aod_mh_dfv_assessment_context;
create policy aod_mh_dfv_context_select
on public.aod_mh_dfv_assessment_context
for select to authenticated
using (
  exists (
    select 1
    from public.assessment_records r
    where r.id = aod_mh_dfv_assessment_context.assessment_id
      and (
        r.parent_user_id = (select auth.uid())
        or r.worker_user_id = (select auth.uid())
        or r.created_by = (select auth.uid())
        or public.can_manage_assessments()
      )
  )
);

drop policy if exists aod_mh_dfv_context_insert on public.aod_mh_dfv_assessment_context;
create policy aod_mh_dfv_context_insert
on public.aod_mh_dfv_assessment_context
for insert to authenticated
with check (
  exists (
    select 1
    from public.assessment_records r
    where r.id = aod_mh_dfv_assessment_context.assessment_id
      and (
        r.worker_user_id = (select auth.uid())
        or r.created_by = (select auth.uid())
        or public.can_manage_assessments()
      )
  )
);

drop policy if exists aod_mh_dfv_context_update on public.aod_mh_dfv_assessment_context;
create policy aod_mh_dfv_context_update
on public.aod_mh_dfv_assessment_context
for update to authenticated
using (public.can_manage_assessments())
with check (public.can_manage_assessments());

drop policy if exists aod_mh_dfv_override_log_select on public.aod_mh_dfv_critical_override_log;
create policy aod_mh_dfv_override_log_select
on public.aod_mh_dfv_critical_override_log
for select to authenticated
using (
  exists (
    select 1
    from public.assessment_records r
    where r.id = aod_mh_dfv_critical_override_log.assessment_id
      and (
        r.parent_user_id = (select auth.uid())
        or r.worker_user_id = (select auth.uid())
        or r.created_by = (select auth.uid())
        or public.can_manage_assessments()
      )
  )
);

drop policy if exists aod_mh_dfv_override_log_insert on public.aod_mh_dfv_critical_override_log;
create policy aod_mh_dfv_override_log_insert
on public.aod_mh_dfv_critical_override_log
for insert to authenticated
with check (public.can_manage_assessments());

drop policy if exists aod_mh_dfv_flags_select on public.aod_mh_dfv_cross_domain_flags;
create policy aod_mh_dfv_flags_select
on public.aod_mh_dfv_cross_domain_flags
for select to authenticated
using (
  exists (
    select 1
    from public.assessment_records r
    where r.id = aod_mh_dfv_cross_domain_flags.assessment_id
      and (
        r.parent_user_id = (select auth.uid())
        or r.worker_user_id = (select auth.uid())
        or r.created_by = (select auth.uid())
        or public.can_manage_assessments()
      )
  )
);

drop policy if exists aod_mh_dfv_flags_insert on public.aod_mh_dfv_cross_domain_flags;
create policy aod_mh_dfv_flags_insert
on public.aod_mh_dfv_cross_domain_flags
for insert to authenticated
with check (public.can_manage_assessments());

grant select, insert, update on public.aod_mh_dfv_assessment_context to authenticated;
grant select, insert on public.aod_mh_dfv_critical_override_log to authenticated;
grant select, insert on public.aod_mh_dfv_cross_domain_flags to authenticated;

create or replace view public.v_aod_mh_dfv_domain_trends
with (security_invoker = true)
as
select
  ctx.case_id,
  ctx.assessment_id,
  ctx.timepoint_number,
  ctx.subject_role,
  ad.name as domain_name,
  case ad.name
    when 'DFV Safety and Coercive Control' then 'DFV_SAFETY'
    when 'AOD Impact on Caregiving Capacity' then 'AOD_IMPACT'
    when 'Mental Health Functional Impact' then 'MH_FUNCTIONAL'
    when 'Protective Capacity and Support Network' then 'PROTECTIVE_CAPACITY'
    when 'Perpetrator Accountability and Behaviour Change (where applicable)' then 'PERPETRATOR_ACCOUNTABILITY'
    when 'Coordination and Service Engagement' then 'SERVICE_COORDINATION'
    when 'Child Impact Indicators' then 'CHILD_IMPACT'
    else ad.name
  end as domain_code,
  ads.normalized_score,
  lag(ads.normalized_score) over (
    partition by ctx.case_id, ad.name, ctx.subject_role
    order by ctx.timepoint_number
  ) as prior_normalized_score
from public.aod_mh_dfv_assessment_context ctx
join public.assessment_instruments ai on ai.id = ctx.instrument_id
join public.assessment_domain_scores ads on ads.assessment_id = ctx.assessment_id
join public.assessment_domains ad on ad.id = ads.domain_id
where ai.slug = 'aod-mh-dfv-v1';

grant select on public.v_aod_mh_dfv_domain_trends to authenticated;

commit;
