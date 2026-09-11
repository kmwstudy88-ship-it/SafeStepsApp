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
});
