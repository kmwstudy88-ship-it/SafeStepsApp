'use strict';

const { extractInputText, buildSkillEnvelope } = require('../shared');

async function deEscalationStrategyHandler({ input = {} }) {
  const message = extractInputText(input);
  if (!message) {
    return buildSkillEnvelope({
      status: 'insufficient_evidence',
      findings: [],
      confidence: 0,
      evidenceCitations: [],
      limitations: [
        'No message or conflict context was provided for de-escalation coaching.',
      ],
      fields: {
        de_escalation_steps: [],
        pause_options: [],
      },
    });
  }

  const deEscalationSteps = [
    'Pause before replying: take three slow breaths and lower vocal pace and volume.',
    'Acknowledge the other person’s underlying concern in one short, neutral sentence without arguing over disputed details.',
    'Shift focus to one shared, immediate priority (such as keeping routines calm and predictable).',
    'Keep children completely out of adult disagreements—never ask a child to carry messages or take sides.',
  ];

  const pauseOptions = [
    '"I want to give this the attention it deserves. Let’s take a 20-minute break and come back to this calmly."',
    '"Right now I need a moment to collect my thoughts so we can communicate respectfully. I will follow up this afternoon."',
    '"Let’s pause this topic for today and focus only on today’s schedule."',
  ];

  return buildSkillEnvelope({
    status: 'complete',
    findings: deEscalationSteps.map((step, idx) => ({
      step_number: idx + 1,
      instruction: step,
    })),
    confidence: 0.87,
    evidenceCitations: [`message:"${message.slice(0, 120)}"`],
    limitations: [
      'De-escalation steps are voluntary communication tools; if anyone is in immediate danger, prioritize physical safety and emergency support.',
    ],
    fields: {
      de_escalation_steps: deEscalationSteps,
      pause_options: pauseOptions,
    },
  });
}

module.exports = { deEscalationStrategyHandler };
