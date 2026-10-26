import assert from 'node:assert/strict';
import test from 'node:test';
import { importTypeScriptModule } from './load-typescript-module.mjs';

const {
  getShuffledSequenceSteps,
  isSequenceComplete,
  moveSelectedSequenceStep,
} = await importTypeScriptModule('../../lib/assessments/sequencePracticeState.ts');

test('choice ordering is reproducible and preserves every supplied step', () => {
  const item = {
    id: 'routine-example',
    correctSequence: ['Prepare', 'Complete', 'Clean up'],
  };
  const first = getShuffledSequenceSteps(item);

  assert.deepEqual(getShuffledSequenceSteps(item), first);
  assert.deepEqual([...first].sort(), [...item.correctSequence].sort());
  assert.deepEqual(item.correctSequence, ['Prepare', 'Complete', 'Clean up']);
});

test('reordering changes only adjacent steps and cannot move beyond either boundary', () => {
  const steps = ['First', 'Second', 'Third'];

  assert.deepEqual(moveSelectedSequenceStep(steps, 1, -1), ['Second', 'First', 'Third']);
  assert.deepEqual(moveSelectedSequenceStep(steps, 1, 1), ['First', 'Third', 'Second']);
  assert.equal(moveSelectedSequenceStep(steps, 0, -1), steps);
  assert.equal(moveSelectedSequenceStep(steps, 2, 1), steps);
  assert.equal(moveSelectedSequenceStep(steps, -1, 1), steps);
  assert.equal(moveSelectedSequenceStep(steps, steps.length, -1), steps);
});

test('comparison is enabled only when each expected step is selected exactly once', () => {
  const expected = ['Notice', 'Ask for help', 'Choose a next step'];

  assert.equal(isSequenceComplete([], expected), false);
  assert.equal(isSequenceComplete(expected.slice(0, 2), expected), false);
  assert.equal(isSequenceComplete(['Notice', 'Notice', 'Choose a next step'], expected), false);
  assert.equal(isSequenceComplete([...expected, 'Extra'], expected), false);
  assert.equal(isSequenceComplete(['Choose a next step', 'Notice', 'Ask for help'], expected), true);
});
