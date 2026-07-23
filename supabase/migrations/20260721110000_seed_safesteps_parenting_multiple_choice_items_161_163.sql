-- Seed additional SafeSteps multiple-choice parenting assessment items Q161-Q163.

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
    ('emotional_attunement', 'SAFEPARENT_Q161', 'Your child says they feel nervous about a class presentation. What is the most supportive response?', 161),
    ('communication_style', 'SAFEPARENT_Q162', 'Your child misunderstands a household rule. What improves clarity?', 162),
    ('positive_discipline', 'SAFEPARENT_Q163', 'Your child refuses to stop jumping on furniture. What is the most constructive step?', 163)
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
      ('SAFEPARENT_Q161', 'A', 'Tell them everyone gets nervous and move on', 0::numeric, 1),
      ('SAFEPARENT_Q161', 'B', 'Validate their feelings and help them practice if they want', 1::numeric, 2),
      ('SAFEPARENT_Q161', 'C', 'Tell them to stop worrying', 0::numeric, 3),
      ('SAFEPARENT_Q161', 'D', 'Avoid talking about it to reduce stress', 0::numeric, 4),
      ('SAFEPARENT_Q162', 'A', 'Restate the rule simply and explain the reason behind it', 1::numeric, 1),
      ('SAFEPARENT_Q162', 'B', 'Use sarcasm to show your frustration', 0::numeric, 2),
      ('SAFEPARENT_Q162', 'C', 'Give a long lecture about rules', 0::numeric, 3),
      ('SAFEPARENT_Q162', 'D', 'Punish them without explanation', 0::numeric, 4),
      ('SAFEPARENT_Q163', 'A', 'Explain the safety concern and redirect to a safe activity', 1::numeric, 1),
      ('SAFEPARENT_Q163', 'B', 'Shout until they stop', 0::numeric, 2),
      ('SAFEPARENT_Q163', 'C', 'Ignore the behaviour', 0::numeric, 3),
      ('SAFEPARENT_Q163', 'D', 'Remove all furniture privileges permanently', 0::numeric, 4)
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
