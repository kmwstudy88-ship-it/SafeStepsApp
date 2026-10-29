import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const serverPath = require.resolve('../../backend/server.js');
const pipelinePath = require.resolve('../../backend/document-intelligence/pipeline.js');
const supabasePath = require.resolve('../../backend/document-intelligence/supabase.js');

async function withLoadedServer(run, authenticateBearer = async (header) => (header ? { id: 'authenticated-user-123' } : null)) {
  const prior = {
    server: require.cache[serverPath],
    pipeline: require.cache[pipelinePath],
    supabase: require.cache[supabasePath],
  };

  delete require.cache[serverPath];
  require.cache[pipelinePath] = {
    id: pipelinePath,
    filename: pipelinePath,
    loaded: true,
    exports: {
      createTextDocument: async () => { throw new Error('not used'); },
      createUploadDocument: async () => { throw new Error('not used'); },
      createComparison: async () => { throw new Error('not used'); },
      processNextJobs: async () => 0,
      getDocumentForUser: async () => null,
      getComparisonForUser: async () => null,
      deleteDocumentForUser: async () => null,
      getAnalysisForUser: async () => null,
    },
  };
  require.cache[supabasePath] = {
    id: supabasePath,
    filename: supabasePath,
    loaded: true,
    exports: { authenticateBearer },
  };

  try {
    const { createApp } = require('../../backend/server.js');
    await run(createApp);
  } finally {
    for (const [key, value] of Object.entries(prior)) {
      const targetPath = key === 'server' ? serverPath : key === 'pipeline' ? pipelinePath : supabasePath;
      if (value) require.cache[targetPath] = value;
      else delete require.cache[targetPath];
    }
  }
}

function mockFetch(port, path, options = {}) {
  const url = `http://127.0.0.1:${port}${path}`;
  return fetch(url, options);
}

test('document OCR endpoint requires authentication and extracts page text', async () => {
  await withLoadedServer(async (createApp) => {
    const { server, shutdown } = createApp({ port: 3093 });
    await new Promise((resolve) => server.listen(3093, resolve));

    try {
      // 1. Unauthenticated request rejected
      const unauthRes = await mockFetch(3093, '/documents/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentBase64: Buffer.from('Child Safety Assessment 2026').toString('base64') }),
      });
      assert.equal(unauthRes.status, 401);

      // 2. Authenticated OCR extraction
      const authRes = await mockFetch(3093, '/documents/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-token',
        },
        body: JSON.stringify({
          contentBase64: Buffer.from('Supervision Visit Report: Leo engaged well with parent during play activities.').toString('base64'),
          fileName: 'visit_report.png',
        }),
      });

      assert.equal(authRes.status, 200);
      const data = await authRes.json();
      assert.equal(data.ok, true);
      assert(Array.isArray(data.pages));
      assert(data.pages.length >= 1);
      assert.match(data.full_text, /Supervision Visit Report/);
      assert(data.mean_confidence > 0);
      assert.equal(data.decision_support_only, true);
      assert.equal(data.human_review_required, true);
    } finally {
      await new Promise((resolve) => {
        server.once('close', resolve);
        shutdown();
      });
    }
  });
});

test('document semantic indexing, search and similarity endpoints', async () => {
  await withLoadedServer(async (createApp) => {
    const { server, shutdown } = createApp({ port: 3094 });
    await new Promise((resolve) => server.listen(3094, resolve));

    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid-token',
      };

      // 1. Index document A
      const indexResA = await mockFetch(3094, '/documents/index', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          documentId: 'doc_safety_plan_01',
          caseId: 'case_smith_01',
          text: 'The parent installed lockable medicine storage in the bathroom. The lockbox was inspected and verified by the caseworker during the home visit on Tuesday.',
        }),
      });
      assert.equal(indexResA.status, 200);
      const indexDataA = await indexResA.json();
      assert.equal(indexDataA.ok, true);
      assert(indexDataA.chunks_indexed >= 1);

      // 2. Index document B (different topic)
      const indexResB = await mockFetch(3094, '/documents/index', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          documentId: 'doc_visit_02',
          caseId: 'case_smith_01',
          text: 'Supervised contact visit took place at the community library. Parent and children completed a jigsaw puzzle and read storybooks together calmly.',
        }),
      });
      assert.equal(indexResB.status, 200);

      // 3. Semantic search querying "medicine storage lockbox"
      const searchRes = await mockFetch(3094, '/documents/semantic-search', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: 'Where is the locked medication storage box?',
          caseId: 'case_smith_01',
          topK: 5,
        }),
      });

      assert.equal(searchRes.status, 200);
      const searchData = await searchRes.json();
      assert.equal(searchData.ok, true);
      assert(searchData.results.length >= 1);
      assert.equal(searchData.decision_support_only, true);
      // Top match should be the medicine storage document
      assert.equal(searchData.results[0].document_id, 'doc_safety_plan_01');

      // 4. Similar documents query
      const similarRes = await mockFetch(3094, '/documents/doc_safety_plan_01/similar?topK=3', {
        method: 'GET',
        headers,
      });
      assert.equal(similarRes.status, 200);
      const similarData = await similarRes.json();
      assert.equal(similarData.ok, true);
      assert.equal(similarData.document_id, 'doc_safety_plan_01');
      assert(Array.isArray(similarData.similar_documents));
    } finally {
      await new Promise((resolve) => {
        server.once('close', resolve);
        shutdown();
      });
    }
  });
});
