'use strict';

const {
  deriveAgeBand,
  detectDisclosureSignals,
  hasImmediateDanger,
} = require('../../../personal-ai/child-safe-policy');
const { extractInputText, buildSkillEnvelope } = require('../shared');

async function safetyPlanningHandler({ input = {}, context = {} }) {
  const message = extractInputText(input);
  if (!message) {
    return buildSkillEnvelope({
      status: 'insufficient_evidence',
      findings: [],
      confidence: 0,
      evidenceCitations: [],
      limitations: [
        'No message or context was provided to generate child-safe safety planning steps.',
      ],
      fields: {
        plan_steps: [],
        escalation_flags: [],
      },
    });
  }

  const ageBand = deriveAgeBand({ ...context, ...input });
  const immediateDanger = hasImmediateDanger(message);
  const disclosureSignals = detectDisclosureSignals(message);

  const planSteps = immediateDanger
    ? [
      'Go to the safest nearby room or trusted adult right away.',
      'Contact local emergency services or a safe adult who can help immediately.',
      'Take slow, steady breaths: breathe in for 4 counts, breathe out for 4 counts.',
    ]
    : ageBand === 'early_child'
      ? [
        'Pick one safe grown-up you can talk to whenever you feel worried.',
        'Choose a cozy, calm spot where you can go to take slow belly breaths.',
        'Remember you can always ask a trusted helper for support.',
      ]
      : [
        'Identify one or two trusted adults you can reach out to if you feel worried or uncomfortable.',
        'Choose a calm space you can step into when things feel tense.',
        'Use a grounding exercise (like naming 5 things you can see and taking 3 slow breaths).',
      ];

  if (!immediateDanger && /\b(visit|goodbye|handover|coming\s+home|back\s+home)\b/i.test(message)) {
    planSteps.push(
      'Keep your special transition comfort item (like a favorite toy, drawing, or shared routine note) close during visit hellos, goodbyes, and return-home transitions.',
    );
  }

  const escalationFlags = [
    ...(immediateDanger ? ['immediate_danger_detected'] : []),
    ...disclosureSignals.map((signal) => `disclosure_${signal}`),
  ];

  return buildSkillEnvelope({
    status: 'complete',
    findings: planSteps.map((step, idx) => ({
      step_number: idx + 1,
      step,
      age_band: ageBand,
    })),
    confidence: 0.88,
    evidenceCitations: [
      `message:"${message.slice(0, 120)}"`,
      ...escalationFlags.map((flag) => `flag:${flag}`),
    ],
    limitations: [
      'Safety planning steps are supportive coping and help-seeking prompts; immediate danger always requires emergency services and human safeguarding intervention.',
    ],
    fields: {
      plan_steps: planSteps,
      escalation_flags: escalationFlags,
    },
  });
}

module.exports = { safetyPlanningHandler };
