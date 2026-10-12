import { expect, jest, test } from "@jest/globals";

import {
  assertTextSize,
  persistFairnessAnalysis,
  validateFairnessRequestBody,
} from "../../backend/routes/documents/fairnessRoutes.js";

test("validateFairnessRequestBody enforces required text and normalizes fields", () => {
  const valid = validateFairnessRequestBody({
    text: "  Some document text for fairness review.  ",
    documentId: "  evidence-id  ",
    caseContext: {
      case_type: "custody",
      child_ages: [5, "7", null, -2],
      jurisdictions: [" VIC ", "", "NSW"],
    },
  });

  expect(valid.text).toBe("Some document text for fairness review.");
  expect(valid.documentId).toBe("evidence-id");
  expect(valid.caseContext.child_ages).toEqual([5, 7]);
  expect(valid.caseContext.jurisdictions).toEqual(["VIC", "NSW"]);
  expect(() => validateFairnessRequestBody({ text: "" })).toThrow("text is required");
});

test("assertTextSize enforces the 2MB limit", () => {
  expect(() => assertTextSize("x".repeat(2 * 1024 * 1024 + 1))).toThrow("under 2 MB");
});

test("persistFairnessAnalysis inserts fairness payload when evidence record exists", async () => {
  const fromMock = jest.fn((table) => {
    if (table === "evidence_records") {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: { id: "e1", tenant_id: "t1", case_id: "c1" }, error: null }),
            }),
          }),
        }),
      };
    }

    if (table === "evidence_ai_analyses") {
      return {
        insert: (payload) => ({
          select: () => ({
            single: async () => ({ data: { id: payload.analysis_reference }, error: null }),
          }),
        }),
      };
    }

    throw new Error(`unexpected table ${table}`);
  });

  const analysisId = await persistFairnessAnalysis({
    client: { from: fromMock },
    isLocalBypass: false,
    caseId: "c1",
    documentId: "e1",
    analysis: {
      fairness_score: 70,
      bias_indicators: [],
      coercion_flags: [],
      discrimination_risks: [],
      framing_concerns: [],
      unrealistic_expectations: [],
      remediation_recommendations: [],
    },
  });

  expect(analysisId).toContain("fairness-");
});
