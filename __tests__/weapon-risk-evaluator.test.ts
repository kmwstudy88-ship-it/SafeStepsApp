const {
  evaluateWeaponRisk,
  extractTranscriptText,
} = require("../backend/security/weapon_risk/weaponRiskEvaluator");

describe("weapon risk evaluator", () => {
  test("extracts transcript text from JSON transcript segments", () => {
    expect(
      extractTranscriptText({
        segments: [{ text: "he has a gun" }, { text: "and he is loading it" }],
      }),
    ).toBe("he has a gun and he is loading it");
  });

  test("classifies explicit transcript and audio feature indicators", () => {
    const result = evaluateWeaponRisk({
      transcript_json: {
        transcript: "he has a gun and shots fired",
        segments: [{ text: "drop the weapon" }],
      },
      audio_features: ["gunshot"],
    });

    expect(result.level).toBe("CRITICAL");
    expect(result.confidence).toBe("HIGH");
    expect(result.weapon_threat_score).toBe(1);
    expect(result.detected_keywords.map((match: { phrase: string }) => match.phrase)).toEqual(
      expect.arrayContaining(["gun", "shots fired", "he has a gun", "drop the weapon"]),
    );
    expect(result.detected_audio_patterns.map((match: { pattern: string }) => match.pattern)).toEqual(["gunshot"]);
    expect(result.review_flags).toEqual(expect.arrayContaining(["urgent_human_safety_review", "multi_source_indicator"]));
    expect(result.evidence_summary.for_review_only).toBe(true);
    expect(result.source.decision_boundary).toContain("decision-support");
  });

  test("does not produce emergency automation instructions", () => {
    const result = evaluateWeaponRisk({
      transcript_json: { transcript: "knife" },
      audio_features: [],
    });

    expect(result.recommended_action).not.toMatch(/auto|dial|silent|decoy/i);
  });

  test("handles malformed transcript JSON as plain transcript text", () => {
    const result = evaluateWeaponRisk({
      transcript_json: "knife mentioned during argument",
      audio_features: [],
    });

    expect(result.level).toBe("MEDIUM");
    expect(result.detected_keywords.map((match: { phrase: string }) => match.phrase)).toContain("knife");
  });

  test("does not match weapon words inside unrelated longer words", () => {
    const result = evaluateWeaponRisk({
      transcript_json: { transcript: "the campaign was about building trust" },
      audio_features: [],
    });

    expect(result.level).toBe("NONE");
    expect(result.weapon_threat_score).toBe(0);
  });
});
