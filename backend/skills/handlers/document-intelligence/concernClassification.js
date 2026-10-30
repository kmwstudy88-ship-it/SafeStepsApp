'use strict';

const {
  extractInputText,
  splitSentencesWithLocators,
  buildSkillEnvelope,
} = require('../shared');

const CONCERN_CATEGORIES = [
  {
    category: 'safety',
    severity: 'high',
    pattern: /\b(physical\s+harm|domestic\s+violence|unsupervised\s+hazard|medical\s+neglect|immediate\s+risk|threat\s+of\s+harm|injury)\b/i,
    triage: 'Prioritize immediate supervisory safety review and verify current child wellbeing.',
  },
  {
    category: 'compliance',
    severity: 'medium',
    pattern: /\b(missed\s+appointment|non[-\s]?compliance|incomplete\s+program|overdue\s+requirement|did\s+not\s+complete)\b/i,
    triage: 'Explore practical barriers (transport, scheduling, childcare) with the family before logging non-compliance.',
  },
  {
    category: 'credibility',
    severity: 'medium',
    pattern: /\b(unverified\s+claim|conflicting\s+report|disputed\s+account|hearsay|uncorroborated)\b/i,
    triage: 'Cross-check disputed or unverified statements against primary records before relying on them.',
  },
  {
    category: 'engagement',
    severity: 'low',
    pattern: /\b(difficulty\s+reaching|missed\s+call|hesitant\s+to\s+participate|withdrawn\s+during\s+meeting|communication\s+breakdown)\b/i,
    triage: 'Use trauma-informed outreach and offer flexible communication channels.',
  },
  {
    category: 'resource',
    severity: 'medium',
    pattern: /\b(transport\s+barrier|food\s+insecurity|utility\s+arrears|childcare\s+shortage|financial\s+hardship|housing\s+waitlist|eviction\s+notice|rent\s+arrears|bus\s+fare|lack\s+of\s+bedding|provider\s+waitlist)\b/i,
    triage: 'Poverty != Neglect Safeguard: Route to Economic & Concrete Supports (ECS) for flexible material aid (rent, utilities, transit, childcare) and toll statutory compliance clocks for provider waitlists rather than treating resource gaps as parental failure.',
  },
];

async function concernClassificationHandler({ input = {} }) {
  const text = extractInputText(input);
  if (!text) {
    return buildSkillEnvelope({
      status: 'insufficient_evidence',
      findings: [],
      confidence: 0,
      evidenceCitations: [],
      limitations: [
        'No document text was provided for concern classification.',
        'Category assignments require human triage validation.',
      ],
      fields: {
        concerns: [],
        triage_hints: [],
      },
    });
  }

  const sentences = splitSentencesWithLocators(text);
  const concerns = [];
  const triageSet = new Set();
  const citations = [];

  for (const item of sentences) {
    for (const rule of CONCERN_CATEGORIES) {
      if (rule.pattern.test(item.text)) {
        concerns.push({
          category: rule.category,
          severity: rule.severity,
          description: item.text,
          source_locator: item.locator,
        });
        triageSet.add(rule.triage);
        citations.push(`${item.locator} [${rule.category}:${rule.severity}] "${item.text}"`);
      }
    }
  }

  const triageHints = [...triageSet];
  if (concerns.length === 0) {
    triageHints.push('No acute concern categories matched in the supplied text; continue routine supportive monitoring.');
  }

  return buildSkillEnvelope({
    status: 'complete',
    findings: concerns,
    confidence: concerns.length > 0 ? Math.min(0.91, 0.7 + concerns.length * 0.05) : 0.75,
    evidenceCitations: citations,
    limitations: [
      'Concern classification distinguishes resource barriers from safety or compliance issues based on explicit wording only.',
      'Requires human caseworker and supervisor triage review.',
    ],
    fields: {
      concerns,
      triage_hints: triageHints,
    },
  });
}

module.exports = { concernClassificationHandler };
