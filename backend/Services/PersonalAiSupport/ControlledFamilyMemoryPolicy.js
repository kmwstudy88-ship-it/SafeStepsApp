const allowedKeys = new Set(["preferred_name","pronouns","preferred_language","timezone","accessibility_need","support_goal","visit_schedule","appointment_reminder","safe_contact_label","coping_preference","caseworker_meeting_day","court_goal","visit_support_preference","dv_safe_mode","monitored_device_risk","safe_words_only","communication_limitation"]);
const forbiddenContent = /\b(diagnos(?:is|ed)|ptsd|bipolar|court will|custody will|hit me|raped|sexually abused|suicide plan|weapon location|hide (this|evidence)|secret legal strategy)\b/i;

export function reviewMemoryCandidate(candidate) {
  const key = String(candidate?.key ?? "").trim(); const value = String(candidate?.value ?? "").trim();
  const reasons = [];
  if (!allowedKeys.has(key)) reasons.push("KEY_NOT_ALLOWLISTED");
  if (!candidate?.purposeRelevant) reasons.push("PURPOSE_NOT_ESTABLISHED");
  if (candidate?.consentGiven !== true) reasons.push("CONSENT_REQUIRED");
  if (!["low","moderate","high"].includes(candidate?.sensitivity)) reasons.push("SENSITIVITY_NOT_STORABLE");
  if (candidate?.monitoredDeviceRisk && candidate?.sensitivity !== "low") reasons.push("MONITORED_DEVICE_RISK");
  if (!value || value.length > 500) reasons.push("INVALID_VALUE_LENGTH");
  if (forbiddenContent.test(value)) reasons.push("PROHIBITED_SENSITIVE_CONTENT");
  return { allowed: reasons.length === 0, reasons };
}

export function redactMemoryForDisplay(item, discreet = false) {
  if (discreet && item.sensitivity !== "low") return null;
  return { ...item, memory_value: discreet ? "Saved preference" : item.memory_value, source_message_id: undefined };
}

export function extractMemoryCandidate(text) {
  const clean = String(text ?? "").normalize("NFKC").replace(/\s+/g, " ").trim();
  if (!clean || forbiddenContent.test(clean)) return null;
  const patterns = [
    { regex: /^(?:my preferred name is|please call me)\s+(.{1,80})$/i, key: "preferred_name", scope: "account", sensitivity: "low", rationale: "Use the person's preferred name" },
    { regex: /^please use (simple english|short sentences|one question at a time)$/i, key: "communication_limitation", scope: "account", sensitivity: "low", rationale: "Adapt future support communication" },
    { regex: /^i need (large text|high contrast|reduced motion)$/i, key: "accessibility_need", scope: "account", sensitivity: "low", rationale: "Apply an accessibility preference" },
    { regex: /^my visits are on\s+(.{1,120})$/i, key: "visit_schedule", scope: "support_plan", sensitivity: "moderate", rationale: "Support visit preparation" },
    { regex: /^my caseworker meeting is\s+(.{1,120})$/i, key: "caseworker_meeting_day", scope: "support_plan", sensitivity: "moderate", rationale: "Support meeting preparation" },
  ];
  for (const pattern of patterns) {
    const match = clean.match(pattern.regex); if (!match) continue;
    return { key: pattern.key, value: match[1].trim(), rationale: pattern.rationale, scope: pattern.scope, sensitivity: pattern.sensitivity, consentRequired: true, purposeRelevant: true };
  }
  return null;
}

export function buildMemoryPromptContext(memories, options = {}) {
  const now = options.now instanceof Date ? options.now : new Date();
  if (options.monitoredDeviceRisk) return [];
  return (memories ?? []).filter((item) => item.status === "active")
    .filter((item) => ["low", "moderate"].includes(item.sensitivity))
    .filter((item) => !item.expires_at || new Date(item.expires_at) > now)
    .filter((item) => allowedKeys.has(item.memory_key) && !forbiddenContent.test(String(item.memory_value ?? "")))
    .map((item) => ({ key: item.memory_key, value: item.memory_value, scope: item.scope }));
}

export const CONTROLLED_MEMORY_PROMPT_RULE = "Suggest only minimal, useful and consented preferences or plans. Never store raw abuse/crisis disclosures, diagnoses, allegations, legal predictions, or content that could increase danger. When uncertain, keep it ephemeral.";
