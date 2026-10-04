import assert from 'node:assert/strict';
import test from 'node:test';
import { importTypeScriptModule } from './load-typescript-module.mjs';

const {
  safeStepsSequenceAssessmentDomains,
  safeStepsSequenceAssessmentItems,
} = await importTypeScriptModule('../../lib/data/safeStepsSequenceAssessmentItems.ts');
const {
  sequencePracticeDomainContent,
  sequencePracticeLimitations,
} = await importTypeScriptModule('../../lib/data/safeStepsSequencePracticeContent.ts');

test('sequence practice content covers every declared topic and the existing item set', () => {
  const domainIds = new Set(safeStepsSequenceAssessmentDomains.map((domain) => domain.id));
  assert.deepEqual(
    Object.keys(sequencePracticeDomainContent).sort(),
    [...domainIds].sort(),
  );
  assert.equal(safeStepsSequenceAssessmentItems.length, 157);

  for (const item of safeStepsSequenceAssessmentItems) {
    assert.ok(domainIds.has(item.domainId), `Unknown topic for ${item.id}`);
    assert.ok(item.prompt.length > 20, `Missing prompt for ${item.id}`);
    assert.ok(item.correctSequence.length >= 2, `Too few steps for ${item.id}`);
    assert.equal(new Set(item.correctSequence).size, item.correctSequence.length, `Duplicate steps for ${item.id}`);
  }
});

test('sequence practice content states the unvalidated, unscored, non-persistent limits', () => {
  const limitations = sequencePracticeLimitations.join(' ').toLowerCase();
  assert.match(limitations, /not a validated/);
  assert.match(limitations, /suggested sequence/);
  assert.match(limitations, /not saved or shared/);
  assert.match(limitations, /do not use practice performance/);
});
