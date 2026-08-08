import { randomUUID } from "node:crypto";
import express from "express";

import { analyzeFairnessDocument } from "../../Services/DocumentIntelligence/FairnessEngine.js";
import { badRequest } from "../../lib/apiError.js";
import {
  DOCUMENT_ROLES,
  requireAnyRole,
  requireCaseAccess,
} from "../../middleware/authorize.js";
import { requireAuthenticatedUser } from "../../middleware/requireAuthenticatedUser.js";

const MAX_TEXT_BYTES = 2 * 1024 * 1024;

const router = express.Router();

router.post(
  "/fairness",
  requireAuthenticatedUser,
  requireAnyRole(...DOCUMENT_ROLES),
  requireCaseAccess,
  async (req, res, next) => {
    try {
      const input = validateFairnessRequestBody(req.body);
      const analysis = analyzeFairnessDocument(input.text);
      const analysisId = await persistFairnessAnalysis({
        client: req.safeStepsAuth?.supabase,
        isLocalBypass: req.safeStepsAuth?.isLocalBypass,
        caseId: req.safeStepsCaseId,
        documentId: input.documentId,
        analysis,
      });

      res.status(201).json({
        analysis_id: analysisId,
        fairness_score: analysis.fairness_score,
        bias_indicators: analysis.bias_indicators,
        coercion_flags: analysis.coercion_flags,
        discrimination_risks: analysis.discrimination_risks,
        framing_concerns: analysis.framing_concerns,
        unrealistic_expectations: analysis.unrealistic_expectations,
        remediation_recommendations: analysis.remediation_recommendations,
        limitations: analysis.limitations,
        timestamp: analysis.timestamp,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;

export function validateFairnessRequestBody(body = {}) {
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) throw badRequest("text is required for fairness analysis.");
  assertTextSize(text);

  const documentId = stringField(body.documentId);
  const caseContext = normalizeCaseContext(body.caseContext);

  return { text, documentId, caseContext };
}

export function assertTextSize(text) {
  if (Buffer.byteLength(text, "utf8") > MAX_TEXT_BYTES) {
    throw badRequest("Document text is too large for fairness analysis. Submit an extract under 2 MB.");
  }
}

export async function persistFairnessAnalysis(input) {
  if (input.isLocalBypass || !input.client || !input.documentId) {
    return randomUUID();
  }

  const { data: evidence, error: evidenceError } = await input.client
    .from("evidence_records")
    .select("id, tenant_id, case_id")
    .eq("id", input.documentId)
    .eq("case_id", input.caseId)
    .maybeSingle();

  if (evidenceError) throw evidenceError;
  if (!evidence) throw badRequest("documentId must reference an evidence record in the selected case.");

  const { data, error } = await input.client
    .from("evidence_ai_analyses")
    .insert({
      tenant_id: evidence.tenant_id,
      evidence_record_id: evidence.id,
      analysis_reference: `fairness-${randomUUID()}`,
      analysis_type: "fairness_detection",
      model_reference: "heuristic-fairness-v1",
      model_version: "2026-08-08",
      confidence_score: 0.55,
      analysis_summary: `Fairness score ${input.analysis.fairness_score}/100`,
      recommended_human_review: true,
      fairness_score: input.analysis.fairness_score,
      bias_indicators: input.analysis.bias_indicators,
      coercion_flags: input.analysis.coercion_flags,
      discrimination_risks: input.analysis.discrimination_risks,
      framing_concerns: input.analysis.framing_concerns,
      unrealistic_expectations: input.analysis.unrealistic_expectations,
      remediation_recommendations: input.analysis.remediation_recommendations,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

function normalizeCaseContext(context) {
  if (!context || typeof context !== "object") return null;
  return {
    case_type: stringField(context.case_type),
    family_composition: stringField(context.family_composition),
    child_ages: Array.isArray(context.child_ages)
      ? context.child_ages
          .map((value) => (typeof value === "number" || typeof value === "string" ? Number(value) : NaN))
          .filter((value) => Number.isFinite(value) && value > 0)
      : null,
    jurisdictions: Array.isArray(context.jurisdictions)
      ? context.jurisdictions.map((value) => String(value).trim()).filter(Boolean)
      : null,
    cultural_background: stringField(context.cultural_background),
  };
}

function stringField(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
