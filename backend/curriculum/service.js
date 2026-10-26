'use strict';

const crypto = require('node:crypto');

function validateCurriculumInput(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw Object.assign(new Error('Invalid curriculum input: must be an object'), { statusCode: 400 });
  }

  const childAge = Number(data.childAge);
  if (!Number.isFinite(childAge) || childAge < 0 || childAge > 25) {
    throw Object.assign(new Error('Invalid curriculum input: childAge must be a valid age number (0-25)'), { statusCode: 400 });
  }

  const riskLevel = String(data.riskLevel || '').toLowerCase();
  if (!['low', 'medium', 'high'].includes(riskLevel)) {
    throw Object.assign(new Error("Invalid curriculum input: riskLevel must be 'low', 'medium', or 'high'"), { statusCode: 400 });
  }

  const goals = Array.isArray(data.goals) ? data.goals.map((g) => String(g).trim()).filter(Boolean) : [];

  return { childAge, riskLevel, goals };
}

function makeLesson({ id, title, objective, activities = [], duration = 15 }) {
  return {
    id: id || crypto.randomUUID(),
    title,
    objective,
    activities,
    duration,
  };
}

function makeModule({ id, title, lessons = [] }) {
  return {
    id: id || crypto.randomUUID(),
    title,
    lessons,
  };
}

function ageBasedLessons(age) {
  if (age <= 6) {
    return [
      makeLesson({
        title: 'Understanding Feelings',
        objective: 'Help the child identify basic emotions.',
        activities: ['Feelings flashcards', 'Emotion faces game'],
        duration: 10,
      }),
      makeLesson({
        title: 'Safe vs Unsafe Touch',
        objective: 'Teach the child simple body safety rules.',
        activities: ['Body boundaries song', 'Safe/unsafe sorting game'],
        duration: 10,
      }),
    ];
  }

  if (age <= 10) {
    return [
      makeLesson({
        title: 'Recognizing Unsafe Situations',
        objective: 'Teach the child how to spot danger.',
        activities: ['Scenario cards', 'Role-play responses'],
        duration: 15,
      }),
      makeLesson({
        title: 'Trusted Adults',
        objective: 'Help the child identify who they can go to for help.',
        activities: ['Draw trusted adults', 'Emergency contact list'],
        duration: 15,
      }),
    ];
  }

  return [
    makeLesson({
      title: 'Digital Safety Basics',
      objective: 'Teach safe online behavior.',
      activities: ['Password game', 'Safe vs unsafe messages'],
      duration: 20,
    }),
    makeLesson({
      title: 'Assertive Communication',
      objective: 'Teach the child how to say no and seek help.',
      activities: ['Boundary-setting practice', 'Confidence role-play'],
      duration: 20,
    }),
  ];
}

function riskLevelModules(risk) {
  if (risk === 'low') return [];

  if (risk === 'medium') {
    return [
      makeModule({
        title: 'Safety Planning',
        lessons: [
          makeLesson({
            title: 'Identifying Safe Places',
            objective: 'Teach the child where to go when feeling unsafe or worried.',
            activities: ['Safe place map', 'Practice routes'],
            duration: 20,
          }),
        ],
      }),
    ];
  }

  // high risk
  return [
    makeModule({
      title: 'High-Risk Safety Skills',
      lessons: [
        makeLesson({
          title: 'Emergency Plan',
          objective: 'Create a step-by-step safety plan.',
          activities: ['Practice calling emergency services', 'Safe exit routes'],
          duration: 30,
        }),
        makeLesson({
          title: 'Recognizing Grooming & Coercion',
          objective: 'Teach the child early warning signs and boundary reinforcement.',
          activities: ['Scenario discussion', 'Boundary reinforcement'],
          duration: 25,
        }),
      ],
    }),
  ];
}

function goalModules(goals) {
  const modules = [];

  if (goals.includes('emotional-regulation')) {
    modules.push(
      makeModule({
        title: 'Emotional Regulation',
        lessons: [
          makeLesson({
            title: 'Calming Techniques',
            objective: 'Teach the child how to self-regulate.',
            activities: ['Breathing exercises', 'Feelings chart'],
            duration: 15,
          }),
        ],
      }),
    );
  }

  if (goals.includes('confidence-building')) {
    modules.push(
      makeModule({
        title: 'Confidence & Self-Advocacy',
        lessons: [
          makeLesson({
            title: 'Speaking Up',
            objective: 'Teach the child how to express needs clearly.',
            activities: ['Voice practice', 'Assertiveness role-play'],
            duration: 20,
          }),
        ],
      }),
    );
  }

  return modules;
}

function generateCurriculum(input) {
  const validated = validateCurriculumInput(input);
  const { childAge, riskLevel, goals } = validated;

  const baseModule = makeModule({
    title: 'Safety Basics',
    lessons: [
      makeLesson({
        title: 'Identifying Safe Adults',
        objective: 'Teach the child who they can trust.',
        activities: ['Draw safe adults', 'Role-play asking for help'],
        duration: 20,
      }),
      ...ageBasedLessons(childAge),
    ],
  });

  const modules = [
    baseModule,
    ...riskLevelModules(riskLevel),
    ...goalModules(goals),
  ];

  return {
    modules,
    generatedAt: new Date().toISOString(),
    decisionSupportOnly: true,
    humanReviewRequired: true,
  };
}

module.exports = {
  validateCurriculumInput,
  generateCurriculum,
};
