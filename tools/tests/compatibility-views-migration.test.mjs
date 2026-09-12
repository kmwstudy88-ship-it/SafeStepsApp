import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const migrationPath = resolve(__dirname, '../../supabase/migrations/20260911232000_compatibility_views.sql');
const migrationSql = readFileSync(migrationPath, 'utf8');

test('compatibility migration archives legacy relations before creating replacement views', () => {
  const archivedRelations = [
    'case_assignments',
    'case_visit_records',
    'visits',
    'messages',
    'timeline_events',
    'risk_indicators',
    'contradictions',
    'fairness_analysis',
    'document_entities',
  ];

  for (const relation of archivedRelations) {
    assert.match(
      migrationSql,
      new RegExp(`select public\\.__archive_compatibility_relation\\('${relation}', '${relation}_legacy'\\);`),
    );
  }
});

test('compatibility migration defines critical view mappings', () => {
  const expectedMappings = [
    ['case_assignments', 'case_allocations'],
    ['case_visit_records', 'case_visit_records_v19'],
    ['visits', 'case_visit_records'],
    ['messages', 'messaging_messages'],
    ['timeline_events', 'evidence_timeline_events'],
    ['risk_indicators', 'ai_risk_signals'],
    ['contradictions', 'assessment_contradictions'],
    ['fairness_analysis', 'ai_fairness_results'],
  ];

  for (const [viewName, sourceName] of expectedMappings) {
    assert.match(migrationSql, new RegExp(`create view public\\.${viewName}\\b`));
    assert.match(migrationSql, new RegExp(`from public\\.${sourceName}\\b`));
  }
});

test('compatibility migration enforces the stable visits view column contract', () => {
  const expectedColumns = [
    'id',
    'visit_reference',
    'case_id',
    'visit_type',
    'visit_location_type',
    'scheduled_at',
    'actual_start_at',
    'actual_end_at',
    'worker_user_id',
    'participants_present',
    'factual_observations',
    'family_responses',
    'safety_context',
    'follow_up_required',
    'human_review_status',
    'created_at',
  ];

  assert.match(
    migrationSql,
    /raise exception 'public\.visits compatibility view columns do not match the expected contract';/,
  );

  for (const column of expectedColumns) {
    assert.match(migrationSql, new RegExp(`'${column}'`));
  }
});

test('compatibility migration revokes public access and grants read access to app roles', () => {
  const compatibilityRelations = [
    'case_assignments',
    'case_visit_records',
    'visits',
    'messages',
    'timeline_events',
    'risk_indicators',
    'contradictions',
    'fairness_analysis',
    'document_entities',
  ];

  for (const relation of compatibilityRelations) {
    assert.match(
      migrationSql,
      new RegExp(`perform public\\.__revoke_public_if_relation_exists\\('${relation}'\\);`),
    );
    assert.match(
      migrationSql,
      new RegExp(`perform public\\.__grant_select_if_relation_exists\\('${relation}', 'authenticated'\\);`),
    );
    assert.match(
      migrationSql,
      new RegExp(`perform public\\.__grant_select_if_relation_exists\\('${relation}', 'service_role'\\);`),
    );
  }
});
