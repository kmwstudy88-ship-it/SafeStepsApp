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
    rationale: 'Primary risk drivers: weapon_access.',
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
  assert.equal(first.every((item) => item.detail.model_version === 'risk-rules-v1'), true);
  assert.equal(first.every((item) => item.detail.human_review_required === true), true);
  assert.equal(first.every((item) => item.detail.decision_support_only === true), true);
  assert.equal(first[0].detail.rationale, 'Primary risk drivers: weapon_access.');
});

test('buildEscalationAlerts handles hard flags as critical workflow output even below threshold score', () => {
  const alerts = buildEscalationAlerts({
    snapshot: {
      score: 45,
      tier: 'critical',
      rationale: 'Hard escalation triggered by child_immediate_danger.',
      model_version: 'risk-rules-v1',
      hard_escalation: {
        triggered: true,
        triggers: [{ key: 'child_immediate_danger', reason: 'Immediate child safety danger disclosed' }],
      },
    },
    previousSnapshot: { score: 43 },
    routedTo: { case_worker_ids: ['worker-1'], supervisor_ids: ['sup-1'] },
    eventIdempotencyKey: 'evt-hard-1',
    eventType: 'field_note',
  });

  assert.equal(alerts.length, 1);
  assert.equal(alerts[0].severity, 'critical');
  assert.equal(alerts[0].trigger_type, 'child_immediate_danger');
  assert.equal(alerts[0].detail.human_review_required, true);
  assert.equal(alerts[0].detail.decision_support_only, true);
});

test('buildEscalationAlerts applies threshold and delta boundaries', () => {
  const build = (score, previousScore) => buildEscalationAlerts({
    snapshot: {
      score,
      tier: score >= 75 ? 'critical' : score >= 50 ? 'high' : 'moderate',
      rationale: 'Boundary test',
      model_version: 'risk-rules-v1',
      hard_escalation: { triggered: false, triggers: [] },
    },
    previousSnapshot: previousScore == null ? null : { score: previousScore },
    routedTo: { case_worker_ids: ['worker-1'], supervisor_ids: ['sup-1'] },
    eventIdempotencyKey: `evt-${score}-${previousScore ?? 'none'}`,
    eventType: 'field_note',
  });

  assert.equal(build(59, 40).some((item) => item.trigger_type.startsWith('risk_threshold')), false);
  assert.deepEqual(build(60, 40).map((item) => item.trigger_type), ['risk_threshold_high', 'risk_score_delta']);
  assert.equal(build(74, 60).map((item) => item.trigger_type).includes('risk_threshold_high'), true);
  assert.equal(build(75, 60).map((item) => item.trigger_type).includes('risk_threshold_critical'), true);

  assert.equal(build(70, 56).some((item) => item.trigger_type === 'risk_score_delta'), false);
  assert.equal(build(70, 55).some((item) => item.trigger_type === 'risk_score_delta'), true);
test('buildEscalationAlerts respects configurable delta escalation thresholds', () => {
  const belowCustomThreshold = buildEscalationAlerts({
    snapshot: {
      score: 64,
      tier: 'high',
      model_version: 'risk-rules-v1',
      hard_escalation: { triggered: false, triggers: [] },
    },
    previousSnapshot: { score: 54 },
    routedTo: { case_worker_ids: [], supervisor_ids: [] },
    rules: {
      thresholds: { highAlertScore: 60, criticalAlertScore: 75 },
      deltaEscalationThreshold: 12,
    },
  });
  assert.equal(belowCustomThreshold.some((item) => item.trigger_type === 'risk_score_delta'), false);

  const atCustomThreshold = buildEscalationAlerts({
    snapshot: {
      score: 66,
      tier: 'high',
      model_version: 'risk-rules-v1',
      hard_escalation: { triggered: false, triggers: [] },
    },
    previousSnapshot: { score: 54 },
    routedTo: { case_worker_ids: [], supervisor_ids: [] },
    rules: {
      thresholds: { highAlertScore: 60, criticalAlertScore: 75 },
      deltaEscalationThreshold: 12,
    },
  });
  assert.equal(atCustomThreshold.some((item) => item.trigger_type === 'risk_score_delta'), true);
});

test('buildEscalationAlerts falls back to the safe default when delta threshold is invalid', () => {
  const alerts = buildEscalationAlerts({
    snapshot: {
      score: 70,
      tier: 'high',
      model_version: 'risk-rules-v1',
      hard_escalation: { triggered: false, triggers: [] },
    },
    previousSnapshot: { score: 50 },
    routedTo: { case_worker_ids: [], supervisor_ids: [] },
    rules: {
      thresholds: { highAlertScore: 60, criticalAlertScore: 75 },
      deltaEscalationThreshold: 'abc',
    },
  });

  assert.equal(alerts.some((item) => item.trigger_type === 'risk_score_delta'), true);
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
    snapshot: { score: 78, tier: 'critical', rationale: 'Recent pattern pressure.', model_version: 'risk-rules-v1' },
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
  assert.equal(tasks.every((item) => item.detail.model_version === 'risk-rules-v1'), true);
  assert.equal(tasks.every((item) => item.detail.rationale === 'Recent pattern pressure.'), true);
  assert.equal(tasks.every((item) => item.detail.decision_support_only === true), true);
});

test('buildFollowUpTasks routes tasks to worker and supervisor assignments correctly', () => {
  const tasks = buildFollowUpTasks({
    caseId: 'case-1',
    snapshot: { score: 78, tier: 'critical', rationale: 'Recent pattern pressure.', model_version: 'risk-rules-v1' },
    previousSnapshot: { score: 60, tier: 'high' },
    assignments: [
      { assignment_role: 'case_worker', user_id: 'worker-1' },
      { assignment_role: 'supervisor', user_id: 'sup-1' },
    ],
  });
  assert.equal(tasks.find((item) => item.task_type === 'immediate_supervisor_review')?.assignee, 'sup-1');
  assert.equal(tasks.find((item) => item.task_type === 'safety_plan_review')?.assignee, 'worker-1');
  assert.equal(tasks.find((item) => item.task_type === 'risk_reassessment')?.assignee, 'worker-1');
});

test('buildFollowUpTasks handles cases without assigned worker by routing to supervisor', () => {
  const tasks = buildFollowUpTasks({
    caseId: 'case-2',
    snapshot: { score: 52, tier: 'high', rationale: 'High risk', model_version: 'risk-rules-v1' },
    previousSnapshot: { score: 40, tier: 'moderate' },
    assignments: [{ assignment_role: 'supervisor', user_id: 'sup-2' }],
  });

  assert.equal(tasks.every((item) => item.assignee === 'sup-2'), true);
});

test('buildFollowUpTasks handles cases without supervisor by routing supervisor tasks to worker', () => {
  const tasks = buildFollowUpTasks({
    caseId: 'case-3',
    snapshot: { score: 79, tier: 'critical', rationale: 'Critical risk', model_version: 'risk-rules-v1' },
    previousSnapshot: { score: 62, tier: 'high' },
    assignments: [{ assignment_role: 'case_worker', user_id: 'worker-3' }],
  });

  assert.equal(tasks.every((item) => item.assignee === 'worker-3'), true);
});

test('buildFollowUpTasks allows unassigned tasks when no worker or supervisor exists', () => {
  const tasks = buildFollowUpTasks({
    caseId: 'case-4',
    snapshot: { score: 28, tier: 'moderate', rationale: 'Moderate risk', model_version: 'risk-rules-v1' },
    previousSnapshot: { score: 20, tier: 'low' },
    assignments: [],
  });

  assert.equal(tasks.length, 2);
  assert.equal(tasks.every((item) => item.assignee === null), true);
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
  assert.equal(dashboard.human_review_required, true);
  assert.equal(dashboard.decision_support_only, true);
});
