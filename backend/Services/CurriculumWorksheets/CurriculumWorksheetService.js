import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const WORKSHEET_SCHEMA_VERSION = '2026-07-23';
const lot001Source = 'backend/Services/CurriculumWorksheets/worksheetLots/lot-001-worksheets-001-200.json';
const lot001Worksheets = JSON.parse(readFileSync(fileURLToPath(new URL('./worksheetLots/lot-001-worksheets-001-200.json', import.meta.url)), 'utf8'));
const launchContexts = new Set(['curriculum', 'standalone', 'assigned', 'recommended', 'formal_assessment']);

export const parentActivityLibrarySections = [
  'My Program',
  'Assessment and Activity Library',
  'Recommended for Me',
  'Continue an Activity',
  'Practice by Topic',
  'My Results and Growth',
];

export const standaloneActivityFilters = [
  'Multiple choice',
  'Sequence knowledge',
  'Fill in the blanks',
  'Definition matching',
  'Scenarios',
  'Sorting activities',
  'True or false',
  'Self-reflections',
  'Practical skill checks',
  'Full assessments',
];

export const resultContextCategories = [
  {
    resultType: 'Optional stand-alone practice',
    countsTowardProgram: false,
    usedForFormalReporting: 'Only as voluntary learning history',
  },
  {
    resultType: 'Curriculum knowledge check',
    countsTowardProgram: true,
    usedForFormalReporting: 'Yes, with context',
  },
  {
    resultType: 'Worker-assigned activity',
    countsTowardProgram: 'Only if linked',
    usedForFormalReporting: 'Yes',
  },
  {
    resultType: 'Parent self-assessment',
    countsTowardProgram: false,
    usedForFormalReporting: 'With parent consent and context',
  },
  {
    resultType: 'Formal assessment',
    countsTowardProgram: 'According to assessment rules',
    usedForFormalReporting: 'Yes',
  },
  {
    resultType: 'Practical evidence task',
    countsTowardProgram: 'When verified',
    usedForFormalReporting: 'Yes',
  },
];

const defaultAvailability = {
  standalone: true,
  curriculum: false,
  assigned: true,
};

const defaultStandaloneSettings = {
  listedInLibrary: true,
  allowUnlimitedPractice: true,
  showAnswerExplanations: true,
  affectsProgramCompletion: false,
};

const authoredWorksheets = [
  {
    id: 'sequence-safe-response-001',
    type: 'sequence',
    title: 'Safe response order',
    category: 'emotional_regulation',
    domain: 'emotional_regulation',
    availability: {
      standalone: true,
      curriculum: true,
      assigned: true,
    },
    curriculumLinks: [
      {
        programId: 'keeping-families-together',
        moduleId: 'emotional-regulation',
        weekId: 'recognising-warning-signs',
        lessonId: 'grounding-before-responding',
        required: true,
        displayOrder: 4,
      },
    ],
    standaloneSettings: defaultStandaloneSettings,
    estimatedMinutes: 8,
    prompt: 'A child arrives home upset after a conflict with a friend.',
    instructions: 'Arrange the safe response steps and leave out the action that does not belong.',
    items: [
      { id: 'check-safety', text: 'Check whether the child is immediately safe', correctPosition: 1, score: 2 },
      { id: 'approach-calmly', text: 'Approach calmly and offer reassurance', correctPosition: 2, score: 2 },
      { id: 'listen-acknowledge', text: 'Listen and acknowledge their experience', correctPosition: 3, score: 2 },
      { id: 'choose-calming', text: 'Help the child choose a calming strategy', correctPosition: 4, score: 2 },
      { id: 'discuss-solutions', text: 'Discuss solutions once the child feels safer', correctPosition: 5, score: 2 },
      {
        id: 'demand-details',
        text: 'Ask the child to explain every detail immediately',
        distractor: true,
        score: 2,
      },
    ],
    prerequisites: [],
    nextWorksheetIds: ['reflection-feelings-001'],
  },
  {
    id: 'reflection-feelings-001',
    type: 'reflection',
    title: 'Feelings and support reflection',
    category: 'connection',
    domain: 'connection',
    availability: defaultAvailability,
    curriculumLinks: [],
    standaloneSettings: defaultStandaloneSettings,
    estimatedMinutes: 10,
    prompt: 'Reflect on how calm listening changes what a child experiences.',
    instructions: 'Write one short reflection and identify one support action.',
    fields: [
      { id: 'reflection', label: 'What did you notice?', required: true, score: 5 },
      { id: 'support-action', label: 'What support action would you try next?', required: true, score: 5 },
    ],
    prerequisites: ['sequence-safe-response-001'],
    nextWorksheetIds: ['knowledge-check-regulation-001'],
  },
  {
    id: 'knowledge-check-regulation-001',
    type: 'knowledge_check',
    title: 'Regulation knowledge check',
    category: 'emotional_regulation',
    domain: 'emotional_regulation',
    availability: {
      standalone: true,
      curriculum: true,
      assigned: true,
    },
    curriculumLinks: [
      {
        programId: 'keeping-families-together',
        moduleId: 'emotional-regulation',
        weekId: 'recognising-warning-signs',
        lessonId: 'regulation-knowledge-check',
        required: true,
        displayOrder: 5,
      },
    ],
    standaloneSettings: defaultStandaloneSettings,
    estimatedMinutes: 6,
    prompt: 'Choose the response that best supports safety and regulation.',
    instructions: 'Select one answer.',
    options: [
      { id: 'calm-first', text: 'Stay calm, check safety, and listen first.', correct: true, score: 10 },
      { id: 'problem-first', text: 'Solve the problem before checking feelings.', correct: false, score: 0 },
      { id: 'consequence-first', text: 'Set a consequence before reconnecting.', correct: false, score: 0 },
    ],
    prerequisites: ['reflection-feelings-001'],
    nextWorksheetIds: [],
  },
];

const importedWorksheetLots = [
  {
    id: 'lot-001',
    range: [1, 200],
    source: lot001Source,
    worksheets: lot001Worksheets,
  },
];

const worksheets = [...authoredWorksheets, ...importedWorksheetLots.flatMap((lot) => lot.worksheets.map((item) => normalizeLotWorksheet(item, lot)))];

const instances = new Map();
const scores = new Map();
const userCurriculum = new Map();

export function listWorksheetDefinitions() {
  return worksheets.map(sanitizeWorksheet);
}

export function listStandaloneActivityLibrary(filters = {}) {
  const type = typeof filters.type === 'string' ? filters.type : null;
  const domain = typeof filters.domain === 'string' ? filters.domain : null;

  return worksheets
    .filter((worksheet) => worksheet.availability.standalone && worksheet.standaloneSettings.listedInLibrary)
    .filter((worksheet) => !type || worksheet.type === type)
    .filter((worksheet) => !domain || worksheet.domain === domain)
    .map(sanitizeWorksheet);
}

export function listImportedWorksheetLots() {
  return importedWorksheetLots.map((lot) => ({
    id: lot.id,
    range: lot.range,
    source: lot.source,
    count: lot.worksheets.length,
  }));
}

export function getWorksheetById(id) {
  const worksheet = worksheets.find((item) => item.id === id);
  if (!worksheet) {
    throw notFound(`Worksheet ${id} was not found.`);
  }

  return sanitizeWorksheet(worksheet);
}

export function submitWorksheetInstance(worksheetId, input = {}, options = {}) {
  const worksheet = findWorksheet(worksheetId);
  const userId = requiredString(input.userId, 'userId');
  const responses = input.responses;
  const launchContext = normalizeLaunchContext(input.launchContext);
  validateLaunchContextForWorksheet(worksheet, launchContext);

  if (!responses || typeof responses !== 'object' || Array.isArray(responses)) {
    throw badRequest('responses must be an object.');
  }

  const programEnrollmentId = optionalString(input.programEnrollmentId);
  const lessonId = optionalString(input.lessonId);
  const curriculumLink = findMatchingCurriculumLink(worksheet, input);
  const isRequiredAttempt = Boolean(input.isRequiredAttempt ?? (launchContext === 'curriculum' && curriculumLink?.required));

  const instance = {
    id: options.instanceId ?? `wsi_${Date.now()}_${instances.size + 1}`,
    worksheetId,
    userId,
    responses,
    launchContext,
    programEnrollmentId,
    lessonId,
    curriculumLink: curriculumLink ?? null,
    isRequiredAttempt,
    resultCategory: classifyResultContext(launchContext, worksheet, isRequiredAttempt),
    status: 'submitted',
    submittedAt: options.submittedAt ?? new Date().toISOString(),
    schemaVersion: WORKSHEET_SCHEMA_VERSION,
  };

  instances.set(instance.id, instance);
  ensureCurriculumState(userId).instances.push(instance.id);

  return {
    instance,
    worksheet: sanitizeWorksheet(worksheet),
  };
}

export function scoreWorksheet(worksheetId, input = {}, options = {}) {
  const worksheet = findWorksheet(worksheetId);
  const instanceId = requiredString(input.instanceId, 'instanceId');
  const instance = instances.get(instanceId);

  if (!instance || instance.worksheetId !== worksheetId) {
    throw notFound(`Worksheet instance ${instanceId} was not found for ${worksheetId}.`);
  }

  const result = scoreResponses(worksheet, instance.responses);
  const scoreRecord = {
    id: options.scoreId ?? `wss_${Date.now()}_${scores.size + 1}`,
    worksheetId,
    instanceId,
    userId: instance.userId,
    launchContext: instance.launchContext,
    programEnrollmentId: instance.programEnrollmentId,
    lessonId: instance.lessonId,
    isRequiredAttempt: instance.isRequiredAttempt,
    resultCategory: instance.resultCategory,
    ...result,
    countsTowardProgram: shouldCountTowardProgram(instance, worksheet, result),
    usedForFormalReporting: formalReportingUseForInstance(instance),
    transferOffer: buildTransferOffer(instance, worksheet, result),
    scoredAt: options.scoredAt ?? new Date().toISOString(),
    schemaVersion: WORKSHEET_SCHEMA_VERSION,
  };

  scores.set(scoreRecord.id, scoreRecord);
  const state = ensureCurriculumState(instance.userId);
  state.scores.push(scoreRecord.id);
  if (scoreRecord.countsTowardProgram) {
    state.completedWorksheetIds = Array.from(new Set([...state.completedWorksheetIds, worksheetId]));
  }
  state.currentWorksheetId = computeNextWorksheetId(instance.userId);

  return scoreRecord;
}

export function getUserCurriculumState(userId) {
  const state = ensureCurriculumState(requiredString(userId, 'userId'));
  const nextWorksheetId = computeNextWorksheetId(userId);
  state.currentWorksheetId = nextWorksheetId;

  return {
    userId,
    currentWorksheetId: nextWorksheetId,
    completedWorksheetIds: [...state.completedWorksheetIds],
    submittedInstances: state.instances.map((id) => instances.get(id)).filter(Boolean),
    scoreHistory: state.scores.map((id) => scores.get(id)).filter(Boolean),
    nextWorksheets: nextWorksheetId ? [getWorksheetById(nextWorksheetId)] : [],
  };
}

export function computeNextWorksheetsForUser(userId, input = {}) {
  const state = getUserCurriculumState(userId);
  const limit = Number.isInteger(input.limit) && input.limit > 0 ? Math.min(input.limit, 5) : 3;
  const completed = new Set(state.completedWorksheetIds);

  const nextWorksheets = worksheets
    .filter((worksheet) => !completed.has(worksheet.id))
    .filter((worksheet) => worksheet.prerequisites.every((id) => completed.has(id)))
    .slice(0, limit)
    .map(sanitizeWorksheet);

  return {
    userId,
    nextWorksheets,
    reason:
      nextWorksheets.length > 0
        ? 'Next worksheets are unlocked by completed prerequisites.'
        : 'No unlocked worksheets remain for this user.',
  };
}

export function resetCurriculumWorksheetStore() {
  instances.clear();
  scores.clear();
  userCurriculum.clear();
}

function sanitizeWorksheet(worksheet) {
  const { items, options, fields, ...base } = worksheet;

  return {
    availability: worksheet.availability ?? defaultAvailability,
    curriculumLinks: worksheet.curriculumLinks ?? [],
    standaloneSettings: worksheet.standaloneSettings ?? defaultStandaloneSettings,
    ...base,
    schemaVersion: WORKSHEET_SCHEMA_VERSION,
    items: items?.map(({ correctPosition, distractor, score, ...item }) => ({
      ...item,
      kind: distractor ? 'leave_out' : 'ordered_step',
    })),
    options: options?.map(({ correct, score, ...option }) => option),
    fields: fields?.map(({ score, required, ...field }) => ({
      ...field,
      required: required ?? true,
    })),
  };
}

function normalizeLotWorksheet(source, lot) {
  assertLotWorksheet(source, lot);
  const numericId = String(source.id).padStart(3, '0');

  return {
    id: `worksheet-${numericId}`,
    sourceNumericId: source.id,
    sourceLotId: lot.id,
    sourcePath: lot.source,
    type: 'reflection',
    title: source.title.trim(),
    category: source.meta.domain,
    domain: source.meta.domain,
    difficulty: source.meta.difficulty,
    tags: [...source.meta.tags],
    availability: defaultAvailability,
    curriculumLinks: [],
    standaloneSettings: defaultStandaloneSettings,
    estimatedMinutes: estimateReflectionMinutes(source.prompts.length),
    prompt: source.purpose.trim(),
    purpose: source.purpose.trim(),
    instructions: 'Complete each reflection prompt before submitting the worksheet.',
    prompts: source.prompts.map((prompt, index) => ({
      id: source.fields[index],
      text: prompt,
      fieldId: source.fields[index],
    })),
    fields: source.fields.map((field, index) => ({
      id: field,
      label: source.prompts[index],
      required: true,
      score: 10,
    })),
    prerequisites: [],
    nextWorksheetIds: [],
  };
}

function assertLotWorksheet(source, lot) {
  if (!Number.isInteger(source?.id)) {
    throw new Error(`${lot.id} includes a worksheet without an integer id.`);
  }

  for (const fieldName of ['title', 'purpose']) {
    if (typeof source[fieldName] !== 'string' || !source[fieldName].trim()) {
      throw new Error(`${lot.id} worksheet ${source.id} is missing ${fieldName}.`);
    }
  }

  if (!Array.isArray(source.prompts) || source.prompts.length === 0) {
    throw new Error(`${lot.id} worksheet ${source.id} requires prompts.`);
  }

  if (!Array.isArray(source.fields) || source.fields.length !== source.prompts.length) {
    throw new Error(`${lot.id} worksheet ${source.id} fields must match prompts.`);
  }

  if (!source.meta || typeof source.meta.domain !== 'string' || typeof source.meta.difficulty !== 'string') {
    throw new Error(`${lot.id} worksheet ${source.id} requires meta.domain and meta.difficulty.`);
  }

  if (!Array.isArray(source.meta.tags) || !source.meta.tags.every((tag) => typeof tag === 'string')) {
    throw new Error(`${lot.id} worksheet ${source.id} requires string meta.tags.`);
  }
}

function estimateReflectionMinutes(promptCount) {
  return Math.max(5, Math.min(15, promptCount * 3));
}

function normalizeLaunchContext(value) {
  if (value === undefined || value === null || value === '') {
    return 'standalone';
  }

  if (typeof value !== 'string' || !launchContexts.has(value)) {
    throw badRequest(`launchContext must be one of: ${Array.from(launchContexts).join(', ')}.`);
  }

  return value;
}

function validateLaunchContextForWorksheet(worksheet, launchContext) {
  if (launchContext === 'standalone' && !worksheet.availability.standalone) {
    throw badRequest(`${worksheet.id} is not available as a standalone activity.`);
  }

  if (launchContext === 'curriculum' && !worksheet.availability.curriculum) {
    throw badRequest(`${worksheet.id} is not available as a curriculum activity.`);
  }

  if (launchContext === 'assigned' && !worksheet.availability.assigned) {
    throw badRequest(`${worksheet.id} is not available as an assigned activity.`);
  }
}

function findMatchingCurriculumLink(worksheet, input) {
  if (!worksheet.curriculumLinks.length) {
    return null;
  }

  const lessonId = optionalString(input.lessonId);
  const programId = optionalString(input.programId);

  if (!lessonId && !programId) {
    return null;
  }

  return (
    worksheet.curriculumLinks.find(
      (link) => (!lessonId || link.lessonId === lessonId) && (!programId || link.programId === programId),
    ) ?? null
  );
}

function classifyResultContext(launchContext, worksheet, isRequiredAttempt) {
  if (launchContext === 'standalone') return 'Optional stand-alone practice';
  if (launchContext === 'curriculum') return 'Curriculum knowledge check';
  if (launchContext === 'assigned') return 'Worker-assigned activity';
  if (launchContext === 'formal_assessment') return 'Formal assessment';
  if (launchContext === 'recommended') return worksheet.type === 'reflection' ? 'Parent self-assessment' : 'Optional stand-alone practice';
  return isRequiredAttempt ? 'Curriculum knowledge check' : 'Optional stand-alone practice';
}

function shouldCountTowardProgram(instance, worksheet, result) {
  if (!result.passed) {
    return false;
  }

  if (instance.launchContext === 'curriculum' && instance.isRequiredAttempt) {
    return true;
  }

  if (instance.launchContext === 'assigned' && instance.curriculumLink?.required) {
    return true;
  }

  return false;
}

function formalReportingUseForInstance(instance) {
  if (instance.launchContext === 'standalone' || instance.launchContext === 'recommended') {
    return 'Only as voluntary learning history';
  }

  if (instance.launchContext === 'curriculum') {
    return 'Yes, with context';
  }

  if (instance.launchContext === 'assigned' || instance.launchContext === 'formal_assessment') {
    return 'Yes';
  }

  return 'With parent consent and context';
}

function buildTransferOffer(instance, worksheet, result) {
  if (instance.launchContext !== 'standalone' || !worksheet.availability.curriculum || worksheet.curriculumLinks.length === 0) {
    return null;
  }

  return {
    available: true,
    message: 'Use this result toward my program',
    eligibleCurriculumLinks: worksheet.curriculumLinks.map((link) => ({
      ...link,
      willSatisfyRequirement: Boolean(result.passed && link.required),
      requiresFreshAttempt: !result.passed,
    })),
  };
}

function findWorksheet(id) {
  const worksheet = worksheets.find((item) => item.id === id);
  if (!worksheet) {
    throw notFound(`Worksheet ${id} was not found.`);
  }

  return worksheet;
}

function scoreResponses(worksheet, responses) {
  if (worksheet.type === 'sequence') {
    return scoreSequenceWorksheet(worksheet, responses);
  }

  if (worksheet.type === 'reflection') {
    return scoreReflectionWorksheet(worksheet, responses);
  }

  if (worksheet.type === 'knowledge_check') {
    return scoreKnowledgeCheckWorksheet(worksheet, responses);
  }

  throw badRequest(`Unsupported worksheet type ${worksheet.type}.`);
}

function scoreSequenceWorksheet(worksheet, responses) {
  const orderedStepIds = assertStringArray(responses.orderedStepIds, 'responses.orderedStepIds');
  const excludedStepIds = assertStringArray(responses.excludedStepIds, 'responses.excludedStepIds');
  const correctSteps = worksheet.items.filter((item) => !item.distractor);
  const distractors = worksheet.items.filter((item) => item.distractor);
  let rawScore = 0;
  const maxScore = worksheet.items.reduce((sum, item) => sum + item.score, 0);

  for (const step of correctSteps) {
    if (orderedStepIds[step.correctPosition - 1] === step.id) {
      rawScore += step.score;
    }
  }

  for (const distractor of distractors) {
    if (excludedStepIds.includes(distractor.id)) {
      rawScore += distractor.score;
    }
  }

  return scoreEnvelope(rawScore, maxScore, rawScore === maxScore ? [] : ['Review sequence order and left-out actions.']);
}

function scoreReflectionWorksheet(worksheet, responses) {
  let rawScore = 0;
  const maxScore = worksheet.fields.reduce((sum, field) => sum + field.score, 0);
  const feedback = [];

  for (const field of worksheet.fields) {
    const value = typeof responses[field.id] === 'string' ? responses[field.id].trim() : '';
    if (value.length >= 20) {
      rawScore += field.score;
    } else if (field.required) {
      feedback.push(`${field.label} needs a fuller response.`);
    }
  }

  return scoreEnvelope(rawScore, maxScore, feedback);
}

function scoreKnowledgeCheckWorksheet(worksheet, responses) {
  const selectedOptionId = requiredString(responses.selectedOptionId, 'responses.selectedOptionId');
  const selected = worksheet.options.find((option) => option.id === selectedOptionId);

  if (!selected) {
    throw badRequest('responses.selectedOptionId does not match this worksheet.');
  }

  const maxScore = Math.max(...worksheet.options.map((option) => option.score));
  return scoreEnvelope(selected.score, maxScore, selected.correct ? [] : ['Review regulation-first response order.']);
}

function scoreEnvelope(rawScore, maxScore, feedback) {
  return {
    rawScore,
    maxScore,
    percentageScore: maxScore === 0 ? 0 : Math.round((rawScore / maxScore) * 100),
    passed: maxScore > 0 && rawScore / maxScore >= 0.8,
    feedback,
  };
}

function computeNextWorksheetId(userId) {
  const state = ensureCurriculumState(userId);
  const completed = new Set(state.completedWorksheetIds);
  const next = worksheets.find(
    (worksheet) => !completed.has(worksheet.id) && worksheet.prerequisites.every((id) => completed.has(id)),
  );

  return next?.id ?? null;
}

function ensureCurriculumState(userId) {
  if (!userCurriculum.has(userId)) {
    userCurriculum.set(userId, {
      completedWorksheetIds: [],
      instances: [],
      scores: [],
      currentWorksheetId: worksheets[0]?.id ?? null,
    });
  }

  return userCurriculum.get(userId);
}

function assertStringArray(value, fieldName) {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string' && item.trim())) {
    throw badRequest(`${fieldName} must be an array of strings.`);
  }

  return value;
}

function requiredString(value, fieldName) {
  if (typeof value !== 'string' || !value.trim()) {
    throw badRequest(`${fieldName} is required.`);
  }

  return value.trim();
}

function optionalString(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function notFound(message) {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
}
