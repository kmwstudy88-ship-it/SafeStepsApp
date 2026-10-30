'use strict';

const { extractInputText, buildSkillEnvelope } = require('../shared');

const EMOTION_PATTERNS = [
  {
    label: 'overwhelmed',
    pattern: /\b(too\s+much|can't\s+keep\s+up|exhausted|drowning|overwhelmed|pulled\s+in\s+every\s+direction|so\s+many\s+things)\b/i,
    validation: 'It makes complete sense that carrying this many demands at once could feel overwhelming.',
  },
  {
    label: 'frustrated',
    pattern: /\b(frustrated|unfair|no\s+one\s+listens|angry|fed\s+up|tired\s+of\s+repeating|irritated)\b/i,
    validation: 'Anyone in this situation might feel frustrated when trying to be heard and make progress.',
  },
  {
    label: 'worried',
    pattern: /\b(worried|anxious|nervous|uncertain|what\s+if|stress|stressed|uneasy)\b/i,
    validation: 'It is understandable to feel worried when so much matters to you and your family.',
  },
  {
    label: 'discouraged',
    pattern: /\b(pointless|give\s+up|nothing\s+works|hopeless|discouraged|sad|exhausting|defeated)\b/i,
    validation: 'When you have been putting in effort for a long time, feeling discouraged is a natural human response.',
  },
  {
    label: 'hopeful_or_determined',
    pattern: /\b(trying\s+my\s+best|want\s+to\s+make\s+it\s+work|committed|ready\s+to|hopeful|proud)\b/i,
    validation: 'Your care and determination to show up for your family come through clearly.',
  },
  {
    label: 'post_visit_separation_grief',
    pattern: /\b(after\s+the\s+visit|saying\s+goodbye|empty\s+house|miss\s+my\s+kids|visit\s+ended|leaving\s+them)\b/i,
    validation: 'The ache after a visit ends is a natural reflection of how deeply you love your child; post-visit transition grief deserves gentle support, not judgment.',
  },
  {
    label: 'institutional_mistrust_or_fear',
    pattern: /\b(used\s+against\s+me|afraid\s+to\s+ask\s+for\s+help|surveilled|judged\s+for\s+being\s+poor|take\s+my\s+child)\b/i,
    validation: 'It is completely understandable to feel guarded; requesting Economic & Concrete Supports (ECS) is protected by the Poverty != Neglect safeguard and cannot be used against you.',
  },
];

async function emotionLabelingHandler({ input = {} }) {
  const message = extractInputText(input);
  if (!message) {
    return buildSkillEnvelope({
      status: 'insufficient_evidence',
      findings: [],
      confidence: 0,
      evidenceCitations: [],
      limitations: [
        'No message text was supplied for tentative emotion labeling.',
        'Emotion labels are reflective prompts, never clinical assessments.',
      ],
      fields: {
        labels: [],
        validation_phrases: [],
      },
    });
  }

  const labels = [];
  const validationPhrases = [];

  for (const rule of EMOTION_PATTERNS) {
    if (rule.pattern.test(message)) {
      labels.push(rule.label);
      validationPhrases.push(rule.validation);
    }
  }

  if (labels.length === 0) {
    labels.push('reflective_concern');
    validationPhrases.push(
      'It sounds like this situation is important to you, and it makes sense to want clarity and support.',
    );
  }

  return buildSkillEnvelope({
    status: 'complete',
    findings: labels.map((label, idx) => ({ label, validation: validationPhrases[idx] })),
    confidence: 0.84,
    evidenceCitations: [`message:"${message.slice(0, 120)}"`],
    limitations: [
      'Emotion labels are tentative invitations for reflection; only the speaker can confirm how they feel.',
    ],
    fields: {
      labels,
      validation_phrases: validationPhrases,
    },
  });
}

module.exports = { emotionLabelingHandler };
