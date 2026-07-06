import { safestepsLessonCurriculum1To47 } from "./data/safestepsLessonCurriculum1To47";
import { safestepsLessonCurriculum48To95 } from "./data/safestepsLessonCurriculum48To95";
import { safestepsExpandedLessonCurriculum252To780 } from "./data/safestepsExpandedLessonCurriculum252To780";
import { oneDriveLessonLibrary } from "./data/oneDriveLessonLibrary";
import { oneDriveDeepLessonLibrary } from "./data/oneDriveDeepLessonLibrary";

export type AppLesson = {
  id: string;
  week: number;
  title: string;
  summary: string;
  estimatedMinutes: number;
  sections: Array<{
    heading: string;
    body: string;
  }>;
  actions: string[];
};

const starterLessons: AppLesson[] = [
  {
    id: "safety-planning-basics",
    week: 1,
    title: "Safety planning basics",
    summary: "Create a simple plan for what to do when stress rises or things feel unsafe.",
    estimatedMinutes: 15,
    sections: [
      {
        heading: "What this step is for",
        body: "A safety plan is a practical set of choices made before a hard moment. It helps you act early, reduce risk, and show that you are thinking ahead.",
      },
      {
        heading: "Start small",
        body: "Choose one warning sign, one calming action, one safe person, and one place to go if the situation becomes too much.",
      },
      {
        heading: "Record the proof",
        body: "When you use your plan, save a short note in SafeSteps. The point is not perfection. The point is showing what you noticed and what you did next.",
      },
    ],
    actions: [
      "Write down one personal warning sign.",
      "Choose one safe support person.",
      "Add one evidence note after using the plan.",
    ],
  },
  {
    id: "understanding-weekly-goals",
    week: 1,
    title: "Understanding weekly goals",
    summary: "Turn broad expectations into clear weekly actions you can complete and record.",
    estimatedMinutes: 12,
    sections: [
      {
        heading: "Why weekly goals matter",
        body: "Large case goals can feel vague. Weekly goals make progress visible by turning the bigger plan into something you can do, save, and explain.",
      },
      {
        heading: "Make the goal observable",
        body: "A strong weekly goal answers: What will I do? When will I do it? What proof will show it happened?",
      },
      {
        heading: "Keep the record fair",
        body: "If something blocks the goal, record that too. A fair record includes effort, barriers, support requested, and the next step.",
      },
    ],
    actions: [
      "Choose one goal for this week.",
      "Attach one task to that goal.",
      "Save evidence when the task is complete.",
    ],
  },
  {
    id: "parenting-strengths-and-stress",
    week: 2,
    title: "Parenting strengths and stress points",
    summary: "Identify what is already working and where extra support is needed.",
    estimatedMinutes: 18,
    sections: [
      {
        heading: "Start with strengths",
        body: "Progress is easier to build when you know what is already working. A strength may be showing up, asking for help, keeping appointments, or repairing after conflict.",
      },
      {
        heading: "Name the stress point",
        body: "A stress point is not a failure. It is a place where a plan, support, or different routine is needed.",
      },
      {
        heading: "Link strengths to evidence",
        body: "Use SafeSteps to save examples of what you are doing well: attendance, routines, positive contact, clean tests, certificates, messages, and notes.",
      },
    ],
    actions: [
      "Write one parenting strength.",
      "Write one stress point.",
      "Choose one support or routine that could help this week.",
    ],
  },
  {
    id: "building-evidence-for-progress",
    week: 2,
    title: "Building evidence for progress",
    summary: "Save records in a way that tells a clear, steady story of change.",
    estimatedMinutes: 16,
    sections: [
      {
        heading: "Evidence is a timeline",
        body: "One document can help, but a steady timeline is stronger. Evidence should show what happened, when it happened, and why it matters.",
      },
      {
        heading: "Use plain labels",
        body: "Give each item a clear title like 'Parenting course certificate', 'Visit attended', or 'Safety plan used'.",
      },
      {
        heading: "Add context",
        body: "A short note helps future readers understand the evidence. Include the action, the date, and the progress it shows.",
      },
    ],
    actions: [
      "Upload or write one evidence item.",
      "Add a plain title.",
      "Add a note explaining why it matters.",
    ],
  },
];

const foundationCurriculumLessons: AppLesson[] = safestepsLessonCurriculum1To47.map((lesson) => ({
  id: `foundation-${lesson.slug}`,
  week: lesson.id,
  title: lesson.title,
  summary: lesson.learningPurpose,
  estimatedMinutes: lesson.durationMinutes.recommended,
  sections: [
    {
      heading: "Before you begin",
      body: lesson.beforeQuestion,
    },
    {
      heading: "Teaching transcript",
      body: lesson.transcript,
    },
    {
      heading: "Practice activity",
      body: lesson.practiceActivity,
    },
    {
      heading: "Knowledge check",
      body: `${lesson.quiz.question} ${lesson.quiz.answer}. ${lesson.quiz.explanation}`,
    },
    {
      heading: "Evidence task",
      body: lesson.evidenceTask,
    },
  ],
  actions: [
    ...lesson.learningOutcomes,
    lesson.changeInUnderstandingQuestion,
    lesson.afterQuestion,
  ],
}));

const productionCurriculumLessons: AppLesson[] = safestepsLessonCurriculum48To95.map((lesson) => ({
  id: lesson.slug,
  week: lesson.lessonNumber,
  title: lesson.title,
  summary: lesson.learningPurpose,
  estimatedMinutes: lesson.durationMinutes.recommended,
  sections: [
    {
      heading: "Before you begin",
      body: lesson.beforeQuestion,
    },
    {
      heading: "Teaching transcript",
      body: lesson.teachingTranscript,
    },
    {
      heading: "Knowledge check",
      body: `${lesson.knowledgeCheck.question} ${lesson.knowledgeCheck.suggestedAnswer}`,
    },
    {
      heading: "Evidence task",
      body: lesson.evidenceTask,
    },
  ],
  actions: [
    ...lesson.learningOutcomes,
    lesson.practiceActivity,
    lesson.afterQuestion,
  ],
}));

const expandedCurriculumLessons: AppLesson[] = safestepsExpandedLessonCurriculum252To780.map((lesson, index) => ({
  id: lesson.slug || lesson.id,
  week: 3000 + index + 1,
  title: lesson.title,
  summary: lesson.learningPurpose,
  estimatedMinutes: lesson.standardDurationMinutes,
  sections: [
    {
      heading: "Before you begin",
      body: lesson.beforeQuestion,
    },
    {
      heading: "Teaching transcript",
      body: lesson.teachingTranscript,
    },
    {
      heading: "Practice activities",
      body: [lesson.lessonPlan, lesson.practiceActivities].filter(Boolean).join("\n\n"),
    },
    {
      heading: "Knowledge check",
      body: lesson.knowledgeCheck,
    },
    {
      heading: "Evidence task",
      body: lesson.evidenceTask,
    },
  ],
  actions: [
    ...lesson.learningOutcomes,
    lesson.reflectionQuestions,
    lesson.afterQuestion,
  ].filter(Boolean),
}));

const oneDriveLessons: AppLesson[] = oneDriveLessonLibrary.map((lesson, index) => ({
  id: lesson.id,
  week: 1000 + index + 1,
  title: lesson.title,
  summary: lesson.summary,
  estimatedMinutes: lesson.estimatedMinutes,
  sections: [
    {
      heading: "Overview",
      body: lesson.summary,
    },
    {
      heading: "Key concepts",
      body: lesson.keyConcepts.join(" "),
    },
    {
      heading: "Facilitator notes",
      body: lesson.facilitatorNotes.join(" "),
    },
    {
      heading: "Printable summary",
      body: lesson.printableSummary,
    },
  ],
  actions: [
    ...lesson.learningOutcomes,
    ...lesson.practiceActivities,
    ...lesson.reflectionPrompts,
  ],
}));

const oneDriveDeepLessons: AppLesson[] = oneDriveDeepLessonLibrary.map((lesson, index) => ({
  id: lesson.id,
  week: 2000 + index + 1,
  title: lesson.title,
  summary: lesson.summary,
  estimatedMinutes: lesson.estimatedMinutes,
  sections: lesson.sections.flatMap((section) => [
    {
      heading: section.title,
      body: [
        section.overview,
        section.psychoeducation,
        section.simplifiedParentVersion,
      ].filter(Boolean).join("\n\n"),
    },
    {
      heading: `${section.title}: Practice`,
      body: [
        ...section.stepByStep,
        ...section.parentScripts,
        ...section.practicalExamples,
      ].join("\n\n"),
    },
    {
      heading: `${section.title}: Safety`,
      body: [
        ...section.safetyRedFlags,
        ...section.safetyEscalation,
      ].join("\n\n"),
    },
  ]),
  actions: lesson.sections.flatMap((section) => [
    ...section.learningGoals,
    ...section.practiceIdeas,
    ...section.reflectionQuestions,
  ]),
}));

export const appLessons: AppLesson[] = [
  ...starterLessons,
  ...foundationCurriculumLessons,
  ...productionCurriculumLessons,
  ...expandedCurriculumLessons,
  ...oneDriveLessons,
  ...oneDriveDeepLessons,
];

export function getLessonById(lessonId: string) {
  return appLessons.find((lesson) => lesson.id === lessonId) ?? null;
}
