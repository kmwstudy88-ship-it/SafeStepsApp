begin;

create table if not exists public.personal_ai_memory_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_type text not null check (consent_type in ('memory','support_plan','sensitive_memory')),
  status text not null check (status in ('accepted','declined','revoked')),
  policy_version text not null,
  granted_at timestamptz,
  revoked_at timestamptz,
  notes text check (char_length(notes) <= 500),
  created_at timestamptz not null default now(),
  unique(user_id,consent_type,policy_version,created_at)
);

create table if not exists public.personal_ai_family_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scope text not null check (scope in ('conversation','account','case','support_plan')),
  sensitivity text not null check (sensitivity in ('low','moderate','high')),
  memory_key text not null check (memory_key in ('preferred_name','pronouns','preferred_language','timezone','accessibility_need','support_goal','visit_schedule','appointment_reminder','safe_contact_label','coping_preference','caseworker_meeting_day','court_goal','visit_support_preference','dv_safe_mode','monitored_device_risk','safe_words_only','communication_limitation')),
  memory_value text not null check (char_length(memory_value) between 1 and 500),
  rationale text not null check (char_length(rationale) between 5 and 500),
  source_conversation_id uuid references public.personal_ai_conversations(id) on delete set null,
  source_message_id uuid references public.personal_ai_messages(id) on delete set null,
  consent_type text not null check (consent_type in ('memory','support_plan','sensitive_memory')),
  monitored_device_context boolean not null default false,
  status text not null default 'active' check (status in ('active','suppressed','expired','deleted','pending_review')),
  tags text[] not null default '{}',
  jurisdiction text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (not monitored_device_context or sensitivity = 'low'),
  check (sensitivity not in ('high') or consent_type = 'sensitive_memory'),
  check (scope <> 'conversation' or source_conversation_id is not null)
);

create index if not exists personal_ai_family_memory_owner_idx on public.personal_ai_family_memory(user_id,status,expires_at);
create index if not exists personal_ai_memory_consents_owner_idx on public.personal_ai_memory_consents(user_id,consent_type,status);

alter table public.personal_ai_memory_consents enable row level security;
alter table public.personal_ai_family_memory enable row level security;
revoke all on public.personal_ai_memory_consents, public.personal_ai_family_memory from anon, authenticated;
grant select,insert on public.personal_ai_memory_consents to authenticated;
grant select,insert on public.personal_ai_family_memory to authenticated;
grant update(memory_value,rationale,status,expires_at,updated_at,deleted_at) on public.personal_ai_family_memory to authenticated;

create policy personal_ai_memory_consents_owner_read on public.personal_ai_memory_consents for select to authenticated
using ((select auth.uid()) = user_id);
create policy personal_ai_memory_consents_owner_insert on public.personal_ai_memory_consents for insert to authenticated
with check ((select auth.uid()) = user_id and ((status='accepted' and granted_at is not null and revoked_at is null) or (status in ('declined','revoked') and granted_at is null)));

create policy personal_ai_family_memory_owner_read on public.personal_ai_family_memory for select to authenticated
using ((select auth.uid()) = user_id);
create policy personal_ai_family_memory_owner_insert on public.personal_ai_family_memory for insert to authenticated
with check (
  (select auth.uid()) = user_id and status in ('active','pending_review') and sensitivity <> 'critical'
  and exists (select 1 from public.personal_ai_memory_consents c where c.user_id=(select auth.uid()) and c.consent_type=personal_ai_family_memory.consent_type and c.status='accepted' and c.revoked_at is null)
);
create policy personal_ai_family_memory_owner_update on public.personal_ai_family_memory for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create or replace function private.guard_personal_ai_family_memory()
returns trigger language plpgsql set search_path=pg_catalog,public,private as $$
begin
  if new.memory_value ~* '(diagnos(is|ed)|court will|custody will|hit me|raped|sexually abused|suicide plan|weapon location|hide (this|evidence)|secret legal strategy)' then
    raise exception 'Memory content is prohibited by the controlled-memory policy';
  end if;
  return new;
end; $$;
create trigger personal_ai_family_memory_guard before insert or update of memory_value on public.personal_ai_family_memory
for each row execute function private.guard_personal_ai_family_memory();

create or replace function private.audit_personal_ai_family_memory_change()
returns trigger language plpgsql security definer set search_path=pg_catalog,public,private as $$
begin
  if auth.uid() is null or auth.uid() <> new.user_id then raise exception 'Invalid memory audit actor'; end if;
  insert into public.personal_ai_audit_logs(user_id,actor_id,action,target_type,target_id,metadata)
  values(new.user_id,auth.uid(),case when new.status='deleted' then 'memory_deleted' when new.status='suppressed' then 'memory_suppressed' else 'memory_updated' end,'personal_ai_family_memory',new.id,jsonb_build_object('status',new.status,'memory_key',new.memory_key));
  return new;
end; $$;
revoke all on function private.audit_personal_ai_family_memory_change() from public,anon,authenticated;
create trigger personal_ai_family_memory_audit after update on public.personal_ai_family_memory
for each row execute function private.audit_personal_ai_family_memory_change();

create or replace function public.revoke_personal_ai_memory_consent(target_consent_type text, target_policy_version text)
returns integer language plpgsql security invoker set search_path=pg_catalog,public as $$
declare affected integer;
begin
  if target_consent_type not in ('memory','support_plan','sensitive_memory') then raise exception 'Invalid consent type'; end if;
  insert into public.personal_ai_memory_consents(user_id,consent_type,status,policy_version,revoked_at)
    values(auth.uid(),target_consent_type,'revoked',target_policy_version,now());
  update public.personal_ai_family_memory set status='suppressed',updated_at=now()
    where user_id=auth.uid() and consent_type=target_consent_type and status in ('active','pending_review');
  get diagnostics affected = row_count; return affected;
end; $$;
revoke all on function public.revoke_personal_ai_memory_consent(text,text) from public,anon;
grant execute on function public.revoke_personal_ai_memory_consent(text,text) to authenticated;

comment on table public.personal_ai_family_memory is 'Opt-in, structured, user-visible memory. Raw crisis/abuse narratives, diagnoses, allegations, and critical-sensitivity content are prohibited.';
commit;
