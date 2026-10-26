-- Seed complete SafeSteps sequence assessment items from bulk 151-250 attachment.
-- Source is truncated during SRS_014; partial item is intentionally excluded.

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
    ('parent_child_interaction_sequencing', 'Sequencing shared learning, activity planning, teaching, and parent-child repair steps.', 7),
    ('boundary_supervision_sequencing', 'Sequencing limits, supervision, screen-time follow-through, tool use, and risky-behaviour response.', 8),
    ('school_readiness_sequencing', 'Sequencing classroom routines, homework preparation, group work, recess transitions, and reading assignments.', 9)
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
    ('daily_routine_sequencing', 'DRS_019', 'Order the steps for preparing for a video call: Set device, Check sound, Join meeting.', 3::numeric, 19),
    ('daily_routine_sequencing', 'DRS_020', 'Sequence the steps for ending homework time: Finish tasks, Pack materials, Clean workspace.', 3::numeric, 20),
    ('daily_routine_sequencing', 'DRS_021', 'Order the steps for preparing for a car ride: Put on shoes, Grab bag, Buckle seatbelt.', 3::numeric, 21),
    ('daily_routine_sequencing', 'DRS_022', 'Sequence the steps for starting chores: Choose chore, Gather tools, Begin task.', 3::numeric, 22),
    ('daily_routine_sequencing', 'DRS_023', 'Order the steps for ending the day: Put away toys, Change clothes, Go to bed.', 3::numeric, 23),
    ('safety_procedure_sequencing', 'SPS_019', 'Sequence the steps for safe oven use: Turn on oven, Use mitts, Place food inside.', 3::numeric, 119),
    ('safety_procedure_sequencing', 'SPS_020', 'Order the steps for responding to a loud alarm: Stop activity, Look for adult, Follow instructions.', 3::numeric, 120),
    ('safety_procedure_sequencing', 'SPS_021', 'Sequence the steps for safe bike riding: Put on helmet, Check brakes, Ride carefully.', 3::numeric, 121),
    ('safety_procedure_sequencing', 'SPS_022', 'Order the steps for safe swimming: Enter slowly, Stay near adult, Follow pool rules.', 3::numeric, 122),
    ('safety_procedure_sequencing', 'SPS_023', 'Sequence the steps for responding to a spill: Stop movement, Tell adult, Clean safely.', 3::numeric, 123),
    ('emotional_regulation_sequencing', 'ERS_019', 'Order the steps for calming after excitement: Sit down, Take deep breaths, Speak calmly.', 3::numeric, 219),
    ('emotional_regulation_sequencing', 'ERS_020', 'Sequence the steps for managing anger: Pause, Identify trigger, Choose coping strategy.', 3::numeric, 220),
    ('emotional_regulation_sequencing', 'ERS_021', 'Order the steps for expressing gratitude: Notice kindness, Think of words, Say thank you.', 3::numeric, 221),
    ('emotional_regulation_sequencing', 'ERS_022', 'Sequence the steps for calming before school: Eat breakfast, Take deep breaths, Walk calmly.', 3::numeric, 222),
    ('emotional_regulation_sequencing', 'ERS_023', 'Order the steps for managing embarrassment: Pause, Take breath, Talk to trusted adult.', 3::numeric, 223),
    ('problem_solving_sequencing', 'PSS_018', 'Sequence the steps for fixing a messy backpack: Empty items, Sort items, Put items back neatly.', 3::numeric, 318),
    ('problem_solving_sequencing', 'PSS_019', 'Order the steps for solving a disagreement with a friend: Listen, Share feelings, Find solution.', 3::numeric, 319),
    ('problem_solving_sequencing', 'PSS_020', 'Sequence the steps for fixing a drawing mistake: Erase gently, Redraw, Check result.', 3::numeric, 320),
    ('problem_solving_sequencing', 'PSS_021', 'Order the steps for solving a maze: Start at entrance, Follow path, Reach exit.', 3::numeric, 321),
    ('problem_solving_sequencing', 'PSS_022', 'Sequence the steps for planning a craft: Choose idea, Gather materials, Begin creating.', 3::numeric, 322),
    ('task_completion_sequencing', 'TCS_011', 'Order the steps for finishing a puzzle: Place final pieces, Check picture, Put puzzle away.', 3::numeric, 411),
    ('task_completion_sequencing', 'TCS_012', 'Sequence the steps for cleaning a table: Clear items, Wipe surface, Dry surface.', 3::numeric, 412),
    ('task_completion_sequencing', 'TCS_013', 'Order the steps for finishing homework: Complete tasks, Review answers, Pack materials.', 3::numeric, 413),
    ('task_completion_sequencing', 'TCS_014', 'Sequence the steps for organizing toys: Sort toys, Place in bins, Close lids.', 3::numeric, 414),
    ('task_completion_sequencing', 'TCS_015', 'Order the steps for finishing a meal: Eat food, Clear plate, Wash hands.', 3::numeric, 415),
    ('health_hygiene_sequencing', 'HHS_011', 'Sequence the steps for brushing teeth at night: Apply toothpaste, Brush thoroughly, Rinse mouth.', 3::numeric, 511),
    ('health_hygiene_sequencing', 'HHS_012', 'Order the steps for washing hands after play: Turn on water, Apply soap, Scrub hands.', 3::numeric, 512),
    ('health_hygiene_sequencing', 'HHS_013', 'Sequence the steps for getting ready for a bath: Gather towel, Turn on water, Get in tub.', 3::numeric, 513),
    ('health_hygiene_sequencing', 'HHS_014', 'Order the steps for caring for a cut: Clean cut, Apply bandage, Tell adult.', 3::numeric, 514),
    ('health_hygiene_sequencing', 'HHS_015', 'Sequence the steps for preparing for sleep: Change clothes, Brush teeth, Turn off lights.', 3::numeric, 515),
    ('parent_child_interaction_sequencing', 'PCI_011', 'Order the steps for practicing a skill together: Choose skill, Practice slowly, Celebrate progress.', 3::numeric, 611),
    ('parent_child_interaction_sequencing', 'PCI_012', 'Sequence the steps for preparing for an outing: Discuss plan, Pack items, Leave together.', 3::numeric, 612),
    ('parent_child_interaction_sequencing', 'PCI_013', 'Order the steps for helping child calm down: Sit together, Speak softly, Guide breathing.', 3::numeric, 613),
    ('parent_child_interaction_sequencing', 'PCI_014', 'Sequence the steps for teaching responsibility: Explain task, Demonstrate steps, Supervise completion.', 3::numeric, 614),
    ('parent_child_interaction_sequencing', 'PCI_015', 'Order the steps for preparing for bedtime together: Read story, Talk quietly, Turn off lights.', 3::numeric, 615),
    ('boundary_supervision_sequencing', 'BSS_011', 'Order the steps for supervising outdoor play: Check area, Set expectations, Monitor activity.', 3::numeric, 711),
    ('boundary_supervision_sequencing', 'BSS_012', 'Sequence the steps for enforcing screen-time rules: Give warning, End activity, Redirect child.', 3::numeric, 712),
    ('boundary_supervision_sequencing', 'BSS_013', 'Order the steps for managing risky behavior: Notice behavior, Intervene calmly, Redirect safely.', 3::numeric, 713),
    ('boundary_supervision_sequencing', 'BSS_014', 'Sequence the steps for setting a limit: State rule, Explain reason, Follow through.', 3::numeric, 714),
    ('boundary_supervision_sequencing', 'BSS_015', 'Order the steps for supervising group play: Set expectations, Watch interactions, Intervene if needed.', 3::numeric, 715),
    ('school_readiness_sequencing', 'SRS_011', 'Sequence the steps for preparing for a test: Review notes, Practice problems, Rest well.', 3::numeric, 811),
    ('school_readiness_sequencing', 'SRS_012', 'Order the steps for starting a writing assignment: Brainstorm ideas, Write draft, Review writing.', 3::numeric, 812),
    ('school_readiness_sequencing', 'SRS_013', 'Sequence the steps for preparing for art class: Gather supplies, Put on apron, Begin project.', 3::numeric, 813)
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
    ('DRS_019', 1, 'Set device'),
    ('DRS_019', 2, 'Check sound'),
    ('DRS_019', 3, 'Join meeting'),
    ('DRS_020', 1, 'Finish tasks'),
    ('DRS_020', 2, 'Pack materials'),
    ('DRS_020', 3, 'Clean workspace'),
    ('DRS_021', 1, 'Put on shoes'),
    ('DRS_021', 2, 'Grab bag'),
    ('DRS_021', 3, 'Buckle seatbelt'),
    ('DRS_022', 1, 'Choose chore'),
    ('DRS_022', 2, 'Gather tools'),
    ('DRS_022', 3, 'Begin task'),
    ('DRS_023', 1, 'Put away toys'),
    ('DRS_023', 2, 'Change clothes'),
    ('DRS_023', 3, 'Go to bed'),
    ('SPS_019', 1, 'Turn on oven'),
    ('SPS_019', 2, 'Use mitts'),
    ('SPS_019', 3, 'Place food inside'),
    ('SPS_020', 1, 'Stop activity'),
    ('SPS_020', 2, 'Look for adult'),
    ('SPS_020', 3, 'Follow instructions'),
    ('SPS_021', 1, 'Put on helmet'),
    ('SPS_021', 2, 'Check brakes'),
    ('SPS_021', 3, 'Ride carefully'),
    ('SPS_022', 1, 'Enter slowly'),
    ('SPS_022', 2, 'Stay near adult'),
    ('SPS_022', 3, 'Follow pool rules'),
    ('SPS_023', 1, 'Stop movement'),
    ('SPS_023', 2, 'Tell adult'),
    ('SPS_023', 3, 'Clean safely'),
    ('ERS_019', 1, 'Sit down'),
    ('ERS_019', 2, 'Take deep breaths'),
    ('ERS_019', 3, 'Speak calmly'),
    ('ERS_020', 1, 'Pause'),
    ('ERS_020', 2, 'Identify trigger'),
    ('ERS_020', 3, 'Choose coping strategy'),
    ('ERS_021', 1, 'Notice kindness'),
    ('ERS_021', 2, 'Think of words'),
    ('ERS_021', 3, 'Say thank you'),
    ('ERS_022', 1, 'Eat breakfast'),
    ('ERS_022', 2, 'Take deep breaths'),
    ('ERS_022', 3, 'Walk calmly'),
    ('ERS_023', 1, 'Pause'),
    ('ERS_023', 2, 'Take breath'),
    ('ERS_023', 3, 'Talk to trusted adult'),
    ('PSS_018', 1, 'Empty items'),
    ('PSS_018', 2, 'Sort items'),
    ('PSS_018', 3, 'Put items back neatly'),
    ('PSS_019', 1, 'Listen'),
    ('PSS_019', 2, 'Share feelings'),
    ('PSS_019', 3, 'Find solution'),
    ('PSS_020', 1, 'Erase gently'),
    ('PSS_020', 2, 'Redraw'),
    ('PSS_020', 3, 'Check result'),
    ('PSS_021', 1, 'Start at entrance'),
    ('PSS_021', 2, 'Follow path'),
    ('PSS_021', 3, 'Reach exit'),
    ('PSS_022', 1, 'Choose idea'),
    ('PSS_022', 2, 'Gather materials'),
    ('PSS_022', 3, 'Begin creating'),
    ('TCS_011', 1, 'Place final pieces'),
    ('TCS_011', 2, 'Check picture'),
    ('TCS_011', 3, 'Put puzzle away'),
    ('TCS_012', 1, 'Clear items'),
    ('TCS_012', 2, 'Wipe surface'),
    ('TCS_012', 3, 'Dry surface'),
    ('TCS_013', 1, 'Complete tasks'),
    ('TCS_013', 2, 'Review answers'),
    ('TCS_013', 3, 'Pack materials'),
    ('TCS_014', 1, 'Sort toys'),
    ('TCS_014', 2, 'Place in bins'),
    ('TCS_014', 3, 'Close lids'),
    ('TCS_015', 1, 'Eat food'),
    ('TCS_015', 2, 'Clear plate'),
    ('TCS_015', 3, 'Wash hands'),
    ('HHS_011', 1, 'Apply toothpaste'),
    ('HHS_011', 2, 'Brush thoroughly'),
    ('HHS_011', 3, 'Rinse mouth'),
    ('HHS_012', 1, 'Turn on water'),
    ('HHS_012', 2, 'Apply soap'),
    ('HHS_012', 3, 'Scrub hands'),
    ('HHS_013', 1, 'Gather towel'),
    ('HHS_013', 2, 'Turn on water'),
    ('HHS_013', 3, 'Get in tub'),
    ('HHS_014', 1, 'Clean cut'),
    ('HHS_014', 2, 'Apply bandage'),
    ('HHS_014', 3, 'Tell adult'),
    ('HHS_015', 1, 'Change clothes'),
    ('HHS_015', 2, 'Brush teeth'),
    ('HHS_015', 3, 'Turn off lights'),
    ('PCI_011', 1, 'Choose skill'),
    ('PCI_011', 2, 'Practice slowly'),
    ('PCI_011', 3, 'Celebrate progress'),
    ('PCI_012', 1, 'Discuss plan'),
    ('PCI_012', 2, 'Pack items'),
    ('PCI_012', 3, 'Leave together'),
    ('PCI_013', 1, 'Sit together'),
    ('PCI_013', 2, 'Speak softly'),
    ('PCI_013', 3, 'Guide breathing'),
    ('PCI_014', 1, 'Explain task'),
    ('PCI_014', 2, 'Demonstrate steps'),
    ('PCI_014', 3, 'Supervise completion'),
    ('PCI_015', 1, 'Read story'),
    ('PCI_015', 2, 'Talk quietly'),
    ('PCI_015', 3, 'Turn off lights'),
    ('BSS_011', 1, 'Check area'),
    ('BSS_011', 2, 'Set expectations'),
    ('BSS_011', 3, 'Monitor activity'),
    ('BSS_012', 1, 'Give warning'),
    ('BSS_012', 2, 'End activity'),
    ('BSS_012', 3, 'Redirect child'),
    ('BSS_013', 1, 'Notice behavior'),
    ('BSS_013', 2, 'Intervene calmly'),
    ('BSS_013', 3, 'Redirect safely'),
    ('BSS_014', 1, 'State rule'),
    ('BSS_014', 2, 'Explain reason'),
    ('BSS_014', 3, 'Follow through'),
    ('BSS_015', 1, 'Set expectations'),
    ('BSS_015', 2, 'Watch interactions'),
    ('BSS_015', 3, 'Intervene if needed'),
    ('SRS_011', 1, 'Review notes'),
    ('SRS_011', 2, 'Practice problems'),
    ('SRS_011', 3, 'Rest well'),
    ('SRS_012', 1, 'Brainstorm ideas'),
    ('SRS_012', 2, 'Write draft'),
    ('SRS_012', 3, 'Review writing'),
    ('SRS_013', 1, 'Gather supplies'),
    ('SRS_013', 2, 'Put on apron'),
    ('SRS_013', 3, 'Begin project')
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
