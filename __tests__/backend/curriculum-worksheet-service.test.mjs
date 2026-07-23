import {
  beforeEach,
  expect,
  test,
} from '@jest/globals';

import {
  computeNextWorksheetsForUser,
  getUserCurriculumState,
  getWorksheetById,
  listImportedWorksheetLots,
  listStandaloneActivityLibrary,
  listWorksheetDefinitions,
  parentActivityLibrarySections,
  resetCurriculumWorksheetStore,
  resultContextCategories,
  scoreWorksheet,
  standaloneActivityFilters,
  submitWorksheetInstance,
} from '../../backend/Services/CurriculumWorksheets/CurriculumWorksheetService.js';

beforeEach(() => {
  resetCurriculumWorksheetStore();
});

test('fetches a single worksheet without exposing answer keys', () => {
  const worksheet = getWorksheetById('sequence-safe-response-001');
  const serialized = JSON.stringify(worksheet);

  expect(worksheet.id).toBe('sequence-safe-response-001');
  expect(worksheet.availability).toEqual({
    standalone: true,
    curriculum: true,
    assigned: true,
  });
  expect(worksheet.curriculumLinks[0]).toMatchObject({
    programId: 'keeping-families-together',
    lessonId: 'grounding-before-responding',
    required: true,
    displayOrder: 4,
  });
  expect(worksheet.standaloneSettings).toMatchObject({
    listedInLibrary: true,
    allowUnlimitedPractice: true,
    showAnswerExplanations: true,
    affectsProgramCompletion: false,
  });
  expect(worksheet.items).toHaveLength(6);
  expect(serialized).not.toContain('correctPosition');
  expect(serialized).not.toContain('distractor');
  expect(serialized).not.toContain('score');
});

test('submits responses and computes a stored score', () => {
  const submitted = submitWorksheetInstance(
    'sequence-safe-response-001',
    {
      userId: 'user-001',
      launchContext: 'curriculum',
      programId: 'keeping-families-together',
      lessonId: 'grounding-before-responding',
      responses: {
        orderedStepIds: ['check-safety', 'approach-calmly', 'listen-acknowledge', 'choose-calming', 'discuss-solutions'],
        excludedStepIds: ['demand-details'],
      },
    },
    {
      instanceId: 'instance-001',
      submittedAt: '2026-07-23T00:00:00.000Z',
    },
  );

  expect(submitted.instance.status).toBe('submitted');

  const score = scoreWorksheet(
    'sequence-safe-response-001',
    { instanceId: 'instance-001' },
    {
      scoreId: 'score-001',
      scoredAt: '2026-07-23T00:01:00.000Z',
    },
  );

  expect(score).toMatchObject({
    id: 'score-001',
    userId: 'user-001',
    launchContext: 'curriculum',
    lessonId: 'grounding-before-responding',
    isRequiredAttempt: true,
    countsTowardProgram: true,
    usedForFormalReporting: 'Yes, with context',
    rawScore: 12,
    maxScore: 12,
    percentageScore: 100,
    passed: true,
  });
});

test('returns current curriculum state and computes next work', () => {
  expect(getUserCurriculumState('user-002').currentWorksheetId).toBe('sequence-safe-response-001');

  const submitted = submitWorksheetInstance(
    'sequence-safe-response-001',
    {
      userId: 'user-002',
      launchContext: 'curriculum',
      programId: 'keeping-families-together',
      lessonId: 'grounding-before-responding',
      responses: {
        orderedStepIds: ['check-safety', 'approach-calmly', 'listen-acknowledge', 'choose-calming', 'discuss-solutions'],
        excludedStepIds: ['demand-details'],
      },
    },
    { instanceId: 'instance-002' },
  );

  scoreWorksheet('sequence-safe-response-001', { instanceId: submitted.instance.id }, { scoreId: 'score-002' });

  const state = getUserCurriculumState('user-002');
  const next = computeNextWorksheetsForUser('user-002');

  expect(state.completedWorksheetIds).toEqual(['sequence-safe-response-001']);
  expect(state.currentWorksheetId).toBe('reflection-feelings-001');
  expect(next.nextWorksheets[0].id).toBe('reflection-feelings-001');
});

test('imports lot 1 worksheet JSON into sanitized reflection worksheets', () => {
  const lots = listImportedWorksheetLots();
  const worksheet = getWorksheetById('worksheet-001');
  const serialized = JSON.stringify(worksheet);

  expect(lots).toEqual([
    {
      id: 'lot-001',
      range: [1, 200],
      source: 'backend/Services/CurriculumWorksheets/worksheetLots/lot-001-worksheets-001-200.json',
      count: 3,
    },
  ]);
  expect(listWorksheetDefinitions().map((item) => item.id)).toEqual(
    expect.arrayContaining(['worksheet-001', 'worksheet-002', 'worksheet-003']),
  );
  expect(worksheet).toMatchObject({
    id: 'worksheet-001',
    sourceNumericId: 1,
    sourceLotId: 'lot-001',
    type: 'reflection',
    title: 'Emotional Awareness Check',
    domain: 'emotional_awareness',
    category: 'emotional_awareness',
    difficulty: 'intro',
    tags: ['emotion', 'awareness', 'daily'],
    availability: {
      standalone: true,
      curriculum: false,
      assigned: true,
    },
  });
  expect(worksheet.prompts.map((prompt) => prompt.fieldId)).toEqual([
    'emotion_felt',
    'emotion_cause',
    'emotion_response',
  ]);
  expect(serialized).not.toContain('"score"');
});

test('publishes standalone library sections, filters, and result categories', () => {
  expect(parentActivityLibrarySections).toEqual([
    'My Program',
    'Assessment and Activity Library',
    'Recommended for Me',
    'Continue an Activity',
    'Practice by Topic',
    'My Results and Growth',
  ]);
  expect(standaloneActivityFilters).toEqual(
    expect.arrayContaining(['Sequence knowledge', 'Definition matching', 'Self-reflections', 'Full assessments']),
  );
  expect(resultContextCategories).toContainEqual({
    resultType: 'Optional stand-alone practice',
    countsTowardProgram: false,
    usedForFormalReporting: 'Only as voluntary learning history',
  });
  expect(listStandaloneActivityLibrary({ type: 'reflection' }).map((item) => item.id)).toEqual(
    expect.arrayContaining(['worksheet-001', 'worksheet-002', 'worksheet-003']),
  );
});

test('keeps standalone practice out of required program completion while offering transfer when identical', () => {
  const submitted = submitWorksheetInstance(
    'sequence-safe-response-001',
    {
      userId: 'user-004',
      launchContext: 'standalone',
      responses: {
        orderedStepIds: ['check-safety', 'approach-calmly', 'listen-acknowledge', 'choose-calming', 'discuss-solutions'],
        excludedStepIds: ['demand-details'],
      },
    },
    { instanceId: 'instance-004' },
  );

  expect(submitted.instance).toMatchObject({
    launchContext: 'standalone',
    programEnrollmentId: null,
    lessonId: null,
    isRequiredAttempt: false,
    resultCategory: 'Optional stand-alone practice',
  });

  const score = scoreWorksheet('sequence-safe-response-001', { instanceId: submitted.instance.id }, { scoreId: 'score-004' });
  const state = getUserCurriculumState('user-004');

  expect(score).toMatchObject({
    countsTowardProgram: false,
    usedForFormalReporting: 'Only as voluntary learning history',
    transferOffer: {
      available: true,
      message: 'Use this result toward my program',
    },
  });
  expect(score.transferOffer.eligibleCurriculumLinks[0]).toMatchObject({
    lessonId: 'grounding-before-responding',
    willSatisfyRequirement: true,
    requiresFreshAttempt: false,
  });
  expect(state.completedWorksheetIds).toEqual([]);
  expect(state.currentWorksheetId).toBe('sequence-safe-response-001');
});

test('submits and scores imported lot reflection worksheets', () => {
  const submitted = submitWorksheetInstance(
    'worksheet-002',
    {
      userId: 'user-003',
      responses: {
        stress_trigger: 'A rushed morning and missed transport made the day feel pressured.',
        stress_effect: 'I became quieter and less patient during routines.',
        stress_plan: 'I can prepare bags earlier and pause before responding.',
      },
    },
    { instanceId: 'instance-003' },
  );

  const score = scoreWorksheet('worksheet-002', { instanceId: submitted.instance.id }, { scoreId: 'score-003' });

  expect(score).toMatchObject({
    worksheetId: 'worksheet-002',
    userId: 'user-003',
    rawScore: 30,
    maxScore: 30,
    percentageScore: 100,
    passed: true,
  });
});
