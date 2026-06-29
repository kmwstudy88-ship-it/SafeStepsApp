export type ProgramType = {
  id: string;
  title: string;
  durationMonths: number;
  description: string;
  months: ProgramMonth[];
};

export type ProgramMonth = {
  monthNumber: number;
  topic: string;
  startReflectionRequired: boolean;
  endReflectionRequired: boolean;
  weeks: ProgramWeek[];
};

export type ProgramWeek = {
  weekNumber: number;
  subTopic: string;
  startReflectionRequired: boolean;
  endReflectionRequired: boolean;
  lessons: ProgramLesson[];
};

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

export type CourseType = {
  id: string;
  title: string;
  description: string;
  lessons: CourseLesson[];
};

export type CourseLesson = {
  lessonNumber: number;
  title: string;
  durationMinutes: number;
};
