import test from 'node:test';
import assert from 'node:assert/strict';

import { importTypeScriptModule } from './load-typescript-module.mjs';

const {
  getCalendarEvents,
  getUpcomingEvents,
  createCalendarEvent,
  markEventCompleted,
  excuseEventForSystemicBarrier,
  DEFAULT_MOCK_EVENTS,
} = await importTypeScriptModule('../../lib/family/unifiedCalendarService.ts');

test('getCalendarEvents returns mock events with correct types and prep instructions', async () => {
  const events = await getCalendarEvents('demo_case');
  assert(Array.isArray(events));
  assert(events.length >= 4);

  const visit = events.find((e) => e.eventType === 'contact_visit');
  assert(visit);
  assert.equal(visit.title, 'Supervised Contact Visit with Leo & Maya');
  assert.equal(visit.locationType, 'contact_centre');
  assert(visit.prepInstructions);
  assert(visit.attendees.length >= 2);

  const court = events.find((e) => e.eventType === 'court_hearing');
  assert(court);
  assert.equal(court.locationType, 'in_person');
  assert.equal(court.reminderMinutesBefore, 1440);
});

test('getCalendarEvents filters by date range', async () => {
  const allEvents = await getCalendarEvents('demo_case');
  assert(allEvents.length >= 4);

  const filtered = await getCalendarEvents(
    'demo_case',
    '2026-11-05T00:00:00Z',
    '2026-11-15T00:00:00Z'
  );
  assert(filtered.length >= 2);
  filtered.forEach((e) => {
    assert(new Date(e.startTime) >= new Date('2026-11-05T00:00:00Z'));
    assert(new Date(e.startTime) <= new Date('2026-11-15T00:00:00Z'));
  });
});

test('createCalendarEvent validates input and stores new schedule entry', async () => {
  const result = await createCalendarEvent({
    caseId: 'demo_case',
    title: 'Pediatric Health Checkup with Dr. Watson',
    eventType: 'practitioner_appointment',
    startTime: '2026-11-18T11:00:00Z',
    location: 'Mater Childrens Clinic',
    locationType: 'in_person',
    attendees: [
      { name: 'Parent User', role: 'parent' },
      { name: 'Leo', role: 'child' },
    ],
    prepInstructions: 'Bring health blue book and growth charts.',
    reminderMinutesBefore: 120,
  });

  assert.equal(result.success, true);
  const created = result.event;
  assert(created.id.startsWith('evt_'));
  assert.equal(created.title, 'Pediatric Health Checkup with Dr. Watson');
  assert.equal(created.isCompleted, false);

  const allAfter = await getCalendarEvents('demo_case');
  assert(allAfter.some((e) => e.id === created.id));
});

test('createCalendarEvent rejects empty title or missing start time', async () => {
  const emptyTitle = await createCalendarEvent({
    caseId: 'demo_case',
    title: '   ',
    eventType: 'task_deadline',
    startTime: '2026-11-20T10:00:00Z',
    locationType: 'in_person',
  });
  assert.equal(emptyTitle.success, false);
  assert.match(emptyTitle.error, /title cannot be empty/i);

  const missingTime = await createCalendarEvent({
    caseId: 'demo_case',
    title: 'Valid Title',
    eventType: 'contact_visit',
    startTime: '',
    locationType: 'in_person',
  });
  assert.equal(missingTime.success, false);
  assert.match(missingTime.error, /start time is required/i);
});

test('markEventCompleted transitions event completion state', async () => {
  const createRes = await createCalendarEvent({
    caseId: 'demo_case',
    title: 'Drug & Alcohol Screening Attendance',
    eventType: 'task_deadline',
    startTime: '2026-11-02T08:00:00Z',
    locationType: 'in_person',
  });
  assert.equal(createRes.success, true);

  const markRes = await markEventCompleted(createRes.event.id);
  assert.equal(markRes.success, true);
  assert.equal(markRes.event.isCompleted, true);

  const notFound = await markEventCompleted('non_existent_event_id');
  assert.equal(notFound.success, false);
  assert.match(notFound.error, /not found/i);
});

test('createCalendarEvent and excuseEventForSystemicBarrier support fatherhood accommodations, transit vouchers, and excused systemic barriers', async () => {
  const createRes = await createCalendarEvent({
    caseId: 'demo_case',
    title: 'Father-Child Evening Community Visit',
    eventType: 'contact_visit',
    startTime: '2026-11-22T18:00:00Z',
    locationType: 'community',
    fatherInclusiveSchedule: true,
    transitSupportProvided: true,
    prePostVisitBufferMinutes: 15,
  });

  assert.equal(createRes.success, true);
  assert.equal(createRes.event.fatherInclusiveSchedule, true);
  assert.equal(createRes.event.transitSupportProvided, true);
  assert.equal(createRes.event.prePostVisitBufferMinutes, 15);

  const excuseRes = await excuseEventForSystemicBarrier(
    createRes.event.id,
    'Regional rail strike — transit voucher rescheduled to Saturday morning'
  );
  assert.equal(excuseRes.success, true);
  assert.equal(excuseRes.event.excusedBySystemicBarrier, true);
  assert.match(excuseRes.event.systemicBarrierReason, /Regional rail strike/);
});
