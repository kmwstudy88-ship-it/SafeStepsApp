-- External report delivery challenge V1.

create table public.case_report_delivery_challenges (
 id uuid primary key default gen_random_uuid(),
 case_id uuid not null references public.reunification_cases(id) on delete restrict,
 release_event_id uuid not null references public.case_report_release_events(id) on delete restrict,
 recipient_id uuid not null references public.report_recipients(id) on delete restrict,
 token_hash text not null unique,
 code_hash text not null,
 expires_at timestamptz not null,
 failed_attempts integer not null default 0 check(failed_attempts between 0 and 5),
 max_downloads integer not null default 1 check(max_downloads between 1 and 10),
 download_count integer not null default 0 check(download_count>=0),
 disabled_at timestamptz,
 revoked_at timestamptz,
 revoked_by uuid references auth.users(id) on delete restrict,
 created_by uuid not null references auth.users(id) on delete restrict,
 created_at timestamptz not null default now(),
 constraint delivery_challenge_expiry check(expires_at>created_at)
);
create table public.case_report_delivery_attempts (
 id uuid primary key default gen_random_uuid(),
 challenge_id uuid not null references public.case_report_delivery_challenges(id) on delete restrict,
 outcome text not null check(outcome in ('code_failed','disabled','expired','revoked','limit_reached','allowed')),
 occurred_at timestamptz not null default now()
);
alter table public.case_report_delivery_challenges enable row level security;
alter table public.case_report_delivery_attempts enable row level security;
revoke all on public.case_report_delivery_challenges,public.case_report_delivery_attempts from public,anon;
grant select,insert on public.case_report_delivery_challenges to authenticated;
grant select on public.case_report_delivery_attempts to authenticated;
create policy delivery_challenges_staff_select on public.case_report_delivery_challenges for select to authenticated using(
 public.user_has_active_case_membership(case_id)
 and public.user_has_case_role(case_id,array['supervisor','admin']::text[]));
create policy delivery_challenges_staff_insert on public.case_report_delivery_challenges for insert to authenticated with check(
 created_by=(select auth.uid()) and public.user_has_active_case_membership(case_id)
 and public.user_has_case_role(case_id,array['supervisor','admin']::text[]));
create policy delivery_attempts_staff_select on public.case_report_delivery_attempts for select to authenticated using(
 exists(select 1 from public.case_report_delivery_challenges c where c.id=challenge_id
 and public.user_has_active_case_membership(c.case_id)
 and public.user_has_case_role(c.case_id,array['supervisor','admin']::text[])));
create index delivery_challenges_case_created_idx on public.case_report_delivery_challenges(case_id,created_at desc);
create index delivery_attempts_challenge_time_idx on public.case_report_delivery_attempts(challenge_id,occurred_at desc);

create or replace function public.prepare_case_report_delivery(
 p_case_id uuid,p_release_event_id uuid,p_recipient_id uuid,
 p_expires_minutes integer default 60,p_max_downloads integer default 1
) returns table(challenge_id uuid,delivery_token text,verification_code text,expires_at timestamptz)
language plpgsql security invoker set search_path=public as $$
declare rel public.case_report_release_events%rowtype; rec public.report_recipients%rowtype;
 raw_token text; raw_code text;
begin
 if p_expires_minutes<5 or p_expires_minutes>1440 then raise exception 'Challenge expiry must be 5 minutes to 24 hours'; end if;
 if p_max_downloads<1 or p_max_downloads>10 then raise exception 'Download limit must be 1 to 10'; end if;
 if not public.user_has_active_case_membership(p_case_id)
  or not public.user_has_case_role(p_case_id,array['supervisor','admin']::text[]) then
  raise exception 'Report delivery preparation denied';
 end if;
 select * into rel from public.case_report_release_events where id=p_release_event_id and case_id=p_case_id;
 select * into rec from public.report_recipients where id=p_recipient_id and report_id=rel.report_id
  and report_version=rel.report_version and released_at is not null and revoked_at is null
  and (access_expires_at is null or access_expires_at>now());
 if rel.id is null or rec.id is null then raise exception 'Active released recipient record required'; end if;
 raw_token:=encode(gen_random_bytes(24),'hex');
 raw_code:=lpad((floor(random()*1000000)::integer)::text,6,'0');
 return query insert into public.case_report_delivery_challenges(
  case_id,release_event_id,recipient_id,token_hash,code_hash,expires_at,max_downloads,created_by
 ) values(p_case_id,rel.id,rec.id,encode(digest(raw_token,'sha256'),'hex'),
  encode(digest(raw_code,'sha256'),'hex'),now()+make_interval(mins=>p_expires_minutes),
  p_max_downloads,(select auth.uid()))
 returning id,raw_token,raw_code,case_report_delivery_challenges.expires_at;
end $$;
revoke all on function public.prepare_case_report_delivery(uuid,uuid,uuid,integer,integer) from public,anon;
grant execute on function public.prepare_case_report_delivery(uuid,uuid,uuid,integer,integer) to authenticated;

create or replace function public.consume_case_report_delivery(p_token text,p_code text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare c public.case_report_delivery_challenges%rowtype; rel public.case_report_release_events%rowtype;
 rf public.report_rendered_files%rowtype; outcome text;
begin
 select * into c from public.case_report_delivery_challenges
 where token_hash=encode(digest(coalesce(p_token,''),'sha256'),'hex') for update;
 if c.id is null then return jsonb_build_object('allowed',false); end if;
 if c.revoked_at is not null then outcome:='revoked';
 elsif c.disabled_at is not null then outcome:='disabled';
 elsif c.expires_at<=now() then outcome:='expired';
 elsif c.download_count>=c.max_downloads then outcome:='limit_reached';
 elsif c.code_hash<>encode(digest(coalesce(p_code,''),'sha256'),'hex') then
  update public.case_report_delivery_challenges set failed_attempts=least(5,failed_attempts+1),
   disabled_at=case when failed_attempts+1>=5 then now() else disabled_at end where id=c.id;
  outcome:=case when c.failed_attempts+1>=5 then 'disabled' else 'code_failed' end;
 else outcome:='allowed';
 end if;
 insert into public.case_report_delivery_attempts(challenge_id,outcome) values(c.id,outcome);
 if outcome<>'allowed' then return jsonb_build_object('allowed',false); end if;
 select * into rel from public.case_report_release_events where id=c.release_event_id;
 if exists(select 1 from public.report_withdrawals w where w.report_id=rel.report_id and w.report_version=rel.report_version) then
  return jsonb_build_object('allowed',false);
 end if;
 select * into rf from public.report_rendered_files where id=rel.rendered_file_id;
 update public.case_report_delivery_challenges set download_count=download_count+1 where id=c.id;
 return jsonb_build_object('allowed',true,'bucket',rf.storage_bucket,'path',rf.storage_path,
  'fileSha256',rf.file_hash_sha256,'reportVersion',rel.report_version,'expiresIn',600);
end $$;
revoke all on function public.consume_case_report_delivery(text,text) from public;
grant execute on function public.consume_case_report_delivery(text,text) to anon,authenticated;
