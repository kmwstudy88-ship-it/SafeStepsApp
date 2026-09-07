insert into public.evidence_type_definitions (evidence_type_code, evidence_type_name, media_group, description)
values
  ('photo', 'Photo', 'image', 'Photographic evidence.'),
  ('video', 'Video', 'video', 'Video evidence.'),
  ('audio', 'Audio', 'audio', 'Audio or voice recording.'),
  ('document', 'Document', 'document', 'Document evidence.'),
  ('pdf', 'PDF', 'document', 'PDF document.'),
  ('medical_report', 'Medical Report', 'document', 'Medical report or health document.'),
  ('school_report', 'School Report', 'document', 'School report or education record.'),
  ('drug_screen', 'Drug Screen', 'document', 'Drug or alcohol screening result.'),
  ('court_order', 'Court Order', 'document', 'Court order or direction.'),
  ('assessment', 'Assessment', 'structured', 'Assessment evidence.'),
  ('journal_entry', 'Journal Entry', 'structured', 'Journal or reflection evidence.'),
  ('lesson_completion', 'Lesson Completion', 'structured', 'Lesson completion evidence.'),
  ('certificate', 'Certificate', 'document', 'Certificate evidence.'),
  ('worker_observation', 'Worker Observation', 'structured', 'Worker observation record.'),
  ('child_statement', 'Child Statement', 'structured', 'Child statement evidence.'),
  ('parent_statement', 'Parent Statement', 'structured', 'Parent statement evidence.'),
  ('communication', 'Communication', 'document', 'SMS, email, call log, or communication evidence.'),
  ('other', 'Other', 'other', 'Other evidence type.')
on conflict (evidence_type_code) do nothing;

insert into public.evidence_category_definitions (evidence_category_code, evidence_category_name, description)
values
  ('parenting_capacity', 'Parenting Capacity', 'Parenting capacity evidence.'),
  ('home_environment', 'Home Environment', 'Home condition and environment evidence.'),
  ('child_safety', 'Child Safety', 'Child safety evidence.'),
  ('education', 'Education', 'Education and school evidence.'),
  ('medical', 'Medical', 'Medical evidence.'),
  ('mental_health', 'Mental Health', 'Mental health evidence.'),
  ('substance_use', 'Substance Use', 'Substance use evidence.'),
  ('housing', 'Housing', 'Housing evidence.'),
  ('family_contact', 'Family Contact', 'Family contact evidence.'),
  ('domestic_violence', 'Domestic Violence', 'Domestic and family violence evidence.'),
  ('child_voice', 'Child Voice', 'Child voice and child-controlled evidence.'),
  ('protective_factors', 'Protective Factors', 'Protective-factor evidence.'),
  ('risk_factors', 'Risk Factors', 'Risk-factor evidence.'),
  ('safety_plan', 'Safety Plan', 'Safety-plan evidence.'),
  ('incident', 'Incident', 'Incident evidence.'),
  ('court', 'Court', 'Court evidence.'),
  ('other', 'Other', 'Other evidence.')
on conflict (evidence_category_code) do nothing;

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
  ('evidence.view', 'View evidence', 'View authorised evidence records.', 'evidence', 'read', true, true),
  ('evidence.upload', 'Upload evidence', 'Upload evidence into the digital vault.', 'evidence', 'create', true, true),
  ('evidence.verify', 'Verify evidence', 'Verify evidence, hashes, and metadata.', 'evidence', 'review', true, true),
  ('evidence.download', 'Download evidence', 'Download authorised evidence files.', 'evidence', 'download', true, true),
  ('evidence.export', 'Export evidence', 'Export evidence for reports, bundles, and court use.', 'evidence', 'export', true, true),
  ('evidence.redact', 'Redact evidence', 'Create redacted evidence versions without altering originals.', 'evidence', 'redact', true, true),
  ('evidence.share', 'Share evidence', 'Grant and revoke evidence sharing access.', 'evidence', 'share', true, true),
  ('evidence.delete', 'Delete evidence', 'Soft-delete evidence when legal holds and retention rules allow it.', 'evidence', 'delete', true, true),
  ('evidence.restore', 'Restore evidence', 'Restore deleted or archived evidence.', 'evidence', 'restore', true, true),
  ('court.bundle.manage', 'Manage court bundles', 'Create and manage court evidence bundles.', 'court', 'manage', true, true),
  ('legal.hold.manage', 'Manage legal holds', 'Place and release evidence legal holds.', 'legal', 'manage', true, true),
  ('ai.analysis.review', 'Review AI analysis', 'Review AI analysis attached to evidence.', 'evidence', 'review', true, true)
on conflict (permission_code) do nothing;

drop trigger if exists audit_evidence_records on public.evidence_records;
create trigger audit_evidence_records after insert or update or delete on public.evidence_records for each row execute function public.audit_row_change();
drop trigger if exists audit_evidence_files on public.evidence_files;
create trigger audit_evidence_files after insert or update or delete on public.evidence_files for each row execute function public.audit_row_change();
drop trigger if exists audit_evidence_verifications on public.evidence_verifications;
create trigger audit_evidence_verifications after insert or update or delete on public.evidence_verifications for each row execute function public.audit_row_change();
drop trigger if exists audit_court_bundles on public.court_bundles;
create trigger audit_court_bundles after insert or update or delete on public.court_bundles for each row execute function public.audit_row_change();
