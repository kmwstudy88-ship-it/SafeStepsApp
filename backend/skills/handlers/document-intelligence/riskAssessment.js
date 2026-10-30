'use strict';

const { scoreCaseRisk } = require('../../../case-risk/engine');
const {
  extractInputText,
  splitSentencesWithLocators,
  buildSkillEnvelope,
} = require('../shared');

const TEXT_RISK_PATTERNS = [
  { factor: 'escalating_conflict_or_threat', type: 'behavioral', severity: 'high', pattern: /\b(threatened|intimidated|escalating\s+conflict|violent\s+outburst|physical\s+altercation)\b/i },
  { factor: 'substance_relapse_or_missed_screen', type: 'contextual', severity: 'medium', pattern: /\b(relapse|missed\s+screen|positive\s+toxicology|unmanaged\s+substance)\b/i },
  { factor: 'housing_or_utility_instability', type: 'contextual', severity: 'medium', pattern: /\b(eviction\s+notice|housing\s+instability|utilities\s+shut\s+off|unsafe\s+sleeping)\b/i },
  { factor: 'missed_contact_or_supervision_gap', type: 'behavioral', severity: 'low', pattern: /\b(missed\s+visit|cancelled\s+contact|unsupervised\s+contact\s+concern)\b/i },
];

const TEXT_PROTECTIVE_PATTERNS = [
  { factor: 'consistent_visit_attendance', pattern: /\b(attended\s+all\s+visits|consistent\s+attendance|arrived\s+prepared|engaged\s+warmly)\b/i },
  { factor: 'active_support_network', pattern: /\b(kinship\s+support|grandmother\s+assisting|extended\s+family\s+support|community\s+mentor)\b/i },
  { factor: 'service_engagement', pattern: /\b(completed\s+parenting\s+module|engaged\s+in\s+counseling|participated\s+in\s+program|followed\s+safety\s+plan)\b/i },
  { factor: 'stable_home_routine', pattern: /\b(stable\s+housing|predictable\s+routine|safe\s+home\s+environment)\b/i },
  { factor: 'parent_partner_peer_mentorship', pattern: /\b(parent\s+partner|peer\s+mentor|lived[\s-]experience\s+mentor)\b/i },
  { factor: 'economic_concrete_support_stabilized', pattern: /\b(concrete\s+support|utility\s+grant|transit\s+voucher|flexible\s+funding|ecs\s+grant)\b/i },
  { factor: 'abc_pcit_dyadic_coaching', pattern: /\b(followed\s+the\s+child's\s+lead|labeled\s+praise|abc\s+coaching|pcit|dyadic\s+coaching)\b/i },
];

async function riskAssessmentHandler({ input = {} }) {
  const text = extractInputText(input);
  const rawSignals = input && typeof input.signals === 'object' && input.signals !== null ? input.signals : null;

  const riskSignals = [];
  const protectiveSignals = [];
  const uncertainties = [];
  const citations = [];

  if (rawSignals) {
    const scored = scoreCaseRisk({
      behavioralCues: rawSignals.behavioralCues || rawSignals.behavioral || [],
      contextualFactors: rawSignals.contextualFactors || rawSignals.contextual || [],
      protectiveFactors: rawSignals.protectiveFactors || rawSignals.protective || [],
      recentEvents: rawSignals.recentEvents || [],
      hardFlags: rawSignals.hardFlags || [],
    });

    for (const factor of scored.factors) {
      if (factor.direction === 'increase') {
        riskSignals.push({
          factor: factor.key,
          type: factor.category,
          severity: factor.weight >= 15 ? 'high' : factor.weight >= 8 ? 'medium' : 'low',
          evidence_locator: `signal:${factor.source}:${factor.key}`,
        });
        citations.push(`signal:${factor.source}:${factor.key}`);
      } else {
        protectiveSignals.push({
          factor: factor.key,
          evidence_locator: `signal:${factor.source}:${factor.key}`,
        });
        citations.push(`signal:${factor.source}:${factor.key}`);
      }
    }

    if (scored.hard_escalation?.triggers?.length) {
      for (const trigger of scored.hard_escalation.triggers) {
        riskSignals.push({
          factor: trigger.key,
          type: 'hard_escalation',
          severity: 'critical',
          evidence_locator: `hard_flag:${trigger.key}`,
        });
        citations.push(`hard_flag:${trigger.key}`);
      }
    }
  }

  if (text) {
    const sentences = splitSentencesWithLocators(text);
    for (const item of sentences) {
      for (const rule of TEXT_RISK_PATTERNS) {
        if (rule.pattern.test(item.text)) {
          riskSignals.push({
            factor: rule.factor,
            type: rule.type,
            severity: rule.severity,
            evidence_locator: item.locator,
          });
          citations.push(`${item.locator} "${item.text}"`);
        }
      }
      for (const rule of TEXT_PROTECTIVE_PATTERNS) {
        if (rule.pattern.test(item.text)) {
          protectiveSignals.push({
            factor: rule.factor,
            evidence_locator: item.locator,
          });
          citations.push(`${item.locator} "${item.text}"`);
        }
      }
    }
  }

  if (!riskSignals.length && !protectiveSignals.length) {
    uncertainties.push('Insufficient structured signals or narrative evidence to extract verified risk or protective factors.');
    return buildSkillEnvelope({
      status: 'insufficient_evidence',
      findings: [],
      confidence: 0.25,
      evidenceCitations: [],
      limitations: [
        'Risk signal extraction is decision-support only and never replaces multidisciplinary practitioner judgment.',
      ],
      fields: {
        risk_signals: [],
        protective_signals: [],
        uncertainties,
      },
    });
  }

  if (riskSignals.length > 0 && protectiveSignals.length === 0) {
    uncertainties.push('No protective factors were documented in the supplied input; verify whether family strengths were omitted.');
  }
  if (protectiveSignals.length > 0 && riskSignals.length === 0) {
    uncertainties.push('Only protective signals were identified in the excerpt; review full case history for complete context.');
  }
  if (riskSignals.some((r) => r.factor === 'housing_or_utility_instability')) {
    uncertainties.push(
      'Poverty != Neglect Safeguard: Housing or utility instability detected. Verify that material hardship is decoupled from parental neglect scoring and routed to Economic & Concrete Supports (ECS).'
    );
  }

  const totalSignals = riskSignals.length + protectiveSignals.length;
  const confidence = Math.min(0.9, 0.55 + totalSignals * 0.07);

  return buildSkillEnvelope({
    status: 'complete',
    findings: [
      ...riskSignals.map((r) => ({ kind: 'risk', ...r })),
      ...protectiveSignals.map((p) => ({ kind: 'protective', ...p })),
    ],
    confidence,
    evidenceCitations: citations,
    limitations: [
      'Extracted risk and protective signals are advisory indicators, not a clinical assessment or case determination.',
      'Requires human supervisor/practitioner review alongside complete family context.',
    ],
    fields: {
      risk_signals: riskSignals,
      protective_signals: protectiveSignals,
      uncertainties,
    },
  });
}

module.exports = { riskAssessmentHandler };
