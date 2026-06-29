import type { CheckpointBlock, LessonFlowStep } from "./types";

export const LESSON_FLOW_STEPS: LessonFlowStep[] = [
  "reflection",
  "content",
  "checkpoint",
  "scenario",
  "practice",
  "end_reflection",
];

export function getNextLessonStep(current: LessonFlowStep): LessonFlowStep | null {
  const index = LESSON_FLOW_STEPS.indexOf(current);
  if (index < 0 || index === LESSON_FLOW_STEPS.length - 1) return null;
  return LESSON_FLOW_STEPS[index + 1];
}

export function getPreviousLessonStep(current: LessonFlowStep): LessonFlowStep | null {
  const index = LESSON_FLOW_STEPS.indexOf(current);
  if (index <= 0) return null;
  return LESSON_FLOW_STEPS[index - 1];
}

export function normaliseAnswer(value: string): string {
  return value.trim().toLowerCase();
}

export function isCheckpointCorrect(checkpoint: CheckpointBlock | null | undefined, answer: string): boolean | null {
  if (!checkpoint?.correctAnswer) return null;
  return normaliseAnswer(checkpoint.correctAnswer) === normaliseAnswer(answer);
}

export function stepLabel(step: LessonFlowStep): string {
  const labels: Record<LessonFlowStep, string> = {
    reflection: "Start reflection",
    content: "Lesson content",
    checkpoint: "Checkpoint",
    scenario: "Scenario",
    practice: "Practice task",
    end_reflection: "End reflection",
  };
  return labels[step];
}