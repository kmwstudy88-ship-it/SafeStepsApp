-- Seed the SafeSteps protective-capacity assessment instrument.
-- This mirrors lib/data/safeStepsAssessmentInstrument.ts so the database
-- metadata model can drive the same scoring engine when records are persisted.

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
  'safesteps-protective-capacity',
  'SafeSteps Protective Capacity and Reunification Readiness Assessment',
  '1.0',
  'SafeSteps decision-support instrument for child safety, protective capacity, routines, services, child voice, and evidence consistency.',
  'protective_capacity',
  'weighted_average',
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
  select id from public.assessment_instruments where slug = 'safesteps-protective-capacity'
)
insert into public.assessment_domains (instrument_id, name, description, weight, display_order)
select instrument.id, domain.name, domain.description, domain.weight, domain.display_order
from instrument
cross join (
  values
    ('Child Safety', 'Current child safety, supervision, unmanaged risk, and safety planning.', 1.4::numeric, 1),
    ('Protective Capacity', 'Parent insight, accountability, repair, and ability to act protectively.', 1.3::numeric, 2),
    ('Parenting Routines', 'Stable daily care, supervision, home routines, and practical parenting behaviour.', 1.1::numeric, 3),
    ('Service Engagement', 'Follow-through with supports, referrals, appointments, and required stability evidence.', 0.9::numeric, 4),
    ('Child Voice and Wellbeing', 'Whether child voice, felt safety, wellbeing, and adjustment are recorded and considered.', 1.0::numeric, 5),
    ('Evidence Consistency', 'Repeated objective evidence over time and alignment with collateral information.', 1.1::numeric, 6)
) as domain(name, description, weight, display_order)
on conflict (instrument_id, name) do update
set
  description = excluded.description,
  weight = excluded.weight,
  display_order = excluded.display_order;

with instrument as (
  select id from public.assessment_instruments where slug = 'safesteps-protective-capacity'
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
select domain_lookup.id, item.item_key, item.prompt, item.item_type, item.weight, null, item.display_order, item.is_critical
from domain_lookup
join (
  values
    ('Child Safety', 'active-safety-concern', 'Is there any active unmanaged safety concern that requires immediate review?', 'multiple_choice', 1.4::numeric, 1, true),
    ('Child Safety', 'safe-supervision', 'How consistently is the child safely supervised according to their age, needs, and current plan?', 'likert', 1.0::numeric, 2, false),
    ('Protective Capacity', 'risk-insight', 'How clearly does the parent understand the risks, impact, and protective actions required?', 'likert', 1.2::numeric, 3, false),
    ('Protective Capacity', 'repair-accountability', 'How consistently does the parent take responsibility and repair after harm, conflict, or missed expectations?', 'likert', 1.0::numeric, 4, false),
    ('Parenting Routines', 'daily-routines', 'How consistently are daily parenting routines followed and adapted to the child?', 'likert', 1.0::numeric, 5, false),
    ('Parenting Routines', 'home-stability', 'How stable, suitable, and predictable is the home environment?', 'likert', 1.0::numeric, 6, false),
    ('Service Engagement', 'service-follow-through', 'How consistently does the parent engage with required services, programs, and appointments?', 'likert', 1.0::numeric, 7, false),
    ('Service Engagement', 'drug-test-critical', 'Is there any unmanaged AOD concern or missing required stability evidence?', 'multiple_choice', 1.0::numeric, 8, true),
    ('Child Voice and Wellbeing', 'child-feels-safe', 'Does the child voice or observation indicate felt safety and improving wellbeing?', 'likert', 1.2::numeric, 9, false),
    ('Child Voice and Wellbeing', 'child-voice-considered', 'How consistently is child voice recorded and considered in planning?', 'likert', 1.0::numeric, 10, false),
    ('Evidence Consistency', 'evidence-over-time', 'How strong is the repeated evidence of safe change over time?', 'likert', 1.2::numeric, 11, false),
    ('Evidence Consistency', 'collateral-alignment', 'How well does parent report align with collateral, evidence, and observations?', 'likert', 1.0::numeric, 12, false)
) as item(domain_name, item_key, prompt, item_type, weight, display_order, is_critical)
  on item.domain_name = domain_lookup.name
on conflict (domain_id, item_key) do update
set
  prompt = excluded.prompt,
  item_type = excluded.item_type,
  weight = excluded.weight,
  display_order = excluded.display_order,
  is_critical = excluded.is_critical;

with instrument as (
  select id from public.assessment_instruments where slug = 'safesteps-protective-capacity'
),
items as (
  select ai.id, ai.item_key
  from public.assessment_items ai
  join public.assessment_domains ad on ad.id = ai.domain_id
  join instrument i on i.id = ad.instrument_id
),
likert_options as (
  select *
  from (
    values
      ('0', '0 - Immediate concern', 0::numeric, 0),
      ('1', '1 - Major concern', 1::numeric, 1),
      ('2', '2 - Emerging progress', 2::numeric, 2),
      ('3', '3 - Mostly consistent', 3::numeric, 3),
      ('4', '4 - Sustained safe practice', 4::numeric, 4)
  ) as option(value, label, score, display_order)
),
likert_items as (
  select id, item_key
  from items
  where item_key in (
    'safe-supervision',
    'risk-insight',
    'repair-accountability',
    'daily-routines',
    'home-stability',
    'service-follow-through',
    'child-feels-safe',
    'child-voice-considered',
    'evidence-over-time',
    'collateral-alignment'
  )
)
insert into public.assessment_item_response_options (item_id, label, value, score, display_order)
select likert_items.id, likert_options.label, likert_options.value, likert_options.score, likert_options.display_order
from likert_items
cross join likert_options
on conflict (item_id, value) do update
set
  label = excluded.label,
  score = excluded.score,
  display_order = excluded.display_order;

with instrument as (
  select id from public.assessment_instruments where slug = 'safesteps-protective-capacity'
),
items as (
  select ai.id, ai.item_key
  from public.assessment_items ai
  join public.assessment_domains ad on ad.id = ai.domain_id
  join instrument i on i.id = ad.instrument_id
),
options as (
  select *
  from (
    values
      ('active-safety-concern', 'no', 'No active unmanaged safety concern', 4::numeric, 1),
      ('active-safety-concern', 'managed', 'Concern present but safety plan is active', 2::numeric, 2),
      ('active-safety-concern', 'yes', 'Active unmanaged safety concern', 0::numeric, 3),
      ('drug-test-critical', 'clear', 'No relevant concern or stable evidence', 4::numeric, 1),
      ('drug-test-critical', 'missed', 'Missed or incomplete evidence', 1::numeric, 2),
      ('drug-test-critical', 'positive_unmanaged', 'Positive or unmanaged concern', 0::numeric, 3)
  ) as option(item_key, value, label, score, display_order)
)
insert into public.assessment_item_response_options (item_id, label, value, score, display_order)
select items.id, options.label, options.value, options.score, options.display_order
from items
join options on options.item_key = items.item_key
on conflict (item_id, value) do update
set
  label = excluded.label,
  score = excluded.score,
  display_order = excluded.display_order;

with instrument as (
  select id from public.assessment_instruments where slug = 'safesteps-protective-capacity'
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
    ('Critical Review Required', 0::numeric, 39.99::numeric, 'Do not use readiness for reunification planning until supervisor review and safety planning are complete.', true, 1),
    ('High Support Needed', 40::numeric, 59.99::numeric, 'Continue structured intervention, strengthen evidence, and review active risks before increasing contact.', true, 2),
    ('Emerging Readiness', 60::numeric, 79.99::numeric, 'Progress is visible. Continue monitoring consistency, child voice, and service follow-through.', false, 3),
    ('Supported Readiness', 80::numeric, 100::numeric, 'Strong sustained evidence is present. Review with supervisor and case team before any reunification-level change.', false, 4)
) as band(label, min_score, max_score, recommendation, requires_supervisor_review, display_order)
where not exists (
  select 1
  from public.assessment_scoring_bands existing
  where existing.instrument_id = instrument.id
    and existing.label = band.label
);

with instrument as (
  select id from public.assessment_instruments where slug = 'safesteps-protective-capacity'
),
items as (
  select ai.id, ai.item_key
  from public.assessment_items ai
  join public.assessment_domains ad on ad.id = ai.domain_id
  join instrument i on i.id = ad.instrument_id
),
critical_band as (
  select asb.id
  from public.assessment_scoring_bands asb
  join instrument i on i.id = asb.instrument_id
  where asb.label = 'Critical Review Required'
)
insert into public.assessment_critical_overrides (
  instrument_id,
  item_id,
  trigger_option_id,
  forced_band_id,
  reason,
  requires_supervisor_review
)
select
  instrument.id,
  items.id,
  options.id,
  critical_band.id,
  override.reason,
  true
from instrument
cross join critical_band
join (
  values
    ('active-safety-concern', 'yes', 'Active unmanaged safety concern cannot be averaged away by strengths in other domains.'),
    ('drug-test-critical', 'positive_unmanaged', 'Unmanaged AOD concern requires safety review before readiness can be relied on.')
) as override(item_key, trigger_value, reason) on true
join items on items.item_key = override.item_key
join public.assessment_item_response_options options
  on options.item_id = items.id
  and options.value = override.trigger_value
where not exists (
  select 1
  from public.assessment_critical_overrides existing
  where existing.instrument_id = instrument.id
    and existing.item_id = items.id
    and existing.trigger_option_id = options.id
);
