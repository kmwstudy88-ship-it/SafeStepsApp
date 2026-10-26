import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const loaderPath = path.join(repoRoot, 'utils', 'loadContent.js');
const require = createRequire(import.meta.url);

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function createFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'safesteps-content-'));

  writeJson(path.join(root, 'lessons', 'lesson_a.json'), {
    id: 'lesson_a',
    title: 'Lesson A',
    content: '',
    sections: [],
  });

  writeJson(path.join(root, 'topics', 'topic_a.json'), {
    id: 'topic_a',
    topicId: 'topic-a',
    topicName: 'Topic A',
    caseworkerSummary: 'summary',
    modules: ['module_a'],
  });

  writeJson(path.join(root, 'src', 'safesteps', 'courses', 'module_a.json'), {
    id: 'module_a',
    title: 'Module A',
    level: 'general',
    lessons: ['lesson_a'],
  });

  writeJson(path.join(root, 'src', 'safesteps', 'programs', 'program_a.json'), {
    id: 'program_a',
    topicId: 'topic-a',
    topicName: 'Program A',
    caseworkerSummary: 'summary',
    modules: ['module_a'],
  });

  writeJson(path.join(root, 'src', 'safesteps', 'lessons', 'master-index.json'), {
    schemaVersion: '2026-09-09',
    generatedAt: '2026-09-18T00:00:00.000Z',
    counts: {
      lessons: 1,
      topics: 1,
    },
    lessons: [
      {
        id: 'lesson_a',
        sourcePath: 'lessons/lesson_a.json',
      },
    ],
    topics: [
      {
        id: 'topic_a',
        sourcePath: 'topics/topic_a.json',
      },
    ],
  });

  return root;
}

function withEnv(overrides, run) {
  const previous = {};
  for (const [key, value] of Object.entries(overrides)) {
    previous[key] = process.env[key];
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }

  try {
    return run();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
}

function loadContentForRoot(root, env = {}) {
  return withEnv(
    {
      SAFESTEPS_REPO_ROOT: root,
      ...env,
    },
    () => {
      delete require.cache[require.resolve(loaderPath)];
      try {
        return require(loaderPath);
      } finally {
        delete require.cache[require.resolve(loaderPath)];
      }
    },
  );
}

test('loadContent loads valid fixture registries and content manifest', () => {
  const root = createFixture();
  try {
    const content = loadContentForRoot(root, { NODE_ENV: 'test' });
    assert.equal(content.getLesson('lesson_a')?.id, 'lesson_a');
    assert.equal(content.getTopic('topic_a')?.id, 'topic_a');
    assert.equal(content.getCourse('module_a')?.id, 'module_a');
    assert.equal(content.getProgram('program_a')?.id, 'program_a');
    assert.equal(content.listLessons().length, 1);
    assert.equal(content.listTopics().length, 1);
    assert.equal(content.getContentManifest()?.counts?.lessons, 1);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('loadContent fails in production when a required content directory is missing', () => {
  const root = createFixture();
  try {
    fs.rmSync(path.join(root, 'lessons'), { recursive: true, force: true });

    assert.throws(
      () => loadContentForRoot(root, { NODE_ENV: 'production' }),
      (error) => {
        assert.equal(error.code, 'CONTENT_LOAD_ERROR');
        assert.match(error.message, /CONTENT_DIRECTORY_MISSING/);
        assert.match(error.message, /lessons/);
        return true;
      },
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('loadContent fails when master index file is missing in production', () => {
  const root = createFixture();
  try {
    fs.rmSync(path.join(root, 'src', 'safesteps', 'lessons', 'master-index.json'), { force: true });

    assert.throws(
      () => loadContentForRoot(root, { NODE_ENV: 'production' }),
      (error) => {
        assert.equal(error.code, 'CONTENT_LOAD_ERROR');
        assert.match(error.message, /MASTER_INDEX_MISSING/);
        return true;
      },
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('loadContent fails when a content JSON file is malformed', () => {
  const root = createFixture();
  try {
    fs.writeFileSync(path.join(root, 'topics', 'topic_a.json'), '{"id":"topic_a",', 'utf8');

    assert.throws(
      () => loadContentForRoot(root, { NODE_ENV: 'test' }),
      (error) => {
        assert.equal(error.code, 'CONTENT_LOAD_ERROR');
        assert.match(error.message, /CONTENT_JSON_INVALID/);
        assert.match(error.message, /topic_a\.json/);
        return true;
      },
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('loadContent fails when duplicate IDs exist in a registry', () => {
  const root = createFixture();
  try {
    writeJson(path.join(root, 'lessons', 'lesson_duplicate.json'), {
      id: 'lesson_a',
      title: 'Duplicate Lesson A',
      content: '',
      sections: [],
    });

    assert.throws(
      () => loadContentForRoot(root, { NODE_ENV: 'test' }),
      (error) => {
        assert.equal(error.code, 'CONTENT_LOAD_ERROR');
        assert.match(error.message, /CONTENT_ID_DUPLICATE/);
        assert.match(error.message, /lesson_a/);
        return true;
      },
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('loadContent fails when course references a missing lesson ID', () => {
  const root = createFixture();
  try {
    writeJson(path.join(root, 'src', 'safesteps', 'courses', 'module_a.json'), {
      id: 'module_a',
      title: 'Module A',
      level: 'general',
      lessons: ['lesson_missing'],
    });

    assert.throws(
      () => loadContentForRoot(root, { NODE_ENV: 'test' }),
      (error) => {
        assert.equal(error.code, 'CONTENT_LOAD_ERROR');
        assert.match(error.message, /CONTENT_REFERENCE_MISSING_TARGET/);
        assert.match(error.message, /lesson_missing/);
        return true;
      },
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('loadContent fails when master index does not match on-disk content', () => {
  const root = createFixture();
  try {
    writeJson(path.join(root, 'src', 'safesteps', 'lessons', 'master-index.json'), {
      schemaVersion: '2026-09-09',
      generatedAt: '2026-09-18T00:00:00.000Z',
      counts: {
        lessons: 2,
        topics: 1,
      },
      lessons: [
        {
          id: 'lesson_a',
          sourcePath: 'lessons/lesson_a.json',
        },
      ],
      topics: [
        {
          id: 'topic_a',
          sourcePath: 'topics/topic_a.json',
        },
      ],
    });

    assert.throws(
      () => loadContentForRoot(root, { NODE_ENV: 'test' }),
      (error) => {
        assert.equal(error.code, 'CONTENT_LOAD_ERROR');
        assert.match(error.message, /MASTER_INDEX_COUNT_MISMATCH/);
        return true;
      },
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
