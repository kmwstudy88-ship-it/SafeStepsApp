import {
  PARENT_INTAKE_SECTION_KEYS,
  PARENT_INTAKE_TOTAL_SECTIONS,
  calculateParentIntakePercent,
  getNextParentIntakeSection,
  getParentIntakeResumeSection,
  getParentIntakeValidationError,
  splitParentIntakeLines,
} from "../lib/engines/parentIntakePolicy";

describe("parent intake policy", () => {
  test("contains the agreed twelve save-and-resume sections", () => {
    expect(PARENT_INTAKE_TOTAL_SECTIONS).toBe(12);
    expect(PARENT_INTAKE_SECTION_KEYS).toEqual([
      "about_you",
      "cultural_identity",
      "communication_preferences",
      "family_household",
      "children",
      "parenting_circumstances",
      "child_safety_court",
      "current_strengths",
      "support_needs",
      "immediate_safety",
      "goals_program",
      "review",
    ]);
  });

  test("resumes the saved incomplete section", () => {
    expect(
      getParentIntakeResumeSection(["about_you"], "communication_preferences"),
    ).toBe("communication_preferences");
  });

  test("moves to the first incomplete section when the saved section is complete", () => {
    expect(
      getParentIntakeResumeSection(
        ["about_you", "cultural_identity"],
        "cultural_identity",
      ),
    ).toBe("communication_preferences");
  });

  test("never moves beyond the review section", () => {
    expect(getNextParentIntakeSection("review")).toBe("review");
  });

  test("requires only fields that are not explicitly optional", () => {
    expect(getParentIntakeValidationError("about_you", {})).toContain(
      "Name shown in SafeSteps",
    );
    expect(
      getParentIntakeValidationError("about_you", {
        displayName: "Katrina",
        preferredName: "",
        phone: "",
      }),
    ).toBeNull();
  });

  test("calculates progress from unique valid sections only", () => {
    expect(calculateParentIntakePercent(["about_you", "about_you", "unknown"])).toBe(
      8,
    );
    expect(calculateParentIntakePercent([...PARENT_INTAKE_SECTION_KEYS])).toBe(100);
  });

  test("normalises child and goal lists from lines or commas", () => {
    expect(splitParentIntakeLines("Ayla\nSage, Alex")).toEqual([
      "Ayla",
      "Sage",
      "Alex",
    ]);
  });
});
