export interface Lesson {
  id: string;
  title: string;
  objective: string;
  activities: string[];
  duration: number;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface CurriculumInput {
  childAge: number;
  riskLevel: "low" | "medium" | "high";
  goals: string[];
}

export interface CurriculumOutput {
  modules: Module[];
  generatedAt: string;
}
