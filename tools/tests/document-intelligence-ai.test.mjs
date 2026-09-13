import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { providerName, analyzeDocument, compareDocuments } = require('../../backend/document-intelligence/ai.js');

function withEnv(overrides, run) {
  const previous = {};
  for (const [key, value] of Object.entries(overrides)) {
    previous[key] = process.env[key];
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
  return Promise.resolve()
    .then(run)
    .finally(() => {
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) delete process.env[key]; else process.env[key] = value;
      }
    });
}

function mockFetch(handler) {
  const original = global.fetch;
  global.fetch = handler;
  return () => { global.fetch = original; };
}

test('provider defaults to openai and normalizes anthropic selection', async () => {
  await withEnv({ DOCUMENT_AI_PROVIDER: undefined }, async () => {
    assert.equal(providerName(), 'openai');
  });
  await withEnv({ DOCUMENT_AI_PROVIDER: 'AnThRoPiC' }, async () => {
    assert.equal(providerName(), 'anthropic');
  });
});

test('binary document analysis fails closed when content is unavailable', async () => {
  await assert.rejects(
    analyzeDocument({ id: 'doc-1', file_name: 'report.pdf', mime_type: 'application/pdf', extracted_text: null }),
    { message: 'Document content is unavailable for analysis' },
  );
});

test('anthropic direct binary mode rejects non-PDF documents', async () => {
  await withEnv({ DOCUMENT_AI_PROVIDER: 'anthropic', ANTHROPIC_API_KEY: 'test-key' }, async () => {
    await assert.rejects(
      analyzeDocument({ id: 'doc-2', file_name: 'notes.txt', mime_type: 'text/plain', extracted_text: null }, Buffer.from('abc')),
      { message: 'Anthropic direct binary analysis currently supports PDF documents; provide extractedText for other binary formats.' },
    );
  });
});

test('openai analysis sends base64 file input and parses JSON from output content array', async () => {
  await withEnv({ DOCUMENT_AI_PROVIDER: 'openai', OPENAI_API_KEY: 'test-key', OPENAI_DOCUMENT_MODEL: 'unit-model' }, async () => {
    let requestBody;
    const restoreFetch = mockFetch(async (_url, init) => {
      requestBody = JSON.parse(init.body);
      return {
        ok: true,
        json: async () => ({
          output: [{ content: [{ type: 'output_text', text: '{"summary":{"overview":"ok"},"evidence":[]}' }] }],
          usage: { input_tokens: 1, output_tokens: 2 },
        }),
      };
    });

    try {
      const result = await analyzeDocument(
        { id: 'doc-3', file_name: 'record.pdf', mime_type: 'application/pdf', extracted_text: null },
        Buffer.from('pdf-bytes'),
      );

      assert.equal(result.provider, 'openai');
      assert.equal(result.model, 'unit-model');
      assert.equal(result.result.summary.overview, 'ok');
      assert.equal(requestBody.input[0].content[1].type, 'input_file');
      assert.equal(requestBody.input[0].content[1].file_data, Buffer.from('pdf-bytes').toString('base64'));
      assert.match(requestBody.instructions, /"media_assessment"/);
      assert.match(requestBody.instructions, /Environmental Safety/);
      assert.match(requestBody.instructions, /Digital Integrity & Authenticity/);
    } finally {
      restoreFetch();
    }
  });
});

test('comparison parser accepts fenced JSON and uses analysis fallback when text is missing', async () => {
  await withEnv({ DOCUMENT_AI_PROVIDER: 'openai', OPENAI_API_KEY: 'test-key' }, async () => {
    let requestBody;
    const restoreFetch = mockFetch(async (_url, init) => {
      requestBody = JSON.parse(init.body);
      return {
        ok: true,
        json: async () => ({
          output_text: '```json\n{"overview":"aligned","agreements":[],"contradictions":[],"timeline_conflicts":[],"evidence_gaps":[],"bias_differences":[],"risk_delta":{"detail":""},"limitations":[]}\n```',
        }),
      };
    });

    try {
      const result = await compareDocuments([
        {
          document: { id: 'doc-a', file_name: 'a.txt', extracted_text: null },
          analysis: { summary: { overview: 'fallback analysis' } },
        },
        {
          document: { id: 'doc-b', file_name: 'b.txt', extracted_text: 'direct body text' },
          analysis: null,
        },
      ]);

      assert.equal(result.provider, 'openai');
      assert.equal(result.result.overview, 'aligned');
      assert.match(requestBody.input, /DOCUMENT 1: doc-a/);
      assert.match(requestBody.input, /fallback analysis/);
      assert.match(requestBody.input, /direct body text/);
    } finally {
      restoreFetch();
    }
  });
});
