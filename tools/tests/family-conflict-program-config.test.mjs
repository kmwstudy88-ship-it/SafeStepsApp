import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const require = createRequire(import.meta.url);
const {
  EXPECTED_LESSON_COUNT,
  PROGRAM_LEVELS,
  loadCanonicalFamilyConflictProgram,
  validateFamilyConflictProgramConfig,
} = require('../../backend/skills/program-config.js');

test('canonical family conflict program file preserves full structure', () => {
  const { lesson, program } = loadCanonicalFamilyConflictProgram(repoRoot);

  assert.equal(lesson.id, 'family_conflict_psychoeducation_program');
  assert.equal(program.title, 'Family Conflict Psychoeducation: Three-Level Learning Pathway');
  assert.deepEqual(program.levels, PROGRAM_LEVELS);
  assert.equal(program.lessons.length, EXPECTED_LESSON_COUNT);
  assert.equal(program.reusable_assessments.role_play_rubric.scoring['2'], 'Consistently');
});

test('program validator accepts canonical content and rejects broken lesson counts', () => {
  const { program } = loadCanonicalFamilyConflictProgram(repoRoot);
  const valid = validateFamilyConflictProgramConfig(program);
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, []);

  const broken = validateFamilyConflictProgramConfig({ ...program, lessons: program.lessons.slice(0, 19) });
  assert.equal(broken.valid, false);
  assert.ok(broken.errors.some((error) => /20 lessons/.test(error)));
});

test('schema file exists and declares expected core requirements', () => {
  const schemaPath = path.join(repoRoot, 'schema', 'family-conflict-psychoeducation-program-schema.json');
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

  assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.ok(schema.required.includes('lessons'));
  assert.ok(schema.required.includes('completion_guidance'));
  assert.equal(schema.properties.lessons.minItems, 20);
  assert.equal(schema.properties.lessons.maxItems, 20);
});
