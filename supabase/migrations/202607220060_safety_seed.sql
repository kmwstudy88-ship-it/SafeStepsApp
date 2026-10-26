insert into public.safety_escalation_levels (
  escalation_level,
  escalation_name,
  escalation_description,
  notification_due_minutes,
  acknowledgement_due_minutes,
  review_due_minutes
)
values
  (1, 'Worker review', 'Worker reviews the safety concern.', 60, 240, 1440),
  (2, 'Supervisor review', 'Supervisor acknowledgement and direction required.', 30, 120, 720),
  (3, 'Clinical review', 'Clinical or specialist safety review required.', 15, 60, 360),
  (4, 'Executive review', 'Organisation executive oversight required.', 10, 30, 180),
  (5, 'Emergency services', 'Emergency service response or immediate statutory action required.', 5, 15, 60)
on conflict (escalation_level) do update
set escalation_name = excluded.escalation_name,
    escalation_description = excluded.escalation_description,
    notification_due_minutes = excluded.notification_due_minutes,
    acknowledgement_due_minutes = excluded.acknowledgement_due_minutes,
    review_due_minutes = excluded.review_due_minutes;

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
  ('safety.view', 'View safety records', 'View authorised safety plans, alerts, and risk records.', 'safety', 'read', true, true),
  ('safety.manage', 'Manage safety records', 'Create and update authorised safety plans and actions.', 'safety', 'manage', true, true),
  ('risk.review', 'Review risk', 'Review static, dynamic, and AI-assisted risk records.', 'risk', 'review', true, true),
  ('incident.create', 'Create incident', 'Create incident and mandatory-notification records.', 'incident', 'create', true, true),
  ('incident.review', 'Review incident', 'Review, resolve, and close incident records.', 'incident', 'review', true, true),
  ('crisis.manage', 'Manage crisis', 'Manage crisis events and emergency workflows.', 'crisis', 'manage', true, true),
  ('weapon.review', 'Review weapon detection', 'Review and confirm weapon-risk detections.', 'safety', 'review', true, true),
  ('child_disclosure.review', 'Review child disclosure', 'Review locked child disclosure records.', 'child', 'review', true, true),
  ('emergency.override', 'Emergency override', 'Use emergency safety override workflows with audit.', 'safety', 'override', true, false),
  ('missing_child.manage', 'Manage missing child events', 'Manage missing-child and welfare-check workflows.', 'safety', 'manage', true, true)
on conflict (permission_code) do nothing;

drop trigger if exists audit_safety_plans on public.safety_plans;
create trigger audit_safety_plans after insert or update or delete on public.safety_plans for each row execute function public.audit_row_change();
drop trigger if exists audit_safety_risk_assessments on public.safety_risk_assessments;
create trigger audit_safety_risk_assessments after insert or update or delete on public.safety_risk_assessments for each row execute function public.audit_row_change();
drop trigger if exists audit_safety_alerts on public.safety_alerts;
create trigger audit_safety_alerts after insert or update or delete on public.safety_alerts for each row execute function public.audit_row_change();
drop trigger if exists audit_safety_incidents on public.safety_incidents;
create trigger audit_safety_incidents after insert or update or delete on public.safety_incidents for each row execute function public.audit_row_change();
drop trigger if exists audit_crisis_events on public.crisis_events;
create trigger audit_crisis_events after insert or update or delete on public.crisis_events for each row execute function public.audit_row_change();
drop trigger if exists audit_weapon_risk_detections on public.weapon_risk_detections;
create trigger audit_weapon_risk_detections after insert or update or delete on public.weapon_risk_detections for each row execute function public.audit_row_change();
drop trigger if exists audit_child_disclosures on public.child_disclosures;
create trigger audit_child_disclosures after insert or update or delete on public.child_disclosures for each row execute function public.audit_row_change();
