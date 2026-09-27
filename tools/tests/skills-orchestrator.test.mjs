import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createSkillsOrchestrator } = require('../../backend/skills/orchestrator.js');

test('orchestrator returns typed decision-support envelope for known skill', async () => {
  const orchestrator = createSkillsOrchestrator({
    handlers: {
      case_packet_builder: async () => ({
        packet_sections: ['summary', 'evidence'],
        open_questions: ['Confirm latest school attendance update'],
        human_review_queue: ['supervisor_review'],
      }),
    },
  });

  const result = await orchestrator.runSkill({
    skillId: 'case_packet_builder',
    input: { caseId: '00000000-0000-0000-0000-000000000001' },
  });

  assert.equal(result.status, 'ok');
  assert.equal(result.skill.id, 'case_packet_builder');
  assert.equal(result.policy.decisionSupportOnly, true);
  assert.equal(result.automation.irreversibleActionsAllowed, false);
  assert.equal(result.integration.trackC, true);
  assert.deepEqual(result.inputSummary.fields, ['caseId']);
  assert.equal('input' in result, false);
  assert.deepEqual(result.output.packet_sections, ['summary', 'evidence']);
});

test('orchestrator blocks unsafe automation language in handler output', async () => {
  const orchestrator = createSkillsOrchestrator({
    handlers: {
      case_update: async () => ({ recommendation: 'Automatically decide custody placement now.' }),
    },
  });

  const result = await orchestrator.runSkill({
    skillId: 'case_update',
    input: { caseId: '00000000-0000-0000-0000-000000000001' },
  });

  assert.equal(result.status, 'blocked');
  assert.ok(result.policy.automationBlockedReasons.includes('irreversible_decision_automation_prohibited'));
});

test('orchestrator returns structured error for unknown skills', async () => {
  const orchestrator = createSkillsOrchestrator();
  const result = await orchestrator.runSkill({ skillId: 'not_real', input: {} });
  assert.equal(result.status, 'failed');
  assert.equal(result.error.code, 'SKILL_NOT_FOUND');
});

test('orchestrator returns structured error when a known skill has no handler', async () => {
  const orchestrator = createSkillsOrchestrator();
  const result = await orchestrator.runSkill({ skillId: 'case_update', input: {} });
  assert.equal(result.status, 'failed');
  assert.equal(result.error.code, 'SKILL_HANDLER_NOT_FOUND');
  assert.equal(result.skill.id, 'case_update');
});

test('orchestrator returns structured error when a handler throws', async () => {
  const orchestrator = createSkillsOrchestrator({
    handlers: {
      case_update: async () => {
        throw new Error('handler exploded');
      },
    },
  });
  const result = await orchestrator.runSkill({ skillId: 'case_update', input: {} });
  assert.equal(result.status, 'failed');
  assert.equal(result.error.code, 'SKILL_HANDLER_FAILED');
  assert.match(result.error.message, /handler exploded/);
});
