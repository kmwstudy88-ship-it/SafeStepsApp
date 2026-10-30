import test from 'node:test';
import assert from 'node:assert/strict';

import { importTypeScriptModule } from './load-typescript-module.mjs';

const {
  getCarerJournalEntries,
  createCarerJournalEntry,
  toggleEntryParentSharing,
  getCarerMessages,
  sendCarerMonitoredMessage,
  getKinshipSupportSummary,
  requestKinshipSupportAction,
  DEFAULT_MOCK_CARER_ENTRIES,
} = await importTypeScriptModule('../../lib/carers/carerPortalService.ts');

test('getCarerJournalEntries returns mock entries with forensic separation of child words', async () => {
  const entries = await getCarerJournalEntries('child_leo');
  assert(Array.isArray(entries));
  assert(entries.length >= 3);

  const achievement = entries.find((e) => e.kind === 'achievement');
  assert(achievement);
  assert.equal(achievement.title, 'Independent Classroom Entry');
  // Forensic standard assertion: child words must be distinct from observation detail
  assert(achievement.verbatimChildWords);
  assert.notEqual(achievement.verbatimChildWords, achievement.detail);
  assert.match(achievement.verbatimChildWords, /Look Miss Davis/i);
});

test('getCarerJournalEntries filters by entry kind', async () => {
  const routineEntries = await getCarerJournalEntries('child_leo', 'routine');
  assert(routineEntries.length >= 1);
  routineEntries.forEach((e) => {
    assert.equal(e.kind, 'routine');
    assert.equal(e.routineType, 'sleep');
  });

  const visitEntries = await getCarerJournalEntries('child_leo', 'visit_observation');
  assert(visitEntries.length >= 1);
  assert.equal(visitEntries[0].visitStage, 'post_visit_recovery');
});

test('createCarerJournalEntry validates input and captures forensic child quotes', async () => {
  const result = await createCarerJournalEntry({
    placementId: 'placement_leo_01',
    childId: 'child_leo',
    childName: 'Leo (Age 6)',
    carerId: 'carer_anne_lewis',
    kind: 'medical',
    title: 'Dental Checkup Completed',
    detail: 'Leo sat calmly in the dentist chair for his cleaning and cavity check. No cavities found.',
    verbatimChildWords: 'The dentist gave me a tiger sticker for holding still!',
    sharedWithParent: true,
  });

  assert.equal(result.success, true);
  const created = result.entry;
  assert(created.id.startsWith('entry_'));
  assert.equal(created.kind, 'medical');
  assert.equal(created.sharedWithParent, true);
  assert.equal(created.verbatimChildWords, 'The dentist gave me a tiger sticker for holding still!');

  const allAfter = await getCarerJournalEntries('child_leo');
  assert(allAfter.some((e) => e.id === created.id));
});

test('createCarerJournalEntry rejects empty title or detail', async () => {
  const emptyTitle = await createCarerJournalEntry({
    placementId: 'placement_01',
    childId: 'c1',
    childName: 'Leo',
    carerId: 'w1',
    kind: 'daily_update',
    title: '  ',
    detail: 'Some detail',
  });
  assert.equal(emptyTitle.success, false);
  assert.match(emptyTitle.error, /title cannot be empty/i);

  const emptyDetail = await createCarerJournalEntry({
    placementId: 'placement_01',
    childId: 'c1',
    childName: 'Leo',
    carerId: 'w1',
    kind: 'daily_update',
    title: 'Valid Title',
    detail: '  ',
  });
  assert.equal(emptyDetail.success, false);
  assert.match(emptyDetail.error, /detail cannot be empty/i);
});

test('toggleEntryParentSharing toggles sharedWithParent boolean', async () => {
  const entries = await getCarerJournalEntries('child_leo');
  const target = entries[0];
  const originalState = target.sharedWithParent;

  const toggleRes = await toggleEntryParentSharing(target.id);
  assert.equal(toggleRes.success, true);
  assert.equal(toggleRes.entry.sharedWithParent, !originalState);

  // Toggle back
  const toggleBack = await toggleEntryParentSharing(target.id);
  assert.equal(toggleBack.success, true);
  assert.equal(toggleBack.entry.sharedWithParent, originalState);
});

test('getCarerMessages and sendCarerMonitoredMessage enforce monitored messaging rules', async () => {
  const initialMsgs = await getCarerMessages('placement_leo_01');
  assert(Array.isArray(initialMsgs));
  assert(initialMsgs.length >= 2);

  const sendResult = await sendCarerMonitoredMessage({
    placementId: 'placement_leo_01',
    senderRole: 'parent',
    senderName: 'Sarah (Parent)',
    messageText: 'Could you please remind Leo to wear his warm jacket tomorrow?',
  });

  assert.equal(sendResult.success, true);
  assert(sendResult.message.id.startsWith('cmsg_'));
  assert.equal(sendResult.message.monitoredNoticeAcknowledged, true);
  assert.equal(sendResult.message.messageText, 'Could you please remind Leo to wear his warm jacket tomorrow?');

  const afterMsgs = await getCarerMessages('placement_leo_01');
  assert(afterMsgs.some((m) => m.id === sendResult.message.id));

  const emptySend = await sendCarerMonitoredMessage({
    placementId: 'placement_leo_01',
    senderRole: 'carer',
    senderName: 'Anne',
    messageText: '   ',
  });
  assert.equal(emptySend.success, false);
  assert.match(emptySend.error, /cannot be empty/i);
});

test('getKinshipSupportSummary and requestKinshipSupportAction enforce kinship stipend parity and licensing waivers', async () => {
  const before = await getKinshipSupportSummary('placement_leo_01');
  assert.equal(before.stipendParityStatus, 'full_foster_parity');
  assert.equal(before.monthlyStipendCents, before.strangerFosterBenchmarkCents);
  const initialRespite = before.respiteHoursPerMonth;

  const actionRes = await requestKinshipSupportAction({
    placementId: 'placement_leo_01',
    actionType: 'respite_care_hours',
    title: 'Weekend Kinship Respite Care Allocation',
    description: 'Additional 8 hours of monthly respite care to support Maternal Grandmother during school transitions.',
    additionalRespiteHours: 8,
  });

  assert.equal(actionRes.success, true);
  assert.equal(actionRes.summary.respiteHoursPerMonth, initialRespite + 8);
  assert.equal(actionRes.item.status, 'approved');
});
