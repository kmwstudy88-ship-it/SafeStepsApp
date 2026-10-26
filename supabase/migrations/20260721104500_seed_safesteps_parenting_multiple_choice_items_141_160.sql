-- Seed additional SafeSteps multiple-choice parenting assessment items Q141-Q160.

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
    ('emotional_attunement', 'SAFEPARENT_Q141', 'Your child suddenly withdraws during a family activity. What is the most supportive response?', 141),
    ('routine_stability', 'SAFEPARENT_Q142', 'Consistent morning routines help children primarily by:', 142),
    ('communication_style', 'SAFEPARENT_Q143', 'Your child is not responding to instructions. What improves cooperation?', 143),
    ('positive_discipline', 'SAFEPARENT_Q144', 'Your child breaks a rule about rough play. What is the most constructive response?', 144),
    ('autonomy_support', 'SAFEPARENT_Q145', 'Your child wants to choose their own bedtime story. What supports autonomy?', 145),
    ('stress_management_for_parent', 'SAFEPARENT_Q146', 'You feel overwhelmed during a disagreement. What is the healthiest step?', 146),
    ('conflict_resolution', 'SAFEPARENT_Q147', 'Two children argue about who gets the first turn. What is the healthiest approach?', 147),
    ('expectations_realism', 'SAFEPARENT_Q148', 'Which expectation is realistic for a 3-year-old?', 148),
    ('safety_awareness', 'SAFEPARENT_Q149', 'Your child wants to explore a nearby creek. What is the safest approach?', 149),
    ('attachment_security', 'SAFEPARENT_Q150', 'A child''s sense of security increases when parents:', 150),
    ('feedback_quality', 'SAFEPARENT_Q151', 'Your child struggles with tying their shoes. Which feedback best supports learning?', 151),
    ('collaboration_with_child', 'SAFEPARENT_Q152', 'You''re planning a new morning routine. What shows collaboration?', 152),
    ('screen_time_management', 'SAFEPARENT_Q153', 'Balanced screen time includes:', 153),
    ('parent_child_relationship', 'SAFEPARENT_Q154', 'Which behaviour strengthens the parent-child relationship?', 154),
    ('behaviour_guidance', 'SAFEPARENT_Q155', 'Your child repeatedly interrupts conversations. What is the most constructive step?', 155),
    ('empathy_development', 'SAFEPARENT_Q156', 'You want to help your child understand others'' feelings. What is most effective?', 156),
    ('cultural_sensitivity', 'SAFEPARENT_Q157', 'A culturally sensitive assessment should:', 157),
    ('transition_support', 'SAFEPARENT_Q158', 'Your child is anxious about joining a new sports team. What best supports them?', 158),
    ('fairness_and_bias', 'SAFEPARENT_Q159', 'To reduce bias in sibling conflicts, a parent should:', 159),
    ('motivation_support', 'SAFEPARENT_Q160', 'Which approach best supports intrinsic motivation?', 160)
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
      ('SAFEPARENT_Q141', 'A', 'Tell them to stop being rude', 0::numeric, 1),
      ('SAFEPARENT_Q141', 'B', 'Check in gently and ask if something is bothering them', 1::numeric, 2),
      ('SAFEPARENT_Q141', 'C', 'Ignore the withdrawal', 0::numeric, 3),
      ('SAFEPARENT_Q141', 'D', 'Force them to rejoin immediately', 0::numeric, 4),
      ('SAFEPARENT_Q142', 'A', 'Increasing stress', 0::numeric, 1),
      ('SAFEPARENT_Q142', 'B', 'Reducing uncertainty and supporting smoother transitions', 1::numeric, 2),
      ('SAFEPARENT_Q142', 'C', 'Removing all flexibility', 0::numeric, 3),
      ('SAFEPARENT_Q142', 'D', 'Making mornings more chaotic', 0::numeric, 4),
      ('SAFEPARENT_Q143', 'A', 'Give clear, simple instructions after gaining their attention', 1::numeric, 1),
      ('SAFEPARENT_Q143', 'B', 'Use sarcasm to get their attention', 0::numeric, 2),
      ('SAFEPARENT_Q143', 'C', 'Give long explanations', 0::numeric, 3),
      ('SAFEPARENT_Q143', 'D', 'Raise your voice', 0::numeric, 4),
      ('SAFEPARENT_Q144', 'A', 'Explain why the rule exists and guide safer alternatives', 1::numeric, 1),
      ('SAFEPARENT_Q144', 'B', 'Punish them harshly', 0::numeric, 2),
      ('SAFEPARENT_Q144', 'C', 'Ignore the behaviour', 0::numeric, 3),
      ('SAFEPARENT_Q144', 'D', 'Shame them for misbehaving', 0::numeric, 4),
      ('SAFEPARENT_Q145', 'A', 'Let them choose from appropriate options', 1::numeric, 1),
      ('SAFEPARENT_Q145', 'B', 'Choose the story for them', 0::numeric, 2),
      ('SAFEPARENT_Q145', 'C', 'Criticise their choice', 0::numeric, 3),
      ('SAFEPARENT_Q145', 'D', 'Refuse to let them pick', 0::numeric, 4),
      ('SAFEPARENT_Q146', 'A', 'Pause to regulate before continuing', 1::numeric, 1),
      ('SAFEPARENT_Q146', 'B', 'React impulsively', 0::numeric, 2),
      ('SAFEPARENT_Q146', 'C', 'Blame the child', 0::numeric, 3),
      ('SAFEPARENT_Q146', 'D', 'Withdraw completely', 0::numeric, 4),
      ('SAFEPARENT_Q147', 'A', 'Let them fight until someone wins', 0::numeric, 1),
      ('SAFEPARENT_Q147', 'B', 'Choose a favourite child', 0::numeric, 2),
      ('SAFEPARENT_Q147', 'C', 'Guide them to take turns fairly', 1::numeric, 3),
      ('SAFEPARENT_Q147', 'D', 'Remove the activity entirely', 0::numeric, 4),
      ('SAFEPARENT_Q148', 'A', 'To manage complex tasks independently', 0::numeric, 1),
      ('SAFEPARENT_Q148', 'B', 'To follow simple routines with support', 1::numeric, 2),
      ('SAFEPARENT_Q148', 'C', 'To never show frustration', 0::numeric, 3),
      ('SAFEPARENT_Q148', 'D', 'To stay focused for long periods', 0::numeric, 4),
      ('SAFEPARENT_Q149', 'A', 'Let them explore unsupervised', 0::numeric, 1),
      ('SAFEPARENT_Q149', 'B', 'Explain safety rules and supervise closely', 1::numeric, 2),
      ('SAFEPARENT_Q149', 'C', 'Ban outdoor exploration', 0::numeric, 3),
      ('SAFEPARENT_Q149', 'D', 'Assume they know how to stay safe', 0::numeric, 4),
      ('SAFEPARENT_Q150', 'A', 'Respond consistently and with warmth', 1::numeric, 1),
      ('SAFEPARENT_Q150', 'B', 'Avoid comforting them', 0::numeric, 2),
      ('SAFEPARENT_Q150', 'C', 'Only show affection during achievements', 0::numeric, 3),
      ('SAFEPARENT_Q150', 'D', 'Use emotional withdrawal', 0::numeric, 4),
      ('SAFEPARENT_Q151', 'A', '"You''re bad at this."', 0::numeric, 1),
      ('SAFEPARENT_Q151', 'B', '"You always fail at this."', 0::numeric, 2),
      ('SAFEPARENT_Q151', 'C', '"Let''s try it step by step together."', 1::numeric, 3),
      ('SAFEPARENT_Q151', 'D', '"Other kids can do it easily."', 0::numeric, 4),
      ('SAFEPARENT_Q152', 'A', 'Announce the routine with no discussion', 0::numeric, 1),
      ('SAFEPARENT_Q152', 'B', 'Ask your child what steps they prefer within limits', 1::numeric, 2),
      ('SAFEPARENT_Q152', 'C', 'Let them decide everything with no structure', 0::numeric, 3),
      ('SAFEPARENT_Q152', 'D', 'Change the routine daily without explanation', 0::numeric, 4),
      ('SAFEPARENT_Q153', 'A', 'Unlimited access', 0::numeric, 1),
      ('SAFEPARENT_Q153', 'B', 'No screens ever', 0::numeric, 2),
      ('SAFEPARENT_Q153', 'C', 'Clear limits and breaks for movement', 1::numeric, 3),
      ('SAFEPARENT_Q153', 'D', 'Using screens only as punishment', 0::numeric, 4),
      ('SAFEPARENT_Q154', 'A', 'Regular connection and active listening', 1::numeric, 1),
      ('SAFEPARENT_Q154', 'B', 'Frequent criticism', 0::numeric, 2),
      ('SAFEPARENT_Q154', 'C', 'Avoiding emotional conversations', 0::numeric, 3),
      ('SAFEPARENT_Q154', 'D', 'Controlling every decision', 0::numeric, 4),
      ('SAFEPARENT_Q155', 'A', 'Explain the rule and practice waiting turns', 1::numeric, 1),
      ('SAFEPARENT_Q155', 'B', 'Punish them harshly', 0::numeric, 2),
      ('SAFEPARENT_Q155', 'C', 'Ignore the behaviour', 0::numeric, 3),
      ('SAFEPARENT_Q155', 'D', 'React with anger', 0::numeric, 4),
      ('SAFEPARENT_Q156', 'A', 'Ask how they think someone else might feel', 1::numeric, 1),
      ('SAFEPARENT_Q156', 'B', 'Discourage emotional talk', 0::numeric, 2),
      ('SAFEPARENT_Q156', 'C', 'Mock emotional reactions', 0::numeric, 3),
      ('SAFEPARENT_Q156', 'D', 'Avoid discussing feelings', 0::numeric, 4),
      ('SAFEPARENT_Q157', 'A', 'Ignore cultural context', 0::numeric, 1),
      ('SAFEPARENT_Q157', 'B', 'Assume all families share identical values', 0::numeric, 2),
      ('SAFEPARENT_Q157', 'C', 'Consider cultural norms while ensuring safety', 1::numeric, 3),
      ('SAFEPARENT_Q157', 'D', 'Judge families based on stereotypes', 0::numeric, 4),
      ('SAFEPARENT_Q158', 'A', 'Avoid discussing it', 0::numeric, 1),
      ('SAFEPARENT_Q158', 'B', 'Validate feelings and explain what to expect', 1::numeric, 2),
      ('SAFEPARENT_Q158', 'C', 'Expect immediate excitement', 0::numeric, 3),
      ('SAFEPARENT_Q158', 'D', 'Dismiss their concerns', 0::numeric, 4),
      ('SAFEPARENT_Q159', 'A', 'Assume the older child is responsible', 0::numeric, 1),
      ('SAFEPARENT_Q159', 'B', 'Base decisions on observed behaviour', 1::numeric, 2),
      ('SAFEPARENT_Q159', 'C', 'Side with the child they feel closer to', 0::numeric, 3),
      ('SAFEPARENT_Q159', 'D', 'Let one child decide consequences', 0::numeric, 4),
      ('SAFEPARENT_Q160', 'A', 'Praise effort and curiosity', 1::numeric, 1),
      ('SAFEPARENT_Q160', 'B', 'Compare them to other children', 0::numeric, 2),
      ('SAFEPARENT_Q160', 'C', 'Use rewards for every task', 0::numeric, 3),
      ('SAFEPARENT_Q160', 'D', 'Criticise mistakes harshly', 0::numeric, 4)
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
