import courseJson from '../../lessons/understanding_harm.json';

export type CourseChoice = {
  id: string;
  text: string;
  score: number;
  correct?: boolean;
  feedback?: string;
};

export type CourseQuestion = {
  id: string;
  competencyId?: string;
  prompt: string;
  hint?: string;
  choices: CourseChoice[];
};

export type CourseLesson = {
  id: string;
  title: string;
  durationMinutes: number;
  content: {
    title: string;
    overview: string;
    psychoeducation: string;
    learning_goals: string[];
    step_by_step: string[];
    parent_scripts: string[];
    practical_examples: string[];
    reflection_questions: string[];
    practice_ideas: string[];
    closing_message: string;
  };
  facilitator: {
    openingScript: string;
    teachingPrompts: string[];
    feedback: {
      strong: string;
      developing: string;
      remediation: string;
    };
  };
  activities: Array<{
    id: string;
    type: string;
    title: string;
    instructions: string;
    completionPrompt: string;
  }>;
  scenario: CourseQuestion;
  quiz: CourseQuestion[];
  homePractice: string;
  safety_guidance: {
    red_flags: string[];
    when_to_escalate: string[];
  };
};

export type UnderstandingHarmCourse = {
  id: string;
  courseId: string;
  title: string;
  version: number;
  level: string;
  durationMinutes: number;
  description: string;
  reviewStatus: {
    status: string;
    label: string;
    requiredReviews: string[];
    learnerNotice: string;
  };
  learningOutcomes: string[];
  competencies: Array<{
    id: string;
    name: string;
    requiredScore: number;
  }>;
  sections: CourseLesson[];
  finalAssessment: {
    title: string;
    passMark: number;
    attemptsAllowed: number;
    questions: CourseQuestion[];
  };
  remediation: {
    principles: string[];
  };
  safetyControls: {
    immediateTriggers: string[];
    responseSequence: string[];
    boundaries: string[];
  };
  certificate: {
    title: string;
    disclaimer: string;
  };
};

export const UNDERSTANDING_HARM_COURSE =
  courseJson as unknown as UnderstandingHarmCourse;

