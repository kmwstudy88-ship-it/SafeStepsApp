import {
  australianFamilySupportNetworks,
  capacityAssessmentDomains,
  capacityReportingFields,
  childDevelopmentCapacityScenarios,
  contactObservationGuide,
  parentPreparationGuideSections,
} from "../lib/data/childDevelopmentCapacityAssessment";
import {
  buildEvidenceBasedCaseNote,
  scoreCapacityResponse,
  selectCapacityScenariosForReview,
  summarizeCapacityAssessment,
} from "../lib/engines/childDevelopmentCapacityEngine";

describe("child development and protective capacity assessment", () => {
  it("ships a first-class scenario library across high-risk domains", () => {
    expect(capacityAssessmentDomains).toHaveLength(6);
    expect(childDevelopmentCapacityScenarios.length).toBeGreaterThanOrEqual(10);
    expect(childDevelopmentCapacityScenarios.map((scenario) => scenario.domain)).toEqual(
      expect.arrayContaining([
        "physical_emotional_safety",
        "neglect_supervision_medical",
        "substance_environment_controls",
        "domestic_safety_safe_relationships",
        "development_learning_support",
        "digital_safety",
      ]),
    );
  });

  it("keeps scenarios grounded in observable safety markers and developmental learning", () => {
    expect(
      childDevelopmentCapacityScenarios.every(
        (scenario) =>
          scenario.criticalSafetyMarkers.length >= 3 &&
          scenario.developmentalLearningFocus.length >= 3 &&
          scenario.unsafeResponseExample.length > 0 &&
          scenario.protectiveResponseExample.length > 0,
      ),
    ).toBe(true);
  });

  it("scores response levels and produces supervisor-review summaries", () => {
    expect(scoreCapacityResponse(1)).toBe(0);
    expect(scoreCapacityResponse(2)).toBe(50);
    expect(scoreCapacityResponse(3)).toBe(100);

    const summary = summarizeCapacityAssessment([
      { scenarioId: "CAP-01-INFANT-COLIC", responseLevel: 3, rawParentQuote: "safe cot and call support" },
      { scenarioId: "CAP-02-TODDLER-MELTDOWN", responseLevel: 2, rawParentQuote: "mostly calm but gives in" },
      { scenarioId: "CAP-05-MEDICATION-STORAGE", responseLevel: 1, rawParentQuote: "leave medicine on bench" },
    ]);

    expect(summary.totalScenarios).toBe(3);
    expect(summary.scorePercentage).toBe(50);
    expect(summary.requiresSupervisorReview).toBe(true);
    expect(summary.reportLanguage).toContain("Supervisor review is recommended");
  });

  it("builds evidence-based case note language without diagnostic claims", () => {
    const scenario = childDevelopmentCapacityScenarios.find((item) => item.id === "CAP-09-ONLINE-GROOMING");
    expect(scenario).toBeDefined();

    const note = buildEvidenceBasedCaseNote({
      scenario: scenario!,
      response: {
        scenarioId: "CAP-09-ONLINE-GROOMING",
        responseLevel: 3,
        rawParentQuote: "I would report the account and reassure my child.",
        workerNotes: "Identified secrecy and photo requests as unsafe.",
      },
    });

    expect(note).toContain("Level 3 (Protective Capacity Demonstrated)");
    expect(note).not.toContain("diagnosed");
    expect(note).not.toContain("court approved");
  });

  it("includes contact observation, parent preparation, support networks, and reporting fields", () => {
    expect(contactObservationGuide).toHaveLength(4);
    expect(parentPreparationGuideSections.map((section) => section.title)).toEqual(
      expect.arrayContaining(["See the Risk", "Calm Yourself First", "Protect the Child", "Support Development"]),
    );
    expect(australianFamilySupportNetworks.map((network) => network.contact)).toEqual(
      expect.arrayContaining(["000", "13 11 14", "1800 55 1800"]),
    );
    expect(capacityReportingFields).toEqual(
      expect.arrayContaining(["case_id", "scenario_id", "raw_parent_quote", "response_level", "worker_notes"]),
    );
  });

  it("selects review scenarios with per-domain limits", () => {
    const selected = selectCapacityScenariosForReview({ maxPerDomain: 1 });
    const domains = new Set(selected.map((scenario) => scenario.domain));

    expect(selected).toHaveLength(domains.size);
    expect(domains.has("development_learning_support")).toBe(true);
  });
});
