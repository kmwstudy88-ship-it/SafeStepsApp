-- Seed SafeSteps sequence assessment block 2 items.

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
    ('parent_child_interaction_sequencing', 'Sequencing shared learning, activity planning, teaching, and parent-child repair steps.', 7),
    ('boundary_supervision_sequencing', 'Sequencing limits, supervision, screen-time follow-through, tool use, and risky-behaviour response.', 8),
    ('school_readiness_sequencing', 'Sequencing classroom routines, homework preparation, group work, recess transitions, and reading assignments.', 9),
    ('communication_sequencing', 'Sequencing questions, instructions, storytelling, clarification, and feedback.', 10),
    ('executive_function_sequencing', 'Sequencing organization, planning, time management, multi-step work, and checking work.', 11),
    ('risk_recognition_sequencing', 'Sequencing risk identification, hazard avoidance, unsafe-behaviour response, and safety decisions.', 12)
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
    ('parent_child_interaction_sequencing', 'PCI_001', 'Order the steps for reading together: Choose book, Sit together, Read aloud.', 3::numeric, 601),
    ('parent_child_interaction_sequencing', 'PCI_002', 'Sequence the steps for helping with homework: Ask what task is, Provide guidance, Review work.', 3::numeric, 602),
    ('parent_child_interaction_sequencing', 'PCI_003', 'Order the steps for teaching a new skill: Demonstrate, Let child try, Give feedback.', 3::numeric, 603),
    ('parent_child_interaction_sequencing', 'PCI_004', 'Sequence the steps for resolving a disagreement: Listen to child, Explain expectations, Agree on plan.', 3::numeric, 604),
    ('parent_child_interaction_sequencing', 'PCI_005', 'Order the steps for planning an activity together: Discuss ideas, Choose activity, Prepare materials.', 3::numeric, 605),
    ('boundary_supervision_sequencing', 'BSS_001', 'Sequence the steps for setting a limit: State rule, Explain reason, Follow through.', 3::numeric, 701),
    ('boundary_supervision_sequencing', 'BSS_002', 'Order the steps for supervising outdoor play: Check area, Set expectations, Monitor activity.', 3::numeric, 702),
    ('boundary_supervision_sequencing', 'BSS_003', 'Sequence the steps for enforcing screen-time rules: Give warning, End activity, Redirect child.', 3::numeric, 703),
    ('boundary_supervision_sequencing', 'BSS_004', 'Order the steps for safe tool use: Explain rules, Demonstrate use, Supervise closely.', 3::numeric, 704),
    ('boundary_supervision_sequencing', 'BSS_005', 'Sequence the steps for managing risky behavior: Notice behavior, Intervene calmly, Redirect safely.', 3::numeric, 705),
    ('school_readiness_sequencing', 'SRS_001', 'Order the steps for starting a school day: Hang bag, Sit at desk, Begin work.', 3::numeric, 801),
    ('school_readiness_sequencing', 'SRS_002', 'Sequence the steps for preparing homework: Gather materials, Read instructions, Start task.', 3::numeric, 802),
    ('school_readiness_sequencing', 'SRS_003', 'Order the steps for participating in group work: Listen to peers, Share ideas, Complete task together.', 3::numeric, 803),
    ('school_readiness_sequencing', 'SRS_004', 'Sequence the steps for preparing for recess: Put away materials, Line up, Walk outside.', 3::numeric, 804),
    ('school_readiness_sequencing', 'SRS_005', 'Order the steps for completing a reading assignment: Choose book, Read pages, Answer questions.', 3::numeric, 805),
    ('communication_sequencing', 'CMS_001', 'Sequence the steps for asking a question: Think of topic, Raise hand, Speak clearly.', 3::numeric, 901),
    ('communication_sequencing', 'CMS_002', 'Order the steps for giving instructions: Get attention, Explain steps, Check understanding.', 3::numeric, 902),
    ('communication_sequencing', 'CMS_003', 'Sequence the steps for telling a story: Introduce characters, Describe events, End clearly.', 3::numeric, 903),
    ('communication_sequencing', 'CMS_004', 'Order the steps for resolving confusion: Ask for clarification, Listen to response, Repeat understanding.', 3::numeric, 904),
    ('communication_sequencing', 'CMS_005', 'Sequence the steps for giving feedback: Notice behavior, Describe impact, Suggest improvement.', 3::numeric, 905),
    ('executive_function_sequencing', 'EFS_001', 'Order the steps for organizing a desk: Remove clutter, Sort items, Place items neatly.', 3::numeric, 1001),
    ('executive_function_sequencing', 'EFS_002', 'Sequence the steps for planning a task: Identify goal, Break into steps, Begin first step.', 3::numeric, 1002),
    ('executive_function_sequencing', 'EFS_003', 'Order the steps for managing time: Check schedule, Prioritize tasks, Start highest priority.', 3::numeric, 1003),
    ('executive_function_sequencing', 'EFS_004', 'Sequence the steps for completing a multi-step project: Plan steps, Gather materials, Work through steps.', 3::numeric, 1004),
    ('executive_function_sequencing', 'EFS_005', 'Order the steps for checking work: Finish task, Review details, Correct mistakes.', 3::numeric, 1005),
    ('risk_recognition_sequencing', 'RRS_001', 'Sequence the steps for identifying danger: Notice unusual situation, Assess risk, Move to safety.', 3::numeric, 1101),
    ('risk_recognition_sequencing', 'RRS_002', 'Order the steps for responding to unsafe behavior: Stop behavior, Explain risk, Redirect safely.', 3::numeric, 1102),
    ('risk_recognition_sequencing', 'RRS_003', 'Sequence the steps for avoiding hazards: Identify hazard, Move away, Inform adult.', 3::numeric, 1103),
    ('risk_recognition_sequencing', 'RRS_004', 'Order the steps for responding to unsafe weather: Notice warning, Go indoors, Stay away from windows.', 3::numeric, 1104),
    ('risk_recognition_sequencing', 'RRS_005', 'Sequence the steps for staying safe around animals: Observe behavior, Keep distance, Ask adult before approaching.', 3::numeric, 1105)
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
    ('PCI_001', 1, 'Choose book'),
    ('PCI_001', 2, 'Sit together'),
    ('PCI_001', 3, 'Read aloud'),
    ('PCI_002', 1, 'Ask what task is'),
    ('PCI_002', 2, 'Provide guidance'),
    ('PCI_002', 3, 'Review work'),
    ('PCI_003', 1, 'Demonstrate'),
    ('PCI_003', 2, 'Let child try'),
    ('PCI_003', 3, 'Give feedback'),
    ('PCI_004', 1, 'Listen to child'),
    ('PCI_004', 2, 'Explain expectations'),
    ('PCI_004', 3, 'Agree on plan'),
    ('PCI_005', 1, 'Discuss ideas'),
    ('PCI_005', 2, 'Choose activity'),
    ('PCI_005', 3, 'Prepare materials'),
    ('BSS_001', 1, 'State rule'),
    ('BSS_001', 2, 'Explain reason'),
    ('BSS_001', 3, 'Follow through'),
    ('BSS_002', 1, 'Check area'),
    ('BSS_002', 2, 'Set expectations'),
    ('BSS_002', 3, 'Monitor activity'),
    ('BSS_003', 1, 'Give warning'),
    ('BSS_003', 2, 'End activity'),
    ('BSS_003', 3, 'Redirect child'),
    ('BSS_004', 1, 'Explain rules'),
    ('BSS_004', 2, 'Demonstrate use'),
    ('BSS_004', 3, 'Supervise closely'),
    ('BSS_005', 1, 'Notice behavior'),
    ('BSS_005', 2, 'Intervene calmly'),
    ('BSS_005', 3, 'Redirect safely'),
    ('SRS_001', 1, 'Hang bag'),
    ('SRS_001', 2, 'Sit at desk'),
    ('SRS_001', 3, 'Begin work'),
    ('SRS_002', 1, 'Gather materials'),
    ('SRS_002', 2, 'Read instructions'),
    ('SRS_002', 3, 'Start task'),
    ('SRS_003', 1, 'Listen to peers'),
    ('SRS_003', 2, 'Share ideas'),
    ('SRS_003', 3, 'Complete task together'),
    ('SRS_004', 1, 'Put away materials'),
    ('SRS_004', 2, 'Line up'),
    ('SRS_004', 3, 'Walk outside'),
    ('SRS_005', 1, 'Choose book'),
    ('SRS_005', 2, 'Read pages'),
    ('SRS_005', 3, 'Answer questions'),
    ('CMS_001', 1, 'Think of topic'),
    ('CMS_001', 2, 'Raise hand'),
    ('CMS_001', 3, 'Speak clearly'),
    ('CMS_002', 1, 'Get attention'),
    ('CMS_002', 2, 'Explain steps'),
    ('CMS_002', 3, 'Check understanding'),
    ('CMS_003', 1, 'Introduce characters'),
    ('CMS_003', 2, 'Describe events'),
    ('CMS_003', 3, 'End clearly'),
    ('CMS_004', 1, 'Ask for clarification'),
    ('CMS_004', 2, 'Listen to response'),
    ('CMS_004', 3, 'Repeat understanding'),
    ('CMS_005', 1, 'Notice behavior'),
    ('CMS_005', 2, 'Describe impact'),
    ('CMS_005', 3, 'Suggest improvement'),
    ('EFS_001', 1, 'Remove clutter'),
    ('EFS_001', 2, 'Sort items'),
    ('EFS_001', 3, 'Place items neatly'),
    ('EFS_002', 1, 'Identify goal'),
    ('EFS_002', 2, 'Break into steps'),
    ('EFS_002', 3, 'Begin first step'),
    ('EFS_003', 1, 'Check schedule'),
    ('EFS_003', 2, 'Prioritize tasks'),
    ('EFS_003', 3, 'Start highest priority'),
    ('EFS_004', 1, 'Plan steps'),
    ('EFS_004', 2, 'Gather materials'),
    ('EFS_004', 3, 'Work through steps'),
    ('EFS_005', 1, 'Finish task'),
    ('EFS_005', 2, 'Review details'),
    ('EFS_005', 3, 'Correct mistakes'),
    ('RRS_001', 1, 'Notice unusual situation'),
    ('RRS_001', 2, 'Assess risk'),
    ('RRS_001', 3, 'Move to safety'),
    ('RRS_002', 1, 'Stop behavior'),
    ('RRS_002', 2, 'Explain risk'),
    ('RRS_002', 3, 'Redirect safely'),
    ('RRS_003', 1, 'Identify hazard'),
    ('RRS_003', 2, 'Move away'),
    ('RRS_003', 3, 'Inform adult'),
    ('RRS_004', 1, 'Notice warning'),
    ('RRS_004', 2, 'Go indoors'),
    ('RRS_004', 3, 'Stay away from windows'),
    ('RRS_005', 1, 'Observe behavior'),
    ('RRS_005', 2, 'Keep distance'),
    ('RRS_005', 3, 'Ask adult before approaching')
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
