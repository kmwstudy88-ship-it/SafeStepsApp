import express from "express";

import { badRequest } from "../../lib/apiError.js";
import { createSafeStepsServiceClient } from "../../lib/supabase.js";
import { supportGuideRateLimit } from "../../middleware/supportGuideRateLimit.js";
import {
  classifyPersonalAiMessage,
  createPersonalAiChat,
  personalAiFlows,
} from "../../Services/PersonalAiSupport/PersonalAiSupportService.js";
import { buildMemoryPromptContext, extractMemoryCandidate, redactMemoryForDisplay, reviewMemoryCandidate } from "../../Services/PersonalAiSupport/ControlledFamilyMemoryPolicy.js";
import { evaluateLaunchGate, requiredLaunchAreas } from "../../Services/PersonalAiSupport/LaunchReadiness.js";

const router = express.Router();
const handoffStatuses = new Set(["queued", "assigned", "in_review", "resolved", "escalated_to_emergency", "closed"]);
const flowStatuses = new Set(["draft", "in_review"]);
const criticalTemplateKeys = new Set(["child_abuse_disclosure", "self_harm_warning", "parent_may_hurt_child", "intoxicated_with_child_present", "active_dv_danger", "dv_monitored_device_risk", "critical_critical_unclear"]);

function requireDatabase(req) {
  if (!req.safeStepsAuth?.supabase || !req.safeStepsAuth?.user?.id) throw Object.assign(new Error("Handoff persistence is unavailable in local bypass mode."), { statusCode: 503, code: "PERSISTENCE_UNAVAILABLE" });
  return { client: req.safeStepsAuth.supabase, userId: req.safeStepsAuth.user.id };
}

function requireSupportRole(req) {
  const allowed = req.safeStepsAuth?.roles?.some((role) => ["facilitator", "caseworker", "admin"].includes(role));
  if (!allowed) throw Object.assign(new Error("A support-team role is required."), { statusCode: 403, code: "FORBIDDEN" });
}

function requireAdmin(req) {
  requireSupportRole(req);
  if (!req.safeStepsAuth?.roles?.includes("admin")) throw Object.assign(new Error("Administrator access is required."), { statusCode: 403, code: "FORBIDDEN" });
}

function flowVersionPayload(body, userId) {
  const required = ["flowId", "version", "title", "riskLevel", "category", "assistantGoal", "firstResponse", "escalationType", "documentationTemplateKey", "validatorProfileKey", "changeSummary"];
  if (required.some((key) => !String(body?.[key] ?? "").trim())) throw badRequest("Complete all required flow-version fields and provide a change summary.");
  if (!/^[0-9]+\.[0-9]+\.[0-9]+(?:-[a-z0-9.-]+)?$/.test(body.version)) throw badRequest("Version must use semantic versioning, for example 1.2.0.");
  if (!["low", "medium", "high", "critical"].includes(body.riskLevel)) throw badRequest("Choose a valid risk level.");
  const safeReplyKeys = Array.isArray(body.safeReplyTemplateKeys) ? body.safeReplyTemplateKeys : [];
  if (body.riskLevel === "critical" && (!safeReplyKeys.some((key) => criticalTemplateKeys.has(key)) || !body.jurisdictionScope?.length)) throw badRequest("Critical flows require a locked critical template and jurisdiction scope.");
  if ((body.followUpQuestions ?? []).length > 1) throw badRequest("A flow may ask only one question at a time.");
  return { flow_id: body.flowId, version: body.version, status: "draft", title: body.title, risk_level: body.riskLevel, category: body.category, trigger_phrases: body.triggerPhrases ?? [], assistant_goal: body.assistantGoal, first_response: body.firstResponse, core_script: body.coreScript ?? [], follow_up_questions: body.followUpQuestions ?? [], escalation_type: body.escalationType, documentation_template_key: body.documentationTemplateKey, safe_reply_template_keys: safeReplyKeys, prompt_template_keys: body.promptTemplateKeys ?? [], ui_copy_keys: body.uiCopyKeys ?? [], validator_profile_key: body.validatorProfileKey, jurisdiction_scope: body.jurisdictionScope ?? [], change_summary: body.changeSummary, release_checks: body.releaseChecks ?? {}, created_by: userId };
}

async function loadSafeMemoryContext(req) {
  const monitoredDeviceRisk = /monitor|track|checks? my (phone|device)|read this/i.test(String(req.body?.message ?? ""));
  if (monitoredDeviceRisk || !req.safeStepsAuth?.supabase || !req.safeStepsAuth?.user?.id) return [];
  const { data, error } = await req.safeStepsAuth.supabase.from("personal_ai_family_memory").select("scope,sensitivity,memory_key,memory_value,status,expires_at").eq("user_id", req.safeStepsAuth.user.id).eq("status", "active");
  return error ? [] : buildMemoryPromptContext(data);
}

async function persistChatIfConsented(req, result) {
  if (req.body?.consentToStoreNote !== true) return;
  const { userId } = requireDatabase(req); const service = createSafeStepsServiceClient();
  const { data, error } = await service.rpc("persist_personal_ai_chat_turn", {
    p_user_id: userId, p_conversation_id: req.body?.conversationId ?? null, p_user_message: String(req.body.message), p_assistant_message: result.assistantMessage,
    p_flow_id: result.flowId, p_state: result.state, p_risk_level: result.riskLevel, p_intent_label: result.metadata?.intent ?? result.flowId,
    p_routing_confidence: result.metadata?.confidence ?? null, p_escalation_type: result.escalationType, p_signal_ids: result.metadata?.matchedSignalIds ?? [],
    p_completion_state: result.completionState, p_store_conversation: true, p_store_note: true, p_request_id: req.id,
  });
  if (error) throw error; result.conversationId = data?.conversationId ?? result.conversationId; result.persistence = data;
}

async function produceValidatedChat(req) {
  if (req.body?.consentToAiSupport !== true) throw badRequest("Explicit consent is required before sending a message to the AI service.");
  const memoryContext = await loadSafeMemoryContext(req);
  const result = await createPersonalAiChat({ ...(req.body ?? {}), memoryContext });
  await persistChatIfConsented(req, result);
  if (req.body?.consentToMoodTrends === true) {
    const { client, userId } = requireDatabase(req); const tone = result.metadata?.tone;
    if (tone?.scores && tone.diagnostic === false) {
      const now = new Date();
      const { data: existing, error: readError } = await client.from("personal_ai_consents").select("id").eq("user_id", userId).eq("purpose", "mood_trends").is("revoked_at", null).gt("expires_at", now.toISOString()).limit(1).maybeSingle();
      if (readError) throw readError; let consentId = existing?.id;
      if (!consentId) { const { data: consent, error } = await client.from("personal_ai_consents").insert({ user_id: userId, purpose: "mood_trends", policy_version: "1.0", expires_at: new Date(now.getTime() + 90 * 86400000).toISOString() }).select("id").single(); if (error) throw error; consentId = consent.id; }
      const { error } = await client.from("personal_ai_mood_observations").insert({ user_id: userId, conversation_id: result.conversationId ?? null, consent_id: consentId, dominant_emotion: tone.label, confidence_score: tone.confidence, positive_score: tone.scores.positive, negative_score: tone.scores.negative, neutral_score: tone.scores.neutral, anger_score: tone.scores.anger, sadness_score: tone.scores.sadness, anxiety_score: tone.scores.anxiety, joy_score: tone.scores.joy, analysis_version: tone.analysisVersion }); if (error) throw error;
    }
  }
  return result;
}

router.post("/classify", supportGuideRateLimit, (req, res, next) => {
  try {
    const result = classifyPersonalAiMessage(req.body?.message);
    res.setHeader("Cache-Control", "no-store");
    res.json({ data: result, meta: { requestId: req.id } });
  } catch (error) { next(error); }
});

router.get("/flows", (_req, res) => {
  res.setHeader("Cache-Control", "private, max-age=300");
  res.json({ data: { version: "1.0", product: "SafeSteps Personal AI Support", flows: personalAiFlows } });
});

router.get("/flows/:id", (req, res, next) => {
  const flow = personalAiFlows.find((item) => item.id === req.params.id);
  if (!flow) { next(badRequest("Unknown Personal AI Support flow.")); return; }
  res.json({ data: flow, meta: { requestId: req.id } });
});

router.post("/chat", supportGuideRateLimit, async (req, res, next) => {
  try {
    const result = await produceValidatedChat(req);
    res.setHeader("Cache-Control", "no-store");
    res.json({ data: result, meta: { requestId: req.id } });
  } catch (error) { next(error); }
});

router.post("/chat/stream", supportGuideRateLimit, async (req, res, next) => {
  try {
    const result = await produceValidatedChat(req);
    res.status(200);
    res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
    res.setHeader("Cache-Control", "no-store, no-transform");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.flushHeaders?.();
    res.write(JSON.stringify({ type: "start", data: { conversationId: result.conversationId, flowId: result.flowId, riskLevel: result.riskLevel, source: result.source } }) + "\n");
    const text = result.assistantMessage;
    for (let offset = 0; offset < text.length; offset += 96) {
      if (res.destroyed) return;
      res.write(JSON.stringify({ type: "delta", text: text.slice(offset, offset + 96) }) + "\n");
    }
    res.end(JSON.stringify({ type: "complete", data: result }) + "\n");
  } catch (error) { next(error); }
});

router.get("/mood-trends", async (req, res, next) => {
  try { const { client, userId } = requireDatabase(req); const { data, error } = await client.from("personal_ai_mood_observations").select("id,dominant_emotion,confidence_score,positive_score,negative_score,neutral_score,anger_score,sadness_score,anxiety_score,joy_score,analysis_version,created_at,expires_at").eq("user_id", userId).gt("expires_at", new Date().toISOString()).order("created_at", { ascending: true }).limit(180); if (error) throw error; res.setHeader("Cache-Control", "no-store"); res.json({ data: data ?? [], meta: { requestId: req.id, disclaimer: "Automated communication cues only—not clinical measurements or diagnoses." } }); } catch (error) { next(error); }
});

router.delete("/mood-trends", async (req, res, next) => {
  try { const { client, userId } = requireDatabase(req); const { error } = await client.from("personal_ai_mood_observations").delete().eq("user_id", userId); if (error) throw error; const { error: consentError } = await client.from("personal_ai_consents").update({ revoked_at: new Date().toISOString() }).eq("user_id", userId).eq("purpose", "mood_trends").is("revoked_at", null); if (consentError) throw consentError; res.json({ data: { deleted: true }, meta: { requestId: req.id } }); } catch (error) { next(error); }
});

router.post("/handoff", async (req, res, next) => {
  try {
    if (req.body?.consentToShareWithSupport !== true) throw badRequest("Consent is required before sharing information with the support team.");
    const { client, userId } = requireDatabase(req);
    const summary = String(req.body?.summary ?? "").trim();
    if (!summary || summary.length > 1000) throw badRequest("Provide a handoff summary of up to 1000 characters.");
    const payload = {
      user_id: userId,
      conversation_id: req.body?.conversationId ?? null,
      flow_id: req.body?.flowId ?? null,
      reason_code: String(req.body?.reasonCode ?? "user_requested_support").slice(0, 100),
      summary,
      urgency: ["low", "medium", "high", "critical"].includes(req.body?.urgency) ? req.body.urgency : "medium",
      user_consented_to_share: true,
      automatic_emergency_dispatch: false,
    };
    const { data, error } = await client.from("personal_ai_handoffs").insert(payload).select("id,status,created_at").single();
    if (error) throw error;
    res.status(201).json({ data: { handoffId: data.id, status: data.status, createdAt: data.created_at, disclosure: "Only the summary you approved is shared. SafeSteps does not automatically contact emergency services." }, meta: { requestId: req.id } });
  } catch (error) { next(error); }
});

router.get("/admin/handoffs", async (req, res, next) => {
  try {
    requireSupportRole(req);
    const { client } = requireDatabase(req);
    const { data, error } = await client.from("personal_ai_handoffs").select("id,user_id,conversation_id,flow_id,reason_code,summary,urgency,status,assigned_to_user_id,created_at,updated_at").order("created_at", { ascending: true }).limit(100);
    if (error) throw error;
    res.json({ data: data ?? [], meta: { requestId: req.id } });
  } catch (error) { next(error); }
});

router.patch("/admin/handoffs/:id", async (req, res, next) => {
  try {
    requireSupportRole(req);
    const { client, userId } = requireDatabase(req);
    if (!handoffStatuses.has(req.body?.status)) throw badRequest("Choose a valid handoff status.");
    const update = { status: req.body.status, updated_at: new Date().toISOString() };
    if (req.body.assignToMe === true) update.assigned_to_user_id = userId;
    if (["resolved", "closed"].includes(req.body.status)) update.resolved_at = new Date().toISOString();
    const { data, error } = await client.from("personal_ai_handoffs").update(update).eq("id", req.params.id).select("id,status,assigned_to_user_id,updated_at").single();
    if (error) throw error;
    res.json({ data, meta: { requestId: req.id } });
  } catch (error) { next(error); }
});

router.get("/referrals", async (req, res, next) => {
  try {
    const { client } = requireDatabase(req);
    const mode = ["normal","safe","monitored_device","crisis"].includes(String(req.query.mode)) ? String(req.query.mode) : (req.query.stealth === "true" ? "safe" : "normal");
    let query = client.from("personal_ai_referrals").select("id,name,stealth_label,category,jurisdiction,description,phone,sms,website,email,hours,after_hours,crisis_only,safe_for_monitored_device,language_tags,eligibility_notes,last_verified_at,next_review_at");
    if (req.query.jurisdiction) query = query.eq("jurisdiction", String(req.query.jurisdiction));
    if (req.query.category) query = query.eq("category", String(req.query.category));
    if (req.query.crisisOnly === "true") query = query.eq("crisis_only", true);
    if (req.query.afterHours === "true") query = query.eq("after_hours", true);
    if (req.query.safeForMonitoredDevice === "true") query = query.eq("safe_for_monitored_device", true);
    if (mode === "monitored_device") query = query.eq("safe_for_monitored_device", true);
    const limit = mode === "crisis" ? 3 : mode === "normal" ? 50 : 12;
    const { data, error } = await query.order("crisis_only", { ascending: false }).order("after_hours", { ascending: false }).order("last_verified_at", { ascending: false }).limit(limit);
    if (error) throw error;
    const discreet = mode !== "normal";
    const entries = (data ?? []).map((entry, index) => discreet ? {
      id: entry.id, name: entry.stealth_label || `Support option ${index + 1}`, category: "general",
      description: mode === "monitored_device" ? undefined : "Only the most important details are shown.", phone: entry.phone, website: entry.website,
      hours: entry.after_hours ? "Available after hours" : undefined, after_hours: entry.after_hours, crisis_only: entry.crisis_only,
      safe_for_monitored_device: entry.safe_for_monitored_device, last_verified_at: entry.last_verified_at, verified: true,
    } : { ...entry, verified: true });
    res.setHeader("Cache-Control", "no-store");
    res.json({ data: entries, meta: { requestId: req.id, mode, resultLimit: limit, disclaimer: entries.length ? "Referral information can change. Verify details when it is safe." : "I can’t safely verify support options right now. If this is an emergency, call 000 now." } });
  } catch (error) { next(error); }
});

router.post("/admin/referrals", async (req, res, next) => {
  try {
    requireSupportRole(req);
    if (!req.safeStepsAuth.roles.includes("admin")) throw Object.assign(new Error("Administrator access is required."), { statusCode: 403, code: "FORBIDDEN" });
    const { client, userId } = requireDatabase(req);
    const required = ["name", "category", "jurisdiction", "description", "sourceUrl", "sourceType", "nextReviewAt"];
    if (required.some((key) => !String(req.body?.[key] ?? "").trim())) throw badRequest("Referral name, category, jurisdiction, description, source, source type, and review date are required.");
    if (![req.body.phone, req.body.sms, req.body.website, req.body.email].some((value) => String(value ?? "").trim())) throw badRequest("At least one contact method is required.");
    const highRisk = ["crisis", "domestic_violence", "child_protection"].includes(req.body.category);
    const { data, error } = await client.from("personal_ai_referrals").insert({
      name: String(req.body.name).slice(0, 160), stealth_label: String(req.body.stealthLabel ?? "Support option").slice(0, 80), category: req.body.category,
      jurisdiction: req.body.jurisdiction, description: String(req.body.description).slice(0, 1000), phone: req.body.phone ?? null, sms: req.body.sms ?? null,
      website: req.body.website ?? null, email: req.body.email ?? null, hours: req.body.hours ?? null, after_hours: req.body.afterHours === true,
      crisis_only: req.body.crisisOnly === true, safe_for_monitored_device: req.body.safeForMonitoredDevice === true, language_tags: req.body.languageTags ?? ["en"],
      eligibility_notes: req.body.eligibilityNotes ?? null, keywords: req.body.keywords ?? [], status: "pending_review", source_url: req.body.sourceUrl,
      source_type: req.body.sourceType, owner_user_id: userId, backup_owner_user_id: req.body.backupOwnerUserId ?? null,
      requires_two_person_approval: highRisk || req.body.requiresTwoPersonApproval === true, review_frequency_days: Number(req.body.reviewFrequencyDays ?? (highRisk ? 30 : 90)), next_review_at: req.body.nextReviewAt,
    }).select("id,status,requires_two_person_approval,created_at").single();
    if (error) throw error;
    res.status(201).json({ data, meta: { requestId: req.id } });
  } catch (error) { next(error); }
});

router.get("/admin/referrals", async (req, res, next) => {
  try {
    requireSupportRole(req); const { client } = requireDatabase(req);
    let query = client.from("personal_ai_referrals").select("id,name,stealth_label,category,jurisdiction,status,phone,website,hours,after_hours,crisis_only,safe_for_monitored_device,language_tags,last_verified_at,next_review_at,requires_two_person_approval,verified_by_user_id,second_approved_by_user_id,source_url,source_type,owner_user_id");
    if (req.query.status) query = query.eq("status", String(req.query.status));
    if (req.query.jurisdiction) query = query.eq("jurisdiction", String(req.query.jurisdiction));
    if (req.query.category) query = query.eq("category", String(req.query.category));
    const { data, error } = await query.order("next_review_at", { ascending: true }).limit(250);
    if (error) throw error;
    res.setHeader("Cache-Control", "no-store");
    res.json({ data: data ?? [], meta: { requestId: req.id } });
  } catch (error) { next(error); }
});

router.post("/admin/referrals/:id/verify", async (req, res, next) => {
  try {
    requireSupportRole(req);
    if (!req.safeStepsAuth.roles.includes("admin")) throw Object.assign(new Error("Administrator access is required."), { statusCode: 403, code: "FORBIDDEN" });
    const { client, userId } = requireDatabase(req);
    const result = req.body?.result;
    if (!["verified", "updated", "expired", "inactive", "invalid"].includes(result)) throw badRequest("Choose a valid verification result.");
    const { data: entry, error: readError } = await client.from("personal_ai_referrals").select("id,requires_two_person_approval,verified_by_user_id,second_approved_by_user_id,review_frequency_days").eq("id", req.params.id).single();
    if (readError) throw readError;
    const secondApproval = entry.requires_two_person_approval && entry.verified_by_user_id && entry.verified_by_user_id !== userId;
    const now = new Date(); const nextReview = new Date(now.getTime() + entry.review_frequency_days * 86400000).toISOString();
    const status = ["expired", "inactive", "invalid"].includes(result) ? (result === "invalid" ? "inactive" : result) : entry.requires_two_person_approval && !secondApproval ? "pending_review" : "active";
    const update = { status, last_verified_at: now.toISOString(), next_review_at: nextReview, updated_at: now.toISOString() };
    if (secondApproval) update.second_approved_by_user_id = userId; else update.verified_by_user_id = userId;
    const { error: logError } = await client.from("personal_ai_referral_verifications").insert({ referral_id: entry.id, verified_by_user_id: userId, result, checks: req.body?.checks ?? {}, notes: String(req.body?.notes ?? "").slice(0, 1000) || null });
    if (logError) throw logError;
    const { data, error } = await client.from("personal_ai_referrals").update(update).eq("id", entry.id).select("id,status,last_verified_at,next_review_at,verified_by_user_id,second_approved_by_user_id").single();
    if (error) throw error;
    res.json({ data, meta: { requestId: req.id } });
  } catch (error) { next(error); }
});

router.get("/admin/referrals/verification-log", async (req, res, next) => {
  try {
    requireSupportRole(req); const { client } = requireDatabase(req);
    const { data, error } = await client.from("personal_ai_referral_verifications").select("id,referral_id,verified_by_user_id,result,checks,notes,verified_at").order("verified_at", { ascending: false }).limit(200);
    if (error) throw error;
    res.json({ data: data ?? [], meta: { requestId: req.id } });
  } catch (error) { next(error); }
});

router.get("/admin/flow-versions", async (req, res, next) => {
  try {
    requireSupportRole(req); const { client } = requireDatabase(req);
    let query = client.from("personal_ai_flow_versions").select("*,personal_ai_flow_version_approvals(id,approver_user_id,approval_role,decision,notes,created_at)");
    if (req.query.flowId) query = query.eq("flow_id", String(req.query.flowId));
    if (req.query.status) query = query.eq("status", String(req.query.status));
    const { data, error } = await query.order("created_at", { ascending: false }).limit(200);
    if (error) throw error; res.json({ data: data ?? [], meta: { requestId: req.id } });
  } catch (error) { next(error); }
});

router.post("/admin/flow-versions", async (req, res, next) => {
  try {
    requireAdmin(req); const { client, userId } = requireDatabase(req); const payload = flowVersionPayload(req.body ?? {}, userId);
    const { data, error } = await client.from("personal_ai_flow_versions").insert(payload).select("*").single();
    if (error) throw error;
    const { error: auditError } = await client.from("personal_ai_flow_version_audit_logs").insert({ flow_version_id: data.id, flow_id: data.flow_id, new_version: data.version, action: "created", actor_user_id: userId, reason: data.change_summary });
    if (auditError) throw auditError; res.status(201).json({ data, meta: { requestId: req.id } });
  } catch (error) { next(error); }
});

router.patch("/admin/flow-versions/:id", async (req, res, next) => {
  try {
    requireAdmin(req); const { client, userId } = requireDatabase(req);
    const { data: current, error: readError } = await client.from("personal_ai_flow_versions").select("*").eq("id", req.params.id).single();
    if (readError) throw readError; if (!flowStatuses.has(current.status)) throw badRequest("Released flow content is immutable; create a new version instead.");
    const merged = { ...current, ...req.body, flowId: req.body?.flowId ?? current.flow_id, riskLevel: req.body?.riskLevel ?? current.risk_level, assistantGoal: req.body?.assistantGoal ?? current.assistant_goal, firstResponse: req.body?.firstResponse ?? current.first_response, escalationType: req.body?.escalationType ?? current.escalation_type, documentationTemplateKey: req.body?.documentationTemplateKey ?? current.documentation_template_key, validatorProfileKey: req.body?.validatorProfileKey ?? current.validator_profile_key, changeSummary: req.body?.changeSummary ?? current.change_summary, safeReplyTemplateKeys: req.body?.safeReplyTemplateKeys ?? current.safe_reply_template_keys, jurisdictionScope: req.body?.jurisdictionScope ?? current.jurisdiction_scope, followUpQuestions: req.body?.followUpQuestions ?? current.follow_up_questions };
    const payload = flowVersionPayload(merged, current.created_by); delete payload.created_by; delete payload.status;
    const { data, error } = await client.from("personal_ai_flow_versions").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", current.id).select("*").single();
    if (error) throw error; await client.from("personal_ai_flow_version_audit_logs").insert({ flow_version_id: current.id, flow_id: current.flow_id, previous_version: current.version, new_version: data.version, action: "edited", actor_user_id: userId, reason: data.change_summary });
    res.json({ data, meta: { requestId: req.id } });
  } catch (error) { next(error); }
});

router.post("/admin/flow-versions/:id/submit", async (req, res, next) => {
  try {
    requireAdmin(req); const { client, userId } = requireDatabase(req);
    const { data, error } = await client.from("personal_ai_flow_versions").update({ status: "in_review", updated_at: new Date().toISOString() }).eq("id", req.params.id).eq("status", "draft").select("*").single();
    if (error) throw error; await client.from("personal_ai_flow_version_audit_logs").insert({ flow_version_id: data.id, flow_id: data.flow_id, new_version: data.version, action: "submitted_for_review", actor_user_id: userId, reason: String(req.body?.reason ?? data.change_summary).slice(0, 1000) });
    res.json({ data, meta: { requestId: req.id } });
  } catch (error) { next(error); }
});

router.post("/admin/flow-versions/:id/approve", async (req, res, next) => {
  try {
    requireAdmin(req); const { client, userId } = requireDatabase(req); const role = req.body?.approvalRole;
    if (!["product_owner", "safeguarding", "clinical", "domain_specialist", "jurisdiction"].includes(role)) throw badRequest("Choose a valid approval role.");
    const { data: flow, error: readError } = await client.from("personal_ai_flow_versions").select("id,flow_id,version,risk_level,status,created_by").eq("id", req.params.id).single();
    if (readError) throw readError; if (flow.status !== "in_review") throw badRequest("Only versions in review can be approved.");
    if (flow.risk_level === "critical" && flow.created_by === userId) throw badRequest("The author cannot approve their own critical flow.");
    const { error } = await client.from("personal_ai_flow_version_approvals").insert({ flow_version_id: flow.id, approver_user_id: userId, approval_role: role, decision: "approved", notes: String(req.body?.notes ?? "").slice(0, 1000) || null });
    if (error) throw error;
    const { count } = await client.from("personal_ai_flow_version_approvals").select("id", { count: "exact", head: true }).eq("flow_version_id", flow.id).eq("decision", "approved");
    const threshold = flow.risk_level === "critical" ? 2 : 1; const status = (count ?? 0) >= threshold ? "approved" : "in_review";
    if (status === "approved") await client.from("personal_ai_flow_versions").update({ status, updated_at: new Date().toISOString() }).eq("id", flow.id);
    await client.from("personal_ai_flow_version_audit_logs").insert({ flow_version_id: flow.id, flow_id: flow.flow_id, new_version: flow.version, action: "approved", actor_user_id: userId, reason: String(req.body?.notes ?? `${role} approval`).slice(0, 1000) });
    res.json({ data: { id: flow.id, status, approvalCount: count ?? 0, requiredApprovals: threshold }, meta: { requestId: req.id } });
  } catch (error) { next(error); }
});

router.post("/admin/flow-versions/:id/activate", async (req, res, next) => {
  try { requireAdmin(req); const { client } = requireDatabase(req); const reason = String(req.body?.reason ?? "Approved release").slice(0, 1000); const { data, error } = await client.rpc("activate_personal_ai_flow_version", { target_id: req.params.id, activation_reason: reason }); if (error) throw error; res.json({ data, meta: { requestId: req.id } }); } catch (error) { next(error); }
});

router.post("/admin/flow-versions/:id/rollback", async (req, res, next) => {
  try { requireAdmin(req); const { client } = requireDatabase(req); const reason = String(req.body?.reason ?? "").trim(); if (reason.length < 10) throw badRequest("A rollback reason of at least 10 characters is required."); const { data, error } = await client.rpc("rollback_personal_ai_flow_version", { target_id: req.params.id, rollback_reason: reason.slice(0, 1000) }); if (error) throw error; res.json({ data, meta: { requestId: req.id } }); } catch (error) { next(error); }
});

router.get("/memory", async (req, res, next) => {
  try {
    const { client, userId } = requireDatabase(req); const discreet = req.query.discreet === "true";
    let query = client.from("personal_ai_family_memory").select("id,scope,sensitivity,memory_key,memory_value,rationale,consent_type,status,tags,jurisdiction,expires_at,created_at,updated_at").eq("user_id", userId);
    if (req.query.includeInactive !== "true") query = query.in("status", ["active", "pending_review"]).or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
    const { data, error } = await query.order("created_at", { ascending: false }); if (error) throw error;
    res.json({ data: (data ?? []).map((item) => redactMemoryForDisplay(item, discreet)).filter(Boolean), meta: { requestId: req.id, discreet } });
  } catch (error) { next(error); }
});

router.post("/memory/candidate", async (req, res, next) => {
  try {
    const candidate = req.body?.text ? extractMemoryCandidate(req.body.text) : req.body;
    if (!candidate) { res.json({ data: { accepted: false, reason: "No safe memory candidate found." }, meta: { requestId: req.id } }); return; }
    const review = reviewMemoryCandidate({ ...candidate, consentGiven: req.body?.consentGiven, monitoredDeviceRisk: req.body?.monitoredDeviceRisk });
    if (!review.allowed) { res.json({ data: { accepted: false, reason: "Memory rejected by safety policy.", policyReasons: review.reasons }, meta: { requestId: req.id } }); return; }
    const { client, userId } = requireDatabase(req);
    const consentType = candidate.scope === "support_plan" ? "support_plan" : "memory";
    const { data, error } = await client.from("personal_ai_family_memory").insert({ user_id: userId, scope: candidate.scope, sensitivity: candidate.sensitivity, memory_key: candidate.key, memory_value: candidate.value, rationale: candidate.rationale, consent_type: consentType, monitored_device_context: false, status: "active", tags: candidate.tags ?? [], expires_at: candidate.expiresAt ?? null }).select("id,status").single();
    if (error) throw error; res.status(201).json({ data: { accepted: true, memoryId: data.id, status: data.status }, meta: { requestId: req.id } });
  } catch (error) { next(error); }
});

router.get("/memory/prompt-context", async (req, res, next) => {
  try {
    const { client, userId } = requireDatabase(req);
    const { data, error } = await client.from("personal_ai_family_memory").select("scope,sensitivity,memory_key,memory_value,status,expires_at").eq("user_id", userId).eq("status", "active");
    if (error) throw error;
    res.setHeader("Cache-Control", "no-store");
    res.json({ data: buildMemoryPromptContext(data, { monitoredDeviceRisk: req.query.discreet === "true" }), meta: { requestId: req.id } });
  } catch (error) { next(error); }
});

router.post("/memory", async (req, res, next) => {
  try {
    const { client, userId } = requireDatabase(req); const review = reviewMemoryCandidate({ key: req.body?.key, value: req.body?.value, sensitivity: req.body?.sensitivity, consentGiven: req.body?.consentGiven, monitoredDeviceRisk: req.body?.monitoredDeviceRisk, purposeRelevant: req.body?.purposeRelevant });
    if (!review.allowed) throw Object.assign(new Error("This detail cannot be saved as controlled memory."), { statusCode: 400, code: "MEMORY_POLICY_BLOCK", details: review.reasons });
    const sensitivity = req.body.sensitivity; const consentType = sensitivity === "high" ? "sensitive_memory" : req.body.scope === "support_plan" ? "support_plan" : "memory";
    const { data, error } = await client.from("personal_ai_family_memory").insert({ user_id: userId, scope: req.body.scope, sensitivity, memory_key: req.body.key, memory_value: String(req.body.value).trim(), rationale: String(req.body.rationale ?? "User-approved future support preference").slice(0, 500), source_conversation_id: req.body.sourceConversationId ?? null, source_message_id: req.body.sourceMessageId ?? null, consent_type: consentType, monitored_device_context: req.body.monitoredDeviceRisk === true, status: sensitivity === "high" ? "pending_review" : "active", tags: req.body.tags ?? [], jurisdiction: req.body.jurisdiction ?? null, expires_at: req.body.expiresAt ?? null }).select("id,status,created_at").single();
    if (error) throw error; res.status(201).json({ data: { memoryId: data.id, status: data.status, createdAt: data.created_at }, meta: { requestId: req.id } });
  } catch (error) { next(error); }
});

router.patch("/memory/:id", async (req, res, next) => {
  try {
    const { client, userId } = requireDatabase(req); const allowedStatus = ["active","suppressed","deleted"];
    if (req.body?.status && !allowedStatus.includes(req.body.status)) throw badRequest("Choose active, suppressed, or deleted.");
    const update = { updated_at: new Date().toISOString() };
    if (typeof req.body?.value === "string") {
      const { data: current, error: readError } = await client.from("personal_ai_family_memory").select("memory_key,sensitivity,scope").eq("id", req.params.id).eq("user_id", userId).single();
      if (readError) throw readError;
      const review = reviewMemoryCandidate({ key: current.memory_key, value: req.body.value, sensitivity: current.sensitivity, consentGiven: true, purposeRelevant: true, monitoredDeviceRisk: req.body?.monitoredDeviceRisk === true });
      if (!review.allowed) throw Object.assign(new Error("This edit cannot be saved as controlled memory."), { statusCode: 400, code: "MEMORY_POLICY_BLOCK", details: review.reasons });
      update.memory_value = req.body.value.slice(0, 500);
    }
    if (typeof req.body?.rationale === "string") update.rationale = req.body.rationale.slice(0, 500);
    if (req.body?.status) update.status = req.body.status;
    if (req.body?.status === "deleted") { update.memory_value = "Deleted by user"; update.deleted_at = new Date().toISOString(); }
    const { data, error } = await client.from("personal_ai_family_memory").update(update).eq("id", req.params.id).eq("user_id", userId).select("id,status,updated_at").single(); if (error) throw error;
    res.json({ data, meta: { requestId: req.id } });
  } catch (error) { next(error); }
});

router.post("/memory/:id/suppress", async (req, res, next) => {
  req.body = { ...req.body, status: "suppressed" };
  const { client, userId } = requireDatabase(req);
  const { data, error } = await client.from("personal_ai_family_memory").update({ status: "suppressed", updated_at: new Date().toISOString() }).eq("id", req.params.id).eq("user_id", userId).select("id,status,updated_at").single();
  if (error) return next(error); res.json({ data, meta: { requestId: req.id } });
});

router.post("/memory/:id/delete", async (req, res, next) => {
  const { client, userId } = requireDatabase(req); const now = new Date().toISOString();
  const { data, error } = await client.from("personal_ai_family_memory").update({ status: "deleted", memory_value: "Deleted by user", deleted_at: now, updated_at: now }).eq("id", req.params.id).eq("user_id", userId).select("id,status,updated_at").single();
  if (error) return next(error); res.json({ data, meta: { requestId: req.id } });
});

router.post("/memory/consent", async (req, res, next) => {
  try {
    const { client, userId } = requireDatabase(req); const type = req.body?.consentType; if (!["memory","support_plan","sensitive_memory"].includes(type)) throw badRequest("Choose a valid memory consent type.");
    if (req.body?.granted !== true) { const { data, error } = await client.rpc("revoke_personal_ai_memory_consent", { target_consent_type: type, target_policy_version: String(req.body?.policyVersion ?? "1.0") }); if (error) throw error; res.json({ data: { status: "revoked", suppressedItems: data }, meta: { requestId: req.id } }); return; }
    const { data, error } = await client.from("personal_ai_memory_consents").insert({ user_id: userId, consent_type: type, status: "accepted", policy_version: String(req.body?.policyVersion ?? "1.0"), granted_at: new Date().toISOString() }).select("id,status,granted_at").single(); if (error) throw error;
    res.status(201).json({ data, meta: { requestId: req.id } });
  } catch (error) { next(error); }
});

router.get("/admin/incidents", async (req, res, next) => {
  try { requireSupportRole(req); const { client } = requireDatabase(req); const { data, error } = await client.from("personal_ai_incidents").select("*").order("detected_at", { ascending: false }).limit(200); if (error) throw error; res.json({ data: data ?? [], meta: { requestId: req.id } }); } catch (error) { next(error); }
});

router.post("/admin/incidents", async (req, res, next) => {
  try {
    requireSupportRole(req); const { client, userId } = requireDatabase(req); if (!["sev1","sev2","sev3","sev4"].includes(req.body?.severity)) throw badRequest("Choose a valid incident severity.");
    const { data, error } = await client.from("personal_ai_incidents").insert({ severity: req.body.severity, title: String(req.body?.title ?? "").slice(0, 200), summary: String(req.body?.summary ?? "").slice(0, 2000), affected_component: String(req.body?.affectedComponent ?? "unknown").slice(0, 200), user_impact: String(req.body?.userImpact ?? "Impact under assessment").slice(0, 2000), detected_source: req.body?.detectedSource ?? "staff_report", detected_by: userId, mandatory_reporting_review_required: req.body?.mandatoryReportingReviewRequired === true, privacy_review_required: req.body?.privacyReviewRequired === true }).select("*").single(); if (error) throw error;
    res.status(201).json({ data, meta: { requestId: req.id, instruction: data.severity === "sev1" ? "Contain immediately, force safe fallback, and notify safeguarding and engineering leads." : "Triage and assign an incident commander." } });
  } catch (error) { next(error); }
});

router.patch("/admin/incidents/:id", async (req, res, next) => {
  try {
    requireAdmin(req); const { client, userId } = requireDatabase(req); const status = req.body?.status; if (!["open","contained","remediating","verified","closed"].includes(status)) throw badRequest("Choose a valid incident status.");
    const update = { status, updated_at: new Date().toISOString() };
    if (Array.isArray(req.body?.containmentActions)) update.containment_actions = req.body.containmentActions;
    if (Array.isArray(req.body?.remediationActions)) update.remediation_actions = req.body.remediationActions;
    if (typeof req.body?.rootCause === "string") update.root_cause = req.body.rootCause;
    if (Array.isArray(req.body?.regressionTestsAdded)) update.regression_tests_added = req.body.regressionTestsAdded;
    if (Array.isArray(req.body?.reviewerSignoff)) update.reviewer_signoff = req.body.reviewerSignoff;
    if (status === "contained") update.contained_at = new Date().toISOString(); if (status === "verified") update.verified_at = new Date().toISOString(); if (status === "closed") update.closed_at = new Date().toISOString();
    const { data, error } = await client.from("personal_ai_incidents").update(update).eq("id", req.params.id).select("*").single(); if (error) throw error;
    const { error: actionError } = await client.from("personal_ai_incident_actions").insert({ incident_id: data.id, action_type: "status_change", description: `Status changed to ${status}.`, actor_user_id: userId, metadata: { requestId: req.id } }); if (actionError) throw actionError;
    res.json({ data, meta: { requestId: req.id } });
  } catch (error) { next(error); }
});

router.get("/admin/launch-readiness/:version", async (req, res, next) => {
  try {
    requireSupportRole(req); const { client } = requireDatabase(req); const version = String(req.params.version);
    const [checksResult, signoffsResult, incidentsResult, packageResult] = await Promise.all([
      client.from("personal_ai_launch_readiness_checks").select("*").eq("release_version", version),
      client.from("personal_ai_launch_signoffs").select("signoff_role,review_domain,reviewer_name,review_scope,decision,signer_user_id,signed_at,evidence_reference,condition_text,condition_owner_user_id,condition_due_at,condition_resolved_at").eq("release_version", version),
      client.from("personal_ai_incidents").select("id", { count: "exact", head: true }).eq("severity", "sev1").neq("status", "closed"),
      client.from("personal_ai_release_packages").select("id,release_version,status,change_summary,updated_at").eq("release_version", version).maybeSingle(),
    ]);
    if (checksResult.error) throw checksResult.error; if (signoffsResult.error) throw signoffsResult.error; if (incidentsResult.error) throw incidentsResult.error; if (packageResult.error) throw packageResult.error;
    const gate = evaluateLaunchGate(checksResult.data ?? [], signoffsResult.data ?? [], incidentsResult.count ?? 0);
    if (!packageResult.data || !["approved","released"].includes(packageResult.data.status)) { gate.decision = "no_go"; gate.blockers.push("Versioned release review package is missing or not approved."); }
    res.json({ data: { releaseVersion: version, ...gate, checks: checksResult.data ?? [], signoffs: signoffsResult.data ?? [], releasePackage: packageResult.data, requiredAreas: requiredLaunchAreas }, meta: { requestId: req.id, productionApproved: gate.decision === "go" } });
  } catch (error) { next(error); }
});

router.post("/admin/launch-readiness/:version/checks", async (req, res, next) => {
  try {
    requireAdmin(req); const { client, userId } = requireDatabase(req); if (!requiredLaunchAreas.includes(req.body?.area)) throw badRequest("Choose a recognised launch-readiness area."); if (!["pass","fail","pending"].includes(req.body?.status)) throw badRequest("Choose pass, fail, or pending.");
    const { data, error } = await client.from("personal_ai_launch_readiness_checks").upsert({ release_version: String(req.params.version), area: req.body.area, status: req.body.status, required: true, evidence_reference: req.body.evidenceReference ?? null, notes: req.body.notes ?? null, owner_user_id: req.body.ownerUserId ?? userId, reviewed_by_user_id: userId, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }, { onConflict: "release_version,area" }).select("*").single(); if (error) throw error;
    res.json({ data, meta: { requestId: req.id } });
  } catch (error) { next(error); }
});

router.post("/admin/launch-readiness/:version/signoffs", async (req, res, next) => {
  try {
    requireAdmin(req); const { client, userId } = requireDatabase(req); const evidence = String(req.body?.evidenceReference ?? "").trim(); if (!evidence) throw badRequest("Sign-off evidence is required.");
    const roles = ["safeguarding_lead","clinical_reviewer","privacy_security_reviewer","engineering_lead","product_owner","jurisdiction_reviewer","dv_specialist","child_safety_reviewer","substance_use_specialist"];
    const domains = ["safeguarding","clinical","domestic_violence","substance_use","privacy_security","jurisdiction_legal","product_ux"];
    if (!roles.includes(req.body?.signoffRole) || !domains.includes(req.body?.reviewDomain) || !["approved","rejected","conditional"].includes(req.body?.decision)) throw badRequest("Choose a valid sign-off role, review domain, and decision.");
    const reviewerName = String(req.body?.reviewerName ?? "").trim(); const reviewScope = String(req.body?.reviewScope ?? "").trim();
    if (reviewerName.length < 2 || reviewScope.length < 10) throw badRequest("Reviewer name and a specific versioned review scope are required.");
    if (req.body.decision === "conditional" && (!String(req.body?.conditionText ?? "").trim() || !req.body?.conditionOwnerUserId || !req.body?.conditionDueAt)) throw badRequest("Conditional approval requires a condition, owner, and due date.");
    const { data, error } = await client.from("personal_ai_launch_signoffs").insert({ release_version: String(req.params.version), signoff_role: req.body.signoffRole, review_domain: req.body.reviewDomain, reviewer_name: reviewerName.slice(0,200), review_scope: reviewScope.slice(0,2000), signer_user_id: userId, decision: req.body.decision, evidence_reference: evidence.slice(0,1000), notes: String(req.body?.notes ?? "").slice(0,1000) || null, condition_text: req.body.decision === "conditional" ? String(req.body.conditionText).slice(0,1000) : null, condition_owner_user_id: req.body.decision === "conditional" ? req.body.conditionOwnerUserId : null, condition_due_at: req.body.decision === "conditional" ? req.body.conditionDueAt : null }).select("*").single(); if (error) throw error;
    res.status(201).json({ data, meta: { requestId: req.id } });
  } catch (error) { next(error); }
});

router.put("/admin/launch-readiness/:version/release-package", async (req, res, next) => {
  try {
    requireAdmin(req); const { client, userId } = requireDatabase(req); const required = ["changeSummary","priorVersionDiffReference","testResultsReference","rollbackPlanReference","jurisdictionNotesReference","escalationChangesReference","validatorChangesReference","referralUpdatesReference","memoryChangesReference"];
    if (required.some((key) => !String(req.body?.[key] ?? "").trim())) throw badRequest("The complete versioned review package is required before sign-off.");
    const payload = { release_version: String(req.params.version), status: ["draft","in_review","approved","released","withdrawn"].includes(req.body?.status) ? req.body.status : "draft", change_summary: String(req.body.changeSummary).slice(0,2000), prior_version_diff_reference: req.body.priorVersionDiffReference, test_results_reference: req.body.testResultsReference, known_risks: req.body.knownRisks ?? [], rollback_plan_reference: req.body.rollbackPlanReference, jurisdiction_notes_reference: req.body.jurisdictionNotesReference, escalation_changes_reference: req.body.escalationChangesReference, validator_changes_reference: req.body.validatorChangesReference, referral_updates_reference: req.body.referralUpdatesReference, memory_changes_reference: req.body.memoryChangesReference, prepared_by_user_id: userId, updated_at: new Date().toISOString() };
    const { data, error } = await client.from("personal_ai_release_packages").upsert(payload,{onConflict:"release_version"}).select("*").single(); if (error) throw error;
    res.json({ data, meta: { requestId: req.id } });
  } catch (error) { next(error); }
});

export default router;
