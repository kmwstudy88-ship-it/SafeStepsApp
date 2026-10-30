'use strict';

const {
  extractInputText,
  splitSentencesWithLocators,
  buildSkillEnvelope,
} = require('../shared');

const CULTURAL_SAFETY_RULES = [
  {
    issue: 'kinship_and_extended_family_devaluation',
    severity: 'high',
    pattern: /\b(too\s+many\s+relatives\s+involved|overcrowded\s+extended\s+family|non[-\s]?nuclear\s+household\s+is\s+unstable|aunties\s+and\s+grandparents\s+interfering)\b/i,
    impact: 'Pathologizes collective kinship caregiving and extended family support networks.',
    alternative: 'Recognize extended family and kinship networks as protective cultural strengths and collaborate with elders/kin as partners.',
  },
  {
    issue: 'language_and_communication_barrier_dismissal',
    severity: 'high',
    pattern: /\b(no\s+interpreter\s+needed|broken\s+english\s+shows\s+lack\s+of\s+understanding|child\s+translated\s+for\s+parent|refused\s+translation)\b/i,
    impact: 'Denies language access or inappropriately uses a child as an interpreter for adult matters.',
    alternative: 'Engage an accredited independent interpreter and provide translated materials in the family’s preferred language.',
  },
  {
    issue: 'cultural_or_community_disconnect',
    severity: 'medium',
    pattern: /\b(cultural\s+practices\s+are\s+irrelevant|assimilate|ignore\s+cultural\s+background|community\s+connection\s+not\s+important)\b/i,
    impact: 'Disregards cultural identity, community connection, and culturally grounded protective factors.',
    alternative: 'Consult with culturally appropriate community organizations, family-led decision makers, or cultural advisors.',
  },
  {
    issue: 'paternal_and_fatherhood_network_exclusion',
    severity: 'high',
    pattern: /\b(father\s+not\s+contacted|paternal\s+relatives\s+excluded|mothers[-\s]?only\s+program|ignored\s+paternal\s+kinship)\b/i,
    impact: 'Excludes the father and paternal kinship network from case planning, family time, and placement consideration.',
    alternative: 'Conduct active fatherhood outreach, include paternal kin in safety circles and kinship assessments, and ensure gender-inclusive parenting coaching.',
  },
];

async function culturalSafetyHandler({ input = {} }) {
  const text = extractInputText(input);
  if (!text) {
    return buildSkillEnvelope({
      status: 'insufficient_evidence',
      findings: [],
      confidence: 0,
      evidenceCitations: [],
      limitations: [
        'No artifact text was provided for cultural safety review.',
        'Cannot replace lived-experience consultation or community-controlled cultural authority.',
      ],
      fields: {
        cultural_safety_concerns: [],
        alternatives: [],
      },
    });
  }

  const sentences = splitSentencesWithLocators(text);
  const concerns = [];
  const alternatives = [];
  const citations = [];

  for (const item of sentences) {
    for (const rule of CULTURAL_SAFETY_RULES) {
      if (rule.pattern.test(item.text)) {
        concerns.push({
          issue: rule.issue,
          excerpt: item.text,
          impact: rule.impact,
          severity: rule.severity,
          source_locator: item.locator,
        });
        alternatives.push(rule.alternative);
        citations.push(`${item.locator} "${item.text}"`);
      }
    }
  }

  if (alternatives.length === 0) {
    alternatives.push(
      'Continue affirming kinship networks, preferred language access, and community-led cultural supports in casework documentation.',
    );
  }

  return buildSkillEnvelope({
    status: 'complete',
    findings: concerns,
    confidence: concerns.length > 0 ? 0.87 : 0.78,
    evidenceCitations: citations,
    limitations: [
      'Automated cultural safety check cannot replace consultation with cultural advisors, elders, or community-controlled agencies.',
    ],
    fields: {
      cultural_safety_concerns: concerns,
      alternatives: [...new Set(alternatives)],
    },
  });
}

module.exports = { culturalSafetyHandler };
