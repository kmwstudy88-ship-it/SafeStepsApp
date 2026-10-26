'use strict';

const registry = require('./registry');
const { evaluateSafetyPolicy, POLICY_VERSION } = require('./safety-gates');
const { createSkillsOrchestrator, ORCHESTRATOR_VERSION } = require('./orchestrator');
const {
  ALL_HANDLERS,
  docIntelHandlers,
  workflowHandlers,
  commHandlers,
  childSafeHandlers,
  complianceHandlers,
} = require('./handlers');
const {
  PROGRAM_LEVELS,
  EXPECTED_LESSON_COUNT,
  loadCanonicalFamilyConflictProgram,
  validateFamilyConflictProgramConfig,
} = require('./program-config');

function createConfiguredSkillsOrchestrator(options = {}) {
  return createSkillsOrchestrator({
    ...options,
    handlers: {
      ...ALL_HANDLERS,
      ...(options.handlers || {}),
    },
  });
}

module.exports = {
  ...registry,
  evaluateSafetyPolicy,
  POLICY_VERSION,
  createSkillsOrchestrator,
  createConfiguredSkillsOrchestrator,
  ORCHESTRATOR_VERSION,
  ALL_HANDLERS,
  docIntelHandlers,
  workflowHandlers,
  commHandlers,
  childSafeHandlers,
  complianceHandlers,
  PROGRAM_LEVELS,
  EXPECTED_LESSON_COUNT,
  loadCanonicalFamilyConflictProgram,
  validateFamilyConflictProgramConfig,
};
