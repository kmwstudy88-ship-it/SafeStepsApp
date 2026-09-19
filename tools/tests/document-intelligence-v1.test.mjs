import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  formatDocumentIntelligenceResult,
  summarizeDocumentIntelligenceResult,
  scoreDocumentIntelligenceResult,
} = require('../../backend/document-intelligence/v1.js');

test('formatDocumentIntelligenceResult maps persisted analysis fields into the v1 master schema slice', () => {
  const result = formatDocumentIntelligenceResult(
    {
      id: 'doc-1',
      created_at: '2026-09-19T12:00:00.000Z',
      metadata: {
        document_type: 'court_affidavit',
        author_role: 'caseworker',
        creation_date: '2026-09-18T09:30:00.000Z',
        source_system: 'case-management',
      },
    },
    {
      summary: { overview: 'Observed escalating conflict.', document_type: 'court_affidavit' },
      evidence: [{ claim: 'Conflict escalated', evidence: 'Police report excerpt', evidence_type: 'record', confidence: 88, source_locator: 'page 2' }],
      contradictions: [{ statement_a: 'Visits were calm', statement_b: 'Visits were volatile', severity: 'high', confidence: 72 }],
      timeline: [{ date: '2026-09-01', event: 'Police attended', source_locator: 'page 2', confidence: 90 }],
      risk: { score: 67, level: 'high', protective_factors: ['Maternal aunt support'], uncertainties: ['Missing toxicology report'] },
      bias: { score: 21, signals: [{ category: 'language bias', language: 'non-compliant', explanation: 'Label without evidence anchor', severity: 'medium' }] },
      fairness: { framing_concerns: [{ language: 'failed to engage', explanation: 'Needs service timeline context', severity: 'low' }] },
      limitations: ['Single document only'],
      raw_output: {
        entities: { people: ['Parent A'], dates: ['2026-09-01'], locations: ['Clinic'], events: ['Police attended'] },
        scores: { protective_score: 34, document_quality_score: 70, case_complexity_score: 55 },
        summaries: { parent_summary: 'Parent disputes allegations.', legal_summary: 'Record contains unresolved contradictions.' },
      },
    },
  );

  assert.equal(result.document_id, 'doc-1');
  assert.equal(result.metadata.document_type, 'court_affidavit');
  assert.equal(result.metadata.author_role, 'caseworker');
  assert.deepEqual(result.entities.people, ['Parent A']);
  assert.equal(result.timeline.events[0].event, 'Police attended');
  assert.equal(result.analysis.risks[0].risk_score, 67);
  assert.equal(result.analysis.risks[0].severity_level, 'high');
  assert.equal(result.analysis.protective_factors[0].strength, 'Maternal aunt support');
  assert.equal(result.analysis.bias_indicators.length, 2);
  assert.equal(result.analysis.missing_evidence[0], 'Missing toxicology report');
  assert.equal(result.scores.risk_score, 67);
  assert.equal(result.scores.protective_score, 34);
  assert.equal(result.scores.document_quality_score, 70);
  assert.equal(result.summaries.child_centred, 'Observed escalating conflict.');
  assert.equal(result.summaries.parent_summary, 'Parent disputes allegations.');
  assert.equal(result.audit.evidence_trace[0].source_locator, 'page 2');
  assert.equal(result.audit.explainability[0].limitation, 'Single document only');
});

test('summary and score helpers return the corresponding v1 blocks', () => {
  const document = { id: 'doc-2', metadata: {} };
  const analysis = {
    summary: { overview: 'Overview text' },
    risk: { score: 10 },
    bias: { score: 90 },
    raw_output: { scores: { protective_score: 20, document_quality_score: 30, case_complexity_score: 40 } },
  };

  assert.deepEqual(summarizeDocumentIntelligenceResult(document, analysis), {
    child_centred: 'Overview text',
    parent_summary: '',
    legal_summary: '',
    strengths_summary: '',
    action_plan: '',
  });
  assert.deepEqual(scoreDocumentIntelligenceResult(document, analysis), {
    risk_score: 10,
    protective_score: 20,
    bias_score: 90,
    document_quality_score: 30,
    case_complexity_score: 40,
  });
});
