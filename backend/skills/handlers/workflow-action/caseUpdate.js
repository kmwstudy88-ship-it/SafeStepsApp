'use strict';

const { extractSignalsFromPayload } = require('../../../case-risk/engine');
const { buildSkillEnvelope, normalizeString } = require('../shared');

async function caseUpdateHandler({ input = {} }) {
  const caseId = normalizeString(input.caseId);
  const rawEvent = input && typeof input.event === 'object' && input.event !== null ? input.event : null;

  if (!caseId || !rawEvent) {
    return buildSkillEnvelope({
      status: 'insufficient_evidence',
      findings: [],
      confidence: 0,
      evidenceCitations: [],
      limitations: [
        'Both caseId and an event object are required to prepare a structured case update.',
        'Prepared case updates require human worker review before committing to the case record.',
      ],
      fields: {
        event_payload: null,
        review_notes: ['Provide both caseId and event details to structure a case update payload.'],
      },
    });
  }

  const eventType = normalizeString(rawEvent.event_type || rawEvent.type || 'case_note');
  const summary = normalizeString(rawEvent.summary || rawEvent.description || rawEvent.note || '');
  const extractedSignals = extractSignalsFromPayload(rawEvent.payload || rawEvent);

  const eventPayload = {
    case_id: caseId,
    event_type: eventType,
    summary: summary || `Structured ${eventType} update prepared for review.`,
    recorded_at: rawEvent.recorded_at || rawEvent.created_at || new Date().toISOString(),
    structured_signals: {
      behavioral_cues: extractedSignals.behavioral.map((f) => f.key),
      contextual_factors: extractedSignals.contextual.map((f) => f.key),
      protective_factors: extractedSignals.protective.map((f) => f.key),
      hard_flags: extractedSignals.hardFlags,
    },
    verification_status: 'pending_human_verification',
  };

  const reviewNotes = [
    'Confirm that observational language is separated from worker interpretation before saving.',
  ];
  if (extractedSignals.protective.length === 0) {
    reviewNotes.push('Check whether protective factors or family strengths observed during this event should be recorded.');
  }
  if (extractedSignals.hardFlags.length > 0) {
    reviewNotes.push(`High-priority flags detected (${extractedSignals.hardFlags.join(', ')}); route to supervisor immediately.`);
  }

  return buildSkillEnvelope({
    status: 'complete',
    findings: [eventPayload],
    confidence: 0.86,
    evidenceCitations: [`case:${caseId}`, `event_type:${eventType}`],
    limitations: [
      'Prepares a normalized case update payload for practitioner review; does not bypass human sign-off.',
    ],
    fields: {
      event_payload: eventPayload,
      review_notes: reviewNotes,
    },
  });
}

module.exports = { caseUpdateHandler };
