'use strict';

const {
  extractInputText,
  splitSentencesWithLocators,
  buildSkillEnvelope,
} = require('../shared');

const EVIDENCE_TYPE_RULES = [
  {
    type: 'record',
    pattern: /\b(certificate|log|attendance\s+record|medical\s+report|hospital\s+record|toxicology|urinalysis|signed\s+agreement|verified\s+by|documented\s+in)\b/i,
  },
  {
    type: 'observation',
    pattern: /\b(observed|witnessed|saw|heard|during\s+the\s+visit|worker\s+noted|arrived\s+on\s+time|interacted\s+warmly)\b/i,
  },
  {
    type: 'allegation',
    pattern: /\b(alleged|allegation|accused|unverified\s+report|anonymous\s+caller|reported\s+concern\s+that)\b/i,
  },
  {
    type: 'opinion',
    pattern: /\b(appears\s+to\s+be|seems|in\s+my\s+opinion|believes\s+that|impression\s+is|feels\s+like)\b/i,
  },
];

const UNSUPPORTED_CLAIM_PATTERN = /\b(unfit|dangerous|neglectful|abusive|never\s+follows\s+through|always\s+late|incapable)\b/i;

async function evidenceExtractionHandler({ input = {} }) {
  const text = extractInputText(input);
  if (!text) {
    return buildSkillEnvelope({
      status: 'insufficient_evidence',
      findings: [],
      confidence: 0,
      evidenceCitations: [],
      limitations: [
        'No source text was supplied for evidence extraction.',
        'Does not independently verify external record authenticity.',
      ],
      fields: {
        evidence_items: [],
        evidence_gaps: [],
      },
    });
  }

  const sentences = splitSentencesWithLocators(text);
  const evidenceItems = [];
  const evidenceGaps = [];
  const citations = [];

  for (const item of sentences) {
    let matchedType = null;
    for (const rule of EVIDENCE_TYPE_RULES) {
      if (rule.pattern.test(item.text)) {
        matchedType = rule.type;
        break;
      }
    }

    if (matchedType) {
      evidenceItems.push({
        claim: item.text,
        evidence: item.text,
        evidence_type: matchedType,
        source_locator: item.locator,
      });
      citations.push(`${item.locator} [${matchedType}] "${item.text}"`);
    }

    if (UNSUPPORTED_CLAIM_PATTERN.test(item.text) && matchedType !== 'record' && matchedType !== 'observation') {
      evidenceGaps.push({
        topic: item.text.slice(0, 80),
        missing_or_unclear: `Broad claim at ${item.locator} lacks cited primary record or dated behavioral observation.`,
        source_locator: item.locator,
      });
    }
  }

  if (evidenceItems.length === 0 && sentences.length > 0) {
    evidenceGaps.push({
      topic: 'corroborating_records',
      missing_or_unclear: 'Narrative contains statements without explicit observation markers or referenced verification records.',
      source_locator: sentences[0].locator,
    });
  }

  const status = evidenceItems.length > 0 || evidenceGaps.length > 0 ? 'complete' : 'insufficient_evidence';
  const confidence = evidenceItems.length > 0
    ? Math.min(0.92, 0.68 + evidenceItems.length * 0.05)
    : 0.45;

  return buildSkillEnvelope({
    status,
    findings: evidenceItems,
    confidence,
    evidenceCitations: citations,
    limitations: [
      'Classifies textual evidence markers (observation, record, allegation, opinion) without verifying external authenticity.',
      'Allegations and opinions must not be elevated to verified facts without corroborating records.',
    ],
    fields: {
      evidence_items: evidenceItems,
      evidence_gaps: evidenceGaps,
    },
  });
}

module.exports = { evidenceExtractionHandler };
