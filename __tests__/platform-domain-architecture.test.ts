import { assessmentRoutes } from "../lib/data/assessmentSystem";
import {
  getDomainEventFlow,
  getRequiredVersionedArtifactsForAssessment,
  implementationBlueprints,
  listSharedServicesForDomain,
  platformDomains,
  platformEventCatalogue,
  platformPrinciples,
  universalIdTypes,
  validateDomainBoundary,
} from "../lib/engines/platformDomainArchitecture";

describe("platformDomainArchitecture", () => {
  it("defines the eight platform domains in dependency order", () => {
    expect(platformDomains.map((domain) => domain.id)).toEqual([
      "identity_access",
      "case_program_management",
      "learning_platform",
      "assessment_platform",
      "evidence_platform",
      "competency_platform",
      "decision_support",
      "reporting_analytics",
    ]);
  });

  it("keeps participation management separate from competency decisions", () => {
    const caseBoundary = validateDomainBoundary({
      domainId: "case_program_management",
      attemptedOwnership: "Competencies",
    });
    const competencyBoundary = validateDomainBoundary({
      domainId: "competency_platform",
      attemptedOwnership: "Competencies",
    });

    expect(caseBoundary.allowed).toBe(false);
    expect(caseBoundary.reason).toContain("should not own");
    expect(competencyBoundary.allowed).toBe(true);
  });

  it("models event-driven flow between domains", () => {
    expect(getDomainEventFlow()).toEqual([
      {
        eventType: "lesson_completed",
        from: "learning_platform",
        to: ["case_program_management", "assessment_platform"],
      },
      {
        eventType: "assessment_created",
        from: "case_program_management",
        to: ["assessment_platform"],
      },
      {
        eventType: "evidence_stored",
        from: "assessment_platform",
        to: ["evidence_platform", "competency_platform", "decision_support"],
      },
      {
        eventType: "competency_updated",
        from: "competency_platform",
        to: ["case_program_management", "decision_support", "reporting_analytics"],
      },
      {
        eventType: "dashboard_refreshed",
        from: "decision_support",
        to: ["reporting_analytics"],
      },
      {
        eventType: "progress_report_updated",
        from: "decision_support",
        to: ["reporting_analytics"],
      },
    ]);
    expect(platformEventCatalogue.every((event) => event.auditPurpose.length > 0)).toBe(true);
  });

  it("uses shared services without moving ownership out of domains", () => {
    const evidenceServices = listSharedServicesForDomain("evidence_platform").map((service) => service.id);

    expect(evidenceServices).toContain("file_storage");
    expect(evidenceServices).toContain("audit_logging");
    expect(evidenceServices).toContain("search");
  });

  it("requires permanent IDs and versioning for assessment-impacting artefacts", () => {
    expect(universalIdTypes).toEqual([
      "person_id",
      "case_id",
      "program_id",
      "lesson_id",
      "activity_id",
      "assessment_id",
      "evidence_id",
      "competency_id",
      "review_id",
      "report_id",
    ]);
    expect(getRequiredVersionedArtifactsForAssessment()).toEqual([
      "lesson_version",
      "assessment_version",
      "competency_definition_version",
      "scoring_rule_version",
      "report_template_version",
      "ai_prompt_version",
      "recommendation_rule_version",
    ]);
  });

  it("documents implementation blueprints and platform principles", () => {
    expect(implementationBlueprints.map((blueprint) => blueprint.id)).toEqual([
      "database_schema",
      "domain_api_specifications",
      "event_catalogue",
      "competency_framework",
      "assessment_library",
      "evidence_schemas",
      "state_machines",
      "permission_workflows",
    ]);
    expect(platformPrinciples).toContain("Learning and competency remain separate.");
    expect(platformPrinciples).toContain(
      "Important decisions remain reviewable and attributable to authorised people.",
    );
  });

  it("exposes the assessment-system route", () => {
    expect(
      assessmentRoutes.some((route) => route.href === "/assessment-system/platform-domain-architecture"),
    ).toBe(true);
  });
});
