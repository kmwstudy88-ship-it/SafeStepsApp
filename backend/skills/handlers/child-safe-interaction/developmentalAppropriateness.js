'use strict';

const { deriveAgeBand } = require('../../../personal-ai/child-safe-policy');
const { extractInputText, buildSkillEnvelope } = require('../shared');

const BAND_ADAPTATIONS = {
  early_child: [
    'Use short, concrete sentences (5 to 10 words) with warm, reassuring tone.',
    'Replace abstract terms with everyday feelings and simple body-calming steps (e.g., slow belly breaths).',
    'Avoid multi-part questions; offer one clear, low-pressure choice at a time.',
  ],
  middle_child: [
    'Use clear, concrete language and explain what will happen next in predictable steps.',
    'Validate feelings without adult jargon or complex institutional terminology.',
    'Invite questions and affirm the child’s right to pass or take a break.',
  ],
  adolescent: [
    'Use respectful, plain language that honors autonomy and collaborative choice.',
    'Be transparent about privacy boundaries and how information is handled.',
    'Avoid patronizing phrasing; offer practical grounding and support options.',
  ],
  unknown: [
    'Default to plain, accessible language free of clinical or bureaucratic jargon.',
    'Keep sentences concise and explicitly offer the option to pause or skip.',
  ],
};

async function developmentalAppropriatenessHandler({ input = {}, context = {} }) {
  const message = extractInputText(input);
  const ageBand = deriveAgeBand({ ...context, ...input });

  if (!message && ageBand === 'unknown') {
    return buildSkillEnvelope({
      status: 'insufficient_evidence',
      findings: [],
      confidence: 0,
      evidenceCitations: [],
      limitations: [
        'Neither message text nor age/developmental band context was provided.',
      ],
      fields: {
        age_band: 'unknown',
        adaptations: [],
      },
    });
  }

  const adaptations = [...(BAND_ADAPTATIONS[ageBand] || BAND_ADAPTATIONS.unknown)];
  if (ageBand === 'early_child' || ageBand === 'middle_child') {
    adaptations.push(
      'Use PCIT PRIDE skills (Labeled Praise, Reflection, Behavioral Description) and ABC-EC "Following the Lead" rather than rapid-fire adult questioning.',
    );
  }
  if (message && /\b(approximately|therefore|consequently|non-compliance|subsequent|obligations|stipulated)\b/i.test(message)) {
    adaptations.push(
      'Replace formal or bureaucratic words ("consequently", "obligations", "stipulated") with everyday, kid-friendly phrasing.',
    );
  }

  return buildSkillEnvelope({
    status: 'complete',
    findings: adaptations.map((adaptation) => ({ age_band: ageBand, adaptation })),
    confidence: ageBand !== 'unknown' ? 0.89 : 0.75,
    evidenceCitations: [
      `age_band:${ageBand}`,
      ...(message ? [`message:"${message.slice(0, 120)}"`] : []),
    ],
    limitations: [
      'Developmental communication guidance is for phrasing readability only and is never a developmental assessment.',
    ],
    fields: {
      age_band: ageBand,
      adaptations,
    },
  });
}

module.exports = { developmentalAppropriatenessHandler };
