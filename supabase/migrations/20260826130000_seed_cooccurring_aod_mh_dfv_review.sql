-- Program-specific co-occurring AOD, mental health, and DFV review.
-- Higher scores mean higher concern. Results are never direct readiness inputs.

alter table public.assessment_instruments
  add column if not exists score_direction text not null default 'higher_capacity'
    check (score_direction in ('higher_capacity', 'higher_concern')),
  add column if not exists readiness_composite_eligible boolean not null default true;

insert into public.assessment_instruments (
  slug, name, version, description, instrument_type, scoring_method,
  restricted_tool, requires_licensed_assessor, is_active,
  score_direction, readiness_composite_eligible
)
values (
  'aod-mh-dfv-risk-capacity-v1',
  'Co-Occurring AOD, Mental Health and DFV Risk and Capacity Review',
  '1.0',
  'SafeSteps practitioner review framework. Higher scores mean higher concern. Not diagnostic, not validated, and not eligible for direct use in a readiness composite.',
  'risk', 'weighted_average', false, false, true,
  'higher_concern', false
)
on conflict (slug) do update set
  name = excluded.name,
  version = excluded.version,
  description = excluded.description,
  instrument_type = excluded.instrument_type,
  scoring_method = excluded.scoring_method,
  restricted_tool = excluded.restricted_tool,
  requires_licensed_assessor = excluded.requires_licensed_assessor,
  is_active = excluded.is_active,
  score_direction = excluded.score_direction,
  readiness_composite_eligible = excluded.readiness_composite_eligible;

with instrument as (
  select id from public.assessment_instruments where slug = 'aod-mh-dfv-risk-capacity-v1'
)
insert into public.assessment_domains (instrument_id, name, description, weight, display_order)
select instrument.id, domain.name, domain.description, 1::numeric, domain.display_order
from instrument
cross join (
  values
    ('DFV Safety and Coercive Control', 'Current family-violence safety concerns and safety-planning gaps.', 1),
    ('AOD Impact on Caregiving', 'Current functional caregiving concerns and support-planning gaps connected to substance use.', 2),
    ('Mental Health Functional Impact', 'Current functional effects and support gaps; diagnosis alone is not scored as risk.', 3),
    ('Protective Capacity and Support Network', 'Current gaps in protection, support, and child-safety prioritisation.', 4),
    ('Person Using Violence Accountability', 'Separate accountability stream, never applied to a victim-survivor plan.', 5),
    ('Coordination and Service Access', 'Lawful coordination, confidentiality, accessibility, and service-system barriers.', 6),
    ('Child Impact Indicators', 'Observed or child-reported impacts with source and causal limitations recorded.', 7)
) as domain(name, description, display_order)
on conflict (instrument_id, name) do update set
  description = excluded.description,
  weight = excluded.weight,
  display_order = excluded.display_order;

with instrument as (
  select id from public.assessment_instruments where slug = 'aod-mh-dfv-risk-capacity-v1'
), domains as (
  select d.id, d.name from public.assessment_domains d join instrument i on i.id = d.instrument_id
)
insert into public.assessment_items (domain_id, item_key, prompt, item_type, weight, display_order, is_critical)
select domains.id, item.item_key, item.prompt, 'likert', 1::numeric, item.display_order, item.is_critical
from domains
join (
  values
    ('DFV Safety and Coercive Control', 'DFV1', 'Current physical safety concern from a partner or former partner, based on identified evidence and the person''s account', 1, true),
    ('DFV Safety and Coercive Control', 'DFV2', 'Current coercive-control concern, including isolation, financial control, monitoring, or threats', 2, true),
    ('DFV Safety and Coercive Control', 'DFV3', 'Current child-safety concern connected to exposure to family violence or use of the child within coercive behaviour', 3, true),
    ('DFV Safety and Coercive Control', 'DFV4', 'Gap in the availability, suitability, or safe use of a current safety plan', 4, false),
    ('AOD Impact on Caregiving', 'AOD1', 'Current substance-use pattern affecting supervision, judgement, or caregiving', 1, true),
    ('AOD Impact on Caregiving', 'AOD2', 'Gap in access to or engagement with suitable concurrent AOD support', 2, false),
    ('AOD Impact on Caregiving', 'AOD3', 'Gap in relapse or recurrence planning connected to child safety', 3, false),
    ('AOD Impact on Caregiving', 'AOD4', 'Current relevance of substance use to an identified child-safety incident', 4, true),
    ('Mental Health Functional Impact', 'MH1', 'Current functional difficulty responding to the child''s emotional or physical distress', 1, false),
    ('Mental Health Functional Impact', 'MH2', 'Current functional impact on supervision or emotional availability, without treating diagnosis alone as risk', 2, true),
    ('Mental Health Functional Impact', 'MH3', 'Gap in access to suitable, trauma-informed mental health support', 3, false),
    ('Mental Health Functional Impact', 'MH4', 'Gap in understanding and planning for functional effects on parenting', 4, false),
    ('Protective Capacity and Support Network', 'PC1', 'Gap in safe, non-offending support people available to the parent and child', 1, false),
    ('Protective Capacity and Support Network', 'PC2', 'Gap in demonstrated child-safety prioritisation under relationship or substance pressure', 2, false),
    ('Protective Capacity and Support Network', 'PC3', 'Gap in demonstrated protective action when a specific risk was identified', 3, false),
    ('Person Using Violence Accountability', 'PA1', 'Gap in engagement with an appropriate behaviour-change or accountability response', 1, false),
    ('Person Using Violence Accountability', 'PA2', 'Gap in independently supported behaviour change across time and settings', 2, false),
    ('Person Using Violence Accountability', 'PA3', 'Current concern involving breaches, prohibited contact, threats, stalking, or other ongoing risk behaviour', 3, true),
    ('Coordination and Service Access', 'SC1', 'Gap in lawful, consented, and safe coordination across relevant DFV, AOD, and mental health services', 1, false),
    ('Coordination and Service Access', 'SC2', 'Unresolved conflict between service requirements, confidentiality, accessibility, or safety needs', 2, false),
    ('Child Impact Indicators', 'CI1', 'Observed child impact potentially connected to household DFV, AOD, or mental health conditions, with source and causal limits recorded', 1, false),
    ('Child Impact Indicators', 'CI2', 'Concern arising from the child''s expressed sense of safety, gathered in an age-appropriate and non-leading way', 2, false)
) as item(domain_name, item_key, prompt, display_order, is_critical)
  on item.domain_name = domains.name
on conflict (domain_id, item_key) do update set
  prompt = excluded.prompt,
  item_type = excluded.item_type,
  weight = excluded.weight,
  display_order = excluded.display_order,
  is_critical = excluded.is_critical;

with instrument as (
  select id from public.assessment_instruments where slug = 'aod-mh-dfv-risk-capacity-v1'
), items as (
  select ai.id
  from public.assessment_items ai
  join public.assessment_domains ad on ad.id = ai.domain_id
  join instrument i on i.id = ad.instrument_id
), options as (
  select * from (
    values
      ('0', '0 - No current concern identified', 0::numeric, 1),
      ('1', '1 - Low concern or minor capacity gap', 1::numeric, 2),
      ('2', '2 - Moderate concern requiring support', 2::numeric, 3),
      ('3', '3 - High concern requiring specialist review', 3::numeric, 4),
      ('4', '4 - Critical or immediate concern', 4::numeric, 5)
  ) as option(value, label, score, display_order)
)
insert into public.assessment_item_response_options (item_id, label, value, score, display_order)
select items.id, options.label, options.value, options.score, options.display_order
from items cross join options
on conflict (item_id, value) do update set
  label = excluded.label,
  score = excluded.score,
  display_order = excluded.display_order;

with instrument as (
  select id from public.assessment_instruments where slug = 'aod-mh-dfv-risk-capacity-v1'
)
insert into public.assessment_scoring_bands (
  instrument_id, label, min_score, max_score, recommendation,
  requires_supervisor_review, display_order
)
select instrument.id, band.label, band.min_score, band.max_score, band.recommendation, true, band.display_order
from instrument
cross join (
  values
    ('Low Concern', 0::numeric, 25::numeric, 'Review evidence and supports; specialist review remains required for case-plan use.', 1),
    ('Moderate Concern', 25.01::numeric, 50::numeric, 'Coordinate targeted supports and complete specialist review.', 2),
    ('High Concern', 50.01::numeric, 75::numeric, 'Complete specialist safety review and address current functional concerns.', 3),
    ('Critical Concern', 75.01::numeric, 100::numeric, 'Immediate authorised safety and supervisor review required.', 4)
) as band(label, min_score, max_score, recommendation, display_order)
where not exists (
  select 1 from public.assessment_scoring_bands existing
  where existing.instrument_id = instrument.id and existing.label = band.label
);

with instrument as (
  select id from public.assessment_instruments where slug = 'aod-mh-dfv-risk-capacity-v1'
), critical_items as (
  select ai.id, ai.item_key
  from public.assessment_items ai
  join public.assessment_domains ad on ad.id = ai.domain_id
  join instrument i on i.id = ad.instrument_id
  where ai.item_key in ('DFV1', 'DFV3', 'AOD4', 'MH2', 'PA3')
), trigger_options as (
  select ci.id as item_id, ci.item_key, option.id as option_id
  from critical_items ci
  join public.assessment_item_response_options option on option.item_id = ci.id and option.value in ('3', '4')
), forced_band as (
  select band.id
  from public.assessment_scoring_bands band
  join instrument i on i.id = band.instrument_id
  where band.label = 'Critical Concern'
)
insert into public.assessment_critical_overrides (
  instrument_id, item_id, trigger_option_id, forced_band_id, reason, requires_supervisor_review
)
select instrument.id, trigger_options.item_id, trigger_options.option_id, forced_band.id,
  'High or critical concern on ' || trigger_options.item_key || ' requires specialist and supervisor review and cannot be averaged away.',
  true
from instrument cross join forced_band cross join trigger_options
where not exists (
  select 1 from public.assessment_critical_overrides existing
  where existing.instrument_id = instrument.id
    and existing.item_id = trigger_options.item_id
    and existing.trigger_option_id = trigger_options.option_id
);
