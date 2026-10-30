'use strict';

const {
  extractInputText,
  splitSentencesWithLocators,
  buildSkillEnvelope,
} = require('../shared');

const BIAS_RULES = [
  {
    category: 'socioeconomic_or_poverty_bias',
    severity: 'high',
    pattern: /\b(chaotic\s+low[-\s]?income\s+lifestyle|welfare[-\s]?dependent|poor\s+neighborhood\s+means\s+unsafe|lacks\s+middle[-\s]?class\s+standards|neglect\s+due\s+to\s+(?:poverty|eviction|utility\s+shutoff|food\s+insecurity))\b/i,
    impact: 'Conflates financial hardship or material poverty with parental lack of care.',
    reframe: 'Distinguish material or housing resource needs from parenting capacity, and document Economic & Concrete Supports (ECS) referrals.',
  },
  {
    category: 'kinship_licensing_disparity_bias',
    severity: 'high',
    pattern: /\b(rejected\s+kinship\s+placement\s+due\s+to\s+(?:square\s+footage|bedroom\s+size|cosmetic\s+housing)|denied\s+relative\s+carer\s+for\s+non[-\s]?safety\s+housing)\b/i,
    impact: 'Excludes safe kinship caregivers using middle-class physical housing metrics unrelated to child safety.',
    reframe: 'Apply Title IV-E / statutory non-safety kinship licensing waivers and ensure foster stipend parity for relative carers.',
  },
  {
    category: 'gender_or_role_stereotyping',
    severity: 'medium',
    pattern: /\b(as\s+a\s+father\s+he\s+naturally\s+cannot|mothers\s+should\s+instinctively|single\s+mothers\s+always\s+struggle|typical\s+absent\s+father)\b/i,
    impact: 'Applies gender or family-structure stereotypes instead of evaluating individual caregiving behavior.',
    reframe: 'Describe specific observed caregiving behaviors, routines, and responsiveness without gender or family-structure generalizations.',
  },
  {
    category: 'disability_or_neurodivergence_bias',
    severity: 'high',
    pattern: /\b(because\s+of\s+(?:her|his|their)\s+disability\s+cannot\s+parent|autistic\s+parent\s+lacks\s+empathy|mental\s+health\s+label\s+makes\s+them\s+incapable)\b/i,
    impact: 'Makes categorical assumptions from a disability or health label without assessing functional support and strengths.',
    reframe: 'Focus on observable caregiving practices and identify reasonable accommodations or tailored supports that enable success.',
  },
  {
    category: ' stigmatizing_character_labels',
    severity: 'medium',
    pattern: /\b(manipulative\s+personality|treatment[-\s]?resistant|chronic\s+complainer|unreliable\s+type)\b/i,
    impact: 'Pejorative label biases downstream readers against collaborative engagement.',
    reframe: 'Replace global personality labels with specific, dated observations and documented communication preferences.',
  },
];

async function biasDiscriminationDetectionHandler({ input = {} }) {
  const text = extractInputText(input);
  if (!text) {
    return buildSkillEnvelope({
      status: 'insufficient_evidence',
      findings: [],
      confidence: 0,
      evidenceCitations: [],
      limitations: [
        'No artifact or narrative text was provided for bias and discrimination detection.',
      ],
      fields: {
        bias_signals: [],
        reframes: [],
      },
    });
  }

  const sentences = splitSentencesWithLocators(text);
  const biasSignals = [];
  const reframes = [];
  const citations = [];

  for (const item of sentences) {
    for (const rule of BIAS_RULES) {
      const match = item.text.match(rule.pattern);
      if (match) {
        biasSignals.push({
          category: rule.category.trim(),
          phrase: match[0],
          excerpt: item.text,
          impact: rule.impact,
          severity: rule.severity,
          source_locator: item.locator,
        });
        reframes.push({
          original: item.text,
          reframe: rule.reframe,
          source_locator: item.locator,
        });
        citations.push(`${item.locator} "${item.text}"`);
      }
    }
  }

  return buildSkillEnvelope({
    status: 'complete',
    findings: biasSignals,
    confidence: biasSignals.length > 0 ? 0.88 : 0.79,
    evidenceCitations: citations,
    limitations: [
      'Pattern-based bias detection is advisory; quoted third-party statements still require contextual human review.',
    ],
    fields: {
      bias_signals: biasSignals,
      reframes,
    },
  });
}

module.exports = { biasDiscriminationDetectionHandler };
