import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { evaluateSafetyPolicy } = require('../../backend/skills/safety-gates.js');

const mockSkill = { id: 'child_safe_conversation' };

test('safety policy flags immediate danger for escalation review', () => {
  const policy = evaluateSafetyPolicy({
    skill: mockSkill,
    input: { message: 'I am unsafe at home right now and someone might hurt me.' },
    output: { draft: 'Thank you for sharing.' },
  });

  assert.equal(policy.decisionSupportOnly, true);
  assert.equal(policy.humanReviewRequired, true);
  assert.equal(policy.requiresEscalationReview, true);
  assert.ok(policy.safetyConcerns.includes('possible_immediate_safety_concern'));
});

test('safety policy blocks irreversible automated decision language', () => {
  const policy = evaluateSafetyPolicy({
    skill: { id: 'case_update' },
    input: { action: 'Automatically decide custody placement today.' },
    output: { recommendation: 'Finalize placement immediately.' },
  });

  assert.ok(policy.automationBlockedReasons.includes('irreversible_decision_automation_prohibited'));
});

test('safety policy flags privacy and child messenger concerns', () => {
  const policy = evaluateSafetyPolicy({
    skill: mockSkill,
    input: { message: 'Please carry a message to your mom and give me your home address and school.' },
    output: {},
  });

  assert.ok(policy.safetyConcerns.includes('privacy_minimization_required'));
  assert.ok(policy.safetyConcerns.includes('child_messenger_role_prohibited'));
  assert.match(policy.participantChoiceGuidance, /pass, take a break/i);
});
