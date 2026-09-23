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

test('formatDocumentIntelligenceResult prefers explicit master-schema slices over derived fallbacks', () => {
  const result = formatDocumentIntelligenceResult(
    {
      id: 'doc-3',
      created_at: '2026-09-20T08:00:00.000Z',
      metadata: {},
    },
    {
      summary: { overview: 'Fallback overview', document_type: 'incident_report' },
      evidence: [{ claim: 'fallback claim', evidence: 'fallback evidence', source_locator: 'page 1', confidence: 55 }],
      contradictions: [{ statement_a: 'a', statement_b: 'b' }],
      timeline: [{ event: 'fallback event', source_locator: 'page 1' }],
      risk: { score: 99, level: 'critical', protective_factors: ['fallback factor'], uncertainties: ['fallback gap'] },
      bias: { score: 5, signals: [{ category: 'fallback bias' }] },
      fairness: { framing_concerns: [{ language: 'fallback fairness' }] },
      limitations: ['fallback limitation'],
      raw_output: {
        analysis: {
          risks: [{ engine: 'ReviewedEngine', risk_score: 45, severity_level: 'moderate' }],
          protective_factors: [{ strength: 'Stable kinship placement' }],
          bias_indicators: [{ category: 'framing', language: 'always', explanation: 'absolute language', severity: 'high' }],
          professional_concerns: ['Escalating incidents'],
          missing_evidence: ['School attendance records'],
          severity_scale: { risk_level: 'moderate', explanation: 'verified by reviewer' },
          contextual_modifiers: { interpreter_required: true },
        },
        scores: {
          risk_score: '120',
          protective_score: '-5',
          bias_score: '70',
          document_quality_score: 88,
          case_complexity_score: '101',
        },
        summaries: {
          child_centred: 'Explicit child-centred summary',
          action_plan: 'Schedule supervised contact review',
        },
        audit: {
          evidence_trace: [{ claim: 'explicit claim', evidence: 'explicit evidence', source_locator: 'appendix a' }],
          source_verification: [{ source_locator: 'appendix a', confidence: 90, evidence_type: 'record' }],
          explainability: [{ limitation: 'Model confidence reduced by missing annexure' }],
        },
      },
    },
  );

  assert.deepEqual(result.analysis.risks, [{ engine: 'ReviewedEngine', risk_score: 45, severity_level: 'moderate' }]);
  assert.deepEqual(result.analysis.protective_factors, [{ strength: 'Stable kinship placement' }]);
  assert.deepEqual(result.analysis.bias_indicators, [{
    category: 'framing',
    language: 'always',
    explanation: 'absolute language',
    severity: 'high',
  }]);
  assert.deepEqual(result.analysis.professional_concerns, ['Escalating incidents']);
  assert.deepEqual(result.analysis.missing_evidence, ['School attendance records']);
  assert.deepEqual(result.analysis.severity_scale, { risk_level: 'moderate', explanation: 'verified by reviewer' });
  assert.deepEqual(result.analysis.contextual_modifiers, { interpreter_required: true });
  assert.deepEqual(result.audit.evidence_trace, [{ claim: 'explicit claim', evidence: 'explicit evidence', source_locator: 'appendix a' }]);
  assert.deepEqual(result.audit.source_verification, [{ source_locator: 'appendix a', confidence: 90, evidence_type: 'record' }]);
  assert.deepEqual(result.audit.explainability, [{ limitation: 'Model confidence reduced by missing annexure' }]);
  assert.equal(result.summaries.child_centred, 'Explicit child-centred summary');
  assert.equal(result.summaries.action_plan, 'Schedule supervised contact review');
  assert.deepEqual(result.scores, {
    risk_score: 100,
    protective_score: 0,
    bias_score: 70,
    document_quality_score: 88,
    case_complexity_score: 100,
  });
});

test('formatDocumentIntelligenceResult falls back safely when metadata and analysis shapes are incomplete', () => {
  const result = formatDocumentIntelligenceResult(
    {
      id: 'doc-4',
      created_at: '2026-09-20T10:15:00.000Z',
      metadata: 'invalid',
    },
    {
      summary: { overview: 'Short overview', document_type: 'case_note' },
      evidence: [{ claim: 'Supported claim', evidence: 'Case note', confidence: '92', source_locator: 44 }],
      risk: { score: 'not-a-number', level: 'low', protective_factors: [{ strength: 'Housing secured' }], uncertainties: 'missing attachment' },
      raw_output: {
        entities: { people: 'invalid', dates: ['2026-09-20'] },
        ml_features: { tokens: ['family', 'safety'], embeddings: 'invalid', feature_vector: [0.2, 0.4] },
      },
      limitations: ['Awaiting collateral records'],
    },
  );

  assert.equal(result.metadata.document_type, 'case_note');
  assert.equal(result.metadata.created_at, '2026-09-20T10:15:00.000Z');
  assert.deepEqual(result.entities.people, []);
  assert.deepEqual(result.entities.dates, ['2026-09-20']);
  assert.deepEqual(result.analysis.risks, [{
    engine: 'DocumentRiskEngine',
    risk_score: 0,
    severity_level: 'low',
    evidence_sources: [{
      claim: 'Supported claim',
      evidence: 'Case note',
      evidence_type: 'unknown',
      confidence: 92,
      source_locator: '',
    }],
    contradictions: [],
    missing_evidence: [],
    timeline_links: [],
  }]);
  assert.deepEqual(result.analysis.protective_factors, [{ strength: 'Housing secured' }]);
  assert.deepEqual(result.analysis.missing_evidence, []);
  assert.deepEqual(result.ml_features, {
    tokens: ['family', 'safety'],
    embeddings: [],
    feature_vector: [0.2, 0.4],
  });
  assert.deepEqual(result.audit.source_verification, [{
    source_locator: '',
    confidence: 92,
    evidence_type: 'unknown',
  }]);
  assert.deepEqual(result.audit.explainability, [{ limitation: 'Awaiting collateral records' }]);
});
