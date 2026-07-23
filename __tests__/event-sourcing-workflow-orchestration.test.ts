import { assessmentRoutes } from "../lib/data/assessmentSystem";
import {
  assessmentSubmissionWorkflow,
  canReplay,
  calculateRetryDelaySeconds,
  claimNextOutboxEvents,
  classifyFailure,
  coreOrchestrationRules,
  createOrchestrationEvent,
  eventCategories,
  recommendedOrchestrationMigrations,
  type OutboxEvent,
} from "../lib/engines/eventSourcingWorkflowOrchestration";

const pendingEvent: OutboxEvent = {
  event_id: "event-1",
  event_type: "assessment.submitted",
  event_version: 1,
  aggregate_type: "assessment_session",
  aggregate_id: "session-1",
  status: "pending",
  priority: 10,
  attempt_count: 0,
  maximum_attempts: 10,
  available_at: "2026-07-21T00:00:00Z",
  payload: {},
  metadata: {},
  correlation_id: "workflow-1",
};

describe("eventSourcingWorkflowOrchestration", () => {
  it("defines event categories and assessment submission workflow", () => {
    expect(eventCategories.map((item) => item.category)).toEqual(["domain", "command", "integration", "workflow", "audit", "failure"]);
    expect(assessmentSubmissionWorkflow).toContain("lock_responses");
    expect(assessmentSubmissionWorkflow).toContain("recalculate_competencies");
  });

  it("creates standard event envelopes with correlation and causation", () => {
    const event = createOrchestrationEvent({
      event_id: "event-1",
      event_type: "assessment.submitted",
      occurred_at: "2026-07-21T23:15:00+10:00",
      actor: { actor_type: "user", actor_id: "user-1", role: "parent" },
      entity: { entity_type: "assessment_session", entity_id: "session-1", entity_version: 4 },
      correlation_id: "workflow-1",
      causation_id: "previous-event",
      source: { service: "assessment-service", component: "submit-assessment", environment: "production" },
      payload: { attempt_number: 1 },
    });

    expect(event.event_version).toBe(1);
    expect(event.recorded_at).toBe(event.occurred_at);
    expect(event.metadata).toEqual({ schema_version: "1.0" });
  });

  it("claims pending outbox events safely for a worker", () => {
    const claimed = claimNextOutboxEvents({
      events: [pendingEvent, { ...pendingEvent, event_id: "future", available_at: "2026-07-22T00:00:00Z" }],
      workerId: "workflow-worker-01",
      now: "2026-07-21T12:00:00Z",
    });

    expect(claimed).toHaveLength(1);
    expect(claimed[0]).toMatchObject({ status: "processing", locked_by: "workflow-worker-01", attempt_count: 1 });
  });

  it("classifies retry and replay safety", () => {
    expect(calculateRetryDelaySeconds(1)).toBe(0);
    expect(calculateRetryDelaySeconds(3)).toBe(120);
    expect(classifyFailure("TEMPORARY_SERVICE_FAILURE")).toBe("retryable");
    expect(classifyFailure("CONSENT_DENIED")).toBe("non_retryable");
    expect(canReplay("projection_only", "notification")).toBe(false);
    expect(canReplay("full_reprocess_with_approval", "report_release")).toBe(false);
  });

  it("documents migration sequence, core rules, and route exposure", () => {
    expect(recommendedOrchestrationMigrations).toHaveLength(15);
    expect(coreOrchestrationRules).toContain("Every event handler must be idempotent.");
    expect(
      assessmentRoutes.some((route) => route.href === "/assessment-system/event-orchestration"),
    ).toBe(true);
  });
});
