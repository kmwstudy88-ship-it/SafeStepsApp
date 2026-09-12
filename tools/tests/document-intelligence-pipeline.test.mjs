import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pipelinePath = require.resolve('../../backend/document-intelligence/pipeline.js');
const supabasePath = require.resolve('../../backend/document-intelligence/supabase.js');
const aiPath = require.resolve('../../backend/document-intelligence/ai.js');

function cloneCacheEntry(entry) {
  return entry ? { ...entry } : undefined;
}

async function withLoadedPipeline({ admin, ai }, run) {
  const previousPipeline = cloneCacheEntry(require.cache[pipelinePath]);
  const previousSupabase = cloneCacheEntry(require.cache[supabasePath]);
  const previousAi = cloneCacheEntry(require.cache[aiPath]);

  delete require.cache[pipelinePath];
  require.cache[supabasePath] = {
    id: supabasePath,
    filename: supabasePath,
    loaded: true,
    exports: { admin },
  };
  require.cache[aiPath] = {
    id: aiPath,
    filename: aiPath,
    loaded: true,
    exports: {
      ANALYSIS_SCHEMA_VERSION: 'analysis-schema',
      COMPARISON_SCHEMA_VERSION: 'comparison-schema',
      providerName: () => 'openai',
      analyzeDocument: async () => ({ provider: 'openai', model: 'unit-model', result: {}, usage: {} }),
      compareDocuments: async () => ({ provider: 'openai', model: 'unit-model', result: {}, usage: {} }),
      ...(ai || {}),
    },
  };

  try {
    const pipeline = require(pipelinePath);
    return await run(pipeline);
  } finally {
    delete require.cache[pipelinePath];
    if (previousPipeline) require.cache[pipelinePath] = previousPipeline;
    else delete require.cache[pipelinePath];

    if (previousSupabase) require.cache[supabasePath] = previousSupabase;
    else delete require.cache[supabasePath];

    if (previousAi) require.cache[aiPath] = previousAi;
    else delete require.cache[aiPath];
  }
}

function makeAdmin(resolveQuery, storage = {}) {
  const calls = {
    queries: [],
    uploads: [],
    removals: [],
    downloads: [],
    rpc: [],
  };

  const admin = {
    storage: {
      from(bucket) {
        return {
          async upload(path, buffer, options) {
            calls.uploads.push({ bucket, path, buffer, options });
            return storage.upload ? storage.upload({ bucket, path, buffer, options }, calls) : { error: null };
          },
          async remove(paths) {
            calls.removals.push({ bucket, paths });
            return storage.remove ? storage.remove({ bucket, paths }, calls) : { error: null };
          },
          async download(path) {
            calls.downloads.push({ bucket, path });
            if (!storage.download) throw new Error(`Unexpected download for ${bucket}:${path}`);
            return storage.download({ bucket, path }, calls);
          },
        };
      },
    },
    async rpc(name, args) {
      calls.rpc.push({ name, args });
      if (name === 'claim_document_analysis_jobs') return resolveQuery({ table: '__rpc__', op: name, args, mode: 'rpc' }, calls);
      throw new Error(`Unhandled rpc: ${name}`);
    },
    from(table) {
      const state = { table, op: 'select', filters: [], columns: undefined, payload: undefined, order: undefined, limit: undefined };
      const builder = {
        insert(payload) {
          state.op = 'insert';
          state.payload = payload;
          return builder;
        },
        update(payload) {
          state.op = 'update';
          state.payload = payload;
          return builder;
        },
        select(columns) {
          state.columns = columns;
          return builder;
        },
        eq(key, value) {
          state.filters.push({ type: 'eq', key, value });
          return builder;
        },
        in(key, values) {
          state.filters.push({ type: 'in', key, values });
          return builder;
        },
        order(key, options) {
          state.order = { key, ...(options || {}) };
          return builder;
        },
        limit(value) {
          state.limit = value;
          return builder;
        },
        single() {
          return Promise.resolve(finalize('single'));
        },
        maybeSingle() {
          return Promise.resolve(finalize('maybeSingle'));
        },
        then(resolve, reject) {
          return Promise.resolve(finalize('then')).then(resolve, reject);
        },
      };

      function finalize(mode) {
        const snapshot = {
          table: state.table,
          op: state.op,
          filters: state.filters.map((filter) => ({ ...filter, values: filter.values ? [...filter.values] : undefined })),
          columns: state.columns,
          payload: state.payload,
          order: state.order ? { ...state.order } : undefined,
          limit: state.limit,
          mode,
        };
        calls.queries.push(snapshot);
        return resolveQuery(snapshot, calls);
      }

      return builder;
    },
  };

  return { admin, calls };
}

async function withoutConsoleError(run) {
  const original = console.error;
  console.error = () => {};
  try {
    return await run();
  } finally {
    console.error = original;
  }
}

test('createUploadDocument stores inline text uploads with a sanitized storage path', async () => {
  const { admin, calls } = makeAdmin((query) => {
    if (query.table === 'documents' && query.op === 'insert') return { data: { ...query.payload }, error: null };
    if (query.table === 'document_analyses' && query.op === 'insert') return { data: { id: 'analysis-1', ...query.payload }, error: null };
    if (query.table === 'document_analysis_jobs' && query.op === 'insert') return { data: { id: 'job-1', ...query.payload }, error: null };
    throw new Error(`Unhandled query ${query.table}:${query.op}:${query.mode}`);
  });

  await withLoadedPipeline({ admin }, async ({ createUploadDocument }) => {
    const result = await createUploadDocument({
      userId: 'user-1',
      caseId: 'case-1',
      fileName: 'Unsafe name (draft).txt',
      mimeType: 'text/plain',
      contentBase64: Buffer.from('hello world', 'utf8').toString('base64'),
    });

    assert.equal(result.document.extracted_text, 'hello world');
    assert.equal(result.document.metadata.extraction, 'inline');
    assert.match(result.document.storage_path, /^user-1\/[0-9a-f-]{36}\/Unsafe_name_draft_.txt$/i);
    assert.equal(calls.uploads[0].bucket, 'document-intelligence');
    assert.equal(calls.uploads[0].options.contentType, 'text/plain');
  });
});

test('createComparison rejects requests that collapse to fewer than two unique document IDs', async () => {
  const { admin } = makeAdmin(() => {
    throw new Error('Database should not be queried for invalid comparisons');
  });

  await withLoadedPipeline({ admin }, async ({ createComparison }) => {
    await assert.rejects(
      createComparison({ userId: 'user-1', documentIds: ['doc-a', 'doc-a'] }),
      { message: 'Comparison requires 2 to 10 unique document IDs' },
    );
  });
});

test('createComparison enqueues only unique owned document IDs', async () => {
  const { admin, calls } = makeAdmin((query) => {
    if (query.table === 'documents' && query.op === 'select') return { data: [{ id: 'doc-a' }, { id: 'doc-b' }], error: null };
    if (query.table === 'document_comparisons' && query.op === 'insert') return { data: { id: 'comparison-1', ...query.payload }, error: null };
    if (query.table === 'document_analysis_jobs' && query.op === 'insert') return { data: { id: 'job-1', ...query.payload }, error: null };
    throw new Error(`Unhandled query ${query.table}:${query.op}:${query.mode}`);
  });

  await withLoadedPipeline({ admin }, async ({ createComparison }) => {
    const result = await createComparison({ userId: 'user-1', caseId: 'case-1', documentIds: ['doc-a', 'doc-a', 'doc-b'] });

    const ownershipQuery = calls.queries.find((query) => query.table === 'documents' && query.op === 'select');
    const comparisonInsert = calls.queries.find((query) => query.table === 'document_comparisons' && query.op === 'insert');

    assert.deepEqual(ownershipQuery.filters.find((filter) => filter.type === 'in')?.values, ['doc-a', 'doc-b']);
    assert.deepEqual(comparisonInsert.payload.document_ids, ['doc-a', 'doc-b']);
    assert.equal(result.comparison.id, 'comparison-1');
  });
});

test('processNextJobs requeues failed analysis jobs before the final attempt', async () => {
  const failure = new Error('provider unavailable');
  const startedAt = Date.now();
  const { admin, calls } = makeAdmin((query) => {
    if (query.table === '__rpc__' && query.op === 'claim_document_analysis_jobs') {
      return {
        data: [{
          id: 'job-1',
          job_type: 'document_analysis',
          document_id: 'doc-1',
          user_id: 'user-1',
          payload: { analysis_id: 'analysis-1' },
          attempts: 0,
          max_attempts: 2,
          available_at: '2026-09-11T00:00:00.000Z',
        }],
        error: null,
      };
    }
    if (query.table === 'documents' && query.op === 'select') {
      return { data: { id: 'doc-1', extracted_text: 'sample text' }, error: null };
    }
    if (query.op === 'update') return { data: null, error: null };
    throw new Error(`Unhandled query ${query.table}:${query.op}:${query.mode}`);
  });

  await withoutConsoleError(() => withLoadedPipeline({ admin, ai: { analyzeDocument: async () => { throw failure; } } }, async ({ processNextJobs }) => {
    assert.equal(await processNextJobs(1), 1);
  }));

  const jobUpdate = calls.queries.filter((query) => query.table === 'document_analysis_jobs' && query.op === 'update').at(-1);
  const failedDocumentUpdate = calls.queries.find((query) => query.table === 'documents' && query.op === 'update' && query.payload.processing_status === 'failed');

  assert.equal(jobUpdate.payload.status, 'queued');
  assert.equal(jobUpdate.payload.last_error, 'provider unavailable');
  assert.equal(jobUpdate.payload.completed_at, null);
  assert.ok(Date.parse(jobUpdate.payload.available_at) >= startedAt + 1500);
  assert.equal(failedDocumentUpdate, undefined);
});

test('processNextJobs marks terminal analysis failures on the document and analysis records', async () => {
  const failure = new Error('provider unavailable');
  const { admin, calls } = makeAdmin((query) => {
    if (query.table === '__rpc__' && query.op === 'claim_document_analysis_jobs') {
      return {
        data: [{
          id: 'job-1',
          job_type: 'document_analysis',
          document_id: 'doc-1',
          user_id: 'user-1',
          payload: { analysis_id: 'analysis-1' },
          attempts: 2,
          max_attempts: 2,
          available_at: '2026-09-11T00:00:00.000Z',
        }],
        error: null,
      };
    }
    if (query.table === 'documents' && query.op === 'select') {
      return { data: { id: 'doc-1', extracted_text: 'sample text' }, error: null };
    }
    if (query.op === 'update') return { data: null, error: null };
    throw new Error(`Unhandled query ${query.table}:${query.op}:${query.mode}`);
  });

  await withoutConsoleError(() => withLoadedPipeline({ admin, ai: { analyzeDocument: async () => { throw failure; } } }, async ({ processNextJobs }) => {
    assert.equal(await processNextJobs(1), 1);
  }));

  const jobUpdate = calls.queries.filter((query) => query.table === 'document_analysis_jobs' && query.op === 'update').at(-1);
  const documentUpdate = calls.queries.filter((query) => query.table === 'documents' && query.op === 'update').at(-1);
  const analysisUpdate = calls.queries.filter((query) => query.table === 'document_analyses' && query.op === 'update').at(-1);

  assert.equal(jobUpdate.payload.status, 'failed');
  assert.equal(documentUpdate.payload.processing_status, 'failed');
  assert.equal(analysisUpdate.payload.status, 'failed');
  assert.equal(analysisUpdate.payload.error_code, 'ANALYSIS_FAILED');
  assert.equal(analysisUpdate.payload.error_message, 'provider unavailable');
});
