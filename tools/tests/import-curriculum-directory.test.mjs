import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { importDirectories } = require('../import-curriculum-directory.js');

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'safesteps-directory-import-'));
  const courses = path.join(root, 'courses');
  const lessons = path.join(root, 'Lessons');
  const output = path.join(root, 'output');
  fs.mkdirSync(courses);
  fs.mkdirSync(lessons);
  return { root, courses, lessons, output };
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

test('recursively imports, pairs, and deduplicates curriculum sources', () => {
  const { root, courses, lessons, output } = fixture();
  try {
    const lesson = {
      lessonId: 'listen-first',
      courseId: 'safe-communication',
      title: 'Listen First',
      learningGoal: 'Respond with curiosity.',
    };
    const facilitator = {
      title: 'Listen First facilitator',
      systemPrompt: 'Never diagnose. Escalate immediate danger.',
    };
    writeJson(path.join(courses, 'Courses with AI Facilitator', 'Safe Communication', 'Listen First', 'lesson.Json'), lesson);
    writeJson(path.join(courses, 'Courses with AI Facilitator', 'Safe Communication', 'Listen First', 'AI Facilitator.json'), facilitator);
    writeJson(path.join(lessons, 'Lessons with AI Facilitator', 'Listen First', 'lesson.json'), lesson);
    writeJson(path.join(lessons, 'Lessons with AI Facilitator', 'Listen First', 'AI Facilitator.json'), facilitator);

    const { catalog, report } = importDirectories({ sources: [courses, lessons], output });

    assert.equal(report.counts.parsedJsonFiles, 4);
    assert.equal(report.counts.uniqueDocuments, 2);
    assert.equal(report.counts.duplicateGroups, 2);
    assert.equal(catalog.courses.length, 1);
    assert.equal(catalog.courses[0].lessons.length, 1);
    assert.equal(catalog.courses[0].lessons[0].facilitatorProfiles.length, 1);
    assert.equal(catalog.courses[0].lessons[0].sourcePaths.length, 2);
    assert.equal(fs.existsSync(path.join(output, 'catalog.json')), true);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('reports malformed and non-JSON text without inventing runtime content', () => {
  const { root, courses, output } = fixture();
  try {
    fs.writeFileSync(path.join(courses, 'broken.json'), '{"title": "Broken"} trailing');
    fs.writeFileSync(path.join(courses, 'notes.txt'), 'not json');

    const { catalog, report } = importDirectories({ sources: [courses], output });

    assert.equal(report.counts.malformedFiles, 1);
    assert.equal(report.counts.ignoredFiles, 1);
    assert.equal(catalog.courses.length, 0);
    assert.equal(catalog.standaloneLessons.length, 0);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('repairs known structural JSON defects and reports each repair', () => {
  const { root, lessons, output } = fixture();
  try {
    fs.writeFileSync(
      path.join(lessons, 'marking.Json'),
      '"assessment_and_marking_guide": {"criteria": []}',
    );
    fs.writeFileSync(
      path.join(lessons, 'package.Json'),
      '{"markingPackage":{"answerKey":[]}}`',
    );
    fs.writeFileSync(
      path.join(lessons, 'building_new_patterns.json'),
      '{"lesson_id":"building_new_patterns","scenario_engine":[]}{"id":"building_new_patterns","title":"Building New Patterns","sections":[]}',
    );
    fs.writeFileSync(
      path.join(lessons, 'co_regulation_basics.json'),
      '{"lessonId":"co_regulation_basics","title":"Co-Regulation Basics","lessonContent":[{"section":"Introduction","content":["One",',
    );

    const { report } = importDirectories({ sources: [lessons], output });

    assert.equal(report.counts.malformedFiles, 0);
    assert.equal(report.counts.repairedFiles, 4);
    assert.deepEqual(
      report.repaired.map((entry) => entry.repair).sort(),
      [
        'closed-truncated-co-regulation-structure',
        'merged-concatenated-objects',
        'removed-trailing-backticks',
        'wrapped-top-level-property',
      ],
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('rejects learner data but continues importing safe curriculum', () => {
  const { root, lessons, output } = fixture();
  try {
    writeJson(path.join(lessons, 'safe.json'), {
      id: 'safe-lesson',
      title: 'Safe lesson',
      learningGoal: 'Learn safely',
    });
    writeJson(path.join(lessons, 'unsafe.json'), {
      id: 'unsafe-lesson',
      title: 'Unsafe lesson',
      learningGoal: 'Must not import',
      learner_id: 'person-123',
    });

    const { catalog, report } = importDirectories({ sources: [lessons], output });

    assert.equal(report.counts.rejectedFiles, 1);
    assert.equal(catalog.standaloneLessons.length, 1);
    assert.equal(catalog.standaloneLessons[0].id, 'safe-lesson');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('output is deterministic across repeated imports', () => {
  const { root, courses, output } = fixture();
  try {
    writeJson(path.join(courses, 'course.json'), {
      id: 'course-a',
      title: 'Course A',
      lessons: [{ id: 'lesson-a', title: 'Lesson A' }],
    });

    importDirectories({ sources: [courses], output });
    const firstCatalog = fs.readFileSync(path.join(output, 'catalog.json'), 'utf8');
    const firstReport = fs.readFileSync(path.join(output, 'import-report.json'), 'utf8');
    importDirectories({ sources: [courses], output });

    assert.equal(fs.readFileSync(path.join(output, 'catalog.json'), 'utf8'), firstCatalog);
    assert.equal(fs.readFileSync(path.join(output, 'import-report.json'), 'utf8'), firstReport);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('does not recursively snapshot preserved import sources', () => {
  const { root, lessons, output } = fixture();
  try {
    writeJson(path.join(lessons, 'lesson.json'), {
      lessonId: 'stable-import',
      title: 'Stable import',
      learningGoal: 'Keep preserved source snapshots stable.',
    });

    importDirectories({ sources: [lessons], output });
    const snapshots = path.join(output, 'sources');
    importDirectories({ sources: [snapshots], output });

    assert.equal(fs.existsSync(path.join(snapshots, 'sources')), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
