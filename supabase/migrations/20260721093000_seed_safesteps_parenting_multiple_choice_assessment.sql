-- Seed SafeSteps multiple-choice parenting assessment items.
-- Mirrors lib/data/safeStepsParentingAssessmentItems.ts for database-backed assessment delivery.

alter table public.assessment_instruments
  drop constraint if exists assessment_instruments_instrument_type_check;

alter table public.assessment_instruments
  add constraint assessment_instruments_instrument_type_check
  check (
    instrument_type in (
      'safety',
      'risk',
      'protective_capacity',
      'parenting_capacity',
      'readiness',
      'substance_use',
      'mental_health',
      'custom',
      'parenting_multiple_choice',
      'parenting_fill_blank_quiz',
      'parenting_domain_fill_blank_quiz',
      'sequence_assessment'
    )
  );

alter table public.assessment_instruments
  drop constraint if exists assessment_instruments_scoring_method_check;

alter table public.assessment_instruments
  add constraint assessment_instruments_scoring_method_check
  check (
    scoring_method in (
      'sum',
      'weighted_average',
      'rubric',
      'rule_based',
      'percent_correct',
      'weighted_percent_correct',
      'sequence_position_match'
    )
  );

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
  'safesteps-parenting-multiple-choice-v1',
  'SafeSteps Parenting Multiple-Choice Assessment',
  '1.0',
  'Parenting knowledge and applied judgement assessment covering attunement, boundaries, discipline, communication, regulation, safety, culture, transitions, and fairness.',
  'parenting_multiple_choice',
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
  select id from public.assessment_instruments where slug = 'safesteps-parenting-multiple-choice-v1'
)
insert into public.assessment_domains (instrument_id, name, description, weight, display_order)
select instrument.id, domain.name, domain.description, 1::numeric, domain.display_order
from instrument
cross join (
  values
    ('emotional_attunement', 'Parent response to child emotion and distress.', 1),
    ('boundaries_consistency', 'Consistent boundaries, limits, and follow-through.', 2),
    ('positive_discipline', 'Teaching-oriented discipline without shaming or over-rescuing.', 3),
    ('communication_style', 'Clear developmentally appropriate instructions and communication.', 4),
    ('emotional_regulation', 'Parent regulation before responding to child behaviour.', 5),
    ('attachment_safety', 'Reliable comfort, help-seeking, and secure attachment behaviour.', 6),
    ('autonomy_support', 'Encouraging child agency with realistic expectations.', 7),
    ('problem_solving', 'Guided conflict resolution and shared problem-solving.', 8),
    ('expectations_realism', 'Age-appropriate expectations and routines.', 9),
    ('strengths_focus', 'Strengths-based parenting and child capability building.', 10),
    ('consistency_between_caregivers', 'Shared caregiver routines and communication.', 11),
    ('feedback_style', 'Specific, behaviour-focused feedback.', 12),
    ('safety_risk_awareness', 'Supervision, hazard awareness, and safe boundaries.', 13),
    ('cultural_sensitivity', 'Cultural context considered alongside child safety and wellbeing.', 14),
    ('communication_about_rules', 'Calm explanation of rules, reasons, and consequences.', 15),
    ('support_during_transitions', 'Validation and planning during child transitions.', 16),
    ('screen_time_balance', 'Balanced screen limits and family interaction.', 17),
    ('collaboration_with_child', 'Child input within clear parental boundaries.', 18),
    ('stress_management_for_parent', 'Healthy parent coping and support-seeking.', 19),
    ('fairness_and_bias', 'Observable behaviour used instead of assumptions or favourites.', 20)
) as domain(name, description, display_order)
on conflict (instrument_id, name) do update
set
  description = excluded.description,
  weight = excluded.weight,
  display_order = excluded.display_order;

with instrument as (
  select id from public.assessment_instruments where slug = 'safesteps-parenting-multiple-choice-v1'
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
    ('emotional_attunement', 'SAFEPARENT_Q001', 'Your child comes home visibly upset after a conflict at school. What is your first response?', 1),
    ('boundaries_consistency', 'SAFEPARENT_Q002', 'You set a rule about screen time, but your child keeps pushing for more. What is the most consistent approach?', 2),
    ('positive_discipline', 'SAFEPARENT_Q003', 'Which response best reflects positive discipline when a child forgets their homework?', 3),
    ('communication_style', 'SAFEPARENT_Q004', 'When giving instructions, which style is most likely to support understanding and cooperation?', 4),
    ('emotional_regulation', 'SAFEPARENT_Q005', 'You feel very angry after your child breaks a house rule. What is the healthiest next step?', 5),
    ('attachment_safety', 'SAFEPARENT_Q006', 'Which behaviour most supports a child''s sense of safety and secure attachment?', 6),
    ('autonomy_support', 'SAFEPARENT_Q007', 'Your child wants to try a new activity they might not be good at. What is the most autonomy-supportive response?', 7),
    ('problem_solving', 'SAFEPARENT_Q008', 'Your child and a sibling are arguing over a toy. What is the most constructive approach?', 8),
    ('expectations_realism', 'SAFEPARENT_Q009', 'Which expectation is most realistic for a 6-year-old child?', 9),
    ('strengths_focus', 'SAFEPARENT_Q010', 'A strengths-based parenting approach focuses primarily on:', 10),
    ('consistency_between_caregivers', 'SAFEPARENT_Q011', 'Two caregivers have different rules about bedtime. What best supports the child''s sense of stability?', 11),
    ('feedback_style', 'SAFEPARENT_Q012', 'Which type of feedback is most constructive when a child makes a mistake?', 12),
    ('safety_risk_awareness', 'SAFEPARENT_Q013', 'Your child wants to play in an area with potential hazards. What is the safest approach?', 13),
    ('cultural_sensitivity', 'SAFEPARENT_Q014', 'A culturally sensitive parenting assessment should:', 14),
    ('communication_about_rules', 'SAFEPARENT_Q015', 'What is the most effective way to introduce a new family rule?', 15),
    ('support_during_transitions', 'SAFEPARENT_Q016', 'Your child is starting a new school and feels anxious. What response best supports them?', 16),
    ('screen_time_balance', 'SAFEPARENT_Q017', 'Which approach best reflects balanced screen time management?', 17),
    ('collaboration_with_child', 'SAFEPARENT_Q018', 'When setting routines, collaborative parenting looks like:', 18),
    ('stress_management_for_parent', 'SAFEPARENT_Q019', 'A parent who is overwhelmed and stressed can best support their child by first:', 19),
    ('fairness_and_bias', 'SAFEPARENT_Q020', 'To avoid bias when assessing siblings'' behaviour, a parent should:', 20)
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
  select id from public.assessment_instruments where slug = 'safesteps-parenting-multiple-choice-v1'
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
      ('SAFEPARENT_Q001', 'A', 'Tell them to stop overreacting and move on', 0::numeric, 1),
      ('SAFEPARENT_Q001', 'B', 'Ask what happened and listen without interrupting', 1::numeric, 2),
      ('SAFEPARENT_Q001', 'C', 'Immediately call the school to complain', 0::numeric, 3),
      ('SAFEPARENT_Q001', 'D', 'Change the subject to something more positive', 0::numeric, 4),
      ('SAFEPARENT_Q002', 'A', 'Sometimes allow extra time, sometimes not, depending on your mood', 0::numeric, 1),
      ('SAFEPARENT_Q002', 'B', 'Ignore the rule if they''ve had a good day', 0::numeric, 2),
      ('SAFEPARENT_Q002', 'C', 'Calmly restate the rule and follow through with the agreed limit', 1::numeric, 3),
      ('SAFEPARENT_Q002', 'D', 'Remove all devices permanently', 0::numeric, 4),
      ('SAFEPARENT_Q003', 'A', 'Yell at them and call them irresponsible', 0::numeric, 1),
      ('SAFEPARENT_Q003', 'B', 'Do the homework for them so they don''t get in trouble', 0::numeric, 2),
      ('SAFEPARENT_Q003', 'C', 'Help them plan a reminder system for next time and let natural consequences occur', 1::numeric, 3),
      ('SAFEPARENT_Q003', 'D', 'Punish them with extra chores immediately', 0::numeric, 4),
      ('SAFEPARENT_Q004', 'A', 'Long lectures with multiple points and examples', 0::numeric, 1),
      ('SAFEPARENT_Q004', 'B', 'Clear, short instructions with one or two steps at a time', 1::numeric, 2),
      ('SAFEPARENT_Q004', 'C', 'Sarcastic comments that imply what they should do', 0::numeric, 3),
      ('SAFEPARENT_Q004', 'D', 'Non-verbal hints instead of direct instructions', 0::numeric, 4),
      ('SAFEPARENT_Q005', 'A', 'React immediately and shout so they know you''re serious', 0::numeric, 1),
      ('SAFEPARENT_Q005', 'B', 'Take a brief pause to calm yourself before discussing what happened', 1::numeric, 2),
      ('SAFEPARENT_Q005', 'C', 'Ignore the situation completely', 0::numeric, 3),
      ('SAFEPARENT_Q005', 'D', 'Send them to their room without explanation', 0::numeric, 4),
      ('SAFEPARENT_Q006', 'A', 'Being unpredictable so they learn to adapt', 0::numeric, 1),
      ('SAFEPARENT_Q006', 'B', 'Responding reliably when they seek comfort or help', 1::numeric, 2),
      ('SAFEPARENT_Q006', 'C', 'Only showing warmth when they achieve something', 0::numeric, 3),
      ('SAFEPARENT_Q006', 'D', 'Avoiding emotional conversations to keep things calm', 0::numeric, 4),
      ('SAFEPARENT_Q007', 'A', 'Discourage them to avoid failure', 0::numeric, 1),
      ('SAFEPARENT_Q007', 'B', 'Decide for them which activity is best', 0::numeric, 2),
      ('SAFEPARENT_Q007', 'C', 'Encourage them to try and help with realistic expectations', 1::numeric, 3),
      ('SAFEPARENT_Q007', 'D', 'Tell them they must become the best at it', 0::numeric, 4),
      ('SAFEPARENT_Q008', 'A', 'Take the toy away and refuse to discuss it', 0::numeric, 1),
      ('SAFEPARENT_Q008', 'B', 'Choose a favourite child and give them the toy', 0::numeric, 2),
      ('SAFEPARENT_Q008', 'C', 'Guide them to take turns or find a shared solution', 1::numeric, 3),
      ('SAFEPARENT_Q008', 'D', 'Tell them to sort it out themselves without any guidance', 0::numeric, 4),
      ('SAFEPARENT_Q009', 'A', 'To never make mistakes at school', 0::numeric, 1),
      ('SAFEPARENT_Q009', 'B', 'To follow simple routines with occasional reminders', 1::numeric, 2),
      ('SAFEPARENT_Q009', 'C', 'To manage all homework independently without support', 0::numeric, 3),
      ('SAFEPARENT_Q009', 'D', 'To always stay calm and never cry', 0::numeric, 4),
      ('SAFEPARENT_Q010', 'A', 'Identifying everything the child does wrong', 0::numeric, 1),
      ('SAFEPARENT_Q010', 'B', 'Comparing the child to others to motivate improvement', 0::numeric, 2),
      ('SAFEPARENT_Q010', 'C', 'Recognising and building on the child''s existing abilities and interests', 1::numeric, 3),
      ('SAFEPARENT_Q010', 'D', 'Ignoring challenges and only praising', 0::numeric, 4),
      ('SAFEPARENT_Q011', 'A', 'Each caregiver keeps their own rules without discussion', 0::numeric, 1),
      ('SAFEPARENT_Q011', 'B', 'Caregivers argue in front of the child about whose rule is right', 0::numeric, 2),
      ('SAFEPARENT_Q011', 'C', 'Caregivers agree on a shared bedtime routine and communicate it clearly', 1::numeric, 3),
      ('SAFEPARENT_Q011', 'D', 'Let the child choose whichever rule they prefer each night', 0::numeric, 4),
      ('SAFEPARENT_Q012', 'A', 'Global criticism of their character, such as saying they are lazy', 0::numeric, 1),
      ('SAFEPARENT_Q012', 'B', 'Specific, behaviour-focused feedback with guidance for next time', 1::numeric, 2),
      ('SAFEPARENT_Q012', 'C', 'Silent treatment so they figure it out', 0::numeric, 3),
      ('SAFEPARENT_Q012', 'D', 'Publicly pointing out the mistake to others', 0::numeric, 4),
      ('SAFEPARENT_Q013', 'A', 'Allow them without any supervision', 0::numeric, 1),
      ('SAFEPARENT_Q013', 'B', 'Explain the risks and supervise while setting clear boundaries', 1::numeric, 2),
      ('SAFEPARENT_Q013', 'C', 'Forbid all outdoor play completely', 0::numeric, 3),
      ('SAFEPARENT_Q013', 'D', 'Assume they already know how to stay safe', 0::numeric, 4),
      ('SAFEPARENT_Q014', 'A', 'Assume all families share the same values and practices', 0::numeric, 1),
      ('SAFEPARENT_Q014', 'B', 'Ignore cultural context to stay neutral', 0::numeric, 2),
      ('SAFEPARENT_Q014', 'C', 'Consider cultural norms while still prioritising child safety and wellbeing', 1::numeric, 3),
      ('SAFEPARENT_Q014', 'D', 'Judge families based solely on majority culture standards', 0::numeric, 4),
      ('SAFEPARENT_Q015', 'A', 'Announce it during an argument', 0::numeric, 1),
      ('SAFEPARENT_Q015', 'B', 'Explain the rule calmly, including the reason and consequences', 1::numeric, 2),
      ('SAFEPARENT_Q015', 'C', 'Write it down but never discuss it', 0::numeric, 3),
      ('SAFEPARENT_Q015', 'D', 'Expect children to guess the rule over time', 0::numeric, 4),
      ('SAFEPARENT_Q016', 'A', 'Tell them there''s nothing to worry about and change the topic', 0::numeric, 1),
      ('SAFEPARENT_Q016', 'B', 'Validate their feelings and discuss what the first day might look like', 1::numeric, 2),
      ('SAFEPARENT_Q016', 'C', 'Insist they stop being nervous', 0::numeric, 3),
      ('SAFEPARENT_Q016', 'D', 'Avoid talking about the change at all', 0::numeric, 4),
      ('SAFEPARENT_Q017', 'A', 'Unlimited access as long as they''re quiet', 0::numeric, 1),
      ('SAFEPARENT_Q017', 'B', 'No screens allowed under any circumstances', 0::numeric, 2),
      ('SAFEPARENT_Q017', 'C', 'Agreed limits, with breaks for physical activity and family interaction', 1::numeric, 3),
      ('SAFEPARENT_Q017', 'D', 'Using screens only as punishment', 0::numeric, 4),
      ('SAFEPARENT_Q018', 'A', 'Dictating every detail without input', 0::numeric, 1),
      ('SAFEPARENT_Q018', 'B', 'Inviting the child to contribute ideas within clear boundaries', 1::numeric, 2),
      ('SAFEPARENT_Q018', 'C', 'Letting the child decide all routines alone', 0::numeric, 3),
      ('SAFEPARENT_Q018', 'D', 'Changing routines frequently without explanation', 0::numeric, 4),
      ('SAFEPARENT_Q019', 'A', 'Ignoring their own stress completely', 0::numeric, 1),
      ('SAFEPARENT_Q019', 'B', 'Seeking healthy coping strategies or support to regulate themselves', 1::numeric, 2),
      ('SAFEPARENT_Q019', 'C', 'Expecting the child to comfort them', 0::numeric, 3),
      ('SAFEPARENT_Q019', 'D', 'Withdrawing from the child until the stress passes', 0::numeric, 4),
      ('SAFEPARENT_Q020', 'A', 'Assume the older child is always responsible', 0::numeric, 1),
      ('SAFEPARENT_Q020', 'B', 'Base decisions on observable behaviour rather than assumptions or favourites', 1::numeric, 2),
      ('SAFEPARENT_Q020', 'C', 'Trust whichever child they feel closer to', 0::numeric, 3),
      ('SAFEPARENT_Q020', 'D', 'Let one child make decisions for the other', 0::numeric, 4)
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
