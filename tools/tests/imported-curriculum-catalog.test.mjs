import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const importRoot = path.join(
  repoRoot,
  'src',
  'safesteps',
  'imports',
  'curriculum-seeds',
  'directory-import',
);
const catalog = JSON.parse(fs.readFileSync(path.join(importRoot, 'catalog.json'), 'utf8'));
const report = JSON.parse(fs.readFileSync(path.join(importRoot, 'import-report.json'), 'utf8'));

test('generated catalog contains every normalized course and lesson grouping', () => {
  assert.equal(catalog.schemaVersion, 1);
  assert.equal(catalog.counts.courses, 15);
  assert.equal(catalog.counts.courseLessons, 65);
  assert.equal(catalog.counts.standaloneLessons, 12);
  assert.equal(catalog.counts.learningPackages, 24);

  const basic = catalog.courses.find(
    (course) => course.id === 'understanding-harm-basic-imported',
  );
  const mastery = catalog.courses.find(
    (course) => course.id === 'masters-understanding-harm',
  );
  assert.equal(basic.lessons.length, 5);
  assert.equal(mastery.level, 'mastery');
  assert.equal(mastery.lessons.length, 4);
});

test('all runtime lessons preserve provenance and draft review status', () => {
  const lessons = [
    ...catalog.courses.flatMap((course) => course.lessons),
    ...catalog.standaloneLessons,
  ];

  assert.ok(lessons.length > 0);
  lessons.forEach((lesson) => {
    assert.ok(lesson.id);
    assert.ok(lesson.title);
    assert.ok(lesson.contentHash);
    assert.ok(lesson.sourcePaths.length > 0);
    assert.match(lesson.reviewStatus, /not validated or approved/i);
  });
});

test('import report records repaired files and duplicate aliases explicitly', () => {
  assert.equal(report.counts.malformedFiles, 0);
  assert.equal(report.counts.repairedFiles, 12);
  assert.equal(report.counts.duplicateGroups, 57);
  assert.equal(report.counts.rejectedFiles, 0);
  assert.ok(
    report.repaired.some((entry) =>
      entry.sourcePath.endsWith('Answer and marking package.Json'),
    ),
  );
  assert.ok(
    report.duplicateGroups.every((group) => group.sourcePaths.length > 1),
  );
});
