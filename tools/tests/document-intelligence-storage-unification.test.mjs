import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const migrationPath = resolve(__dirname, '../../supabase/migrations/20260911200000_document_intelligence_storage_unification.sql');
const migrationSql = readFileSync(migrationPath, 'utf8');

test('document_entities policy covers document, version, and case fallback access paths', () => {
  assert.match(migrationSql, /create policy document_entities_select on public\.document_entities/);
  assert.match(migrationSql, /where document\.id = document_entities\.case_document_id/);
  assert.match(migrationSql, /where version\.id = document_entities\.document_version_id/);
  assert.match(
    migrationSql,
    /where document_entities\.case_document_id is null\s+and document_entities\.document_version_id is null\s+and document\.case_id = document_entities\.case_id/s,
  );

  const assessmentBypassCount = [...migrationSql.matchAll(/or public\.can_manage_assessments\(\)/g)].length;
  assert.equal(assessmentBypassCount, 3);
});

test('document_text prefers sha matches before storage path fallback and preserves case boundaries', () => {
  assert.match(
    migrationSql,
    /coalesce\(parsed_by_sha\.extracted_text, parsed_by_path\.extracted_text\) as text_content/,
  );
  assert.match(
    migrationSql,
    /coalesce\(parsed_by_sha\.created_at, parsed_by_path\.created_at, version\.uploaded_at\) as source_created_at/,
  );
  assert.match(
    migrationSql,
    /where version\.file_sha256 is not null\s+and d\.sha256 = version\.file_sha256\s+and \(d\.case_id is null or d\.case_id = document\.case_id\)/s,
  );
  assert.match(
    migrationSql,
    /where parsed_by_sha\.created_at is null\s+and d\.storage_path = version\.file_path\s+and \(d\.case_id is null or d\.case_id = document\.case_id\)/s,
  );
});

test('retrieval contradiction projections derive case ids and reviewer state from either linked source', () => {
  const derivedCaseIdBlocks = migrationSql.match(/coalesce\(\s+case\s+when contradiction\.source_a_type ilike '%version%'/gs) || [];
  assert.equal(derivedCaseIdBlocks.length, 2);
  assert.match(migrationSql, /coalesce\(contradiction\.source_a_reference, contradiction\.source_a_type\) as source_a/);
  assert.match(migrationSql, /coalesce\(contradiction\.source_b_reference, contradiction\.source_b_type\) as source_b/);
  assert.match(
    migrationSql,
    /case when contradiction\.requires_resolution then 'open' else 'closed' end as concern_status/,
  );
  assert.match(
    migrationSql,
    /case when contradiction\.requires_resolution then null::timestamptz else contradiction\.reviewed_at end as resolved_at/,
  );
});

test('storage-unification relations are security-invoker views with service-role-only grants', () => {
  for (const viewName of [
    'document_text',
    'document_contradictions',
    'document_fairness',
    'document_risks',
    'document_timeline',
    'document_concerns',
  ]) {
    assert.match(
      migrationSql,
      new RegExp(`create or replace view public\\.${viewName}\\s+with \\(security_invoker = true\\)`, 's'),
    );
  }

  assert.match(migrationSql, /revoke all on public\.document_entities from public, anon, authenticated;/);
  assert.match(migrationSql, /grant insert, update on public\.document_entities to service_role;/);
  assert.match(
    migrationSql,
    /revoke all on\s+public\.document_text,\s+public\.document_contradictions,\s+public\.document_fairness,\s+public\.document_risks,\s+public\.document_timeline,\s+public\.document_concerns\s+from public, anon, authenticated;/s,
  );
  assert.match(
    migrationSql,
    /grant select on\s+public\.document_text,\s+public\.document_contradictions,\s+public\.document_fairness,\s+public\.document_risks,\s+public\.document_timeline,\s+public\.document_concerns\s+to service_role;/s,
  );
});
