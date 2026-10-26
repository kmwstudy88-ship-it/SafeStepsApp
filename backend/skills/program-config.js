'use strict';

const fs = require('node:fs');
const path = require('node:path');

const PROGRAM_LEVELS = Object.freeze(['Basic', 'Developing', 'Mastery']);
const EXPECTED_LESSON_COUNT = 20;

function hasNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateFamilyConflictProgramConfig(program) {
  const errors = [];

  if (!program || typeof program !== 'object') {
    return { valid: false, errors: ['program must be an object'] };
  }

  if (!hasNonEmptyString(program.title)) errors.push('program.title is required');
  if (!Array.isArray(program.levels) || program.levels.length !== PROGRAM_LEVELS.length) {
    errors.push('program.levels must include Basic, Developing, Mastery');
  } else {
    const uniqueLevels = new Set(program.levels);
    if (uniqueLevels.size !== PROGRAM_LEVELS.length) {
      errors.push('program.levels must not contain duplicates');
    }
    for (const level of PROGRAM_LEVELS) {
      if (!program.levels.includes(level)) errors.push(`program.levels missing ${level}`);
    }
  }

  if (!Array.isArray(program.safeguards) || program.safeguards.length < 5) errors.push('program.safeguards must include required safeguards');

  if (!Array.isArray(program.lessons) || program.lessons.length !== EXPECTED_LESSON_COUNT) {
    errors.push(`program.lessons must include ${EXPECTED_LESSON_COUNT} lessons`);
  } else {
    const seenIds = new Set();
    for (const lesson of program.lessons) {
      if (!Number.isInteger(lesson?.id)) errors.push('each lesson.id must be an integer');
      if (seenIds.has(lesson?.id)) errors.push(`duplicate lesson id ${lesson.id}`);
      if (!hasNonEmptyString(lesson?.title)) errors.push(`lesson ${lesson?.id || 'unknown'} title is required`);
      if (!hasNonEmptyString(lesson?.learning_goal)) errors.push(`lesson ${lesson?.id || 'unknown'} learning_goal is required`);
      seenIds.add(lesson?.id);

      if (!lesson?.levels || typeof lesson.levels !== 'object') {
        errors.push(`lesson ${lesson?.id || 'unknown'} levels object is required`);
        continue;
      }

      for (const level of PROGRAM_LEVELS) {
        const levelRow = lesson.levels[level];
        if (!levelRow || typeof levelRow !== 'object') {
          errors.push(`lesson ${lesson.id} missing level ${level}`);
          continue;
        }
        if (!hasNonEmptyString(levelRow.activity)) errors.push(`lesson ${lesson.id} ${level} activity is required`);
        if (!Array.isArray(levelRow.assessment) || levelRow.assessment.length < 1) {
          errors.push(`lesson ${lesson.id} ${level} assessment must be non-empty`);
        }
      }
    }

    for (let id = 1; id <= EXPECTED_LESSON_COUNT; id += 1) {
      if (!seenIds.has(id)) errors.push(`program.lessons missing id ${id}`);
    }
  }

  for (const level of PROGRAM_LEVELS) {
    const guidance = program?.completion_guidance?.[level];
    if (!guidance || typeof guidance !== 'object') {
      errors.push(`completion_guidance missing ${level}`);
      continue;
    }
    if (!hasNonEmptyString(guidance.description)) {
      errors.push(`completion_guidance.${level}.description is required`);
    }
    if (!Array.isArray(guidance.evidence) || guidance.evidence.length < 1) {
      errors.push(`completion_guidance.${level}.evidence must be non-empty`);
    }
  }
  if (!hasNonEmptyString(program?.completion_guidance?.progression)) {
    errors.push('completion_guidance.progression is required');
  }

  if (!Array.isArray(program?.reusable_assessments?.exit_ticket) || program.reusable_assessments.exit_ticket.length < 4) {
    errors.push('reusable_assessments.exit_ticket must include prompts');
  }

  const rubric = program?.reusable_assessments?.role_play_rubric;
  if (!rubric || typeof rubric !== 'object') {
    errors.push('reusable_assessments.role_play_rubric is required');
  } else {
    if (!rubric.scoring || typeof rubric.scoring !== 'object') {
      errors.push('role_play_rubric.scoring is required');
    } else {
      for (const key of ['0', '1', '2']) {
        if (!hasNonEmptyString(rubric.scoring[key])) errors.push(`role_play_rubric.scoring.${key} is required`);
      }
    }
    if (!Array.isArray(rubric.criteria) || rubric.criteria.length < 5) errors.push('role_play_rubric.criteria must include core criteria');
  }

  if (!Array.isArray(program?.reusable_assessments?.learning_journal_prompts) || program.reusable_assessments.learning_journal_prompts.length < 5) {
    errors.push('reusable_assessments.learning_journal_prompts must include prompts');
  }

  return { valid: errors.length === 0, errors };
}

function loadCanonicalFamilyConflictProgram(repoRoot) {
  const absolutePath = path.join(repoRoot, 'lessons', 'family_conflict_psychoeducation_program.json');
  const lesson = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
  return {
    lesson,
    program: lesson?.content?.program || null,
  };
}

module.exports = {
  EXPECTED_LESSON_COUNT,
  PROGRAM_LEVELS,
  loadCanonicalFamilyConflictProgram,
  validateFamilyConflictProgramConfig,
};
