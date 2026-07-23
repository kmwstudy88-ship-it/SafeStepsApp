-- Seed additional SafeSteps multiple-choice parenting assessment items Q101-Q115.
-- Q116 is intentionally excluded because the provided source cuts off mid-item.

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
    ('emotional_attunement', 'SAFEPARENT_Q101', 'Your child says, "No one likes me at school." What is the most supportive first response?', 101),
    ('routine_stability', 'SAFEPARENT_Q102', 'A predictable after-school routine mainly helps children by:', 102),
    ('communication_style', 'SAFEPARENT_Q103', 'When you need your child to switch off a game, which approach best supports cooperation?', 103),
    ('positive_discipline', 'SAFEPARENT_Q104', 'Your child lies about finishing homework. What is the most constructive response?', 104),
    ('autonomy_support', 'SAFEPARENT_Q105', 'Your child wants to plan their weekend activities. What supports autonomy while keeping boundaries?', 105),
    ('stress_management_for_parent', 'SAFEPARENT_Q106', 'You feel close to losing your temper during a conflict. What is the healthiest next step?', 106),
    ('conflict_resolution', 'SAFEPARENT_Q107', 'Two siblings accuse each other of starting a fight. What is the most constructive approach?', 107),
    ('expectations_realism', 'SAFEPARENT_Q108', 'Which expectation is realistic for a 5-year-old?', 108),
    ('safety_awareness', 'SAFEPARENT_Q109', 'Your child wants to explore a crowded public space. What is the safest parenting response?', 109),
    ('attachment_security', 'SAFEPARENT_Q110', 'A child''s sense of secure attachment is most supported when parents:', 110),
    ('feedback_quality', 'SAFEPARENT_Q111', 'Your child struggles with a new skill. Which feedback best supports learning?', 111),
    ('collaboration_with_child', 'SAFEPARENT_Q112', 'You''re setting a new homework routine. What shows collaborative problem-solving?', 112),
    ('screen_time_management', 'SAFEPARENT_Q113', 'Which approach best reflects balanced screen time?', 113),
    ('parent_child_relationship', 'SAFEPARENT_Q114', 'Which behaviour most strengthens the parent-child relationship?', 114),
    ('behaviour_guidance', 'SAFEPARENT_Q115', 'Your child repeatedly breaks a rule about indoor play. What is the most constructive step?', 115)
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
      ('SAFEPARENT_Q101', 'A', 'Tell them they''re overreacting', 0::numeric, 1),
      ('SAFEPARENT_Q101', 'B', 'Ask what happened and validate their feelings', 1::numeric, 2),
      ('SAFEPARENT_Q101', 'C', 'Immediately call the teacher to complain', 0::numeric, 3),
      ('SAFEPARENT_Q101', 'D', 'Change the subject to something fun', 0::numeric, 4),
      ('SAFEPARENT_Q102', 'A', 'Making afternoons more chaotic', 0::numeric, 1),
      ('SAFEPARENT_Q102', 'B', 'Reducing decision fatigue and supporting regulation', 1::numeric, 2),
      ('SAFEPARENT_Q102', 'C', 'Removing all flexibility from their day', 0::numeric, 3),
      ('SAFEPARENT_Q102', 'D', 'Increasing conflict with parents', 0::numeric, 4),
      ('SAFEPARENT_Q103', 'A', 'Shout from another room', 0::numeric, 1),
      ('SAFEPARENT_Q103', 'B', 'Give a clear warning and a time frame for stopping', 1::numeric, 2),
      ('SAFEPARENT_Q103', 'C', 'Turn the device off without saying anything', 0::numeric, 3),
      ('SAFEPARENT_Q103', 'D', 'Use sarcasm about their screen habits', 0::numeric, 4),
      ('SAFEPARENT_Q104', 'A', 'Call them a liar and shame them', 0::numeric, 1),
      ('SAFEPARENT_Q104', 'B', 'Ignore it to avoid conflict', 0::numeric, 2),
      ('SAFEPARENT_Q104', 'C', 'Calmly address the lie, restate expectations, and support completion', 1::numeric, 3),
      ('SAFEPARENT_Q104', 'D', 'Ban all social activities for a month', 0::numeric, 4),
      ('SAFEPARENT_Q105', 'A', 'Let them plan everything with no limits', 0::numeric, 1),
      ('SAFEPARENT_Q105', 'B', 'Refuse and plan the whole weekend yourself', 0::numeric, 2),
      ('SAFEPARENT_Q105', 'C', 'Invite them to suggest ideas within family constraints', 1::numeric, 3),
      ('SAFEPARENT_Q105', 'D', 'Criticise their ideas as unrealistic', 0::numeric, 4),
      ('SAFEPARENT_Q106', 'A', 'Raise your voice so they know you''re serious', 0::numeric, 1),
      ('SAFEPARENT_Q106', 'B', 'Walk away briefly to calm down, then return to talk', 1::numeric, 2),
      ('SAFEPARENT_Q106', 'C', 'Say nothing and hold the anger in', 0::numeric, 3),
      ('SAFEPARENT_Q106', 'D', 'Blame the child for your stress', 0::numeric, 4),
      ('SAFEPARENT_Q107', 'A', 'Pick the child you usually trust more', 0::numeric, 1),
      ('SAFEPARENT_Q107', 'B', 'Punish both without discussion', 0::numeric, 2),
      ('SAFEPARENT_Q107', 'C', 'Focus on solutions, such as turn-taking, rather than blame', 1::numeric, 3),
      ('SAFEPARENT_Q107', 'D', 'Ignore the conflict entirely', 0::numeric, 4),
      ('SAFEPARENT_Q108', 'A', 'To never spill or make messes', 0::numeric, 1),
      ('SAFEPARENT_Q108', 'B', 'To follow simple instructions with reminders', 1::numeric, 2),
      ('SAFEPARENT_Q108', 'C', 'To manage complex schedules independently', 0::numeric, 3),
      ('SAFEPARENT_Q108', 'D', 'To always stay calm when frustrated', 0::numeric, 4),
      ('SAFEPARENT_Q109', 'A', 'Let them wander freely', 0::numeric, 1),
      ('SAFEPARENT_Q109', 'B', 'Explain safety rules and stay close or hold hands', 1::numeric, 2),
      ('SAFEPARENT_Q109', 'C', 'Refuse to go anywhere crowded ever', 0::numeric, 3),
      ('SAFEPARENT_Q109', 'D', 'Assume they know how to stay safe', 0::numeric, 4),
      ('SAFEPARENT_Q110', 'A', 'Respond consistently and are emotionally available', 1::numeric, 1),
      ('SAFEPARENT_Q110', 'B', 'Only show warmth when the child behaves perfectly', 0::numeric, 2),
      ('SAFEPARENT_Q110', 'C', 'Avoid emotional conversations', 0::numeric, 3),
      ('SAFEPARENT_Q110', 'D', 'Use silent treatment as discipline', 0::numeric, 4),
      ('SAFEPARENT_Q111', 'A', '"You''re just not good at this."', 0::numeric, 1),
      ('SAFEPARENT_Q111', 'B', '"You always fail at things like this."', 0::numeric, 2),
      ('SAFEPARENT_Q111', 'C', '"You''re trying hard - let''s break it into smaller steps."', 1::numeric, 3),
      ('SAFEPARENT_Q111', 'D', '"You should be as good as other kids."', 0::numeric, 4),
      ('SAFEPARENT_Q112', 'A', 'Announce the routine with no discussion', 0::numeric, 1),
      ('SAFEPARENT_Q112', 'B', 'Ask your child what times work best within clear limits', 1::numeric, 2),
      ('SAFEPARENT_Q112', 'C', 'Let your child decide everything with no structure', 0::numeric, 3),
      ('SAFEPARENT_Q112', 'D', 'Change the routine daily without explanation', 0::numeric, 4),
      ('SAFEPARENT_Q113', 'A', 'Unlimited access as long as they''re quiet', 0::numeric, 1),
      ('SAFEPARENT_Q113', 'B', 'No screens allowed under any circumstances', 0::numeric, 2),
      ('SAFEPARENT_Q113', 'C', 'Agreed limits, with breaks for movement and connection', 1::numeric, 3),
      ('SAFEPARENT_Q113', 'D', 'Using screens only as punishment or reward', 0::numeric, 4),
      ('SAFEPARENT_Q114', 'A', 'Regular one-on-one time and genuine listening', 1::numeric, 1),
      ('SAFEPARENT_Q114', 'B', 'Frequent criticism about small mistakes', 0::numeric, 2),
      ('SAFEPARENT_Q114', 'C', 'Avoiding conversations about feelings', 0::numeric, 3),
      ('SAFEPARENT_Q114', 'D', 'Controlling every decision without explanation', 0::numeric, 4),
      ('SAFEPARENT_Q115', 'A', 'Explain the rule again, link it to safety, and follow through on agreed consequences', 1::numeric, 1),
      ('SAFEPARENT_Q115', 'B', 'Increase punishment each time without explanation', 0::numeric, 2),
      ('SAFEPARENT_Q115', 'C', 'Drop the rule entirely', 0::numeric, 3),
      ('SAFEPARENT_Q115', 'D', 'React with anger and shouting', 0::numeric, 4)
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
