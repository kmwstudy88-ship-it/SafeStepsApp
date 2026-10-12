export type Lesson = {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  duration: number; // minutes
};

export type Course = {
  id: string;
  title: string;
  description: string;
  category: "safety" | "emergency" | "parenting" | "health";
  duration: number; // total minutes
  lessons: Lesson[];
  createdAt: number;
  updatedAt: number;
};
