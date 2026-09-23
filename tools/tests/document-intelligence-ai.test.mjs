import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { providerName, analyzeDocument, compareDocuments, analysisSkillCatalog } = require('../../backend/document-intelligence/ai.js');

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
      assert.match(requestBody.instructions, /"analysis_skills"/);
      assert.match(requestBody.instructions, /input_format/);
      assert.match(requestBody.instructions, /unsafe_output_rules/);
      assert.match(requestBody.instructions, /Environmental Safety/);
      assert.match(requestBody.instructions, /Digital Integrity & Authenticity/);
      assert.match(requestBody.instructions, /fairness_detection/);
      assert.match(requestBody.instructions, /privacy_and_boundary_checks/);
    } finally {
      restoreFetch();
    }
  });
});

test('analysis skill catalog defines all required safety skills and contract fields', () => {
  assert.equal(Array.isArray(analysisSkillCatalog), true);
  assert.equal(analysisSkillCatalog.length, 15);
  const ids = analysisSkillCatalog.map((item) => item.skill_id);
  assert.deepEqual(ids, [
    'fairness_detection',
    'bias_and_discrimination_detection',
    'coercion_and_framing_detection',
    'contradiction_detection',
    'evidence_extraction',
    'requirement_and_obligation_extraction',
    'timeline_extraction',
    'risk_signal_extraction',
    'concern_classification',
    'unrealistic_expectation_detection',
    'developmental_appropriateness_checks',
    'cultural_safety_checks',
    'child_safe_language_checks',
    'disclosure_sensitive_handling',
    'privacy_and_boundary_checks',
  ]);
  for (const skill of analysisSkillCatalog) {
    assert.equal(typeof skill.input_format, 'string');
    assert.equal(typeof skill.output_schema, 'object');
    assert.equal(typeof skill.confidence_score, 'string');
    assert.equal(typeof skill.evidence_citation_or_source_location, 'string');
    assert.equal(typeof skill.limitations, 'string');
    assert.equal(typeof skill.human_review_requirement, 'string');
    assert.equal(typeof skill.failure_behavior, 'string');
    assert.equal(Array.isArray(skill.test_cases), true);
    assert.equal(Array.isArray(skill.unsafe_output_rules), true);
  }
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

test('analysis fails closed when provider returns malformed JSON output', async () => {
  await withEnv({ DOCUMENT_AI_PROVIDER: 'openai', OPENAI_API_KEY: 'test-key' }, async () => {
    const restoreFetch = mockFetch(async () => ({
      ok: true,
      json: async () => ({ output_text: 'not valid json' }),
    }));

    try {
      await assert.rejects(
        analyzeDocument({ id: 'doc-malformed', file_name: 'note.txt', mime_type: 'text/plain', extracted_text: 'example text' }),
        { message: 'AI provider returned non-JSON output' },
      );
    } finally {
      restoreFetch();
    }
  });
});

test('analysis surfaces provider timeout failures clearly', async () => {
  await withEnv({ DOCUMENT_AI_PROVIDER: 'openai', OPENAI_API_KEY: 'test-key', DOCUMENT_AI_TIMEOUT_MS: '1234' }, async () => {
    const restoreFetch = mockFetch(async () => {
      const error = new Error('aborted');
      error.name = 'AbortError';
      throw error;
    });

    try {
      await assert.rejects(
        analyzeDocument({ id: 'doc-timeout', file_name: 'note.txt', mime_type: 'text/plain', extracted_text: 'example text' }),
        { message: 'AI provider request timed out after 1234ms' },
      );
    } finally {
      restoreFetch();
    }
  });
});
