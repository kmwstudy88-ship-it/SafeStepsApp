-- Seed additional SafeSteps multiple-choice parenting assessment items Q121-Q140.
-- Q116-Q120 remain intentionally absent because complete source content has not been provided.

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
    ('emotional_attunement', 'SAFEPARENT_Q121', 'Your child seems unusually irritated during a simple task. What is the most supportive response?', 121),
    ('routine_stability', 'SAFEPARENT_Q122', 'Consistent evening routines help children by:', 122),
    ('communication_style', 'SAFEPARENT_Q123', 'Your child is distracted while you''re giving instructions. What improves cooperation?', 123),
    ('positive_discipline', 'SAFEPARENT_Q124', 'Your child throws a toy in frustration. What is the most constructive response?', 124),
    ('autonomy_support', 'SAFEPARENT_Q125', 'Your child wants to choose their own reading material. What supports autonomy?', 125),
    ('stress_management_for_parent', 'SAFEPARENT_Q126', 'You feel overwhelmed during a busy morning. What is the healthiest step?', 126),
    ('conflict_resolution', 'SAFEPARENT_Q127', 'Two children argue about who gets the last snack. What is the healthiest approach?', 127),
    ('expectations_realism', 'SAFEPARENT_Q128', 'Which expectation is realistic for a 4-year-old?', 128),
    ('safety_awareness', 'SAFEPARENT_Q129', 'Your child wants to help with cooking. What is the safest approach?', 129),
    ('attachment_security', 'SAFEPARENT_Q130', 'A child''s sense of security increases when parents:', 130),
    ('feedback_quality', 'SAFEPARENT_Q131', 'Your child struggles with a puzzle. Which feedback best supports learning?', 131),
    ('collaboration_with_child', 'SAFEPARENT_Q132', 'You''re planning weekend chores. What shows collaboration?', 132),
    ('screen_time_management', 'SAFEPARENT_Q133', 'Balanced screen time includes:', 133),
    ('parent_child_relationship', 'SAFEPARENT_Q134', 'Which behaviour strengthens the parent-child relationship?', 134),
    ('behaviour_guidance', 'SAFEPARENT_Q135', 'Your child repeatedly runs indoors. What is the most constructive step?', 135),
    ('empathy_development', 'SAFEPARENT_Q136', 'You want to help your child understand others'' feelings. What is most effective?', 136),
    ('cultural_sensitivity', 'SAFEPARENT_Q137', 'A culturally sensitive assessment should:', 137),
    ('transition_support', 'SAFEPARENT_Q138', 'Your child is nervous about starting a new activity. What best supports them?', 138),
    ('fairness_and_bias', 'SAFEPARENT_Q139', 'To reduce bias in sibling conflicts, a parent should:', 139),
    ('motivation_support', 'SAFEPARENT_Q140', 'Which approach best supports intrinsic motivation?', 140)
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
      ('SAFEPARENT_Q121', 'A', 'Tell them to stop overreacting', 0::numeric, 1),
      ('SAFEPARENT_Q121', 'B', 'Ask how they''re feeling and offer calm support', 1::numeric, 2),
      ('SAFEPARENT_Q121', 'C', 'Ignore the irritation', 0::numeric, 3),
      ('SAFEPARENT_Q121', 'D', 'Punish them for being moody', 0::numeric, 4),
      ('SAFEPARENT_Q122', 'A', 'Increasing unpredictability', 0::numeric, 1),
      ('SAFEPARENT_Q122', 'B', 'Supporting smoother transitions and reduced stress', 1::numeric, 2),
      ('SAFEPARENT_Q122', 'C', 'Removing all flexibility', 0::numeric, 3),
      ('SAFEPARENT_Q122', 'D', 'Making bedtime more chaotic', 0::numeric, 4),
      ('SAFEPARENT_Q123', 'A', 'Give short, clear instructions after gaining their attention', 1::numeric, 1),
      ('SAFEPARENT_Q123', 'B', 'Speak louder until they respond', 0::numeric, 2),
      ('SAFEPARENT_Q123', 'C', 'Use sarcasm to get their attention', 0::numeric, 3),
      ('SAFEPARENT_Q123', 'D', 'Give long explanations they may not follow', 0::numeric, 4),
      ('SAFEPARENT_Q124', 'A', 'Yell and take all toys away', 0::numeric, 1),
      ('SAFEPARENT_Q124', 'B', 'Ignore the behaviour completely', 0::numeric, 2),
      ('SAFEPARENT_Q124', 'C', 'Help them calm down and discuss safer ways to express frustration', 1::numeric, 3),
      ('SAFEPARENT_Q124', 'D', 'Punish them harshly', 0::numeric, 4),
      ('SAFEPARENT_Q125', 'A', 'Let them choose from age-appropriate options', 1::numeric, 1),
      ('SAFEPARENT_Q125', 'B', 'Choose all books for them', 0::numeric, 2),
      ('SAFEPARENT_Q125', 'C', 'Criticise their choices', 0::numeric, 3),
      ('SAFEPARENT_Q125', 'D', 'Refuse to let them pick anything', 0::numeric, 4),
      ('SAFEPARENT_Q126', 'A', 'Pause briefly to regulate before continuing', 1::numeric, 1),
      ('SAFEPARENT_Q126', 'B', 'Blame the child for the stress', 0::numeric, 2),
      ('SAFEPARENT_Q126', 'C', 'React impulsively', 0::numeric, 3),
      ('SAFEPARENT_Q126', 'D', 'Withdraw from the child entirely', 0::numeric, 4),
      ('SAFEPARENT_Q127', 'A', 'Let them fight until someone wins', 0::numeric, 1),
      ('SAFEPARENT_Q127', 'B', 'Choose a favourite child', 0::numeric, 2),
      ('SAFEPARENT_Q127', 'C', 'Guide them to share or take turns', 1::numeric, 3),
      ('SAFEPARENT_Q127', 'D', 'Remove snacks permanently', 0::numeric, 4),
      ('SAFEPARENT_Q128', 'A', 'To manage complex tasks independently', 0::numeric, 1),
      ('SAFEPARENT_Q128', 'B', 'To follow simple routines with reminders', 1::numeric, 2),
      ('SAFEPARENT_Q128', 'C', 'To never cry or show frustration', 0::numeric, 3),
      ('SAFEPARENT_Q128', 'D', 'To stay focused for long periods', 0::numeric, 4),
      ('SAFEPARENT_Q129', 'A', 'Let them use sharp tools unsupervised', 0::numeric, 1),
      ('SAFEPARENT_Q129', 'B', 'Explain safety rules and supervise closely', 1::numeric, 2),
      ('SAFEPARENT_Q129', 'C', 'Ban them from the kitchen', 0::numeric, 3),
      ('SAFEPARENT_Q129', 'D', 'Let them experiment freely', 0::numeric, 4),
      ('SAFEPARENT_Q130', 'A', 'Respond consistently and with warmth', 1::numeric, 1),
      ('SAFEPARENT_Q130', 'B', 'Avoid comforting them', 0::numeric, 2),
      ('SAFEPARENT_Q130', 'C', 'Only show affection during achievements', 0::numeric, 3),
      ('SAFEPARENT_Q130', 'D', 'Use emotional withdrawal', 0::numeric, 4),
      ('SAFEPARENT_Q131', 'A', '"You''re bad at puzzles."', 0::numeric, 1),
      ('SAFEPARENT_Q131', 'B', '"You always fail at this."', 0::numeric, 2),
      ('SAFEPARENT_Q131', 'C', '"Let''s try a different piece together."', 1::numeric, 3),
      ('SAFEPARENT_Q131', 'D', '"Other kids are better than you."', 0::numeric, 4),
      ('SAFEPARENT_Q132', 'A', 'Assign chores without discussion', 0::numeric, 1),
      ('SAFEPARENT_Q132', 'B', 'Ask your child which tasks they prefer within limits', 1::numeric, 2),
      ('SAFEPARENT_Q132', 'C', 'Let them choose everything with no structure', 0::numeric, 3),
      ('SAFEPARENT_Q132', 'D', 'Change chores daily without explanation', 0::numeric, 4),
      ('SAFEPARENT_Q133', 'A', 'Unlimited access', 0::numeric, 1),
      ('SAFEPARENT_Q133', 'B', 'No screens ever', 0::numeric, 2),
      ('SAFEPARENT_Q133', 'C', 'Clear limits and breaks for movement', 1::numeric, 3),
      ('SAFEPARENT_Q133', 'D', 'Using screens only as punishment', 0::numeric, 4),
      ('SAFEPARENT_Q134', 'A', 'Regular connection and active listening', 1::numeric, 1),
      ('SAFEPARENT_Q134', 'B', 'Frequent criticism', 0::numeric, 2),
      ('SAFEPARENT_Q134', 'C', 'Avoiding emotional conversations', 0::numeric, 3),
      ('SAFEPARENT_Q134', 'D', 'Controlling every decision', 0::numeric, 4),
      ('SAFEPARENT_Q135', 'A', 'Explain the safety rule and follow through consistently', 1::numeric, 1),
      ('SAFEPARENT_Q135', 'B', 'Punish them harshly without explanation', 0::numeric, 2),
      ('SAFEPARENT_Q135', 'C', 'Ignore the behaviour', 0::numeric, 3),
      ('SAFEPARENT_Q135', 'D', 'React with anger', 0::numeric, 4),
      ('SAFEPARENT_Q136', 'A', 'Ask how they think someone else might feel', 1::numeric, 1),
      ('SAFEPARENT_Q136', 'B', 'Discourage emotional talk', 0::numeric, 2),
      ('SAFEPARENT_Q136', 'C', 'Mock emotional reactions', 0::numeric, 3),
      ('SAFEPARENT_Q136', 'D', 'Avoid discussing feelings', 0::numeric, 4),
      ('SAFEPARENT_Q137', 'A', 'Ignore cultural context', 0::numeric, 1),
      ('SAFEPARENT_Q137', 'B', 'Assume all families share identical values', 0::numeric, 2),
      ('SAFEPARENT_Q137', 'C', 'Consider cultural norms while ensuring safety', 1::numeric, 3),
      ('SAFEPARENT_Q137', 'D', 'Judge families based on stereotypes', 0::numeric, 4),
      ('SAFEPARENT_Q138', 'A', 'Avoid discussing it', 0::numeric, 1),
      ('SAFEPARENT_Q138', 'B', 'Validate feelings and explain what to expect', 1::numeric, 2),
      ('SAFEPARENT_Q138', 'C', 'Expect immediate excitement', 0::numeric, 3),
      ('SAFEPARENT_Q138', 'D', 'Dismiss their concerns', 0::numeric, 4),
      ('SAFEPARENT_Q139', 'A', 'Assume the older child is responsible', 0::numeric, 1),
      ('SAFEPARENT_Q139', 'B', 'Base decisions on observed behaviour', 1::numeric, 2),
      ('SAFEPARENT_Q139', 'C', 'Side with the child they feel closer to', 0::numeric, 3),
      ('SAFEPARENT_Q139', 'D', 'Let one child decide consequences', 0::numeric, 4),
      ('SAFEPARENT_Q140', 'A', 'Praise effort and curiosity', 1::numeric, 1),
      ('SAFEPARENT_Q140', 'B', 'Compare them to other children', 0::numeric, 2),
      ('SAFEPARENT_Q140', 'C', 'Use rewards for every task', 0::numeric, 3),
      ('SAFEPARENT_Q140', 'D', 'Criticise mistakes harshly', 0::numeric, 4)
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
