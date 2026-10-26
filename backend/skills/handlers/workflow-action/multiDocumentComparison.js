'use strict';

const { buildSkillEnvelope } = require('../shared');

const COMPARISON_THEMES = [
  {
    topic: 'attendance',
    positive: /\b(attended\s+all|present\s+at\s+all|completed\s+every|consistent\s+attendance)\b/i,
    negative: /\b(missed|absent|failed\s+to\s+attend|no[-\s]?show)\b/i,
  },
  {
    topic: 'engagement',
    positive: /\b(cooperative|engaged|participated\s+actively|responsive)\b/i,
    negative: /\b(uncooperative|refused\s+to\s+engage|withdrawn|hostile)\b/i,
  },
  {
    topic: 'home_safety',
    positive: /\b(safe\s+housing|clean\s+and\s+appropriate|adequate\s+utilities|stable\s+home)\b/i,
    negative: /\b(unsafe\s+housing|utilities\s+disconnected|hazards\s+observed)\b/i,
  },
];

async function multiDocumentComparisonHandler({ input = {} }) {
  const documentIds = Array.isArray(input.documentIds)
    ? input.documentIds.map((id) => String(id).trim()).filter(Boolean)
    : [];
  const documents = Array.isArray(input.documents) ? input.documents : [];

  if (documentIds.length < 2 && documents.length < 2) {
    return buildSkillEnvelope({
      status: 'insufficient_evidence',
      findings: [],
      confidence: 0,
      evidenceCitations: [],
      limitations: [
        'At least two documents or documentIds are required for multi-document comparison.',
        'Does not resolve disputed facts based on repetition frequency.',
      ],
      fields: {
        agreements: [],
        contradictions: [],
        evidence_gaps: [
          {
            topic: 'document_pair_missing',
            missing_or_unclear: 'Provide at least two document IDs or document payloads to compare.',
            affected_documents: documentIds,
          },
        ],
      },
    });
  }

  const normalizedDocs = documents.length >= 2
    ? documents.map((doc, idx) => ({
      id: String(doc?.id || documentIds[idx] || `doc-${idx + 1}`),
      text: String(doc?.text || doc?.extracted_text || ''),
    }))
    : documentIds.map((id) => ({ id, text: '' }));

  const agreements = [];
  const contradictions = [];
  const evidenceGaps = [];
  const citations = normalizedDocs.map((d) => `document:${d.id}`);

  const docsWithText = normalizedDocs.filter((d) => d.text.trim().length > 0);
  if (docsWithText.length >= 2) {
    for (const theme of COMPARISON_THEMES) {
      const posDocs = docsWithText.filter((d) => theme.positive.test(d.text));
      const negDocs = docsWithText.filter((d) => theme.negative.test(d.text));

      if (posDocs.length > 0 && negDocs.length > 0) {
        contradictions.push({
          topic: theme.topic,
          documents: [...new Set([...posDocs.map((d) => d.id), ...negDocs.map((d) => d.id)])],
          detail: `Conflicting observations on ${theme.topic} across compared documents.`,
          severity: 'high',
        });
      } else if (posDocs.length >= 2) {
        agreements.push({
          topic: theme.topic,
          documents: posDocs.map((d) => d.id),
          detail: `Multiple documents align on positive ${theme.topic} observations.`,
        });
      } else if (negDocs.length >= 2) {
        agreements.push({
          topic: theme.topic,
          documents: negDocs.map((d) => d.id),
          detail: `Multiple documents note concerns regarding ${theme.topic}.`,
        });
      }
    }
  } else {
    evidenceGaps.push({
      topic: 'extracted_text_unavailable',
      missing_or_unclear: 'Document IDs were registered for comparison, but inline text was not supplied in the skill call payload.',
      affected_documents: normalizedDocs.map((d) => d.id),
    });
  }

  if (agreements.length === 0 && contradictions.length === 0 && docsWithText.length >= 2) {
    evidenceGaps.push({
      topic: 'overlapping_themes',
      missing_or_unclear: 'Compared texts address distinct topics without direct thematic overlap on attendance, engagement, or home safety.',
      affected_documents: docsWithText.map((d) => d.id),
    });
  }

  return buildSkillEnvelope({
    status: 'complete',
    findings: [...agreements, ...contradictions],
    confidence: docsWithText.length >= 2 ? 0.82 : 0.6,
    evidenceCitations: citations,
    limitations: [
      'Cross-document comparison does not adjudicate which record is accurate when accounts conflict.',
      'Requires human caseworker verification of dates and observation contexts across records.',
    ],
    fields: {
      agreements,
      contradictions,
      evidence_gaps: evidenceGaps,
    },
  });
}

module.exports = { multiDocumentComparisonHandler };
