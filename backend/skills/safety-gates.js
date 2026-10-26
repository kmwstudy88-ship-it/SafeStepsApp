'use strict';

const { detectDisclosureSignals, hasImmediateDanger } = require('../personal-ai/child-safe-policy');

const AUTOMATION_BLOCK_PATTERN = /\b(automatic(?:ally)?|auto(?:-)?approve|finalize|determine|decide|order)\b/i;
const IRREVERSIBLE_DECISION_PATTERN = /\b(placement|custody|legal status|contact arrangement|terminate rights|remove child)\b/i;
const DIAGNOSIS_OR_LEGAL_ADVICE_PATTERN = /\b(diagnos(?:e|is)|clinical diagnosis|legal advice|attorney-client|court strategy)\b/i;
const PRIVACY_RISK_PATTERN = /\b(address|phone|email|school|social security|passport|full name|date of birth)\b/i;
const CHILD_MESSENGER_PATTERN = /\b(carry (?:a )?message|choose sides|report on (?:a|the) parent|spy on|tell your (?:mom|dad|parent) for me)\b/i;

const POLICY_VERSION = 'skills-safety-policy-v1';

function normalizeText(input) {
  if (!input) return '';
  if (typeof input === 'string') return input;
  return JSON.stringify(input);
}

function evaluateSafetyPolicy({ skill, input, output }) {
  const combined = `${normalizeText(input)}\n${normalizeText(output)}`;
  const safetyConcerns = [];
  const automationBlockedReasons = [];

  const immediateDanger = hasImmediateDanger(combined);
  const disclosureSignals = detectDisclosureSignals(combined);

  if (AUTOMATION_BLOCK_PATTERN.test(combined) && IRREVERSIBLE_DECISION_PATTERN.test(combined)) {
    automationBlockedReasons.push('irreversible_decision_automation_prohibited');
  }

  if (DIAGNOSIS_OR_LEGAL_ADVICE_PATTERN.test(combined)) {
    safetyConcerns.push('diagnosis_or_legal_advice_prohibited');
  }

  if (PRIVACY_RISK_PATTERN.test(combined)) {
    safetyConcerns.push('privacy_minimization_required');
  }

  if (CHILD_MESSENGER_PATTERN.test(combined)) {
    safetyConcerns.push('child_messenger_role_prohibited');
  }

  if (immediateDanger) {
    safetyConcerns.push('possible_immediate_safety_concern');
  }

  return {
    policyVersion: POLICY_VERSION,
    skillId: skill?.id || null,
    decisionSupportOnly: true,
    humanReviewRequired: true,
    requiresEscalationReview: immediateDanger,
    disclosureSignals,
    safetyConcerns,
    automationBlockedReasons,
    participantChoiceGuidance: 'Use fictional scenarios for practice. Participants may pass, take a break, or choose another way to participate.',
    boundaries: {
      noDiagnosis: true,
      noLegalAdvice: true,
      protectPrivacy: true,
      keepChildrenOutOfAdultDisputes: true,
    },
  };
}

module.exports = {
  POLICY_VERSION,
  evaluateSafetyPolicy,
};
