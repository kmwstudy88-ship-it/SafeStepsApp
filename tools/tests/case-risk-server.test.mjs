import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const serverPath = require.resolve('../../backend/server.js');
const pipelinePath = require.resolve('../../backend/document-intelligence/pipeline.js');
const supabasePath = require.resolve('../../backend/document-intelligence/supabase.js');

async function withLoadedServer(run, authenticateBearer) {
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
    await run(require(serverPath));
  } finally {
    delete require.cache[serverPath];
    for (const [key, path] of Object.entries({
      server: serverPath,
      pipeline: pipelinePath,
      supabase: supabasePath,
    })) {
      if (prior[key]) require.cache[path] = prior[key];
      else delete require.cache[path];
    }
  }
}

test('legacy risk compute response remains explicitly decision support only', async () => {
  const seen = [];
  const riskService = {
    async recomputeRisk(input) {
      seen.push(input);
      return { snapshot: { score: 82, tier: 'critical', confidence: 0.83 } };
    },
  };

  await withLoadedServer(async ({ createApp }) => {
    const app = createApp({ port: 0, workerIntervalMs: 60000, riskService });
    await new Promise(resolve => app.server.listen(0, resolve));
    try {
      const response = await fetch(`http://127.0.0.1:${app.server.address().port}/risk-assessment/compute`, {
        method: 'POST',
        headers: { authorization: 'valid-token', 'content-type': 'application/json' },
        body: JSON.stringify({ caseId: 'case-123' }),
      });

      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), {
        riskScore: 82,
        riskLevel: 'critical',
        confidence: 0.83,
        snapshot: { score: 82, tier: 'critical', confidence: 0.83 },
        human_review_required: true,
        decision_support_only: true,
      });
    } finally {
      await new Promise(resolve => {
        app.server.once('close', resolve);
        app.shutdown();
      });
    }
  }, async token => token === 'valid-token' ? { id: 'authenticated-user' } : null);

  assert.deepEqual(seen, [{ authUserId: 'authenticated-user', caseId: 'case-123' }]);
});
