-- SafeSteps production access control and sensitive action audit.
-- Route guards are convenience only. These database rules are the security backstop.

create extension if not exists pgcrypto;

create table if not exists public.case_memberships (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.reunification_cases(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  membership_role text not null check (membership_role in (
    'case_owner','child','parent','facilitator','caseworker','supervisor','clinician',
    'court_viewer','carer','advocate','admin'
  )),
  status text not null default 'active' check (status in ('active','suspended','revoked')),
  granted_by uuid references auth.users(id),
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  unique(case_id, user_id, membership_role)
);

create index if not exists idx_case_memberships_user_active
  on public.case_memberships(user_id, status, case_id);
create index if not exists idx_case_memberships_case_active
  on public.case_memberships(case_id, status, membership_role);

alter table public.case_memberships enable row level security;

create or replace function public.current_security_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  with role_values as (
    select ur.role::text as role
    from public.user_roles ur
    where ur.user_id = auth.uid()
    union all
    select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')
  )
  select coalesce(
    (select role from role_values
      where role in ('super_admin','admin','supervisor','clinician','caseworker','facilitator','court_viewer','advocate','carer','child','parent')
      order by case role
        when 'super_admin' then 1 when 'admin' then 2 when 'supervisor' then 3
        when 'clinician' then 4 when 'caseworker' then 5 when 'facilitator' then 6
        when 'court_viewer' then 7 when 'advocate' then 8 when 'carer' then 9
        when 'child' then 10 else 11 end
      limit 1),
    ''
  );
$$;

create or replace function public.user_has_active_case_membership(target_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.case_memberships cm
    where cm.case_id = target_case_id
      and cm.user_id = auth.uid()
      and cm.status = 'active'
  );
$$;

create or replace function public.user_has_case_role(target_case_id uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.case_memberships cm
    where cm.case_id = target_case_id
      and cm.user_id = auth.uid()
      and cm.status = 'active'
      and cm.membership_role = any(allowed_roles)
  );
$$;

create or replace function public.get_my_case_access_grant(target_case_id uuid)
returns table(membership_role text, case_status text)
language sql
stable
security definer
set search_path = public
as $$
  select cm.membership_role, rc.status
  from public.case_memberships cm
  join public.reunification_cases rc on rc.id = cm.case_id
  where cm.case_id = target_case_id
    and cm.user_id = auth.uid()
    and cm.status = 'active'
  order by case cm.membership_role
    when 'admin' then 1 when 'supervisor' then 2 when 'clinician' then 3
    when 'caseworker' then 4 when 'facilitator' then 5 when 'court_viewer' then 6
    when 'advocate' then 7 when 'carer' then 8 when 'case_owner' then 9
    when 'parent' then 10 else 11 end
  limit 1;
$$;

grant execute on function public.get_my_case_access_grant(uuid) to authenticated;

-- Backfill canonical case relationships. Child memberships remain explicit because the
-- existing child privacy model did not carry a case_id and must not be guessed.
insert into public.case_memberships(case_id, user_id, membership_role, status)
select id, owner_id, 'case_owner', 'active'
from public.reunification_cases
where owner_id is not null
on conflict do nothing;

insert into public.case_memberships(case_id, user_id, membership_role, status)
select id, parent_user_id, 'parent', 'active'
from public.reunification_cases
where parent_user_id is not null
on conflict do nothing;

insert into public.case_memberships(case_id, user_id, membership_role, status)
select id, worker_user_id, 'caseworker', 'active'
from public.reunification_cases
where worker_user_id is not null
on conflict do nothing;

-- Case-bind data that previously relied only on owner/relationship fields.
alter table public.evidence_items add column if not exists case_id uuid references public.reunification_cases(id) on delete cascade;
alter table public.parent_child_messages add column if not exists case_id uuid references public.reunification_cases(id) on delete cascade;
alter table public.child_profiles add column if not exists case_id uuid references public.reunification_cases(id) on delete cascade;

with single_case as (
  select user_id, min(case_id) as case_id
  from public.case_memberships
  where status = 'active' and membership_role in ('case_owner','parent')
  group by user_id
  having count(distinct case_id) = 1
)
update public.evidence_items e
set case_id = sc.case_id
from single_case sc
where e.owner_id = sc.user_id and e.case_id is null;

create index if not exists idx_evidence_items_case_created on public.evidence_items(case_id, created_at desc);
create index if not exists idx_parent_child_messages_case_created on public.parent_child_messages(case_id, created_at desc);
create index if not exists idx_child_profiles_case on public.child_profiles(case_id, child_user_id);

-- Membership table is visible only to the member and case administrators/supervisors.
drop policy if exists case_memberships_select on public.case_memberships;
create policy case_memberships_select on public.case_memberships
for select to authenticated
using (
  user_id = (select auth.uid())
  or public.user_has_case_role(case_id, array['admin','supervisor']::text[])
);

drop policy if exists case_memberships_manage on public.case_memberships;
create policy case_memberships_manage on public.case_memberships
for all to authenticated
using (public.user_has_case_role(case_id, array['admin','supervisor']::text[]))
with check (public.user_has_case_role(case_id, array['admin','supervisor']::text[]));

-- Evidence: parent sees own case evidence; assigned staff see case evidence. No case_id = no case access.
drop policy if exists "Evidence is visible to owners" on public.evidence_items;
drop policy if exists "Evidence can be created by owners" on public.evidence_items;
drop policy if exists "Evidence can be updated by owners" on public.evidence_items;
drop policy if exists evidence_case_select on public.evidence_items;
create policy evidence_case_select on public.evidence_items for select to authenticated using (
  case_id is not null
  and public.user_has_active_case_membership(case_id)
  and (
    owner_id = (select auth.uid())
    or public.user_has_case_role(case_id, array['facilitator','caseworker','supervisor','clinician','admin']::text[])
  )
);
drop policy if exists evidence_case_insert on public.evidence_items;
create policy evidence_case_insert on public.evidence_items for insert to authenticated with check (
  case_id is not null
  and owner_id = (select auth.uid())
  and public.user_has_active_case_membership(case_id)
  and public.user_has_case_role(case_id, array['case_owner','parent','facilitator','caseworker','supervisor','clinician','admin']::text[])
);
drop policy if exists evidence_case_update on public.evidence_items;
create policy evidence_case_update on public.evidence_items for update to authenticated using (
  case_id is not null and public.user_has_active_case_membership(case_id)
  and (owner_id = (select auth.uid()) or public.user_has_case_role(case_id, array['caseworker','supervisor','clinician','admin']::text[]))
) with check (
  case_id is not null and public.user_has_active_case_membership(case_id)
  and (owner_id = (select auth.uid()) or public.user_has_case_role(case_id, array['caseworker','supervisor','clinician','admin']::text[]))
);

-- Assessment records: parents can read their case; assessment mutations are staff-only.
drop policy if exists assessment_records_select on public.assessment_records;
create policy assessment_records_select on public.assessment_records for select to authenticated using (
  public.user_has_active_case_membership(case_id)
  and public.user_has_case_role(case_id, array['case_owner','parent','facilitator','caseworker','supervisor','clinician','admin']::text[])
);
drop policy if exists assessment_records_insert on public.assessment_records;
create policy assessment_records_insert on public.assessment_records for insert to authenticated with check (
  public.user_has_case_role(case_id, array['caseworker','supervisor','clinician','admin']::text[])
);
drop policy if exists assessment_records_update on public.assessment_records;
create policy assessment_records_update on public.assessment_records for update to authenticated using (
  public.user_has_case_role(case_id, array['caseworker','supervisor','clinician','admin']::text[])
) with check (
  public.user_has_case_role(case_id, array['caseworker','supervisor','clinician','admin']::text[])
);

-- Sessions, documents, referrals: active case membership is mandatory.
drop policy if exists case_sessions_select on public.case_sessions;
create policy case_sessions_select on public.case_sessions for select to authenticated using (
  public.user_has_active_case_membership(case_id)
  and public.user_has_case_role(case_id, array['case_owner','parent','facilitator','caseworker','supervisor','clinician','admin']::text[])
);
drop policy if exists case_sessions_insert on public.case_sessions;
create policy case_sessions_insert on public.case_sessions for insert to authenticated with check (
  public.user_has_case_role(case_id, array['facilitator','caseworker','supervisor','clinician','admin']::text[])
);
drop policy if exists case_sessions_update on public.case_sessions;
create policy case_sessions_update on public.case_sessions for update to authenticated using (
  public.user_has_case_role(case_id, array['facilitator','caseworker','supervisor','clinician','admin']::text[])
) with check (public.user_has_case_role(case_id, array['facilitator','caseworker','supervisor','clinician','admin']::text[]));

drop policy if exists case_documents_select on public.case_documents;
create policy case_documents_select on public.case_documents for select to authenticated using (
  public.user_has_active_case_membership(case_id)
  and public.user_has_case_role(case_id, array['case_owner','parent','facilitator','caseworker','supervisor','clinician','admin']::text[])
);
drop policy if exists case_documents_insert on public.case_documents;
create policy case_documents_insert on public.case_documents for insert to authenticated with check (
  public.user_has_case_role(case_id, array['case_owner','parent','facilitator','caseworker','supervisor','clinician','admin']::text[])
);
drop policy if exists case_documents_update on public.case_documents;
create policy case_documents_update on public.case_documents for update to authenticated using (
  public.user_has_case_role(case_id, array['caseworker','supervisor','clinician','admin']::text[])
) with check (public.user_has_case_role(case_id, array['caseworker','supervisor','clinician','admin']::text[]));

drop policy if exists case_referrals_case_rows on public.case_service_referrals;
create policy case_referrals_case_rows on public.case_service_referrals for all to authenticated using (
  public.user_has_active_case_membership(case_id)
  and public.user_has_case_role(case_id, array['case_owner','parent','facilitator','caseworker','supervisor','clinician','advocate','admin']::text[])
) with check (
  public.user_has_case_role(case_id, array['facilitator','caseworker','supervisor','clinician','advocate','admin']::text[])
);

-- Parent-child messages require both a case grant and the existing child/parent audience relationship.
drop policy if exists parent_child_messages_select on public.parent_child_messages;
create policy parent_child_messages_select on public.parent_child_messages for select to authenticated using (
  case_id is not null and public.user_has_active_case_membership(case_id) and (
    (child_user_id = (select auth.uid()) and visible_to_child)
    or (parent_user_id = (select auth.uid()) and visible_to_parent and share_audience in ('parent','both'))
    or (caseworker_user_id = (select auth.uid()) and share_audience in ('caseworker','both'))
    or public.user_has_case_role(case_id, array['supervisor','admin']::text[])
  )
);
drop policy if exists parent_child_messages_insert on public.parent_child_messages;
create policy parent_child_messages_insert on public.parent_child_messages for insert to authenticated with check (
  case_id is not null
  and sender_user_id = (select auth.uid())
  and public.user_has_active_case_membership(case_id)
  and (
    (sender_role = 'child' and child_user_id = (select auth.uid()) and public.user_has_case_role(case_id, array['child']::text[]))
    or (sender_role = 'parent' and parent_user_id = (select auth.uid()) and public.user_has_case_role(case_id, array['case_owner','parent']::text[]))
    or (sender_role = 'caseworker' and public.user_has_case_role(case_id, array['caseworker','supervisor','admin']::text[]))
  )
);
drop policy if exists parent_child_messages_update on public.parent_child_messages;
create policy parent_child_messages_update on public.parent_child_messages for update to authenticated using (
  case_id is not null and public.user_has_case_role(case_id, array['caseworker','supervisor','admin']::text[])
) with check (case_id is not null and public.user_has_case_role(case_id, array['caseworker','supervisor','admin']::text[]));

-- Child-private records stay separate from parent/worker records.
create or replace function public.user_can_view_child_private(target_child_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_child_user_id = auth.uid()
  or exists (
    select 1 from public.child_profiles cp
    where cp.child_user_id = target_child_user_id
      and cp.case_id is not null
      and public.user_has_case_role(cp.case_id, array['caseworker','supervisor','clinician','admin']::text[])
  );
$$;

drop policy if exists child_feelings_select on public.child_feelings_checkins;
create policy child_feelings_select on public.child_feelings_checkins for select to authenticated using (public.user_can_view_child_private(child_user_id));
drop policy if exists child_tasks_select on public.child_tasks;
create policy child_tasks_select on public.child_tasks for select to authenticated using (public.user_can_view_child_private(child_user_id));
drop policy if exists child_evidence_select on public.child_evidence;
create policy child_evidence_select on public.child_evidence for select to authenticated using (public.user_can_view_child_private(child_user_id));
drop policy if exists child_lessons_progress_select on public.child_lessons_progress;
create policy child_lessons_progress_select on public.child_lessons_progress for select to authenticated using (public.user_can_view_child_private(child_user_id));
drop policy if exists child_visit_preparations_select on public.child_visit_preparations;
create policy child_visit_preparations_select on public.child_visit_preparations for select to authenticated using (public.user_can_view_child_private(child_user_id));
drop policy if exists child_visit_reflections_select on public.child_visit_reflections;
create policy child_visit_reflections_select on public.child_visit_reflections for select to authenticated using (public.user_can_view_child_private(child_user_id));
drop policy if exists child_safe_people_select on public.child_safe_people;
create policy child_safe_people_select on public.child_safe_people for select to authenticated using (public.user_can_view_child_private(child_user_id));

-- Append-only platform audit. Direct authenticated inserts are not granted; use the RPC.
create table if not exists public.sensitive_action_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  actor_role text not null,
  case_id uuid references public.reunification_cases(id) on delete restrict,
  action text not null check (action in ('view_report','upload_evidence','edit_assessment','accept_ai_finding','export_document')),
  resource_type text not null,
  resource_id uuid,
  outcome text not null default 'succeeded' check (outcome in ('allowed','denied','succeeded','failed')),
  metadata jsonb not null default '{}'::jsonb,
  request_id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create index if not exists idx_sensitive_audit_case_created on public.sensitive_action_audit_log(case_id, created_at desc);
create index if not exists idx_sensitive_audit_actor_created on public.sensitive_action_audit_log(actor_user_id, created_at desc);
alter table public.sensitive_action_audit_log enable row level security;

create or replace function public.reject_sensitive_audit_mutation()
returns trigger language plpgsql security invoker as $$
begin
  raise exception 'sensitive_action_audit_log is append-only';
end;
$$;
drop trigger if exists sensitive_audit_no_update on public.sensitive_action_audit_log;
create trigger sensitive_audit_no_update before update on public.sensitive_action_audit_log for each row execute function public.reject_sensitive_audit_mutation();
drop trigger if exists sensitive_audit_no_delete on public.sensitive_action_audit_log;
create trigger sensitive_audit_no_delete before delete on public.sensitive_action_audit_log for each row execute function public.reject_sensitive_audit_mutation();

drop policy if exists sensitive_audit_select on public.sensitive_action_audit_log;
create policy sensitive_audit_select on public.sensitive_action_audit_log for select to authenticated using (
  actor_user_id = (select auth.uid())
  or (case_id is not null and public.user_has_case_role(case_id, array['supervisor','admin']::text[]))
);

create or replace function public.record_sensitive_action(
  target_case_id uuid,
  target_action text,
  target_resource_type text,
  target_resource_id uuid default null,
  target_outcome text default 'succeeded',
  target_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
  forbidden_keys text[] := array['body','message_text','assessment_answers','answers','notes','file_content','transcript','transcript_text','response','responses'];
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if target_action not in ('view_report','upload_evidence','edit_assessment','accept_ai_finding','export_document') then raise exception 'unsupported sensitive audit action'; end if;
  if target_outcome not in ('allowed','denied','succeeded','failed') then raise exception 'unsupported audit outcome'; end if;
  if target_metadata ?| forbidden_keys then raise exception 'sensitive content is not permitted in audit metadata'; end if;
  if octet_length(target_metadata::text) > 8192 then raise exception 'audit metadata exceeds 8KB'; end if;

  insert into public.sensitive_action_audit_log(
    actor_user_id, actor_role, case_id, action, resource_type, resource_id, outcome, metadata
  ) values (
    auth.uid(), public.current_security_role(), target_case_id, target_action,
    left(target_resource_type, 100), target_resource_id, target_outcome, target_metadata
  ) returning id into new_id;
  return new_id;
end;
$$;

grant execute on function public.record_sensitive_action(uuid,text,text,uuid,text,jsonb) to authenticated;
revoke insert, update, delete on public.sensitive_action_audit_log from authenticated;
