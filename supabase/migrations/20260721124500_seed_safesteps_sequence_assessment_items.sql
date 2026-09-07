-- Seed SafeSteps sequence assessment items.

create table if not exists public.assessment_sequence_steps (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.assessment_items(id) on delete cascade,
  position integer not null,
  label text not null,
  unique(item_id, position)
);

alter table public.assessment_sequence_steps enable row level security;

drop policy if exists assessment_sequence_steps_select on public.assessment_sequence_steps;
create policy assessment_sequence_steps_select on public.assessment_sequence_steps for select to authenticated using (true);

drop policy if exists assessment_sequence_steps_manage on public.assessment_sequence_steps;
create policy assessment_sequence_steps_manage on public.assessment_sequence_steps for all to authenticated using (public.can_manage_assessments()) with check (public.can_manage_assessments());

insert into public.assessment_instruments (slug, name, version, description, instrument_type, scoring_method, restricted_tool, requires_licensed_assessor, is_active)
values ('safesteps-sequence-assessment-v1', 'SafeSteps Sequence Assessment', '1.0', 'Sequence-ordering assessment for daily routines, safety procedures, emotional regulation, and problem solving.', 'sequence_assessment', 'sequence_position_match', false, false, true)
on conflict (slug) do update
set name = excluded.name, version = excluded.version, description = excluded.description, instrument_type = excluded.instrument_type, scoring_method = excluded.scoring_method, restricted_tool = excluded.restricted_tool, requires_licensed_assessor = excluded.requires_licensed_assessor, is_active = excluded.is_active;

with instrument as (select id from public.assessment_instruments where slug = 'safesteps-sequence-assessment-v1')
insert into public.assessment_domains (instrument_id, name, description, weight, display_order)
select instrument.id, domain.name, domain.description, 1::numeric, domain.display_order
from instrument
cross join (
  values
    ('daily_routine_sequencing', 'Sequencing daily living routines and independence tasks.', 1),
    ('safety_procedure_sequencing', 'Sequencing safety, hygiene, and emergency procedure steps.', 2),
    ('emotional_regulation_sequencing', 'Sequencing regulation, coping, communication, and conflict repair steps.', 3),
    ('problem_solving_sequencing', 'Sequencing planning, problem solving, error correction, and task management steps.', 4)
) as domain(name, description, display_order)
on conflict (instrument_id, name) do update
set description = excluded.description, weight = excluded.weight, display_order = excluded.display_order;

with instrument as (select id from public.assessment_instruments where slug = 'safesteps-sequence-assessment-v1'),
domain_lookup as (select d.id, d.name from public.assessment_domains d join instrument i on i.id = d.instrument_id)
insert into public.assessment_items (domain_id, item_key, prompt, item_type, weight, max_value, display_order, is_critical)
select domain_lookup.id, item.item_key, item.prompt, 'numeric', 1::numeric, item.max_value, item.display_order, false
from domain_lookup
join (
  values
    ('daily_routine_sequencing', 'DRS_001', 'Place these morning tasks in the correct order: Eat breakfast, Wake up, Brush teeth.', 3::numeric, 1),
    ('daily_routine_sequencing', 'DRS_002', 'Order the steps for getting ready to leave the house: Put on shoes, Grab bag, Lock door.', 3::numeric, 2),
    ('daily_routine_sequencing', 'DRS_003', 'Sequence the bedtime routine: Turn off lights, Brush teeth, Change into pajamas.', 3::numeric, 3),
    ('safety_procedure_sequencing', 'SPS_001', 'Order the steps for crossing the street safely: Look both ways, Stop at curb, Walk across.', 3::numeric, 101),
    ('safety_procedure_sequencing', 'SPS_002', 'Sequence the steps for responding to a fire alarm: Leave building, Stop activity, Follow exit signs.', 3::numeric, 102),
    ('safety_procedure_sequencing', 'SPS_003', 'Order the steps for safe handwashing: Rinse hands, Apply soap, Scrub for 20 seconds.', 3::numeric, 103),
    ('emotional_regulation_sequencing', 'ERS_001', 'Sequence the steps for calming down: Take deep breaths, Notice feelings, Ask for help.', 3::numeric, 201),
    ('emotional_regulation_sequencing', 'ERS_002', 'Order the steps for resolving conflict: Listen, Explain feelings, Agree on solution.', 3::numeric, 202),
    ('emotional_regulation_sequencing', 'ERS_003', 'Sequence the steps for managing frustration: Pause, Identify problem, Try a strategy.', 3::numeric, 203),
    ('problem_solving_sequencing', 'PSS_001', 'Order the steps for solving a puzzle: Sort pieces, Build edges, Fill middle.', 3::numeric, 301),
    ('problem_solving_sequencing', 'PSS_002', 'Sequence the steps for fixing a mistake: Notice error, Remove incorrect part, Try again.', 3::numeric, 302),
    ('problem_solving_sequencing', 'PSS_003', 'Order the steps for planning a task: Decide goal, Gather materials, Start task.', 3::numeric, 303)
) as item(domain_name, item_key, prompt, max_value, display_order) on item.domain_name = domain_lookup.name
on conflict (domain_id, item_key) do update
set prompt = excluded.prompt, item_type = excluded.item_type, weight = excluded.weight, max_value = excluded.max_value, display_order = excluded.display_order, is_critical = excluded.is_critical;

with instrument as (select id from public.assessment_instruments where slug = 'safesteps-sequence-assessment-v1'),
items as (
  select ai.id, ai.item_key
  from public.assessment_items ai
  join public.assessment_domains ad on ad.id = ai.domain_id
  join instrument i on i.id = ad.instrument_id
),
sequence_steps as (
  select *
  from (
    values
    ('DRS_001', 1, 'Wake up'),
    ('DRS_001', 2, 'Eat breakfast'),
    ('DRS_001', 3, 'Brush teeth'),
    ('DRS_002', 1, 'Grab bag'),
    ('DRS_002', 2, 'Put on shoes'),
    ('DRS_002', 3, 'Lock door'),
    ('DRS_003', 1, 'Change into pajamas'),
    ('DRS_003', 2, 'Brush teeth'),
    ('DRS_003', 3, 'Turn off lights'),
    ('SPS_001', 1, 'Stop at curb'),
    ('SPS_001', 2, 'Look both ways'),
    ('SPS_001', 3, 'Walk across'),
    ('SPS_002', 1, 'Stop activity'),
    ('SPS_002', 2, 'Follow exit signs'),
    ('SPS_002', 3, 'Leave building'),
    ('SPS_003', 1, 'Apply soap'),
    ('SPS_003', 2, 'Scrub for 20 seconds'),
    ('SPS_003', 3, 'Rinse hands'),
    ('ERS_001', 1, 'Notice feelings'),
    ('ERS_001', 2, 'Take deep breaths'),
    ('ERS_001', 3, 'Ask for help'),
    ('ERS_002', 1, 'Listen'),
    ('ERS_002', 2, 'Explain feelings'),
    ('ERS_002', 3, 'Agree on solution'),
    ('ERS_003', 1, 'Pause'),
    ('ERS_003', 2, 'Identify problem'),
    ('ERS_003', 3, 'Try a strategy'),
    ('PSS_001', 1, 'Sort pieces'),
    ('PSS_001', 2, 'Build edges'),
    ('PSS_001', 3, 'Fill middle'),
    ('PSS_002', 1, 'Notice error'),
    ('PSS_002', 2, 'Remove incorrect part'),
    ('PSS_002', 3, 'Try again'),
    ('PSS_003', 1, 'Decide goal'),
    ('PSS_003', 2, 'Gather materials'),
    ('PSS_003', 3, 'Start task')
  ) as step(item_key, position, label)
),
deleted_steps as (
  delete from public.assessment_sequence_steps
  where item_id in (select id from items)
)
insert into public.assessment_sequence_steps (item_id, position, label)
select items.id, sequence_steps.position, sequence_steps.label
from items
join sequence_steps on sequence_steps.item_key = items.item_key
on conflict (item_id, position) do update
set label = excluded.label;
