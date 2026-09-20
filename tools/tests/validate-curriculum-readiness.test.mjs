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
const sourceScriptPath = path.join(repoRoot, 'tools', 'validate-curriculum-readiness.mjs');

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function createFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'safesteps-readiness-'));

  fs.mkdirSync(path.join(root, 'tools'), { recursive: true });
  fs.copyFileSync(sourceScriptPath, path.join(root, 'tools', 'validate-curriculum-readiness.mjs'));

  writeJson(path.join(root, 'lessons', 'lesson_a.json'), {
    id: 'lesson_a',
    title: 'Lesson A',
    sections: [],
    content: {
      overview: 'Use traceable evidence and human review before acting.',
    },
  });

  writeJson(path.join(root, 'modules', 'module_a.json'), {
    id: 'module_a',
    title: 'Module A',
    description: 'Operational workflow skills with review checkpoints.',
    type: 'module',
    lessons: ['lesson_a'],
    content: [],
  });

  writeJson(path.join(root, 'topics', 'topic_a.json'), {
    id: 'topic_a',
    topicId: 'topic-a',
    topicName: 'Topic A',
    modules: ['module_a'],
  });

  writeJson(path.join(root, 'src', 'safesteps', 'lessons', 'master-index.json'), {
    schemaVersion: '2026-09-09',
    generatedAt: '2026-09-20T00:00:00.000Z',
    counts: {
      lessons: 1,
      modules: 1,
      topics: 1,
      storybookAssets: 0,
    },
    lessons: [
      {
        id: 'lesson_a',
        title: 'Lesson A',
        sectionCount: 0,
        sourcePath: 'lessons/lesson_a.json',
      },
    ],
    modules: [
      {
        id: 'module_a',
        title: 'Module A',
        lessonRefCount: 1,
        contentBlockCount: 0,
        sourcePath: 'modules/module_a.json',
      },
    ],
    topics: [
      {
        id: 'topic_a',
        topicName: 'Topic A',
        moduleCount: 1,
        sourcePath: 'topics/topic_a.json',
      },
    ],
    storybooks: [],
  });

  writeJson(path.join(root, 'schema', 'curriculum-schema.json'), {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $defs: {
      lesson: {},
      module: {},
      topic: {},
      masterIndex: {},
    },
  });

  const downloadsRoot = path.join(root, 'Downloads', 'NEW READY TO UPLOAD Courses &  Content');
  writeJson(path.join(downloadsRoot, 'LESSONS', 'safesteps_lessons_1_to_47.json'), {
    lessons: [{ id: 'lesson_a' }],
  });
  writeJson(path.join(downloadsRoot, 'LESSONS', 'safesteps_lessons_30_to_40_min_batch_252_to_466.json'), {
    lessons: [{ id: 'lesson_a' }],
  });
  writeJson(path.join(downloadsRoot, 'LESSONS', 'safesteps_lessons_30_to_40_min_batch_468_to_780.json'), [
    { id: 'lesson_a' },
  ]);
  writeJson(path.join(downloadsRoot, 'safesteps_parent_challenges_pack', 'safesteps_parent_challenges.json'), [
    { id: 'lesson_a' },
  ]);

  return root;
}

function runReadiness(root) {
  return spawnSync(process.execPath, [path.join(root, 'tools', 'validate-curriculum-readiness.mjs')], {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      HOME: root,
    },
  });
}

function readEvidence(root) {
  return JSON.parse(fs.readFileSync(path.join(root, 'docs', 'content-readiness', 'evidence.json'), 'utf8'));
}

test('curriculum readiness passes for a consistent content graph and generated index', () => {
  const root = createFixture();
  try {
    const result = runReadiness(root);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Content readiness evidence written .* \(ready\)/);

    const evidence = readEvidence(root);
    assert.equal(evidence.status, 'ready');
    assert.deepEqual(evidence.summary.counts, {
      lessons: 1,
      modules: 1,
      topics: 1,
    });
    assert.deepEqual(evidence.summary.blockingIssues, []);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('curriculum readiness fails when the master index references missing content', () => {
  const root = createFixture();
  try {
    writeJson(path.join(root, 'src', 'safesteps', 'lessons', 'master-index.json'), {
      schemaVersion: '2026-09-09',
      generatedAt: '2026-09-20T00:00:00.000Z',
      counts: {
        lessons: 1,
        modules: 1,
        topics: 1,
      },
      lessons: [{ sourcePath: 'lessons/lesson_a.json' }],
      modules: [{ sourcePath: 'modules/module_missing.json' }],
      topics: [{ sourcePath: 'topics/topic_a.json' }],
      storybooks: [],
    });

    const result = runReadiness(root);
    assert.equal(result.status, 1);

    const evidence = readEvidence(root);
    assert.equal(evidence.status, 'incomplete');
    assert.ok(evidence.summary.blockingIssues.includes('master-index-mismatch'));
    assert.ok(
      evidence.validations.masterIndex.issues.includes('missing-index-source:modules/module_missing.json'),
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('curriculum readiness fails when topic and module references drift from available content', () => {
  const root = createFixture();
  try {
    writeJson(path.join(root, 'modules', 'module_a.json'), {
      id: 'module_a',
      title: 'Module A',
      description: 'Operational workflow skills with review checkpoints.',
      type: 'module',
      lessons: ['lesson_missing'],
      content: [],
    });
    writeJson(path.join(root, 'topics', 'topic_a.json'), {
      id: 'topic_a',
      topicId: 'topic-a',
      topicName: 'Topic A',
      modules: ['module_missing'],
    });

    const result = runReadiness(root);
    assert.equal(result.status, 1);

    const evidence = readEvidence(root);
    assert.equal(evidence.status, 'incomplete');
    assert.ok(evidence.summary.blockingIssues.includes('unresolved-topic-module-links'));
    assert.ok(evidence.summary.blockingIssues.includes('unresolved-module-lesson-links'));
    assert.deepEqual(evidence.validations.topicModuleLinks.unresolvedTopicModules, [
      {
        topic: 'topics/topic_a.json',
        moduleRef: 'module_missing',
      },
    ]);
    assert.deepEqual(evidence.validations.moduleLessonLinks.unresolvedModuleLessons, [
      {
        module: 'modules/module_a.json',
        lessonRef: 'lesson_missing',
      },
    ]);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
