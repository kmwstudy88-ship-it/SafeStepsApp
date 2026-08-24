begin;

create table if not exists public.personal_ai_flow_versions (
  id uuid primary key default gen_random_uuid(),
  flow_id text not null,
  version text not null check (version ~ '^[0-9]+\.[0-9]+\.[0-9]+(?:-[a-z0-9.-]+)?$'),
  status text not null default 'draft' check (status in ('draft','in_review','approved','active','deprecated','rejected','rolled_back')),
  title text not null,
  risk_level text not null check (risk_level in ('low','medium','high','critical')),
  category text not null,
  trigger_phrases text[] not null default '{}',
  assistant_goal text not null,
  first_response text not null,
  core_script text[] not null default '{}',
  follow_up_questions text[] not null default '{}',
  escalation_type text not null,
  documentation_template_key text not null,
  safe_reply_template_keys text[] not null default '{}',
  prompt_template_keys text[] not null default '{}',
  ui_copy_keys text[] not null default '{}',
  validator_profile_key text not null,
  jurisdiction_scope text[] not null default '{}',
  effective_from timestamptz,
  effective_to timestamptz,
  change_summary text not null check (char_length(change_summary) between 10 and 1000),
  release_checks jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (flow_id, version),
  check (cardinality(follow_up_questions) <= 1),
  check (risk_level <> 'critical' or cardinality(jurisdiction_scope) > 0)
);

create unique index if not exists personal_ai_one_active_flow_version
  on public.personal_ai_flow_versions(flow_id) where status = 'active';
create index if not exists personal_ai_flow_versions_queue
  on public.personal_ai_flow_versions(status, risk_level, updated_at);

create table if not exists public.personal_ai_flow_version_approvals (
  id uuid primary key default gen_random_uuid(),
  flow_version_id uuid not null references public.personal_ai_flow_versions(id) on delete restrict,
  approver_user_id uuid not null references auth.users(id) on delete restrict,
  approval_role text not null check (approval_role in ('product_owner','safeguarding','clinical','domain_specialist','jurisdiction')),
  decision text not null check (decision in ('approved','rejected')),
  notes text check (char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  unique (flow_version_id, approver_user_id)
);

create table if not exists public.personal_ai_flow_version_audit_logs (
  id uuid primary key default gen_random_uuid(), flow_version_id uuid references public.personal_ai_flow_versions(id) on delete restrict,
  flow_id text not null, previous_version text, new_version text not null,
  action text not null check (action in ('created','submitted_for_review','approved','activated','deprecated','rejected','rolled_back','edited')),
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  reason text check (char_length(reason) <= 1000), metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function private.guard_personal_ai_flow_version_mutation()
returns trigger language plpgsql set search_path = pg_catalog, public, private as $$
begin
  if old.status not in ('draft','in_review') and
     (to_jsonb(new) - array['status','effective_from','effective_to','updated_at']) is distinct from
     (to_jsonb(old) - array['status','effective_from','effective_to','updated_at'])
  then raise exception 'Released flow version content is immutable'; end if;
  if old.status = 'in_review' and (new.flow_id, new.version, new.risk_level) is distinct from (old.flow_id, old.version, old.risk_level) then
    raise exception 'Flow identity and risk cannot change during review';
  end if;
  return new;
end; $$;
drop trigger if exists personal_ai_flow_version_immutable on public.personal_ai_flow_versions;
create trigger personal_ai_flow_version_immutable before update on public.personal_ai_flow_versions
for each row when (old.status not in ('draft','in_review') or old.status = 'in_review') execute function private.guard_personal_ai_flow_version_mutation();

alter table public.personal_ai_flow_versions enable row level security;
alter table public.personal_ai_flow_version_approvals enable row level security;
alter table public.personal_ai_flow_version_audit_logs enable row level security;
revoke all on public.personal_ai_flow_versions, public.personal_ai_flow_version_approvals, public.personal_ai_flow_version_audit_logs from anon, authenticated;
grant select, insert, update on public.personal_ai_flow_versions to authenticated;
grant select, insert on public.personal_ai_flow_version_approvals, public.personal_ai_flow_version_audit_logs to authenticated;

create policy personal_ai_flow_versions_staff_read on public.personal_ai_flow_versions for select to authenticated
using (public.current_user_has_role('admin') or public.current_user_has_role('caseworker'));
create policy personal_ai_flow_versions_admin_insert on public.personal_ai_flow_versions for insert to authenticated
with check (public.current_user_has_role('admin') and created_by = (select auth.uid()) and status = 'draft');
create policy personal_ai_flow_versions_admin_update on public.personal_ai_flow_versions for update to authenticated
using (public.current_user_has_role('admin')) with check (public.current_user_has_role('admin'));
create policy personal_ai_flow_approvals_staff_read on public.personal_ai_flow_version_approvals for select to authenticated
using (public.current_user_has_role('admin') or public.current_user_has_role('caseworker'));
create policy personal_ai_flow_approvals_admin_insert on public.personal_ai_flow_version_approvals for insert to authenticated
with check (public.current_user_has_role('admin') and approver_user_id = (select auth.uid()));
create policy personal_ai_flow_audit_staff_read on public.personal_ai_flow_version_audit_logs for select to authenticated
using (public.current_user_has_role('admin') or public.current_user_has_role('caseworker'));
create policy personal_ai_flow_audit_admin_insert on public.personal_ai_flow_version_audit_logs for insert to authenticated
with check (public.current_user_has_role('admin') and actor_user_id = (select auth.uid()));

create or replace function public.activate_personal_ai_flow_version(target_id uuid, activation_reason text)
returns public.personal_ai_flow_versions language plpgsql security invoker set search_path = pg_catalog, public as $$
declare target public.personal_ai_flow_versions; approval_count integer; prior_version text;
begin
  if not public.current_user_has_role('admin') then raise exception 'Administrator access required'; end if;
  select * into target from public.personal_ai_flow_versions where id = target_id for update;
  if target.status <> 'approved' then raise exception 'Only approved versions can be activated'; end if;
  select count(distinct approver_user_id) into approval_count from public.personal_ai_flow_version_approvals where flow_version_id = target.id and decision = 'approved';
  if approval_count < case when target.risk_level = 'critical' then 2 else 1 end then raise exception 'Required independent approvals are missing'; end if;
  if target.risk_level = 'critical' and not (target.release_checks @> '{"safety_tests":true,"clinical_signoff":true,"safeguarding_signoff":true,"jurisdiction_review":true,"rollback_tested":true}'::jsonb) then raise exception 'Critical release checklist is incomplete'; end if;
  select version into prior_version from public.personal_ai_flow_versions where flow_id = target.flow_id and status = 'active' for update;
  update public.personal_ai_flow_versions set status = 'deprecated', effective_to = now(), updated_at = now() where flow_id = target.flow_id and status = 'active';
  update public.personal_ai_flow_versions set status = 'active', effective_from = now(), effective_to = null, updated_at = now() where id = target.id returning * into target;
  insert into public.personal_ai_flow_version_audit_logs(flow_version_id,flow_id,previous_version,new_version,action,actor_user_id,reason) values(target.id,target.flow_id,prior_version,target.version,'activated',auth.uid(),activation_reason);
  return target;
end; $$;
revoke all on function public.activate_personal_ai_flow_version(uuid,text) from public, anon;
grant execute on function public.activate_personal_ai_flow_version(uuid,text) to authenticated;

create or replace function public.rollback_personal_ai_flow_version(target_id uuid, rollback_reason text)
returns public.personal_ai_flow_versions language plpgsql security invoker set search_path = pg_catalog, public as $$
declare withdrawn public.personal_ai_flow_versions; replacement public.personal_ai_flow_versions;
begin
  if not public.current_user_has_role('admin') then raise exception 'Administrator access required'; end if;
  select * into withdrawn from public.personal_ai_flow_versions where id = target_id and status = 'active' for update;
  if not found then raise exception 'Target is not the active version'; end if;
  select * into replacement from public.personal_ai_flow_versions where flow_id = withdrawn.flow_id and id <> withdrawn.id and status in ('deprecated','approved') order by effective_from desc nulls last, created_at desc limit 1 for update;
  if replacement.id is null then raise exception 'No prior approved version is available'; end if;
  update public.personal_ai_flow_versions set status='rolled_back', effective_to=now(), updated_at=now() where id=withdrawn.id;
  update public.personal_ai_flow_versions set status='active', effective_from=now(), effective_to=null, updated_at=now() where id=replacement.id returning * into replacement;
  insert into public.personal_ai_flow_version_audit_logs(flow_version_id,flow_id,previous_version,new_version,action,actor_user_id,reason) values(withdrawn.id,withdrawn.flow_id,withdrawn.version,replacement.version,'rolled_back',auth.uid(),rollback_reason);
  return replacement;
end; $$;
revoke all on function public.rollback_personal_ai_flow_version(uuid,text) from public, anon;
grant execute on function public.rollback_personal_ai_flow_version(uuid,text) to authenticated;

comment on table public.personal_ai_flow_versions is 'Immutable after approval/release. Critical versions require independent human approvals before activation.';
comment on table public.personal_ai_flow_version_approvals is 'Human approvals only; an approver can approve a version once and cannot approve their own draft for critical release.';
commit;
