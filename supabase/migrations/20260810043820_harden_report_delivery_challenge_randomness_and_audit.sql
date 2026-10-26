-- Harden external report delivery code generation and denial auditing.

alter table public.case_report_delivery_attempts
  drop constraint case_report_delivery_attempts_outcome_check;

alter table public.case_report_delivery_attempts
  add constraint case_report_delivery_attempts_outcome_check
  check (outcome in (
    'code_failed','disabled','expired','revoked','limit_reached',
    'withdrawn','unavailable','allowed'
  ));

create or replace function public.prepare_case_report_delivery(
  p_case_id uuid,
  p_release_event_id uuid,
  p_recipient_id uuid,
  p_expires_minutes integer default 60,
  p_max_downloads integer default 1
) returns table(
  challenge_id uuid,
  delivery_token text,
  verification_code text,
  expires_at timestamptz
)
language plpgsql
security invoker
set search_path=public
as $$
declare
  rel public.case_report_release_events%rowtype;
  rec public.report_recipients%rowtype;
  raw_token text;
  raw_code text;
  random_value bigint;
begin
  if p_expires_minutes < 5 or p_expires_minutes > 1440 then
    raise exception 'Challenge expiry must be 5 minutes to 24 hours';
  end if;
  if p_max_downloads < 1 or p_max_downloads > 10 then
    raise exception 'Download limit must be 1 to 10';
  end if;
  if not public.user_has_active_case_membership(p_case_id)
    or not public.user_has_case_role(p_case_id,array['supervisor','admin']::text[]) then
    raise exception 'Report delivery preparation denied';
  end if;

  select * into rel
  from public.case_report_release_events
  where id=p_release_event_id and case_id=p_case_id;

  select * into rec
  from public.report_recipients
  where id=p_recipient_id
    and report_id=rel.report_id
    and report_version=rel.report_version
    and released_at is not null
    and revoked_at is null
    and (access_expires_at is null or access_expires_at>now());

  if rel.id is null or rec.id is null then
    raise exception 'Active released recipient record required';
  end if;

  raw_token:=encode(gen_random_bytes(24),'hex');
  loop
    random_value:=('x'||encode(gen_random_bytes(4),'hex'))::bit(32)::bigint;
    exit when random_value<4294000000;
  end loop;
  raw_code:=lpad((random_value%1000000)::text,6,'0');

  return query
  insert into public.case_report_delivery_challenges(
    case_id,release_event_id,recipient_id,token_hash,code_hash,
    expires_at,max_downloads,created_by
  ) values(
    p_case_id,rel.id,rec.id,
    encode(digest(raw_token,'sha256'),'hex'),
    encode(digest(raw_code,'sha256'),'hex'),
    now()+make_interval(mins=>p_expires_minutes),
    p_max_downloads,(select auth.uid())
  )
  returning id,raw_token,raw_code,case_report_delivery_challenges.expires_at;
end
$$;

create or replace function public.consume_case_report_delivery(
  p_token text,
  p_code text
) returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  c public.case_report_delivery_challenges%rowtype;
  rel public.case_report_release_events%rowtype;
  rf public.report_rendered_files%rowtype;
  outcome text;
begin
  select * into c
  from public.case_report_delivery_challenges
  where token_hash=encode(digest(coalesce(p_token,''),'sha256'),'hex')
  for update;

  if c.id is null then
    return jsonb_build_object('allowed',false);
  end if;

  if c.revoked_at is not null then outcome:='revoked';
  elsif c.disabled_at is not null then outcome:='disabled';
  elsif c.expires_at<=now() then outcome:='expired';
  elsif c.download_count>=c.max_downloads then outcome:='limit_reached';
  elsif c.code_hash<>encode(digest(coalesce(p_code,''),'sha256'),'hex') then
    update public.case_report_delivery_challenges
    set failed_attempts=least(5,failed_attempts+1),
      disabled_at=case when failed_attempts+1>=5 then now() else disabled_at end
    where id=c.id;
    outcome:=case when c.failed_attempts+1>=5 then 'disabled' else 'code_failed' end;
  else
    select * into rel
    from public.case_report_release_events
    where id=c.release_event_id;

    if rel.id is null then
      outcome:='unavailable';
    elsif exists(
      select 1 from public.report_withdrawals w
      where w.report_id=rel.report_id and w.report_version=rel.report_version
    ) then
      outcome:='withdrawn';
    else
      select * into rf
      from public.report_rendered_files
      where id=rel.rendered_file_id;
      if rf.id is null or rf.storage_bucket is null or rf.storage_path is null then
        outcome:='unavailable';
      else
        outcome:='allowed';
      end if;
    end if;
  end if;

  insert into public.case_report_delivery_attempts(challenge_id,outcome)
  values(c.id,outcome);

  if outcome<>'allowed' then
    return jsonb_build_object('allowed',false);
  end if;

  update public.case_report_delivery_challenges
  set download_count=download_count+1
  where id=c.id;

  return jsonb_build_object(
    'allowed',true,
    'bucket',rf.storage_bucket,
    'path',rf.storage_path,
    'fileSha256',rf.file_hash_sha256,
    'reportVersion',rel.report_version,
    'expiresIn',600
  );
end
$$;

revoke all on function public.prepare_case_report_delivery(uuid,uuid,uuid,integer,integer)
  from public,anon;
grant execute on function public.prepare_case_report_delivery(uuid,uuid,uuid,integer,integer)
  to authenticated;
revoke all on function public.consume_case_report_delivery(text,text) from public;
grant execute on function public.consume_case_report_delivery(text,text) to anon,authenticated;
