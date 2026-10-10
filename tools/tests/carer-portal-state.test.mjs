import assert from 'node:assert/strict';
import test from 'node:test';
import { importTypeScriptModule } from './load-typescript-module.mjs';

const { createJournalEntry } = await importTypeScriptModule('../../lib/carers/carerPortalState.ts');

test('journal entries cannot be created from empty or whitespace-only text', () => {
  for (const text of ['', '   ', '\n\t  ']) {
    assert.equal(createJournalEntry('Daily update', text, undefined, 'entry-1'), null);
  }
});

test('journal entry text is trimmed and defaults to private care-team-only sharing', () => {
  const entry = createJournalEntry('Daily update', '  Settled after reading.  ', undefined, 'entry-1');

  assert.deepEqual(entry, {
    id: 'entry-1',
    kind: 'Daily update',
    title: 'Daily care update',
    detail: 'Settled after reading.',
    time: 'Just now',
    shared: false,
    imageUri: undefined,
  });
});

test('each journal kind receives its intended title', () => {
  const cases = [
    ['Daily update', 'Daily care update'],
    ['Achievement', 'A new achievement'],
    ['Worry or concern', 'New concern recorded'],
  ];

  for (const [kind, title] of cases) {
    assert.equal(createJournalEntry(kind, 'A factual observation.', undefined, 'entry-1').title, title);
  }
});

test('journal entries retain their selected media while remaining private by default', () => {
  const entry = createJournalEntry('Achievement', 'Completed a task.', 'file:///photo.jpg', 'entry-2');

  assert.equal(entry.imageUri, 'file:///photo.jpg');
  assert.equal(entry.shared, false);
});
