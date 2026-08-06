import {
  assessRisk,
  classifyConcerns,
  detectBias,
  detectContradictions,
  detectFairness,
  detectUnrealisticExpectations,
  extractEvidence,
  extractRequirements,
  extractTimeline,
  runDocumentIntelligenceEngines,
} from "../lib/engines/documentIntelligenceEngine";

// ---------------------------------------------------------------------------
// 1. Fairness Detection
// ---------------------------------------------------------------------------

describe("detectFairness", () => {
  it("returns low risk and no signals for neutral text", () => {
    const result = detectFairness("The parent attended all scheduled visits and engaged cooperatively.");
    expect(result.engine).toBe("fairness_detection");
    expect(result.riskLevel).toBe("low");
    expect(result.reviewRequired).toBe(false);
    expect(result.highRiskPhrases).toHaveLength(0);
  });

  it("detects socioeconomic fairness signal", () => {
    const result = detectFairness("The family is living in poverty and financial hardship was noted throughout the assessment.");
    const signal = result.signals.find((s) => s.domain === "socioeconomic_fairness");
    expect(signal?.triggered).toBe(true);
  });

  it("detects high-risk subjective language", () => {
    const result = detectFairness("The parent was uncooperative and showed a bad attitude towards workers.");
    expect(result.highRiskPhrases).toContain("uncooperative");
    expect(result.highRiskPhrases).toContain("bad attitude");
    expect(result.reviewRequired).toBe(true);
  });

  it("detects prohibited AI finalisations", () => {
    const result = detectFairness("This assessment contains abuse findings and credibility findings about the parent.");
    expect(result.prohibitedFinalisations.length).toBeGreaterThan(0);
  });

  it("detects cultural fairness signal", () => {
    const result = detectFairness("No interpreter was provided despite a known language barrier.");
    const signal = result.signals.find((s) => s.domain === "cultural_fairness");
    expect(signal?.triggered).toBe(true);
  });

  it("detects algorithmic fairness concern", () => {
    const result = detectFairness("The system generated risk score was used without further review.");
    const signal = result.signals.find((s) => s.domain === "algorithmic_fairness");
    expect(signal?.triggered).toBe(true);
  });

  it("includes applicable fairness rules when signals are triggered", () => {
    const result = detectFairness("The parent was uncooperative.");
    expect(result.applicableRules.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 2. Contradiction Detection
// ---------------------------------------------------------------------------

describe("detectContradictions", () => {
  it("returns no contradictions for consistent text", () => {
    const result = detectContradictions("The parent attended all visits. The parent was engaged throughout the process.");
    expect(result.engine).toBe("contradiction_detection");
    expect(result.reviewRequired).toBe(false);
  });

  it("detects a negation-type contradiction", () => {
    const result = detectContradictions("The parent is compliant with case plan requirements. The parent is non-compliant with all expectations.");
    expect(result.totalFound).toBeGreaterThan(0);
    expect(result.contradictions[0].type).toBe("negation");
    expect(result.contradictions[0].confidence).toBe("high");
  });

  it("detects engaged vs not engaged contradiction", () => {
    const result = detectContradictions("The parent was engaged with support services. The parent was not engaged with services provided.");
    const neg = result.contradictions.find((c) => c.flag.includes("engaged"));
    expect(neg).toBeDefined();
  });

  it("flags high-confidence contradictions separately", () => {
    const result = detectContradictions("The parent attended all sessions. The parent did not attend any sessions.");
    expect(result.highConfidenceCount).toBeGreaterThan(0);
  });

  it("does not duplicate the same contradiction", () => {
    const text = "Parent is stable. Parent is unstable. Parent is stable. Parent is unstable.";
    const result = detectContradictions(text);
    const keys = result.contradictions.map((c) => `${c.sentenceA}||${c.sentenceB}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

// ---------------------------------------------------------------------------
// 3. Evidence Extraction
// ---------------------------------------------------------------------------

describe("extractEvidence", () => {
  it("returns empty result for text with no evidence statements", () => {
    const result = extractEvidence("The weather is fine today.");
    expect(result.engine).toBe("evidence_extraction");
    expect(result.totalFound).toBe(0);
  });

  it("extracts a direct observation", () => {
    const result = extractEvidence("During the home visit the worker observed the children were clean and the home was tidy.");
    const obs = result.items.find((e) => e.category === "direct_observation");
    expect(obs).toBeDefined();
    expect(obs?.strength).toBe("strong");
  });

  it("extracts a court order evidence item", () => {
    const result = extractEvidence("The court ordered that the parent complete a parenting program within 60 days.");
    const courtItem = result.items.find((e) => e.category === "court_order");
    expect(courtItem).toBeDefined();
  });

  it("extracts reported information as weak evidence", () => {
    const result = extractEvidence("The mother reported that she had stopped using substances.");
    const rep = result.items.find((e) => e.category === "reported_information");
    expect(rep).toBeDefined();
    expect(rep?.strength).toBe("weak");
  });

  it("identifies evidence gaps for missing standard areas", () => {
    const result = extractEvidence("The home visit was completed and the worker observed the kitchen was clean.");
    expect(result.gaps).toContain("domestic violence");
    expect(result.gaps).toContain("mental health");
  });

  it("counts strong evidence items correctly", () => {
    const result = extractEvidence(
      "During the home visit the worker observed the children. Court ordered the parent to attend. Records show the family has engaged.",
    );
    expect(result.strongCount).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 4. Requirement Extraction
// ---------------------------------------------------------------------------

describe("extractRequirements", () => {
  it("returns empty result when no requirements are present", () => {
    const result = extractRequirements("The family is doing well and the children are safe.");
    expect(result.engine).toBe("requirement_extraction");
    expect(result.totalFound).toBe(0);
  });

  it("extracts a must-level legal order requirement", () => {
    const result = extractRequirements("The court ordered that the parent must attend a domestic violence program within 30 days.");
    expect(result.totalFound).toBeGreaterThan(0);
    const req = result.requirements[0];
    expect(req.obligationLevel).toBe("must");
    expect(req.requirementType).toBe("legal_order");
  });

  it("identifies mandatory timeframe items for tracking", () => {
    const result = extractRequirements("The parent must attend the program within 4 weeks. The parent should also engage with housing support.");
    expect(result.overdueRiskItems.length).toBeGreaterThan(0);
    expect(result.overdueRiskItems[0].timeframe).not.toBeNull();
  });

  it("extracts reporting obligations", () => {
    const result = extractRequirements("The parent must notify the worker of any change of address.");
    const req = result.requirements.find((r) => r.requirementType === "reporting_obligation");
    expect(req).toBeDefined();
  });

  it("extracts service engagement requirements", () => {
    const result = extractRequirements("The parent is required to attend the family preservation program.");
    const req = result.requirements.find((r) => r.requirementType === "service_engagement");
    expect(req).toBeDefined();
  });

  it("extracts should-level requirements correctly", () => {
    const result = extractRequirements("The parent should attend a parenting program as recommended by the case plan.");
    const req = result.requirements.find((r) => r.requirementType === "case_plan_condition");
    expect(req?.obligationLevel).toBe("should");
  });
});

// ---------------------------------------------------------------------------
// 5. Timeline Extraction
// ---------------------------------------------------------------------------

describe("extractTimeline", () => {
  it("returns empty result when no dates are present", () => {
    const result = extractTimeline("The parent is engaged with services and making progress.");
    expect(result.engine).toBe("timeline_extraction");
    expect(result.totalFound).toBe(0);
  });

  it("extracts a dated incident event", () => {
    const result = extractTimeline("On 15 March 2024 an incident was reported to child safety.");
    expect(result.totalFound).toBeGreaterThan(0);
    expect(result.events[0].eventType).toBe("incident");
  });

  it("extracts ISO format dates", () => {
    const result = extractTimeline("The assessment was completed on 2025-06-01 and reviewed on 2025-07-15.");
    expect(result.totalFound).toBeGreaterThanOrEqual(2);
  });

  it("orders events chronologically", () => {
    const result = extractTimeline(
      "The child was removed on 2024-03-10. The initial notification was received on 2023-11-01. Court orders were made on 2024-06-20.",
    );
    const dates = result.orderedEvents.map((e) => e.normalizedDate!);
    expect(dates[0] <= dates[1]).toBe(true);
    if (dates.length > 2) expect(dates[1] <= dates[2]).toBe(true);
  });

  it("detects chronology gaps over one year", () => {
    const result = extractTimeline(
      "The notification was received on 2020-01-15. The case was reviewed on 2022-06-01.",
    );
    expect(result.chronologyGaps.length).toBeGreaterThan(0);
  });

  it("classifies court events", () => {
    const result = extractTimeline("The court hearing was held on 2025-04-10.");
    const courtEvent = result.events.find((e) => e.eventType === "court_event");
    expect(courtEvent).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// 6. Risk Assessment
// ---------------------------------------------------------------------------

describe("assessRisk", () => {
  it("returns low risk for safe neutral text", () => {
    const result = assessRisk("The family is stable and engaged with all services.");
    expect(result.engine).toBe("risk_assessment");
    expect(result.overallRiskLevel).toBe("low");
    expect(result.immediateActionRequired).toBe(false);
  });

  it("identifies domestic violence as a high-severity factor", () => {
    const result = assessRisk("There are ongoing concerns about domestic violence in the home.");
    const dv = result.factors.find((f) => f.category === "domestic_violence");
    expect(dv).toBeDefined();
    expect(dv?.severity).toBe("high");
  });

  it("flags immediate action required for critical child safety concerns", () => {
    const result = assessRisk("The child is in immediate danger and requires emergency removal.");
    expect(result.immediateActionRequired).toBe(true);
    expect(result.overallRiskLevel).toBe("critical");
  });

  it("identifies protective factors", () => {
    const result = assessRisk("The parent has a strong support network and is motivated to change.");
    expect(result.protectiveFactorsPresent).toContain("support network");
    expect(result.protectiveFactorsPresent).toContain("motivated to change");
  });

  it("counts high-risk factors for overall risk level", () => {
    const result = assessRisk(
      "Domestic violence has been reported. Substance use is ongoing. The parent is unable to care for the children adequately.",
    );
    expect(result.highCount).toBeGreaterThanOrEqual(2);
    expect(result.overallRiskLevel).toBe("high");
  });

  it("identifies non-compliance as a risk factor", () => {
    const result = assessRisk("The parent failed to attend three consecutive appointments and disengaged from services.");
    const nc = result.factors.find((f) => f.category === "non_compliance");
    expect(nc).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// 7. Concern Classification
// ---------------------------------------------------------------------------

describe("classifyConcerns", () => {
  it("returns empty result for text with no concerns", () => {
    const result = classifyConcerns("All is well and the children are thriving.");
    expect(result.engine).toBe("concern_classification");
    expect(result.totalFound).toBe(0);
  });

  it("classifies domestic violence as a critical concern", () => {
    const result = classifyConcerns("There are concerns about domestic violence in the family home.");
    const dv = result.concerns.find((c) => c.concernType === "domestic_violence");
    expect(dv).toBeDefined();
    expect(dv?.severity).toBe("critical");
    expect(result.criticalConcerns).toContain(dv);
  });

  it("classifies housing as a moderate concern", () => {
    const result = classifyConcerns("The family is experiencing housing instability and may face eviction.");
    const housing = result.concerns.find((c) => c.concernType === "housing");
    expect(housing).toBeDefined();
    expect(housing?.severity).toBe("moderate");
  });

  it("provides a suggested action for each concern", () => {
    const result = classifyConcerns("Mental health concerns have been identified for the primary carer.");
    expect(result.concerns[0].suggestedAction).toBeTruthy();
    expect(result.concerns[0].actionable).toBe(true);
  });

  it("identifies top concern types", () => {
    const result = classifyConcerns(
      "There are mental health concerns. The family is experiencing financial hardship. Housing instability was noted.",
    );
    expect(result.topConcernTypes.length).toBeGreaterThan(0);
  });

  it("classifies legal concerns", () => {
    const result = classifyConcerns("The parent is subject to current criminal court proceedings.");
    const legal = result.concerns.find((c) => c.concernType === "legal");
    expect(legal).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// 8. Unrealistic Expectation Detection
// ---------------------------------------------------------------------------

describe("detectUnrealisticExpectations", () => {
  it("returns empty result when no unrealistic expectations are present", () => {
    const result = detectUnrealisticExpectations("The case plan will be reviewed in six months.");
    expect(result.engine).toBe("unrealistic_expectation_detection");
    expect(result.totalFound).toBe(0);
    expect(result.reviewRequired).toBe(false);
  });

  it("detects immediate change expectations", () => {
    const result = detectUnrealisticExpectations("The parent must immediately stop all substance use before next visit.");
    const exp = result.expectations.find((e) => e.category === "timeframe_too_short");
    expect(exp).toBeDefined();
    expect(result.reviewRequired).toBe(true);
  });

  it("detects multiple simultaneous demands", () => {
    const result = detectUnrealisticExpectations(
      "The parent must attend the parenting program as well as the domestic violence program and in addition to attending counselling.",
    );
    const exp = result.expectations.find((e) => e.category === "multiple_simultaneous_demands");
    expect(exp).toBeDefined();
  });

  it("detects trauma response mislabelling", () => {
    const result = detectUnrealisticExpectations("The parent refused to engage and shut down during the interview.");
    const exp = result.expectations.find((e) => e.category === "trauma_response_mislabelled");
    expect(exp).toBeDefined();
  });

  it("detects poverty-driven barrier treated as choice", () => {
    const result = detectUnrealisticExpectations("The parent chose not to provide the required documentation.");
    const exp = result.expectations.find((e) => e.category === "systemic_barrier_ignored");
    expect(exp).toBeDefined();
  });

  it("provides a recommended adjustment for each detected expectation", () => {
    const result = detectUnrealisticExpectations("The parent must immediately stop all harmful behaviour.");
    expect(result.expectations[0].recommendedAdjustment).toBeTruthy();
  });

  it("does not produce duplicate expectation entries for the same sentence", () => {
    const text = "The parent must immediately stop and must immediately cease.";
    const result = detectUnrealisticExpectations(text);
    const sentences = result.expectations.map((e) => e.sentence);
    expect(new Set(sentences).size).toBe(sentences.length);
  });
});

// ---------------------------------------------------------------------------
// 9. Bias Detection
// ---------------------------------------------------------------------------

describe("detectBias", () => {
  it("returns no indicators for neutral unbiased text", () => {
    const result = detectBias("The parent engaged cooperatively and completed all requirements on time.");
    expect(result.engine).toBe("bias_detection");
    expect(result.totalFound).toBe(0);
    expect(result.riskLevel).toBe("low");
    expect(result.reviewRequired).toBe(false);
  });

  it("detects confirmation bias", () => {
    const result = detectBias("This further confirms what was found in the initial assessment.");
    const ind = result.indicators.find((i) => i.biasType === "confirmation bias");
    expect(ind).toBeDefined();
  });

  it("detects automation bias", () => {
    const result = detectBias("The system flagged this family as high risk based on the risk rating.");
    const ind = result.indicators.find((i) => i.biasType === "automation bias");
    expect(ind).toBeDefined();
  });

  it("detects high-risk subjective language as bias signal", () => {
    const result = detectBias("The parent lacks insight and is unmotivated.");
    expect(result.highRiskPhrases.length).toBeGreaterThan(0);
  });

  it("includes a review prompt for each indicator", () => {
    const result = detectBias("This further confirms the initial assessment finding.");
    expect(result.indicators[0].reviewPrompt).toBeTruthy();
  });

  it("lists unique bias types found", () => {
    const result = detectBias(
      "As expected the parent was non-compliant. The system flagged this as high risk. The risk score confirms prior concerns.",
    );
    expect(result.biasTypesFound.length).toBeGreaterThan(0);
    expect(new Set(result.biasTypesFound).size).toBe(result.biasTypesFound.length);
  });

  it("elevates risk level when multiple indicators are present", () => {
    const result = detectBias(
      "As expected this further confirms the initial assessment. The system flagged the risk rating. The parent lacks insight and is unmotivated.",
    );
    expect(["medium", "high", "critical"]).toContain(result.riskLevel);
  });
});

// ---------------------------------------------------------------------------
// Composite: runDocumentIntelligenceEngines
// ---------------------------------------------------------------------------

describe("runDocumentIntelligenceEngines", () => {
  const SAMPLE_TEXT = `
    On 15 March 2024 a notification was received regarding the family.
    The worker observed during the home visit that the children appeared safe.
    The parent reported that she had stopped using substances.
    The court ordered that the parent must attend a domestic violence program within 30 days.
    The parent was non-compliant and did not attend the scheduled session.
    As expected this further confirms prior concerns about the parent's lack of insight.
    The parent is living in poverty and financial hardship was noted.
    The parent was uncooperative during the assessment.
    The parent must immediately stop all substance use before the next visit.
    There are ongoing concerns about domestic violence in the home.
    The parent is compliant with the case plan. The parent is non-compliant with all requirements.
  `.trim();

  it("returns all nine engine results", () => {
    const result = runDocumentIntelligenceEngines(SAMPLE_TEXT);
    expect(result.fairnessDetection.engine).toBe("fairness_detection");
    expect(result.contradictionDetection.engine).toBe("contradiction_detection");
    expect(result.evidenceExtraction.engine).toBe("evidence_extraction");
    expect(result.requirementExtraction.engine).toBe("requirement_extraction");
    expect(result.timelineExtraction.engine).toBe("timeline_extraction");
    expect(result.riskAssessment.engine).toBe("risk_assessment");
    expect(result.concernClassification.engine).toBe("concern_classification");
    expect(result.unrealisticExpectationDetection.engine).toBe("unrealistic_expectation_detection");
    expect(result.biasDetection.engine).toBe("bias_detection");
  });

  it("detects risk and concerns in the sample document", () => {
    const result = runDocumentIntelligenceEngines(SAMPLE_TEXT);
    expect(result.riskAssessment.totalFactors).toBeGreaterThan(0);
    expect(result.concernClassification.totalFound).toBeGreaterThan(0);
  });

  it("detects fairness signals and bias in the sample document", () => {
    const result = runDocumentIntelligenceEngines(SAMPLE_TEXT);
    expect(result.fairnessDetection.reviewRequired).toBe(true);
    expect(result.biasDetection.totalFound + result.biasDetection.highRiskPhrases.length).toBeGreaterThan(0);
  });

  it("extracts evidence and requirements from the sample document", () => {
    const result = runDocumentIntelligenceEngines(SAMPLE_TEXT);
    expect(result.evidenceExtraction.totalFound).toBeGreaterThan(0);
    expect(result.requirementExtraction.totalFound).toBeGreaterThan(0);
  });

  it("detects contradictions in the sample document", () => {
    const result = runDocumentIntelligenceEngines(SAMPLE_TEXT);
    expect(result.contradictionDetection.totalFound).toBeGreaterThan(0);
  });

  it("extracts a timeline from the sample document", () => {
    const result = runDocumentIntelligenceEngines(SAMPLE_TEXT);
    expect(result.timelineExtraction.totalFound).toBeGreaterThan(0);
  });

  it("detects unrealistic expectations in the sample document", () => {
    const result = runDocumentIntelligenceEngines(SAMPLE_TEXT);
    expect(result.unrealisticExpectationDetection.totalFound).toBeGreaterThan(0);
  });

  it("works on empty input without throwing", () => {
    expect(() => runDocumentIntelligenceEngines("")).not.toThrow();
    const result = runDocumentIntelligenceEngines("");
    expect(result.riskAssessment.overallRiskLevel).toBe("low");
  });
});
