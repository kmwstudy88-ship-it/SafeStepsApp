import fs from "fs";
import path from "path";
import { getProgramById, getProgramMonths } from "../lib/data/programs";

describe("my programs duration copy", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "app", "programs", "my-programs.tsx"), "utf8");
  const programSource = fs.readFileSync(path.join(__dirname, "..", "app", "programs", "program.tsx"), "utf8");

  test("describes intensive reunification as a 24-month pathway, not a 12-week program", () => {
    const program = getProgramById("intensive-reunification");

    expect(program).not.toBeNull();
    expect(program?.durationMonths).toBe(24);
    expect(getProgramMonths(program!).reduce((total, month) => total + month.weeks.length, 0)).toBe(96);
    expect(source).toContain("intensive reunification pathway");
    expect(source).toContain("structured plan");
    expect(source).not.toContain("A 12-week program for parents and children");
    expect(source).not.toContain("Week 4 of 12");
  });

  test("describes Home Again using its return-home duration", () => {
    const program = getProgramById("home-again");

    expect(program).not.toBeNull();
    expect(program?.durationMonths).toBe(12);
    expect(getProgramMonths(program!).reduce((total, month) => total + month.weeks.length, 0)).toBe(48);
    expect(source).toContain("return-home transition pathway");
    expect(source).not.toContain("12-week program");
  });

  test("does not show stale fixed progress totals or 2025 sample dates", () => {
    [
      "Lesson 4 of 12",
      "of 36",
      "42% Completed",
      "28%",
      "33%",
      "May 14, 2025",
      "Aug 6, 2025",
      "Stronger Together",
      "Building lifelong connection",
      "Parent Name",
      "Strengthen Empathy",
      "Due in 5 days",
      "Personalized based on your progress",
      "Lesson 5 • Communication",
      "Lesson 3 • Emotional Well-being",
      "Improve listening skills to build trust and understanding.",
      "Great job staying consistent!",
      'label === "Messages" ? <Text style={styles.navBadge}>2</Text>',
    ].forEach((staleCopy) => {
      expect(source).not.toContain(staleCopy);
    });
  });

  test("does not default to a program before a real enrollment exists", () => {
    expect(source).not.toContain("?? programs[0]");
    expect(source).toContain("if (!active) return null");
    expect(source).toContain("{selectedProgram ? (");
  });

  test("does not auto-activate intensive reunification before intake and enrollment", () => {
    expect(programSource).not.toContain("programStarted || isIntensiveReunification");
    expect(programSource).not.toContain("06/07/2026");
    expect(programSource).toContain("programStarted && intakeComplete");
    expect(programSource).toContain("before this program can be started or continued");
  });
});
