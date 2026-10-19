import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test, { after } from 'node:test';
import { stripTypeScriptTypes } from 'node:module';

const queueKey = 'safesteps_offline_sync_queue';
let activeFixture;
const previousGlobals = {
  storage: Object.getOwnPropertyDescriptor(globalThis, '__safeStepsAsyncStorage'),
  supabase: Object.getOwnPropertyDescriptor(globalThis, '__safeStepsSupabase'),
};
Object.defineProperty(globalThis, '__safeStepsAsyncStorage', {
  configurable: true,
  value: {
    getItem: (...args) => activeFixture.storage.getItem(...args),
    setItem: (...args) => activeFixture.storage.setItem(...args),
  },
});
Object.defineProperty(globalThis, '__safeStepsSupabase', {
  configurable: true,
  value: {
    from: (...args) => activeFixture.supabase.from(...args),
  },
});
after(() => {
  if (previousGlobals.storage) Object.defineProperty(globalThis, '__safeStepsAsyncStorage', previousGlobals.storage);
  else delete globalThis.__safeStepsAsyncStorage;
  if (previousGlobals.supabase) Object.defineProperty(globalThis, '__safeStepsSupabase', previousGlobals.supabase);
  else delete globalThis.__safeStepsSupabase;
});
const source = await readFile(new URL('../../lib/offline/offlineSyncService.ts', import.meta.url), 'utf8');
const transformed = stripTypeScriptTypes(source
  .replace(
    /^import AsyncStorage from '@react-native-async-storage\/async-storage';\r?$/m,
    'const AsyncStorage = globalThis.__safeStepsAsyncStorage;',
  )
  .replace(
    /^import \{ supabase \} from '\.\.\/supabaseClient';\r?$/m,
    'const supabase = globalThis.__safeStepsSupabase;',
  ), { mode: 'strip' });
const offlineSync = await import(
  `data:text/javascript;base64,${Buffer.from(transformed).toString('base64')}`
);

function withStorage(run, initial = {}) {
  const values = new Map(Object.entries(initial));
  const storageCalls = [];
  const tableCalls = [];
  let dbResult;
  activeFixture = {
    storage: {
      async getItem(key) {
        storageCalls.push(['get', key]);
        return values.get(key) ?? null;
      },
      async setItem(key, value) {
        storageCalls.push(['set', key, value]);
        values.set(key, value);
      },
    },
    supabase: {
      from(table) {
        const query = {
          upsert: async (row) => {
            tableCalls.push(['upsert', table, row]);
            return await dbResult?.(table, row, 'upsert') ?? { error: null };
          },
          insert: async (row) => {
            tableCalls.push(['insert', table, row]);
            return await dbResult?.(table, row, 'insert') ?? { error: null };
          },
        };
        return query;
      },
    },
  };
  return Promise.resolve(run({
    values,
    storageCalls,
    tableCalls,
    setDbResult(value) { dbResult = value; },
  })).finally(() => { activeFixture = undefined; });
}

function makeItem(id, type, payload, timestamp = `2026-10-07T${String(id).padStart(2, '0')}:00:00.000Z`) {
  return { id, type, payload, timestamp };
}

test('enqueue appends an identified, timestamped item without replacing pending work', async () => {
  const existing = makeItem('existing', 'lesson_completion', { lessonId: 'lesson-1', userId: 'user-1' });
  await withStorage(async ({ values }) => {
    values.set(queueKey, JSON.stringify([existing]));
    await offlineSync.enqueueOfflineItem({
      type: 'lesson_completion',
      payload: { lessonId: 'lesson-2', userId: 'user-1' },
    });
    const queue = JSON.parse(values.get(queueKey));
    assert.equal(queue.length, 2);
    assert.deepEqual(queue[0], existing);
    assert.equal(queue[1].type, 'lesson_completion');
    assert.deepEqual(queue[1].payload, { lessonId: 'lesson-2', userId: 'user-1' });
    assert.match(queue[1].id, /^sync_\d+_[a-z0-9]{5}$/);
    assert.equal(Number.isNaN(Date.parse(queue[1].timestamp)), false);
  });
});

test('pending count reports stored item count and empty queues do not trigger writes', async () => {
  await withStorage(async ({ values, storageCalls }) => {
    assert.equal(await offlineSync.getPendingSyncCount(), 0);
    assert.deepEqual(await offlineSync.processSyncQueue(), { synced: 0, failed: 0 });
    assert.equal(storageCalls.some(([operation]) => operation === 'set'), false);

    values.set(queueKey, JSON.stringify([
      makeItem('one', 'lesson_completion', {}),
      makeItem('two', 'assessment_submit', {}),
    ]));
    assert.equal(await offlineSync.getPendingSyncCount(), 2);
  });
});

test('lesson completion upserts the canonical progress fields and removes synced items', async () => {
  const item = makeItem('lesson', 'lesson_completion', { lessonId: 'lesson-7', userId: 'actor-7' });
  await withStorage(async ({ values, tableCalls }) => {
    values.set(queueKey, JSON.stringify([item]));
    assert.deepEqual(await offlineSync.processSyncQueue(), { synced: 1, failed: 0 });
    assert.deepEqual(tableCalls, [[
      'upsert',
      'lesson_progress',
      {
        lesson_id: 'lesson-7',
        user_id: 'actor-7',
        completed_at: item.timestamp,
      },
    ]]);
    assert.deepEqual(JSON.parse(values.get(queueKey)), []);
  });
});

test('assessment submission inserts scores with the queued completion timestamp', async () => {
  const item = makeItem('assessment', 'assessment_submit', {
    assessmentType: 'protective_capacity',
    scores: { connection: 4 },
  });
  await withStorage(async ({ values, tableCalls }) => {
    values.set(queueKey, JSON.stringify([item]));
    assert.deepEqual(await offlineSync.processSyncQueue(), { synced: 1, failed: 0 });
    assert.deepEqual(tableCalls, [[
      'insert',
      'assessment_records',
      {
        assessment_type: 'protective_capacity',
        scores: { connection: 4 },
        created_at: item.timestamp,
      },
    ]]);
    assert.deepEqual(JSON.parse(values.get(queueKey)), []);
  });
});

test('database failures retain failed work while later items continue syncing', async () => {
  const failed = makeItem('failed', 'lesson_completion', { lessonId: 'lesson-failed', userId: 'actor' });
  const succeeded = makeItem('succeeded', 'assessment_submit', {
    assessmentType: 'parenting',
    scores: { safety: 2 },
  });
  await withStorage(async ({ values, tableCalls, setDbResult }) => {
    values.set(queueKey, JSON.stringify([failed, succeeded]));
    setDbResult(async (table) => table === 'lesson_progress'
      ? { error: new Error('temporary network failure') }
      : { error: null });
    assert.deepEqual(await offlineSync.processSyncQueue(), { synced: 1, failed: 1 });
    assert.deepEqual(tableCalls.map((call) => call[1]), ['lesson_progress', 'assessment_records']);
    assert.deepEqual(JSON.parse(values.get(queueKey)), [failed]);
  });
});

test('unimplemented queue item types remain pending instead of being discarded as synced', async () => {
  const reflection = makeItem('reflection', 'reflection_submit', { reflectionId: 'reflection-1' });
  const evidence = makeItem('evidence', 'evidence_upload', { evidenceId: 'evidence-1' });
  const supported = makeItem('lesson', 'lesson_completion', { lessonId: 'lesson-1', userId: 'actor' });
  await withStorage(async ({ values, tableCalls }) => {
    values.set(queueKey, JSON.stringify([reflection, supported, evidence]));
    assert.deepEqual(await offlineSync.processSyncQueue(), { synced: 1, failed: 2 });
    assert.deepEqual(tableCalls.map((call) => call[1]), ['lesson_progress']);
    assert.deepEqual(JSON.parse(values.get(queueKey)), [reflection, evidence]);
  });
});

test('cache round-trips structured values and returns null for misses', async () => {
  await withStorage(async ({ values, storageCalls }) => {
    const cached = { cases: [{ id: 'case-1', status: 'open' }], count: 1 };
    await offlineSync.cacheData('dashboard', cached);
    assert.equal(values.get('safesteps_cache_dashboard'), JSON.stringify(cached));
    assert.deepEqual(await offlineSync.getCachedData('dashboard'), cached);
    assert.equal(await offlineSync.getCachedData('missing'), null);
    assert.deepEqual(storageCalls.filter(([operation, key]) => operation === 'set' && key.startsWith('safesteps_cache_'))
      .map(([, key]) => key), ['safesteps_cache_dashboard']);
  });
});

test('corrupt persisted JSON fails visibly without overwriting the queue', async () => {
  await withStorage(async ({ values, storageCalls }) => {
    values.set(queueKey, '{invalid json');
    await assert.rejects(offlineSync.getPendingSyncCount(), SyntaxError);
    await assert.rejects(offlineSync.processSyncQueue(), SyntaxError);
    assert.equal(values.get(queueKey), '{invalid json');
    assert.equal(storageCalls.some(([operation]) => operation === 'set'), false);
  });
});
