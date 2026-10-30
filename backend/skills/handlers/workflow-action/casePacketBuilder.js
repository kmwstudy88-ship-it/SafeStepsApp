'use strict';

const { buildSkillEnvelope, normalizeString } = require('../shared');

async function casePacketBuilderHandler({ input = {} }) {
  const caseId = normalizeString(input.caseId);
  if (!caseId) {
    return buildSkillEnvelope({
      status: 'insufficient_evidence',
      findings: [],
      confidence: 0,
      evidenceCitations: [],
      limitations: [
        'A valid caseId is required to assemble a structured case review packet.',
        'All packet sections require human practitioner and supervisor sign-off before external sharing.',
      ],
      fields: {
        packet_sections: [],
        open_questions: ['Supply caseId and source records to populate packet sections.'],
        human_review_queue: [],
      },
    });
  }

  const documents = Array.isArray(input.documents) ? input.documents : [];
  const events = Array.isArray(input.events) ? input.events : [];
  const notes = normalizeString(input.summary || input.notes || '');

  const packetSections = [
    {
      section_id: 'case_overview',
      title: 'Case Identification & Context Summary',
      case_id: caseId,
      content: notes || `Structured decision-support packet prepared for case ${caseId}.`,
      source_count: documents.length + events.length,
    },
    {
      section_id: 'protective_factors_and_strengths',
      title: 'Documented Protective Factors & Family Strengths',
      case_id: caseId,
      content: Array.isArray(input.protectiveFactors) && input.protectiveFactors.length
        ? input.protectiveFactors.join('; ')
        : 'Pending practitioner review of verified family strengths and kinship supports.',
      source_count: Array.isArray(input.protectiveFactors) ? input.protectiveFactors.length : 0,
    },
    {
      section_id: 'evidence_and_chronology',
      title: 'Verified Evidence & Timeline Summary',
      case_id: caseId,
      content: documents.length
        ? `Includes ${documents.length} referenced document(s) and ${events.length} logged case event(s).`
        : 'No verified documents attached in request payload; link primary case records before finalizing.',
      source_count: documents.length,
    },
    {
      section_id: 'fairness_and_barriers_check',
      title: 'Service Barriers & Objective Language Check',
      case_id: caseId,
      content: 'Ensure practical barriers (transport, work hours, waitlists) are distinguished from engagement concerns.',
      source_count: documents.length,
    },
    {
      section_id: 'structural_equity_ecs_and_step_down',
      title: 'Economic & Concrete Supports (ECS), Waitlist Tolling & 12-Month Step-Down Plan',
      case_id: caseId,
      content:
        'Verify that poverty/material hardship is decoupled from neglect (routed to ECS flexible grants), provider waitlist delays toll the statutory compliance clock, and a graduated 12-month post-reunification step-down plan is active.',
      source_count: documents.length,
    },
  ];

  const openQuestions = [];
  if (documents.length === 0) {
    openQuestions.push('Which verified source documents should be linked to this case packet before supervisory review?');
  }
  if (!Array.isArray(input.protectiveFactors) || input.protectiveFactors.length === 0) {
    openQuestions.push('Have all current family protective factors and kinship supports been documented alongside risk signals?');
  }
  openQuestions.push('Have disputed statements been clearly separated from verified observations?');

  const humanReviewQueue = [
    {
      checkpoint_id: 'practitioner_accuracy_check',
      role: 'caseworker',
      status: 'pending_review',
      description: 'Verify that every claim in the packet cites a primary observation or record.',
    },
    {
      checkpoint_id: 'supervisor_fairness_endorsement',
      role: 'supervisor',
      status: 'pending_review',
      description: 'Confirm balanced inclusion of protective factors, cultural safety considerations, and barrier context.',
    },
    {
      checkpoint_id: 'structural_equity_and_ecs_verification',
      role: 'supervisor',
      status: 'pending_review',
      description: 'Confirm Poverty != Neglect separation, agency waitlist compliance-clock tolling, kinship parity, and 12-month step-down support.',
    },
  ];

  const citations = [
    `case:${caseId}`,
    ...documents.map((doc, idx) => `document:${doc?.id || idx + 1}`),
  ];

  return buildSkillEnvelope({
    status: 'complete',
    findings: packetSections,
    confidence: documents.length > 0 ? 0.85 : 0.65,
    evidenceCitations: citations,
    limitations: [
      'Draft case packet is decision-support only and cannot be submitted or shared without human review.',
    ],
    fields: {
      packet_sections: packetSections,
      open_questions: openQuestions,
      human_review_queue: humanReviewQueue,
    },
  });
}

module.exports = { casePacketBuilderHandler };
