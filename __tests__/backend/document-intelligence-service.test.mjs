import {
  jest,
  test,
  expect,
} from '@jest/globals';

import {
  DOCUMENT_INTELLIGENCE_SCHEMA_VERSION,
  analyzeDocument,
  documentIntelligenceResponseSchema,
  documentIntelligenceSections,
  normalizeDocumentText,
} from '../../backend/Services/DocumentIntelligence/DocumentService.js';

function sectionFixture(summary = 'No reliable signal was present in the submitted text.') {
  return {
    summary,
    signals: [],
    evidenceRefs: [],
    gaps: ['Requires worker review against the source document.'],
    reviewPrompts: ['What source evidence supports or changes this section?'],
    confidence: 'low',
  };
}

function responseFixture() {
  return {
    overallSummary: 'The document requires worker review before any finding is recorded.',
    priorityReview: ['Check the source document against current case records.'],
    safetyFlags: [],
    evidenceGaps: ['The submitted text is brief.'],
    workerReviewActions: ['Confirm dates, sources, and context before report use.'],
    sections: Object.fromEntries(documentIntelligenceSections().map(({ key }) => [key, sectionFixture()])),
    disclaimer: 'AI output supports human review only and is not a verified finding.',
  };
}

test('normalizes document text and rejects unusable input', () => {
  expect(normalizeDocumentText('  Parent   attended\r\nreview session with service letter.  ')).toBe(
    'Parent attended\nreview session with service letter.',
  );

  expect(() => normalizeDocumentText('too short')).toThrow('at least 20 characters');
  expect(() => normalizeDocumentText(null)).toThrow('requires document text');
});

test('publishes a strict schema covering every configured section', () => {
  const sections = documentIntelligenceSections();
  const schema = documentIntelligenceResponseSchema();

  expect(DOCUMENT_INTELLIGENCE_SCHEMA_VERSION).toBe('2026-07-15');
  expect(sections).toHaveLength(40);
  expect(schema.strict).toBe(true);
  expect(schema.schema.properties.sections.required).toEqual(sections.map(({ key }) => key));
});

test('analyzeDocument returns the production response envelope from structured model output', async () => {
  const fixture = responseFixture();
  const client = {
    chat: {
      completions: {
        create: jest.fn(async () => ({
          model: 'test-model',
          choices: [{ message: { content: JSON.stringify(fixture) } }],
        })),
      },
    },
  };

  const result = await analyzeDocument('Parent attended a review session and brought a service letter.', {
    client,
    model: 'test-model',
  });

  expect(client.chat.completions.create).toHaveBeenCalledWith(
    expect.objectContaining({
      model: 'test-model',
      temperature: 0.1,
      response_format: expect.objectContaining({ type: 'json_schema' }),
    }),
  );
  expect(result.schemaVersion).toBe(DOCUMENT_INTELLIGENCE_SCHEMA_VERSION);
  expect(result.model).toBe('test-model');
  expect(result.overallSummary).toBe(fixture.overallSummary);
  expect(result.sections.parentCapacity.confidence).toBe('low');
});
