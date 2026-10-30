'use strict';

const { scoreCaseRisk } = require('../../../case-risk/engine');
const { buildSkillEnvelope, normalizeString } = require('../shared');

async function escalationHandler({ input = {} }) {
  const caseId = normalizeString(input.caseId);
  const signals = input && typeof input.signals === 'object' && input.signals !== null ? input.signals : null;

  if (!signals && !Array.isArray(input.signals)) {
    return buildSkillEnvelope({
      status: 'insufficient_evidence',
      findings: [],
      confidence: 0,
      evidenceCitations: [],
      limitations: [
        'Escalation evaluation requires structured signals or risk indicators.',
        'Advisory escalation routing never executes irreversible case actions.',
      ],
      fields: {
        severity: 'insufficient_evidence',
        rationale: 'No structured risk or escalation signals were provided in the request.',
        review_actions: ['Supply verified behavioral, contextual, or hard escalation signals for supervisory triage.'],
      },
    });
  }

  const normalizedInput = Array.isArray(input.signals)
    ? { behavioralCues: input.signals }
    : {
      behavioralCues: signals.behavioralCues || signals.behavioral || [],
      contextualFactors: signals.contextualFactors || signals.contextual || [],
      protectiveFactors: signals.protectiveFactors || signals.protective || [],
      materialHardshipFactors: signals.materialHardshipFactors || signals.materialHardshipSignals || signals.materialHardship || [],
      structuralBarriers: signals.structuralBarriers || signals.contactMitigatingBarriers || [],
      decoupleMaterialHardship: signals.decoupleMaterialHardship !== false,
      recentEvents: signals.recentEvents || [],
      hardFlags: signals.hardFlags || [],
    };

  const scored = scoreCaseRisk(normalizedInput);
  const severity = scored.tier;
  const rationale = scored.rationale;

  const reviewActions = [];
  if (scored.material_hardship_assessment?.detected) {
    reviewActions.push(
      'Poverty != Neglect Safeguard: Dispatch Economic & Concrete Supports (ECS) flexible funding/vouchers for material hardship indicators rather than escalating child-safety surveillance.',
    );
  }
  if (severity === 'critical' || scored.hard_escalation?.triggered) {
    reviewActions.push(
      'Notify on-call supervisor immediately for same-day human safety review.',
      'Verify immediate physical safety of all children and household members.',
      'Document primary source observations supporting each escalation trigger.',
    );
  } else if (severity === 'high') {
    reviewActions.push(
      'Schedule supervisory case consultation within 24 hours.',
      'Review active safety plan commitments and family support availability.',
    );
  } else if (severity === 'moderate') {
    reviewActions.push(
      'Review emerging risk drivers at next scheduled supervision session.',
      'Strengthen practical and community protective supports with the family.',
    );
  } else {
    reviewActions.push(
      'Continue routine supportive casework and periodic check-ins.',
    );
  }

  const citations = [
    ...(caseId ? [`case:${caseId}`] : []),
    ...scored.factors.map((f) => `factor:${f.category}:${f.key}`),
  ];

  return buildSkillEnvelope({
    status: 'complete',
    findings: [{ severity, score: scored.score, rationale, hard_escalation: scored.hard_escalation }],
    confidence: scored.confidence,
    evidenceCitations: citations,
    limitations: [
      'Escalation severity is an advisory triage recommendation for human supervisors, not an automated intervention.',
    ],
    fields: {
      severity,
      rationale,
      review_actions: reviewActions,
    },
  });
}

module.exports = { escalationHandler };
