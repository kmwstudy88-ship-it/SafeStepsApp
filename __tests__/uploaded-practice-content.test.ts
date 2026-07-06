import { safestepsParentChallenges } from "../lib/data/safestepsParentChallenges";
import { safestepsExpandedLessonCurriculum252To780 } from "../lib/data/safestepsExpandedLessonCurriculum252To780";
import { safestepsLessonCurriculum1To47 } from "../lib/data/safestepsLessonCurriculum1To47";
import { safestepsReflectionWorksheets } from "../lib/data/safestepsReflectionWorksheets";
import {
  getReflectionWorksheetById,
  safestepsReflectionWorksheets as exportedReflectionWorksheets,
} from "../lib/engines/reflectionEngine";

describe("uploaded SafeSteps practice content", () => {
  test("imports the parent challenge pack", () => {
    expect(safestepsParentChallenges).toHaveLength(104);
    expect(safestepsParentChallenges[0]).toEqual(
      expect.objectContaining({
        id: "SS-PC-001",
        title: "Connection Check-In",
        evidenceTask: expect.any(String),
      }),
    );
  });

  test("imports the foundation lesson bundle", () => {
    expect(safestepsLessonCurriculum1To47).toHaveLength(47);
    expect(safestepsLessonCurriculum1To47[0]).toEqual(
      expect.objectContaining({
        id: 1,
        title: "Active Listening",
        slug: "active-listening",
        evidenceTask: expect.any(String),
      }),
    );
    expect(safestepsLessonCurriculum1To47.at(-1)).toEqual(
      expect.objectContaining({
        id: 47,
        title: "Communication Without Conflict",
        slug: "communication-without-conflict",
      }),
    );

    for (const lesson of safestepsLessonCurriculum1To47) {
      expect(lesson.learningOutcomes.length).toBeGreaterThanOrEqual(1);
      expect(lesson.transcript.length).toBeGreaterThan(50);
      expect(lesson.quiz.question.length).toBeGreaterThan(10);
      expect(lesson.durationMinutes.minimum).toBeGreaterThan(0);
    }
  });

  test("imports the expanded 30 to 40 minute lesson batches", () => {
    expect(safestepsExpandedLessonCurriculum252To780).toHaveLength(528);

    const firstLesson = safestepsExpandedLessonCurriculum252To780[0];
    const finalLesson = safestepsExpandedLessonCurriculum252To780.at(-1);

    expect(firstLesson).toEqual(
      expect.objectContaining({
        id: "SS-30-40-001",
        title: "Communication roadblocks",
        standardDurationMinutes: 35,
      }),
    );
    expect(finalLesson).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        title: expect.any(String),
        beforeQuestion: expect.any(String),
        evidenceTask: expect.any(String),
      }),
    );

    for (const lesson of safestepsExpandedLessonCurriculum252To780) {
      expect(lesson.learningOutcomes.length).toBeGreaterThanOrEqual(1);
      expect(lesson.teachingTranscript.length).toBeGreaterThan(50);
      expect(lesson.afterQuestion.length).toBeGreaterThan(10);
    }
  });

  test("imports the reflection worksheet templates", () => {
    expect(safestepsReflectionWorksheets).toHaveLength(50);
    expect(exportedReflectionWorksheets).toHaveLength(50);

    const worksheet = getReflectionWorksheetById("ws_011_triggers-and-choices");
    expect(worksheet?.title).toBe("Triggers and choices");
    expect(worksheet?.fields.map((field) => field.key)).toEqual([
      "trigger",
      "auto_reaction",
      "alternative_choice",
    ]);
  });
});
