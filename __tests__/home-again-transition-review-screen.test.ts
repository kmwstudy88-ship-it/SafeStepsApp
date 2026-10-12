import fs from "fs";
import path from "path";

describe("Home Again transition review screen", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "app", "assessment-system", "home-again-transition-review.tsx"),
    "utf8",
  );

  test("uses the Home Again transition engine and shows both stability and setback pathways", () => {
    expect(source).toContain("evaluateHomeAgainTransition");
    expect(source).toContain("Stable return-home pathway");
    expect(source).toContain("Setback review pathway");
  });

  test("frames step-down as case-team review instead of an automatic transition", () => {
    expect(source).toContain("Calibration preview only");
    expect(source).toContain("keep any transition decision with the caseworker and case team");
    expect(source).toContain("Case-team review eligible");
  });
});
