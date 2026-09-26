'use strict';

const { getSkill } = require('./registry');
const { evaluateSafetyPolicy } = require('./safety-gates');

const ORCHESTRATOR_VERSION = 'skills-orchestrator-v1';

function createSkillsOrchestrator({ handlers = {} } = {}) {
  async function runSkill({ skillId, input = {}, context = {} }) {
    const skill = getSkill(skillId);
    if (!skill) {
      return {
        status: 'failed',
        error: { code: 'SKILL_NOT_FOUND', message: `Unknown skill: ${skillId}` },
      };
    }

    const handler = handlers[skill.id];
    const result = handler
      ? await handler({ skill, input, context })
      : {
        findings: [],
        nextActions: [],
        integrationHint: skill.integrations.primary,
      };

    const policy = evaluateSafetyPolicy({ skill, input, output: result });
    const blocked = policy.automationBlockedReasons.length > 0;

    return {
      status: blocked ? 'blocked' : 'ok',
      orchestratorVersion: ORCHESTRATOR_VERSION,
      skill,
      input,
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
