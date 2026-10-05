'use strict';

const {
  buildChildSafeResponse,
  detectDisclosureSignals,
  deriveAgeBand,
  hasImmediateDanger,
  privacyBoundaryNotice,
  removeUnsafePrompts,
} = require('./child-safe-policy');

const FALLBACK_FLOW_ID = 'safe-support-fallback';
const MAX_MESSAGE_LENGTH = 1200;
const RISK_ORDER = { low: 0, medium: 1, high: 2, critical: 3 };
const DISTRESS_PATTERN = /\b(?:sad|upset|worried|anxious|lonely|overwhelmed|confused|stressed|angry|need help)\b/i;

class PersonalAiSupportError extends Error {
  constructor(code, message, statusCode) {
    super(message);
    this.name = 'PersonalAiSupportError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

function unavailable() {
  return new PersonalAiSupportError(
    'SERVICE_UNAVAILABLE',
    'Personal AI support is not configured for use.',
    503,
  );
}

function validateMessage(message) {
  if (typeof message !== 'string' || message.trim().length === 0 || message.length > MAX_MESSAGE_LENGTH) {
    throw new PersonalAiSupportError(
      'VALIDATION_ERROR',
      `message must contain between 1 and ${MAX_MESSAGE_LENGTH} characters.`,
      400,
    );
  }
  return message.trim();
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalize(text) {
  return String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function classifyRisk(message) {
  const signals = detectDisclosureSignals(message);
  const immediateDanger = hasImmediateDanger(message);
  const distressed = DISTRESS_PATTERN.test(message);

  if (immediateDanger) {
    return {
      riskLevel: 'critical',
      intent: 'immediate_safety',
      confidence: 0.9,
      signals,
      immediateDanger,
      reasons: ['immediate_danger_indicator'],
    };
  }
  if (signals.length > 0) {
    return {
      riskLevel: 'high',
      intent: signals.includes('self_harm') ? 'self_harm_support' : 'safety_support',
      confidence: 0.8,
      signals,
      immediateDanger,
      reasons: ['sensitive_disclosure_indicator'],
    };
  }
  if (distressed) {
    return {
      riskLevel: 'medium',
      intent: 'emotional_support',
      confidence: 0.65,
      signals,
      immediateDanger,
      reasons: ['distress_language_indicator'],
    };
  }
  return {
    riskLevel: 'low',
    intent: 'general_support',
    confidence: 0.55,
    signals,
    immediateDanger,
    reasons: ['no_safety_indicator_matched'],
  };
}

function flowMatchesMessage(flow, message) {
  const text = normalize(message);
  return (flow.triggerHints || []).some(hint => {
    const normalizedHint = normalize(hint);
    return normalizedHint.length > 0 && text.includes(normalizedHint);
  });
}

function selectFlow(flows, message, riskLevel, requestedFlowId) {
  const riskMatchedFlows = flows.filter(flow => flow.riskLevel === riskLevel
    && (riskLevel !== 'critical' || flow.isCriticalSafetyFlow));
  if (riskLevel === 'critical') return riskMatchedFlows[0] || null;
  const requested = requestedFlowId && riskMatchedFlows.find(flow => flow.id === requestedFlowId);
  if (requested) return requested;
  return riskMatchedFlows.find(flow => flowMatchesMessage(flow, message)) || null;
}

function escalationFor(riskLevel, flow) {
  if (riskLevel === 'critical') return 'urgent_support';
  if (riskLevel === 'high') return 'human_review';
  if (flow?.requiresHumanHandoff) return flow.escalationType === 'none' ? 'human_review' : flow.escalationType;
  return 'none';
}

function classifyMessage(message, context, flows, requestedFlowId) {
  const risk = classifyRisk(message);
  const flow = selectFlow(flows, message, risk.riskLevel, requestedFlowId);
  const escalationType = escalationFor(risk.riskLevel, flow);
  const requiresHumanHandoff = risk.riskLevel === 'high'
    || risk.riskLevel === 'critical'
    || Boolean(flow?.requiresHumanHandoff);

  return {
    flow,
    result: {
      intent: risk.intent,
      riskLevel: risk.riskLevel,
      confidence: risk.confidence,
      confidenceBasis: 'uncalibrated_rule_match',
      escalationType,
      flowId: flow?.id || FALLBACK_FLOW_ID,
      additionalFlowIds: [],
      requiresImmediateSafetyFlow: risk.immediateDanger,
      requiresHumanHandoff,
      needsClarification: false,
      matchedSignalIds: risk.signals,
      reasons: risk.reasons,
      decisionSupportOnly: true,
    },
  };
}

function buildSupportResponse({ message, flow, riskLevel, context }) {
  const ageBand = deriveAgeBand(context);
  const draft = flow?.firstResponse
    || flow?.coreScript?.[0]
    || 'We can take one small step at a time. You can pause or stop whenever you want.';

  if (riskLevel === 'high' || riskLevel === 'critical') {
    return buildChildSafeResponse({
      userMessage: message,
      draftResponse: draft,
      context,
    }).response;
  }

  const safeDraft = removeUnsafePrompts(draft);
  const validation = ageBand === 'early_child'
    ? 'It is okay to ask for help.'
    : 'It is okay to ask for support.';
  const followUp = riskLevel === 'medium'
    ? removeUnsafePrompts(flow?.followUpQuestions?.[0] || 'Would one small next step feel helpful?')
    : '';
  return [validation, safeDraft, followUp, privacyBoundaryNotice(ageBand)]
    .filter(Boolean)
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function publicFlow(flow) {
  return {
    id: flow.id,
    label: flow.label,
    category: flow.category,
    riskLevel: flow.riskLevel,
    escalationType: flow.escalationType,
    description: flow.description,
    triggerHints: flow.triggerHints,
    requiresHumanHandoff: flow.requiresHumanHandoff,
    isCriticalSafetyFlow: flow.isCriticalSafetyFlow,
    ...(flow.uiChipLabel ? { uiChipLabel: flow.uiChipLabel } : {}),
  };
}

function validateFlows(flows) {
  const validRiskLevels = Object.keys(RISK_ORDER);
  const validEscalations = ['none', 'human_review', 'trusted_adult', 'urgent_support'];
  return Array.isArray(flows) && flows.every(flow => isRecord(flow)
    && typeof flow.id === 'string'
    && typeof flow.version === 'string'
    && typeof flow.label === 'string'
    && typeof flow.category === 'string'
    && validRiskLevels.includes(flow.riskLevel)
    && validEscalations.includes(flow.escalationType)
    && typeof flow.description === 'string'
    && (flow.uiChipLabel === undefined || typeof flow.uiChipLabel === 'string')
    && Array.isArray(flow.triggerHints) && flow.triggerHints.every(item => typeof item === 'string')
    && typeof flow.requiresHumanHandoff === 'boolean'
    && typeof flow.isCriticalSafetyFlow === 'boolean'
    && typeof flow.firstResponse === 'string'
    && Array.isArray(flow.coreScript) && flow.coreScript.every(item => typeof item === 'string')
    && Array.isArray(flow.followUpQuestions) && flow.followUpQuestions.every(item => typeof item === 'string'));
}

function createPersonalAiSupportHandlers({ catalog, consentVerifier } = {}) {
  async function requireDependencies() {
    if (typeof catalog?.listApprovedActiveFlows !== 'function'
      || typeof consentVerifier?.hasActiveConsent !== 'function') {
      throw unavailable();
    }
  }

  async function loadFlows() {
    await requireDependencies();
    let flows;
    try {
      flows = await catalog.listApprovedActiveFlows();
    } catch {
      throw unavailable();
    }
    if (!validateFlows(flows)) throw unavailable();
    return flows;
  }

  async function requireSupportConsent(userId) {
    if (typeof userId !== 'string' || userId.trim().length === 0) {
      throw new PersonalAiSupportError('UNAUTHORIZED', 'Authenticated user is required.', 401);
    }
    await requireDependencies();
    let consented;
    try {
      consented = await consentVerifier.hasActiveConsent(userId, 'ai_support');
    } catch {
      throw unavailable();
    }
    if (consented !== true) {
      throw new PersonalAiSupportError(
        'CONSENT_REQUIRED',
        'Current consent to Personal AI support is required.',
        403,
      );
    }
  }

  async function getFlows({ userId } = {}) {
    if (typeof userId !== 'string' || userId.trim().length === 0) {
      throw new PersonalAiSupportError('UNAUTHORIZED', 'Authenticated user is required.', 401);
    }
    const flows = await loadFlows();
    return {
      version: '1.0',
      product: 'SafeSteps Personal AI Support',
      flows: flows.map(publicFlow),
    };
  }

  async function classify({ userId, body } = {}) {
    await requireSupportConsent(userId);
    if (!isRecord(body)) {
      throw new PersonalAiSupportError('VALIDATION_ERROR', 'Request body must be an object.', 400);
    }
    const message = validateMessage(body.message);
    const context = isRecord(body.context) ? body.context : {};
    const flows = await loadFlows();
    return classifyMessage(message, context, flows, context.flowId).result;
  }

  async function chat({ userId, body } = {}) {
    if (!isRecord(body)) {
      throw new PersonalAiSupportError('VALIDATION_ERROR', 'Request body must be an object.', 400);
    }
    if (body.consentToAiSupport !== true) {
      throw new PersonalAiSupportError(
        'CONSENT_REQUIRED',
        'Current consent to Personal AI support is required.',
        403,
      );
    }
    await requireSupportConsent(userId);

    const message = validateMessage(body.message);
    const context = isRecord(body.context) ? body.context : {};
    const flows = await loadFlows();
    const classified = classifyMessage(message, context, flows, body.flowId || context.flowId);
    const riskLevel = classified.result.riskLevel;
    const handoffOffered = classified.result.requiresHumanHandoff;

    return {
      flowId: classified.result.flowId,
      state: riskLevel === 'critical' ? 'safety_check' : riskLevel === 'high' ? 'escalate' : 'support',
      assistantMessage: buildSupportResponse({
        message,
        flow: classified.flow,
        riskLevel,
        context,
      }),
      riskLevel,
      escalationType: classified.result.escalationType,
      requiresHumanHandoff: handoffOffered,
      shouldDocument: false,
      completionState: 'in_progress',
      handoffStatus: handoffOffered ? 'offered' : 'not_offered',
      metadata: {
        intent: classified.result.intent,
        confidence: classified.result.confidence,
        confidenceBasis: classified.result.confidenceBasis,
        matchedSignalIds: classified.result.matchedSignalIds,
        processingMode: 'deterministic_scripted',
        decisionSupportOnly: true,
        humanReviewRequired: true,
      },
    };
  }

  return { getFlows, classify, chat };
}

module.exports = {
  FALLBACK_FLOW_ID,
  PersonalAiSupportError,
  classifyMessage,
  createPersonalAiSupportHandlers,
};
