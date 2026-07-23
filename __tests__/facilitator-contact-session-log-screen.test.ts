import fs from "fs";
import path from "path";

describe("facilitator contact session log screen", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "app", "facilitator", "contact-session-log.tsx"),
    "utf8",
  );

  test("captures the contact-progression signals used by the reunification engine", () => {
    [
      "childComfortScore",
      "childDistressScore",
      "parentRegulationScore",
      "facilitatorInterventionCount",
      "facilitatorUnsafeToEscalate",
      "riskFlags",
      "skillEvidence",
    ].forEach((field) => expect(source).toContain(field));
  });

  test("frames contact logging as review evidence rather than automatic stage change", () => {
    expect(source).toContain("These records support review; they do not change contact stage automatically.");
    expect(source).toContain("Contact session saved for caseworker review and progression analysis.");
  });
});
