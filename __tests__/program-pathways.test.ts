import { getProgramById, getProgramMonth, getProgramMonths, getProgramWeek, programs } from "../lib/data/programs";

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
    expect(getProgramWeek(reunification!, 24, 1)?.lessons[0]?.title).toContain("emotional safety");

    expect(homeAgain?.title).toBe("Home Again Program");
    expect(homeAgain?.durationMonths).toBe(12);
    expect(getProgramMonths(homeAgain!)).toHaveLength(12);
    expect(getProgramMonth(homeAgain!, 1)?.topic).toBe("Returning Home Safely");
    expect(getProgramMonth(homeAgain!, 12)?.topic).toBe("Sustaining Home Again Success");
    expect(getProgramWeek(homeAgain!, 1, 1)?.lessons[0]?.title).toContain("home feel predictable");
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
});
