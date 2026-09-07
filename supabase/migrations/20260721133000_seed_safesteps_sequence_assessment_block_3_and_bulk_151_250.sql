-- Seed complete SafeSteps sequence assessment items from block 3 and bulk 151-250 attachments.
-- Block 3 is truncated during HHS_009; bulk 151-250 is truncated during CMS_010. Partial items are intentionally excluded.

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
values ('safesteps-sequence-assessment-v1', 'SafeSteps Sequence Assessment', '1.0', 'Sequence-ordering assessment for daily routines, safety procedures, emotional regulation, problem solving, task completion, hygiene, interaction, boundaries, school readiness, communication, executive function, and risk recognition.', 'sequence_assessment', 'sequence_position_match', false, false, true)
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
    ('health_hygiene_sequencing', 'Sequencing health, hygiene, medicine safety, and appointment preparation steps.', 6),
    ('boundary_supervision_sequencing', 'Sequencing limits, supervision, screen-time follow-through, tool use, and risky-behaviour response.', 8),
    ('school_readiness_sequencing', 'Sequencing classroom routines, homework preparation, group work, recess transitions, and reading assignments.', 9),
    ('communication_sequencing', 'Sequencing questions, instructions, storytelling, clarification, and feedback.', 10)
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
    ('daily_routine_sequencing', 'DRS_009', 'Order the steps for preparing for a walk: Put on shoes, Grab water bottle, Leave house.', 3::numeric, 9),
    ('daily_routine_sequencing', 'DRS_010', 'Sequence the steps for starting chores: Choose chore, Gather supplies, Begin task.', 3::numeric, 10),
    ('daily_routine_sequencing', 'DRS_011', 'Order the steps for ending playtime: Clean toys, Put toys away, Wash hands.', 3::numeric, 11),
    ('daily_routine_sequencing', 'DRS_012', 'Sequence the steps for preparing for dinner: Set table, Sit down, Wait for food.', 3::numeric, 12),
    ('daily_routine_sequencing', 'DRS_013', 'Order the steps for getting ready for sports: Change clothes, Pack gear, Head to practice.', 3::numeric, 13),
    ('safety_procedure_sequencing', 'SPS_009', 'Sequence the steps for safe swimming: Enter slowly, Stay near adult, Follow pool rules.', 3::numeric, 109),
    ('safety_procedure_sequencing', 'SPS_010', 'Order the steps for safe pet interaction: Approach calmly, Let pet sniff, Pet gently.', 3::numeric, 110),
    ('safety_procedure_sequencing', 'SPS_011', 'Sequence the steps for safe cooking: Tie hair back, Wash hands, Begin cooking.', 3::numeric, 111),
    ('safety_procedure_sequencing', 'SPS_012', 'Order the steps for responding to loud noises: Pause activity, Look for adult, Follow instructions.', 3::numeric, 112),
    ('safety_procedure_sequencing', 'SPS_013', 'Sequence the steps for safe climbing: Check structure, Use both hands, Climb slowly.', 3::numeric, 113),
    ('emotional_regulation_sequencing', 'ERS_009', 'Order the steps for calming after excitement: Sit down, Take deep breaths, Speak calmly.', 3::numeric, 209),
    ('emotional_regulation_sequencing', 'ERS_010', 'Sequence the steps for managing anger: Pause, Identify trigger, Choose coping strategy.', 3::numeric, 210),
    ('emotional_regulation_sequencing', 'ERS_011', 'Order the steps for expressing gratitude: Notice kindness, Think of words, Say thank you.', 3::numeric, 211),
    ('emotional_regulation_sequencing', 'ERS_012', 'Sequence the steps for calming before school: Eat breakfast, Take deep breaths, Walk calmly.', 3::numeric, 212),
    ('emotional_regulation_sequencing', 'ERS_013', 'Order the steps for managing embarrassment: Pause, Take breath, Talk to trusted adult.', 3::numeric, 213),
    ('problem_solving_sequencing', 'PSS_009', 'Sequence the steps for fixing a messy backpack: Empty items, Sort items, Put items back neatly.', 3::numeric, 309),
    ('problem_solving_sequencing', 'PSS_010', 'Order the steps for solving a disagreement with a friend: Listen, Share feelings, Find solution.', 3::numeric, 310),
    ('problem_solving_sequencing', 'PSS_011', 'Sequence the steps for fixing a drawing mistake: Erase gently, Redraw, Check result.', 3::numeric, 311),
    ('problem_solving_sequencing', 'PSS_012', 'Order the steps for solving a maze: Start at entrance, Follow path, Reach exit.', 3::numeric, 312),
    ('problem_solving_sequencing', 'PSS_013', 'Sequence the steps for planning a craft: Choose idea, Gather materials, Begin creating.', 3::numeric, 313),
    ('task_completion_sequencing', 'TCS_006', 'Order the steps for finishing a puzzle: Place final pieces, Check picture, Put puzzle away.', 3::numeric, 406),
    ('task_completion_sequencing', 'TCS_007', 'Sequence the steps for cleaning a table: Clear items, Wipe surface, Dry surface.', 3::numeric, 407),
    ('task_completion_sequencing', 'TCS_008', 'Order the steps for finishing homework: Complete tasks, Review answers, Pack materials.', 3::numeric, 408),
    ('task_completion_sequencing', 'TCS_009', 'Sequence the steps for organizing toys: Sort toys, Place in bins, Close lids.', 3::numeric, 409),
    ('task_completion_sequencing', 'TCS_010', 'Order the steps for finishing a meal: Eat food, Clear plate, Wash hands.', 3::numeric, 410),
    ('health_hygiene_sequencing', 'HHS_006', 'Sequence the steps for brushing teeth at night: Apply toothpaste, Brush thoroughly, Rinse mouth.', 3::numeric, 506),
    ('health_hygiene_sequencing', 'HHS_007', 'Order the steps for washing hands after play: Turn on water, Apply soap, Scrub hands.', 3::numeric, 507),
    ('health_hygiene_sequencing', 'HHS_008', 'Sequence the steps for getting ready for a bath: Gather towel, Turn on water, Get in tub.', 3::numeric, 508),
    ('boundary_supervision_sequencing', 'BSS_006', 'Order the steps for supervising indoor play: Set rules, Check space, Monitor activity.', 3::numeric, 706),
    ('boundary_supervision_sequencing', 'BSS_007', 'Sequence the steps for enforcing bedtime rules: Give reminder, Guide child to room, Turn off lights.', 3::numeric, 707),
    ('boundary_supervision_sequencing', 'BSS_008', 'Order the steps for managing unsafe objects: Identify hazard, Remove object, Explain rule.', 3::numeric, 708),
    ('boundary_supervision_sequencing', 'BSS_009', 'Sequence the steps for supervising group play: Set expectations, Watch interactions, Intervene if needed.', 3::numeric, 709),
    ('boundary_supervision_sequencing', 'BSS_010', 'Order the steps for enforcing outdoor boundaries: Point out limits, Explain why, Check compliance.', 3::numeric, 710),
    ('school_readiness_sequencing', 'SRS_006', 'Sequence the steps for preparing for a test: Review notes, Practice problems, Rest well.', 3::numeric, 806),
    ('school_readiness_sequencing', 'SRS_007', 'Order the steps for starting a writing assignment: Brainstorm ideas, Write draft, Review writing.', 3::numeric, 807),
    ('school_readiness_sequencing', 'SRS_008', 'Sequence the steps for preparing for art class: Gather supplies, Put on apron, Begin project.', 3::numeric, 808),
    ('school_readiness_sequencing', 'SRS_009', 'Order the steps for joining group time: Sit quietly, Listen to teacher, Participate.', 3::numeric, 809),
    ('school_readiness_sequencing', 'SRS_010', 'Sequence the steps for preparing for dismissal: Pack materials, Line up, Exit calmly.', 3::numeric, 810),
    ('communication_sequencing', 'CMS_006', 'Order the steps for making a request: Approach adult, Use polite words, Wait for response.', 3::numeric, 906),
    ('communication_sequencing', 'CMS_007', 'Sequence the steps for explaining a problem: Describe issue, Share feelings, Ask for help.', 3::numeric, 907),
    ('communication_sequencing', 'CMS_008', 'Order the steps for giving a compliment: Notice something positive, Choose words, Say compliment.', 3::numeric, 908),
    ('communication_sequencing', 'CMS_009', 'Sequence the steps for responding to instructions: Listen carefully, Ask questions, Follow steps.', 3::numeric, 909)
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
    ('DRS_009', 1, 'Put on shoes'),
    ('DRS_009', 2, 'Grab water bottle'),
    ('DRS_009', 3, 'Leave house'),
    ('DRS_010', 1, 'Choose chore'),
    ('DRS_010', 2, 'Gather supplies'),
    ('DRS_010', 3, 'Begin task'),
    ('DRS_011', 1, 'Clean toys'),
    ('DRS_011', 2, 'Put toys away'),
    ('DRS_011', 3, 'Wash hands'),
    ('DRS_012', 1, 'Set table'),
    ('DRS_012', 2, 'Sit down'),
    ('DRS_012', 3, 'Wait for food'),
    ('DRS_013', 1, 'Change clothes'),
    ('DRS_013', 2, 'Pack gear'),
    ('DRS_013', 3, 'Head to practice'),
    ('SPS_009', 1, 'Enter slowly'),
    ('SPS_009', 2, 'Stay near adult'),
    ('SPS_009', 3, 'Follow pool rules'),
    ('SPS_010', 1, 'Approach calmly'),
    ('SPS_010', 2, 'Let pet sniff'),
    ('SPS_010', 3, 'Pet gently'),
    ('SPS_011', 1, 'Tie hair back'),
    ('SPS_011', 2, 'Wash hands'),
    ('SPS_011', 3, 'Begin cooking'),
    ('SPS_012', 1, 'Pause activity'),
    ('SPS_012', 2, 'Look for adult'),
    ('SPS_012', 3, 'Follow instructions'),
    ('SPS_013', 1, 'Check structure'),
    ('SPS_013', 2, 'Use both hands'),
    ('SPS_013', 3, 'Climb slowly'),
    ('ERS_009', 1, 'Sit down'),
    ('ERS_009', 2, 'Take deep breaths'),
    ('ERS_009', 3, 'Speak calmly'),
    ('ERS_010', 1, 'Pause'),
    ('ERS_010', 2, 'Identify trigger'),
    ('ERS_010', 3, 'Choose coping strategy'),
    ('ERS_011', 1, 'Notice kindness'),
    ('ERS_011', 2, 'Think of words'),
    ('ERS_011', 3, 'Say thank you'),
    ('ERS_012', 1, 'Eat breakfast'),
    ('ERS_012', 2, 'Take deep breaths'),
    ('ERS_012', 3, 'Walk calmly'),
    ('ERS_013', 1, 'Pause'),
    ('ERS_013', 2, 'Take breath'),
    ('ERS_013', 3, 'Talk to trusted adult'),
    ('PSS_009', 1, 'Empty items'),
    ('PSS_009', 2, 'Sort items'),
    ('PSS_009', 3, 'Put items back neatly'),
    ('PSS_010', 1, 'Listen'),
    ('PSS_010', 2, 'Share feelings'),
    ('PSS_010', 3, 'Find solution'),
    ('PSS_011', 1, 'Erase gently'),
    ('PSS_011', 2, 'Redraw'),
    ('PSS_011', 3, 'Check result'),
    ('PSS_012', 1, 'Start at entrance'),
    ('PSS_012', 2, 'Follow path'),
    ('PSS_012', 3, 'Reach exit'),
    ('PSS_013', 1, 'Choose idea'),
    ('PSS_013', 2, 'Gather materials'),
    ('PSS_013', 3, 'Begin creating'),
    ('TCS_006', 1, 'Place final pieces'),
    ('TCS_006', 2, 'Check picture'),
    ('TCS_006', 3, 'Put puzzle away'),
    ('TCS_007', 1, 'Clear items'),
    ('TCS_007', 2, 'Wipe surface'),
    ('TCS_007', 3, 'Dry surface'),
    ('TCS_008', 1, 'Complete tasks'),
    ('TCS_008', 2, 'Review answers'),
    ('TCS_008', 3, 'Pack materials'),
    ('TCS_009', 1, 'Sort toys'),
    ('TCS_009', 2, 'Place in bins'),
    ('TCS_009', 3, 'Close lids'),
    ('TCS_010', 1, 'Eat food'),
    ('TCS_010', 2, 'Clear plate'),
    ('TCS_010', 3, 'Wash hands'),
    ('HHS_006', 1, 'Apply toothpaste'),
    ('HHS_006', 2, 'Brush thoroughly'),
    ('HHS_006', 3, 'Rinse mouth'),
    ('HHS_007', 1, 'Turn on water'),
    ('HHS_007', 2, 'Apply soap'),
    ('HHS_007', 3, 'Scrub hands'),
    ('HHS_008', 1, 'Gather towel'),
    ('HHS_008', 2, 'Turn on water'),
    ('HHS_008', 3, 'Get in tub'),
    ('BSS_006', 1, 'Set rules'),
    ('BSS_006', 2, 'Check space'),
    ('BSS_006', 3, 'Monitor activity'),
    ('BSS_007', 1, 'Give reminder'),
    ('BSS_007', 2, 'Guide child to room'),
    ('BSS_007', 3, 'Turn off lights'),
    ('BSS_008', 1, 'Identify hazard'),
    ('BSS_008', 2, 'Remove object'),
    ('BSS_008', 3, 'Explain rule'),
    ('BSS_009', 1, 'Set expectations'),
    ('BSS_009', 2, 'Watch interactions'),
    ('BSS_009', 3, 'Intervene if needed'),
    ('BSS_010', 1, 'Point out limits'),
    ('BSS_010', 2, 'Explain why'),
    ('BSS_010', 3, 'Check compliance'),
    ('SRS_006', 1, 'Review notes'),
    ('SRS_006', 2, 'Practice problems'),
    ('SRS_006', 3, 'Rest well'),
    ('SRS_007', 1, 'Brainstorm ideas'),
    ('SRS_007', 2, 'Write draft'),
    ('SRS_007', 3, 'Review writing'),
    ('SRS_008', 1, 'Gather supplies'),
    ('SRS_008', 2, 'Put on apron'),
    ('SRS_008', 3, 'Begin project'),
    ('SRS_009', 1, 'Sit quietly'),
    ('SRS_009', 2, 'Listen to teacher'),
    ('SRS_009', 3, 'Participate'),
    ('SRS_010', 1, 'Pack materials'),
    ('SRS_010', 2, 'Line up'),
    ('SRS_010', 3, 'Exit calmly'),
    ('CMS_006', 1, 'Approach adult'),
    ('CMS_006', 2, 'Use polite words'),
    ('CMS_006', 3, 'Wait for response'),
    ('CMS_007', 1, 'Describe issue'),
    ('CMS_007', 2, 'Share feelings'),
    ('CMS_007', 3, 'Ask for help'),
    ('CMS_008', 1, 'Notice something positive'),
    ('CMS_008', 2, 'Choose words'),
    ('CMS_008', 3, 'Say compliment'),
    ('CMS_009', 1, 'Listen carefully'),
    ('CMS_009', 2, 'Ask questions'),
    ('CMS_009', 3, 'Follow steps')
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
