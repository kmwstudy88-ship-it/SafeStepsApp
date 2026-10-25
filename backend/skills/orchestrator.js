import { getSkill } from './registry.js';
import { evaluateSafetyPolicy } from './safety-gates.js';

export const ORCHESTRATOR_VERSION = 'skills-orchestrator-v1';

function validateSkillInput(skill, input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return ['input must be a JSON object'];
  }
  if (skill.id === 'risk_assessment' && typeof input.text === 'string' && input.text.trim()) {
    return [];
  }

  return (skill.input.required || []).flatMap((field) => {
    const value = input[field];
    const emptyString = typeof value === 'string' && !value.trim();
    const missingValue = value === undefined || value === null || emptyString;
    const emptyArray = Array.isArray(value) && value.length === 0;
    const wrongType =
      (['text', 'message', 'artifact', 'caseId'].includes(field) && typeof value !== 'string') ||
      (field === 'documents' && (!Array.isArray(value) || value.length < 2)) ||
      (field === 'documentIds' && (!Array.isArray(value) || value.length === 0)) ||
      (field === 'event' && (typeof value !== 'object' || Array.isArray(value)));
    if (missingValue || emptyArray || wrongType) return [`${field} is required with a valid value`];
    return [];
  });
}

function normalizeSkillInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return input;
  const normalized = { ...input };
  for (const [canonical, legacy] of [
    ['caseId', 'case_id'],
    ['documentId', 'document_id'],
    ['documentIds', 'document_ids'],
  ]) {
    if (normalized[canonical] === undefined && normalized[legacy] !== undefined) {
      normalized[canonical] = normalized[legacy];
    }
  }
  return normalized;
}

function attachSourceSpans(value, input, inheritedDocumentId) {
  if (Array.isArray(value)) {
    return value.map((item) => attachSourceSpans(item, input, inheritedDocumentId));
  }
  if (!value || typeof value !== 'object') return value;

  const result = Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      attachSourceSpans(item, input, value.documentId || value.doc_id || inheritedDocumentId),
    ]),
  );
  const evidence = [result.evidence, result.quote, result.source_text]
    .find((item) => typeof item === 'string' && item.length > 0);
  const sourceText = [
    input.text,
    input.message,
    input.artifact,
    ...(Array.isArray(input.documents) ? input.documents.map((document) => document?.text) : []),
  ].find((item) => typeof item === 'string' && item.length > 0) || '';
  const start = evidence && sourceText.indexOf(evidence);
  if (start >= 0 && !result.source_span) {
    const documentId = inheritedDocumentId || input.documentId || input.documents?.find?.((document) => document?.text === sourceText)?.id;
    result.source_span = documentId
      ? { doc_id: documentId, start, end: start + evidence.length }
      : { start, end: start + evidence.length };
  }
  return result;
}

export function createSkillsOrchestrator({ handlers = {} } = {}) {
  function summarizeInput(input = {}) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
    return {
      fields: Object.keys(input),
      caseId: typeof input.caseId === 'string' ? input.caseId : undefined,
      documentId: typeof input.documentId === 'string' ? input.documentId : undefined,
    };
  }

  async function runSkill({ skillId, input: providedInput = {}, context = {} }) {
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

    const input = normalizeSkillInput(providedInput);
    const inputErrors = validateSkillInput(skill, input);
    if (inputErrors.length) {
      return {
        status: 'failed',
        error: { code: 'SKILL_INPUT_INVALID', message: inputErrors.join('; ') },
        skill,
      };
    }

    const preflightPolicy = evaluateSafetyPolicy({ skill, input, output: null });
    if (preflightPolicy.requiresEscalationReview && skill.id !== 'disclosure_sensitive') {
      return {
        status: 'blocked',
        orchestratorVersion: ORCHESTRATOR_VERSION,
        skill,
        inputSummary: summarizeInput(input),
        output: null,
        run_meta: {
          skill_version: '1.0.0',
          model: 'preflight-safety-gate',
          timestamp_utc: new Date().toISOString(),
        },
        policy: preflightPolicy,
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
    const blocked =
      policy.automationBlockedReasons.length > 0 ||
      policy.requiresEscalationReview ||
      policy.disclosureSignals.length > 0;
    const output = attachSourceSpans(result, input, input.documentId);
    const runMeta = {
      skill_version: '1.0.0',
      model: 'model-not-reported',
      timestamp_utc: new Date().toISOString(),
    };

    return {
      status: blocked ? 'blocked' : 'ok',
      orchestratorVersion: ORCHESTRATOR_VERSION,
      skill,
      inputSummary: summarizeInput(input),
      output,
      run_meta: runMeta,
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
    handlers,
  };
}

export default {
  ORCHESTRATOR_VERSION,
  createSkillsOrchestrator,
};
