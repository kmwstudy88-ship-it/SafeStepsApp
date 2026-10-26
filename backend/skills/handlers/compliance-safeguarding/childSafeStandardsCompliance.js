'use strict';

const {
  extractInputText,
  splitSentencesWithLocators,
  buildSkillEnvelope,
} = require('../shared');

const COMPLIANCE_RULES = [
  {
    standard: 'Child Empowerment & Participation',
    severity: 'high',
    pattern: /\b(child\s+was\s+not\s+consulted|no\s+need\s+to\s+ask\s+the\s+child|children\s+should\s+just\s+obey|dismissed\s+the\s+child's\s+view)\b/i,
    issue: 'Artifact indicates the child’s voice or perspective was excluded or dismissed.',
  },
  {
    standard: 'Safeguarding & Timely Escalation',
    severity: 'high',
    pattern: /\b(keep\s+this\s+between\s+us|promised\s+secrecy|delayed\s+reporting|did\s+not\s+escalate\s+safety\s+concern)\b/i,
    issue: 'Secrecy promise or delayed safeguarding escalation conflicts with child-safe reporting standards.',
  },
  {
    standard: 'Family & Community Involvement',
    severity: 'medium',
    pattern: /\b(excluded\s+family\s+from\s+planning|without\s+informing\s+carers|refused\s+interpreter|no\s+cultural\s+support\s+offered)\b/i,
    issue: 'Barrier to equitable family or cultural participation in safety and support planning.',
  },
  {
    standard: 'Child-Safe Communication & Boundaries',
    severity: 'high',
    pattern: /\b(asked\s+child\s+to\s+monitor\s+parent|told\s+child\s+adult\s+court\s+details|blamed\s+the\s+child)\b/i,
    issue: 'Places adult conflict responsibility or inappropriate adult details onto a child.',
  },
];

async function childSafeStandardsComplianceHandler({ input = {} }) {
  const text = extractInputText(input);
  if (!text) {
    return buildSkillEnvelope({
      status: 'insufficient_evidence',
      findings: [],
      confidence: 0,
      evidenceCitations: [],
      limitations: [
        'No artifact text was supplied for Child Safe Standards compliance review.',
      ],
      fields: {
        compliance_flags: [],
        review_requirements: [],
      },
    });
  }

  const sentences = splitSentencesWithLocators(text);
  const complianceFlags = [];
  const citations = [];

  for (const item of sentences) {
    for (const rule of COMPLIANCE_RULES) {
      if (rule.pattern.test(item.text)) {
        complianceFlags.push({
          standard: rule.standard,
          issue: rule.issue,
          severity: rule.severity,
          excerpt: item.text,
          source_locator: item.locator,
        });
        citations.push(`${item.locator} [${rule.standard}] "${item.text}"`);
      }
    }
  }

  const reviewRequirements = [
    'Verify that child voice and developmental wishes are documented in a trauma-informed, non-leading manner.',
    'Confirm that family members and carers have accessible pathways to participate in safety planning.',
    'Ensure any safeguarding or harm indicators are routed immediately to a qualified human supervisor.',
  ];

  return buildSkillEnvelope({
    status: 'complete',
    findings: complianceFlags,
    confidence: complianceFlags.length > 0 ? 0.89 : 0.8,
    evidenceCitations: citations,
    limitations: [
      'Automated compliance check reviews supplied text against Child Safe Standards indicators only; does not replace formal organizational audit.',
    ],
    fields: {
      compliance_flags: complianceFlags,
      review_requirements: reviewRequirements,
    },
  });
}

module.exports = { childSafeStandardsComplianceHandler };
