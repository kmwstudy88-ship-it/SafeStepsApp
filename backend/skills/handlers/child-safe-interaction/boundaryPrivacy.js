'use strict';

const {
  extractInputText,
  splitSentencesWithLocators,
  buildSkillEnvelope,
} = require('../shared');

const PRIVACY_DETECTION_RULES = [
  {
    data_type: 'contact_identifier',
    severity: 'high',
    pattern: /\b(\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})\b/i,
    issue: 'Direct contact number or electronic mail identifier detected.',
  },
  {
    data_type: 'location_or_institution_detail',
    severity: 'medium',
    pattern: /\b(\d+\s+[A-Z][a-z]+\s+(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Lane|Ln)|postcode\s+\d{4}|suburb\s+of)\b/i,
    issue: 'Specific street location or residential identifier detected.',
  },
  {
    data_type: 'government_or_sensitive_id',
    severity: 'high',
    pattern: /\b(Medicare\s+number|centrelink\s+CRN|driver\s+licence\s+#?\d+|birth\s+certificate\s+#?\d+)\b/i,
    issue: 'Sensitive government or identity document number detected.',
  },
  {
    data_type: 'intrusive_prompt',
    severity: 'high',
    pattern: /\b(where\s+do\s+you\s+live|what\s+is\s+your\s+last\s+name|send\s+a\s+photo|who\s+else\s+lives\s+at)\b/i,
    issue: 'Prompt solicits unnecessary personal or identifying details.',
  },
  {
    data_type: 'confidential_peer_mentor_or_ecs_boundary',
    severity: 'high',
    pattern: /\b(share\s+parent\s+partner\s+notes\s+with\s+court|subpoena\s+peer\s+mentor|disclose\s+confidential\s+mentor\s+chat|report\s+ecs\s+request\s+as\s+neglect)\b/i,
    issue: 'Attempts to breach confidential Parent Partner peer-mentorship boundary or use an ECS request as surveillance evidence.',
  },
];

async function boundaryPrivacyHandler({ input = {} }) {
  const message = extractInputText(input);
  if (!message) {
    return buildSkillEnvelope({
      status: 'insufficient_evidence',
      findings: [],
      confidence: 0,
      evidenceCitations: [],
      limitations: [
        'No message or artifact text was supplied for boundary and privacy review.',
      ],
      fields: {
        privacy_flags: [],
        minimization_guidance: [],
      },
    });
  }

  const sentences = splitSentencesWithLocators(message);
  const privacyFlags = [];
  const citations = [];

  for (const item of sentences) {
    for (const rule of PRIVACY_DETECTION_RULES) {
      if (rule.pattern.test(item.text)) {
        privacyFlags.push({
          issue: rule.issue,
          data_type: rule.data_type,
          severity: rule.severity,
          source_locator: item.locator,
        });
        citations.push(`${item.locator} [${rule.data_type}]`);
      }
    }
  }

  const minimizationGuidance = [
    'Collect and retain only the minimum context needed to support safety and wellbeing.',
    'Use role-based references (e.g., "parent", "trusted adult", "support service") instead of unnecessary personal identifiers in shared summaries.',
    'Remind participants that they do not need to share private location or identifying details during coaching exercises.',
    'Protect non-surveilled Parent Partner peer-mentor reflections and Economic & Concrete Supports (ECS) requests from being exported as adversarial court surveillance.',
  ];

  return buildSkillEnvelope({
    status: 'complete',
    findings: privacyFlags,
    confidence: privacyFlags.length > 0 ? 0.9 : 0.82,
    evidenceCitations: citations,
    limitations: [
      'Heuristic privacy check flags common identifier patterns; human review is required before external release.',
    ],
    fields: {
      privacy_flags: privacyFlags,
      minimization_guidance: minimizationGuidance,
    },
  });
}

module.exports = { boundaryPrivacyHandler };
