-- Preserve the parent's submitted withdrawal reason and fail closed when
-- the caller does not own an active parent-consent authority record.

create or replace function public.withdraw_parent_video_report_consent(
  target_authority_id uuid,
  withdrawal_reason text
)
returns public.video_report_access_authorities
language plpgsql
security definer
set search_path = ''
as $function$
declare
  authority_row public.video_report_access_authorities;
  submitted_reason text := pg_catalog.btrim(withdrawal_reason);
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if coalesce(submitted_reason, '') = '' then
    raise exception 'Withdrawal reason is required';
  end if;

  update public.video_report_access_authorities
  set active = false,
      withdrawn_at = pg_catalog.now(),
      withdrawn_by = auth.uid(),
      withdrawal_reason = submitted_reason,
      updated_at = pg_catalog.now()
  where id = target_authority_id
    and parent_user_id = auth.uid()
    and authority_type = 'parent_consent'
    and active = true
  returning * into authority_row;

  if authority_row.id is null then
    raise exception 'Active parent consent not found or not authorised';
  end if;

  update public.video_report_access_grants as grant_row
  set active = false,
      updated_at = pg_catalog.now()
  where grant_row.parent_user_id = authority_row.parent_user_id
    and grant_row.reviewer_user_id = authority_row.authorised_user_id
    and grant_row.access_scope = authority_row.access_scope
    and not exists (
      select 1
      from public.video_report_access_authorities as other_authority
      where other_authority.parent_user_id = authority_row.parent_user_id
        and other_authority.authorised_user_id = authority_row.authorised_user_id
        and other_authority.access_scope = authority_row.access_scope
        and other_authority.active = true
        and other_authority.id <> authority_row.id
    );

  return authority_row;
end;
$function$;
