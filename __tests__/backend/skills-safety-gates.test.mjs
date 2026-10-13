import { describe, expect, test } from '@jest/globals';
import { evaluateSafetyPolicy } from '../../backend/skills/safety-gates.js';

describe('skills safety gates and policy enforcement', () => {
  const dummySkill = { id: 'test_skill' };

  test('always enforces decisionSupportOnly and humanReviewRequired', () => {
    const policy = evaluateSafetyPolicy({
      skill: dummySkill,
      input: { text: 'Routine parent observation.' },
      output: { summary: 'Observed positive interaction.' },
    });

    expect(policy.decisionSupportOnly).toBe(true);
    expect(policy.humanReviewRequired).toBe(true);
    expect(policy.automationBlockedReasons).toHaveLength(0);
    expect(policy.safetyConcerns).toHaveLength(0);
    expect(policy.boundaries).toEqual({
      noDiagnosis: true,
      noLegalAdvice: true,
      protectPrivacy: true,
      keepChildrenOutOfAdultDisputes: true,
    });
  });

  test('blocks automated irreversible decisions (custody / placement / removal)', () => {
    const policy = evaluateSafetyPolicy({
      skill: dummySkill,
      input: { text: 'Case assessment notes.' },
      output: { text: 'Automatically decide custody arrangement based on model output.' },
    });

    expect(policy.automationBlockedReasons).toContain(
      'irreversible_decision_automation_prohibited',
    );
  });

  test('blocks automated child removal or placement orders', () => {
    const policy = evaluateSafetyPolicy({
      skill: dummySkill,
      input: { text: 'Automatically order removal of child.' },
      output: { status: 'ordered' },
    });

    expect(policy.automationBlockedReasons).toContain(
      'irreversible_decision_automation_prohibited',
    );
  });

  test('allows non-automated decision support discussions of custody', () => {
    const policy = evaluateSafetyPolicy({
      skill: dummySkill,
      input: { text: 'Review prior court custody orders for chronology.' },
      output: { timeline: ['Court issued interim order on 2026-01-10.'] },
    });

    // Contains "custody" but no automation verbs ("automatically", "auto-approve", "decide")
    expect(policy.automationBlockedReasons).toHaveLength(0);
    expect(policy.decisionSupportOnly).toBe(true);
  });

  test('flags clinical diagnosis or legal advice attempts as safety concerns', () => {
    const policy = evaluateSafetyPolicy({
      skill: dummySkill,
      input: { text: 'Review notes.' },
      output: { finding: 'The mother has a clinical diagnosis of borderline personality disorder.' },
    });

    expect(policy.safetyConcerns).toContain('diagnosis_or_legal_advice_prohibited');
  });

  test('flags direct legal advice or court strategy', () => {
    const policy = evaluateSafetyPolicy({
      skill: dummySkill,
      input: { text: 'How to proceed in court?' },
      output: { recommendation: 'Your legal advice and court strategy should be to plead not guilty.' },
    });

    expect(policy.safetyConcerns).toContain('diagnosis_or_legal_advice_prohibited');
  });

  test('flags privacy minimization requirements when personal identifiers are present', () => {
    const policy = evaluateSafetyPolicy({
      skill: dummySkill,
      input: { text: 'The child attends Lincoln high school at 123 Main Street.' },
      output: { note: 'Extracted address and school details.' },
    });

    expect(policy.safetyConcerns).toContain('privacy_minimization_required');
  });

  test('flags child messenger patterns', () => {
    const policy = evaluateSafetyPolicy({
      skill: dummySkill,
      input: { message: 'Tell your dad for me that he must pay child support.' },
      output: { draft: 'Prompt for child interaction.' },
    });

    expect(policy.safetyConcerns).toContain('child_messenger_role_prohibited');
  });

  test('detects immediate safety danger and triggers escalation review', () => {
    const policy = evaluateSafetyPolicy({
      skill: dummySkill,
      input: { text: 'I am unsafe and being hurt right now at home.' },
      output: { advice: 'Seek safe adult.' },
    });

    expect(policy.requiresEscalationReview).toBe(true);
    expect(policy.safetyConcerns).toContain('possible_immediate_safety_concern');
  });
});
