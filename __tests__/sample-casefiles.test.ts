import { getSampleCasefile, sampleCasefiles } from "../lib/data/sampleCasefiles";

describe("sample casefiles", () => {
  test("includes joint and dual account samples", () => {
    expect(sampleCasefiles).toHaveLength(2);
    expect(getSampleCasefile("CASE_001")?.account_mode).toBe("joint");
    expect(getSampleCasefile("CASE_002")?.account_mode).toBe("dual");
  });

  test("keeps parent account linkage aligned to account mode", () => {
    const jointCase = getSampleCasefile("CASE_001");
    const dualCase = getSampleCasefile("CASE_002");

    expect(jointCase?.parents.map((parent) => parent.account_linked)).toEqual([true, true]);
    expect(dualCase?.parents.map((parent) => parent.account_linked)).toEqual([false, false]);
  });

  test("returns null for missing sample cases", () => {
    expect(getSampleCasefile("missing-case")).toBeNull();
  });
});
