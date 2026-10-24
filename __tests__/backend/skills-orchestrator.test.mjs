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
      input: { documentId: 'doc-1', text: 'Some text' },
    });

    expect(result.status).toBe('failed');
    expect(result.error.code).toBe('SKILL_HANDLER_NOT_FOUND');
    expect(result.skill.id).toBe('fairness_detection');
  });

  test('rejects missing required input fields before calling a handler', async () => {
    const orchestrator = createSkillsOrchestrator({
      handlers: { fairness_detection: async () => ({ concerns: [] }) },
    });
    const result = await orchestrator.runSkill({
      skillId: 'fairness_detection',
      input: { documentId: 'doc-1' },
    });

    expect(result.status).toBe('failed');
    expect(result.error.code).toBe('SKILL_INPUT_INVALID');
  });

  test('halts a non-disclosure skill in preflight when input contains a disclosure signal', async () => {
    let handlerCalled = false;
    const orchestrator = createSkillsOrchestrator({
      handlers: {
        fairness_detection: async () => {
          handlerCalled = true;
          return { concerns: [] };
        },
      },
    });
    const result = await orchestrator.runSkill({
      skillId: 'fairness_detection',
      input: { documentId: 'doc-1', text: 'I am scared because someone hurt me.' },
    });

    expect(result.status).toBe('blocked');
    expect(handlerCalled).toBe(false);
    expect(result.policy.requiresEscalationReview).toBe(true);
    expect(result.policy.safetyConcerns).toContain('sensitive_disclosure_requires_human_review');
  });

  test('halts non-disclosure execution when immediate danger requires escalation review', async () => {
    let handlerCalled = false;
    const orchestrator = createSkillsOrchestrator({
      handlers: {
        fairness_detection: async () => {
          handlerCalled = true;
          return { concerns: [] };
        },
      },
    });
    const result = await orchestrator.runSkill({
      skillId: 'fairness_detection',
      input: { documentId: 'doc-1', text: 'I am under attack right now.' },
    });

    expect(result.status).toBe('blocked');
    expect(handlerCalled).toBe(false);
    expect(result.policy.requiresEscalationReview).toBe(true);
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
      input: { documentId: 'doc-1', text: 'Sample text' },
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
          evidence_items: [{ evidence: 'Parent attended' }],
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
    expect(result.output.evidence_items[0].source_span).toEqual({
      doc_id: 'doc-1',
      start: 0,
      end: 'Parent attended'.length,
    });
    expect(result.run_meta).toMatchObject({
      skill_version: '1.0.0',
      model: 'model-not-reported',
    });
    expect(new Date(result.run_meta.timestamp_utc).toISOString()).toBe(result.run_meta.timestamp_utc);
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
      input: { documentId: 'doc-1', text: 'Case note' },
    });

    expect(result.status).toBe('blocked');
    expect(result.policy.automationBlockedReasons).toContain(
      'irreversible_decision_automation_prohibited',
    );
    expect(result.automation.irreversibleActionsAllowed).toBe(false);
  });
});
