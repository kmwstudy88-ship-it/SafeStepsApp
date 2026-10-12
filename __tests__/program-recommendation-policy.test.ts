import {
  customPathwayAwaitsWorkerApproval,
  getProgramRecommendationForStream,
  programCanAcceptNewEnrollments,
  recordMatchesRecommendedProgram,
} from "../lib/engines/programRecommendationPolicy";

describe("program recommendation policy", () => {
  it.each([
    ["24 Month Reunification", "intensive-reunification"],
    ["18 Month Keeping Families Together", "keeping-families-together"],
    ["12 Month Back on Track", "back-on-track"],
    ["6 Month Build Stronger Families", "build-stronger-families"],
    ["12 Week Child Safety Contact Program", "child-safety-contact"],
    ["Custom Program", "custom-program"],
  ])("maps %s to %s", (stream, programId) => {
    expect(getProgramRecommendationForStream(stream)?.program.id).toBe(programId);
  });

  it("does not infer a recommendation from unknown narrative text", () => {
    expect(
      getProgramRecommendationForStream(
        "Parent described escalating stress and housing instability",
      ),
    ).toBeNull();
  });

  it("keeps structured drafts out of new enrolments", () => {
    const draft = getProgramRecommendationForStream("12 Month Back on Track");
    const launch = getProgramRecommendationForStream("24 Month Reunification");

    expect(draft && programCanAcceptNewEnrollments(draft.program)).toBe(false);
    expect(launch && programCanAcceptNewEnrollments(launch.program)).toBe(true);
  });

  it("ignores enrolment and confirmation records for an old recommended program", () => {
    expect(
      recordMatchesRecommendedProgram(
        { program_id: "back-on-track" },
        "intensive-reunification",
      ),
    ).toBe(false);
    expect(
      recordMatchesRecommendedProgram(
        { program_id: "intensive-reunification" },
        "intensive-reunification",
      ),
    ).toBe(true);
    expect(recordMatchesRecommendedProgram(null, "intensive-reunification")).toBe(false);
  });

  it("keeps a custom pathway pending until worker approval is recorded", () => {
    const custom = getProgramRecommendationForStream("Custom Program");
    const launch = getProgramRecommendationForStream("24 Month Reunification");

    expect(custom && customPathwayAwaitsWorkerApproval(custom.program, "pending")).toBe(true);
    expect(custom && customPathwayAwaitsWorkerApproval(custom.program, "approved")).toBe(false);
    expect(launch && customPathwayAwaitsWorkerApproval(launch.program, "pending")).toBe(false);
  });
});
