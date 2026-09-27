'use strict';

const registry = require('./registry');
const { evaluateSafetyPolicy, POLICY_VERSION } = require('./safety-gates');
const { createSkillsOrchestrator, ORCHESTRATOR_VERSION } = require('./orchestrator');
const {
  PROGRAM_LEVELS,
  EXPECTED_LESSON_COUNT,
  loadCanonicalFamilyConflictProgram,
  validateFamilyConflictProgramConfig,
} = require('./program-config');

module.exports = {
  ...registry,
  evaluateSafetyPolicy,
  POLICY_VERSION,
  createSkillsOrchestrator,
  ORCHESTRATOR_VERSION,
  PROGRAM_LEVELS,
  EXPECTED_LESSON_COUNT,
  loadCanonicalFamilyConflictProgram,
  validateFamilyConflictProgramConfig,
};
