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

const reunificationMonthTopics = [
  "Beginning the Reunification Journey",
  "Safety, Accountability, and Trust",
  "Repairing Parent-Child Connection",
  "Predictable Parenting Time",
  "Preparing for Increased Contact",
  "Parenting Time Transitions",
  "Re-Establishing Family Identity",
  "Full-Time Family Adjustment",
  "Long-Term Family Stability",
  "Family Communication Practice",
  "Problem-Solving Skills",
  "Sustaining Reunification Progress",
  "Strengthening Trust After Reunification",
  "Building Long-Term Routines",
  "Supporting Emotional Development",
  "Guiding Behaviour With Safety",
  "Managing Stress and Setbacks",
  "Deepening Parent-Child Connection",
  "Strengthening Long-Term Safety",
  "Supporting Family Growth",
  "Long-Term Emotional Stability",
  "Life Skills and Independence",
  "Future-Focused Family Planning",
  "Celebrating the Reunification Journey",
];

const reunificationWeekFocus = [
  "Building safety and predictability",
  "Understanding your child's needs",
  "Practising calm support under pressure",
  "Reflecting on growth and next steps",
];

const reunificationLessonFocus = [
  "Strengthening emotional safety",
  "Supporting your child through change",
  "Building predictable routines",
  "Helping your child adjust",
  "Reflecting on this week's progress",
];

const homeAgainMonthTopics = [
  "Returning Home Safely",
  "Settling Into Home Routines",
  "Rebuilding Trust at Home",
  "Supporting Child Adjustment",
  "Managing Stress After Return Home",
  "Strengthening Family Communication",
  "Keeping Home Stable",
  "Repairing Connection After Setbacks",
  "Building Confidence in Daily Parenting",
  "Preparing for Long-Term Stability",
  "Reviewing Progress and Support Needs",
  "Sustaining Home Again Success",
];

const homeAgainWeekFocus = [
  "Creating safety at home",
  "Supporting routines and adjustment",
  "Practising repair and connection",
  "Reviewing stability and next steps",
];

const homeAgainLessonFocus = [
  "Making home feel predictable",
  "Supporting your child's feelings",
  "Practising a calm parenting response",
  "Building evidence of safe change",
  "Reflecting on home stability this week",
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

function createProgramLesson(day: number, topic: string, focus: string): ProgramLesson {
  return {
    day,
    title: `${focus} during ${topic.toLowerCase()}`,
    durationMinutes: 30,
    requiresStartReflection: true,
    requiresKnowledgeCheckpoint: true,
    requiresScenarioCheckpoint: true,
    requiresPracticalActivity: true,
    requiresEndReflection: true,
  };
}

function createReunificationLesson(day: number, topic: string, focus: string): ProgramLesson {
  return createProgramLesson(day, topic, focus);
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

function createReunificationMonth(monthNumber: number): ProgramMonth {
  const topic = reunificationMonthTopics[monthNumber - 1] ?? `Reunification Month ${monthNumber}`;

  return {
    monthNumber,
    topic,
    startReflectionRequired: true,
    endReflectionRequired: true,
    weeks: reunificationWeekFocus.map((focus, index) => ({
      weekNumber: index + 1,
      subTopic: `${topic}: ${focus}`,
      startReflectionRequired: true,
      endReflectionRequired: true,
      lessons: reunificationLessonFocus.map((lessonFocus, lessonIndex) =>
        createReunificationLesson(lessonIndex + 1, topic, lessonFocus),
      ),
    })),
  };
}

function createHomeAgainMonth(monthNumber: number): ProgramMonth {
  const topic = homeAgainMonthTopics[monthNumber - 1] ?? `Home Again Month ${monthNumber}`;

  return {
    monthNumber,
    topic,
    startReflectionRequired: true,
    endReflectionRequired: true,
    weeks: homeAgainWeekFocus.map((focus, index) => ({
      weekNumber: index + 1,
      subTopic: `${topic}: ${focus}`,
      startReflectionRequired: true,
      endReflectionRequired: true,
      lessons: homeAgainLessonFocus.map((lessonFocus, lessonIndex) =>
        createProgramLesson(lessonIndex + 1, topic, lessonFocus),
      ),
    })),
  };
}

export function getProgramMonths(program: ProgramPathway) {
  if (program.months.length > 0) return program.months;

  const totalMonths = program.durationMonths > 0 ? program.durationMonths : 1;
  if (program.id === "intensive-reunification") {
    return Array.from({ length: totalMonths }, (_, index) => createReunificationMonth(index + 1));
  }

  if (program.id === "home-again") {
    return Array.from({ length: totalMonths }, (_, index) => createHomeAgainMonth(index + 1));
  }

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
    id: "intensive-reunification",
    title: "24-Month Intensive Reunification Program",
    durationMonths: 24,
    description: "Long-term reunification pathway for parents working toward safe, sustained family restoration after serious child safety concerns.",
    months: []
  },
  {
    id: "home-again",
    title: "Home Again Program",
    durationMonths: 12,
    description: "6-12 month reunification transition pathway focused on rebuilding safe routines, home stability, connection, and child adjustment after return home.",
    months: []
  },
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
