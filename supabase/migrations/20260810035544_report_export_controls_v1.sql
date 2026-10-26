-- Report export controls V1: authorised recipients, time-limited requests and append-only audit.

create table public.case_report_export_events (
 id uuid primary key default gen_random_uuid(),
 case_id uuid not null references public.reunification_cases(id) on delete restrict,
 release_event_id uuid not null references public.case_report_release_events(id) on delete restrict,
 report_id uuid not null references public.reports(id) on delete restrict,
 report_version integer not null,
 recipient_id uuid not null references public.report_recipients(id) on delete restrict,
 rendered_file_id uuid not null references public.report_rendered_files(id) on delete restrict,
 requested_by uuid not null references auth.users(id) on delete restrict,
 authority text not null,
 purpose text not null,
 action text not null check (action in ('signed_url_requested','download_confirmed','access_denied')),
 outcome text not null check (outcome in ('allowed','completed','denied')),
 request_reference uuid not null default gen_random_uuid(),
 signed_url_expires_at timestamptz,
 occurred_at timestamptz not null default now()
);

alter table public.case_report_export_events enable row level security;
revoke all on public.case_report_export_events from public, anon;
revoke update, delete on public.case_report_export_events from authenticated;
grant select, insert on public.case_report_export_events to authenticated;

create policy case_report_export_events_select on public.case_report_export_events
for select to authenticated using (
 public.user_has_active_case_membership(case_id)
 and public.user_has_case_role(case_id,array['supervisor','admin','court_viewer']::text[])
);
create policy case_report_export_events_insert on public.case_report_export_events
for insert to authenticated with check (
 requested_by=(select auth.uid())
 and public.user_has_active_case_membership(case_id)
);

create index case_report_export_events_case_time_idx
 on public.case_report_export_events(case_id,occurred_at desc);

create or replace function public.request_case_report_export(
 p_case_id uuid,p_release_event_id uuid,p_recipient_id uuid,
 p_authority text,p_purpose text,p_expiry_seconds integer default 600
) returns uuid language plpgsql security invoker set search_path=public as $$
declare rel public.case_report_release_events%rowtype;
 rec public.report_recipients%rowtype;
 event_id uuid;
begin
 if length(trim(coalesce(p_authority,'')))=0 or length(trim(coalesce(p_purpose,'')))=0 then
  raise exception 'Recipient authority and export purpose are required';
 end if;
 if p_expiry_seconds<60 or p_expiry_seconds>600 then
  raise exception 'Sensitive report links must expire within 1 to 10 minutes';
 end if;
 select * into rel from public.case_report_release_events
 where id=p_release_event_id and case_id=p_case_id;
 if rel.id is null then raise exception 'Released report version not found'; end if;
 select * into rec from public.report_recipients
 where id=p_recipient_id and report_id=rel.report_id and report_version=rel.report_version
   and released_at is not null and revoked_at is null
   and (access_expires_at is null or access_expires_at>now())
   and (recipient_user_id=(select auth.uid())
     or public.user_has_case_role(p_case_id,array['supervisor','admin']::text[]));
 if rec.id is null then raise exception 'Recipient is not authorised for this released version'; end if;
 if rec.release_purpose<>p_purpose then raise exception 'Export purpose does not match approved recipient purpose'; end if;
 if exists(select 1 from public.report_withdrawals w
   where w.report_id=rel.report_id and w.report_version=rel.report_version) then
  raise exception 'Withdrawn report versions cannot be exported';
 end if;
 if not public.user_has_active_case_membership(p_case_id) then
  raise exception 'Active case membership is required';
 end if;
 insert into public.case_report_export_events(
  case_id,release_event_id,report_id,report_version,recipient_id,rendered_file_id,
  requested_by,authority,purpose,action,outcome,signed_url_expires_at
 ) values(
  p_case_id,rel.id,rel.report_id,rel.report_version,rec.id,rel.rendered_file_id,
  (select auth.uid()),trim(p_authority),trim(p_purpose),
  'signed_url_requested','allowed',now()+make_interval(secs=>p_expiry_seconds)
 ) returning id into event_id;
 return event_id;
end $$;
revoke all on function public.request_case_report_export(uuid,uuid,uuid,text,text,integer) from public,anon;
grant execute on function public.request_case_report_export(uuid,uuid,uuid,text,text,integer) to authenticated;

create or replace function public.request_case_report_correction(
 p_case_id uuid,p_report_id uuid,p_correction_type text,p_description text,p_material_change boolean
) returns uuid language plpgsql security invoker set search_path=public as $$
declare r public.reports%rowtype; correction_id uuid;
begin
 if length(trim(coalesce(p_description,'')))=0 then raise exception 'Correction details are required'; end if;
 if not public.user_has_active_case_membership(p_case_id)
  or not public.user_has_case_role(p_case_id,array['caseworker','supervisor','admin']::text[]) then
  raise exception 'Report correction access denied';
 end if;
 select * into r from public.reports where id=p_report_id and reunification_case_id=p_case_id;
 if r.id is null or r.status not in ('released','withdrawn','superseded') then
  raise exception 'Corrections apply only to an existing released history';
 end if;
 insert into public.report_corrections(
  report_id,affected_version,correction_type,correction_description,requested_by,status,material_change
 ) values(
  r.id,r.current_version,p_correction_type,trim(p_description),(select auth.uid()),'requested',p_material_change
 ) returning id into correction_id;
 return correction_id;
end $$;
revoke all on function public.request_case_report_correction(uuid,uuid,text,text,boolean) from public,anon;
grant execute on function public.request_case_report_correction(uuid,uuid,text,text,boolean) to authenticated;

grant select,insert on public.report_corrections to authenticated;
create policy report_corrections_reunification_read on public.report_corrections
for select to authenticated using(exists(select 1 from public.reports r where r.id=report_id
 and public.user_has_active_case_membership(r.reunification_case_id)
 and public.user_has_case_role(r.reunification_case_id,array['caseworker','supervisor','admin']::text[])));
create policy report_corrections_reunification_insert on public.report_corrections
for insert to authenticated with check(requested_by=(select auth.uid()) and exists(
 select 1 from public.reports r where r.id=report_id
 and public.user_has_active_case_membership(r.reunification_case_id)
 and public.user_has_case_role(r.reunification_case_id,array['caseworker','supervisor','admin']::text[])
));
