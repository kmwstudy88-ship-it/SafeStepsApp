'use strict';

const { extractInputText, buildSkillEnvelope } = require('../shared');

const HARSH_REPLACEMENTS = [
  {
    pattern: /\byou\s+always\b/gi,
    replacement: 'at times it can feel like',
    note: 'Replaced absolute "you always" with tentative, non-blaming phrasing.',
  },
  {
    pattern: /\byou\s+never\b/gi,
    replacement: 'it has been hard to see',
    note: 'Replaced absolute "you never" with collaborative observation.',
  },
  {
    pattern: /\byou\s+failed\s+to\b/gi,
    replacement: 'we have not yet been able to complete',
    note: 'Shifted punitive "you failed to" into shared problem-solving language.',
  },
  {
    pattern: /\byou\s+refuse\s+to\b/gi,
    replacement: 'there seem to be barriers making it difficult to',
    note: 'Reframed "you refuse to" around exploring barriers and choices.',
  },
  {
    pattern: /\bunacceptable\b/gi,
    replacement: 'challenging for everyone involved',
    note: 'Softened evaluative label "unacceptable" to reduce defensiveness.',
  },
  {
    pattern: /\b(non[-\s]?compliant|out\s+of\s+compliance)\b/gi,
    replacement: 'navigating a scheduling, waitlist, or concrete-support barrier',
    note: 'Reframed punitive "non-compliant" label to explore agency waitlists, transit gaps, or Economic & Concrete Supports (ECS).',
  },
];

async function traumaInformedCommunicationHandler({ input = {} }) {
  const message = extractInputText(input);
  if (!message) {
    return buildSkillEnvelope({
      status: 'insufficient_evidence',
      findings: [],
      confidence: 0,
      evidenceCitations: [],
      limitations: [
        'No draft message was provided for trauma-informed communication coaching.',
      ],
      fields: {
        rewrite: '',
        tone_notes: [],
      },
    });
  }

  let modified = message;
  const toneNotes = [];

  for (const rule of HARSH_REPLACEMENTS) {
    if (rule.pattern.test(modified)) {
      rule.pattern.lastIndex = 0;
      modified = modified.replace(rule.pattern, rule.replacement);
      toneNotes.push(rule.note);
    }
  }

  const rewrite = toneNotes.length > 0
    ? `I want to work together on this: ${modified} Please let me know what feels manageable or if you would like to take a break.`
    : `Thank you for sharing your perspective. ${modified} We can take this one step at a time and adjust based on what feels supportive.`;

  if (toneNotes.length === 0) {
    toneNotes.push(
      'Added collaborative framing and participant choice so the recipient can engage at a comfortable pace.',
    );
  }
  toneNotes.push(
    'Emphasizes psychological safety, predictability, and mutual respect without blaming or shaming.',
  );

  return buildSkillEnvelope({
    status: 'complete',
    findings: [{ original: message, rewrite, tone_notes: toneNotes }],
    confidence: 0.86,
    evidenceCitations: [`message:"${message.slice(0, 120)}"`],
    limitations: [
      'Communication rewrites are coaching suggestions only; review before sending to ensure accuracy for your context.',
    ],
    fields: {
      rewrite,
      tone_notes: toneNotes,
    },
  });
}

module.exports = { traumaInformedCommunicationHandler };
