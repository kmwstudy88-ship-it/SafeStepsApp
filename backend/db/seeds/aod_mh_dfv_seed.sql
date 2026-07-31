begin;

insert into public.assessment_instruments (
  slug,
  name,
  version,
  description,
  instrument_type,
  scoring_method,
  restricted_tool,
  requires_licensed_assessor,
  is_active
)
values (
  'aod-mh-dfv-v1',
  'Co-Occurring AOD, Mental Health and DFV Risk & Capacity Assessment',
  '1.0',
  'Decision-support assessment for co-occurring alcohol and other drug use, mental health functional impact, domestic and family violence safety, protective capacity, perpetrator accountability, service coordination, and child impact. Critical safety findings override aggregate scores.',
  'risk',
  'sum',
  false,
  false,
  true
)
on conflict (slug) do update
set
  name = excluded.name,
  version = excluded.version,
  description = excluded.description,
  instrument_type = excluded.instrument_type,
  scoring_method = excluded.scoring_method,
  restricted_tool = excluded.restricted_tool,
  requires_licensed_assessor = excluded.requires_licensed_assessor,
  is_active = excluded.is_active;

with instrument as (
  select id from public.assessment_instruments where slug = 'aod-mh-dfv-v1'
)
insert into public.assessment_domains (instrument_id, name, description, weight, display_order)
select instrument.id, domain.name, domain.description, 1::numeric, domain.display_order
from instrument
cross join (
  values
    ('DFV Safety and Coercive Control', 'Physical safety, coercive control, child exposure, and safety-plan adequacy.', 1),
    ('AOD Impact on Caregiving Capacity', 'Substance-use patterns, treatment engagement, relapse planning, and direct safety incident links.', 2),
    ('Mental Health Functional Impact', 'Functional parenting impact, supervision, treatment engagement, and insight.', 3),
    ('Protective Capacity and Support Network', 'Support networks, child-safety prioritisation, and protective action history.', 4),
    ('Perpetrator Accountability and Behaviour Change (where applicable)', 'Behaviour-change participation, demonstrated accountability, and ongoing perpetrator risk indicators.', 5),
    ('Coordination and Service Engagement', 'Cross-provider coordination and resolution of conflicting service requirements.', 6),
    ('Child Impact Indicators', 'Observed child impact and age-appropriate expressed sense of safety.', 7)
) as domain(name, description, display_order)
on conflict (instrument_id, name) do update
set
  description = excluded.description,
  weight = excluded.weight,
  display_order = excluded.display_order;

with instrument as (
  select id from public.assessment_instruments where slug = 'aod-mh-dfv-v1'
),
domain_lookup as (
  select d.id, d.name
  from public.assessment_domains d
  join instrument i on i.id = d.instrument_id
)
insert into public.assessment_items (
  domain_id,
  item_key,
  prompt,
  item_type,
  weight,
  max_value,
  display_order,
  is_critical
)
select domain_lookup.id, item.item_key, item.prompt, 'likert', 1::numeric, 4::numeric, item.display_order, item.is_critical
from domain_lookup
join (
  values
    ('DFV Safety and Coercive Control', 'DFV1', 'Current physical safety risk to parent/caregiver from partner or ex-partner', 1, true),
    ('DFV Safety and Coercive Control', 'DFV2', 'Evidence of coercive control (isolation, financial control, monitoring, threats)', 2, true),
    ('DFV Safety and Coercive Control', 'DFV3', 'Child exposure to DFV incidents (witnessed, used as weapon, present in home)', 3, true),
    ('DFV Safety and Coercive Control', 'DFV4', 'Parent''s current safety plan adequacy and use', 4, false),
    ('AOD Impact on Caregiving Capacity', 'AOD1', 'Frequency/pattern of use impairing supervision or judgment', 5, true),
    ('AOD Impact on Caregiving Capacity', 'AOD2', 'Engagement with AOD treatment (concurrent, not sequential to other goals)', 6, false),
    ('AOD Impact on Caregiving Capacity', 'AOD3', 'Relapse risk indicators and relapse management plan tied to safety plan', 7, false),
    ('AOD Impact on Caregiving Capacity', 'AOD4', 'Substance use directly implicated in prior safety incident', 8, true),
    ('Mental Health Functional Impact', 'MH1', 'Capacity to respond to child''s emotional/physical distress', 9, false),
    ('Mental Health Functional Impact', 'MH2', 'Symptom-driven impairment to supervision or emotional availability', 10, true),
    ('Mental Health Functional Impact', 'MH3', 'Engagement with mental health treatment (trauma-informed, concurrent)', 11, false),
    ('Mental Health Functional Impact', 'MH4', 'Insight into how symptoms affect parenting decisions', 12, false),
    ('Protective Capacity and Support Network', 'PC1', 'Availability of non-offending support network', 13, false),
    ('Protective Capacity and Support Network', 'PC2', 'Parent''s ability to prioritise child safety over relationship/substance pressures', 14, false),
    ('Protective Capacity and Support Network', 'PC3', 'History of protective action taken when risk identified', 15, false),
    ('Perpetrator Accountability and Behaviour Change (where applicable)', 'PA1', 'Enrollment and attendance in men''s/perpetrator behaviour change program', 16, false),
    ('Perpetrator Accountability and Behaviour Change (where applicable)', 'PA2', 'Demonstrated behaviour change independent of self-report', 17, false),
    ('Perpetrator Accountability and Behaviour Change (where applicable)', 'PA3', 'Ongoing risk indicators (breaches, contact violations, threats)', 18, true),
    ('Coordination and Service Engagement', 'SC1', 'Information sharing/coordination across DFV, AOD, MH providers in place', 19, false),
    ('Coordination and Service Engagement', 'SC2', 'Conflicting service requirements identified and resolved (e.g. confidentiality vs disclosure)', 20, false),
    ('Child Impact Indicators', 'CI1', 'Observed child behavioural/emotional impact attributable to household DFV/AOD/MH', 21, false),
    ('Child Impact Indicators', 'CI2', 'Child''s expressed sense of safety in the home (age-appropriate)', 22, false)
) as item(domain_name, item_key, prompt, display_order, is_critical)
  on item.domain_name = domain_lookup.name
on conflict (domain_id, item_key) do update
set
  prompt = excluded.prompt,
  item_type = excluded.item_type,
  weight = excluded.weight,
  max_value = excluded.max_value,
  display_order = excluded.display_order,
  is_critical = excluded.is_critical;

with instrument as (
  select id from public.assessment_instruments where slug = 'aod-mh-dfv-v1'
),
items as (
  select ai.id
  from public.assessment_items ai
  join public.assessment_domains ad on ad.id = ai.domain_id
  join instrument i on i.id = ad.instrument_id
),
scale_options as (
  select *
  from (
    values
      ('0', '0 - Not present or no current concern', 0::numeric, 0),
      ('1', '1 - Mild or historical concern', 1::numeric, 1),
      ('2', '2 - Moderate concern requiring active monitoring', 2::numeric, 2),
      ('3', '3 - High concern requiring urgent review', 3::numeric, 3),
      ('4', '4 - Critical concern requiring immediate safety action', 4::numeric, 4)
  ) as option(value, label, score, display_order)
)
insert into public.assessment_item_response_options (item_id, label, value, score, display_order)
select items.id, scale_options.label, scale_options.value, scale_options.score, scale_options.display_order
from items
cross join scale_options
on conflict (item_id, value) do update
set
  label = excluded.label,
  score = excluded.score,
  display_order = excluded.display_order;

with instrument as (
  select id from public.assessment_instruments where slug = 'aod-mh-dfv-v1'
)
insert into public.assessment_scoring_bands (
  instrument_id,
  label,
  min_score,
  max_score,
  recommendation,
  requires_supervisor_review,
  display_order
)
select instrument.id, band.label, band.min_score, band.max_score, band.recommendation, band.requires_supervisor_review, band.display_order
from instrument
cross join (
  values
    ('Low Concern', 0::numeric, 25::numeric, 'Continue routine monitoring and record protective evidence over time.', false, 1),
    ('Moderate Concern', 26::numeric, 50::numeric, 'Create or update the coordinated support plan and review progress with the case team.', false, 2),
    ('High Concern', 51::numeric, 75::numeric, 'Escalate for supervisor review and ensure safety, treatment, and service-coordination actions are explicit.', true, 3),
    ('Critical Concern', 76::numeric, 100::numeric, 'Immediate safety review required. Critical findings must not be averaged away by other strengths.', true, 4)
) as band(label, min_score, max_score, recommendation, requires_supervisor_review, display_order)
where not exists (
  select 1
  from public.assessment_scoring_bands existing
  where existing.instrument_id = instrument.id
    and existing.label = band.label
)
on conflict do nothing;

with instrument as (
  select id from public.assessment_instruments where slug = 'aod-mh-dfv-v1'
),
items as (
  select ai.id, ai.item_key
  from public.assessment_items ai
  join public.assessment_domains ad on ad.id = ai.domain_id
  join instrument i on i.id = ad.instrument_id
),
critical_band as (
  select b.id
  from public.assessment_scoring_bands b
  join instrument i on i.id = b.instrument_id
  where b.label = 'Critical Concern'
),
critical_options as (
  select o.id as option_id, items.id as item_id, items.item_key
  from items
  join public.assessment_item_response_options o on o.item_id = items.id
  where o.score >= 3
    and items.item_key in ('DFV1', 'DFV3', 'AOD4', 'MH2', 'PA3')
),
override_rules as (
  select *
  from (
    values
      ('DFV1', 'Active physical safety risk overrides aggregate score'),
      ('DFV3', 'Child direct exposure to DFV overrides aggregate score'),
      ('AOD4', 'Substance use directly implicated in prior safety incident overrides aggregate score'),
      ('MH2', 'Symptom-driven supervision impairment overrides aggregate score'),
      ('PA3', 'Ongoing perpetrator risk indicators override aggregate score regardless of other domain trends')
  ) as rule(item_key, reason)
)
insert into public.assessment_critical_overrides (
  instrument_id,
  item_id,
  trigger_option_id,
  forced_band_id,
  reason,
  requires_supervisor_review
)
select instrument.id, critical_options.item_id, critical_options.option_id, critical_band.id, override_rules.reason, true
from instrument
cross join critical_band
join critical_options on true
join override_rules on override_rules.item_key = critical_options.item_key
where not exists (
  select 1
  from public.assessment_critical_overrides existing
  where existing.instrument_id = instrument.id
    and existing.item_id = critical_options.item_id
    and existing.trigger_option_id = critical_options.option_id
    and existing.forced_band_id = critical_band.id
);

commit;
