'use strict';

const { scoreCaseRisk, extractSignalsFromPayload } = require('./engine');
const { rulesFromEnv } = require('./rules');

let cachedAdmin = null;
function defaultAdminClient() {
  if (!cachedAdmin) {
    cachedAdmin = require('../document-intelligence/supabase').admin;
  }
  return cachedAdmin;
}

function createHttpError(statusCode, message) {
  return Object.assign(new Error(message), { statusCode });
}

function sortByCreatedDesc(rows) {
  return [...(rows || [])].sort((a, b) => Date.parse(b.created_at || 0) - Date.parse(a.created_at || 0));
}

async function loadActorContext(adminClient, authUserId) {
  const { data: userRow, error: userError } = await adminClient
    .from('users')
    .select('id,display_name,role_id,is_active')
    .eq('auth_user_id', authUserId)
    .maybeSingle();
  if (userError) throw userError;
  if (!userRow || !userRow.is_active) throw createHttpError(403, 'No active case-management identity is mapped to this login.');

  const { data: roleRow, error: roleError } = await adminClient
    .from('roles')
    .select('role_key,role_name')
    .eq('id', userRow.role_id)
    .maybeSingle();
  if (roleError) throw roleError;

  return {
    authUserId,
    appUserId: userRow.id,
    displayName: userRow.display_name || 'Case team member',
    roleKey: roleRow?.role_key || null,
    roleName: roleRow?.role_name || null,
  };
}

async function isSupervisorForCase(adminClient, actor, caseId) {
  const { data: memberships, error: membershipError } = await adminClient
    .from('team_memberships')
    .select('team_id')
    .eq('user_id', actor.appUserId)
    .eq('membership_role', 'supervisor')
    .eq('is_active', true);
  if (membershipError) throw membershipError;
  const teamIds = (memberships || []).map((row) => row.team_id).filter(Boolean);
  if (!teamIds.length) return false;

  const { data: workerMemberships, error: workerError } = await adminClient
    .from('team_memberships')
    .select('user_id')
    .in('team_id', teamIds)
    .eq('membership_role', 'worker')
    .eq('is_active', true);
  if (workerError) throw workerError;
  const workerIds = [...new Set((workerMemberships || []).map((row) => row.user_id).filter(Boolean))];
  if (!workerIds.length) return false;

  const { data: assignment, error: assignmentError } = await adminClient
    .from('case_assignments')
    .select('id')
    .eq('case_id', caseId)
    .in('user_id', workerIds)
    .eq('assignment_role', 'case_worker')
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();
  if (assignmentError) throw assignmentError;
  return Boolean(assignment);
}

async function assertCaseAccess(adminClient, actor, caseId, mode = 'read') {
  const { data: caseRow, error: caseError } = await adminClient
    .from('cases')
    .select('id,title,status,parent_user_id,updated_at')
    .eq('id', caseId)
    .maybeSingle();
  if (caseError) throw caseError;
  if (!caseRow) throw createHttpError(404, 'Case not found.');

  if (actor.roleKey === 'admin') return caseRow;

  const { data: directAssignment, error: directError } = await adminClient
    .from('case_assignments')
    .select('assignment_role')
    .eq('case_id', caseId)
    .eq('user_id', actor.appUserId)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();
  if (directError) throw directError;

  const canRead = Boolean(directAssignment) || caseRow.parent_user_id === actor.appUserId || (actor.roleKey === 'supervisor' && await isSupervisorForCase(adminClient, actor, caseId));
  if (!canRead) throw createHttpError(403, 'You are not permitted to access this case.');

  if (mode === 'write') {
    const hasOperationalRole = ['case_worker', 'supervisor', 'admin'].includes(actor.roleKey || '');
    const supervisorCaseAccess = actor.roleKey === 'supervisor' && (Boolean(directAssignment) || await isSupervisorForCase(adminClient, actor, caseId));
    const canWrite = hasOperationalRole && (Boolean(directAssignment) || supervisorCaseAccess || actor.roleKey === 'admin');
    if (!canWrite) throw createHttpError(403, 'Only assigned workers or supervisors can update case risk workflows.');
  }

  return caseRow;
}

async function loadCaseAssignments(adminClient, caseId) {
  const { data, error } = await adminClient
    .from('case_assignments')
    .select('user_id,assignment_role')
    .eq('case_id', caseId)
    .eq('is_active', true);
  if (error) throw error;
  return data || [];
}

async function loadLatestSnapshot(adminClient, caseId) {
  const { data, error } = await adminClient
    .from('risk_snapshots')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

async function loadRecentCaseEvents(adminClient, caseId, limit = 50) {
  const { data, error } = await adminClient
    .from('case_events')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return sortByCreatedDesc(data || []);
}

async function loadCaseEventByIdempotencyKey(adminClient, caseId, idempotencyKey) {
  if (!idempotencyKey) return null;
  const { data, error } = await adminClient
    .from('case_events')
    .select('id')
    .eq('case_id', caseId)
    .eq('idempotency_key', idempotencyKey)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

function selectScoringEvents({ existingEvents, pendingEvent, hasPersistedIdempotentEvent }) {
  if (hasPersistedIdempotentEvent) return sortByCreatedDesc(existingEvents || []);
  return sortByCreatedDesc([pendingEvent, ...(existingEvents || [])]);
}

function aggregateFactorsFromEvents(events) {
  const behavioral = [];
  const contextual = [];
  const protective = [];
  const hardFlags = [];

  for (const event of events || []) {
    const extracted = extractSignalsFromPayload(event.payload || {});
    behavioral.push(...extracted.behavioral);
    contextual.push(...extracted.contextual);
    protective.push(...extracted.protective);
    hardFlags.push(...extracted.hardFlags);
  }

  return { behavioral, contextual, protective, hardFlags };
}

function normalizeIncomingEventPayload(body = {}) {
  return {
    ...(body.payload || {}),
    behavioral_cues: body.behavioral_cues || body.behavioralCues || body.payload?.behavioral_cues || [],
    contextual_factors: body.contextual_factors || body.contextualFactors || body.payload?.contextual_factors || [],
    protective_factors: body.protective_factors || body.protectiveFactors || body.payload?.protective_factors || [],
    hard_flags: body.hard_flags || body.hardFlags || body.payload?.hard_flags || [],
    doc_signals: body.doc_signals || body.document_signals || body.payload?.doc_signals || body.payload?.document_signals || [],
  };
}

function decisionSupportDetail(snapshot, detail = {}) {
  return {
    ...detail,
    score: detail.score ?? snapshot.score,
    tier: detail.tier ?? snapshot.tier,
    model_version: snapshot.model_version,
    rationale: snapshot.rationale,
    human_review_required: true,
    decision_support_only: true,
  };
}

function buildEscalationAlerts({ snapshot, previousSnapshot, routedTo, eventIdempotencyKey, eventType, rules = rulesFromEnv() }) {
  const alerts = [];
  if (snapshot.hard_escalation?.triggered) {
    for (const trigger of snapshot.hard_escalation.triggers || []) {
      alerts.push({
        dedupe_key: `hard:${trigger.key}:${eventIdempotencyKey || snapshot.tier}`,
        trigger_type: trigger.key,
        severity: 'critical',
        status: 'open',
        routed_to: routedTo,
        detail: decisionSupportDetail(snapshot, {
          reason: trigger.reason,
          source: eventType || 'risk_recompute',
        }),
      });
    }
  }

  if (snapshot.score >= rules.thresholds.criticalAlertScore) {
    alerts.push({
      dedupe_key: 'threshold:critical',
      trigger_type: 'risk_threshold_critical',
      severity: 'critical',
      status: 'open',
      routed_to: routedTo,
      detail: decisionSupportDetail(snapshot),
    });
  } else if (snapshot.score >= rules.thresholds.highAlertScore) {
    alerts.push({
      dedupe_key: 'threshold:high',
      trigger_type: 'risk_threshold_high',
      severity: 'high',
      status: 'open',
      routed_to: routedTo,
      detail: decisionSupportDetail(snapshot),
    });
  }

  const previousScore = Number(previousSnapshot?.score ?? previousSnapshot?.risk_score ?? 0);
  const delta = snapshot.score - previousScore;
  const configuredDeltaThreshold = Number(rules.deltaEscalationThreshold);
  const deltaThreshold = Number.isFinite(configuredDeltaThreshold) && configuredDeltaThreshold >= 0
    ? configuredDeltaThreshold
    : 15;
  if (previousSnapshot && delta >= deltaThreshold) {
    alerts.push({
      dedupe_key: eventIdempotencyKey ? `delta:${eventIdempotencyKey}` : `delta:${previousScore}->${snapshot.score}`,
      trigger_type: 'risk_score_delta',
      severity: snapshot.score >= 75 ? 'critical' : 'high',
      status: 'open',
      routed_to: routedTo,
      detail: decisionSupportDetail(snapshot, { previous_score: previousScore, current_score: snapshot.score, delta }),
    });
  }
  return alerts;
}

function addHours(hours) {
  return new Date(Date.now() + (hours * 60 * 60 * 1000)).toISOString();
}

function assignmentForRole(assignments, role) {
  return assignments.find((item) => item.assignment_role === role)?.user_id || null;
}

function buildFollowUpTasks({ caseId, snapshot, previousSnapshot, assignments, rules = rulesFromEnv() }) {
  const templates = rules.followUpTemplates[snapshot.tier] || [];
  const workerAssignee = assignmentForRole(assignments, 'case_worker') || assignmentForRole(assignments, 'supervisor');
  const supervisorAssignee = assignmentForRole(assignments, 'supervisor') || workerAssignee;
  const previousScore = Number(previousSnapshot?.score ?? 0);
  const riskIncreased = snapshot.score > previousScore;

  return templates.map((template) => ({
    case_id: caseId,
    task_type: template.task_type,
    title: template.title,
    due_at: addHours(template.due_in_hours),
    priority: template.priority,
    assignee: template.task_type.includes('supervisor') ? supervisorAssignee : workerAssignee,
    status: 'pending',
    source: template.source,
    allow_duplicates: false,
    detail: decisionSupportDetail(snapshot, {
      generated_by: snapshot.model_version,
      target_tier: snapshot.tier,
      risk_score: snapshot.score,
      reprioritized: Boolean(previousSnapshot) && riskIncreased,
    }),
  }));
}

function buildDashboardPayload({ cases, snapshots, alerts, tasks, timelineByCase }) {
  const caseTitleById = new Map((cases || []).map((caseRow) => [caseRow.id, caseRow.title]));
  const snapshotByCase = new Map();
  for (const snapshot of sortByCreatedDesc(snapshots || [])) {
    if (!snapshotByCase.has(snapshot.case_id)) snapshotByCase.set(snapshot.case_id, snapshot);
  }

  const previousByCase = new Map();
  const orderedByCase = new Map();
  for (const snapshot of sortByCreatedDesc(snapshots || [])) {
    const bucket = orderedByCase.get(snapshot.case_id) || [];
    bucket.push(snapshot);
    orderedByCase.set(snapshot.case_id, bucket);
  }
  for (const [caseId, bucket] of orderedByCase.entries()) {
    previousByCase.set(caseId, bucket[1] || null);
  }

  const alertCounts = new Map();
  const openEscalations = [];
  for (const alert of alerts || []) {
    if (['open', 'acknowledged'].includes(alert.status)) {
      alertCounts.set(alert.case_id, (alertCounts.get(alert.case_id) || 0) + 1);
      openEscalations.push({ ...alert, case_title: caseTitleById.get(alert.case_id) || alert.case_id });
    }
  }

  const overdueFollowUps = [];
  const overdueCounts = new Map();
  for (const task of tasks || []) {
    if (task.status === 'overdue' || (['pending', 'in_progress'].includes(task.status) && Date.parse(task.due_at || 0) < Date.now())) {
      overdueCounts.set(task.case_id, (overdueCounts.get(task.case_id) || 0) + 1);
      overdueFollowUps.push({ ...task, case_title: caseTitleById.get(task.case_id) || task.case_id });
    }
  }

  const caseSummaries = (cases || []).map((caseRow) => {
    const latest = snapshotByCase.get(caseRow.id) || null;
    const previous = previousByCase.get(caseRow.id) || null;
    return {
      case_id: caseRow.id,
      title: caseRow.title,
      status: caseRow.status,
      updated_at: caseRow.updated_at,
      latest_risk: latest ? {
        score: latest.score,
        tier: latest.tier,
        confidence: latest.confidence,
        rationale: latest.rationale,
        created_at: latest.created_at,
      } : null,
      delta: latest && previous ? latest.score - previous.score : 0,
      open_alert_count: alertCounts.get(caseRow.id) || 0,
      overdue_task_count: overdueCounts.get(caseRow.id) || 0,
      recent_events: timelineByCase.get(caseRow.id) || [],
    };
  });

  const highestRiskCases = [...caseSummaries]
    .filter((item) => item.latest_risk && item.status !== 'closed')
    .sort((a, b) =>
      (b.latest_risk.score - a.latest_risk.score)
      || (b.open_alert_count - a.open_alert_count)
      || (Date.parse(b.updated_at || 0) - Date.parse(a.updated_at || 0))
      || String(a.case_id).localeCompare(String(b.case_id)))
    .slice(0, 10);

  const risingRiskCases = [...caseSummaries]
    .filter((item) => item.delta > 0 && item.status !== 'closed')
    .sort((a, b) =>
      (b.delta - a.delta)
      || (Date.parse(b.updated_at || 0) - Date.parse(a.updated_at || 0))
      || String(a.case_id).localeCompare(String(b.case_id)))
    .slice(0, 10);

  return {
    generated_at: new Date().toISOString(),
    human_review_required: true,
    decision_support_only: true,
    highest_risk_open_cases: highestRiskCases,
    rising_risk_cases: risingRiskCases,
    open_escalations: sortByCreatedDesc(openEscalations).slice(0, 20),
    overdue_follow_ups: [...overdueFollowUps].sort((a, b) => Date.parse(a.due_at || 0) - Date.parse(b.due_at || 0)).slice(0, 20),
    case_summaries: caseSummaries,
  };
}

async function listSupervisorCaseIds(adminClient, actor) {
  if (actor.roleKey === 'admin') {
    const { data, error } = await adminClient.from('cases').select('id').order('updated_at', { ascending: false }).limit(100);
    if (error) throw error;
    return (data || []).map((row) => row.id);
  }

  const directAssignments = await adminClient
    .from('case_assignments')
    .select('case_id')
    .eq('user_id', actor.appUserId)
    .eq('is_active', true);
  if (directAssignments.error) throw directAssignments.error;

  const directCaseIds = (directAssignments.data || []).map((row) => row.case_id).filter(Boolean);
  const memberships = await adminClient
    .from('team_memberships')
    .select('team_id')
    .eq('user_id', actor.appUserId)
    .eq('membership_role', 'supervisor')
    .eq('is_active', true);
  if (memberships.error) throw memberships.error;
  const teamIds = (memberships.data || []).map((row) => row.team_id).filter(Boolean);
  if (!teamIds.length) return [...new Set(directCaseIds)];

  const workers = await adminClient
    .from('team_memberships')
    .select('user_id')
    .in('team_id', teamIds)
    .eq('membership_role', 'worker')
    .eq('is_active', true);
  if (workers.error) throw workers.error;
  const workerIds = [...new Set((workers.data || []).map((row) => row.user_id).filter(Boolean))];
  if (!workerIds.length) return [...new Set(directCaseIds)];

  const workerAssignments = await adminClient
    .from('case_assignments')
    .select('case_id')
    .in('user_id', workerIds)
    .eq('assignment_role', 'case_worker')
    .eq('is_active', true);
  if (workerAssignments.error) throw workerAssignments.error;

  return [...new Set([
    ...directCaseIds,
    ...(workerAssignments.data || []).map((row) => row.case_id).filter(Boolean),
  ])];
}

function createCaseRiskService(adminClient = defaultAdminClient()) {
  return {
    async createCaseEventAndRecompute({ authUserId, caseId, body }) {
      const actor = await loadActorContext(adminClient, authUserId);
      await assertCaseAccess(adminClient, actor, caseId, 'write');

      const eventType = String(body.eventType || body.event_type || '').trim();
      if (!eventType) throw createHttpError(400, 'eventType is required.');
      const eventPayload = normalizeIncomingEventPayload(body);

      const existingEvents = await loadRecentCaseEvents(adminClient, caseId, 50);
      const previousSnapshot = await loadLatestSnapshot(adminClient, caseId);
      const rules = rulesFromEnv();
      const eventIdempotencyKey = body.idempotencyKey || body.idempotency_key || null;
      const persistedIdempotentEvent = eventIdempotencyKey
        ? await loadCaseEventByIdempotencyKey(adminClient, caseId, eventIdempotencyKey)
        : null;
      const newEvent = {
        created_at: new Date().toISOString(),
        event_type: eventType,
        payload: eventPayload,
        idempotency_key: eventIdempotencyKey,
      };
      const allEvents = selectScoringEvents({
        existingEvents,
        pendingEvent: newEvent,
        hasPersistedIdempotentEvent: Boolean(persistedIdempotentEvent),
      });
      const factors = aggregateFactorsFromEvents(allEvents);
      const snapshot = scoreCaseRisk({
        behavioralCues: factors.behavioral,
        contextualFactors: factors.contextual,
        protectiveFactors: factors.protective,
        recentEvents: allEvents,
        hardFlags: factors.hardFlags,
      }, { rules });
      const assignments = await loadCaseAssignments(adminClient, caseId);
      const routedTo = {
        case_worker_ids: assignments.filter((item) => item.assignment_role === 'case_worker').map((item) => item.user_id),
        supervisor_ids: assignments.filter((item) => item.assignment_role === 'supervisor').map((item) => item.user_id),
      };
      const alerts = buildEscalationAlerts({
        snapshot,
        previousSnapshot,
        routedTo,
        eventIdempotencyKey: body.idempotencyKey || body.idempotency_key || null,
        eventType,
        rules,
      });
      const tasks = buildFollowUpTasks({ caseId, snapshot, previousSnapshot, assignments, rules });

      const { data, error } = await adminClient.rpc('apply_case_risk_workflow', {
        p_case_id: caseId,
        p_actor_user_id: actor.appUserId,
        p_event_type: eventType,
        p_event_source: body.eventSource || body.event_source || 'manual_note',
        p_event_note: body.note || null,
        p_event_payload: eventPayload,
        p_event_idempotency_key: body.idempotencyKey || body.idempotency_key || null,
        p_snapshot: snapshot,
        p_alerts: alerts,
        p_tasks: tasks,
        p_audit: [{
          action: 'case_event_recorded',
          resource_type: 'case_event',
          details: {
            event_type: eventType,
            human_review_required: true,
            note_present: Boolean(body.note),
          },
        }],
      });
      if (error) throw error;

      return {
        workflow: data,
        snapshot,
        alerts,
        tasks,
        human_review_required: true,
        decision_support_only: true,
      };
    },

    async recomputeRisk({ authUserId, caseId }) {
      const actor = await loadActorContext(adminClient, authUserId);
      await assertCaseAccess(adminClient, actor, caseId, 'write');

      const existingEvents = await loadRecentCaseEvents(adminClient, caseId, 50);
      const previousSnapshot = await loadLatestSnapshot(adminClient, caseId);
      const rules = rulesFromEnv();
      const factors = aggregateFactorsFromEvents(existingEvents);
      const snapshot = scoreCaseRisk({
        behavioralCues: factors.behavioral,
        contextualFactors: factors.contextual,
        protectiveFactors: factors.protective,
        recentEvents: existingEvents,
        hardFlags: factors.hardFlags,
      }, { rules });
      const assignments = await loadCaseAssignments(adminClient, caseId);
      const routedTo = {
        case_worker_ids: assignments.filter((item) => item.assignment_role === 'case_worker').map((item) => item.user_id),
        supervisor_ids: assignments.filter((item) => item.assignment_role === 'supervisor').map((item) => item.user_id),
      };
      const alerts = buildEscalationAlerts({ snapshot, previousSnapshot, routedTo, eventIdempotencyKey: null, eventType: 'risk_recompute', rules });
      const tasks = buildFollowUpTasks({ caseId, snapshot, previousSnapshot, assignments, rules });

      const { data, error } = await adminClient.rpc('apply_case_risk_workflow', {
        p_case_id: caseId,
        p_actor_user_id: actor.appUserId,
        p_event_type: null,
        p_event_source: 'risk_recompute',
        p_event_note: null,
        p_event_payload: {},
        p_event_idempotency_key: null,
        p_snapshot: snapshot,
        p_alerts: alerts,
        p_tasks: tasks,
        p_audit: [{
          action: 'risk_recomputed',
          resource_type: 'risk_snapshot',
          details: {
            human_review_required: true,
            score: snapshot.score,
            tier: snapshot.tier,
          },
        }],
      });
      if (error) throw error;
      return { workflow: data, snapshot, alerts, tasks, human_review_required: true, decision_support_only: true };
    },

    async getCaseRiskHistory({ authUserId, caseId }) {
      const actor = await loadActorContext(adminClient, authUserId);
      await assertCaseAccess(adminClient, actor, caseId, 'read');

      const [snapshotsResult, eventsResult, alertsResult, tasksResult] = await Promise.all([
        adminClient.from('risk_snapshots').select('*').eq('case_id', caseId).order('created_at', { ascending: false }).limit(25),
        adminClient.from('case_events').select('*').eq('case_id', caseId).order('created_at', { ascending: false }).limit(25),
        adminClient.from('escalation_alerts').select('*').eq('case_id', caseId).in('status', ['open', 'acknowledged']).order('created_at', { ascending: false }).limit(25),
        adminClient.from('follow_up_tasks').select('*').eq('case_id', caseId).in('status', ['pending', 'in_progress', 'overdue']).order('due_at', { ascending: true }).limit(25),
      ]);
      if (snapshotsResult.error) throw snapshotsResult.error;
      if (eventsResult.error) throw eventsResult.error;
      if (alertsResult.error) throw alertsResult.error;
      if (tasksResult.error) throw tasksResult.error;

      return {
        risk_history: snapshotsResult.data || [],
        recent_events: eventsResult.data || [],
        open_escalations: alertsResult.data || [],
        follow_up_tasks: tasksResult.data || [],
        human_review_required: true,
        decision_support_only: true,
      };
    },

    async getSupervisorDashboard({ authUserId }) {
      const actor = await loadActorContext(adminClient, authUserId);
      if (!['supervisor', 'admin'].includes(actor.roleKey || '')) throw createHttpError(403, 'Supervisor dashboard requires supervisor or admin access.');

      const caseIds = await listSupervisorCaseIds(adminClient, actor);
      if (!caseIds.length) {
        return {
          generated_at: new Date().toISOString(),
          highest_risk_open_cases: [],
          rising_risk_cases: [],
          open_escalations: [],
          overdue_follow_ups: [],
          case_summaries: [],
        };
      }

      const [casesResult, snapshotsResult, alertsResult, tasksResult, eventsResult] = await Promise.all([
        adminClient.from('cases').select('id,title,status,updated_at').in('id', caseIds),
        adminClient.from('risk_snapshots').select('*').in('case_id', caseIds).order('created_at', { ascending: false }),
        adminClient.from('escalation_alerts').select('*').in('case_id', caseIds).order('created_at', { ascending: false }),
        adminClient.from('follow_up_tasks').select('*').in('case_id', caseIds).order('due_at', { ascending: true }),
        adminClient.from('case_events').select('id,case_id,event_type,note,created_at').in('case_id', caseIds).order('created_at', { ascending: false }),
      ]);
      if (casesResult.error) throw casesResult.error;
      if (snapshotsResult.error) throw snapshotsResult.error;
      if (alertsResult.error) throw alertsResult.error;
      if (tasksResult.error) throw tasksResult.error;
      if (eventsResult.error) throw eventsResult.error;

      const timelineByCase = new Map();
      for (const event of eventsResult.data || []) {
        const bucket = timelineByCase.get(event.case_id) || [];
        if (bucket.length < 3) bucket.push(event);
        timelineByCase.set(event.case_id, bucket);
      }

      return buildDashboardPayload({
        cases: casesResult.data || [],
        snapshots: snapshotsResult.data || [],
        alerts: alertsResult.data || [],
        tasks: tasksResult.data || [],
        timelineByCase,
      });
    },
  };
}

module.exports = {
  assertCaseAccess,
  buildDashboardPayload,
  buildEscalationAlerts,
  buildFollowUpTasks,
  createCaseRiskService,
  loadActorContext,
};
