import fs from "fs";
import path from "path";

describe("SafeSteps database verification script", () => {
  const script = fs.readFileSync(
    path.join(__dirname, "..", "SafeStepsTools", "Invoke-SafeStepsDatabase.ps1"),
    "utf8",
  );

  test("checks normalized reunification, contact, quest, and achievement tables", () => {
    [
      "cases",
      "profile_cases",
      "contact_sessions",
      "facilitator_observations",
      "quests",
      "quest_progress",
      "achievements",
      "user_achievements",
      "reunification_recommendations",
      "reunification_overrides",
    ].forEach((tableName) => {
      expect(script).toContain(`"${tableName}"`);
    });
  });
});
