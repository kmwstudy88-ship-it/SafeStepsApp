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
      createEmptyMediaAssessment: () => ({ domains: [] }),
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
        delete() {
          state.op = 'delete';
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
        is(key, value) {
          state.filters.push({ type: 'is', key, value });
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
        if (snapshot.table === 'users' && snapshot.op === 'select') return { data: null, error: null };
        if (snapshot.table === 'roles' && snapshot.op === 'select') return { data: null, error: null };
        if (snapshot.table === 'team_memberships' && snapshot.op === 'select') return { data: [], error: null };
        if (snapshot.table === 'case_assignments' && snapshot.op === 'select') return { data: null, error: null };
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

test('createUploadDocument rolls back stored artifacts when job creation fails', async () => {
  const failure = new Error('queue unavailable');
  const { admin, calls } = makeAdmin((query) => {
    if (query.table === 'documents' && query.op === 'select') return { data: null, error: null };
    if (query.table === 'documents' && query.op === 'insert') return { data: { ...query.payload }, error: null };
    if (query.table === 'document_analyses' && query.op === 'insert') return { data: { id: 'analysis-1', ...query.payload }, error: null };
    if (query.table === 'document_analyses' && query.op === 'delete') return { data: null, error: null };
    if (query.table === 'document_analysis_jobs' && query.op === 'insert') return { data: null, error: failure };
    if (query.table === 'documents' && query.op === 'delete') return { data: null, error: null };
    throw new Error(`Unhandled query ${query.table}:${query.op}:${query.mode}`);
  });

  await withLoadedPipeline({ admin }, async ({ createUploadDocument }) => {
    await assert.rejects(
      createUploadDocument({
        authUserId: 'user-1',
        caseId: null,
        fileName: 'Unsafe name (draft).txt',
        mimeType: 'text/plain',
        contentBase64: Buffer.from('hello world', 'utf8').toString('base64'),
      }),
      { message: 'queue unavailable' },
    );
  });

  const documentDelete = calls.queries.find((query) => query.table === 'documents' && query.op === 'delete');
  assert.equal(Boolean(documentDelete?.filters.find((filter) => filter.type === 'eq')?.value), true);
  assert.deepEqual(calls.removals[0], {
    bucket: 'document-intelligence',
    paths: [calls.uploads[0].path],
  });
});

test('createUploadDocument stores inline text uploads with a sanitized storage path', async () => {
  const { admin, calls } = makeAdmin((query) => {
    if (query.table === 'documents' && query.op === 'select') return { data: null, error: null };
    if (query.table === 'documents' && query.op === 'insert') return { data: { ...query.payload }, error: null };
    if (query.table === 'document_analyses' && query.op === 'insert') return { data: { id: 'analysis-1', ...query.payload }, error: null };
    if (query.table === 'document_analysis_jobs' && query.op === 'insert') return { data: { id: 'job-1', ...query.payload }, error: null };
    throw new Error(`Unhandled query ${query.table}:${query.op}:${query.mode}`);
  });

  await withLoadedPipeline({ admin }, async ({ createUploadDocument }) => {
    const result = await createUploadDocument({
      authUserId: 'user-1',
      caseId: null,
      fileName: 'Unsafe name (draft).txt',
      mimeType: 'text/plain',
      contentBase64: Buffer.from('hello world', 'utf8').toString('base64'),
      metadata: {
        document_type: 'case_note',
        author_role: 'caseworker',
        creation_date: '2026-09-19T00:00:00.000Z',
        source_system: 'unit-test',
        version_number: 'v2',
      },
    });

    assert.equal(result.document.extracted_text, 'hello world');
    assert.equal(result.document.metadata.extraction, 'inline');
    assert.equal(result.document.metadata.document_type, 'case_note');
    assert.equal(result.document.metadata.author_role, 'caseworker');
    assert.equal(result.document.metadata.creation_date, '2026-09-19T00:00:00.000Z');
    assert.equal(result.document.metadata.source_system, 'unit-test');
    assert.equal(result.document.metadata.version_number, 'v2');
    assert.match(result.document.storage_path, /^user-1\/[0-9a-f-]{36}\/Unsafe_name_draft_.txt$/i);
    assert.equal(calls.uploads[0].bucket, 'document-intelligence');
    assert.equal(calls.uploads[0].options.contentType, 'text/plain');
  });
});

test('createUploadDocument rejects unsupported file types without extracted text', async () => {
  const { admin } = makeAdmin((query) => {
    if (query.table === 'documents' && query.op === 'select') return { data: null, error: null };
    throw new Error(`Unhandled query ${query.table}:${query.op}:${query.mode}`);
  });

  await withLoadedPipeline({ admin }, async ({ createUploadDocument }) => {
    await assert.rejects(
      createUploadDocument({
        authUserId: 'user-1',
        caseId: null,
        fileName: 'malware.exe',
        mimeType: 'application/x-msdownload',
        contentBase64: Buffer.from('not allowed', 'utf8').toString('base64'),
      }),
      (error) => {
        assert.equal(error.message, 'Unsupported file type. Provide extractedText or upload a supported document format.');
        assert.equal(error.statusCode, 400);
        return true;
      },
    );
  });
});

test('createUploadDocument accepts legacy userId callers when authUserId is unavailable', async () => {
  const { admin, calls } = makeAdmin((query) => {
    if (query.table === 'documents' && query.op === 'select') return { data: null, error: null };
    if (query.table === 'documents' && query.op === 'insert') return { data: { ...query.payload }, error: null };
    if (query.table === 'document_analyses' && query.op === 'insert') return { data: { id: 'analysis-1', ...query.payload }, error: null };
    if (query.table === 'document_analysis_jobs' && query.op === 'insert') return { data: { id: 'job-1', ...query.payload }, error: null };
    throw new Error(`Unhandled query ${query.table}:${query.op}:${query.mode}`);
  });

  await withLoadedPipeline({ admin }, async ({ createUploadDocument }) => {
    const result = await createUploadDocument({
      userId: 'legacy-user-1',
      caseId: null,
      fileName: 'legacy.txt',
      mimeType: 'text/plain',
      contentBase64: Buffer.from('legacy flow', 'utf8').toString('base64'),
    });
    assert.equal(result.document.user_id, 'legacy-user-1');
  });

  assert.match(calls.uploads[0].path, /^legacy-user-1\//);
});

test('createUploadDocument reuses existing document on duplicate sha256 and enqueues fresh analysis', async () => {
  const { admin, calls } = makeAdmin((query) => {
    if (query.table === 'documents' && query.op === 'select') {
      if (query.filters.find((filter) => filter.key === 'sha256')) {
        return {
          data: { id: 'doc-existing', user_id: 'user-1', case_id: null, sha256: 'same' },
          error: null,
        };
      }
      throw new Error(`Unexpected document select without sha256 filter: ${JSON.stringify(query)}`);
    }
    if (query.table === 'document_analyses' && query.op === 'insert') return { data: { id: 'analysis-1', ...query.payload }, error: null };
    if (query.table === 'document_analysis_jobs' && query.op === 'insert') return { data: { id: 'job-1', ...query.payload }, error: null };
    throw new Error(`Unhandled query ${query.table}:${query.op}:${query.mode}`);
  });

  await withLoadedPipeline({ admin }, async ({ createUploadDocument }) => {
    const result = await createUploadDocument({
      authUserId: 'user-1',
      caseId: null,
      fileName: 'same.txt',
      mimeType: 'text/plain',
      contentBase64: Buffer.from('same body', 'utf8').toString('base64'),
    });

    assert.equal(result.document.id, 'doc-existing');
    assert.equal(result.duplicate, true);
    assert.equal(result.analysis.id, 'analysis-1');
  });

  const uploadCalls = calls.uploads.length;
  assert.equal(uploadCalls, 0);
});

test('getDocumentForUser denies access when the case is owned by a different user', async () => {
  const { admin, calls } = makeAdmin((query) => {
    if (query.table === 'documents' && query.op === 'select') {
      return {
        data: { id: 'doc-1', user_id: 'user-1', case_id: 'case-1', metadata: {} },
        error: null,
      };
    }
    if (query.table === 'cases' && query.op === 'select') {
      return {
        data: { id: 'case-1', parent_user_id: 'user-2' },
        error: null,
      };
    }
    throw new Error(`Unhandled query ${query.table}:${query.op}:${query.mode}`);
  });

  await withLoadedPipeline({ admin }, async ({ getDocumentForUser }) => {
    await assert.rejects(
      getDocumentForUser('doc-1', 'user-1'),
      (error) => {
        assert.equal(error.message, 'Case access denied');
        assert.equal(error.statusCode, 403);
        return true;
      },
    );
  });

  const analysisQuery = calls.queries.find((query) => query.table === 'document_analyses' && query.op === 'select');
  assert.equal(analysisQuery, undefined);
});

test('createComparison rejects requests that collapse to fewer than two unique document IDs', async () => {
  const { admin } = makeAdmin(() => {
    throw new Error('Database should not be queried for invalid comparisons');
  });

  await withLoadedPipeline({ admin }, async ({ createComparison }) => {
    await assert.rejects(
      createComparison({ authUserId: 'user-1', documentIds: ['doc-a', 'doc-a'] }),
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
    const result = await createComparison({ authUserId: 'user-1', caseId: null, documentIds: ['doc-a', 'doc-a', 'doc-b'] });

    const ownershipQuery = calls.queries.find((query) =>
      query.table === 'documents'
      && query.op === 'select'
      && query.filters.some((filter) => filter.type === 'in' && filter.key === 'id'),
    );
    const comparisonInsert = calls.queries.find((query) => query.table === 'document_comparisons' && query.op === 'insert');

    assert.deepEqual(ownershipQuery.filters.find((filter) => filter.type === 'in' && filter.key === 'id')?.values, ['doc-a', 'doc-b']);
    assert.deepEqual(comparisonInsert.payload.document_ids, ['doc-a', 'doc-b']);
    assert.equal(result.comparison.id, 'comparison-1');
  });
});

test('processNextJobs preserves requested comparison order when building comparison input', async () => {
  let comparedItems = [];
  const { admin, calls } = makeAdmin((query) => {
    if (query.table === '__rpc__' && query.op === 'claim_document_analysis_jobs') {
      return {
        data: [{
          id: 'job-1',
          job_type: 'document_comparison',
          comparison_id: 'comparison-1',
          user_id: 'user-1',
          payload: {},
          attempts: 0,
          max_attempts: 2,
          available_at: '2026-09-11T00:00:00.000Z',
        }],
        error: null,
      };
    }
    if (query.table === 'document_comparisons' && query.op === 'select') {
      return {
        data: { id: 'comparison-1', user_id: 'user-1', document_ids: ['doc-a', 'doc-b'] },
        error: null,
      };
    }
    if (query.table === 'document_analysis_jobs' && query.op === 'update') return { data: null, error: null };
    if (query.table === 'document_comparisons' && query.op === 'update') return { data: null, error: null };
    if (query.table === 'documents' && query.op === 'select') {
      return {
        data: [
          { id: 'doc-b', file_name: 'b.txt', extracted_text: 'Document B' },
          { id: 'doc-a', file_name: 'a.txt', extracted_text: 'Document A' },
        ],
        error: null,
      };
    }
    if (query.table === 'document_analyses' && query.op === 'select') return { data: null, error: null };
    throw new Error(`Unhandled query ${query.table}:${query.op}:${query.mode}`);
  });

  await withLoadedPipeline({
    admin,
    ai: {
      compareDocuments: async (items) => {
        comparedItems = items;
        return { provider: 'openai', model: 'unit-model', result: { overview: 'ok' }, usage: {} };
      },
    },
  }, async ({ processNextJobs }) => {
    assert.equal(await processNextJobs(1), 1);
  });

  assert.deepEqual(comparedItems.map((item) => item.document.id), ['doc-a', 'doc-b']);
  const completionUpdate = calls.queries.filter((query) => query.table === 'document_analysis_jobs' && query.op === 'update').at(-1);
  assert.equal(completionUpdate.payload.status, 'completed');
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

test('processNextJobs preserves upgraded media assessment domains in risk output', async () => {
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

  await withLoadedPipeline({
    admin,
    ai: {
      analyzeDocument: async () => ({
        provider: 'openai',
        model: 'unit-model',
        usage: {},
        result: {
          risk: { score: 12, level: 'low' },
          media_assessment: {
            domains: [{
              domain_id: 'environmental_safety',
              domain_name: 'Environmental Safety',
              signals_observed: ['Hazard mapping (weapons, substances, clutter)'],
              risk_flags: ['Unsafe sleeping setups'],
              protective_flags: [],
              notes: 'Observed clutter near sleep space.',
              confidence: 0.62,
            }],
          },
        },
      }),
    },
  }, async ({ processNextJobs }) => {
    assert.equal(await processNextJobs(1), 1);
  });

  const analysisUpdate = calls.queries.filter((query) => query.table === 'document_analyses' && query.op === 'update').at(-1);
  assert.equal(analysisUpdate.payload.risk.media_assessment.domains[0].domain_id, 'environmental_safety');
  assert.equal(analysisUpdate.payload.risk.media_assessment.domains[0].risk_flags[0], 'Unsafe sleeping setups');
});

test('getDocumentForUser normalizes media assessment from persisted analysis payloads', async () => {
  const { admin } = makeAdmin((query) => {
    if (query.table === 'documents' && query.op === 'select') {
      return { data: { id: 'doc-1', user_id: 'user-1' }, error: null };
    }
    if (query.table === 'document_analyses' && query.op === 'select') {
      return {
        data: {
          id: 'analysis-1',
          status: 'completed',
          risk: {},
          raw_output: {
            media_assessment: {
              domains: [{
                domain_id: 'digital_integrity_and_authenticity',
                domain_name: 'Digital Integrity & Authenticity',
                signals_observed: ['Metadata validation'],
                risk_flags: ['Any tampering evidence'],
                protective_flags: [],
                notes: 'Metadata mismatch detected.',
                confidence: 0.71,
              }],
            },
          },
        },
        error: null,
      };
    }
    throw new Error(`Unhandled query ${query.table}:${query.op}:${query.mode}`);
  });

  await withLoadedPipeline({ admin }, async ({ getDocumentForUser }) => {
    const result = await getDocumentForUser('doc-1', 'user-1');
    assert.equal(result.analysis.media_assessment.domains[0].domain_id, 'digital_integrity_and_authenticity');
    assert.equal(result.analysis.media_assessment.domains[0].signals_observed[0], 'Metadata validation');
  });
});

test('getDocumentForUser falls back to nested raw_output risk media assessment', async () => {
  const { admin } = makeAdmin((query) => {
    if (query.table === 'documents' && query.op === 'select') {
      return { data: { id: 'doc-1', user_id: 'user-1' }, error: null };
    }
    if (query.table === 'document_analyses' && query.op === 'select') {
      return {
        data: {
          id: 'analysis-1',
          status: 'completed',
          risk: {},
          raw_output: {
            risk: {
              media_assessment: {
                domains: [{
                  domain_id: 'contextual_reliability',
                  domain_name: 'Contextual Reliability',
                  signals_observed: ['Selective recording'],
                  risk_flags: ['Biased recording intent'],
                  protective_flags: [],
                  notes: 'Context appears selectively clipped.',
                  confidence: 0.56,
                }],
              },
            },
          },
        },
        error: null,
      };
    }
    throw new Error(`Unhandled query ${query.table}:${query.op}:${query.mode}`);
  });

  await withLoadedPipeline({ admin }, async ({ getDocumentForUser }) => {
    const result = await getDocumentForUser('doc-1', 'user-1');
    assert.equal(result.analysis.media_assessment.domains[0].domain_id, 'contextual_reliability');
    assert.equal(result.analysis.media_assessment.domains[0].risk_flags[0], 'Biased recording intent');
  });
});

test('deleteDocumentForUser removes storage object and document row for the owner', async () => {
  const { admin, calls } = makeAdmin((query) => {
    if (query.table === 'documents' && query.op === 'select') {
      return {
        data: {
          id: 'doc-1',
          user_id: 'user-1',
          case_id: null,
          storage_path: 'user-1/doc-1/file.txt',
        },
        error: null,
      };
    }
    if (query.table === 'documents' && query.op === 'delete') return { data: null, error: null };
    throw new Error(`Unhandled query ${query.table}:${query.op}:${query.mode}`);
  });

  await withLoadedPipeline({ admin }, async ({ deleteDocumentForUser }) => {
    const result = await deleteDocumentForUser('doc-1', 'user-1', 'user_request');
    assert.equal(result.deleted, true);
    assert.equal(result.id, 'doc-1');
  });

  assert.deepEqual(calls.removals[0], {
    bucket: 'document-intelligence',
    paths: ['user-1/doc-1/file.txt'],
  });
});

test('queueDocumentAnalysis creates a queued analysis job for an existing owned document', async () => {
  const { admin, calls } = makeAdmin((query) => {
    if (query.table === 'documents' && query.op === 'select') {
      return { data: { id: 'doc-1', user_id: 'user-1' }, error: null };
    }
    if (query.table === 'document_analyses' && query.op === 'insert') {
      return { data: { id: 'analysis-2', ...query.payload }, error: null };
    }
    if (query.table === 'document_analysis_jobs' && query.op === 'insert') {
      return { data: { id: 'job-2', ...query.payload }, error: null };
    }
    if (query.table === 'documents' && query.op === 'update') {
      return { data: null, error: null };
    }
    throw new Error(`Unhandled query ${query.table}:${query.op}:${query.mode}`);
  });

  await withLoadedPipeline({ admin }, async ({ queueDocumentAnalysis }) => {
    const result = await queueDocumentAnalysis({ authUserId: 'user-1', documentId: 'doc-1' });
    assert.equal(result.analysis.id, 'analysis-2');
    assert.equal(result.job.id, 'job-2');
  });

  const documentUpdate = calls.queries.find((query) => query.table === 'documents' && query.op === 'update');
  assert.equal(documentUpdate.payload.processing_status, 'queued');
});

test('queueDocumentAnalysis rolls back the analysis when job creation fails', async () => {
  const failure = new Error('queue unavailable');
  const { admin, calls } = makeAdmin((query) => {
    if (query.table === 'documents' && query.op === 'select') {
      return { data: { id: 'doc-1', user_id: 'user-1', processing_status: 'completed', updated_at: '2026-09-18T00:00:00.000Z' }, error: null };
    }
    if (query.table === 'document_analyses' && query.op === 'insert') {
      return { data: { id: 'analysis-2', ...query.payload }, error: null };
    }
    if (query.table === 'document_analysis_jobs' && query.op === 'insert') {
      return { data: null, error: failure };
    }
    if (query.table === 'document_analyses' && query.op === 'delete') {
      return { data: null, error: null };
    }
    throw new Error(`Unhandled query ${query.table}:${query.op}:${query.mode}`);
  });

  await withLoadedPipeline({ admin }, async ({ queueDocumentAnalysis }) => {
    await assert.rejects(
      queueDocumentAnalysis({ authUserId: 'user-1', documentId: 'doc-1' }),
      { message: 'queue unavailable' },
    );
  });

  const analysisDelete = calls.queries.find((query) => query.table === 'document_analyses' && query.op === 'delete');
  assert.equal(Boolean(analysisDelete?.filters.find((filter) => filter.type === 'eq' && filter.key === 'id' && filter.value === 'analysis-2')), true);
});

test('queueDocumentAnalysis records an audit log when an actor is provided', async () => {
  const { admin, calls } = makeAdmin((query) => {
    if (query.table === 'documents' && query.op === 'select') {
      return { data: { id: 'doc-1', case_id: 'case-1', user_id: 'user-1', processing_status: 'completed', updated_at: '2026-09-18T00:00:00.000Z' }, error: null };
    }
    if (query.table === 'cases' && query.op === 'select') {
      return { data: { id: 'case-1', parent_user_id: 'user-1' }, error: null };
    }
    if (query.table === 'document_analyses' && query.op === 'insert') {
      return { data: { id: 'analysis-2', ...query.payload }, error: null };
    }
    if (query.table === 'document_analysis_jobs' && query.op === 'insert') {
      return { data: { id: 'job-2', ...query.payload }, error: null };
    }
    if (query.table === 'documents' && query.op === 'update') {
      return { data: null, error: null };
    }
    if (query.table === 'audit_logs' && query.op === 'insert') {
      return { data: null, error: null };
    }
    throw new Error(`Unhandled query ${query.table}:${query.op}:${query.mode}`);
  });

  await withLoadedPipeline({ admin }, async ({ queueDocumentAnalysis }) => {
    await queueDocumentAnalysis({ authUserId: 'user-1', actorUserId: 'app-user-1', documentId: 'doc-1' });
  });

  const auditInsert = calls.queries.find((query) => query.table === 'audit_logs' && query.op === 'insert');
  assert.equal(auditInsert.payload.actor_user_id, 'app-user-1');
  assert.equal(auditInsert.payload.case_id, 'case-1');
  assert.equal(auditInsert.payload.action, 'document_processing_requested');
});

test('getAnalysisForUser returns normalized media assessment domains', async () => {
  const { admin } = makeAdmin((query) => {
    if (query.table === 'document_analyses' && query.op === 'select') {
      return {
        data: {
          id: 'analysis-1',
          document_id: 'doc-1',
          status: 'completed',
          risk: {},
          raw_output: {
            media_assessment: {
              domains: [{
                domain_id: 'digital_integrity_and_authenticity',
                domain_name: 'Digital Integrity & Authenticity',
                signals_observed: ['Metadata validation'],
                risk_flags: ['Potential tampering'],
                protective_flags: [],
                notes: 'Metadata checks were incomplete.',
                confidence: 0.4,
              }],
            },
          },
        },
        error: null,
      };
    }
    if (query.table === 'documents' && query.op === 'select') {
      return { data: { id: 'doc-1', case_id: null, user_id: 'user-1' }, error: null };
    }
    throw new Error(`Unhandled query ${query.table}:${query.op}:${query.mode}`);
  });

  await withLoadedPipeline({ admin }, async ({ getAnalysisForUser }) => {
    const result = await getAnalysisForUser('analysis-1', 'user-1');
    assert.equal(result.media_assessment.domains[0].domain_id, 'digital_integrity_and_authenticity');
    assert.equal(result.media_assessment.domains[0].risk_flags[0], 'Potential tampering');
  });
});

test('getDocumentForUser adds workflow annotations and confidence/limitation normalization', async () => {
  const defaultLimitation = 'AI output is unverified decision-support material and requires documented human review before case action.';
  const { admin } = makeAdmin((query) => {
    if (query.table === 'documents' && query.op === 'select') {
      return {
        data: {
          id: 'doc-1',
          user_id: 'user-1',
          case_id: null,
          metadata: {},
        },
        error: null,
      };
    }
    if (query.table === 'document_analyses' && query.op === 'select') {
      return {
        data: {
          id: 'analysis-1',
          document_id: 'doc-1',
          user_id: 'user-1',
          risk: { confidence: 0.81 },
          limitations: ['Missing collateral records', 'Missing collateral records'],
        },
        error: null,
      };
    }
    throw new Error(`Unhandled query ${query.table}:${query.op}:${query.mode}`);
  });

  await withLoadedPipeline({ admin }, async ({ getDocumentForUser }) => {
    const result = await getDocumentForUser('doc-1', 'user-1');
    assert.equal(result.document.human_review_required, true);
    assert.equal(result.document.metadata.human_review_status, 'pending_analysis');
    assert.equal(result.analysis.decision_support_only, true);
    assert.deepEqual(result.analysis.confidence_overview, { score: 0.81, band: 'high' });
    assert.deepEqual(result.analysis.limitations, [defaultLimitation, 'Missing collateral records']);
  });
});

test('getComparisonForUser normalizes limitations and preserves explicit human review status', async () => {
  const defaultLimitation = 'AI output is unverified decision-support material and requires documented human review before case action.';
  const { admin } = makeAdmin((query) => {
    if (query.table === 'document_comparisons' && query.op === 'select') {
      return {
        data: {
          id: 'comparison-1',
          user_id: 'user-1',
          case_id: null,
          metadata: { human_review_status: 'reviewed' },
          result: {
            limitations: ['Conflicting chronology between statements'],
          },
        },
        error: null,
      };
    }
    throw new Error(`Unhandled query ${query.table}:${query.op}:${query.mode}`);
  });

  await withLoadedPipeline({ admin }, async ({ getComparisonForUser }) => {
    const result = await getComparisonForUser('comparison-1', 'user-1');
    assert.equal(result.human_review_required, true);
    assert.equal(result.metadata.human_review_status, 'reviewed');
    assert.deepEqual(result.result.limitations, [defaultLimitation, 'Conflicting chronology between statements']);
  });
});
