-- Seed additional SafeSteps multiple-choice parenting assessment items Q081-Q100.

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
    ('emotional_attunement', 'SAFEPARENT_Q081', 'Your child appears frustrated while trying a new skill. What is the most supportive response?', 81),
    ('routine_stability', 'SAFEPARENT_Q082', 'Predictable routines help children by:', 82),
    ('communication_style', 'SAFEPARENT_Q083', 'Which communication method best supports cooperation?', 83),
    ('positive_discipline', 'SAFEPARENT_Q084', 'Your child forgets to complete a chore. What is the most constructive response?', 84),
    ('autonomy_support', 'SAFEPARENT_Q085', 'Your child wants to organise their own backpack. What supports autonomy?', 85),
    ('stress_management', 'SAFEPARENT_Q086', 'A parent feeling overwhelmed should first:', 86),
    ('conflict_resolution', 'SAFEPARENT_Q087', 'Two children argue about a shared device. What is the healthiest approach?', 87),
    ('expectations_realism', 'SAFEPARENT_Q088', 'Which expectation is realistic for a 9-year-old?', 88),
    ('safety_awareness', 'SAFEPARENT_Q089', 'Your child wants to climb a tall tree. What is the safest approach?', 89),
    ('attachment_security', 'SAFEPARENT_Q090', 'Secure attachment is strengthened when a parent:', 90),
    ('feedback_quality', 'SAFEPARENT_Q091', 'Constructive feedback should focus on:', 91),
    ('collaboration_with_child', 'SAFEPARENT_Q092', 'Collaborative decision-making involves:', 92),
    ('screen_time_management', 'SAFEPARENT_Q093', 'Balanced screen time includes:', 93),
    ('parent_child_relationship', 'SAFEPARENT_Q094', 'Strong parent-child relationships are built through:', 94),
    ('behaviour_guidance', 'SAFEPARENT_Q095', 'When a child breaks a rule, the most constructive step is:', 95),
    ('empathy_development', 'SAFEPARENT_Q096', 'Parents help children develop empathy by:', 96),
    ('cultural_sensitivity', 'SAFEPARENT_Q097', 'Culturally sensitive parenting assessments should:', 97),
    ('transition_support', 'SAFEPARENT_Q098', 'During major life changes, children benefit most when parents:', 98),
    ('fairness_and_bias', 'SAFEPARENT_Q099', 'To avoid bias when assessing behaviour, parents should:', 99),
    ('motivation_support', 'SAFEPARENT_Q100', 'Intrinsic motivation is strengthened when parents:', 100)
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
      ('SAFEPARENT_Q081', 'A', 'Tell them to stop complaining', 0::numeric, 1),
      ('SAFEPARENT_Q081', 'B', 'Acknowledge their feelings and encourage continued effort', 1::numeric, 2),
      ('SAFEPARENT_Q081', 'C', 'Do the task for them', 0::numeric, 3),
      ('SAFEPARENT_Q081', 'D', 'Ignore their frustration', 0::numeric, 4),
      ('SAFEPARENT_Q082', 'A', 'Increasing confusion', 0::numeric, 1),
      ('SAFEPARENT_Q082', 'B', 'Providing structure that reduces stress', 1::numeric, 2),
      ('SAFEPARENT_Q082', 'C', 'Removing flexibility entirely', 0::numeric, 3),
      ('SAFEPARENT_Q082', 'D', 'Making daily tasks harder', 0::numeric, 4),
      ('SAFEPARENT_Q083', 'A', 'Clear, calm, and direct instructions', 1::numeric, 1),
      ('SAFEPARENT_Q083', 'B', 'Sarcasm to make your point', 0::numeric, 2),
      ('SAFEPARENT_Q083', 'C', 'Long, complicated explanations', 0::numeric, 3),
      ('SAFEPARENT_Q083', 'D', 'Raising your voice', 0::numeric, 4),
      ('SAFEPARENT_Q084', 'A', 'Yell at them for being irresponsible', 0::numeric, 1),
      ('SAFEPARENT_Q084', 'B', 'Ignore it completely', 0::numeric, 2),
      ('SAFEPARENT_Q084', 'C', 'Remind them and help set up a routine', 1::numeric, 3),
      ('SAFEPARENT_Q084', 'D', 'Punish them harshly', 0::numeric, 4),
      ('SAFEPARENT_Q085', 'A', 'Let them organise it with gentle guidance', 1::numeric, 1),
      ('SAFEPARENT_Q085', 'B', 'Do it entirely for them', 0::numeric, 2),
      ('SAFEPARENT_Q085', 'C', 'Criticise their choices', 0::numeric, 3),
      ('SAFEPARENT_Q085', 'D', 'Refuse to let them try', 0::numeric, 4),
      ('SAFEPARENT_Q086', 'A', 'Pause and regulate before responding', 1::numeric, 1),
      ('SAFEPARENT_Q086', 'B', 'React impulsively', 0::numeric, 2),
      ('SAFEPARENT_Q086', 'C', 'Expect the child to calm them', 0::numeric, 3),
      ('SAFEPARENT_Q086', 'D', 'Withdraw completely', 0::numeric, 4),
      ('SAFEPARENT_Q087', 'A', 'Let them fight until someone wins', 0::numeric, 1),
      ('SAFEPARENT_Q087', 'B', 'Choose a favourite child to keep it', 0::numeric, 2),
      ('SAFEPARENT_Q087', 'C', 'Guide them to negotiate fair turns', 1::numeric, 3),
      ('SAFEPARENT_Q087', 'D', 'Remove the device permanently', 0::numeric, 4),
      ('SAFEPARENT_Q088', 'A', 'Never needing reminders', 0::numeric, 1),
      ('SAFEPARENT_Q088', 'B', 'Managing simple routines with support', 1::numeric, 2),
      ('SAFEPARENT_Q088', 'C', 'Handling complex tasks independently', 0::numeric, 3),
      ('SAFEPARENT_Q088', 'D', 'Always staying calm', 0::numeric, 4),
      ('SAFEPARENT_Q089', 'A', 'Allow them unsupervised', 0::numeric, 1),
      ('SAFEPARENT_Q089', 'B', 'Explain safety rules and supervise closely', 1::numeric, 2),
      ('SAFEPARENT_Q089', 'C', 'Ban climbing entirely', 0::numeric, 3),
      ('SAFEPARENT_Q089', 'D', 'Let them experiment freely', 0::numeric, 4),
      ('SAFEPARENT_Q090', 'A', 'Responds consistently and warmly', 1::numeric, 1),
      ('SAFEPARENT_Q090', 'B', 'Avoids comforting the child', 0::numeric, 2),
      ('SAFEPARENT_Q090', 'C', 'Shows affection only during achievements', 0::numeric, 3),
      ('SAFEPARENT_Q090', 'D', 'Uses emotional distance as discipline', 0::numeric, 4),
      ('SAFEPARENT_Q091', 'A', 'Criticising personality traits', 0::numeric, 1),
      ('SAFEPARENT_Q091', 'B', 'Highlighting mistakes without guidance', 0::numeric, 2),
      ('SAFEPARENT_Q091', 'C', 'Specific behaviours and improvement strategies', 1::numeric, 3),
      ('SAFEPARENT_Q091', 'D', 'Publicly pointing out errors', 0::numeric, 4),
      ('SAFEPARENT_Q092', 'A', 'Dictating all choices', 0::numeric, 1),
      ('SAFEPARENT_Q092', 'B', 'Ignoring the child''s perspective', 0::numeric, 2),
      ('SAFEPARENT_Q092', 'C', 'Working together to find fair solutions', 1::numeric, 3),
      ('SAFEPARENT_Q092', 'D', 'Letting the child decide everything', 0::numeric, 4),
      ('SAFEPARENT_Q093', 'A', 'Unlimited access', 0::numeric, 1),
      ('SAFEPARENT_Q093', 'B', 'No screens ever', 0::numeric, 2),
      ('SAFEPARENT_Q093', 'C', 'Clear limits and breaks for physical activity', 1::numeric, 3),
      ('SAFEPARENT_Q093', 'D', 'Using screens only as punishment', 0::numeric, 4),
      ('SAFEPARENT_Q094', 'A', 'Warmth, communication, and shared time', 1::numeric, 1),
      ('SAFEPARENT_Q094', 'B', 'Frequent criticism', 0::numeric, 2),
      ('SAFEPARENT_Q094', 'C', 'Ignoring emotional needs', 0::numeric, 3),
      ('SAFEPARENT_Q094', 'D', 'Rigid control', 0::numeric, 4),
      ('SAFEPARENT_Q095', 'A', 'Explain why the rule exists and discuss consequences', 1::numeric, 1),
      ('SAFEPARENT_Q095', 'B', 'Punish them without explanation', 0::numeric, 2),
      ('SAFEPARENT_Q095', 'C', 'Ignore the behaviour', 0::numeric, 3),
      ('SAFEPARENT_Q095', 'D', 'React with anger', 0::numeric, 4),
      ('SAFEPARENT_Q096', 'A', 'Discussing feelings and perspectives', 1::numeric, 1),
      ('SAFEPARENT_Q096', 'B', 'Avoiding emotional conversations', 0::numeric, 2),
      ('SAFEPARENT_Q096', 'C', 'Mocking emotional reactions', 0::numeric, 3),
      ('SAFEPARENT_Q096', 'D', 'Discouraging emotional expression', 0::numeric, 4),
      ('SAFEPARENT_Q097', 'A', 'Ignore cultural context', 0::numeric, 1),
      ('SAFEPARENT_Q097', 'B', 'Assume all families share identical values', 0::numeric, 2),
      ('SAFEPARENT_Q097', 'C', 'Consider cultural norms while prioritising safety', 1::numeric, 3),
      ('SAFEPARENT_Q097', 'D', 'Judge families based on stereotypes', 0::numeric, 4),
      ('SAFEPARENT_Q098', 'A', 'Avoid discussing the change', 0::numeric, 1),
      ('SAFEPARENT_Q098', 'B', 'Validate feelings and provide predictable routines', 1::numeric, 2),
      ('SAFEPARENT_Q098', 'C', 'Expect immediate adjustment', 0::numeric, 3),
      ('SAFEPARENT_Q098', 'D', 'Minimise the child''s concerns', 0::numeric, 4),
      ('SAFEPARENT_Q099', 'A', 'Rely on assumptions', 0::numeric, 1),
      ('SAFEPARENT_Q099', 'B', 'Base decisions on observable behaviour', 1::numeric, 2),
      ('SAFEPARENT_Q099', 'C', 'Favour one child consistently', 0::numeric, 3),
      ('SAFEPARENT_Q099', 'D', 'Let siblings decide consequences', 0::numeric, 4),
      ('SAFEPARENT_Q100', 'A', 'Use rewards for every task', 0::numeric, 1),
      ('SAFEPARENT_Q100', 'B', 'Encourage effort and curiosity', 1::numeric, 2),
      ('SAFEPARENT_Q100', 'C', 'Criticise mistakes harshly', 0::numeric, 3),
      ('SAFEPARENT_Q100', 'D', 'Compare the child to others', 0::numeric, 4)
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
