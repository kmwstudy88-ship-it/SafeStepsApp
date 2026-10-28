import test from 'node:test';
import assert from 'node:assert/strict';

import { importTypeScriptModule } from './load-typescript-module.mjs';

const {
  detectCrisisSignals,
  getCoachResponse,
  AUSTRALIAN_CRISIS_CONTACTS,
  COACH_SUGGESTED_PROMPTS,
} = await importTypeScriptModule('../../lib/support/supportCoachService.ts');

test('AUSTRALIAN_CRISIS_CONTACTS contains verified 24/7 helplines', () => {
  assert(Array.isArray(AUSTRALIAN_CRISIS_CONTACTS));
  assert(AUSTRALIAN_CRISIS_CONTACTS.length >= 5);

  const emergency = AUSTRALIAN_CRISIS_CONTACTS.find((c) => c.phone === '000');
  assert(emergency);
  assert.equal(emergency.isEmergency, true);

  const lifeline = AUSTRALIAN_CRISIS_CONTACTS.find((c) => c.phone === '13 11 14');
  assert(lifeline);

  const respect = AUSTRALIAN_CRISIS_CONTACTS.find((c) => c.phone === '1800 737 732');
  assert(respect);
});

test('detectCrisisSignals flags acute harm disclosures while allowing normal parenting stress', () => {
  assert.equal(detectCrisisSignals('I am feeling so overwhelmed I want to kill myself'), true);
  assert.equal(detectCrisisSignals('I am worried I might hurt my child when angry'), true);
  assert.equal(detectCrisisSignals('Life is not worth living right now'), true);

  assert.equal(detectCrisisSignals('My toddler threw a tantrum at the supermarket'), false);
  assert.equal(detectCrisisSignals('I feel exhausted and need to take a break'), false);
});

test('getCoachResponse triggers crisis protocol and emergency helpline referral on danger signal', async () => {
  const result = await getCoachResponse('I feel like I want to end it all tonight');
  assert.equal(result.crisisTriggered, true);
  assert.equal(result.handoverOffered, true);
  assert.match(result.message, /Lifeline/i);
  assert.match(result.message, /1800RESPECT/i);
  assert(result.suggestedActions.some((a) => a.includes('Lifeline')));
});

test('getCoachResponse provides calm trauma-informed de-escalation for tantrums and meltdowns', async () => {
  const result = await getCoachResponse('My child is having a huge meltdown before handover');
  assert.equal(result.crisisTriggered, false);
  assert.match(result.message, /lower your posture/i);
  assert.match(result.message, /eye level/i);
  assert(Array.isArray(result.suggestedActions));
  assert(result.suggestedActions.length > 0);
});

test('getCoachResponse provides 4-4-4-4 box breathing guidance', async () => {
  const result = await getCoachResponse('Guide me through a breathing reset');
  assert.equal(result.crisisTriggered, false);
  assert.match(result.message, /4-4-4-4 Box Breathing/i);
  assert.match(result.message, /Inhale slowly/i);
});

test('COACH_SUGGESTED_PROMPTS provides non-judgmental prompt options', () => {
  assert(Array.isArray(COACH_SUGGESTED_PROMPTS));
  assert(COACH_SUGGESTED_PROMPTS.length >= 4);
});
