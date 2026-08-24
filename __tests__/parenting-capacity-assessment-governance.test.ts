import {
  evaluateParentingCapacityReportReadiness,
  parentingCapacityMethodRegistry,
} from "../lib/engines/parentingCapacityAssessmentGovernance";

const completeInput = {
  qualifiedAssessorConfirmed: true,
  childSpecificNeedsDocumented: true,
  evidenceSourceCount: 4,
  includesDirectObservation: true,
  includesCollateralInformation: true,
  includesDemonstratedBehaviourChange: true,
  includesSustainabilityEvidence: true,
  includesProtectiveCapacity: true,
  reliesOnlyOnDiagnosisOrTestScore: false,
  restrictedToolRequirementsConfirmed: true,
  familyViolenceRelevant: true,
  jurisdictionFrameworkConfirmed: true,
  attemptsLegalOrCapacityConclusion: false,
};

describe("parenting capacity assessment governance", () => {
  it("permits only qualified human review, never a capacity determination", () => {
    const result = evaluateParentingCapacityReportReadiness(completeInput);
    expect(result.decision).toBe("ready_for_qualified_review");
    expect(result.notice).toContain("not a clinical");
  });

  it("blocks score-only and automated legal conclusions", () => {
    const result = evaluateParentingCapacityReportReadiness({
      ...completeInput,
      reliesOnlyOnDiagnosisOrTestScore: true,
      attemptsLegalOrCapacityConclusion: true,
    });
    expect(result.decision).toBe("not_ready");
    expect(result.blockers.join(" ")).toContain("cannot establish parenting capacity");
    expect(result.blockers.join(" ")).toContain("fit/unfit");
  });

  it("requires a jurisdictional family-violence framework when relevant", () => {
    const result = evaluateParentingCapacityReportReadiness({
      ...completeInput,
      jurisdictionFrameworkConfirmed: false,
    });
    expect(result.decision).toBe("not_ready");
    expect(result.blockers.join(" ")).toContain("jurisdictional family-violence framework");
  });

  it("does not embed restricted test content", () => {
    expect(parentingCapacityMethodRegistry.some((method) => method.restricted)).toBe(true);
    expect(parentingCapacityMethodRegistry.every((method) => !method.safeStepsBoundary.toLowerCase().includes("test item:"))).toBe(true);
  });
});
