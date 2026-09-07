-- Seed SafeSteps domain-structured weighted fill-in-the-blank parenting quiz items.
-- Source attachment was complete through item 29; item 30 was truncated and is intentionally excluded.

insert into public.assessment_instruments (slug, name, version, description, instrument_type, scoring_method, restricted_tool, requires_licensed_assessor, is_active)
values ('safesteps-parenting-domain-fill-blank-v1', 'SafeSteps Parenting Domain Fill-In-The-Blank Quiz', '1.0', 'Domain-organized weighted parent fill-in-the-blank multiple-choice quiz with SafeSteps tags and subtags.', 'parenting_domain_fill_blank_quiz', 'weighted_percent_correct', false, false, true)
on conflict (slug) do update
set name = excluded.name, version = excluded.version, description = excluded.description, instrument_type = excluded.instrument_type, scoring_method = excluded.scoring_method, restricted_tool = excluded.restricted_tool, requires_licensed_assessor = excluded.requires_licensed_assessor, is_active = excluded.is_active;

with instrument as (select id from public.assessment_instruments where slug = 'safesteps-parenting-domain-fill-blank-v1')
insert into public.assessment_domains (instrument_id, name, description, weight, display_order)
select instrument.id, domain.name, domain.description, 1::numeric, domain.display_order
from instrument
cross join (
  values
    ('emotional_regulation', 'Weighted fill-in-the-blank items for calming, coping, emotion naming, and regulation support.', 1),
    ('communication_listening', 'Weighted fill-in-the-blank items for active listening, respectful communication, and emotional vocabulary.', 2),
    ('routines_structure', 'Weighted fill-in-the-blank items for predictable routines, structure, organisation, boundaries, and responsibility.', 3)
) as domain(name, description, display_order)
on conflict (instrument_id, name) do update
set description = excluded.description, weight = excluded.weight, display_order = excluded.display_order;

with instrument as (select id from public.assessment_instruments where slug = 'safesteps-parenting-domain-fill-blank-v1'),
domain_lookup as (select d.id, d.name from public.assessment_domains d join instrument i on i.id = d.instrument_id)
insert into public.assessment_items (domain_id, item_key, prompt, item_type, weight, max_value, display_order, is_critical)
select domain_lookup.id, item.item_key, item.prompt, 'multiple_choice', item.weight, null, item.display_order, false
from domain_lookup
join (
  values
    ('emotional_regulation', 'SAFEPARENT_DOMAIN_FILL_Q001', 'When my child is overwhelmed, I help them ______.', 3::numeric, 1),
    ('emotional_regulation', 'SAFEPARENT_DOMAIN_FILL_Q002', 'I teach my child coping skills by practicing ______ together.', 3::numeric, 2),
    ('emotional_regulation', 'SAFEPARENT_DOMAIN_FILL_Q003', 'I help my child manage frustration by teaching ______ strategies.', 3::numeric, 3),
    ('emotional_regulation', 'SAFEPARENT_DOMAIN_FILL_Q004', 'I model emotional control by staying ______ during conflict.', 2::numeric, 4),
    ('emotional_regulation', 'SAFEPARENT_DOMAIN_FILL_Q005', 'I help my child calm down by encouraging ______.', 3::numeric, 5),
    ('emotional_regulation', 'SAFEPARENT_DOMAIN_FILL_Q006', 'I support emotional safety by responding with ______.', 3::numeric, 6),
    ('emotional_regulation', 'SAFEPARENT_DOMAIN_FILL_Q007', 'I help my child identify emotions by ______ them.', 2::numeric, 7),
    ('emotional_regulation', 'SAFEPARENT_DOMAIN_FILL_Q008', 'I teach my child to pause and ______ before reacting.', 2::numeric, 8),
    ('emotional_regulation', 'SAFEPARENT_DOMAIN_FILL_Q009', 'I help my child reduce stress by practicing ______.', 3::numeric, 9),
    ('emotional_regulation', 'SAFEPARENT_DOMAIN_FILL_Q010', 'I support emotional growth by encouraging my child to ______.', 3::numeric, 10),
    ('communication_listening', 'SAFEPARENT_DOMAIN_FILL_Q011', 'I help my child feel heard by ______ their feelings.', 3::numeric, 11),
    ('communication_listening', 'SAFEPARENT_DOMAIN_FILL_Q012', 'I show respect by ______ my child’s opinions.', 2::numeric, 12),
    ('communication_listening', 'SAFEPARENT_DOMAIN_FILL_Q013', 'I encourage communication by creating ______ conversations.', 3::numeric, 13),
    ('communication_listening', 'SAFEPARENT_DOMAIN_FILL_Q014', 'I help my child express themselves by asking ______ questions.', 2::numeric, 14),
    ('communication_listening', 'SAFEPARENT_DOMAIN_FILL_Q015', 'I model good communication by speaking ______.', 2::numeric, 15),
    ('communication_listening', 'SAFEPARENT_DOMAIN_FILL_Q016', 'I help my child feel understood by ______ their perspective.', 3::numeric, 16),
    ('communication_listening', 'SAFEPARENT_DOMAIN_FILL_Q017', 'I encourage my child to share by creating a ______ environment.', 3::numeric, 17),
    ('communication_listening', 'SAFEPARENT_DOMAIN_FILL_Q018', 'I help my child communicate emotions by teaching them ______ words.', 2::numeric, 18),
    ('communication_listening', 'SAFEPARENT_DOMAIN_FILL_Q019', 'I support healthy communication by responding ______.', 2::numeric, 19),
    ('communication_listening', 'SAFEPARENT_DOMAIN_FILL_Q020', 'I help my child feel valued by ______ their efforts.', 3::numeric, 20),
    ('routines_structure', 'SAFEPARENT_DOMAIN_FILL_Q021', 'I help my child feel secure by keeping routines ______.', 3::numeric, 21),
    ('routines_structure', 'SAFEPARENT_DOMAIN_FILL_Q022', 'I support focus by creating ______ spaces.', 2::numeric, 22),
    ('routines_structure', 'SAFEPARENT_DOMAIN_FILL_Q023', 'I help my child stay organized by using ______ lists.', 2::numeric, 23),
    ('routines_structure', 'SAFEPARENT_DOMAIN_FILL_Q024', 'I teach responsibility by having my child complete tasks ______.', 3::numeric, 24),
    ('routines_structure', 'SAFEPARENT_DOMAIN_FILL_Q025', 'I help my child stay motivated by setting ______ goals.', 3::numeric, 25),
    ('routines_structure', 'SAFEPARENT_DOMAIN_FILL_Q026', 'I support learning by creating a ______ environment.', 2::numeric, 26),
    ('routines_structure', 'SAFEPARENT_DOMAIN_FILL_Q027', 'I help my child understand limits by setting ______ boundaries.', 3::numeric, 27),
    ('routines_structure', 'SAFEPARENT_DOMAIN_FILL_Q028', 'I encourage responsibility by having my child ______ chores.', 3::numeric, 28),
    ('routines_structure', 'SAFEPARENT_DOMAIN_FILL_Q029', 'I help my child stay organized by maintaining ______ routines.', 2::numeric, 29)
) as item(domain_name, item_key, prompt, weight, display_order) on item.domain_name = domain_lookup.name
on conflict (domain_id, item_key) do update
set prompt = excluded.prompt, item_type = excluded.item_type, weight = excluded.weight, max_value = excluded.max_value, display_order = excluded.display_order, is_critical = excluded.is_critical;

with instrument as (select id from public.assessment_instruments where slug = 'safesteps-parenting-domain-fill-blank-v1'),
items as (select ai.id, ai.item_key from public.assessment_items ai join public.assessment_domains ad on ad.id = ai.domain_id join instrument i on i.id = ad.instrument_id),
options as (select * from (
    values
      ('SAFEPARENT_DOMAIN_FILL_Q001', 'A', 'calm down', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q001', 'B', 'ignore it', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q001', 'C', 'panic', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q001', 'D', 'walk away', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q002', 'A', 'breathing', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q002', 'B', 'yelling', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q002', 'C', 'avoiding', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q002', 'D', 'blaming', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q003', 'A', 'coping', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q003', 'B', 'denial', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q003', 'C', 'avoidance', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q003', 'D', 'panic', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q004', 'A', 'calm', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q004', 'B', 'angry', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q004', 'C', 'sarcastic', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q004', 'D', 'silent', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q005', 'A', 'deep breathing', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q005', 'B', 'shouting', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q005', 'C', 'blaming', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q005', 'D', 'avoidance', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q006', 'A', 'patience', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q006', 'B', 'anger', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q006', 'C', 'shame', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q006', 'D', 'dismissiveness', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q007', 'A', 'naming', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q007', 'B', 'ignoring', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q007', 'C', 'mocking', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q007', 'D', 'avoiding', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q008', 'A', 'think', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q008', 'B', 'shout', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q008', 'C', 'blame', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q008', 'D', 'avoid', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q009', 'A', 'relaxation', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q009', 'B', 'panic', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q009', 'C', 'avoidance', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q009', 'D', 'complaining', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q010', 'A', 'express feelings', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q010', 'B', 'hide emotions', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q010', 'C', 'avoid talking', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q010', 'D', 'stay silent', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q011', 'A', 'validating', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q011', 'B', 'ignoring', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q011', 'C', 'mocking', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q011', 'D', 'minimizing', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q012', 'A', 'listening to', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q012', 'B', 'dismissing', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q012', 'C', 'interrupting', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q012', 'D', 'mocking', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q013', 'A', 'open', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q013', 'B', 'closed', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q013', 'C', 'stressful', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q013', 'D', 'avoidant', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q014', 'A', 'open-ended', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q014', 'B', 'none', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q014', 'C', 'confusing', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q014', 'D', 'critical', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q015', 'A', 'calmly', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q015', 'B', 'angrily', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q015', 'C', 'sarcastically', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q015', 'D', 'unclearly', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q016', 'A', 'acknowledging', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q016', 'B', 'rejecting', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q016', 'C', 'mocking', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q016', 'D', 'ignoring', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q017', 'A', 'safe', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q017', 'B', 'fearful', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q017', 'C', 'stressful', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q017', 'D', 'avoidant', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q018', 'A', 'feeling', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q018', 'B', 'random', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q018', 'C', 'confusing', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q018', 'D', 'none', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q019', 'A', 'calmly', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q019', 'B', 'angrily', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q019', 'C', 'sarcastically', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q019', 'D', 'dismissively', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q020', 'A', 'recognizing', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q020', 'B', 'ignoring', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q020', 'C', 'criticizing', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q020', 'D', 'downplaying', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q021', 'A', 'predictable', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q021', 'B', 'chaotic', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q021', 'C', 'rare', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q021', 'D', 'random', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q022', 'A', 'quiet', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q022', 'B', 'chaotic', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q022', 'C', 'distracting', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q022', 'D', 'stressful', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q023', 'A', 'check', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q023', 'B', 'random', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q023', 'C', 'confusing', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q023', 'D', 'none', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q024', 'A', 'on time', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q024', 'B', 'late', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q024', 'C', 'rarely', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q024', 'D', 'never', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q025', 'A', 'realistic', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q025', 'B', 'impossible', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q025', 'C', 'unclear', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q025', 'D', 'none', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q026', 'A', 'positive', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q026', 'B', 'chaotic', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q026', 'C', 'stressful', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q026', 'D', 'distracting', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q027', 'A', 'clear', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q027', 'B', 'confusing', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q027', 'C', 'inconsistent', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q027', 'D', 'none', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q028', 'A', 'complete', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q028', 'B', 'avoid', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q028', 'C', 'complain about', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q028', 'D', 'ignore', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q029', 'A', 'daily', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q029', 'B', 'random', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q029', 'C', 'rare', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q029', 'D', 'inconsistent', 0::numeric, 4)
  ) as option(item_key, value, label, score, display_order))
insert into public.assessment_item_response_options (item_id, label, value, score, display_order)
select items.id, options.label, options.value, options.score, options.display_order
from items
join options on options.item_key = items.item_key
on conflict (item_id, value) do update
set label = excluded.label, score = excluded.score, display_order = excluded.display_order;
