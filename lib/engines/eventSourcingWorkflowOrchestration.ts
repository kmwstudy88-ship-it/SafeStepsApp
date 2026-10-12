export type EventCategory = "domain" | "command" | "integration" | "workflow" | "audit" | "failure";
export type OutboxStatus = "pending" | "processing" | "processed" | "retry_scheduled" | "failed" | "dead_lettered" | "cancelled";
export type WorkflowStatus = "pending" | "running" | "waiting" | "suspended" | "completed" | "completed_with_warnings" | "failed" | "cancelled" | "compensating" | "compensated";
export type WorkflowStepType = "automated_action" | "human_task" | "decision" | "parallel_group" | "timer" | "wait_for_event" | "notification" | "approval" | "validation" | "data_transformation" | "external_service" | "child_workflow" | "compensation";
export type ReplayMode = "projection_only" | "safe_handlers_only" | "full_reprocess_with_approval";

export type OrchestrationEventEnvelope = {
  event_id: string;
  event_type: string;
  event_version: number;
  occurred_at: string;
  recorded_at: string;
  actor: { actor_type: "user" | "system" | "service"; actor_id?: string; role?: string };
  subject?: { person_id?: string; case_id?: string };
  entity: { entity_type: string; entity_id: string; entity_version?: number };
  correlation_id: string;
  causation_id?: string;
  source: { service: string; component: string; environment: string };
  payload: Record<string, unknown>;
  metadata: Record<string, unknown>;
};

export type OutboxEvent = Pick<OrchestrationEventEnvelope, "event_id" | "event_type" | "event_version" | "payload" | "metadata" | "correlation_id" | "causation_id"> & {
  aggregate_type: string;
  aggregate_id: string;
  aggregate_version?: number;
  status: OutboxStatus;
  priority: number;
  attempt_count: number;
  maximum_attempts: number;
  available_at: string;
  locked_by?: string;
};

export const eventCategories: { category: EventCategory; purpose: string }[] = [
  { category: "domain", purpose: "A meaningful business change occurred." },
  { category: "command", purpose: "A service is being asked to perform an action." },
  { category: "integration", purpose: "Another system needs to know about a change." },
  { category: "workflow", purpose: "A workflow stage changed." },
  { category: "audit", purpose: "A user or system action must be recorded." },
  { category: "failure", purpose: "A process failed or requires intervention." },
];

export const orchestrationDomainEvents = [
  "assessment.submitted",
  "assessment.review_completed",
  "assessment.finalised",
  "evidence.file_uploaded",
  "evidence.security_scan_completed",
  "evidence.hash_verified",
  "evidence.accepted",
  "competency.recalculation_requested",
  "competency.level_changed",
  "competency.contradiction_detected",
  "appeal.submitted",
  "appeal.upheld",
  "report.requested",
  "report.released",
] as const;

export const assessmentSubmissionWorkflow = [
  "validate_submission",
  "lock_responses",
  "auto_score",
  "review_decision",
  "create_review_or_finalise",
  "create_evidence",
  "recalculate_competencies",
  "update_progress",
  "generate_feedback",
  "send_notification",
  "complete",
] as const;

export const recommendedOrchestrationMigrations = [
  "202607210016_event_outbox.sql",
  "202607210017_domain_event_store.sql",
  "202607210018_event_handler_executions.sql",
  "202607210019_dead_letter_queue.sql",
  "202607210020_workflow_definitions.sql",
  "202607210021_workflow_instances.sql",
  "202607210022_workflow_steps.sql",
  "202607210023_workflow_human_tasks.sql",
  "202607210024_workflow_timers.sql",
  "202607210025_event_subscriptions.sql",
  "202607210026_state_transition_rules.sql",
  "202607210027_notification_outbox.sql",
  "202607210028_recalculation_queue.sql",
  "202607210029_projection_checkpoints.sql",
  "202607210030_workflow_rls.sql",
] as const;

export const coreOrchestrationRules = [
  "Every critical state change must create an event transactionally.",
  "Every event handler must be idempotent.",
  "Every workflow must be versioned.",
  "Failures must be retried only where safe.",
  "Permanent failures move to a dead-letter queue.",
  "Human tasks require ownership, deadlines and escalation.",
  "Workflow history must never be overwritten.",
  "Notifications are side effects, not proof that work completed.",
  "Derived projections may be rebuilt.",
  "Official records must not depend only on projections.",
  "Events must include correlation and causation identifiers.",
  "Replays must suppress unsafe duplicate side effects.",
  "High-impact workflows require human decision points.",
] as const;

export function createOrchestrationEvent(input: Omit<OrchestrationEventEnvelope, "event_version" | "recorded_at" | "metadata"> & Partial<Pick<OrchestrationEventEnvelope, "event_version" | "recorded_at" | "metadata">>): OrchestrationEventEnvelope {
  return {
    ...input,
    event_version: input.event_version ?? 1,
    recorded_at: input.recorded_at ?? input.occurred_at,
    metadata: input.metadata ?? { schema_version: "1.0" },
  };
}

export function claimNextOutboxEvents({ events, workerId, limit = 20, now }: { events: OutboxEvent[]; workerId: string; limit?: number; now: string }) {
  const nowTime = new Date(now).getTime();
  return [...events]
    .filter((event) => ["pending", "retry_scheduled"].includes(event.status) && new Date(event.available_at).getTime() <= nowTime)
    .sort((left, right) => left.priority - right.priority || left.available_at.localeCompare(right.available_at))
    .slice(0, limit)
    .map((event) => ({ ...event, status: "processing" as const, locked_by: workerId, attempt_count: event.attempt_count + 1 }));
}

export function calculateRetryDelaySeconds(attemptCount: number) {
  if (attemptCount <= 1) return 0;
  return Math.min(86400, 2 ** (attemptCount - 1) * 30);
}

export function classifyFailure(errorCode: string) {
  const nonRetryable = ["INVALID_SCHEMA", "MISSING_REQUIRED_ENTITY", "PERMISSION_VIOLATION", "UNSUPPORTED_FILE_TYPE", "INVALID_STATE_TRANSITION", "CORRUPTED_PAYLOAD", "CONSENT_DENIED"];
  return nonRetryable.includes(errorCode) ? "non_retryable" : "retryable";
}

export function canReplay(mode: ReplayMode, sideEffect: "projection_update" | "notification" | "evidence_generation" | "report_release") {
  if (mode === "projection_only") return sideEffect === "projection_update";
  if (mode === "safe_handlers_only") return sideEffect === "projection_update";
  return sideEffect !== "report_release";
}
