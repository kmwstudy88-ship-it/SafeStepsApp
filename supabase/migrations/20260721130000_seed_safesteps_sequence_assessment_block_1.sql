-- Seed SafeSteps sequence assessment block 1 items.

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
values ('safesteps-sequence-assessment-v1', 'SafeSteps Sequence Assessment', '1.0', 'Sequence-ordering assessment for daily routines, safety procedures, emotional regulation, problem solving, task completion, and hygiene.', 'sequence_assessment', 'sequence_position_match', false, false, true)
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
    ('problem_solving_sequencing', 'Sequencing planning, problem solving, error correction, and task management steps.', 4),
    ('task_completion_sequencing', 'Sequencing chores, homework, meals, and completion follow-through.', 5),
    ('health_hygiene_sequencing', 'Sequencing health, hygiene, medicine safety, and appointment preparation steps.', 6)
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
    ('daily_routine_sequencing', 'DRS_004', 'Order the steps for preparing breakfast: Take out ingredients, Cook food, Serve meal.', 3::numeric, 4),
    ('daily_routine_sequencing', 'DRS_005', 'Sequence the steps for packing a school bag: Gather materials, Place items in bag, Zip bag closed.', 3::numeric, 5),
    ('daily_routine_sequencing', 'DRS_006', 'Order the steps for starting homework: Clear workspace, Open materials, Begin task.', 3::numeric, 6),
    ('daily_routine_sequencing', 'DRS_007', 'Sequence the steps for ending screen time: Pause activity, Turn off device, Put device away.', 3::numeric, 7),
    ('daily_routine_sequencing', 'DRS_008', 'Order the steps for preparing for visitors: Tidy room, Wash hands, Greet guest.', 3::numeric, 8),
    ('safety_procedure_sequencing', 'SPS_004', 'Sequence the steps for responding to a stranger at the door: Stay inside, Call trusted adult, Do not open door.', 3::numeric, 104),
    ('safety_procedure_sequencing', 'SPS_005', 'Order the steps for safe bike riding: Put on helmet, Check brakes, Start riding.', 3::numeric, 105),
    ('safety_procedure_sequencing', 'SPS_006', 'Sequence the steps for responding to a minor injury: Stop activity, Assess injury, Tell adult.', 3::numeric, 106),
    ('safety_procedure_sequencing', 'SPS_007', 'Order the steps for safe kitchen use: Wash hands, Prepare tools, Begin cooking.', 3::numeric, 107),
    ('safety_procedure_sequencing', 'SPS_008', 'Sequence the steps for safe playground use: Check surroundings, Choose activity, Play safely.', 3::numeric, 108),
    ('emotional_regulation_sequencing', 'ERS_004', 'Order the steps for expressing feelings: Identify emotion, Choose words, Share with adult.', 3::numeric, 204),
    ('emotional_regulation_sequencing', 'ERS_005', 'Sequence the steps for calming after conflict: Step back, Breathe slowly, Rejoin calmly.', 3::numeric, 205),
    ('emotional_regulation_sequencing', 'ERS_006', 'Order the steps for managing disappointment: Acknowledge feeling, Take break, Try again later.', 3::numeric, 206),
    ('emotional_regulation_sequencing', 'ERS_007', 'Sequence the steps for asking for help: Recognize difficulty, Approach adult, Explain need.', 3::numeric, 207),
    ('emotional_regulation_sequencing', 'ERS_008', 'Order the steps for calming before bedtime: Slow activity, Dim lights, Relax quietly.', 3::numeric, 208),
    ('problem_solving_sequencing', 'PSS_004', 'Sequence the steps for solving a math problem: Read question, Identify numbers, Solve.', 3::numeric, 304),
    ('problem_solving_sequencing', 'PSS_005', 'Order the steps for fixing a broken toy: Inspect damage, Gather tools, Repair.', 3::numeric, 305),
    ('problem_solving_sequencing', 'PSS_006', 'Sequence the steps for planning a project: Brainstorm ideas, Choose plan, Begin work.', 3::numeric, 306),
    ('problem_solving_sequencing', 'PSS_007', 'Order the steps for resolving confusion: Pause, Ask question, Clarify.', 3::numeric, 307),
    ('problem_solving_sequencing', 'PSS_008', 'Sequence the steps for organizing materials: Sort items, Group similar items, Store neatly.', 3::numeric, 308),
    ('task_completion_sequencing', 'TCS_001', 'Order the steps for cleaning a room: Pick up items, Put items away, Check floor.', 3::numeric, 401),
    ('task_completion_sequencing', 'TCS_002', 'Sequence the steps for completing a worksheet: Read instructions, Fill answers, Review work.', 3::numeric, 402),
    ('task_completion_sequencing', 'TCS_003', 'Order the steps for preparing lunch: Gather ingredients, Assemble food, Pack meal.', 3::numeric, 403),
    ('task_completion_sequencing', 'TCS_004', 'Sequence the steps for finishing chores: Complete task, Put tools away, Report finished.', 3::numeric, 404),
    ('task_completion_sequencing', 'TCS_005', 'Order the steps for preparing for bedtime: Change clothes, Brush teeth, Get into bed.', 3::numeric, 405),
    ('health_hygiene_sequencing', 'HHS_001', 'Sequence the steps for brushing hair: Pick up brush, Brush from top to bottom, Put brush away.', 3::numeric, 501),
    ('health_hygiene_sequencing', 'HHS_002', 'Order the steps for taking medicine safely: Ask adult, Measure dose, Take medicine.', 3::numeric, 502),
    ('health_hygiene_sequencing', 'HHS_003', 'Sequence the steps for washing face: Wet face, Apply soap, Rinse.', 3::numeric, 503),
    ('health_hygiene_sequencing', 'HHS_004', 'Order the steps for trimming nails: Wash hands, Trim nails, Clean up trimmings.', 3::numeric, 504),
    ('health_hygiene_sequencing', 'HHS_005', 'Sequence the steps for preparing for a doctor visit: Gather documents, Dress appropriately, Arrive on time.', 3::numeric, 505)
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
    ('DRS_004', 1, 'Take out ingredients'),
    ('DRS_004', 2, 'Cook food'),
    ('DRS_004', 3, 'Serve meal'),
    ('DRS_005', 1, 'Gather materials'),
    ('DRS_005', 2, 'Place items in bag'),
    ('DRS_005', 3, 'Zip bag closed'),
    ('DRS_006', 1, 'Clear workspace'),
    ('DRS_006', 2, 'Open materials'),
    ('DRS_006', 3, 'Begin task'),
    ('DRS_007', 1, 'Pause activity'),
    ('DRS_007', 2, 'Turn off device'),
    ('DRS_007', 3, 'Put device away'),
    ('DRS_008', 1, 'Tidy room'),
    ('DRS_008', 2, 'Wash hands'),
    ('DRS_008', 3, 'Greet guest'),
    ('SPS_004', 1, 'Stay inside'),
    ('SPS_004', 2, 'Do not open door'),
    ('SPS_004', 3, 'Call trusted adult'),
    ('SPS_005', 1, 'Put on helmet'),
    ('SPS_005', 2, 'Check brakes'),
    ('SPS_005', 3, 'Start riding'),
    ('SPS_006', 1, 'Stop activity'),
    ('SPS_006', 2, 'Assess injury'),
    ('SPS_006', 3, 'Tell adult'),
    ('SPS_007', 1, 'Wash hands'),
    ('SPS_007', 2, 'Prepare tools'),
    ('SPS_007', 3, 'Begin cooking'),
    ('SPS_008', 1, 'Check surroundings'),
    ('SPS_008', 2, 'Choose activity'),
    ('SPS_008', 3, 'Play safely'),
    ('ERS_004', 1, 'Identify emotion'),
    ('ERS_004', 2, 'Choose words'),
    ('ERS_004', 3, 'Share with adult'),
    ('ERS_005', 1, 'Step back'),
    ('ERS_005', 2, 'Breathe slowly'),
    ('ERS_005', 3, 'Rejoin calmly'),
    ('ERS_006', 1, 'Acknowledge feeling'),
    ('ERS_006', 2, 'Take break'),
    ('ERS_006', 3, 'Try again later'),
    ('ERS_007', 1, 'Recognize difficulty'),
    ('ERS_007', 2, 'Approach adult'),
    ('ERS_007', 3, 'Explain need'),
    ('ERS_008', 1, 'Slow activity'),
    ('ERS_008', 2, 'Dim lights'),
    ('ERS_008', 3, 'Relax quietly'),
    ('PSS_004', 1, 'Read question'),
    ('PSS_004', 2, 'Identify numbers'),
    ('PSS_004', 3, 'Solve'),
    ('PSS_005', 1, 'Inspect damage'),
    ('PSS_005', 2, 'Gather tools'),
    ('PSS_005', 3, 'Repair'),
    ('PSS_006', 1, 'Brainstorm ideas'),
    ('PSS_006', 2, 'Choose plan'),
    ('PSS_006', 3, 'Begin work'),
    ('PSS_007', 1, 'Pause'),
    ('PSS_007', 2, 'Ask question'),
    ('PSS_007', 3, 'Clarify'),
    ('PSS_008', 1, 'Sort items'),
    ('PSS_008', 2, 'Group similar items'),
    ('PSS_008', 3, 'Store neatly'),
    ('TCS_001', 1, 'Pick up items'),
    ('TCS_001', 2, 'Put items away'),
    ('TCS_001', 3, 'Check floor'),
    ('TCS_002', 1, 'Read instructions'),
    ('TCS_002', 2, 'Fill answers'),
    ('TCS_002', 3, 'Review work'),
    ('TCS_003', 1, 'Gather ingredients'),
    ('TCS_003', 2, 'Assemble food'),
    ('TCS_003', 3, 'Pack meal'),
    ('TCS_004', 1, 'Complete task'),
    ('TCS_004', 2, 'Put tools away'),
    ('TCS_004', 3, 'Report finished'),
    ('TCS_005', 1, 'Change clothes'),
    ('TCS_005', 2, 'Brush teeth'),
    ('TCS_005', 3, 'Get into bed'),
    ('HHS_001', 1, 'Pick up brush'),
    ('HHS_001', 2, 'Brush from top to bottom'),
    ('HHS_001', 3, 'Put brush away'),
    ('HHS_002', 1, 'Ask adult'),
    ('HHS_002', 2, 'Measure dose'),
    ('HHS_002', 3, 'Take medicine'),
    ('HHS_003', 1, 'Wet face'),
    ('HHS_003', 2, 'Apply soap'),
    ('HHS_003', 3, 'Rinse'),
    ('HHS_004', 1, 'Wash hands'),
    ('HHS_004', 2, 'Trim nails'),
    ('HHS_004', 3, 'Clean up trimmings'),
    ('HHS_005', 1, 'Gather documents'),
    ('HHS_005', 2, 'Dress appropriately'),
    ('HHS_005', 3, 'Arrive on time')
  ) as step(item_key, position, label)
),
deleted_steps as (
  delete from public.assessment_sequence_steps
  where item_id in (select items.id from items join sequence_steps on sequence_steps.item_key = items.item_key)
)
insert into public.assessment_sequence_steps (item_id, position, label)
select items.id, sequence_steps.position, sequence_steps.label
from items
join sequence_steps on sequence_steps.item_key = items.item_key
on conflict (item_id, position) do update
set label = excluded.label;
