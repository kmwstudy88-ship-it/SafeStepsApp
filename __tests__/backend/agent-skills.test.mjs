import { expect, jest, test, describe } from "@jest/globals";

import {
  assertTextSize,
  validateSkillInput,
  persistSkillResult,
} from "../../backend/routes/agent-skills/agentSkillsRoutes.js";

describe("validateSkillInput", () => {
  test("accepts valid text and trims whitespace", () => {
    const result = validateSkillInput({ text: "  Some evidence text.  " }, "evidence_extraction");
    expect(result.text).toBe("Some evidence text.");
  });

  test("throws when text is missing", () => {
    expect(() => validateSkillInput({}, "risk_assessment")).toThrow("text is required");
  });

  test("throws when text is empty string", () => {
    expect(() => validateSkillInput({ text: "" }, "contradiction_detection")).toThrow("text is required");
  });

  test("preserves optional documentId", () => {
    const result = validateSkillInput({ text: "hello", documentId: "  doc-123  " }, "timeline_extraction");
    expect(result.documentId).toBe("doc-123");
  });

  test("returns null documentId when not provided", () => {
    const result = validateSkillInput({ text: "hello" }, "concern_classification");
    expect(result.documentId).toBeNull();
  });
});

describe("assertTextSize", () => {
  test("accepts text within 2 MB limit", () => {
    expect(() => assertTextSize("x".repeat(100))).not.toThrow();
  });

  test("throws when text exceeds 2 MB", () => {
    expect(() => assertTextSize("x".repeat(2 * 1024 * 1024 + 1))).toThrow("under 2 MB");
  });
});

describe("persistSkillResult", () => {
  test("returns a generated id when isLocalBypass is true", async () => {
    const id = await persistSkillResult({
      isLocalBypass: true,
      client: null,
      caseId: "c1",
      skillName: "risk_assessment",
      inputText: "some text",
      result: { risk: "low" },
    });
    expect(typeof id).toBe("string");
    expect(id).toContain("risk_assessment-");
  });

  test("returns a generated id when client is not provided", async () => {
    const id = await persistSkillResult({
      isLocalBypass: false,
      client: null,
      skillName: "fairness_detection",
      inputText: "text",
      result: {},
    });
    expect(id).toContain("fairness_detection-");
  });

  test("inserts row and returns id from database", async () => {
    const fakeId = "db-result-uuid-123";
    const insertMock = jest.fn(() => ({
      select: () => ({
        single: async () => ({ data: { id: fakeId }, error: null }),
      }),
    }));
    const fromMock = jest.fn(() => ({ insert: insertMock }));

    const id = await persistSkillResult({
      isLocalBypass: false,
      client: { from: fromMock },
      caseId: "case-abc",
      skillName: "contradiction_detection",
      inputText: "document text for hashing",
      result: { contradictions: [] },
    });

    expect(id).toBe(fakeId);
    expect(fromMock).toHaveBeenCalledWith("agent_skill_results");
    const insertArg = insertMock.mock.calls[0][0];
    expect(insertArg.skill_name).toBe("contradiction_detection");
    expect(insertArg.case_id).toBe("case-abc");
    expect(typeof insertArg.input_hash).toBe("string");
    expect(insertArg.input_hash).toHaveLength(64);
  });

  test("throws when database insert returns an error", async () => {
    const fromMock = jest.fn(() => ({
      insert: jest.fn(() => ({
        select: () => ({
          single: async () => ({ data: null, error: new Error("db write failed") }),
        }),
      })),
    }));

    await expect(
      persistSkillResult({
        isLocalBypass: false,
        client: { from: fromMock },
        skillName: "evidence_extraction",
        inputText: "text",
        result: {},
      }),
    ).rejects.toThrow("db write failed");
  });
});
