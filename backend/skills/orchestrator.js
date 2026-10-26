'use strict';

const { getSkill } = require('./registry');
const { evaluateSafetyPolicy } = require('./safety-gates');

const ORCHESTRATOR_VERSION = 'skills-orchestrator-v1';

function createSkillsOrchestrator({ handlers = {} } = {}) {
  function summarizeInput(input = {}) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
    return {
      fields: Object.keys(input),
      caseId: typeof input.caseId === 'string' ? input.caseId : undefined,
      documentId: typeof input.documentId === 'string' ? input.documentId : undefined,
    };
  }

  async function runSkill({ skillId, input = {}, context = {} }) {
    const skill = getSkill(skillId);
    if (!skill) {
      return {
        status: 'failed',
        error: { code: 'SKILL_NOT_FOUND', message: `Unknown skill: ${skillId}` },
      };
    }

    const handler = handlers[skill.id];
    if (!handler) {
      return {
        status: 'failed',
        error: { code: 'SKILL_HANDLER_NOT_FOUND', message: `No handler registered for skill: ${skill.id}` },
        skill,
      };
    }

    let result;
    try {
      result = await handler({ skill, input, context });
    } catch (error) {
      return {
        status: 'failed',
        error: {
          code: 'SKILL_HANDLER_FAILED',
          message: error?.message || `Skill handler failed for ${skill.id}`,
        },
        skill,
      };
    }

    const policy = evaluateSafetyPolicy({ skill, input, output: result });
    const blocked = policy.automationBlockedReasons.length > 0;

    return {
      status: blocked ? 'blocked' : 'ok',
      orchestratorVersion: ORCHESTRATOR_VERSION,
      skill,
      inputSummary: summarizeInput(input),
      output: result,
      policy,
      integration: {
        primary: skill.integrations.primary,
        trackC: Boolean(skill.integrations.trackC),
      },
      automation: {
        irreversibleActionsAllowed: false,
        humanReviewCheckpointRequired: true,
      },
    };
  }

  return {
    runSkill,
  };
}

module.exports = {
  ORCHESTRATOR_VERSION,
  createSkillsOrchestrator,
};
