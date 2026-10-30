'use strict';

const {
  extractInputText,
  splitSentencesWithLocators,
  buildSkillEnvelope,
} = require('../shared');

const UNREALISTIC_PATTERNS = [
  {
    severity: 'high',
    pattern: /\b(complete\s+\d+\s+(?:courses|programs|classes|sessions)\s+within\s+(?:a\s+week|\d+\s+days)|immediately\s+secure\s+permanent\s+housing\s+within\s+\d+\s+days)\b/i,
    reason: 'Compressed timeline exceeds realistic service availability and intake waitlists.',
    reframe: (sentence) => ({
      expectation: sentence,
      reframe: 'Break into staged milestones aligned with actual provider waitlists and weekly family capacity.',
    }),
  },
  {
    severity: 'high',
    pattern: /\b(attend\s+all\s+appointments\s+while\s+working\s+full[-\s]?time\s+without\s+(?:transport|childcare)|must\s+find\s+own\s+transport\s+to\s+daily|attend\s+\d+\s+appointments\s+per\s+week\s+without\s+support)\b/i,
    reason: 'Expectation conflicts with documented employment, childcare, or transport constraints.',
    reframe: (sentence) => ({
      expectation: sentence,
      reframe: 'Co-design a schedule around work hours and provide agency transport/childcare assistance or telehealth options.',
    }),
  },
  {
    severity: 'medium',
    pattern: /\b(never\s+display\s+(?:frustration|stress|emotion|upset)|demonstrate\s+perfect\s+parenting|zero\s+mistakes|complete\s+emotional\s+control\s+at\s+all\s+times)\b/i,
    reason: 'Perfectionistic emotional or behavioral standard that no parent could reasonably sustain.',
    reframe: (sentence) => ({
      expectation: sentence,
      reframe: 'Focus on observable repair, safe co-regulation, and use of support strategies when stress arises.',
    }),
  },
  {
    severity: 'medium',
    pattern: /\b(simultaneously\s+complete|at\s+the\s+same\s+time\s+attend\s+(?:three|four|five|\d+)\s+programs)\b/i,
    reason: 'Concurrent multi-program load risks service fatigue and scheduling collisions.',
    reframe: (sentence) => ({
      expectation: sentence,
      reframe: 'Sequence services in priority order so the participant can meaningfully engage in one or two core supports at a time.',
    }),
  },
  {
    severity: 'high',
    pattern: /\b(penalized\s+despite\s+waitlist|non[-\s]?compliant\s+while\s+on\s+waiting\s+list|complete\s+therapy\s+despite\s+\d+[-\s]?week\s+waitlist)\b/i,
    reason: 'Penalizes parent for agency or provider waitlists outside parental control (ASFA / statutory timeline collision).',
    reframe: (sentence) => ({
      expectation: sentence,
      reframe: 'Pause/toll the statutory compliance clock while the parent is on a verified provider waitlist and credit interim self-directed progress.',
    }),
  },
];

async function unrealisticExpectationDetectionHandler({ input = {} }) {
  const text = extractInputText(input);
  if (!text) {
    return buildSkillEnvelope({
      status: 'insufficient_evidence',
      findings: [],
      confidence: 0,
      evidenceCitations: [],
      limitations: [
        'No document text was provided for expectation realism analysis.',
        'Cannot evaluate external support availability not mentioned in the record.',
      ],
      fields: {
        unrealistic_expectations: [],
        suggested_reframes: [],
      },
    });
  }

  const sentences = splitSentencesWithLocators(text);
  const unrealisticExpectations = [];
  const suggestedReframes = [];
  const citations = [];

  for (const item of sentences) {
    for (const rule of UNREALISTIC_PATTERNS) {
      if (rule.pattern.test(item.text)) {
        unrealisticExpectations.push({
          expectation: item.text,
          reason: rule.reason,
          impacted_party: 'parent_or_carer',
          severity: rule.severity,
          source_locator: item.locator,
        });
        suggestedReframes.push(rule.reframe(item.text));
        citations.push(`${item.locator} "${item.text}"`);
      }
    }
  }

  return buildSkillEnvelope({
    status: 'complete',
    findings: unrealisticExpectations,
    confidence: unrealisticExpectations.length > 0 ? Math.min(0.9, 0.72 + unrealisticExpectations.length * 0.06) : 0.74,
    evidenceCitations: citations,
    limitations: [
      'Evaluates textual expectations against common service-load and timeline feasibility heuristics.',
      'Unmet unrealistic expectations must not be documented as parental failure; human review required.',
    ],
    fields: {
      unrealistic_expectations: unrealisticExpectations,
      suggested_reframes: suggestedReframes,
    },
  });
}

module.exports = { unrealisticExpectationDetectionHandler };
