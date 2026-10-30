'use strict';

const {
  deriveAgeBand,
  detectDisclosureSignals,
  hasImmediateDanger,
  privacyBoundaryNotice,
  removeUnsafePrompts,
} = require('../../../personal-ai/child-safe-policy');
const { extractInputText, buildSkillEnvelope } = require('../shared');

async function childSafeConversationHandler({ input = {}, context = {} }) {
  const message = extractInputText(input);
  if (!message) {
    return buildSkillEnvelope({
      status: 'insufficient_evidence',
      findings: [],
      confidence: 0,
      evidenceCitations: [],
      limitations: [
        'No message was provided for child-safe conversation support.',
      ],
      fields: {
        child_safe_response: '',
        boundaries: [],
      },
    });
  }

  const ageBand = deriveAgeBand({ ...context, ...input });
  const signals = detectDisclosureSignals(message);
  const immediateDanger = hasImmediateDanger(message);
  const sanitizedDraft = removeUnsafePrompts(input.draftResponse || '');

  const greeting = ageBand === 'early_child'
    ? 'Thank you for telling me. You did a brave thing by sharing.'
    : 'Thank you for sharing this with me. You deserve to feel supported and heard.';

  const supportLine = immediateDanger
    ? 'Because safety comes first, please reach out to a trusted safe adult or emergency support right now.'
    : 'You are in charge of what you share here, and we can go at a pace that feels comfortable for you.';

  const childSafeResponse = [
    greeting,
    sanitizedDraft,
    supportLine,
    privacyBoundaryNotice(ageBand),
  ].filter(Boolean).join(' ');

  const boundaries = [
    'Share only what feels comfortable; private identifying details are not needed.',
    'Children are never asked to take sides or carry messages between adults.',
    'Children are never blamed for family money/housing stress or for feeling sad when a visit starts or ends.',
    'If someone is in immediate danger, a trusted adult or emergency service must be contacted right away.',
  ];

  return buildSkillEnvelope({
    status: 'complete',
    findings: [{
      age_band: ageBand,
      disclosure_signals: signals,
      immediate_danger: immediateDanger,
      child_safe_response: childSafeResponse,
    }],
    confidence: 0.9,
    evidenceCitations: [`message:"${message.slice(0, 120)}"`],
    limitations: [
      'Child-safe conversation output is supportive guidance only and requires human practitioner oversight when safety concerns arise.',
    ],
    fields: {
      child_safe_response: childSafeResponse,
      boundaries,
    },
  });
}

module.exports = { childSafeConversationHandler };
