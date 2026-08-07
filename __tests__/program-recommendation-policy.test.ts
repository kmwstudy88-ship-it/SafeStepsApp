import {
  getProgramRecommendationForStream,
  programCanAcceptNewEnrollments,
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
});
