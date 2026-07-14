import {
  multiSourceEvidenceRequirements,
  reunificationAssessmentPhases,
  safeStepsDefaultResponses,
  safeStepsProtectiveCapacityDomains,
  safeStepsProtectiveCapacityItems,
} from "../lib/data/safeStepsAssessmentInstrument";

describe("reunification assessment instrument", () => {
  test("includes master-document rubric domains", () => {
    expect(safeStepsProtectiveCapacityDomains.map((domain) => domain.id)).toEqual(
      expect.arrayContaining([
        "protective-capacity",
        "insight-accountability",
        "emotional-regulation",
        "parenting-skills",
        "environmental-stability",
        "anti-gaming",
      ]),
    );
  });

  test("keeps default responses aligned to every scoring item", () => {
    const responseIds = new Set(safeStepsDefaultResponses.map((response) => response.itemId));

    expect(safeStepsProtectiveCapacityItems.every((item) => responseIds.has(item.id))).toBe(true);
  });

  test("captures phase and multi-source evidence requirements", () => {
    expect(reunificationAssessmentPhases).toHaveLength(5);
    expect(multiSourceEvidenceRequirements.map((item) => item.source)).toEqual(
      expect.arrayContaining(["Self-report", "Observation", "Collateral", "Document and media evidence"]),
    );
  });
});
