'use strict';

const { extractInputText, buildSkillEnvelope } = require('../shared');

async function guidedDiscoveryHandler({ input = {} }) {
  const message = extractInputText(input);
  if (!message) {
    return buildSkillEnvelope({
      status: 'insufficient_evidence',
      findings: [],
      confidence: 0,
      evidenceCitations: [],
      limitations: [
        'No message or scenario text was provided for guided discovery.',
      ],
      fields: {
        questions: [],
        opt_out_prompts: [],
      },
    });
  }

  const questions = [
    'When you picture a calmer moment in a fictional scenario like this, what is one small thing that helps everyone feel heard?',
    'What part of this situation feels most within your control right now, and what part needs extra support?',
    'If a friend were navigating a similar moment, what gentle next step might you suggest to them?',
  ];

  const optOutPrompts = [
    'You can pass on any question or switch to a fictional example at any time.',
    'If you prefer to pause, take a breath, or come back to this later, that is completely okay.',
    'Would you rather explore a practical step, or take a break from this topic today?',
  ];

  return buildSkillEnvelope({
    status: 'complete',
    findings: questions.map((question, index) => ({
      question,
      opt_out_prompt: optOutPrompts[index] || optOutPrompts[0],
    })),
    confidence: 0.85,
    evidenceCitations: [`message:"${message.slice(0, 120)}"`],
    limitations: [
      'Guided discovery questions are optional reflection tools; participants always retain choice to pass or pause.',
    ],
    fields: {
      questions,
      opt_out_prompts: optOutPrompts,
    },
  });
}

module.exports = { guidedDiscoveryHandler };
