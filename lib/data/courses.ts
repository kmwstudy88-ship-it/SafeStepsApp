export type CourseLesson = {
  lessonNumber: number;
  title: string;
  durationMinutes: number;
};

export type StandaloneCourse = {
  id: string;
  title: string;
  description: string;
  lessons: CourseLesson[];
};

export const courses: StandaloneCourse[] = [
  {
    id: "communication-skills",
    title: "Communication Skills",
    description: "Standalone course teaching core communication skills.",
    lessons: [
      { lessonNumber: 1, title: "What is Communication?", durationMinutes: 30 },
      { lessonNumber: 2, title: "Active Listening", durationMinutes: 30 },
      { lessonNumber: 3, title: "Body Language", durationMinutes: 30 },
      { lessonNumber: 4, title: "Conflict Resolution", durationMinutes: 30 },
      { lessonNumber: 5, title: "Repairing Communication", durationMinutes: 30 }
    ]
  },
  {
    id: "child-development-foundations",
    title: "Child Development Foundations",
    description: "Standalone course covering child milestones, development, and parenting expectations.",
    lessons: [
      { lessonNumber: 1, title: "What is Child Development?", durationMinutes: 30 },
      { lessonNumber: 2, title: "Understanding Child Milestones", durationMinutes: 30 },
      { lessonNumber: 3, title: "Brain Development in Children", durationMinutes: 30 },
      { lessonNumber: 4, title: "Attachment and Bonding", durationMinutes: 30 }
    ]
  }
];

export function getCourseById(courseId: string) {
  return courses.find((course) => course.id === courseId) ?? null;
}

export function areAllCourseLessonsViewed(course: StandaloneCourse, viewedLessons: Record<number, boolean>) {
  return course.lessons.every((lesson) => viewedLessons[lesson.lessonNumber]);
}
