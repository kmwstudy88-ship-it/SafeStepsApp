import { getProgramById, getProgramMonth, getProgramMonths, getProgramWeek, programs } from "../lib/data/programs";

describe("program pathway data", () => {
  test("keeps authored months when present", () => {
    const program = programs.find((item) => item.id === "keeping-families-together");

    expect(program).toBeDefined();
    expect(getProgramMonths(program!).length).toBe(program!.months.length);
    expect(getProgramMonth(program!, 1)?.topic).toBe("Communication");
  });

  test("generates month and week content for programs without authored months", () => {
    const program = programs.find((item) => item.id === "back-on-track");

    expect(program).toBeDefined();
    expect(getProgramMonths(program!)).toHaveLength(program!.durationMonths);
    expect(getProgramMonth(program!, 1)?.weeks).toHaveLength(4);
    expect(getProgramWeek(program!, 1, 1)?.lessons).toHaveLength(5);
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
