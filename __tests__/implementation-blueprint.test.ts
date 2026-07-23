import { assessmentRoutes } from "../lib/data/assessmentSystem";
import {
  assessmentSystemLayers,
  buildPhases,
  exampleAssessmentFlow,
  exampleGeneratedResult,
  findBlueprintTable,
  getTablesByLayer,
  getTablesForPhase,
  validateBlueprintCoverage,
} from "../lib/engines/implementationBlueprint";

describe("implementationBlueprint", () => {
  it("defines the four assessment system layers", () => {
    expect(assessmentSystemLayers.map((layer) => layer.id)).toEqual([
      "assessment_design",
      "assessment_delivery",
      "evidence_generation",
      "competency_evaluation",
    ]);
  });

  it("covers all blueprint tables in the recommended build phases", () => {
    const coverage = validateBlueprintCoverage();

    expect(coverage.tableCount).toBe(30);
    expect(coverage.phaseCount).toBe(5);
    expect(coverage.complete).toBe(true);
    expect(coverage.missingFromPhases).toEqual([]);
    expect(coverage.unknownPhaseTables).toEqual([]);
  });

  it("keeps assessment design separate from delivery", () => {
    expect(getTablesForPhase("assessment_fundamentals").map((table) => table.name)).toEqual([
      "assessment_templates",
      "assessment_sections",
      "assessment_items",
      "assessment_options",
      "assessment_assignments",
      "assessment_sessions",
      "assessment_responses",
    ]);
    expect(getTablesByLayer("assessment_design").map((table) => table.name)).toEqual([
      "assessment_templates",
      "assessment_sections",
      "assessment_items",
      "assessment_options",
    ]);
  });

  it("includes branching scenarios, confidence ratings, and reviewer scores", () => {
    const options = findBlueprintTable("assessment_options");
    const responses = findBlueprintTable("assessment_responses");

    expect(options?.fields.map((field) => field.name)).toContain("branch_to_item_id");
    expect(responses?.fields.map((field) => field.name)).toEqual(
      expect.arrayContaining(["confidence_rating", "auto_score", "reviewer_score", "final_score"]),
    );
  });

  it("protects evidence, claims, competency history, audit, and disagreement records", () => {
    expect(findBlueprintTable("evidence_items")?.immutable).toBe(true);
    expect(findBlueprintTable("claims")?.immutable).toBe(true);
    expect(findBlueprintTable("competency_profile_history")?.immutable).toBe(true);
    expect(findBlueprintTable("review_disagreements")?.immutable).toBe(true);
    expect(findBlueprintTable("audit_events")?.immutable).toBe(true);
    expect(findBlueprintTable("content_versions")?.immutable).toBe(true);
  });

  it("models assessment results beyond a single percentage score", () => {
    expect(exampleAssessmentFlow.map((step) => step.level)).toEqual([
      "Knowledge",
      "Understanding",
      "Application",
      "Demonstration",
      "Reflection",
      "Home Practice",
      "Follow-Up",
    ]);
    expect(exampleGeneratedResult).toMatchObject({
      realLifeApplication: "Insufficient evidence",
      retention: "Not yet assessed",
      overallCompetency: "Developing",
      confidence: "Moderate",
    });
  });

  it("exposes the assessment-system route", () => {
    expect(
      assessmentRoutes.some((route) => route.href === "/assessment-system/implementation-blueprint"),
    ).toBe(true);
  });
});
