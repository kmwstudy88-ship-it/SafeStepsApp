'use strict';

const {
  deriveAgeBand,
  detectDisclosureSignals,
  hasImmediateDanger,
} = require('../../../personal-ai/child-safe-policy');
const { extractInputText, buildSkillEnvelope } = require('../shared');

async function disclosureSensitiveHandlingHandler({ input = {}, context = {} }) {
  const message = extractInputText(input);
  if (!message) {
    return buildSkillEnvelope({
      status: 'insufficient_evidence',
      findings: [],
      confidence: 0,
      evidenceCitations: [],
      limitations: [
        'No message text was supplied for disclosure-sensitive handling.',
      ],
      fields: {
        supportive_response: '',
        review_route: null,
      },
    });
  }

  const ageBand = deriveAgeBand({ ...context, ...input });
  const signals = detectDisclosureSignals(message);
  const immediateDanger = hasImmediateDanger(message);
  const materialHardshipMentioned = /\b(hungry|no\s+electricity|lights\s+went\s+out|evicted|no\s+bed|bus\s+broke)\b/i.test(message);

  const supportiveResponse = immediateDanger
    ? 'Thank you for telling me. What is happening is not your fault, and your safety matters most right now. Please connect with a safe trusted adult or local emergency support immediately.'
    : signals.length > 0
      ? 'Thank you for sharing something so important. It is not your fault, and you do not have to go through this alone. You only need to share what feels okay while we connect with a trusted support person.'
      : 'Thank you for sharing how things are going. You can always share at your own pace, and a trusted adult is available if you ever need extra support.';

  const reviewRoute = {
    urgency: immediateDanger ? 'immediate_emergency_escalation' : signals.length > 0 ? 'priority_human_safeguarding_review' : 'routine_supportive_monitoring',
    matched_signals: signals,
    immediate_danger: immediateDanger,
    ecs_material_support_flag: materialHardshipMentioned && !immediateDanger && signals.length === 0,
    age_band: ageBand,
    assigned_reviewer_role: immediateDanger || signals.length > 0 ? 'safeguarding_supervisor' : 'caseworker',
    handling_rules: [
      'Do not probe for forensic details or ask leading questions.',
      'Reassure the young person that they are heard and not to blame.',
      'Route any disclosure of harm to a qualified human safeguarding practitioner.',
      ...(materialHardshipMentioned
        ? ['Poverty != Neglect Safeguard: Distinguish household material hardship (food, utility, bedding, or transport needs) from abuse disclosures and route to Economic & Concrete Supports (ECS).']
        : []),
    ],
  };

  return buildSkillEnvelope({
    status: 'complete',
    findings: [{
      supportive_response: supportiveResponse,
      review_route: reviewRoute,
    }],
    confidence: signals.length > 0 ? 0.92 : 0.84,
    evidenceCitations: [
      `message:"${message.slice(0, 120)}"`,
      ...signals.map((s) => `disclosure_signal:${s}`),
    ],
    limitations: [
      'Flags potential disclosure sensitivity and provides non-probing supportive wording; cannot verify factual claims or replace mandatory human safeguarding procedures.',
    ],
    fields: {
      supportive_response: supportiveResponse,
      review_route: reviewRoute,
    },
  });
}

module.exports = { disclosureSensitiveHandlingHandler };
