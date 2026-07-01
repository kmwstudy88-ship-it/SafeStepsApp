export type CourseLesson = {
  lessonNumber: number;
  title: string;
  durationMinutes: number;
  summary?: string;
  content?: {
    whyItMatters: string;
    parentMeaningPrompt?: string;
    validationIs?: string[];
    validationIsNot?: string[];
    example?: {
      insteadOf: string;
      trySaying: string;
    };
    steps?: {
      title: string;
      body: string;
      prompt: string;
    }[];
  };
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
      {
        lessonNumber: 3,
        title: "Validating Emotions",
        durationMinutes: 30,
        summary: "Validation means acknowledging someone's feelings as real, important, and understandable.",
        content: {
          whyItMatters:
            "When we validate emotions, we build trust, deepen connection, and help others feel seen and supported.",
          parentMeaningPrompt:
            "What does validating emotions mean for you, your child, and the way you want your family to feel during hard moments?",
          validationIs: [
            "Acknowledging the feeling",
            "Showing understanding",
            "Accepting the emotion without judgment",
          ],
          validationIsNot: [
            "Agreeing with the behavior",
            "Giving advice or solutions too soon",
            "Dismissing or minimizing their feelings",
          ],
          example: {
            insteadOf: "You're overreacting.",
            trySaying: "It makes sense that you're feeling that way.",
          },
          steps: [
            {
              title: "Notice",
              body: "Pay attention to the emotion.",
              prompt: "What are they feeling?",
            },
            {
              title: "Acknowledge",
              body: "Name the feeling and show you understand.",
              prompt: "Use reflective, supportive language.",
            },
            {
              title: "Support",
              body: "Offer comfort and stay present.",
              prompt: "You don't need to fix it - just be there.",
            },
          ],
        },
      },
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
