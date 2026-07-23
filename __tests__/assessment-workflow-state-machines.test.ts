import { assessmentRoutes } from "../lib/data/assessmentSystem";
import {
  automaticAssessmentSubmittedWorkflow,
  canTransition,
  createWorkflowEventEnvelope,
  databaseWorkflowConstraints,
  emotionalRegulationProficientRule,
  evaluateEvidenceSufficiency,
  evidenceQualityDimensions,
  recommendedNextMigrationScope,
  roleCan,
  validateReportRelease,
  workflowEventCatalogue,
  workflowStateMachines,
} from "../lib/engines/assessmentWorkflowStateMachines";

describe("assessmentWorkflowStateMachines", () => {
  it("defines the expected workflow state machines", () => {
    expect(workflowStateMachines.map((machine) => machine.id)).toEqual([
      "assessment_template",
      "assessment_assignment",
      "assessment_session",
      "response",
      "scoring",
      "human_review",
      "evidence",
      "observation",
      "competency_calculation",
      "contradiction",
      "disagreement",
      "claim",
      "report",
    ]);
  });

  it("requires reasons for invalidation, dispute, override, and other high-impact transitions", () => {
    expect(canTransition({ machineId: "assessment_session", from: "submitted", to: "invalidated" })).toEqual({
      allowed: false,
      reason: "This transition requires a recorded reason and audit event.",
    });
    expect(
      canTransition({
        machineId: "assessment_session",
        from: "submitted",
        to: "invalidated",
        reason: "Confirmed duplicate session.",
      }).allowed,
    ).toBe(true);
  });

  it("prevents unsupported transitions", () => {
    expect(canTransition({ machineId: "response", from: "submitted", to: "draft" }).allowed).toBe(false);
    expect(canTransition({ machineId: "assessment_template", from: "published", to: "draft" }).allowed).toBe(false);
    expect(canTransition({ machineId: "assessment_template", from: "published", to: "retired" }).allowed).toBe(true);
  });

  it("evaluates evidence sufficiency without treating missing evidence as failure", () => {
    const result = evaluateEvidenceSufficiency({
      rule: emotionalRegulationProficientRule,
      actual: {
        knowledgeAssessments: 1,
        scenarioAssessments: 2,
        practicalDemonstrations: 0,
        independentObservations: 0,
        contexts: 1,
        minimumPeriodDays: 7,
      },
    });

    expect(result.sufficient).toBe(false);
    expect(result.status).toBe("developing");
    expect(result.reason).toContain("evidence remains incomplete");
    expect(result.missing.map((item) => item.requirement)).toEqual([
      "practicalDemonstrations",
      "independentObservations",
      "contexts",
      "minimumPeriodDays",
    ]);
  });

  it("keeps evidence quality dimensions separate", () => {
    expect(evidenceQualityDimensions.map((dimension) => dimension.key)).toEqual([
      "relevance",
      "reliability",
      "authenticity",
      "completeness",
      "independence",
      "recency",
      "contextQuality",
      "directness",
      "repeatability",
    ]);
  });

  it("creates a consistent event envelope", () => {
    const envelope = createWorkflowEventEnvelope({
      event_id: "event-1",
      event_type: "assessment.submitted",
      occurred_at: "2026-07-21T12:30:00Z",
      actor_user_id: "user-1",
      person_id: "person-1",
      case_id: "case-1",
      entity_type: "assessment_session",
      entity_id: "session-1",
      correlation_id: "workflow-1",
      metadata: { assessment_template_version: 3, attempt_number: 1 },
    });

    expect(envelope.event_version).toBe(1);
    expect(envelope.source).toBe("safesteps_assessment_service");
    expect(envelope.metadata).toEqual({ assessment_template_version: 3, attempt_number: 1 });
  });

  it("enforces role permissions for parents, workers, supervisors, and administrators", () => {
    expect(roleCan("parent_learner", "challenge interpretations")).toBe(true);
    expect(roleCan("parent_learner", "alter scoring rules")).toBe(false);
    expect(roleCan("worker", "conduct observations")).toBe(true);
    expect(roleCan("administrator", "make professional competency conclusions")).toBe(false);
  });

  it("blocks report release when safeguards fail", () => {
    const result = validateReportRelease({
      requiredEvidenceAvailable: true,
      unsupportedClaimsExcluded: false,
      disputedEvidenceIdentified: true,
      confidenceDisplayed: true,
      datesClear: true,
      missingEvidenceNotPresentedAsFailure: false,
      reviewerOverridesHaveReasons: true,
      childPermissionsApplied: true,
      reportVersionRecorded: true,
      summariesLinkToEvidence: true,
    });

    expect(result.releasable).toBe(false);
    expect(result.failures).toEqual([
      "unsupported claims are included",
      "missing evidence is presented as failure",
    ]);
  });

  it("documents events, automatic workflow, constraints, migration scope, and route exposure", () => {
    expect(workflowEventCatalogue.flatMap((group) => group.events)).toContain("competency.contradiction_detected");
    expect(automaticAssessmentSubmittedWorkflow).toContain("Lock submitted answers.");
    expect(databaseWorkflowConstraints).toContain("A submitted response cannot be edited.");
    expect(recommendedNextMigrationScope).toContain("row-level security foundations");
    expect(
      assessmentRoutes.some((route) => route.href === "/assessment-system/workflow-state-machines"),
    ).toBe(true);
  });
});
