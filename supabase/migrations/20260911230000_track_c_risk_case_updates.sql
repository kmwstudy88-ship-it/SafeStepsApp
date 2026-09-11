-- Track C: deterministic risk scoring persistence, escalation, and follow-up workflow.
-- Safety-critical outputs remain decision support only and must be reviewed by a human.

create extension if not exists pgcrypto;

create table if not exists public.case_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  actor_user_id uuid references public.users(id) on delete set null,
  event_type text not null,
  event_source text not null default 'manual_note',
  note text,
  payload jsonb not null default '{}'::jsonb,
  idempotency_key text,
  created_at timestamptz not null default now()
);

create unique index if not exists case_events_case_idempotency_idx
  on public.case_events(case_id, idempotency_key)
  where idempotency_key is not null;
create index if not exists case_events_case_created_idx
  on public.case_events(case_id, created_at desc);
create index if not exists case_events_case_type_created_idx
  on public.case_events(case_id, event_type, created_at desc);

create table if not exists public.risk_snapshots (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  case_event_id uuid references public.case_events(id) on delete set null,
  created_by uuid references public.users(id) on delete set null,
  score integer not null check (score between 0 and 100),
  tier text not null check (tier in ('low', 'moderate', 'high', 'critical')),
  confidence numeric(4,3) not null check (confidence between 0 and 1),
  factors jsonb not null default '[]'::jsonb,
  rationale text not null,
  model_version text not null,
  hard_escalation jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists risk_snapshots_case_created_idx
  on public.risk_snapshots(case_id, created_at desc);
create index if not exists risk_snapshots_supervisor_queue_idx
  on public.risk_snapshots(tier, created_at desc);

create table if not exists public.escalation_alerts (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  risk_snapshot_id uuid references public.risk_snapshots(id) on delete set null,
  case_event_id uuid references public.case_events(id) on delete set null,
  trigger_type text not null,
  severity text not null check (severity in ('moderate', 'high', 'critical')),
  status text not null default 'open' check (status in ('open', 'acknowledged', 'resolved', 'dismissed')),
  routed_to jsonb not null default '{}'::jsonb,
  detail jsonb not null default '{}'::jsonb,
  dedupe_key text not null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.users(id) on delete set null
);

create unique index if not exists escalation_alerts_open_dedupe_idx
  on public.escalation_alerts(case_id, dedupe_key)
  where status in ('open', 'acknowledged');
create index if not exists escalation_alerts_open_queue_idx
  on public.escalation_alerts(status, severity, created_at desc)
  where status in ('open', 'acknowledged');
create index if not exists escalation_alerts_case_created_idx
  on public.escalation_alerts(case_id, created_at desc);

create table if not exists public.follow_up_tasks (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  risk_snapshot_id uuid references public.risk_snapshots(id) on delete set null,
  source_event_id uuid references public.case_events(id) on delete set null,
  task_type text not null,
  title text not null,
  due_at timestamptz not null,
  priority text not null check (priority in ('routine', 'medium', 'high', 'urgent')),
  assignee uuid references public.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled', 'overdue')),
  source text not null,
  detail jsonb not null default '{}'::jsonb,
  allow_duplicates boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists follow_up_tasks_active_unique_idx
  on public.follow_up_tasks(case_id, task_type)
  where status in ('pending', 'in_progress', 'overdue') and allow_duplicates = false;
create index if not exists follow_up_tasks_case_due_idx
  on public.follow_up_tasks(case_id, status, due_at asc);
create index if not exists follow_up_tasks_supervisor_queue_idx
  on public.follow_up_tasks(status, priority, due_at asc)
  where status in ('pending', 'in_progress', 'overdue');
create index if not exists follow_up_tasks_assignee_status_idx
  on public.follow_up_tasks(assignee, status, due_at asc);

alter table public.case_events enable row level security;
alter table public.risk_snapshots enable row level security;
alter table public.escalation_alerts enable row level security;
alter table public.follow_up_tasks enable row level security;

drop policy if exists case_events_case_access on public.case_events;
create policy case_events_case_access on public.case_events
for select to authenticated
using (public.case_visible_to_current_user(case_id));

drop policy if exists case_events_write_by_case_team on public.case_events;
create policy case_events_write_by_case_team on public.case_events
for insert to authenticated
with check (
  public.case_visible_to_current_user(case_id)
  and coalesce(public.current_role_key(), '') in ('case_worker', 'supervisor', 'admin')
  and (actor_user_id is null or actor_user_id = public.current_app_user_id() or coalesce(public.current_role_key(), '') = 'admin')
);

drop policy if exists risk_snapshots_case_access on public.risk_snapshots;
create policy risk_snapshots_case_access on public.risk_snapshots
for select to authenticated
using (public.case_visible_to_current_user(case_id));

drop policy if exists risk_snapshots_backend_insert on public.risk_snapshots;
create policy risk_snapshots_backend_insert on public.risk_snapshots
for insert to service_role
with check (true);

drop policy if exists escalation_alerts_case_access on public.escalation_alerts;
create policy escalation_alerts_case_access on public.escalation_alerts
for select to authenticated
using (public.case_visible_to_current_user(case_id));

drop policy if exists escalation_alerts_backend_manage on public.escalation_alerts;
create policy escalation_alerts_backend_manage on public.escalation_alerts
for all to service_role
using (true)
with check (true);

drop policy if exists follow_up_tasks_case_access on public.follow_up_tasks;
create policy follow_up_tasks_case_access on public.follow_up_tasks
for select to authenticated
using (public.case_visible_to_current_user(case_id));

drop policy if exists follow_up_tasks_backend_manage on public.follow_up_tasks;
create policy follow_up_tasks_backend_manage on public.follow_up_tasks
for all to service_role
using (true)
with check (true);

create or replace function public.prevent_case_event_mutation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  raise exception 'case_events are append-only';
end;
$$;

drop trigger if exists prevent_case_event_update on public.case_events;
create trigger prevent_case_event_update
before update on public.case_events
for each row
execute function public.prevent_case_event_mutation();

drop trigger if exists prevent_case_event_delete on public.case_events;
create trigger prevent_case_event_delete
before delete on public.case_events
for each row
execute function public.prevent_case_event_mutation();

create or replace function public.prevent_risk_snapshot_mutation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  raise exception 'risk_snapshots are immutable';
end;
$$;

drop trigger if exists prevent_risk_snapshot_update on public.risk_snapshots;
create trigger prevent_risk_snapshot_update
before update on public.risk_snapshots
for each row
execute function public.prevent_risk_snapshot_mutation();

drop trigger if exists prevent_risk_snapshot_delete on public.risk_snapshots;
create trigger prevent_risk_snapshot_delete
before delete on public.risk_snapshots
for each row
execute function public.prevent_risk_snapshot_mutation();

create or replace function public.apply_case_risk_workflow(
  p_case_id uuid,
  p_actor_user_id uuid,
  p_event_type text default null,
  p_event_source text default 'manual_note',
  p_event_note text default null,
  p_event_payload jsonb default '{}'::jsonb,
  p_event_idempotency_key text default null,
  p_snapshot jsonb default '{}'::jsonb,
  p_alerts jsonb default '[]'::jsonb,
  p_tasks jsonb default '[]'::jsonb,
  p_audit jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_case_event_id uuid;
  v_snapshot_id uuid;
  v_existing_alert_id uuid;
  v_existing_task_id uuid;
  v_alert jsonb;
  v_task jsonb;
  v_audit jsonb;
  v_alert_ids uuid[] := '{}'::uuid[];
  v_task_ids uuid[] := '{}'::uuid[];
begin
  if p_event_type is not null then
    if p_event_idempotency_key is not null then
      select ce.id
      into v_case_event_id
      from public.case_events ce
      where ce.case_id = p_case_id
        and ce.idempotency_key = p_event_idempotency_key
      limit 1;
    end if;

    if v_case_event_id is null then
      insert into public.case_events (
        case_id, actor_user_id, event_type, event_source, note, payload, idempotency_key
      )
      values (
        p_case_id, p_actor_user_id, p_event_type, coalesce(p_event_source, 'manual_note'),
        p_event_note, coalesce(p_event_payload, '{}'::jsonb), p_event_idempotency_key
      )
      returning id into v_case_event_id;
    end if;
  end if;

  insert into public.risk_snapshots (
    case_id, case_event_id, created_by, score, tier, confidence, factors, rationale, model_version, hard_escalation
  )
  values (
    p_case_id,
    v_case_event_id,
    p_actor_user_id,
    coalesce((p_snapshot->>'score')::integer, 0),
    coalesce(p_snapshot->>'tier', 'low'),
    coalesce((p_snapshot->>'confidence')::numeric, 0),
    coalesce(p_snapshot->'factors', '[]'::jsonb),
    coalesce(p_snapshot->>'rationale', 'No rationale provided.'),
    coalesce(p_snapshot->>'model_version', 'risk-rules-v1'),
    coalesce(p_snapshot->'hard_escalation', '{}'::jsonb)
  )
  returning id into v_snapshot_id;

  for v_alert in select value from jsonb_array_elements(coalesce(p_alerts, '[]'::jsonb))
  loop
    v_existing_alert_id := null;
    select ea.id
    into v_existing_alert_id
    from public.escalation_alerts ea
    where ea.case_id = p_case_id
      and ea.dedupe_key = coalesce(v_alert->>'dedupe_key', '')
      and ea.status in ('open', 'acknowledged')
    limit 1;

    if v_existing_alert_id is null then
      insert into public.escalation_alerts (
        case_id, risk_snapshot_id, case_event_id, trigger_type, severity, status, routed_to, detail, dedupe_key
      )
      values (
        p_case_id,
        v_snapshot_id,
        v_case_event_id,
        coalesce(v_alert->>'trigger_type', 'risk_signal'),
        coalesce(v_alert->>'severity', 'high'),
        coalesce(v_alert->>'status', 'open'),
        coalesce(v_alert->'routed_to', '{}'::jsonb),
        coalesce(v_alert->'detail', '{}'::jsonb),
        coalesce(v_alert->>'dedupe_key', gen_random_uuid()::text)
      )
      returning id into v_existing_alert_id;
    end if;

    v_alert_ids := array_append(v_alert_ids, v_existing_alert_id);
  end loop;

  update public.follow_up_tasks
  set status = 'overdue',
      updated_at = now()
  where case_id = p_case_id
    and status in ('pending', 'in_progress')
    and due_at < now();

  for v_task in select value from jsonb_array_elements(coalesce(p_tasks, '[]'::jsonb))
  loop
    v_existing_task_id := null;
    if coalesce((v_task->>'allow_duplicates')::boolean, false) = false then
      select fut.id
      into v_existing_task_id
      from public.follow_up_tasks fut
      where fut.case_id = p_case_id
        and fut.task_type = coalesce(v_task->>'task_type', '')
        and fut.status in ('pending', 'in_progress', 'overdue')
      limit 1;
    end if;

    if v_existing_task_id is null then
      insert into public.follow_up_tasks (
        case_id, risk_snapshot_id, source_event_id, task_type, title, due_at, priority, assignee, status, source, detail, allow_duplicates
      )
      values (
        p_case_id,
        v_snapshot_id,
        v_case_event_id,
        coalesce(v_task->>'task_type', 'follow_up'),
        coalesce(v_task->>'title', 'Follow-up task'),
        coalesce((v_task->>'due_at')::timestamptz, now()),
        coalesce(v_task->>'priority', 'medium'),
        nullif(v_task->>'assignee', '')::uuid,
        coalesce(v_task->>'status', 'pending'),
        coalesce(v_task->>'source', 'risk_engine'),
        coalesce(v_task->'detail', '{}'::jsonb),
        coalesce((v_task->>'allow_duplicates')::boolean, false)
      )
      returning id into v_existing_task_id;
    else
      update public.follow_up_tasks
      set risk_snapshot_id = v_snapshot_id,
          source_event_id = coalesce(v_case_event_id, source_event_id),
          title = coalesce(v_task->>'title', title),
          due_at = coalesce((v_task->>'due_at')::timestamptz, due_at),
          priority = coalesce(v_task->>'priority', priority),
          assignee = coalesce(nullif(v_task->>'assignee', '')::uuid, assignee),
          status = case
            when status in ('completed', 'cancelled') then 'pending'
            else coalesce(v_task->>'status', status)
          end,
          detail = coalesce(v_task->'detail', detail),
          updated_at = now()
      where id = v_existing_task_id;
    end if;

    v_task_ids := array_append(v_task_ids, v_existing_task_id);
  end loop;

  insert into public.audit_logs (case_id, actor_user_id, action, resource_type, resource_id, details)
  values (
    p_case_id,
    p_actor_user_id,
    'risk_snapshot_created',
    'risk_snapshot',
    v_snapshot_id,
    jsonb_build_object(
      'score', coalesce((p_snapshot->>'score')::integer, 0),
      'tier', coalesce(p_snapshot->>'tier', 'low'),
      'confidence', coalesce((p_snapshot->>'confidence')::numeric, 0),
      'model_version', coalesce(p_snapshot->>'model_version', 'risk-rules-v1')
    )
  );

  if array_length(v_alert_ids, 1) is not null then
    insert into public.audit_logs (case_id, actor_user_id, action, resource_type, details)
    values (
      p_case_id,
      p_actor_user_id,
      'escalation_alerts_evaluated',
      'escalation_alert',
      jsonb_build_object('alert_ids', to_jsonb(v_alert_ids))
    );
  end if;

  for v_audit in select value from jsonb_array_elements(coalesce(p_audit, '[]'::jsonb))
  loop
    insert into public.audit_logs (case_id, actor_user_id, action, resource_type, resource_id, details)
    values (
      p_case_id,
      p_actor_user_id,
      coalesce(v_audit->>'action', 'case_risk_workflow'),
      coalesce(v_audit->>'resource_type', 'case_workflow'),
      nullif(v_audit->>'resource_id', '')::uuid,
      coalesce(v_audit->'details', '{}'::jsonb)
    );
  end loop;

  update public.cases
  set updated_at = now()
  where id = p_case_id;

  return jsonb_build_object(
    'case_event_id', v_case_event_id,
    'risk_snapshot_id', v_snapshot_id,
    'alert_ids', to_jsonb(v_alert_ids),
    'task_ids', to_jsonb(v_task_ids)
  );
end;
$$;

revoke all on function public.apply_case_risk_workflow(uuid, uuid, text, text, text, jsonb, text, jsonb, jsonb, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.apply_case_risk_workflow(uuid, uuid, text, text, text, jsonb, text, jsonb, jsonb, jsonb, jsonb) to service_role;

comment on table public.case_events is
  'Typed case timeline events, notes, and document-derived signals. Append-only for auditability.';
comment on table public.risk_snapshots is
  'Immutable deterministic risk results with factor traceability, rationale, and model version.';
comment on table public.escalation_alerts is
  'Safety-critical escalation alerts routed to assigned workers and supervisors. Alerts do not execute adverse actions automatically.';
comment on table public.follow_up_tasks is
  'Automated follow-up tasks created from risk tier SLA templates and escalation rules.';
