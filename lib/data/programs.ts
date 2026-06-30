export type ProgramLesson = {
  day: number;
  title: string;
  durationMinutes: number;
  requiresStartReflection: boolean;
  requiresKnowledgeCheckpoint: boolean;
  requiresScenarioCheckpoint: boolean;
  requiresPracticalActivity: boolean;
  requiresEndReflection: boolean;
};

export type ProgramWeek = {
  weekNumber: number;
  subTopic: string;
  startReflectionRequired: boolean;
  endReflectionRequired: boolean;
  lessons: ProgramLesson[];
};

export type ProgramMonth = {
  monthNumber: number;
  topic: string;
  startReflectionRequired: boolean;
  endReflectionRequired: boolean;
  weeks: ProgramWeek[];
};

export type ProgramPathway = {
  id: string;
  title: string;
  durationMonths: number;
  description: string;
  months: ProgramMonth[];
};

const generatedTopics = [
  "Communication",
  "Child Development",
  "Positive Parenting",
  "Attachment and Bonding",
  "Emotional Regulation",
  "Behaviour Management",
  "Child Safety",
  "Protective Parenting",
  "Family Routines",
  "Co-Parenting",
  "Reunification Parenting",
  "Trauma-Informed Parenting",
];

const generatedWeekFocus = [
  "Understanding the topic",
  "Practising the skill",
  "Using the skill under pressure",
  "Reviewing growth and next steps",
];

const generatedLessonFocus = [
  "What this means to my family",
  "What I already do well",
  "What gets difficult",
  "A safer way to practise",
  "What changed this week",
];

function createGeneratedLesson(day: number, topic: string, focus: string): ProgramLesson {
  return {
    day,
    title: `${topic}: ${focus}`,
    durationMinutes: 30,
    requiresStartReflection: true,
    requiresKnowledgeCheckpoint: true,
    requiresScenarioCheckpoint: true,
    requiresPracticalActivity: true,
    requiresEndReflection: true,
  };
}

function createGeneratedMonth(monthNumber: number): ProgramMonth {
  const topic = generatedTopics[(monthNumber - 1) % generatedTopics.length];

  return {
    monthNumber,
    topic,
    startReflectionRequired: true,
    endReflectionRequired: true,
    weeks: generatedWeekFocus.map((focus, index) => ({
      weekNumber: index + 1,
      subTopic: `${topic}: ${focus}`,
      startReflectionRequired: true,
      endReflectionRequired: true,
      lessons: generatedLessonFocus.map((lessonFocus, lessonIndex) =>
        createGeneratedLesson(lessonIndex + 1, topic, lessonFocus),
      ),
    })),
  };
}

export function getProgramMonths(program: ProgramPathway) {
  if (program.months.length > 0) return program.months;

  const totalMonths = program.durationMonths > 0 ? program.durationMonths : 1;
  return Array.from({ length: totalMonths }, (_, index) => createGeneratedMonth(index + 1));
}

export function getProgramMonth(program: ProgramPathway, monthNumber: number) {
  return getProgramMonths(program).find((month) => month.monthNumber === monthNumber) ?? null;
}

export function getProgramWeek(program: ProgramPathway, monthNumber: number, weekNumber: number) {
  return getProgramMonth(program, monthNumber)?.weeks.find((week) => week.weekNumber === weekNumber) ?? null;
}

export const programs: ProgramPathway[] = [
  {
    id: "keeping-families-together",
    title: "Keeping Families Together",
    durationMonths: 18,
    description: "High-risk family support program focused on stability, safety, parenting growth, evidence of change, and long-term family preservation.",
    months: [
      {
        monthNumber: 1,
        topic: "Communication",
        startReflectionRequired: true,
        endReflectionRequired: true,
        weeks: [
          {
            weekNumber: 1,
            subTopic: "Understanding Communication",
            startReflectionRequired: true,
            endReflectionRequired: true,
            lessons: [
              { day: 1, title: "What is Communication?", durationMinutes: 30, requiresStartReflection: true, requiresKnowledgeCheckpoint: true, requiresScenarioCheckpoint: true, requiresPracticalActivity: true, requiresEndReflection: true },
              { day: 2, title: "Active Listening", durationMinutes: 30, requiresStartReflection: true, requiresKnowledgeCheckpoint: true, requiresScenarioCheckpoint: true, requiresPracticalActivity: true, requiresEndReflection: true },
              { day: 3, title: "Understanding Body Language", durationMinutes: 30, requiresStartReflection: true, requiresKnowledgeCheckpoint: true, requiresScenarioCheckpoint: true, requiresPracticalActivity: true, requiresEndReflection: true },
              { day: 4, title: "Speaking Respectfully", durationMinutes: 30, requiresStartReflection: true, requiresKnowledgeCheckpoint: true, requiresScenarioCheckpoint: true, requiresPracticalActivity: true, requiresEndReflection: true },
              { day: 5, title: "Repairing Communication After Conflict", durationMinutes: 30, requiresStartReflection: true, requiresKnowledgeCheckpoint: true, requiresScenarioCheckpoint: true, requiresPracticalActivity: true, requiresEndReflection: true }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "back-on-track",
    title: "Back on Track",
    durationMonths: 12,
    description: "Medium-risk family support program focused on parenting skills, routines, emotional regulation, and safer family functioning.",
    months: []
  },
  {
    id: "build-stronger-families",
    title: "Build Stronger Families",
    durationMonths: 6,
    description: "Low-risk early support program focused on strengthening parenting confidence, connection, routines, and communication.",
    months: []
  },
  {
    id: "child-safety-contact",
    title: "Child Safety Contact Program",
    durationMonths: 3,
    description: "12-week structured program for anyone currently involved with Child Safety.",
    months: []
  },
  {
    id: "custom-program",
    title: "Specialised Personal Custom Program",
    durationMonths: 0,
    description: "Flexible program pathway tailored to family needs, goals, risk level, and support requirements.",
    months: []
  }
];

export function getProgramById(programId: string) {
  return programs.find((program) => program.id === programId) ?? null;
}
