const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const sourcePath = path.join(repoRoot, "data", "courses", "fathers", "father-course.full.json");
const outputPath = path.join(repoRoot, "lib", "data", "strongFathersCourse.ts");

function main() {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing source file: ${sourcePath}`);
  }

  const course = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  const lessonCount = course.modules.reduce((total, module) => total + module.lessons.length, 0);

  const output = `import type { StandaloneCourse } from "./courses";

export type StrongFathersLesson = {
  id: string;
  slug: string;
  title: string;
  lessonNumber: number;
  estimatedMinutes: number;
  lessonType: string;
  summary: string;
  learningOutcomes: string[];
  startQuestions: string[];
  content: Array<{
    heading: string;
    body: string;
  }>;
  activities: Array<{
    id: string;
    title: string;
    type: string;
    instructions: string[];
    saveToRecord: boolean;
  }>;
  quiz: {
    id: string;
    passingScorePercent: number;
    questions: Array<{
      id: string;
      question: string;
      options: string[];
      correctAnswerIndex: number;
      explanation: string;
    }>;
  };
  reflection: {
    required: boolean;
    prompts: string[];
  };
  evidenceUpload: {
    required: boolean;
    acceptedTypes: string[];
    prompts: string[];
  };
  caseNotePrompt: string;
  tags: string[];
};

export type StrongFathersModule = {
  id: string;
  slug: string;
  title: string;
  moduleNumber: number;
  description: string;
  estimatedHours: number;
  required: boolean;
  lessons: StrongFathersLesson[];
};

export type StrongFathersCourse = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  version: string;
  status: string;
  audience: string[];
  durationOptions: Array<Record<string, string | number>>;
  description: string;
  principles: string[];
  dashboardSections: string[];
  scoreAreas: Array<{
    id: string;
    title: string;
    weight: number;
    indicators: string[];
  }>;
  moduleFiles: string[];
  totalModules: number;
  totalLessons: number;
  modules: StrongFathersModule[];
};

export const strongFathersCourse: StrongFathersCourse = ${JSON.stringify(course, null, 2)};

export const strongFathersStandaloneCourse: StandaloneCourse = {
  id: strongFathersCourse.id,
  title: strongFathersCourse.title,
  description: strongFathersCourse.description,
  lessons: strongFathersCourse.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({
      lessonNumber: (module.moduleNumber - 1) * 100 + lesson.lessonNumber,
      title: lesson.title,
      durationMinutes: lesson.estimatedMinutes,
      summary: lesson.summary,
      content: {
        whyItMatters: lesson.summary,
        parentMeaningPrompt: lesson.startQuestions[0],
        stepsTitle: module.title,
        steps: lesson.content.map((section) => ({
          title: section.heading,
          body: section.body,
          prompt: lesson.reflection.prompts[0] ?? lesson.startQuestions[0],
        })),
      },
    })),
  ),
};

export const strongFathersLessonCount = ${lessonCount};
`;

  fs.writeFileSync(outputPath, output, "utf8");
  console.log(`Wrote ${lessonCount} father pathway lessons to ${path.relative(repoRoot, outputPath)}`);
}

main();
