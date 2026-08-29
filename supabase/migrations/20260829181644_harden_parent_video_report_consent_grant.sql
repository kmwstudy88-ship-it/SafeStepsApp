create or replace function public.grant_parent_video_report_consent(
  target_authorised_user_id uuid,
  access_scope text,
  authority_label text,
  expires_at timestamptz default null
)
returns public.video_report_access_authorities
language plpgsql
security definer
set search_path = ''
as $function$
declare
  caller_user_id uuid := auth.uid();
  submitted_label text := pg_catalog.btrim(authority_label);
  effective_expires_at timestamptz := coalesce(expires_at, pg_catalog.now() + interval '90 days');
  authority_row public.video_report_access_authorities;
begin
  if caller_user_id is null then
    raise exception 'Authentication required';
  end if;

  if target_authorised_user_id is null or target_authorised_user_id = caller_user_id then
    raise exception 'A different authorised recipient is required';
  end if;

  if access_scope not in ('video_progress', 'video_progress_and_evidence') then
    raise exception 'Unsupported access scope';
  end if;

  if coalesce(submitted_label, '') = '' then
    raise exception 'Authority label is required';
  end if;

  if pg_catalog.length(submitted_label) > 200 then
    raise exception 'Authority label must be 200 characters or fewer';
  end if;

  if effective_expires_at <= pg_catalog.now() then
    raise exception 'Consent expiry must be in the future';
  end if;

  if effective_expires_at > pg_catalog.now() + interval '90 days' then
    raise exception 'Consent expiry cannot exceed 90 days';
  end if;

  if not exists (
    select 1
    from auth.users as recipient
    where recipient.id = target_authorised_user_id
      and recipient.deleted_at is null
      and recipient.confirmed_at is not null
      and (recipient.banned_until is null or recipient.banned_until <= pg_catalog.now())
  ) then
    raise exception 'Authorised recipient must be an active confirmed SafeSteps account';
  end if;

  insert into public.video_report_access_authorities (
    parent_user_id,
    authorised_user_id,
    access_scope,
    authority_type,
    authority_label,
    expires_at,
    created_by
  )
  values (
    caller_user_id,
    target_authorised_user_id,
    access_scope,
    'parent_consent',
    submitted_label,
    effective_expires_at,
    caller_user_id
  )
  returning * into authority_row;

  insert into public.video_report_access_grants (
    parent_user_id,
    reviewer_user_id,
    parent_display_label,
    access_scope,
    expires_at,
    reason,
    granted_by
  )
  values (
    caller_user_id,
    target_authorised_user_id,
    submitted_label,
    access_scope,
    effective_expires_at,
    'Parent consent-based video report sharing',
    caller_user_id
  )
  on conflict (parent_user_id, reviewer_user_id, access_scope) do update
  set parent_display_label = excluded.parent_display_label,
      active = true,
      expires_at = excluded.expires_at,
      reason = excluded.reason,
      granted_by = excluded.granted_by,
      updated_at = pg_catalog.now();

  return authority_row;
end;
$function$;
