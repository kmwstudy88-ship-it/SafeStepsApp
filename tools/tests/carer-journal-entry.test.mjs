import assert from 'node:assert/strict';
import test from 'node:test';
import { importTypeScriptModule } from './load-typescript-module.mjs';

const { createJournalEntry } = await importTypeScriptModule('../../lib/carers/journalEntry.ts');

test('empty and whitespace-only updates are rejected even when media is attached', () => {
  for (const text of ['', ' ', '\t\r\n', '\u00a0\u2003']) {
    for (const kind of ['Daily update', 'Achievement', 'Worry or concern']) {
      assert.equal(createJournalEntry(kind, text, undefined, 'empty'), null);
      assert.equal(createJournalEntry(kind, text, 'file:///photo.jpg', 'empty'), null);
    }
  }
});

test('each entry kind keeps its classification and starts care-team-only with attached media', () => {
  for (const [kind, title] of [
    ['Daily update', 'Daily care update'],
    ['Achievement', 'A new achievement'],
    ['Worry or concern', 'New concern recorded'],
  ]) {
    for (const imageUri of ['file:///photo.jpg', 'file:///video.mp4']) {
      const entry = createJournalEntry(kind, '  A factual update.\nChild responded calmly.  ', imageUri, 'new-entry');
      assert.deepEqual(entry, {
        id: 'new-entry',
        kind,
        title,
        detail: 'A factual update.\nChild responded calmly.',
        time: 'Just now',
        shared: false,
        imageUri,
      });
    }
  }
});

test('a minimal nonblank update is accepted without an attachment', () => {
  const entry = createJournalEntry('Daily update', '\tA\n', undefined, 'text-only');
  assert.equal(entry.detail, 'A');
  assert.equal(entry.imageUri, undefined);
  assert.equal(entry.shared, false);
});

test('the portal call generates a timestamp identifier without requiring a supplied ID', (t) => {
  t.mock.method(Date, 'now', () => 1791653947000);
  const entry = createJournalEntry('Daily update', 'An update');
  assert.equal(entry.id, '1791653947000');
});

test('separate updates do not inherit media or parent-sharing approval', () => {
  const first = createJournalEntry('Achievement', 'First update', 'file:///photo.jpg', 'first');
  first.shared = true;
  first.detail = 'Changed after creation';

  const second = createJournalEntry('Worry or concern', 'Second update', undefined, 'second');
  assert.notEqual(first, second);
  assert.equal(second.id, 'second');
  assert.equal(second.detail, 'Second update');
  assert.equal(second.imageUri, undefined);
  assert.equal(second.shared, false);
});
