import fs from "fs";
import path from "path";

describe("interactive video course screen copy", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "components", "InteractiveVideoCourseScreen.tsx"),
    "utf8",
  );

  test("uses learner-friendly preview video copy instead of raw production file paths", () => {
    expect(source).toContain("Video preview in use");
    expect(source).toContain("temporary preview video");
    expect(source).toContain("reflections and quiz answers can still be saved");
    expect(source).not.toContain("Expected video:");
    expect(source).not.toContain("Caption file:");
    expect(source).not.toContain("Production asset review required");
  });
});
