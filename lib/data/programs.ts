export const programs = [
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
