import { analyzeFairnessDocument } from '../Services/DocumentIntelligence/FairnessEngine.js';
import { scoreCaseRisk } from '../case-risk/engine.js';
import { createSkillsOrchestrator } from './orchestrator.js';
import { getSkill, listSkillsByGroup, SKILL_GROUPS } from './registry.js';

export const DOCUMENT_INTELLIGENCE_SKILLS = Object.freeze([
  'fairness_detection',
  'contradiction_detection',
  'evidence_extraction',
  'requirement_extraction',
  'timeline_extraction',
  'risk_assessment',
  'concern_classification',
  'unrealistic_expectation_detection',
]);

function parseEngineOutput(raw) {
  if (typeof raw !== 'string') return raw;
  const trimmed = raw.trim();
  let clean = trimmed;
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  try {
    return JSON.parse(clean);
  } catch {
    return { raw };
  }
}

export function createDefaultDocumentSkillHandlers() {
  return {
    fairness_detection: async ({ input }) => {
      const text = input.text || '';
      const analysis = analyzeFairnessDocument(text);
      const allIndicators = [
        ...(analysis.bias_indicators || []),
        ...(analysis.coercion_flags || []),
        ...(analysis.discrimination_risks || []),
        ...(analysis.framing_concerns || []),
        ...(analysis.unrealistic_expectations || []),
      ];
      return {
        fairnessScore: analysis.fairness_score,
        concerns: analysis.framing_concerns || [],
        biasIndicators: analysis.bias_indicators || [],
        coercionIndicators: analysis.coercion_flags || [],
        discriminationIndicators: analysis.discrimination_risks || [],
        unrealisticExpectations: analysis.unrealistic_expectations || [],
        recommendations: analysis.remediation_recommendations || [],
        rulesTriggeredCount: allIndicators.length,
        limitations: analysis.limitations,
        decisionSupportOnly: true,
      };
    },

    contradiction_detection: async ({ input }) => {
      const { detectContradictions } = await import('../Services/DocumentIntelligence/ContradictionEngine.js');
      const raw = await detectContradictions(input.text || '');
      return parseEngineOutput(raw);
    },

    evidence_extraction: async ({ input }) => {
      const { extractEvidence } = await import('../Services/DocumentIntelligence/EvidenceExtractionEngine.js');
      const raw = await extractEvidence(input.text || '');
      return parseEngineOutput(raw);
    },

    requirement_extraction: async ({ input }) => {
      const { extractRequirements } = await import('../Services/DocumentIntelligence/RequirementsExtractionEngine.js');
      const raw = await extractRequirements(input.text || '');
      return parseEngineOutput(raw);
    },

    timeline_extraction: async ({ input }) => {
      const { extractTimeline } = await import('../Services/DocumentIntelligence/TimelineExtractionEngine.js');
      const raw = await extractTimeline(input.text || '');
      return parseEngineOutput(raw);
    },

    risk_assessment: async ({ input }) => {
      let modelResult = null;
      if (input.text) {
        try {
          const { assessRisk } = await import('../Services/DocumentIntelligence/RiskAssessmentEngine.js');
          const raw = await assessRisk(input.text);
          modelResult = parseEngineOutput(raw);
        } catch (err) {
          modelResult = { note: 'Text risk model evaluation unavailable', error: err?.message };
        }
      }

      const deterministicScoring = scoreCaseRisk({
        behavioralCues: input.behavioralCues || input.signals?.behavioral || [],
        contextualFactors: input.contextualFactors || input.signals?.contextual || [],
        protectiveFactors: input.protectiveFactors || input.signals?.protective || [],
        recentEvents: input.recentEvents || [],
        hardFlags: input.hardFlags || [],
      });

      return {
        modelResult,
        deterministicRisk: deterministicScoring,
        decisionSupportOnly: true,
      };
    },

    concern_classification: async ({ input }) => {
      const { classifyConcerns } = await import('../Services/DocumentIntelligence/ConcernClassificationEngine.js');
      const raw = await classifyConcerns(input.text || '');
      return parseEngineOutput(raw);
    },

    unrealistic_expectation_detection: async ({ input }) => {
      const { detectUnrealisticExpectations } = await import('../Services/DocumentIntelligence/UnrealisticExpectationEngine.js');
      const raw = await detectUnrealisticExpectations(input.text || '');
      return parseEngineOutput(raw);
    },
  };
}

export function createDocumentSkillsOrchestrator(customHandlers = {}) {
  const defaults = createDefaultDocumentSkillHandlers();
  const handlers = { ...defaults, ...customHandlers };
  return createSkillsOrchestrator({ handlers });
}

export function normalizeRequestedSkills(skills) {
  if (!skills) return [];
  if (skills === true || skills === 'all' || skills === SKILL_GROUPS.document_intelligence) {
    return [...DOCUMENT_INTELLIGENCE_SKILLS];
  }
  if (typeof skills === 'string') {
    return [skills.trim()].filter(Boolean);
  }
  if (Array.isArray(skills)) {
    return skills.map((s) => (typeof s === 'string' ? s.trim() : s?.id || '')).filter(Boolean);
  }
  if (typeof skills === 'object' && skills !== null) {
    return Object.entries(skills)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([skillId]) => skillId.trim())
      .filter(Boolean);
  }
  return [];
}

export async function executeRequestedDocumentSkills({
  text,
  documentId,
  caseId,
  skills,
  orchestrator,
  context = {},
}) {
  const requested = normalizeRequestedSkills(skills);
  if (requested.length === 0) {
    return {
      status: 'none_requested',
      decisionSupportOnly: true,
      humanReviewRequired: true,
      requestedCount: 0,
      executedCount: 0,
      successCount: 0,
      blockedCount: 0,
      failedCount: 0,
      results: {},
    };
  }

  const runner = orchestrator || createDocumentSkillsOrchestrator();
  const results = {};

  for (const skillId of requested) {
    try {
      const skillDef = getSkill(skillId);
      const execution = await runner.runSkill({
        skillId,
        input: {
          text,
          documentId,
          caseId,
        },
        context,
      });

      results[skillId] = {
        skillId,
        description: skillDef?.description || null,
        group: skillDef?.group || null,
        ...execution,
      };
    } catch (err) {
      results[skillId] = {
        skillId,
        status: 'failed',
        error: {
          code: 'UNEXPECTED_SKILL_ERROR',
          message: err?.message || `Unexpected error running skill ${skillId}`,
        },
        automation: {
          irreversibleActionsAllowed: false,
          humanReviewCheckpointRequired: true,
        },
        policy: {
          decisionSupportOnly: true,
          humanReviewRequired: true,
        },
      };
    }
  }

  const resultList = Object.values(results);
  const successCount = resultList.filter((r) => r.status === 'ok').length;
  const blockedCount = resultList.filter((r) => r.status === 'blocked').length;
  const failedCount = resultList.filter((r) => r.status === 'failed').length;

  return {
    status: failedCount > 0 ? (successCount > 0 ? 'partial_success' : 'failed') : 'completed',
    decisionSupportOnly: true,
    humanReviewRequired: true,
    irreversibleActionsAllowed: false,
    requestedCount: requested.length,
    executedCount: resultList.length,
    successCount,
    blockedCount,
    failedCount,
    results,
  };
}

export function attachSkillsToAnalysisResult(result, skillOutputs) {
  if (!result || typeof result !== 'object') return result;
  if (!skillOutputs || skillOutputs.requestedCount === 0) return result;

  return {
    ...result,
    skills: {
      ...skillOutputs,
      decisionSupportOnly: true,
      humanReviewRequired: true,
      irreversibleActionsAllowed: false,
    },
  };
}

export default {
  DOCUMENT_INTELLIGENCE_SKILLS,
  attachSkillsToAnalysisResult,
  createDefaultDocumentSkillHandlers,
  createDocumentSkillsOrchestrator,
  executeRequestedDocumentSkills,
  normalizeRequestedSkills,
};
