import {
  getCustomProgramPathways,
  getLaunchPrograms,
  getStructuredDraftPrograms,
  programs,
} from "../lib/data/programs";
import { courses } from "../curriculum/courses";
import { safestepsParentChallenges } from "../lib/data/safestepsParentChallenges";

describe("program curation metadata", () => {
  test("separates official launch programs from drafts and custom pathways", () => {
    expect(getLaunchPrograms().map((program) => program.id)).toEqual([
      "intensive-reunification",
      "home-again",
    ]);

    expect(getStructuredDraftPrograms().map((program) => program.id)).toEqual([
      "keeping-families-together",
      "back-on-track",
      "build-stronger-families",
      "child-safety-contact",
    ]);

    expect(getCustomProgramPathways().map((program) => program.id)).toEqual([
      "custom-program",
    ]);
  });

  test("every program has a visible curation label and note", () => {
    for (const program of programs) {
      expect(program.launchLabel.length).toBeGreaterThan(3);
      expect(program.curationNote.length).toBeGreaterThan(20);
    }
  });

  test("verifies current content inventory counts used by curation", () => {
    const lessonCount = courses.reduce((total, course) => total + course.lessons.length, 0);

    expect(programs).toHaveLength(7);
    expect(courses).toHaveLength(39);
    expect(lessonCount).toBe(385);
    expect(safestepsParentChallenges).toHaveLength(104);
  });

  test("every program has actionable routing and review rules", () => {
    for (const program of programs) {
      expect(program.curation.targetCohort.length).toBeGreaterThan(20);
      expect(program.curation.entryCriteria.length).toBeGreaterThanOrEqual(3);
      expect(program.curation.assessmentTriggers.length).toBeGreaterThanOrEqual(3);
      expect(program.curation.lessonSequencingStrategy.length).toBeGreaterThan(30);
      expect(program.curation.deduplicationStrategy.length).toBeGreaterThan(30);
      expect(program.curation.challengeAssignmentRules.length).toBeGreaterThanOrEqual(1);
      expect(program.curation.taskReflectionEvidenceProgressFlow.length).toBeGreaterThanOrEqual(5);
      expect(program.curation.completionRules.length).toBeGreaterThanOrEqual(3);
      expect(program.curation.transitionRules.length).toBeGreaterThanOrEqual(3);
    }
  });

  test("fully curates the four structured draft programs without promoting them to launch", () => {
    const draftPrograms = getStructuredDraftPrograms();

    expect(draftPrograms).toHaveLength(4);
    for (const program of draftPrograms) {
      expect(program.launchStatus).toBe("structured_draft");
      expect(program.curation.requiredCourseIds.length).toBeGreaterThanOrEqual(2);
      expect(program.curation.assessmentAssignedCourses.length).toBeGreaterThanOrEqual(2);
      expect(program.curation.challengeAssignmentRules[0].excludeWhen.length).toBeGreaterThanOrEqual(2);
      expect(program.curation.challengeAssignmentRules[0].evidenceExpectation.length).toBeGreaterThan(20);
    }
  });

  test("keeps the custom pathway assessment-led instead of bulk assigned", () => {
    const customProgram = getCustomProgramPathways()[0];

    expect(customProgram.curation.requiredCourseIds).toEqual([]);
    expect(customProgram.curation.assessmentAssignedCourses.length).toBeGreaterThanOrEqual(3);
    expect(customProgram.curation.lessonSequencingStrategy).toContain("assessed priorities");
  });
});
