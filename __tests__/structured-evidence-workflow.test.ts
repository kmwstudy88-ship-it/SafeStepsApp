import {
  emptyStructuredEvidenceRecord,
  evidenceReviewReadiness,
  splitLines,
  structuredEvidenceNotes,
  structuredEvidenceTitle,
} from "../lib/engines/structuredEvidenceWorkflow";

describe("structured evidence workflow", () => {
  test("creates separate direct-observation fields for facts and interpretation", () => {
    const record = emptyStructuredEvidenceRecord("direct_observation");

    record.purpose = "Assess response to child distress";
    record.observable_facts = "The child cried after the toy was removed.";
    record.professional_interpretation = "The response may demonstrate repair.";

    expect(structuredEvidenceTitle(record)).toBe("Direct observation: Assess response to child distress");
    expect(structuredEvidenceNotes(record)).toContain("Facts: The child cried after the toy was removed.");
    expect(structuredEvidenceNotes(record)).toContain("Interpretation: The response may demonstrate repair.");
    expect(record.workflow.direct_observation?.domains).toHaveProperty("Emotional attunement");
  });

  test("normalizes comma and newline lists", () => {
    expect(splitLines("school, doctor\nsupport service")).toEqual([
      "school",
      "doctor",
      "support service",
    ]);
  });

  test("creates collateral report workflow fields", () => {
    const record = emptyStructuredEvidenceRecord("collateral_report");

    expect(record.workflow.collateral_report).toMatchObject({
      source_organisation: "",
      provider_role: "",
      directly_observed: "",
      records_supporting_information: "",
      exact_words_or_summary: "",
      information_current_until: "",
    });
    expect(record.workflow.direct_observation).toBeUndefined();
  });

  test("creates separate insight dimensions for self-report interviews", () => {
    const record = emptyStructuredEvidenceRecord("self_report_interview");

    expect(record.workflow.self_report_interview?.insight_dimensions).toHaveProperty(
      "Recognition of supported events",
    );
    expect(record.workflow.self_report_interview?.insight_dimensions).toHaveProperty(
      "Capacity to challenge inaccurate information constructively",
    );
  });

  test("creates objective measure fields without treating a score as a decision", () => {
    const record = emptyStructuredEvidenceRecord("objective_measure");

    expect(record.workflow.objective_measure).toMatchObject({
      tool_name_version: "",
      administrator_qualifications: "",
      validated_population: "",
      raw_result: "",
      scoring_rules: "",
      limitations: "",
      confirmation_testing: "",
      review_or_expiry_date: "",
    });
  });

  test("blocks serious-decision readiness when no case or support worker is linked", () => {
    const record = emptyStructuredEvidenceRecord("direct_observation");
    record.observable_facts = "Parent responded to the child's cue.";
    record.parent_response = "Parent agreed with the summary.";
    record.limitations = ["Single short observation."];
    record.source_reliability = "direct_observation";

    const readiness = evidenceReviewReadiness({
      record,
      reviewAvailability: "no_linked_worker",
    });

    expect(readiness.canUseForSeriousDecision).toBe(false);
    expect(readiness.warnings).toContain(
      "No linked case or support worker is currently attached to this family case file.",
    );
  });

  test("allows readiness only when evidence is complete and a worker link exists", () => {
    const record = emptyStructuredEvidenceRecord("direct_observation");
    record.observable_facts = "Parent responded to the child's cue.";
    record.parent_response = "Parent agreed with the summary.";
    record.limitations = ["Observed during a scheduled visit."];
    record.source_reliability = "direct_observation";

    const readiness = evidenceReviewReadiness({
      record,
      reviewAvailability: "linked_worker_available",
    });

    expect(readiness).toEqual({
      canUseForSeriousDecision: true,
      warnings: [],
    });
  });
});
