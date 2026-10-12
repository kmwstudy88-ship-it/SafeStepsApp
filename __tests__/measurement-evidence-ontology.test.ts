import { assessmentRoutes } from "../lib/data/assessmentSystem";
import {
  buildOntologyChain,
  evaluateClaim,
  smeoObjectModel,
  traceConclusionLineage,
  type SmeoClaim,
  type SmeoEvidence,
  type SmeoOntologyRecord,
} from "../lib/engines/measurementEvidenceOntology";

const claim: SmeoClaim = {
  id: "claim-emotional-validation",
  objectType: "claim",
  createdAt: "2026-07-21",
  source: "assessment_system",
  competencyId: "communication",
  linkedCompetencyIds: ["communication"],
  findingIds: ["finding-validation"],
  statement: "Evidence supports that the parent can use emotional validation during structured interactions.",
  threshold: {
    minimumSupportingEvidence: 3,
    minimumIndependentSources: 2,
    requiredEvidenceTypes: ["scenario_result", "home_activity", "worker_note"],
  },
};

function evidence(overrides: Partial<SmeoEvidence>): SmeoEvidence {
  return {
    id: overrides.id ?? "evidence",
    objectType: "evidence",
    createdAt: "2026-07-21",
    source: overrides.source ?? "parent_upload",
    evidenceType: overrides.evidenceType ?? "scenario_result",
    personId: "person-parent-1",
    behaviourIds: ["behaviour-validates-feelings"],
    direction: "supporting",
    reliability: 82,
    independence: 70,
    verifiability: 74,
    linkedCompetencyIds: ["communication"],
    ...overrides,
  };
}

describe("measurementEvidenceOntology", () => {
  it("keeps the core object model in the raw-to-review order", () => {
    expect(smeoObjectModel.map((layer) => layer.objectType)).toEqual([
      "person",
      "competency",
      "capability",
      "behaviour",
      "evidence",
      "observation",
      "finding",
      "claim",
      "conclusion",
      "recommendation",
      "review",
    ]);
  });

  it("distinguishes insufficient evidence from negative evidence", () => {
    const evaluation = evaluateClaim({
      claim,
      evidence: [evidence({ id: "scenario-only", evidenceType: "scenario_result" })],
    });

    expect(evaluation.sufficiency).toBe("some_evidence");
    expect(evaluation.missingEvidenceTypes).toEqual(["home_activity", "worker_note"]);
    expect(evaluation.explanation).toContain("insufficient evidence");
    expect(evaluation.challengingEvidenceIds).toEqual([]);
  });

  it("evaluates a claim using diversity, independence, and contradiction flags", () => {
    const evaluation = evaluateClaim({
      claim,
      evidence: [
        evidence({ id: "scenario", source: "assessment", evidenceType: "scenario_result", reliability: 84 }),
        evidence({ id: "home", source: "home_activity", evidenceType: "home_activity", reliability: 86 }),
        evidence({ id: "worker", source: "worker", evidenceType: "worker_note", reliability: 88 }),
        evidence({
          id: "mixed-note",
          source: "teacher",
          evidenceType: "teacher_feedback",
          direction: "mixed",
          reliability: 72,
        }),
      ],
    });

    expect(evaluation.sufficiency).toBe("sufficient_evidence");
    expect(evaluation.evidenceDiversity).toBe(3);
    expect(evaluation.independentSources).toBe(3);
    expect(evaluation.challengingEvidenceIds).toEqual(["mixed-note"]);
    expect(evaluation.confidenceBand).toBe("moderate");
  });

  it("traces a conclusion back to claims, findings, observations, and raw evidence", () => {
    const records: SmeoOntologyRecord[] = [
      evidence({ id: "evidence-video", evidenceType: "video" }),
      {
        id: "observation-1",
        objectType: "observation",
        createdAt: "2026-07-21",
        source: "worker",
        evidenceIds: ["evidence-video"],
        behaviourIds: ["behaviour-validates-feelings"],
        description: "Parent acknowledged the child's frustration before setting a limit.",
      },
      {
        id: "finding-validation",
        objectType: "finding",
        createdAt: "2026-07-21",
        source: "review",
        observationIds: ["observation-1"],
        description: "Emotional validation was observed during a structured activity.",
      },
      claim,
      {
        id: "conclusion-1",
        objectType: "conclusion",
        createdAt: "2026-07-21",
        source: "review",
        claimIds: ["claim-emotional-validation"],
        statement: "Current evidence indicates developing competency in emotion coaching.",
        confidenceBand: "moderate",
        evidenceDiversity: 1,
        timeframe: "July 2026",
        remainingGaps: ["Unstructured routine evidence"],
        alternativeExplanations: ["Structured setting may have increased performance."],
        assumptions: ["Video date is accurate because upload metadata is available."],
      },
    ];

    const lineage = traceConclusionLineage({ conclusionId: "conclusion-1", records });
    expect(lineage.claims.map((item) => item.id)).toEqual(["claim-emotional-validation"]);
    expect(lineage.findings.map((item) => item.id)).toEqual(["finding-validation"]);
    expect(lineage.observations.map((item) => item.id)).toEqual(["observation-1"]);
    expect(lineage.evidence.map((item) => item.id)).toEqual(["evidence-video"]);
  });

  it("groups records by ontology object type and exposes the assessment route", () => {
    const chain = buildOntologyChain([claim, evidence({ id: "scenario" })]);

    expect(chain.grouped.claim).toHaveLength(1);
    expect(chain.grouped.evidence).toHaveLength(1);
    expect(
      assessmentRoutes.some((route) => route.href === "/assessment-system/measurement-evidence-ontology"),
    ).toBe(true);
  });
});
