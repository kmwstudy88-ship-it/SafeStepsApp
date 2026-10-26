-- SafeSteps program-specific Parenting Stress and Capacity rubric.
-- This is not a validated clinical instrument and must not be represented as
-- the Parenting Stress Index or used as an automated reunification decision.

insert into public.assessment_instruments (
  slug, name, version, description, instrument_type, scoring_method,
  restricted_tool, requires_licensed_assessor, is_active
)
values (
  'safesteps-parenting-stress-capacity-v1',
  'SafeSteps Parenting Stress and Capacity Rubric',
  '1.0',
  'Program-specific decision-support rubric for stress regulation, coping resources, parent-child relationship quality, child development knowledge, and help-seeking. Not a validated clinical instrument.',
  'parenting_capacity',
  'weighted_average',
  false,
  false,
  true
)
on conflict (slug) do update set
  name = excluded.name,
  version = excluded.version,
  description = excluded.description,
  instrument_type = excluded.instrument_type,
  scoring_method = excluded.scoring_method,
  restricted_tool = excluded.restricted_tool,
  requires_licensed_assessor = excluded.requires_licensed_assessor,
  is_active = excluded.is_active;

with instrument as (
  select id from public.assessment_instruments where slug = 'safesteps-parenting-stress-capacity-v1'
)
insert into public.assessment_domains (instrument_id, name, description, weight, display_order)
select instrument.id, domain.name, domain.description, domain.weight, domain.display_order
from instrument
cross join (
  values
    ('Emotional Regulation Under Stress', 'Management of emotional responses during stressful parenting moments.', 1.4::numeric, 1),
    ('Coping Resources and Self-Care', 'Use of safe, accessible coping strategies and functional self-care.', 1.0::numeric, 2),
    ('Parent-Child Relationship Quality', 'Observed warmth, engagement, comfort, and child-focused understanding.', 1.3::numeric, 3),
    ('Child Development Knowledge', 'Understanding of developmentally appropriate behaviour, needs, and support.', 0.9::numeric, 4),
    ('Help-Seeking and Support Use', 'Use of suitable supports before difficulty escalates, with access barriers recorded.', 1.1::numeric, 5)
) as domain(name, description, weight, display_order)
on conflict (instrument_id, name) do update set
  description = excluded.description,
  weight = excluded.weight,
  display_order = excluded.display_order;

with instrument as (
  select id from public.assessment_instruments where slug = 'safesteps-parenting-stress-capacity-v1'
), domains as (
  select d.id, d.name from public.assessment_domains d join instrument i on i.id = d.instrument_id
)
insert into public.assessment_items (domain_id, item_key, prompt, item_type, weight, display_order, is_critical)
select domains.id, item.item_key, item.prompt, item.item_type, item.weight, item.display_order, item.is_critical
from domains
join (
  values
    ('Emotional Regulation Under Stress', 'psca-early-stress-signals', 'Parent identifies early stress signals before reaching crisis.', 'likert', 1.0::numeric, 1, false),
    ('Emotional Regulation Under Stress', 'psca-regulation-strategy', 'Parent uses at least one safe self-regulation strategy and can describe when it was used.', 'likert', 1.0::numeric, 2, false),
    ('Emotional Regulation Under Stress', 'psca-loss-of-control', 'Recorded loss-of-control incidents affecting the child during the review period.', 'multiple_choice', 1.3::numeric, 3, true),
    ('Coping Resources and Self-Care', 'psca-basic-self-care', 'Parent maintains basic self-care sufficient to support caregiving functioning.', 'likert', 1.0::numeric, 1, false),
    ('Coping Resources and Self-Care', 'psca-healthy-stress-outlet', 'Parent uses at least one safe and accessible outlet for stress outside parenting duties.', 'likert', 0.8::numeric, 2, false),
    ('Coping Resources and Self-Care', 'psca-stress-caregiving-impact', 'Current stress does not consistently prevent completion of caregiving tasks.', 'likert', 1.0::numeric, 3, false),
    ('Parent-Child Relationship Quality', 'psca-mutual-engagement', 'Observed parent-child interactions show developmentally appropriate warmth and engagement.', 'likert', 1.0::numeric, 1, false),
    ('Parent-Child Relationship Quality', 'psca-comfort-response', 'Parent notices distress and responds to the child''s comfort needs in a developmentally appropriate way.', 'likert', 1.0::numeric, 2, false),
    ('Parent-Child Relationship Quality', 'psca-child-description', 'Parent describes the child with warmth, specificity, and awareness of the child''s perspective.', 'likert', 0.9::numeric, 3, false),
    ('Child Development Knowledge', 'psca-age-expectations', 'Parent describes age- and developmentally appropriate expectations for the child.', 'likert', 1.0::numeric, 1, false),
    ('Child Development Knowledge', 'psca-development-concerns', 'Parent recognises signs that may warrant developmental, emotional, or health support.', 'likert', 1.0::numeric, 2, false),
    ('Child Development Knowledge', 'psca-parenting-learning', 'Parent engages with relevant parenting education or coaching and can describe practical application.', 'likert', 0.7::numeric, 3, false),
    ('Help-Seeking and Support Use', 'psca-proactive-help', 'Parent seeks support before difficulty escalates where support is available and accessible.', 'likert', 1.0::numeric, 1, false),
    ('Help-Seeking and Support Use', 'psca-referral-follow-through', 'Parent follows through with suitable and accessible referrals or records barriers that prevented access.', 'likert', 1.0::numeric, 2, false),
    ('Help-Seeking and Support Use', 'psca-support-network', 'Parent identifies specific safe people or services available during a difficult moment.', 'likert', 0.8::numeric, 3, false)
) as item(domain_name, item_key, prompt, item_type, weight, display_order, is_critical)
  on item.domain_name = domains.name
on conflict (domain_id, item_key) do update set
  prompt = excluded.prompt,
  item_type = excluded.item_type,
  weight = excluded.weight,
  display_order = excluded.display_order,
  is_critical = excluded.is_critical;

with instrument as (
  select id from public.assessment_instruments where slug = 'safesteps-parenting-stress-capacity-v1'
), items as (
  select ai.id, ai.item_key
  from public.assessment_items ai
  join public.assessment_domains ad on ad.id = ai.domain_id
  join instrument i on i.id = ad.instrument_id
  where ai.item_type = 'likert'
), options as (
  select * from (
    values
      ('significant_concern', '0 - Significant concern', 0::numeric, 1),
      ('concern', '1 - Concern', 1::numeric, 2),
      ('emerging', '2 - Emerging', 2::numeric, 3),
      ('adequate', '3 - Adequate', 3::numeric, 4),
      ('strength', '4 - Demonstrated strength', 4::numeric, 5)
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
  select id from public.assessment_instruments where slug = 'safesteps-parenting-stress-capacity-v1'
), item as (
  select ai.id
  from public.assessment_items ai
  join public.assessment_domains ad on ad.id = ai.domain_id
  join instrument i on i.id = ad.instrument_id
  where ai.item_key = 'psca-loss-of-control'
), options as (
  select * from (
    values
      ('none', 'No recorded incident', 4::numeric, 1),
      ('once_no_harm', 'One incident, with repair and no recorded harm', 2::numeric, 2),
      ('repeated', 'Repeated incidents requiring support review', 1::numeric, 3),
      ('harm_or_severe_concern', 'Incident involving harm or a severe safety concern', 0::numeric, 4)
  ) as option(value, label, score, display_order)
)
insert into public.assessment_item_response_options (item_id, label, value, score, display_order)
select item.id, options.label, options.value, options.score, options.display_order
from item cross join options
on conflict (item_id, value) do update set
  label = excluded.label,
  score = excluded.score,
  display_order = excluded.display_order;

with instrument as (
  select id from public.assessment_instruments where slug = 'safesteps-parenting-stress-capacity-v1'
)
insert into public.assessment_scoring_bands (
  instrument_id, label, min_score, max_score, recommendation,
  requires_supervisor_review, display_order
)
select instrument.id, band.label, band.min_score, band.max_score, band.recommendation, band.requires_review, band.display_order
from instrument
cross join (
  values
    ('Intensive Support Review', 0::numeric, 39.99::numeric, 'Review support needs, evidence context, accessibility barriers, and safety planning with a supervisor.', true, 1),
    ('Developing Capacity', 40::numeric, 64.99::numeric, 'Continue targeted support and review the lowest domains with the parent.', false, 2),
    ('Solid Capacity', 65::numeric, 84.99::numeric, 'Maintain support and confirm that strengths are sustained across settings and sources.', false, 3),
    ('Strong, Consistent Capacity', 85::numeric, 100::numeric, 'Record sustained strengths and continue case-team review; this rubric does not determine reunification.', false, 4)
) as band(label, min_score, max_score, recommendation, requires_review, display_order)
where not exists (
  select 1 from public.assessment_scoring_bands existing
  where existing.instrument_id = instrument.id and existing.label = band.label
);

with instrument as (
  select id from public.assessment_instruments where slug = 'safesteps-parenting-stress-capacity-v1'
), item as (
  select ai.id
  from public.assessment_items ai
  join public.assessment_domains ad on ad.id = ai.domain_id
  join instrument i on i.id = ad.instrument_id
  where ai.item_key = 'psca-loss-of-control'
), trigger_option as (
  select o.id from public.assessment_item_response_options o
  join item on item.id = o.item_id
  where o.value = 'harm_or_severe_concern'
), forced_band as (
  select b.id from public.assessment_scoring_bands b
  join instrument i on i.id = b.instrument_id
  where b.label = 'Intensive Support Review'
)
insert into public.assessment_critical_overrides (
  instrument_id, item_id, trigger_option_id, forced_band_id, reason, requires_supervisor_review
)
select instrument.id, item.id, trigger_option.id, forced_band.id,
  'A recorded incident involving harm or a severe safety concern requires immediate human safety review and cannot be averaged away.',
  true
from instrument cross join item cross join trigger_option cross join forced_band
where not exists (
  select 1 from public.assessment_critical_overrides existing
  where existing.instrument_id = instrument.id
    and existing.item_id = item.id
    and existing.trigger_option_id = trigger_option.id
);
