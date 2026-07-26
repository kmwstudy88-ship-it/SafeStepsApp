import { getProgramById, getProgramMonth, getProgramMonths, getProgramWeek, programs } from "../lib/data/programs";
import { getProgramWeekPlan } from "../lib/platformData";

describe("program pathway data", () => {
  test("generates curated months for Keeping Families Together", () => {
    const program = programs.find((item) => item.id === "keeping-families-together");

    expect(program).toBeDefined();
    expect(program!.months).toHaveLength(0);
    expect(getProgramMonths(program!)).toHaveLength(18);
    expect(getProgramMonth(program!, 1)?.topic).toBe("Immediate Safety and Family Preservation");
    expect(getProgramMonth(program!, 18)?.topic).toBe("Transition to Maintenance Support");
  });

  test("generates curated month and week content for programs without authored months", () => {
    const program = programs.find((item) => item.id === "back-on-track");

    expect(program).toBeDefined();
    expect(getProgramMonths(program!)).toHaveLength(program!.durationMonths);
    expect(getProgramMonth(program!, 1)?.topic).toBe("Resetting Family Priorities");
    expect(getProgramMonth(program!, 12)?.topic).toBe("Maintenance and Early Warning Signs");
    expect(getProgramMonth(program!, 1)?.weeks).toHaveLength(4);
    expect(getProgramWeek(program!, 1, 1)?.lessons).toHaveLength(5);
  });

  test("curates the short draft programs with their own month topics", () => {
    const buildStrongerFamilies = getProgramById("build-stronger-families");
    const childSafetyContact = getProgramById("child-safety-contact");

    expect(getProgramMonths(buildStrongerFamilies!)).toHaveLength(6);
    expect(getProgramMonth(buildStrongerFamilies!, 6)?.topic).toBe("Family Maintenance Plan");

    expect(getProgramMonths(childSafetyContact!)).toHaveLength(3);
    expect(getProgramMonth(childSafetyContact!, 1)?.topic).toBe("Understanding Current Child Safety Expectations");
    expect(getProgramMonth(childSafetyContact!, 3)?.topic).toBe("Next-Step Planning and Review");
  });

  test("includes reunification and home again pathways", () => {
    const reunification = getProgramById("intensive-reunification");
    const homeAgain = getProgramById("home-again");

    expect(reunification?.title).toBe("24-Month Intensive Reunification Program");
    expect(reunification?.durationMonths).toBe(24);
    expect(getProgramMonths(reunification!)).toHaveLength(24);
    expect(getProgramMonth(reunification!, 24)?.topic).toBe("Celebrating the Reunification Journey");
    expect(getProgramMonths(reunification!).flatMap((month) => month.weeks.flatMap((week) => week.lessons))).toHaveLength(672);
    expect(getProgramWeek(reunification!, 24, 1)?.lessons).toHaveLength(7);
    expect(getProgramWeek(reunification!, 24, 1)?.lessons[0]?.title).toContain("current reunification expectation");

    expect(homeAgain?.title).toBe("Home Again Program");
    expect(homeAgain?.durationMonths).toBe(12);
    expect(getProgramMonths(homeAgain!)).toHaveLength(12);
    expect(getProgramMonth(homeAgain!, 1)?.topic).toBe("Returning Home Safely");
    expect(getProgramMonth(homeAgain!, 12)?.topic).toBe("Sustaining Home Again Success");
    expect(getProgramWeek(homeAgain!, 1, 1)?.lessons[0]?.title).toContain("home feel predictable");
  });

  test("matches the 24-month intensive reunification page routing summary", () => {
    const reunification = getProgramById("intensive-reunification");

    expect(reunification?.curation.riskLevel).toBe("very_high");
    expect(reunification?.curation.reviewCadence).toBe("Weekly reflection, monthly review, 12-week worker review");
    expect(reunification?.curation.entryCriteria).toEqual([
      "Child not living with parent",
      "Reunification goal active",
      "Worker review confirms suitability",
    ]);
    expect(reunification?.curation.requiredCourseIds).toEqual([
      "parent-safety-and-stability",
      "child-safety-foundations",
      "protective-parenting-foundations",
      "demonstrating-change-self-managed-safety",
    ]);
    expect(reunification?.curation.assessmentAssignedCourses).toHaveLength(3);
    expect(reunification?.curation.taskReflectionEvidenceProgressFlow).toEqual([
      "Assessment identifies priority domains",
      "Program month sets the focus",
      "Lesson reflection names parent meaning",
      "Challenge creates a real-world task",
      "Evidence upload documents practice",
      "Progress indicators update during review",
    ]);
  });

  test("generates one setup month for custom programs", () => {
    const program = programs.find((item) => item.id === "custom-program");

    expect(program).toBeDefined();
    expect(getProgramMonths(program!)).toHaveLength(1);
  });

  test("finds programs by id without falling back to another program", () => {
    expect(getProgramById("back-on-track")?.title).toBe("Back on Track");
    expect(getProgramById("missing-program")).toBeNull();
  });

  test("builds the runtime 24-month intensive reunification week plans", () => {
    const firstWeek = getProgramWeekPlan("intensive-reunification", 1);
    const finalWeek = getProgramWeekPlan("intensive-reunification", 96);
    const outOfRange = getProgramWeekPlan("intensive-reunification", 105);

    expect(firstWeek?.monthNumber).toBe(1);
    expect(firstWeek?.monthTopic).toBe("Beginning the Reunification Journey");
    expect(firstWeek?.dailyLessons).toHaveLength(7);
    expect(firstWeek?.dailyLessons[5]?.title).toContain("Record factual evidence of safe change");
    expect(firstWeek?.evidencePrompt).toContain("safety expectation");

    expect(finalWeek?.monthNumber).toBe(24);
    expect(finalWeek?.monthTopic).toBe("Celebrating the Reunification Journey");
    expect(finalWeek?.dailyLessons).toHaveLength(7);
    expect(outOfRange).toBeNull();
  });
});
