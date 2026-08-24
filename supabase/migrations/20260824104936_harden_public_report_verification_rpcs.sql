begin;

-- These RPCs intentionally support unauthenticated report verification and
-- delivery. Keep the narrow anon EXECUTE grants, but remove the mutable public
-- search path and schema-qualify every referenced object.

create or replace function public.consume_case_report_delivery(p_token text, p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  c public.case_report_delivery_challenges%rowtype;
  rel public.case_report_release_events%rowtype;
  rf public.report_rendered_files%rowtype;
  outcome text;
begin
  select * into c
  from public.case_report_delivery_challenges
  where token_hash = pg_catalog.encode(
    extensions.digest(coalesce(p_token, ''), 'sha256'),
    'hex'
  )
  for update;

  if c.id is null then
    return pg_catalog.jsonb_build_object('allowed', false);
  end if;

  if c.revoked_at is not null then
    outcome := 'revoked';
  elsif c.disabled_at is not null then
    outcome := 'disabled';
  elsif c.expires_at <= pg_catalog.now() then
    outcome := 'expired';
  elsif c.download_count >= c.max_downloads then
    outcome := 'limit_reached';
  elsif c.code_hash <> pg_catalog.encode(
    extensions.digest(coalesce(p_code, ''), 'sha256'),
    'hex'
  ) then
    update public.case_report_delivery_challenges
    set failed_attempts = least(5, failed_attempts + 1),
        disabled_at = case when failed_attempts + 1 >= 5 then pg_catalog.now() else disabled_at end
    where id = c.id;
    outcome := case when c.failed_attempts + 1 >= 5 then 'disabled' else 'code_failed' end;
  else
    select * into rel
    from public.case_report_release_events
    where id = c.release_event_id;

    if rel.id is null then
      outcome := 'unavailable';
    elsif exists (
      select 1
      from public.report_withdrawals w
      where w.report_id = rel.report_id
        and w.report_version = rel.report_version
    ) then
      outcome := 'withdrawn';
    else
      select * into rf
      from public.report_rendered_files
      where id = rel.rendered_file_id;
      outcome := case
        when rf.id is null or rf.storage_bucket is null or rf.storage_path is null then 'unavailable'
        else 'allowed'
      end;
    end if;
  end if;

  insert into public.case_report_delivery_attempts(challenge_id, outcome)
  values (c.id, outcome);

  if outcome <> 'allowed' then
    return pg_catalog.jsonb_build_object('allowed', false);
  end if;

  update public.case_report_delivery_challenges
  set download_count = download_count + 1
  where id = c.id;

  return pg_catalog.jsonb_build_object(
    'allowed', true,
    'bucket', rf.storage_bucket,
    'path', rf.storage_path,
    'fileSha256', rf.file_hash_sha256,
    'reportVersion', rel.report_version,
    'expiresIn', 600
  );
end;
$function$;

create or replace function public.verify_real_video_report_delivery(
  raw_delivery_token text,
  raw_verification_code text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  delivery_row public.video_report_deliveries;
begin
  select * into delivery_row
  from public.video_report_deliveries
  where opaque_delivery_token_hash = pg_catalog.encode(
    extensions.digest(raw_delivery_token, 'sha256'),
    'hex'
  )
  for update;

  if delivery_row.id is null
     or delivery_row.token_expires_at <= pg_catalog.now()
     or delivery_row.verification_attempts >= delivery_row.max_verification_attempts
  then
    return pg_catalog.jsonb_build_object(
      'valid', false,
      'reason', 'Delivery token is invalid, expired or locked'
    );
  end if;

  update public.video_report_deliveries
  set verification_attempts = verification_attempts + 1
  where id = delivery_row.id;

  if delivery_row.verification_code_hash <> pg_catalog.encode(
    extensions.digest(raw_verification_code, 'sha256'),
    'hex'
  ) then
    insert into public.video_report_delivery_events(delivery_id, event_type)
    values (delivery_row.id, 'verification_failed');
    return pg_catalog.jsonb_build_object('valid', false, 'reason', 'Verification failed');
  end if;

  update public.video_report_deliveries
  set verified_at = pg_catalog.now(),
      delivery_status = 'opened',
      updated_at = pg_catalog.now()
  where id = delivery_row.id
  returning * into delivery_row;

  insert into public.video_report_delivery_events(delivery_id, event_type)
  values (delivery_row.id, 'verified');

  return pg_catalog.jsonb_build_object(
    'valid', true,
    'delivery_id', delivery_row.id,
    'snapshot_id', delivery_row.snapshot_id,
    'export_file_id', delivery_row.export_file_id
  );
end;
$function$;

create or replace function public.verify_video_report_public(verification_code_input text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $function$
  select coalesce((
    select pg_catalog.jsonb_build_object(
      'valid', vrc.revoked_at is null
        and att.revoked_at is null
        and snapshot.content_hash = vrc.snapshot_content_hash,
      'privacy_label', vrc.privacy_label,
      'snapshot_id', snapshot.id,
      'created_at', snapshot.created_at,
      'snapshot_content_hash', snapshot.content_hash,
      'export_file_sha256', vrc.export_file_sha256,
      'attestation_text', att.attestation_text,
      'attestation_revoked', att.revoked_at is not null,
      'verification_revoked', vrc.revoked_at is not null,
      'warning', snapshot.interpretation_warning
    )
    from public.video_report_verification_codes vrc
    join public.video_progress_report_snapshots snapshot
      on snapshot.id = vrc.snapshot_id
    left join public.video_report_attestations att
      on att.snapshot_id = snapshot.id
      and att.export_file_id is not distinct from vrc.export_file_id
    where vrc.verification_code = verification_code_input
    limit 1
  ), pg_catalog.jsonb_build_object('valid', false, 'reason', 'Verification code not found'));
$function$;

revoke all on function public.consume_case_report_delivery(text, text) from public;
revoke all on function public.verify_real_video_report_delivery(text, text) from public;
revoke all on function public.verify_video_report_public(text) from public;

grant execute on function public.consume_case_report_delivery(text, text)
  to anon, authenticated, service_role;
grant execute on function public.verify_real_video_report_delivery(text, text)
  to anon, authenticated, service_role;
grant execute on function public.verify_video_report_public(text)
  to anon, authenticated, service_role;

comment on function public.consume_case_report_delivery(text, text) is
  'Intentional public delivery RPC. Requires an opaque token plus verification code and enforces expiry, attempt, revocation, withdrawal and download limits.';
comment on function public.verify_real_video_report_delivery(text, text) is
  'Intentional public verification RPC. Requires an opaque token plus verification code and enforces expiry and attempt limits.';
comment on function public.verify_video_report_public(text) is
  'Intentional public verification RPC. Returns verification metadata for a caller-supplied public verification code.';

commit;
