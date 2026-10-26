'use strict';

const {
  extractInputText,
  splitSentencesWithLocators,
  buildSkillEnvelope,
} = require('../shared');

async function policyInterpretationHandler({ input = {} }) {
  const text = extractInputText(input);
  if (!text) {
    return buildSkillEnvelope({
      status: 'insufficient_evidence',
      findings: [],
      confidence: 0,
      evidenceCitations: [],
      limitations: [
        'No policy or procedural text was provided for plain-language interpretation.',
        'Provides operational policy summaries only; never legal counsel.',
      ],
      fields: {
        policy_summary: '',
        human_review_checkpoints: [],
      },
    });
  }

  const sentences = splitSentencesWithLocators(text);
  const keySentences = sentences.slice(0, 3).map((s) => s.text);
  const policySummary = `Plain-language policy overview: ${keySentences.join(' ')} All operational steps under this policy remain decision-support only and require documented practitioner and supervisor review.`;

  const humanReviewCheckpoints = [
    {
      checkpoint: 'practitioner_context_verification',
      description: 'Confirm how policy criteria apply to the specific documented facts and family strengths of the case.',
    },
    {
      checkpoint: 'supervisory_endorsement',
      description: 'Obtain supervisor review and sign-off before recording any formal compliance or escalation step.',
    },
    {
      checkpoint: 'family_transparency_check',
      description: 'Explain expectations and review pathways to the family in clear, accessible language.',
    },
  ];

  const citations = sentences.slice(0, 3).map((s) => `${s.locator} "${s.text}"`);

  return buildSkillEnvelope({
    status: 'complete',
    findings: [{
      policy_summary: policySummary,
      checkpoint_count: humanReviewCheckpoints.length,
    }],
    confidence: 0.85,
    evidenceCitations: citations,
    limitations: [
      'Plain-language policy summary is for internal practitioner orientation only and must be verified against current statutory and agency guidelines.',
    ],
    fields: {
      policy_summary: policySummary,
      human_review_checkpoints: humanReviewCheckpoints,
    },
  });
}

module.exports = { policyInterpretationHandler };
