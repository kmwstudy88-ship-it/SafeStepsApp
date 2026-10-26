const fs = require("fs");
const os = require("os");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const sourcePath = path.join(
  os.homedir(),
  "Downloads",
  "NEW READY TO UPLOAD Courses &  Content",
  "LESSONS",
  "safesteps_lessons_1_to_47.json",
);
const outputPath = path.join(repoRoot, "lib", "data", "safestepsLessonCurriculum1To47.ts");

function main() {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing source file: ${sourcePath}`);
  }

  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  if (!Array.isArray(source.lessons)) {
    throw new Error("Expected source.lessons to be an array.");
  }

  const output = `export type SafeStepsFoundationLesson = {
  id: number;
  title: string;
  slug: string;
  learningPurpose: string;
  learningOutcomes: string[];
  transcript: string;
  practiceActivity: string;
  quiz: {
    question: string;
    answer: string;
    explanation: string;
  };
  evidenceTask: string;
  durationMinutes: {
    minimum: number;
    recommended: number;
    extended: number;
  };
  beforeQuestion: string;
  afterQuestion: string;
  changeInUnderstandingQuestion: string;
  completionRecordQuestions: string[];
  completionStatement: string;
};

export const safestepsLessonCurriculum1To47: SafeStepsFoundationLesson[] = ${JSON.stringify(source.lessons, null, 2)};
`;

  fs.writeFileSync(outputPath, output, "utf8");
  console.log(`Wrote ${source.lessons.length} lessons to ${path.relative(repoRoot, outputPath)}`);
}

main();
