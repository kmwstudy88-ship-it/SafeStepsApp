insert into public.case_type_definitions (
  case_type_code,
  case_type_name,
  case_type_description,
  default_priority_level,
  safety_critical,
  default_program_code,
  default_review_frequency_days
)
values
  ('early_support', 'Early Support', 'Early intervention and voluntary family support.', 'standard', false, 'build_stronger_families', 90),
  ('child_safety_contact', 'Child Safety Contact', 'Case involving current or prior child protection contact.', 'elevated', true, 'child_safety_12_week', 30),
  ('reunification', 'Reunification', 'Case focused on safe family reunification.', 'high', true, 'reunification', 30),
  ('family_preservation', 'Family Preservation', 'Case focused on keeping children safely within family care.', 'high', true, 'keeping_families_together', 30),
  ('post_reunification', 'Post-Reunification Support', 'Support following reunification.', 'elevated', true, 'home_again', 30)
on conflict (case_type_code) do nothing;

insert into public.case_status_definitions (
  case_status_code,
  case_status_name,
  case_status_description,
  terminal_status,
  active_work_status,
  display_order
)
values
  ('intake', 'Intake', 'Initial intake and triage.', false, true, 10),
  ('assessment', 'Assessment', 'Assessment stage.', false, true, 20),
  ('planning', 'Planning', 'Case plan development.', false, true, 30),
  ('active', 'Active', 'Active intervention and support.', false, true, 40),
  ('monitoring', 'Monitoring', 'Progress monitoring stage.', false, true, 50),
  ('transition', 'Transition', 'Transition or reunification stage.', false, true, 60),
  ('closure_review', 'Closure Review', 'Review before closure.', false, true, 70),
  ('closed', 'Closed', 'Case has ended.', true, false, 80),
  ('transferred', 'Transferred', 'Case transferred to another service.', true, false, 90)
on conflict (case_status_code) do nothing;

insert into public.case_priority_definitions (
  priority_code,
  priority_name,
  priority_description,
  severity_order,
  target_response_hours
)
values
  ('routine', 'Routine', 'Standard service response.', 1, 120),
  ('standard', 'Standard', 'Normal case priority.', 2, 72),
  ('elevated', 'Elevated', 'Additional monitoring required.', 3, 24),
  ('high', 'High', 'Prompt case action required.', 4, 8),
  ('urgent', 'Urgent', 'Immediate review and response required.', 5, 2),
  ('critical', 'Critical', 'Immediate safety response required.', 6, 1)
on conflict (priority_code) do nothing;

insert into public.permission_definitions (
  permission_code,
  permission_name,
  permission_description,
  permission_domain,
  action_type,
  sensitive_permission,
  tenant_assignable
)
values
  ('case.view', 'View case', 'View an authorised case.', 'case', 'read', true, true),
  ('case.create', 'Create case', 'Create a case.', 'case', 'create', true, true),
  ('case.update', 'Update case', 'Update an authorised case.', 'case', 'update', true, true),
  ('case.allocation.view', 'View allocations', 'View worker and team allocations.', 'case', 'read', true, true),
  ('case.allocation.manage', 'Manage allocations', 'Create, transfer and end case allocations.', 'case', 'manage', true, true),
  ('case.plan.manage', 'Manage case plans', 'Create and update case plans.', 'case', 'manage', true, true),
  ('case.note.create', 'Create case notes', 'Create case notes for authorised cases.', 'case', 'create', true, true),
  ('case.restricted_note.view', 'View restricted notes', 'View restricted case notes.', 'case', 'read', true, true),
  ('case.legal_note.view', 'View legal notes', 'View legally restricted case notes.', 'legal', 'read', true, true),
  ('case.court_export.view', 'View court export notes', 'View content approved for court export.', 'legal', 'read', true, true)
on conflict (permission_code) do nothing;
