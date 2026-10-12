import fs from "fs";
import path from "path";

describe("contact progression review screen", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "app", "assessment-system", "contact-progression-review.tsx"),
    "utf8",
  );

  test("loads generated recommendations and saves separate caseworker overrides", () => {
    expect(source).toContain("fetchLatestReunificationRecommendation");
    expect(source).toContain("saveReunificationOverride");
    expect(source).toContain("Decision record saved separately from the generated recommendation.");
  });

  test("does not present contact progression as an automatic stage change", () => {
    expect(source).toContain("This screen will not change contact stage without a separate caseworker override record.");
    expect(source).toContain("Review generated reunification stage recommendations");
    expect(source).toContain("caseworker decision");
  });
});
