import { randomUUID } from "node:crypto";
import express from "express";

import { analyzeContradictions } from "../../Services/DocumentIntelligence/ContradictionDetectionEngine.js";
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
  "/contradictions",
  requireAuthenticatedUser,
  requireAnyRole(...DOCUMENT_ROLES),
  requireCaseAccess,
  async (req, res, next) => {
    try {
      const input = validateContradictionRequestBody(req.body);
      const analysis = analyzeContradictions(input.text, input.caseContext);
      const analysisId = await persistContradictionAnalysis({
        client: req.safeStepsAuth?.supabase,
        isLocalBypass: req.safeStepsAuth?.isLocalBypass,
        caseId: req.safeStepsCaseId,
        documentId: input.documentId,
        analysis,
      });

      res.status(201).json({
        analysis_id: analysisId,
        contradiction_score: analysis.contradiction_score,
        contradictions: analysis.contradictions,
        consistency_gaps: analysis.consistency_gaps,
        cross_document_confidence: analysis.cross_document_confidence,
        evidence_conflicts: analysis.evidence_conflicts,
        reviewer_prompts: analysis.reviewer_prompts,
        limitations: analysis.limitations,
        timestamp: analysis.timestamp,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;

export function validateContradictionRequestBody(body = {}) {
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) throw badRequest("text is required for contradiction analysis.");
  assertTextSize(text);

  const documentId = stringField(body.documentId);
  const caseContext = normalizeCaseContext(body.caseContext);

  return { text, documentId, caseContext };
}

export function assertTextSize(text) {
  if (Buffer.byteLength(text, "utf8") > MAX_TEXT_BYTES) {
    throw badRequest("Document text is too large for contradiction analysis. Submit an extract under 2 MB.");
  }
}

export async function persistContradictionAnalysis(input) {
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
      analysis_reference: `contradiction-${randomUUID()}`,
      analysis_type: "contradiction_detection",
      model_reference: "heuristic-contradiction-v1",
      model_version: "2026-08-08",
      confidence_score: 0.55,
      analysis_summary: `Contradiction score ${input.analysis.contradiction_score}/100`,
      recommended_human_review: true,
      contradiction_score: input.analysis.contradiction_score,
      contradictions: input.analysis.contradictions,
      consistency_gaps: input.analysis.consistency_gaps,
      cross_document_confidence: input.analysis.cross_document_confidence,
      evidence_conflicts: input.analysis.evidence_conflicts,
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
  };
}

function stringField(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
