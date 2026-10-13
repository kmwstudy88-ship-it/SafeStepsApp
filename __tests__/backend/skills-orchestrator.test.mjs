import { describe, expect, test } from '@jest/globals';
import {
  ORCHESTRATOR_VERSION,
  createSkillsOrchestrator,
} from '../../backend/skills/orchestrator.js';

describe('skills orchestrator', () => {
  test('returns error when skill is not found in registry', async () => {
    const orchestrator = createSkillsOrchestrator();
    const result = await orchestrator.runSkill({
      skillId: 'non_existent_skill',
      input: { text: 'Some text' },
    });

    expect(result.status).toBe('failed');
    expect(result.error.code).toBe('SKILL_NOT_FOUND');
  });

  test('returns error when handler is not registered for the skill', async () => {
    const orchestrator = createSkillsOrchestrator({ handlers: {} });
    const result = await orchestrator.runSkill({
      skillId: 'fairness_detection',
      input: { text: 'Some text' },
    });

    expect(result.status).toBe('failed');
    expect(result.error.code).toBe('SKILL_HANDLER_NOT_FOUND');
    expect(result.skill.id).toBe('fairness_detection');
  });

  test('safely catches and isolates handler failures', async () => {
    const orchestrator = createSkillsOrchestrator({
      handlers: {
        fairness_detection: async () => {
          throw new Error('API timeout or service down');
        },
      },
    });

    const result = await orchestrator.runSkill({
      skillId: 'fairness_detection',
      input: { text: 'Sample text' },
    });

    expect(result.status).toBe('failed');
    expect(result.error.code).toBe('SKILL_HANDLER_FAILED');
    expect(result.error.message).toBe('API timeout or service down');
  });

  test('executes handler and evaluates safety policy, returning ok envelope', async () => {
    const orchestrator = createSkillsOrchestrator({
      handlers: {
        fairness_detection: async ({ input }) => ({
          concerns: [],
          objective_reframes: [],
          summary: `Analyzed text of length ${input.text?.length || 0}`,
        }),
      },
    });

    const result = await orchestrator.runSkill({
      skillId: 'fairness_detection',
      input: { text: 'Parent attended scheduled parenting reflection.', documentId: 'doc-1' },
    });

    expect(result.status).toBe('ok');
    expect(result.orchestratorVersion).toBe(ORCHESTRATOR_VERSION);
    expect(result.output.summary).toBe('Analyzed text of length 47');
    expect(result.automation.irreversibleActionsAllowed).toBe(false);
    expect(result.automation.humanReviewCheckpointRequired).toBe(true);
    expect(result.policy.decisionSupportOnly).toBe(true);
    expect(result.policy.humanReviewRequired).toBe(true);
    expect(result.inputSummary.documentId).toBe('doc-1');
  });

  test('marks execution as blocked when safety policy detects automated irreversible action', async () => {
    const orchestrator = createSkillsOrchestrator({
      handlers: {
        fairness_detection: async () => ({
          output: 'Automatically determine placement and remove child immediately.',
        }),
      },
    });

    const result = await orchestrator.runSkill({
      skillId: 'fairness_detection',
      input: { text: 'Case note' },
    });

    expect(result.status).toBe('blocked');
    expect(result.policy.automationBlockedReasons).toContain(
      'irreversible_decision_automation_prohibited',
    );
    expect(result.automation.irreversibleActionsAllowed).toBe(false);
  });
});
