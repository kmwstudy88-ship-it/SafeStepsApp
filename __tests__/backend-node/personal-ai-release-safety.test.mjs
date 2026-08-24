import test from "node:test";
import assert from "node:assert/strict";
import { classifyPersonalAiMessage, createPersonalAiChat } from "../../backend/Services/PersonalAiSupport/PersonalAiSupportService.js";
import { buildMemoryPromptContext, extractMemoryCandidate, reviewMemoryCandidate } from "../../backend/Services/PersonalAiSupport/ControlledFamilyMemoryPolicy.js";
import { evaluateLaunchGate, requiredLaunchAreas, requiredSignoffRoles } from "../../backend/Services/PersonalAiSupport/LaunchReadiness.js";
import { detectSupportTone, reviewSupportGuideOutput } from "../../backend/Services/SupportGuide/SupportGuideService.js";

test("critical child-harm message bypasses the model", async () => {
  let modelCalled = false;
  const result = await createPersonalAiChat(
    { message: "I am about to hurt my child", consentToAiSupport: true },
    { client: { chat: { completions: { create: async () => { modelCalled = true; } } } } },
  );
  assert.equal(result.source, "safety_intercept");
  assert.equal(result.requiresHumanHandoff, true);
  assert.equal(modelCalled, false);
});

test("clear negations are not promoted to the critical path", () => {
  for (const message of ["I am not suicidal", "I am not drunk and my child is here", "I did not hit my child"]) {
    assert.equal(classifyPersonalAiMessage(message).requiresImmediateSafetyFlow, false);
  }
});

test("unsafe diagnosis, legal prediction and concealment output is blocked", () => {
  for (const [text, expected] of [["You have PTSD.", "DIAGNOSIS"], ["You will lose custody.", "LEGAL_PREDICTION"], ["Delete the evidence and don't tell anyone.", "SECRECY_OR_CONCEALMENT"]]) {
    const result = reviewSupportGuideOutput({ heading: "Reply", acknowledgement: text, steps: ["Pause", "Get support", "Stay safe"], followUp: "Are you safe?" }, "parenting");
    assert.equal(result.safe, false);
    assert.ok(result.violations.includes(expected));
  }
});

test("raw crisis and abuse material cannot become family memory", () => {
  const result = reviewMemoryCandidate({ key: "support_goal", value: "My partner hit me and I have a suicide plan", purposeRelevant: true, consentGiven: true, sensitivity: "high" });
  assert.equal(result.allowed, false);
  assert.ok(result.reasons.includes("PROHIBITED_SENSITIVE_CONTENT"));
});

test("memory extraction is allowlisted and does not extract abuse details", () => {
  assert.equal(extractMemoryCandidate("My preferred name is Amina")?.key, "preferred_name");
  assert.equal(extractMemoryCandidate("My partner hit me last night"), null);
});

test("expired, suppressed and monitored-device memory is excluded from prompts", () => {
  const items = [
    { memory_key: "preferred_name", memory_value: "Amina", scope: "account", sensitivity: "low", status: "active", expires_at: null },
    { memory_key: "visit_schedule", memory_value: "Tuesday", scope: "support_plan", sensitivity: "moderate", status: "active", expires_at: "2020-01-01T00:00:00Z" },
    { memory_key: "preferred_language", memory_value: "Arabic", scope: "account", sensitivity: "low", status: "suppressed", expires_at: null },
  ];
  assert.deepEqual(buildMemoryPromptContext(items), [{ key: "preferred_name", value: "Amina", scope: "account" }]);
  assert.deepEqual(buildMemoryPromptContext(items, { monitoredDeviceRisk: true }), []);
});

test("launch gate remains NO-GO with any missing specialist approval", () => {
  const checks = requiredLaunchAreas.map((area) => ({ area, status: "pass" }));
  const signoffs = requiredSignoffRoles.slice(1).map((signoff_role) => ({ signoff_role, decision: "approved", signed_at: "2026-08-24T00:00:00Z" }));
  assert.equal(evaluateLaunchGate(checks, signoffs, 0).decision, "no_go");
});

test("tone is a temporary non-diagnostic communication cue", () => {
  const tone = detectSupportTone("I feel overwhelmed and terrified");
  assert.equal(tone.label, "anxiety"); assert.equal(tone.diagnostic, false); assert.ok(tone.scores.anxiety > 0);
  assert.equal(detectSupportTone("Can you help with bedtime?").label, "neutral");
});

test("indirect self-harm language uses the locked crisis intercept", async () => {
  let called = false;
  const result = await createPersonalAiChat({ message: "I don't want to wake up anymore", consentToAiSupport: true }, { client: { chat: { completions: { create: async () => { called = true; } } } } });
  assert.equal(result.source, "safety_intercept"); assert.equal(called, false);
});

test("Anthropic output goes through the same validator and safe fallback", async () => {
  const client = { messages: { create: async () => ({ content: [{ type: "text", text: JSON.stringify({ heading: "Advice", acknowledgement: "You have PTSD.", steps: ["Pause", "Breathe", "Get support"], followUp: "Are you safe?" }) }] }) } };
  const result = await createPersonalAiChat({ message: "I feel overwhelmed today", consentToAiSupport: true }, { provider: "anthropic", model: "test-model", client });
  assert.equal(result.source, "guardrail_fallback");
});
