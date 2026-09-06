export type SequenceKnowledgeClientItemKind = "ordered_step" | "leave_out";

export type SequenceKnowledgeClientItem = {
  id: string;
  text: string;
  kind: SequenceKnowledgeClientItemKind;
};

export type SequenceKnowledgeClientAssessment = {
  id: string;
  questionNumber: number;
  totalQuestions: number;
  label: string;
  title: string;
  scenario: string;
  instruction: string;
  domain: string;
  contextLabel: string;
  progress: number;
  items: SequenceKnowledgeClientItem[];
};

export type SequenceKnowledgeSubmission = {
  assessmentId: string;
  orderedStepIds: string[];
  excludedStepIds: string[];
  submittedAt: string;
};

export const sequenceKnowledgeClientAssessment: SequenceKnowledgeClientAssessment = {
  id: "SEQ-0001",
  questionNumber: 12,
  totalQuestions: 50,
  label: "Sequence Knowledge",
  title: "What should happen first?",
  scenario:
    "You are supporting an infant whose emotions are rising at home. Arrange the safe response and leave out actions that do not belong.",
  instruction: "Arrange the safe response and leave out actions that do not belong.",
  domain: "Emotional regulation",
  contextLabel: "Infant at home",
  progress: 0.24,
  items: [
    {
      id: "SEQ-0001-C3",
      text: "Use a suitable breathing, grounding or body-based strategy",
      kind: "ordered_step",
    },
    {
      id: "SEQ-0001-C1",
      text: "Notice signs that emotions are rising",
      kind: "ordered_step",
    },
    {
      id: "SEQ-0001-C5",
      text: "Discuss what happened and agree on the next helpful step",
      kind: "ordered_step",
    },
    {
      id: "SEQ-0001-C4",
      text: "Reconnect once calm is returning",
      kind: "ordered_step",
    },
    {
      id: "SEQ-0001-C2",
      text: "Pause the interaction and make sure everyone has safe space",
      kind: "ordered_step",
    },
    {
      id: "SEQ-0001-D1",
      text: "Threaten a consequence to force calm",
      kind: "leave_out",
    },
  ],
};

export function getSequenceKnowledgeClientAssessment() {
  return sequenceKnowledgeClientAssessment;
}

export function buildSequenceKnowledgeSubmission(
  assessmentId: string,
  orderedItems: Pick<SequenceKnowledgeClientItem, "id">[],
  excludedItems: Pick<SequenceKnowledgeClientItem, "id">[],
  submittedAt = new Date().toISOString(),
): SequenceKnowledgeSubmission {
  return {
    assessmentId,
    orderedStepIds: orderedItems.map((item) => item.id),
    excludedStepIds: excludedItems.map((item) => item.id),
    submittedAt,
  };
}
