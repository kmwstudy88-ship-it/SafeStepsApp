import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const sourceScriptPath = path.join(repoRoot, 'tools', 'import-curriculum-source.js');

function createFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'safesteps-import-'));
  fs.mkdirSync(path.join(root, 'tools'), { recursive: true });
  fs.copyFileSync(sourceScriptPath, path.join(root, 'tools', 'import-curriculum-source.js'));
  return root;
}

function writeSource(root, payload, fileName = 'source.json') {
  const sourcePath = path.join(root, fileName);
  fs.writeFileSync(sourcePath, JSON.stringify(payload, null, 2));
  return sourcePath;
}

function runImport(root, args) {
  const result = spawnSync(process.execPath, [path.join(root, 'tools', 'import-curriculum-source.js'), ...args], {
    cwd: root,
    encoding: 'utf8',
  });
  return result;
}

test('import requires explicit source version when source payload has no version', () => {
  const root = createFixture();
  try {
    writeSource(root, {
      title: 'Unversioned',
      lessons: [{ id: 'lesson-1', title: 'Lesson One', content: 'x', evidenceTask: 'y' }],
    });

    const result = runImport(root, ['--kind', 'course', '--source', './source.json']);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Missing source version/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('import is repeatable for identical source + version and preserves deterministic outputs', () => {
  const root = createFixture();
  try {
    writeSource(root, {
      id: 'course-a',
      title: 'Course A',
      version: 'v1.2.0',
      lessons: [
        { id: 'lesson-a', title: 'Lesson A', content: 'alpha', evidenceTask: 'task-a' },
        { id: 'lesson-b', title: 'Lesson B', content: 'beta', evidenceTask: 'task-b' },
      ],
    });

    const first = runImport(root, ['--kind', 'course', '--source', './source.json']);
    assert.equal(first.status, 0, first.stderr);

    const second = runImport(root, ['--kind', 'course', '--source', './source.json']);
    assert.equal(second.status, 0, second.stderr);

    const extractedRoot = path.join(
      root,
      'src',
      'safesteps',
      'imports',
      'curriculum-seeds',
      'lessons',
      'extracted',
      'course-a',
      'v-v1-2-0',
    );
    const manifestPath = path.join(extractedRoot, 'manifest.json');
    assert.equal(fs.existsSync(manifestPath), true);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.equal(manifest.sourceVersion, 'v1.2.0');
    assert.equal(manifest.extractedLessonCount, 2);
    assert.equal(manifest.lessonFiles.length, 2);

    const lessonPath = path.join(root, manifest.lessonFiles[0]);
    const lesson = JSON.parse(fs.readFileSync(lessonPath, 'utf8'));
    assert.equal(lesson.curriculumSource.sourceVersion, 'v1.2.0');
    assert.equal(typeof lesson.curriculumSource.sourceDigest, 'string');
    assert.equal('importedAt' in lesson.curriculumSource, false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('import rejects learner-scoped fields in source content', () => {
  const root = createFixture();
  try {
    writeSource(root, {
      title: 'Unsafe payload',
      version: '1',
      lessons: [{ id: 'lesson-1', title: 'Lesson 1', evidenceTask: 'x', learner_id: 'abc123' }],
    });

    const result = runImport(root, ['--kind', 'course', '--source', './source.json']);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /learner-data fields/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
