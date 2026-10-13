import { describe, expect, jest, test } from '@jest/globals';
import { runDocumentIntelligencePipeline } from '../../backend/Services/DocumentIntelligence/DocumentPipeline.js';
import {
  DOCUMENT_INTELLIGENCE_SKILLS,
  attachSkillsToAnalysisResult,
  createDefaultDocumentSkillHandlers,
  createDocumentSkillsOrchestrator,
  executeRequestedDocumentSkills,
  normalizeRequestedSkills,
} from '../../backend/skills/documentIntelligenceAdapter.js';

describe('document intelligence and skills orchestration integration', () => {
  test('lists all 8 document intelligence skills in adapter', () => {
    expect(DOCUMENT_INTELLIGENCE_SKILLS).toHaveLength(8);
    expect(DOCUMENT_INTELLIGENCE_SKILLS).toContain('fairness_detection');
    expect(DOCUMENT_INTELLIGENCE_SKILLS).toContain('contradiction_detection');
    expect(DOCUMENT_INTELLIGENCE_SKILLS).toContain('evidence_extraction');
    expect(DOCUMENT_INTELLIGENCE_SKILLS).toContain('requirement_extraction');
    expect(DOCUMENT_INTELLIGENCE_SKILLS).toContain('timeline_extraction');
    expect(DOCUMENT_INTELLIGENCE_SKILLS).toContain('risk_assessment');
    expect(DOCUMENT_INTELLIGENCE_SKILLS).toContain('concern_classification');
    expect(DOCUMENT_INTELLIGENCE_SKILLS).toContain('unrealistic_expectation_detection');
  });

  test('normalizes requested skills formats (boolean, string, array, object)', () => {
    expect(normalizeRequestedSkills(null)).toEqual([]);
    expect(normalizeRequestedSkills(undefined)).toEqual([]);
    expect(normalizeRequestedSkills(false)).toEqual([]);
    expect(normalizeRequestedSkills(true)).toEqual([...DOCUMENT_INTELLIGENCE_SKILLS]);
    expect(normalizeRequestedSkills('all')).toEqual([...DOCUMENT_INTELLIGENCE_SKILLS]);
    expect(normalizeRequestedSkills('document_intelligence')).toEqual([...DOCUMENT_INTELLIGENCE_SKILLS]);
    expect(normalizeRequestedSkills('fairness_detection')).toEqual(['fairness_detection']);
    expect(normalizeRequestedSkills(['fairness_detection', 'contradiction_detection'])).toEqual([
      'fairness_detection',
      'contradiction_detection',
    ]);
    expect(
      normalizeRequestedSkills({ fairness_detection: true, timeline_extraction: false }),
    ).toEqual(['fairness_detection']);
  });

  test('default handlers include pure-logic fairness_detection without requiring external API', async () => {
    const handlers = createDefaultDocumentSkillHandlers();
    expect(handlers.fairness_detection).toBeDefined();

    const output = await handlers.fairness_detection({
      input: { text: 'The mother should always care for the child naturally.' },
    });

    expect(output.decisionSupportOnly).toBe(true);
    expect(output.concerns.length).toBeGreaterThan(0);
    expect(output.rulesTriggeredCount).toBeGreaterThan(0);
  });

  test('executeRequestedDocumentSkills returns empty result envelope when no skills requested', async () => {
    const result = await executeRequestedDocumentSkills({
      text: 'Sample document text',
      skills: null,
    });

    expect(result.status).toBe('none_requested');
    expect(result.requestedCount).toBe(0);
    expect(result.decisionSupportOnly).toBe(true);
    expect(result.humanReviewRequired).toBe(true);
  });

  test('executeRequestedDocumentSkills runs opt-in skills and returns structured reviewable output', async () => {
    const result = await executeRequestedDocumentSkills({
      text: 'Case worker note: Parent arrived on time and engaged in contact visit.',
      documentId: 'doc-123',
      caseId: 'case-abc',
      skills: ['fairness_detection'],
    });

    expect(result.status).toBe('completed');
    expect(result.decisionSupportOnly).toBe(true);
    expect(result.humanReviewRequired).toBe(true);
    expect(result.irreversibleActionsAllowed).toBe(false);
    expect(result.requestedCount).toBe(1);
    expect(result.successCount).toBe(1);
    expect(result.results.fairness_detection).toBeDefined();
    expect(result.results.fairness_detection.status).toBe('ok');
    expect(result.results.fairness_detection.policy.decisionSupportOnly).toBe(true);
    expect(result.results.fairness_detection.policy.humanReviewRequired).toBe(true);
  });

  test('blocks skill output that attempts automated irreversible custody/placement actions', async () => {
    const mockOrchestrator = createDocumentSkillsOrchestrator({
      fairness_detection: async () => ({
        decision: 'Automatically finalize placement order for child.',
      }),
    });

    const result = await executeRequestedDocumentSkills({
      text: 'Evaluation text',
      skills: ['fairness_detection'],
      orchestrator: mockOrchestrator,
    });

    expect(result.blockedCount).toBe(1);
    expect(result.results.fairness_detection.status).toBe('blocked');
    expect(result.results.fairness_detection.policy.automationBlockedReasons).toContain(
      'irreversible_decision_automation_prohibited',
    );
  });

  test('isolates skill handler failures so processing continues', async () => {
    const mockOrchestrator = createDocumentSkillsOrchestrator({
      fairness_detection: async () => ({ status: 'ok', concerns: [] }),
      contradiction_detection: async () => {
        throw new Error('Service network timeout');
      },
    });

    const result = await executeRequestedDocumentSkills({
      text: 'Evaluation text',
      skills: ['fairness_detection', 'contradiction_detection'],
      orchestrator: mockOrchestrator,
    });

    expect(result.status).toBe('partial_success');
    expect(result.successCount).toBe(1);
    expect(result.failedCount).toBe(1);
    expect(result.results.contradiction_detection.status).toBe('failed');
    expect(result.results.contradiction_detection.error.code).toBe('SKILL_HANDLER_FAILED');
  });

  test('attachSkillsToAnalysisResult enriches result while preserving decision-support boundaries', () => {
    const baseAnalysis = {
      schemaVersion: '2026-07-15',
      model: 'test-model',
      overallSummary: 'Base summary',
      sections: {},
    };

    const skillOutputs = {
      status: 'completed',
      requestedCount: 1,
      results: {
        fairness_detection: { status: 'ok' },
      },
    };

    const enriched = attachSkillsToAnalysisResult(baseAnalysis, skillOutputs);
    expect(enriched.schemaVersion).toBe('2026-07-15');
    expect(enriched.overallSummary).toBe('Base summary');
    expect(enriched.skills).toBeDefined();
    expect(enriched.skills.decisionSupportOnly).toBe(true);
    expect(enriched.skills.humanReviewRequired).toBe(true);
    expect(enriched.skills.irreversibleActionsAllowed).toBe(false);
  });

  test('attachSkillsToAnalysisResult returns original object if no skills executed', () => {
    const baseAnalysis = { schemaVersion: '2026-07-15' };
    const emptyOutputs = { requestedCount: 0 };
    expect(attachSkillsToAnalysisResult(baseAnalysis, emptyOutputs)).toEqual(baseAnalysis);
    expect(attachSkillsToAnalysisResult(baseAnalysis, null)).toEqual(baseAnalysis);
  });

  test('runDocumentIntelligencePipeline executes opt-in skills and attaches to completed run', async () => {
    let updatedPayload = null;
    const fakeClient = {
      from: jest.fn((table) => {
        if (table === 'document_analysis_runs') {
          return {
            insert: jest.fn(() => ({
              select: () => ({
                single: async () => ({
                  data: { id: 'run-1', status: 'processing' },
                  error: null,
                }),
              }),
            })),
            update: jest.fn((payload) => {
              updatedPayload = payload;
              return {
                eq: () => ({
                  select: () => ({
                    single: async () => ({
                      data: { id: 'run-1', ...payload },
                      error: null,
                    }),
                  }),
                }),
              };
            }),
          };
        }
        throw new Error(`Unexpected table ${table}`);
      }),
    };

    const mockAnalyzer = async () => ({
      schemaVersion: '2026-07-15',
      model: 'mock-model',
      overallSummary: 'Mock analysis completed',
    });

    const completed = await runDocumentIntelligencePipeline(
      {
        client: fakeClient,
        caseId: 'case-123',
        documentId: 'doc-123',
        userId: 'user-123',
        sourceMode: 'text',
        text: 'Document text for analysis.',
        skills: ['fairness_detection'],
      },
      {
        analyzer: mockAnalyzer,
      },
    );

    expect(completed.status).toBe('completed');
    expect(updatedPayload).toBeDefined();
    expect(updatedPayload.result.skills).toBeDefined();
    expect(updatedPayload.result.skills.decisionSupportOnly).toBe(true);
    expect(updatedPayload.result.skills.humanReviewRequired).toBe(true);
    expect(updatedPayload.result.skills.irreversibleActionsAllowed).toBe(false);
    expect(updatedPayload.result.skills.results.fairness_detection).toBeDefined();
  });

  test('runDocumentIntelligencePipeline completes successfully even if skills execution fails', async () => {
    let updatedPayload = null;
    const fakeClient = {
      from: jest.fn(() => ({
        insert: jest.fn(() => ({
          select: () => ({
            single: async () => ({
              data: { id: 'run-2', status: 'processing' },
              error: null,
            }),
          }),
        })),
        update: jest.fn((payload) => {
          updatedPayload = payload;
          return {
            eq: () => ({
              select: () => ({
                single: async () => ({
                  data: { id: 'run-2', ...payload },
                  error: null,
                }),
              }),
            }),
          };
        }),
      })),
    };

    const mockAnalyzer = async () => ({
      schemaVersion: '2026-07-15',
      model: 'mock-model',
      overallSummary: 'Analysis still completes',
    });

    const mockOrchestrator = {
      runSkill: async () => {
        throw new Error('Fatal skills crash');
      },
    };

    const completed = await runDocumentIntelligencePipeline(
      {
        client: fakeClient,
        caseId: 'case-123',
        userId: 'user-123',
        sourceMode: 'text',
        text: 'Document text for analysis.',
        skills: ['fairness_detection'],
      },
      {
        analyzer: mockAnalyzer,
        skillsOrchestrator: mockOrchestrator,
      },
    );

    // Document processing MUST NOT break!
    expect(completed.status).toBe('completed');
    expect(updatedPayload.status).toBe('completed');
    expect(updatedPayload.result.overallSummary).toBe('Analysis still completes');
    expect(updatedPayload.result.skills).toBeDefined();
    expect(updatedPayload.result.skills.decisionSupportOnly).toBe(true);
    expect(updatedPayload.result.skills.humanReviewRequired).toBe(true);
  });
});
