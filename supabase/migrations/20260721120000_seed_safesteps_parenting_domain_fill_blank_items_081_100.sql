-- Seed SafeSteps domain-structured weighted fill-in-the-blank parenting quiz items Q081-Q100.

with instrument as (select id from public.assessment_instruments where slug = 'safesteps-parenting-domain-fill-blank-v1')
insert into public.assessment_domains (instrument_id, name, description, weight, display_order)
select instrument.id, domain.name, domain.description, 1::numeric, domain.display_order
from instrument
cross join (
  values
    ('responsibility_independence', 'Weighted fill-in-the-blank items for responsibility, independence, planning, follow-through, and child-led problem solving.', 4)
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
    ('responsibility_independence', 'SAFEPARENT_DOMAIN_FILL_Q081', 'I teach responsibility by having my child ______ their own progress each week.', 3::numeric, 81),
    ('responsibility_independence', 'SAFEPARENT_DOMAIN_FILL_Q082', 'I encourage independence by letting my child ______ their own learning goals.', 3::numeric, 82),
    ('responsibility_independence', 'SAFEPARENT_DOMAIN_FILL_Q083', 'I help my child learn responsibility by teaching them to ______ their daily tasks.', 2::numeric, 83),
    ('responsibility_independence', 'SAFEPARENT_DOMAIN_FILL_Q084', 'I support independence by encouraging my child to ______ new challenges.', 3::numeric, 84),
    ('responsibility_independence', 'SAFEPARENT_DOMAIN_FILL_Q085', 'I teach responsibility by having my child ______ their own materials before activities.', 2::numeric, 85),
    ('responsibility_independence', 'SAFEPARENT_DOMAIN_FILL_Q086', 'I encourage independence by letting my child ______ their own solutions to problems.', 3::numeric, 86),
    ('responsibility_independence', 'SAFEPARENT_DOMAIN_FILL_Q087', 'I help my child learn responsibility by teaching them to ______ their own belongings daily.', 2::numeric, 87),
    ('responsibility_independence', 'SAFEPARENT_DOMAIN_FILL_Q088', 'I support independence by encouraging my child to ______ their own routines.', 3::numeric, 88),
    ('responsibility_independence', 'SAFEPARENT_DOMAIN_FILL_Q089', 'I teach responsibility by having my child ______ their own commitments.', 3::numeric, 89),
    ('responsibility_independence', 'SAFEPARENT_DOMAIN_FILL_Q090', 'I encourage independence by letting my child ______ their own ideas.', 3::numeric, 90),
    ('responsibility_independence', 'SAFEPARENT_DOMAIN_FILL_Q091', 'I help my child learn responsibility by teaching them to ______ their own mistakes.', 3::numeric, 91),
    ('responsibility_independence', 'SAFEPARENT_DOMAIN_FILL_Q092', 'I support independence by encouraging my child to ______ their own plans.', 2::numeric, 92),
    ('responsibility_independence', 'SAFEPARENT_DOMAIN_FILL_Q093', 'I teach responsibility by having my child ______ their own priorities.', 2::numeric, 93),
    ('responsibility_independence', 'SAFEPARENT_DOMAIN_FILL_Q094', 'I encourage independence by letting my child ______ new experiences.', 3::numeric, 94),
    ('responsibility_independence', 'SAFEPARENT_DOMAIN_FILL_Q095', 'I help my child learn responsibility by teaching them to ______ their own routines.', 3::numeric, 95),
    ('responsibility_independence', 'SAFEPARENT_DOMAIN_FILL_Q096', 'I support independence by encouraging my child to ______ their own solutions.', 2::numeric, 96),
    ('responsibility_independence', 'SAFEPARENT_DOMAIN_FILL_Q097', 'I teach responsibility by having my child ______ their own progress.', 2::numeric, 97),
    ('responsibility_independence', 'SAFEPARENT_DOMAIN_FILL_Q098', 'I encourage independence by letting my child ______ their own tasks.', 3::numeric, 98),
    ('responsibility_independence', 'SAFEPARENT_DOMAIN_FILL_Q099', 'I teach responsibility by having my child ______ their own goals.', 3::numeric, 99),
    ('responsibility_independence', 'SAFEPARENT_DOMAIN_FILL_Q100', 'I encourage independence by letting my child ______ their own decisions.', 3::numeric, 100)
) as item(domain_name, item_key, prompt, weight, display_order) on item.domain_name = domain_lookup.name
on conflict (domain_id, item_key) do update
set prompt = excluded.prompt, item_type = excluded.item_type, weight = excluded.weight, max_value = excluded.max_value, display_order = excluded.display_order, is_critical = excluded.is_critical;

with instrument as (select id from public.assessment_instruments where slug = 'safesteps-parenting-domain-fill-blank-v1'),
items as (select ai.id, ai.item_key from public.assessment_items ai join public.assessment_domains ad on ad.id = ai.domain_id join instrument i on i.id = ad.instrument_id),
options as (select * from (
    values
      ('SAFEPARENT_DOMAIN_FILL_Q081', 'A', 'review', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q081', 'B', 'ignore', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q081', 'C', 'avoid', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q081', 'D', 'delay', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q082', 'A', 'set', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q082', 'B', 'avoid', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q082', 'C', 'fear', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q082', 'D', 'ignore', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q083', 'A', 'track', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q083', 'B', 'ignore', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q083', 'C', 'avoid', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q083', 'D', 'delay', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q084', 'A', 'attempt', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q084', 'B', 'avoid', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q084', 'C', 'fear', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q084', 'D', 'ignore', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q085', 'A', 'prepare', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q085', 'B', 'ignore', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q085', 'C', 'lose', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q085', 'D', 'avoid', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q086', 'A', 'try', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q086', 'B', 'avoid', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q086', 'C', 'fear', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q086', 'D', 'copy others', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q087', 'A', 'organize', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q087', 'B', 'ignore', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q087', 'C', 'lose', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q087', 'D', 'avoid', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q088', 'A', 'build', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q088', 'B', 'avoid', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q088', 'C', 'fear', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q088', 'D', 'ignore', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q089', 'A', 'follow through', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q089', 'B', 'avoid', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q089', 'C', 'ignore', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q089', 'D', 'delay', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q090', 'A', 'develop', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q090', 'B', 'avoid', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q090', 'C', 'fear', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q090', 'D', 'ignore', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q091', 'A', 'reflect on', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q091', 'B', 'ignore', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q091', 'C', 'deny', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q091', 'D', 'blame others', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q092', 'A', 'create', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q092', 'B', 'avoid', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q092', 'C', 'fear', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q092', 'D', 'ignore', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q093', 'A', 'set', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q093', 'B', 'avoid', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q093', 'C', 'ignore', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q093', 'D', 'delay', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q094', 'A', 'try', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q094', 'B', 'avoid', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q094', 'C', 'fear', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q094', 'D', 'ignore', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q095', 'A', 'follow', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q095', 'B', 'avoid', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q095', 'C', 'ignore', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q095', 'D', 'delay', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q096', 'A', 'test', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q096', 'B', 'avoid', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q096', 'C', 'fear', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q096', 'D', 'ignore', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q097', 'A', 'review', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q097', 'B', 'ignore', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q097', 'C', 'avoid', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q097', 'D', 'delay', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q098', 'A', 'plan', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q098', 'B', 'avoid', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q098', 'C', 'fear', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q098', 'D', 'ignore', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q099', 'A', 'work toward', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q099', 'B', 'avoid', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q099', 'C', 'ignore', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q099', 'D', 'delay', 0::numeric, 4),
      ('SAFEPARENT_DOMAIN_FILL_Q100', 'A', 'evaluate', 1::numeric, 1),
      ('SAFEPARENT_DOMAIN_FILL_Q100', 'B', 'avoid', 0::numeric, 2),
      ('SAFEPARENT_DOMAIN_FILL_Q100', 'C', 'fear', 0::numeric, 3),
      ('SAFEPARENT_DOMAIN_FILL_Q100', 'D', 'ignore', 0::numeric, 4)
  ) as option(item_key, value, label, score, display_order))
insert into public.assessment_item_response_options (item_id, label, value, score, display_order)
select items.id, options.label, options.value, options.score, options.display_order
from items
join options on options.item_key = items.item_key
on conflict (item_id, value) do update
set label = excluded.label, score = excluded.score, display_order = excluded.display_order;
