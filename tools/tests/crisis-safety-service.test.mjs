import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { stripTypeScriptTypes } from 'node:module';

const source = await readFile(new URL('../../lib/crisis/crisisSafetyService.ts', import.meta.url), 'utf8');
const transformed = stripTypeScriptTypes(source, { mode: 'strip' });
const crisisSafety = await import(
  `data:text/javascript;base64,${Buffer.from(transformed).toString('base64')}`
);

test('detects every configured urgent phrase case-insensitively', () => {
  const phrases = [
    'kill myself',
    'suicide',
    'end it all',
    'hurt the baby',
    'hurt my child',
    'threatened with a knife',
    'he hit me',
    'she hit me',
    'choking me',
  ];

  for (const phrase of phrases) {
    assert.deepEqual(crisisSafety.scanTextForCrisisRisk(`I need help: ${phrase.toUpperCase()} right now.`), {
      hasImmediateRisk: true,
      detectedPhrase: phrase,
    });
  }
});

test('returns only the first matching configured phrase in deterministic priority order', () => {
  assert.deepEqual(
    crisisSafety.scanTextForCrisisRisk('I may hurt my child or kill myself.'),
    { hasImmediateRisk: true, detectedPhrase: 'kill myself' },
  );
  assert.deepEqual(
    crisisSafety.scanTextForCrisisRisk('They were threatened with a knife and she hit me.'),
    { hasImmediateRisk: true, detectedPhrase: 'threatened with a knife' },
  );
});

test('does not match a keyword embedded inside a different configured phrase or word', () => {
  assert.deepEqual(crisisSafety.scanTextForCrisisRisk('She hit me yesterday.'), {
    hasImmediateRisk: true,
    detectedPhrase: 'she hit me',
  });
  assert.deepEqual(crisisSafety.scanTextForCrisisRisk('He is suicidal.'), { hasImmediateRisk: false });
});

test('benign text returns an explicit no-risk result without a detected phrase', () => {
  for (const text of ['', 'I need help calming down.', 'The child is safe with their support person.']) {
    assert.deepEqual(crisisSafety.scanTextForCrisisRisk(text), { hasImmediateRisk: false });
  }
});

test('national crisis resource directory has valid and unique entries for every category', () => {
  const resources = crisisSafety.NATIONAL_CRISIS_RESOURCES;
  assert.equal(resources.length, 4);
  assert.deepEqual(
    [...new Set(resources.map((resource) => resource.category))].sort(),
    ['domestic_violence', 'emergency', 'mental_health', 'parenting'],
  );
  assert.equal(new Set(resources.map((resource) => resource.name)).size, resources.length);

  for (const resource of resources) {
    assert.equal(typeof resource.name, 'string');
    assert.ok(resource.name.trim().length > 0);
    assert.equal(typeof resource.phone, 'string');
    assert.match(resource.phone, /^[\d ]+$/);
    assert.equal(typeof resource.description, 'string');
    assert.ok(resource.description.trim().length > 0);
  }
  assert.equal(resources.find((resource) => resource.category === 'emergency')?.phone, '000');
});
