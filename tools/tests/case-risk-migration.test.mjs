import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration = fs.readFileSync(new URL('../../supabase/migrations/20260911230000_track_c_risk_case_updates.sql', import.meta.url), 'utf8');

test('track C migration defines immutable risk history and workflow automation tables', () => {
  assert.match(migration, /create table if not exists public\.case_events/i);
  assert.match(migration, /create table if not exists public\.risk_snapshots/i);
  assert.match(migration, /create table if not exists public\.escalation_alerts/i);
  assert.match(migration, /create table if not exists public\.follow_up_tasks/i);
  assert.match(migration, /risk_snapshots are immutable/i);
  assert.match(migration, /apply_case_risk_workflow/i);
  assert.match(migration, /follow_up_tasks_active_unique_idx/i);
  assert.match(migration, /create policy case_events_backend_insert on public\.case_events\s+for insert to service_role, postgres\s+with check \(true\);/i);
  assert.match(migration, /create policy risk_snapshots_backend_insert on public\.risk_snapshots\s+for insert to service_role, postgres\s+with check \(true\);/i);
  assert.match(migration, /create policy escalation_alerts_backend_manage on public\.escalation_alerts\s+for all to service_role, postgres\s+using \(true\)\s+with check \(true\);/i);
  assert.match(migration, /create policy follow_up_tasks_backend_manage on public\.follow_up_tasks\s+for all to service_role, postgres\s+using \(true\)\s+with check \(true\);/i);
});

test('track C migration enforces immutable snapshots by blocking updates and deletes', () => {
  assert.match(migration, /create trigger prevent_risk_snapshot_update\s+before update on public\.risk_snapshots/i);
  assert.match(migration, /create trigger prevent_risk_snapshot_delete\s+before delete on public\.risk_snapshots/i);
  assert.match(migration, /raise exception 'risk_snapshots are immutable'/i);
});

test('track C migration includes idempotent event creation and duplicate alert/task prevention', () => {
  assert.match(migration, /if p_event_idempotency_key is not null then[\s\S]*where ce\.case_id = p_case_id[\s\S]*ce\.idempotency_key = p_event_idempotency_key/i);
  assert.match(migration, /if v_case_event_id is null then[\s\S]*insert into public\.case_events/i);

  assert.match(migration, /where ea\.case_id = p_case_id[\s\S]*ea\.dedupe_key = coalesce\(v_alert->>'dedupe_key', ''\)[\s\S]*ea\.status in \('open', 'acknowledged'\)/i);
  assert.match(migration, /if v_existing_alert_id is null then[\s\S]*insert into public\.escalation_alerts/i);

  assert.match(migration, /create unique index if not exists follow_up_tasks_active_unique_idx/i);
  assert.match(migration, /if coalesce\(\(v_task->>'allow_duplicates'\)::boolean, false\) = false then[\s\S]*from public\.follow_up_tasks/i);
});

test('track C migration records custom workflow audit entries including override actions', () => {
  assert.match(migration, /for v_audit in select value from jsonb_array_elements\(coalesce\(p_audit, '\[\]'::jsonb\)\)/i);
  assert.match(migration, /insert into public\.audit_logs \(case_id, actor_user_id, action, resource_type, resource_id, details\)[\s\S]*coalesce\(v_audit->>'action', 'case_risk_workflow'\)/i);
});

test('track C migration keeps automation as decision support and does not alter custody or legal status fields', () => {
  const caseUpdateMatch = migration.match(/update\s+public\.cases\s+set\s+([\s\S]*?)\s+where\s+id\s*=\s*p_case_id;/i);
  assert.ok(caseUpdateMatch, 'expected update public.cases statement');
  const assignments = caseUpdateMatch[1];
  assert.match(assignments, /updated_at\s*=\s*now\(\)/i);
  assert.equal(/status\s*=|placement|contact|legal|custody/i.test(assignments), false);
});
