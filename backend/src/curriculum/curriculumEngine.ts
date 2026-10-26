import { type CurriculumInput, type CurriculumOutput, type Module, type Lesson } from "./curriculumTypes";

/**
 * Utility: create a lesson
 */
const makeLesson = (data: Omit<Lesson, "id"> & { id?: string }): Lesson => ({
  id: data.id ?? crypto.randomUUID(),
  title: data.title,
  objective: data.objective,
  activities: data.activities,
  duration: data.duration
});

/**
 * Utility: create a module
 */
const makeModule = (data: Omit<Module, "id"> & { id?: string }): Module => ({
  id: data.id ?? crypto.randomUUID(),
  title: data.title,
  lessons: data.lessons
});

/**
 * Age‑based lesson expansion
 */
const ageBasedLessons = (age: number): Lesson[] => {
  if (age <= 6) {
    return [
      makeLesson({
        title: "Understanding Feelings",
        objective: "Help the child identify basic emotions.",
        activities: ["Feelings flashcards", "Emotion faces game"],
        duration: 10
      }),
      makeLesson({
        title: "Safe vs Unsafe Touch",
        objective: "Teach the child simple body safety rules.",
        activities: ["Body boundaries song", "Safe/unsafe sorting game"],
        duration: 10
      })
    ];
  }

  if (age <= 10) {
    return [
      makeLesson({
        title: "Recognizing Unsafe Situations",
        objective: "Teach the child how to spot danger.",
        activities: ["Scenario cards", "Role‑play responses"],
        duration: 15
      }),
      makeLesson({
        title: "Trusted Adults",
        objective: "Help the child identify who they can go to for help.",
        activities: ["Draw trusted adults", "Emergency contact list"],
        duration: 15
      })
    ];
  }

  return [
    makeLesson({
      title: "Digital Safety Basics",
      objective: "Teach safe online behavior.",
      activities: ["Password game", "Safe vs unsafe messages"],
      duration: 20
    }),
    makeLesson({
      title: "Assertive Communication",
      objective: "Teach the child how to say no and seek help.",
      activities: ["Boundary‑setting practice", "Confidence role‑play"],
      duration: 20
    })
  ];
};

/**
 * Risk‑level expansion
 */
const riskLevelModules = (risk: CurriculumInput["riskLevel"]): Module[] => {
  if (risk === "low") return [];

  if (risk === "medium") {
    return [
      makeModule({
        title: "Safety Planning",
        lessons: [
          makeLesson({
            title: "Identifying Safe Places",
            objective: "Teach the child where to go when unsafe.",
            activities: ["Safe place map", "Practice routes"],
            duration: 20
          })
        ]
      })
    ];
  }

  // high risk
  return [
    makeModule({
      title: "High‑Risk Safety Skills",
      lessons: [
        makeLesson({
          title: "Emergency Plan",
          objective: "Create a step‑by‑step safety plan.",
          activities: ["Practice calling emergency services", "Safe exit routes"],
          duration: 30
        }),
        makeLesson({
          title: "Recognizing Grooming",
          objective: "Teach the child early warning signs.",
          activities: ["Scenario discussion", "Boundary reinforcement"],
          duration: 25
        })
      ]
    })
  ];
};

/**
 * Goal‑based expansion
 */
const goalModules = (goals: string[]): Module[] => {
  const modules: Module[] = [];

  if (goals.includes("emotional-regulation")) {
    modules.push(
      makeModule({
        title: "Emotional Regulation",
        lessons: [
          makeLesson({
            title: "Calming Techniques",
            objective: "Teach the child how to self‑regulate.",
            activities: ["Breathing exercises", "Feelings chart"],
            duration: 15
          })
        ]
      })
    );
  }

  if (goals.includes("confidence-building")) {
    modules.push(
      makeModule({
        title: "Confidence & Self‑Advocacy",
        lessons: [
          makeLesson({
            title: "Speaking Up",
            objective: "Teach the child how to express needs clearly.",
            activities: ["Voice practice", "Assertiveness role‑play"],
            duration: 20
          })
        ]
      })
    );
  }

  return modules;
};

/**
 * Main curriculum generator
 */
export function generateCurriculum(input: CurriculumInput): CurriculumOutput {
  const { childAge, riskLevel, goals } = input;

  const baseModule = makeModule({
    title: "Safety Basics",
    lessons: [
      makeLesson({
        title: "Identifying Safe Adults",
        objective: "Teach the child who they can trust.",
        activities: ["Draw safe adults", "Role‑play asking for help"],
        duration: 20
      }),
      ...ageBasedLessons(childAge)
    ]
  });

  const modules: Module[] = [
    baseModule,
    ...riskLevelModules(riskLevel),
    ...goalModules(goals)
  ];

  return {
    modules,
    generatedAt: new Date().toISOString()
  };
}
