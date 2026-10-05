import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  FALLBACK_FLOW_ID,
  createPersonalAiSupportHandlers,
} = require('../../backend/personal-ai/support-handlers.js');

const safeFlow = {
  id: 'general-support',
  version: '1.0.0',
  label: 'General support',
  category: 'support',
  riskLevel: 'medium',
  escalationType: 'none',
  description: 'A scripted general support flow.',
  triggerHints: ['school stress'],
  requiresHumanHandoff: false,
  isCriticalSafetyFlow: false,
  firstResponse: 'We can think through one small next step together.',
  coreScript: [],
  followUpQuestions: ['Would one small next step feel helpful?'],
};

function createHandlers({
  consent = true,
  flows = [safeFlow],
  consentVerifierError = null,
} = {}) {
  return createPersonalAiSupportHandlers({
    catalog: {
      async listApprovedActiveFlows() {
        return flows;
      },
    },
    consentVerifier: {
      async hasActiveConsent(userId, purpose) {
        if (consentVerifierError) throw consentVerifierError;
        assert.equal(userId, 'authenticated-user');
        assert.equal(purpose, 'ai_support');
        return consent;
      },
    },
  });
}

test('flow listing exposes only the public flow contract', async () => {
  const handlers = createHandlers();
  const result = await handlers.getFlows({ userId: 'authenticated-user' });

  assert.equal(result.product, 'SafeSteps Personal AI Support');
  assert.deepEqual(result.flows[0], {
    id: 'general-support',
    label: 'General support',
    category: 'support',
    riskLevel: 'medium',
    escalationType: 'none',
    description: 'A scripted general support flow.',
    triggerHints: ['school stress'],
    requiresHumanHandoff: false,
    isCriticalSafetyFlow: false,
  });
  assert.equal('firstResponse' in result.flows[0], false);
});

test('chat requires both an affirmative request and server-verified consent', async () => {
  const handlers = createHandlers({ consent: false });

  await assert.rejects(
    handlers.chat({
      userId: 'authenticated-user',
      body: { message: 'I feel worried.', consentToAiSupport: true },
    }),
    error => error.code === 'CONSENT_REQUIRED' && error.statusCode === 403,
  );
  await assert.rejects(
    handlers.chat({
      userId: 'authenticated-user',
      body: { message: 'I feel worried.', consentToAiSupport: false },
    }),
    error => error.code === 'CONSENT_REQUIRED' && error.statusCode === 403,
  );
});

test('classification is deterministic and prioritizes urgent danger over a requested low-risk flow', async () => {
  const criticalFlow = {
    ...safeFlow,
    id: 'safety-review',
    riskLevel: 'critical',
    isCriticalSafetyFlow: true,
    requiresHumanHandoff: true,
  };
  const handlers = createHandlers({ flows: [safeFlow, criticalFlow] });
  const result = await handlers.classify({
    userId: 'authenticated-user',
    body: {
      message: 'Someone will hurt me right now.',
      context: { ageBand: 'adolescent', flowId: 'general-support' },
    },
  });

  assert.equal(result.riskLevel, 'critical');
  assert.equal(result.flowId, 'safety-review');
  assert.equal(result.requiresImmediateSafetyFlow, true);
  assert.equal(result.requiresHumanHandoff, true);
  assert.equal(result.escalationType, 'urgent_support');
  assert.equal(result.confidenceBasis, 'uncalibrated_rule_match');
  assert.equal(result.decisionSupportOnly, true);
  assert.deepEqual(result.matchedSignalIds, ['abuse']);
});

test('immediate danger uses the built-in safety response when no approved critical flow exists', async () => {
  const handlers = createHandlers();
  const result = await handlers.chat({
    userId: 'authenticated-user',
    body: {
      message: 'Someone will hurt me right now.',
      consentToAiSupport: true,
    },
  });

  assert.equal(result.flowId, FALLBACK_FLOW_ID);
  assert.equal(result.state, 'safety_check');
  assert.equal(result.riskLevel, 'critical');
  assert.equal(result.escalationType, 'urgent_support');
  assert.equal(result.requiresHumanHandoff, true);
  assert.match(result.assistantMessage, /local emergency services/i);
});

test('self-harm disclosures require human review without overstating immediate danger', async () => {
  const handlers = createHandlers();
  const result = await handlers.chat({
    userId: 'authenticated-user',
    body: {
      message: 'I have thought about hurting myself before.',
      consentToAiSupport: true,
    },
  });

  assert.equal(result.riskLevel, 'high');
  assert.equal(result.escalationType, 'human_review');
  assert.equal(result.requiresHumanHandoff, true);
  assert.equal(result.handoffStatus, 'offered');
  assert.equal(result.metadata.matchedSignalIds.includes('self_harm'), true);
  assert.match(result.assistantMessage, /trusted adult|trusted person/i);
});

test('chat returns a scripted, privacy-bounded response without claiming a handoff was queued', async () => {
  const handlers = createHandlers();
  const result = await handlers.chat({
    userId: 'authenticated-user',
    body: {
      message: 'I feel worried about school stress.',
      consentToAiSupport: true,
    },
  });

  assert.equal(result.riskLevel, 'medium');
  assert.equal(result.handoffStatus, 'not_offered');
  assert.equal(result.requiresHumanHandoff, false);
  assert.equal(result.shouldDocument, false);
  assert.equal(result.metadata.processingMode, 'deterministic_scripted');
  assert.equal(result.metadata.confidenceBasis, 'uncalibrated_rule_match');
  assert.equal(result.metadata.humanReviewRequired, true);
  assert.match(result.assistantMessage, /small next step together/i);
  assert.doesNotMatch(result.assistantMessage, /tell me your name|your address|what school/i);
});

test('sensitive disclosures use the safety policy and only offer, not create, a handoff', async () => {
  const handlers = createHandlers();
  const result = await handlers.chat({
    userId: 'authenticated-user',
    body: {
      message: 'Someone forced me and threatened me.',
      consentToAiSupport: true,
    },
  });

  assert.equal(result.riskLevel, 'high');
  assert.equal(result.handoffStatus, 'offered');
  assert.equal(result.requiresHumanHandoff, true);
  assert.equal(result.shouldDocument, false);
  assert.match(result.assistantMessage, /trusted adult|trusted person/i);
  assert.match(result.assistantMessage, /do not need to provide names/i);
});

test('uses a safe built-in fallback when no approved flow is available', async () => {
  const handlers = createHandlers({ flows: [] });
  const result = await handlers.chat({
    userId: 'authenticated-user',
    body: {
      message: 'Someone is hurting me right now.',
      consentToAiSupport: true,
    },
  });

  assert.equal(result.flowId, FALLBACK_FLOW_ID);
  assert.equal(result.riskLevel, 'critical');
  assert.match(result.assistantMessage, /local emergency services/i);
});

test('filters unsafe follow-up prompts from an active flow', async () => {
  const unsafeFollowUpFlow = {
    ...safeFlow,
    followUpQuestions: ['Tell me your address so I can help.'],
  };
  const handlers = createHandlers({ flows: [unsafeFollowUpFlow] });
  const result = await handlers.chat({
    userId: 'authenticated-user',
    body: { message: 'I feel worried.', consentToAiSupport: true },
  });

  assert.doesNotMatch(result.assistantMessage, /tell me your address/i);
});

test('fails closed when consent or flow dependencies are unavailable', async () => {
  const withoutAdapters = createPersonalAiSupportHandlers();
  await assert.rejects(
    withoutAdapters.getFlows({ userId: 'authenticated-user' }),
    error => error.code === 'SERVICE_UNAVAILABLE' && error.statusCode === 503,
  );

  const consentStoreFailed = createHandlers({ consentVerifierError: new Error('database unavailable') });
  await assert.rejects(
    consentStoreFailed.classify({
      userId: 'authenticated-user',
      body: { message: 'Can you help?' },
    }),
    error => error.code === 'SERVICE_UNAVAILABLE' && error.statusCode === 503,
  );
});

test('flow listing fails closed when the approved catalog is unavailable or invalid', async () => {
  const unavailableCatalog = createPersonalAiSupportHandlers({
    catalog: {
      async listApprovedActiveFlows() {
        throw new Error('catalog unavailable');
      },
    },
    consentVerifier: { async hasActiveConsent() { return true; } },
  });
  const invalidCatalog = createHandlers({
    flows: [{ ...safeFlow, riskLevel: 'unrecognized' }],
  });

  for (const handlers of [unavailableCatalog, invalidCatalog]) {
    await assert.rejects(
      handlers.getFlows({ userId: 'authenticated-user' }),
      error => error.code === 'SERVICE_UNAVAILABLE' && error.statusCode === 503,
    );
  }
});

test('rejects missing and oversized messages', async () => {
  const handlers = createHandlers();
  await assert.rejects(
    handlers.classify({ userId: 'authenticated-user', body: { message: '  ' } }),
    error => error.code === 'VALIDATION_ERROR' && error.statusCode === 400,
  );
  await assert.rejects(
    handlers.classify({
      userId: 'authenticated-user',
      body: { message: 'x'.repeat(1201) },
    }),
    error => error.code === 'VALIDATION_ERROR' && error.statusCode === 400,
  );
});
