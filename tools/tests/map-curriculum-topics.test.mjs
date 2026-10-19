import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

test('topic mapping tool covers every canonical topic with valid modules', () => {
  const report = JSON.parse(
    fs.readFileSync(
      path.join(repoRoot, 'docs', 'content-readiness', 'topic-module-mappings.json'),
      'utf8',
    ),
  );
  const moduleIds = new Set(
    fs
      .readdirSync(path.join(repoRoot, 'modules'))
      .filter((fileName) => fileName.endsWith('.json'))
      .map((fileName) =>
        JSON.parse(fs.readFileSync(path.join(repoRoot, 'modules', fileName), 'utf8')),
      )
      .map((record) => record.id),
  );

  assert.equal(report.counts.unmatchedTopics, 0);
  assert.equal(report.counts.mappedTopics, 293);
  for (const mapping of report.mappings) {
    assert.ok(mapping.modules.length > 0, mapping.topicId);
    mapping.modules.forEach((moduleId) => {
      assert.equal(moduleIds.has(moduleId), true, `${mapping.topicId}: ${moduleId}`);
    });
  }
});
