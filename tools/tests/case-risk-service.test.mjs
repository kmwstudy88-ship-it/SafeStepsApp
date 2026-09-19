import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  buildEscalationAlerts,
  buildFollowUpTasks,
  buildDashboardPayload,
  selectScoringEvents,
} = require('../../backend/case-risk/service.js');

test('buildEscalationAlerts produces stable dedupe keys for duplicate triggering events', () => {
  const snapshot = {
    score: 92,
    tier: 'critical',
    model_version: 'risk-rules-v1',
    hard_escalation: {
      triggered: true,
      triggers: [{ key: 'weapon_access', reason: 'Weapon access or use flagged' }],
    },
  };

  const first = buildEscalationAlerts({
    caseId: 'case-1',
    snapshot,
    previousSnapshot: { score: 70 },
    routedTo: { case_worker_ids: ['worker-1'], supervisor_ids: ['sup-1'] },
    eventIdempotencyKey: 'evt-123',
    eventType: 'field_note',
  });
  const second = buildEscalationAlerts({
    caseId: 'case-1',
    snapshot,
    previousSnapshot: { score: 70 },
    routedTo: { case_worker_ids: ['worker-1'], supervisor_ids: ['sup-1'] },
    eventIdempotencyKey: 'evt-123',
    eventType: 'field_note',
  });

  assert.deepEqual(first.map((item) => item.dedupe_key), second.map((item) => item.dedupe_key));
  assert.deepEqual(first.map((item) => item.trigger_type), ['weapon_access', 'risk_threshold_critical', 'risk_score_delta']);
  assert.equal(first.at(-1)?.dedupe_key, 'delta:evt-123');
});

test('buildEscalationAlerts honors configured delta escalation threshold', () => {
  const snapshot = {
    score: 56,
    tier: 'high',
    model_version: 'risk-rules-v1',
    hard_escalation: { triggered: false, triggers: [] },
  };

  const alerts = buildEscalationAlerts({
    snapshot,
    previousSnapshot: { score: 40 },
    routedTo: { case_worker_ids: ['worker-1'], supervisor_ids: ['sup-1'] },
    eventIdempotencyKey: 'evt-456',
    eventType: 'field_note',
    rules: {
      thresholds: { highAlertScore: 999, criticalAlertScore: 999 },
      deltaEscalationThreshold: 20,
      hardEscalationSignals: {},
    },
  });

  assert.equal(alerts.some((item) => item.trigger_type === 'risk_score_delta'), false);
});

test('selectScoringEvents avoids duplicate synthetic event scoring during idempotent retries', () => {
  const now = new Date().toISOString();
  const existingEvents = [{
    created_at: now,
    event_type: 'field_note',
    idempotency_key: 'evt-123',
    payload: { behavioral_cues: ['missed_contact'] },
  }];
  const pendingEvent = {
    created_at: now,
    event_type: 'field_note',
    idempotency_key: 'evt-123',
    payload: { behavioral_cues: ['missed_contact'] },
  };

  const onRetry = selectScoringEvents({
    existingEvents,
    pendingEvent,
    hasPersistedIdempotentEvent: true,
  });
  const onFirstAttempt = selectScoringEvents({
    existingEvents,
    pendingEvent,
    hasPersistedIdempotentEvent: false,
  });

  assert.equal(onRetry.length, 1);
  assert.equal(onFirstAttempt.length, 2);
});

test('buildFollowUpTasks upgrades follow-up SLA and marks reprioritization after risk increases', () => {
  const tasks = buildFollowUpTasks({
    caseId: 'case-1',
    snapshot: { score: 78, tier: 'critical', model_version: 'risk-rules-v1' },
    previousSnapshot: { score: 42, tier: 'moderate' },
    assignments: [
      { assignment_role: 'case_worker', user_id: 'worker-1' },
      { assignment_role: 'supervisor', user_id: 'sup-1' },
    ],
  });

  assert.equal(tasks.length, 3);
  assert.deepEqual(tasks.map((item) => item.priority), ['urgent', 'urgent', 'urgent']);
  assert.equal(tasks.find((item) => item.task_type === 'immediate_supervisor_review')?.assignee, 'sup-1');
  assert.equal(tasks.every((item) => item.detail.reprioritized), true);
});

test('buildDashboardPayload returns highest-risk, rising-risk, open escalation, and overdue follow-up queues', () => {
  const dashboard = buildDashboardPayload({
    cases: [
      { id: 'case-a', title: 'Case A', status: 'open', updated_at: '2026-09-11T10:00:00.000Z' },
      { id: 'case-b', title: 'Case B', status: 'open', updated_at: '2026-09-11T11:00:00.000Z' },
      { id: 'case-c', title: 'Case C', status: 'closed', updated_at: '2026-09-11T09:00:00.000Z' },
      ...Array.from({ length: 11 }, (_, index) => ({
        id: `case-extra-${index}`,
        title: `Extra ${index}`,
        status: 'open',
        updated_at: `2026-09-11T0${index % 9}:00:00.000Z`,
      })),
    ],
    snapshots: [
      { case_id: 'case-a', score: 84, tier: 'critical', confidence: 0.9, rationale: 'A latest', created_at: '2026-09-11T11:00:00.000Z' },
      { case_id: 'case-a', score: 60, tier: 'high', confidence: 0.8, rationale: 'A previous', created_at: '2026-09-10T11:00:00.000Z' },
      { case_id: 'case-b', score: 65, tier: 'high', confidence: 0.8, rationale: 'B latest', created_at: '2026-09-11T10:30:00.000Z' },
      { case_id: 'case-b', score: 64, tier: 'high', confidence: 0.8, rationale: 'B previous', created_at: '2026-09-10T10:30:00.000Z' },
      { case_id: 'case-c', score: 99, tier: 'critical', confidence: 0.99, rationale: 'C latest', created_at: '2026-09-11T10:45:00.000Z' },
      { case_id: 'case-c', score: 70, tier: 'high', confidence: 0.8, rationale: 'C previous', created_at: '2026-09-10T10:45:00.000Z' },
      ...Array.from({ length: 11 }, (_, index) => ({
        case_id: `case-extra-${index}`,
        score: 50 - index,
        tier: 'high',
        confidence: 0.7,
        rationale: `Extra ${index}`,
        created_at: `2026-09-11T08:${String(index).padStart(2, '0')}:00.000Z`,
      })),
    ],
    alerts: [
      { id: 'alert-1', case_id: 'case-a', status: 'open', severity: 'critical', created_at: '2026-09-11T11:05:00.000Z' },
      { id: 'alert-2', case_id: 'case-b', status: 'acknowledged', severity: 'high', created_at: '2026-09-11T10:35:00.000Z' },
    ],
    tasks: [
      { id: 'task-1', case_id: 'case-a', title: 'A overdue', due_at: '2026-09-10T10:00:00.000Z', priority: 'urgent', status: 'pending' },
      { id: 'task-2', case_id: 'case-b', title: 'B active', due_at: '2099-09-12T10:00:00.000Z', priority: 'medium', status: 'pending' },
      { id: 'task-3', case_id: 'case-b', title: 'B overdue', due_at: '2026-09-09T10:00:00.000Z', priority: 'high', status: 'overdue' },
    ],
    timelineByCase: new Map([
      ['case-a', [{ id: 'event-1', event_type: 'field_note', note: 'Recent note' }]],
    ]),
  });

  assert.equal(dashboard.highest_risk_open_cases[0].case_id, 'case-a');
  assert.equal(dashboard.rising_risk_cases[0].case_id, 'case-a');
  assert.equal(dashboard.open_escalations[0].id, 'alert-1');
  assert.equal(dashboard.open_escalations[1].id, 'alert-2');
  assert.equal(dashboard.overdue_follow_ups[0].id, 'task-3');
  assert.equal(dashboard.overdue_follow_ups[1].id, 'task-1');
  assert.equal(dashboard.case_summaries.find((item) => item.case_id === 'case-a')?.recent_events.length, 1);
  assert.equal(dashboard.highest_risk_open_cases.some((item) => item.case_id === 'case-c'), false);
  assert.equal(dashboard.rising_risk_cases.some((item) => item.case_id === 'case-c'), false);
  assert.equal(dashboard.highest_risk_open_cases.length, 10);
  assert.equal(dashboard.rising_risk_cases[1].case_id, 'case-b');
});
