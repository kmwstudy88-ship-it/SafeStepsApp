import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  buildChildSafeResponse,
  detectDisclosureSignals,
  deriveAgeBand,
  hasImmediateDanger,
} = require('../../backend/personal-ai/child-safe-policy.js');

test('detects sensitive disclosure categories', () => {
  const signals = detectDisclosureSignals('I am scared because someone forced me and threatened me.');
  assert.deepEqual(signals.sort(), ['abuse', 'coercion', 'fear']);
});

test('derives developmental band from age and explicit band', () => {
  assert.equal(deriveAgeBand({ ageYears: 7 }), 'early_child');
  assert.equal(deriveAgeBand({ ageYears: 11 }), 'middle_child');
  assert.equal(deriveAgeBand({ ageYears: 15 }), 'adolescent');
  assert.equal(deriveAgeBand({ ageBand: 'adolescent', ageYears: 8 }), 'adolescent');
});

test('flags immediate danger wording', () => {
  assert.equal(hasImmediateDanger('I feel unsafe at home right now'), true);
  assert.equal(hasImmediateDanger('I was upset yesterday but I am feeling calmer'), false);
});

test('buildChildSafeResponse strips unsafe and identifying prompts and includes privacy boundary', () => {
  const { response, metadata } = buildChildSafeResponse({
    userMessage: 'I feel scared at home.',
    draftResponse: 'Tell me exactly what happened and give me your address and school.',
    context: { ageYears: 10 },
  });

  assert.equal(metadata.disclosureSensitive, true);
  assert.match(response, /Thank you for sharing/i);
  assert.doesNotMatch(response, /exactly what happened/i);
  assert.doesNotMatch(response, /\baddress\b/i);
  assert.doesNotMatch(response, /\bschool\b/i);
  assert.match(response, /do not need to provide names, addresses, or identifying details/i);
});

test('buildChildSafeResponse escalates urgent disclosures and includes safety plan steps', () => {
  const { response, metadata } = buildChildSafeResponse({
    userMessage: 'Someone will hurt me right now and I want to hurt myself.',
    draftResponse: 'I hear you.',
    context: { ageBand: 'adolescent' },
  });

  assert.equal(metadata.immediateDanger, true);
  assert.equal(metadata.requiresHumanReview, true);
  assert.match(response, /contact a trusted adult|emergency services/i);
  assert.match(response, /grounding|slow breaths/i);
});

test('buildChildSafeResponse uses simpler language for early child profile', () => {
  const { response, metadata } = buildChildSafeResponse({
    userMessage: 'I feel scared.',
    draftResponse: 'However, approximately you can move to safety.',
    context: { ageYears: 6 },
  });

  assert.equal(metadata.ageBand, 'early_child');
  assert.match(response, /\bbut\b/i);
  assert.match(response, /\babout\b/i);
  assert.doesNotMatch(response, /\bhowever\b/i);
  assert.doesNotMatch(response, /\bapproximately\b/i);
});
