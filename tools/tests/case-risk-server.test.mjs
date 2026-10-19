import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const serverPath = require.resolve('../../backend/server.js');
const pipelinePath = require.resolve('../../backend/document-intelligence/pipeline.js');
const supabasePath = require.resolve('../../backend/document-intelligence/supabase.js');
const riskPath = require.resolve('../../backend/case-risk/service.js');

async function withLoadedServer(run) {
  const paths = [serverPath, pipelinePath, supabasePath, riskPath];
  const prior = new Map(paths.map(path => [path, require.cache[path]]));
  delete require.cache[serverPath];
  require.cache[pipelinePath] = {
    id: pipelinePath, filename: pipelinePath, loaded: true,
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
    id: supabasePath, filename: supabasePath, loaded: true,
    exports: {
      authenticateBearer: async token => token === 'valid-token' ? { id: 'authenticated-user' } : null,
    },
  };
  require.cache[riskPath] = {
    id: riskPath, filename: riskPath, loaded: true,
    exports: {
      createCaseRiskService() { throw new Error('Unreconciled risk service must not be initialized'); },
    },
  };
  try {
    await run(require(serverPath));
  } finally {
    for (const path of paths) {
      if (prior.get(path)) require.cache[path] = prior.get(path);
      else delete require.cache[path];
    }
  }
}

const caseId = '123e4567-e89b-12d3-a456-426614174000';
const endpoints = [
  ['POST', `/cases/${caseId}/events`],
  ['POST', `/cases/${caseId}/recompute-risk`],
  ['GET', `/cases/${caseId}/risk-history`],
  ['GET', '/dashboard/supervisor'],
  ['POST', '/risk-assessment/compute'],
];
const unavailable = {
  error: {
    code: 'SERVICE_UNAVAILABLE',
    message: 'Case risk workflows are unavailable until canonical schema and authorization reconciliation is verified.',
  },
  human_review_required: true,
  decision_support_only: true,
};

test('all unreconciled Track C routes fail closed before parsing bodies or invoking legacy services', async () => {
  await withLoadedServer(async ({ createApp }) => {
    const app = createApp({
      port: 0, workerIntervalMs: 60000,
      riskService: new Proxy({}, {
        get() { throw new Error('Injected services cannot bypass the runtime blocker'); },
      }),
    });
    await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
    const baseUrl = `http://127.0.0.1:${app.server.address().port}`;
    try {
      for (const [method, path] of endpoints) {
        const response = await fetch(`${baseUrl}${path}`, {
          method,
          headers: { authorization: 'valid-token', 'content-type': 'application/json' },
          ...(method === 'POST' ? { body: '{invalid JSON' } : {}),
        });
        assert.equal(response.status, 503, path);
        assert.deepEqual(await response.json(), unavailable, path);
      }
      for (const [method, path] of endpoints) {
        for (const authorization of [undefined, 'invalid-token']) {
          const response = await fetch(`${baseUrl}${path}`, {
            method, headers: authorization ? { authorization } : {},
          });
          assert.equal(response.status, 401, path);
          assert.equal((await response.json()).error.code, 'UNAUTHENTICATED');
        }
      }
      const health = await fetch(`${baseUrl}/health`);
      assert.equal(health.status, 200);
      assert.equal((await health.json()).documentIntelligence, true);
      const missingDocument = await fetch(`${baseUrl}/documents/${caseId}`, {
        headers: { authorization: 'valid-token' },
      });
      assert.equal(missingDocument.status, 404);
      assert.equal((await missingDocument.json()).error.code, 'NOT_FOUND');
      const unknown = await fetch(`${baseUrl}/cases/${caseId}/unknown`, {
        headers: { authorization: 'valid-token' },
      });
      assert.equal(unknown.status, 404);
      const preflight = await fetch(`${baseUrl}/cases/${caseId}/events`, { method: 'OPTIONS' });
      assert.equal(preflight.status, 204);
    } finally {
      await new Promise(resolve => {
        app.server.once('close', resolve);
        app.shutdown();
      });
    }
  });
});
