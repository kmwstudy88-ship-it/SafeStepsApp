begin;

select plan(30);

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
select has_function('public', 'grant_parent_video_report_consent', array['uuid', 'text', 'text', 'timestamp with time zone'], 'grant_parent_video_report_consent exists');
select has_function('public', 'withdraw_parent_video_report_consent', array['uuid', 'text'], 'withdraw_parent_video_report_consent exists');
select col_is_pk('public', 'evidence_records', 'id', 'evidence_records.id is primary key');
select col_is_fk('public', 'evidence_records', 'case_id', 'evidence_records.case_id is foreign key');
select col_is_fk('public', 'evidence_files', 'evidence_record_id', 'evidence_files.evidence_record_id is foreign key');
select col_is_fk('public', 'evidence_chain_of_custody', 'evidence_record_id', 'evidence_chain_of_custody.evidence_record_id is foreign key');
select col_is_fk('public', 'court_bundle_exhibits', 'evidence_record_id', 'court_bundle_exhibits.evidence_record_id is foreign key');
select col_is_fk('public', 'evidence_redactions', 'source_file_id', 'evidence_redactions.source_file_id is foreign key');
select ok(
  coalesce(not has_function_privilege('anon', to_regprocedure('public.grant_parent_video_report_consent(uuid, text, text, timestamp with time zone)'), 'EXECUTE'), false),
  'anon cannot execute grant_parent_video_report_consent'
);
select ok(
  coalesce(not has_function_privilege('authenticated', to_regprocedure('public.grant_parent_video_report_consent(uuid, text, text, timestamp with time zone)'), 'EXECUTE'), false),
  'authenticated cannot execute grant_parent_video_report_consent'
);
select ok(
  coalesce(not has_function_privilege('anon', to_regprocedure('public.withdraw_parent_video_report_consent(uuid, text)'), 'EXECUTE'), false),
  'anon cannot execute withdraw_parent_video_report_consent'
);
select ok(
  coalesce(not has_function_privilege('authenticated', to_regprocedure('public.withdraw_parent_video_report_consent(uuid, text)'), 'EXECUTE'), false),
  'authenticated cannot execute withdraw_parent_video_report_consent'
);
select ok(
  coalesce(has_function_privilege('service_role', to_regprocedure('public.grant_parent_video_report_consent(uuid, text, text, timestamp with time zone)'), 'EXECUTE'), false),
  'service_role can execute grant_parent_video_report_consent'
);
select ok(
  coalesce(has_function_privilege('service_role', to_regprocedure('public.withdraw_parent_video_report_consent(uuid, text)'), 'EXECUTE'), false),
  'service_role can execute withdraw_parent_video_report_consent'
);
select ok(
  not exists (
    select 1
    from pg_proc proc
    join pg_namespace ns on ns.oid = proc.pronamespace
    join lateral aclexplode(coalesce(proc.proacl, acldefault('f', proc.proowner))) acl on true
    where ns.nspname = 'public'
      and proc.proname = 'grant_parent_video_report_consent'
      and proc.pronargs = 4
      and acl.grantee = 0
      and acl.privilege_type = 'EXECUTE'
      and acl.is_grantable = false
  ),
  'grant_parent_video_report_consent does not grant execute to public'
);
select ok(
  not exists (
    select 1
    from pg_proc proc
    join pg_namespace ns on ns.oid = proc.pronamespace
    join lateral aclexplode(coalesce(proc.proacl, acldefault('f', proc.proowner))) acl on true
    where ns.nspname = 'public'
      and proc.proname = 'withdraw_parent_video_report_consent'
      and proc.pronargs = 2
      and acl.grantee = 0
      and acl.privilege_type = 'EXECUTE'
      and acl.is_grantable = false
  ),
  'withdraw_parent_video_report_consent does not grant execute to public'
);

select * from finish();

rollback;
