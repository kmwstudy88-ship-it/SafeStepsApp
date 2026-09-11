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
