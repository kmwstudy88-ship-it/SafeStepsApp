import { createHash, randomUUID } from "node:crypto";
import express from "express";

import { analyzeFairnessDocument } from "../../Services/DocumentIntelligence/FairnessEngine.js";
import { badRequest, serviceUnavailable } from "../../lib/apiError.js";
import {
  DOCUMENT_ROLES,
  requireAnyRole,
  requireCaseAccess,
} from "../../middleware/authorize.js";
import { requireAuthenticatedUser } from "../../middleware/requireAuthenticatedUser.js";

const MAX_TEXT_BYTES = 2 * 1024 * 1024;

const router = express.Router();

const auth = [requireAuthenticatedUser, requireAnyRole(...DOCUMENT_ROLES), requireCaseAccess];

// ─── shared helpers ──────────────────────────────────────────────────────────

export function validateSkillInput(body = {}, skillName) {
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) throw badRequest(`text is required for ${skillName}.`);
  assertTextSize(text);
  const documentId = stringField(body.documentId);
  return { text, documentId };
}

export function assertTextSize(text) {
  if (Buffer.byteLength(text, "utf8") > MAX_TEXT_BYTES) {
    throw badRequest("Document text is too large for analysis. Submit an extract under 2 MB.");
  }
}

export async function persistSkillResult({ client, isLocalBypass, caseId, skillName, inputText, result }) {
  if (isLocalBypass || !client) return `${skillName}-${randomUUID()}`;

  const inputHash = createHash("sha256").update(inputText).digest("hex");

  const { data, error } = await client
    .from("agent_skill_results")
    .insert({
      id: randomUUID(),
      skill_name: skillName,
      case_id: caseId ?? null,
      input_hash: inputHash,
      result,
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

function stringField(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isOpenAIUnavailable(err) {
  const status = err?.status ?? err?.statusCode;
  return (
    err?.code === "ECONNREFUSED" ||
    err?.code === "ENOTFOUND" ||
    status === 503 ||
    status === 429 ||
    status === 500
  );
}

function skillHandler(skillName, engineFn) {
  return async (req, res, next) => {
    try {
      const input = validateSkillInput(req.body, skillName);

      let rawResult;
      try {
        rawResult = await engineFn(input.text);
      } catch (engineErr) {
        if (isOpenAIUnavailable(engineErr)) {
          return next(serviceUnavailable("The AI analysis service is temporarily unavailable. Please try again shortly."));
        }
        throw engineErr;
      }

      let result;
      try {
        result = typeof rawResult === "string" ? JSON.parse(rawResult) : rawResult;
      } catch {
        result = { raw: rawResult };
      }

      const resultId = await persistSkillResult({
        client: req.safeStepsAuth?.supabase,
        isLocalBypass: req.safeStepsAuth?.isLocalBypass,
        caseId: req.safeStepsCaseId,
        skillName,
        inputText: input.text,
        result,
      });

      res.status(201).json({ result_id: resultId, skill_name: skillName, result });
    } catch (error) {
      next(error);
    }
  };
}

// ─── routes ──────────────────────────────────────────────────────────────────

router.post("/fairness-detect", ...auth, skillHandler("fairness_detection", (text) => {
  const analysis = analyzeFairnessDocument(text);
  return JSON.stringify(analysis);
}));

router.post("/contradiction-detect", ...auth, skillHandler("contradiction_detection", async (text) => {
  const { detectContradictions } = await import("../../Services/DocumentIntelligence/ContradictionEngine.js");
  return detectContradictions(text);
}));

router.post("/evidence-extract", ...auth, skillHandler("evidence_extraction", async (text) => {
  const { extractEvidence } = await import("../../Services/DocumentIntelligence/EvidenceExtractionEngine.js");
  return extractEvidence(text);
}));

router.post("/requirement-extract", ...auth, skillHandler("requirement_extraction", async (text) => {
  const { extractRequirements } = await import("../../Services/DocumentIntelligence/RequirementsExtractionEngine.js");
  return extractRequirements(text);
}));

router.post("/timeline-extract", ...auth, skillHandler("timeline_extraction", async (text) => {
  const { extractTimeline } = await import("../../Services/DocumentIntelligence/TimelineExtractionEngine.js");
  return extractTimeline(text);
}));

router.post("/risk-assess", ...auth, skillHandler("risk_assessment", async (text) => {
  const { assessRisk } = await import("../../Services/DocumentIntelligence/RiskAssessmentEngine.js");
  return assessRisk(text);
}));

router.post("/concern-classify", ...auth, skillHandler("concern_classification", async (text) => {
  const { classifyConcerns } = await import("../../Services/DocumentIntelligence/ConcernClassificationEngine.js");
  return classifyConcerns(text);
}));

router.post("/expectation-detect", ...auth, skillHandler("unrealistic_expectation_detection", async (text) => {
  const { detectUnrealisticExpectations } = await import("../../Services/DocumentIntelligence/UnrealisticExpectationEngine.js");
  return detectUnrealisticExpectations(text);
}));

export default router;
