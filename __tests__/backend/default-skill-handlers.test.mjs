import { describe, expect, test } from '@jest/globals';
import { createDefaultSkillHandlers } from '../../backend/skills/defaultHandlers.js';
import { SKILLS } from '../../backend/skills/registry.js';

describe('default SafeSteps skill handlers', () => {
  const handlers = createDefaultSkillHandlers();

  test('provides an execution handler for every catalog skill', () => {
    expect(Object.keys(handlers).sort()).toEqual(SKILLS.map((skill) => skill.id).sort());
  });

  test('keeps case updates as drafts without writing records', async () => {
    const output = await handlers.case_update({ input: { event: { summary: 'Review requested' } } });
    expect(output.event_payload).toEqual({ summary: 'Review requested' });
    expect(output.write_performed).toBe(false);
    expect(output.review_notes).toHaveLength(1);
  });

  test('compares supplied document text without treating unmatched text as a proven contradiction', async () => {
    const output = await handlers.multi_document_comparison({
      input: {
        documents: [
          { id: 'doc-a', text: 'The visit began at 9am. The parent attended.' },
          { id: 'doc-b', text: 'The parent attended. The visit began at 10am.' },
        ],
      },
    });
    expect(output.agreements[0].statement).toBe('The parent attended.');
    expect(output.agreements[0].sources).toEqual([
      { doc_id: 'doc-a', source_span: { doc_id: 'doc-a', start: 24, end: 44 } },
      { doc_id: 'doc-b', source_span: { doc_id: 'doc-b', start: 0, end: 20 } },
    ]);
    expect(output.contradictions).toEqual([]);
    expect(output.evidence_gaps).toHaveLength(2);
    expect(output.limitations).toMatch(/does not determine which account is accurate/);
  });

  test('disclosure handling requests review and stops downstream processing', async () => {
    const output = await handlers.disclosure_sensitive({
      input: { message: 'I am scared because someone hurt me right now.' },
    });
    expect(output.matched_signals).toContain('abuse');
    expect(output.immediate_danger).toBe(true);
    expect(output.stop_downstream_processing).toBe(true);
    expect(output.review_route).toBe('immediate_safeguarding_review');
  });

  test('de-escalation output reflects the requested safety principles', async () => {
    const output = await handlers.de_escalation_strategy({ input: { message: 'A disagreement is escalating.' } });
    expect(output.de_escalation_steps.join(' ')).toMatch(/Feel it.*Own it.*Expect it/);
    expect(output.de_escalation_steps.join(' ')).toMatch(/compassion and curiosity/i);
    expect(output.principle).toMatch(/ego goes up, safety goes down/i);
  });

  test('follow-up scheduling returns review suggestions without scheduling or echoing supplied details', async () => {
    const output = await handlers.follow_up_scheduling({
      input: {
        caseId: 'case-1',
        reference_date: '2026-01-01T00:00:00.000Z',
        risk_output: { risk_level: 'critical' },
        escalations: [{ id: 'escalation-1', tier: 'tier_1_immediate' }],
      },
    });
    expect(output.tasks.map((task) => task.priority)).toEqual(['immediate', 'high']);
    expect(output.tasks[0].due_date).toBe('2026-01-02T00:00:00.000Z');
    expect(output.tasks[1].due_date).toBe('2026-01-03T00:00:00.000Z');
    expect(output.scheduling_performed).toBe(false);
  });
});
