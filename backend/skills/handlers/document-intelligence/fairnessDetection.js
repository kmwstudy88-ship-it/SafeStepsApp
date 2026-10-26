'use strict';

const {
  extractInputText,
  splitSentencesWithLocators,
  buildSkillEnvelope,
} = require('../shared');

const FAIRNESS_PATTERNS = [
  {
    category: 'loaded_language',
    severity: 'medium',
    pattern: /\b(manipulative|hostile|uncooperative|combative|belligerent|defiant|deceitful|lazy|unfit|resistant|erratic)\b/i,
    explanation: 'Subjective character label used without specific observable behavior or verified context.',
    reframe: (match, sentence) => ({
      concern: sentence,
      reframe: `Replace character label "${match[0]}" with specific, observable actions, exact quotes, and surrounding context.`,
    }),
  },
  {
    category: 'unsupported_generalization',
    severity: 'medium',
    pattern: /\b(always\s+refuses|never\s+complies|constantly\s+ignores|incapable\s+of|completely\s+fails|refuses\s+to\s+ever)\b/i,
    explanation: 'Absolute generalization ("always"/"never") presented without dated instances or frequency records.',
    reframe: (match, sentence) => ({
      concern: sentence,
      reframe: `Replace absolute phrase "${match[0]}" with documented dates, counts, and any barriers or partial progress observed.`,
    }),
  },
  {
    category: 'speculative_motive_attribution',
    severity: 'high',
    pattern: /\b(clearly\s+intends\s+to|deliberately\s+trying\s+to|only\s+pretending|faking|doesn't\s+care\s+about|has\s+no\s+interest\s+in)\b/i,
    explanation: 'Infers internal motive or intent as established fact rather than distinguishing observation from interpretation.',
    reframe: (match, sentence) => ({
      concern: sentence,
      reframe: `Separate what was directly said or observed from the worker's interpretation instead of stating "${match[0]}".`,
    }),
  },
  {
    category: 'one_sided_framing',
    severity: 'low',
    pattern: /\b(admitted\s+that|claimed\s+without\s+proof|excuses\s+about)\b/i,
    explanation: 'Framing verb introduces presupposition or skepticism toward one party’s account.',
    reframe: (match, sentence) => ({
      concern: sentence,
      reframe: `Use neutral attribution such as "stated", "reported", or "described" rather than "${match[0]}".`,
    }),
  },
];

async function fairnessDetectionHandler({ input = {} }) {
  const text = extractInputText(input);
  if (!text) {
    return buildSkillEnvelope({
      status: 'insufficient_evidence',
      findings: [],
      confidence: 0,
      evidenceCitations: [],
      limitations: [
        'No narrative text was supplied for fairness analysis.',
        'Cannot infer speaker intent; evaluates textual framing only.',
      ],
      fields: {
        concerns: [],
        objective_reframes: [],
      },
    });
  }

  const sentences = splitSentencesWithLocators(text);
  const concerns = [];
  const objectiveReframes = [];
  const citations = [];

  for (const item of sentences) {
    for (const rule of FAIRNESS_PATTERNS) {
      const match = item.text.match(rule.pattern);
      if (match) {
        concerns.push({
          category: rule.category,
          statement: item.text,
          explanation: rule.explanation,
          severity: rule.severity,
          source_locator: item.locator,
        });
        objectiveReframes.push(rule.reframe(match, item.text));
        citations.push(`${item.locator} "${item.text}"`);
      }
    }
  }

  const confidence = concerns.length > 0
    ? Math.min(0.92, 0.65 + concerns.length * 0.06)
    : 0.78;

  return buildSkillEnvelope({
    status: 'complete',
    findings: concerns,
    confidence,
    evidenceCitations: citations,
    limitations: [
      'Cannot infer author intent; evaluates textual framing within supplied material only.',
      'Fairness indicators are advisory and require human practitioner review.',
    ],
    fields: {
      concerns,
      objective_reframes: objectiveReframes,
    },
  });
}

module.exports = { fairnessDetectionHandler };
