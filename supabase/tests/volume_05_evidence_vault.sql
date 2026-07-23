begin;

select plan(20);

select has_table('public', 'evidence_records', 'evidence_records exists');
select has_table('public', 'evidence_files', 'evidence_files exists');
select has_table('public', 'evidence_metadata', 'evidence_metadata exists');
select has_table('public', 'evidence_chain_of_custody', 'evidence_chain_of_custody exists');
select has_table('public', 'evidence_verifications', 'evidence_verifications exists');
select has_table('public', 'evidence_ai_analyses', 'evidence_ai_analyses exists');
select has_table('public', 'evidence_redactions', 'evidence_redactions exists');
select has_table('public', 'court_bundles', 'court_bundles exists');
select has_table('public', 'court_bundle_exhibits', 'court_bundle_exhibits exists');
select has_table('public', 'evidence_legal_holds', 'evidence_legal_holds exists');
select has_table('public', 'evidence_sharing_grants', 'evidence_sharing_grants exists');
select has_function('public', 'has_evidence_access', array['uuid'], 'has_evidence_access exists');
select has_function('public', 'can_manage_evidence', array['uuid'], 'can_manage_evidence exists');
select has_function('public', 'can_export_evidence', array['uuid'], 'can_export_evidence exists');
select col_is_pk('public', 'evidence_records', 'id', 'evidence_records.id is primary key');
select col_is_fk('public', 'evidence_records', 'case_id', 'evidence_records.case_id is foreign key');
select col_is_fk('public', 'evidence_files', 'evidence_record_id', 'evidence_files.evidence_record_id is foreign key');
select col_is_fk('public', 'evidence_chain_of_custody', 'evidence_record_id', 'evidence_chain_of_custody.evidence_record_id is foreign key');
select col_is_fk('public', 'court_bundle_exhibits', 'evidence_record_id', 'court_bundle_exhibits.evidence_record_id is foreign key');
select col_is_fk('public', 'evidence_redactions', 'source_file_id', 'evidence_redactions.source_file_id is foreign key');

select * from finish();

rollback;
