-- Seed SafeSteps fill-in-the-blank parenting quiz items as a standalone multiple-choice instrument.

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
  'safesteps-parenting-fill-blank-v1',
  'SafeSteps Parenting Fill-In-The-Blank Quiz',
  '1.0',
  'Parent fill-in-the-blank multiple-choice quiz covering regulation, communication, routines, autonomy, empathy, trust, and connection.',
  'parenting_fill_blank_quiz',
  'percent_correct',
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
  select id from public.assessment_instruments where slug = 'safesteps-parenting-fill-blank-v1'
)
insert into public.assessment_domains (instrument_id, name, description, weight, display_order)
select instrument.id, domain.name, domain.description, 1::numeric, domain.display_order
from instrument
cross join (
  values
    ('emotional_regulation', 'Parent pausing and regulating before responding.', 1),
    ('problem_solving', 'Parent-child problem-solving through discussion.', 2),
    ('communication_style', 'Clear and understandable parent communication.', 3),
    ('motivation_support', 'Effort, progress, and intrinsic motivation support.', 4),
    ('boundaries_consistency', 'Consistent rules and consequences.', 5),
    ('autonomy_support', 'Child responsibility, choice, and independence.', 6),
    ('parent_child_relationship', 'Quality time, presence, and connection.', 7),
    ('positive_discipline', 'Patient, teaching-oriented response to mistakes.', 8),
    ('routine_stability', 'Predictable routines that support safety.', 9),
    ('collaboration_with_child', 'Questions and collaboration that support learning.', 10),
    ('emotional_attunement', 'Validation and calm support when the child is overwhelmed.', 11),
    ('empathy_development', 'Parent modelling of kindness and perspective-taking.', 12),
    ('attention_support', 'Reducing distractions to support focus.', 13),
    ('attachment_security', 'Reliable parent behaviour that builds trust.', 14),
    ('stress_management', 'Coping and calming strategies.', 15)
) as domain(name, description, display_order)
on conflict (instrument_id, name) do update
set
  description = excluded.description,
  weight = excluded.weight,
  display_order = excluded.display_order;

with instrument as (
  select id from public.assessment_instruments where slug = 'safesteps-parenting-fill-blank-v1'
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
select domain_lookup.id, item.item_key, item.prompt, 'multiple_choice', 1::numeric, null, item.display_order, false
from domain_lookup
join (
  values
    ('emotional_regulation', 'SAFEPARENT_FILL_Q001', 'When my child is upset, I usually ______ before responding.', 1),
    ('problem_solving', 'SAFEPARENT_FILL_Q002', 'I help my child solve problems by ______ together.', 2),
    ('communication_style', 'SAFEPARENT_FILL_Q003', 'When giving instructions, I make sure they are ______.', 3),
    ('motivation_support', 'SAFEPARENT_FILL_Q004', 'I encourage my child by praising their ______.', 4),
    ('boundaries_consistency', 'SAFEPARENT_FILL_Q005', 'When my child breaks a rule, I respond with ______ consequences.', 5),
    ('autonomy_support', 'SAFEPARENT_FILL_Q006', 'I help my child learn responsibility by letting them ______.', 6),
    ('parent_child_relationship', 'SAFEPARENT_FILL_Q007', 'I show my child love by spending ______ with them.', 7),
    ('positive_discipline', 'SAFEPARENT_FILL_Q008', 'When my child makes a mistake, I respond with ______.', 8),
    ('routine_stability', 'SAFEPARENT_FILL_Q009', 'I help my child feel safe by keeping routines ______.', 9),
    ('collaboration_with_child', 'SAFEPARENT_FILL_Q010', 'I support my child''s learning by asking them ______.', 10),
    ('emotional_attunement', 'SAFEPARENT_FILL_Q011', 'When my child is overwhelmed, I help them ______.', 11),
    ('empathy_development', 'SAFEPARENT_FILL_Q012', 'I teach my child empathy by modeling ______.', 12),
    ('attention_support', 'SAFEPARENT_FILL_Q013', 'I help my child stay focused by reducing ______.', 13),
    ('attachment_security', 'SAFEPARENT_FILL_Q014', 'I build trust with my child by being ______.', 14),
    ('stress_management', 'SAFEPARENT_FILL_Q015', 'I help my child manage emotions by teaching them ______ strategies.', 15),
    ('autonomy_support', 'SAFEPARENT_FILL_Q016', 'I encourage independence by letting my child ______.', 16),
    ('emotional_attunement', 'SAFEPARENT_FILL_Q017', 'I help my child feel heard by ______ their feelings.', 17),
    ('motivation_support', 'SAFEPARENT_FILL_Q018', 'I support my child''s confidence by celebrating their ______.', 18),
    ('stress_management', 'SAFEPARENT_FILL_Q019', 'I help my child stay calm by teaching them to ______.', 19),
    ('parent_child_relationship', 'SAFEPARENT_FILL_Q020', 'I strengthen my relationship with my child by being ______.', 20)
) as item(domain_name, item_key, prompt, display_order)
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
  select id from public.assessment_instruments where slug = 'safesteps-parenting-fill-blank-v1'
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
      ('SAFEPARENT_FILL_Q001', 'A', 'pause', 1::numeric, 1),
      ('SAFEPARENT_FILL_Q001', 'B', 'ignore', 0::numeric, 2),
      ('SAFEPARENT_FILL_Q001', 'C', 'react immediately', 0::numeric, 3),
      ('SAFEPARENT_FILL_Q001', 'D', 'walk away', 0::numeric, 4),
      ('SAFEPARENT_FILL_Q002', 'A', 'talking', 1::numeric, 1),
      ('SAFEPARENT_FILL_Q002', 'B', 'avoiding', 0::numeric, 2),
      ('SAFEPARENT_FILL_Q002', 'C', 'punishing', 0::numeric, 3),
      ('SAFEPARENT_FILL_Q002', 'D', 'guessing', 0::numeric, 4),
      ('SAFEPARENT_FILL_Q003', 'A', 'clear', 1::numeric, 1),
      ('SAFEPARENT_FILL_Q003', 'B', 'confusing', 0::numeric, 2),
      ('SAFEPARENT_FILL_Q003', 'C', 'lengthy', 0::numeric, 3),
      ('SAFEPARENT_FILL_Q003', 'D', 'inconsistent', 0::numeric, 4),
      ('SAFEPARENT_FILL_Q004', 'A', 'effort', 1::numeric, 1),
      ('SAFEPARENT_FILL_Q004', 'B', 'mistakes', 0::numeric, 2),
      ('SAFEPARENT_FILL_Q004', 'C', 'appearance', 0::numeric, 3),
      ('SAFEPARENT_FILL_Q004', 'D', 'possessions', 0::numeric, 4),
      ('SAFEPARENT_FILL_Q005', 'A', 'consistent', 1::numeric, 1),
      ('SAFEPARENT_FILL_Q005', 'B', 'random', 0::numeric, 2),
      ('SAFEPARENT_FILL_Q005', 'C', 'harsh', 0::numeric, 3),
      ('SAFEPARENT_FILL_Q005', 'D', 'none', 0::numeric, 4),
      ('SAFEPARENT_FILL_Q006', 'A', 'try tasks', 1::numeric, 1),
      ('SAFEPARENT_FILL_Q006', 'B', 'avoid chores', 0::numeric, 2),
      ('SAFEPARENT_FILL_Q006', 'C', 'blame others', 0::numeric, 3),
      ('SAFEPARENT_FILL_Q006', 'D', 'skip routines', 0::numeric, 4),
      ('SAFEPARENT_FILL_Q007', 'A', 'quality time', 1::numeric, 1),
      ('SAFEPARENT_FILL_Q007', 'B', 'no time', 0::numeric, 2),
      ('SAFEPARENT_FILL_Q007', 'C', 'distracted time', 0::numeric, 3),
      ('SAFEPARENT_FILL_Q007', 'D', 'inconsistent time', 0::numeric, 4),
      ('SAFEPARENT_FILL_Q008', 'A', 'patience', 1::numeric, 1),
      ('SAFEPARENT_FILL_Q008', 'B', 'anger', 0::numeric, 2),
      ('SAFEPARENT_FILL_Q008', 'C', 'shame', 0::numeric, 3),
      ('SAFEPARENT_FILL_Q008', 'D', 'silence', 0::numeric, 4),
      ('SAFEPARENT_FILL_Q009', 'A', 'predictable', 1::numeric, 1),
      ('SAFEPARENT_FILL_Q009', 'B', 'chaotic', 0::numeric, 2),
      ('SAFEPARENT_FILL_Q009', 'C', 'random', 0::numeric, 3),
      ('SAFEPARENT_FILL_Q009', 'D', 'infrequent', 0::numeric, 4),
      ('SAFEPARENT_FILL_Q010', 'A', 'questions', 1::numeric, 1),
      ('SAFEPARENT_FILL_Q010', 'B', 'nothing', 0::numeric, 2),
      ('SAFEPARENT_FILL_Q010', 'C', 'to stop trying', 0::numeric, 3),
      ('SAFEPARENT_FILL_Q010', 'D', 'to avoid challenges', 0::numeric, 4),
      ('SAFEPARENT_FILL_Q011', 'A', 'calm down', 1::numeric, 1),
      ('SAFEPARENT_FILL_Q011', 'B', 'ignore feelings', 0::numeric, 2),
      ('SAFEPARENT_FILL_Q011', 'C', 'hide emotions', 0::numeric, 3),
      ('SAFEPARENT_FILL_Q011', 'D', 'avoid me', 0::numeric, 4),
      ('SAFEPARENT_FILL_Q012', 'A', 'kindness', 1::numeric, 1),
      ('SAFEPARENT_FILL_Q012', 'B', 'criticism', 0::numeric, 2),
      ('SAFEPARENT_FILL_Q012', 'C', 'sarcasm', 0::numeric, 3),
      ('SAFEPARENT_FILL_Q012', 'D', 'avoidance', 0::numeric, 4),
      ('SAFEPARENT_FILL_Q013', 'A', 'distractions', 1::numeric, 1),
      ('SAFEPARENT_FILL_Q013', 'B', 'support', 0::numeric, 2),
      ('SAFEPARENT_FILL_Q013', 'C', 'encouragement', 0::numeric, 3),
      ('SAFEPARENT_FILL_Q013', 'D', 'structure', 0::numeric, 4),
      ('SAFEPARENT_FILL_Q014', 'A', 'reliable', 1::numeric, 1),
      ('SAFEPARENT_FILL_Q014', 'B', 'unpredictable', 0::numeric, 2),
      ('SAFEPARENT_FILL_Q014', 'C', 'dismissive', 0::numeric, 3),
      ('SAFEPARENT_FILL_Q014', 'D', 'inconsistent', 0::numeric, 4),
      ('SAFEPARENT_FILL_Q015', 'A', 'coping', 1::numeric, 1),
      ('SAFEPARENT_FILL_Q015', 'B', 'avoidance', 0::numeric, 2),
      ('SAFEPARENT_FILL_Q015', 'C', 'blaming', 0::numeric, 3),
      ('SAFEPARENT_FILL_Q015', 'D', 'denial', 0::numeric, 4),
      ('SAFEPARENT_FILL_Q016', 'A', 'make choices', 1::numeric, 1),
      ('SAFEPARENT_FILL_Q016', 'B', 'depend fully on me', 0::numeric, 2),
      ('SAFEPARENT_FILL_Q016', 'C', 'avoid decisions', 0::numeric, 3),
      ('SAFEPARENT_FILL_Q016', 'D', 'copy others', 0::numeric, 4),
      ('SAFEPARENT_FILL_Q017', 'A', 'validating', 1::numeric, 1),
      ('SAFEPARENT_FILL_Q017', 'B', 'ignoring', 0::numeric, 2),
      ('SAFEPARENT_FILL_Q017', 'C', 'mocking', 0::numeric, 3),
      ('SAFEPARENT_FILL_Q017', 'D', 'minimizing', 0::numeric, 4),
      ('SAFEPARENT_FILL_Q018', 'A', 'progress', 1::numeric, 1),
      ('SAFEPARENT_FILL_Q018', 'B', 'failures only', 0::numeric, 2),
      ('SAFEPARENT_FILL_Q018', 'C', 'appearance', 0::numeric, 3),
      ('SAFEPARENT_FILL_Q018', 'D', 'possessions', 0::numeric, 4),
      ('SAFEPARENT_FILL_Q019', 'A', 'breathe deeply', 1::numeric, 1),
      ('SAFEPARENT_FILL_Q019', 'B', 'shout', 0::numeric, 2),
      ('SAFEPARENT_FILL_Q019', 'C', 'avoid problems', 0::numeric, 3),
      ('SAFEPARENT_FILL_Q019', 'D', 'blame others', 0::numeric, 4),
      ('SAFEPARENT_FILL_Q020', 'A', 'present', 1::numeric, 1),
      ('SAFEPARENT_FILL_Q020', 'B', 'distracted', 0::numeric, 2),
      ('SAFEPARENT_FILL_Q020', 'C', 'unavailable', 0::numeric, 3),
      ('SAFEPARENT_FILL_Q020', 'D', 'dismissive', 0::numeric, 4)
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
