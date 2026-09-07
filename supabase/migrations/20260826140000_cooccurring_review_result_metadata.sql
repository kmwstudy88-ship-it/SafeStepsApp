-- Store co-occurring review safety metadata on the canonical assessment records.
-- The review remains excluded from readiness composites and requires human review.

alter table public.assessment_records
  add column if not exists case_plan_stream text
    check (case_plan_stream in ('victim_survivor', 'person_using_violence', 'not_applicable'));

alter table public.assessment_scores
  add column if not exists critical_item_codes text[] not null default '{}',
  add column if not exists cross_domain_flags text[] not null default '{}',
  add column if not exists human_review_required boolean not null default false,
  add column if not exists readiness_composite_eligible boolean not null default true;

create index if not exists assessment_records_case_instrument_date_idx
  on public.assessment_records (case_id, instrument_id, assessment_date desc)
  where status = 'completed';

comment on column public.assessment_records.case_plan_stream is
  'Separates victim-survivor and person-using-violence administrations and case-plan outputs.';
comment on column public.assessment_scores.critical_item_codes is
  'Triggered critical item codes retained for review and reporting; these are not averaged away.';
comment on column public.assessment_scores.cross_domain_flags is
  'Safety and interpretation rules raised while scoring, including non-offset and plan-separation rules.';
comment on column public.assessment_scores.readiness_composite_eligible is
  'False for concern-oriented or otherwise ineligible instruments; enforced again by readiness services.';
