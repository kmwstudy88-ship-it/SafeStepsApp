import { ApiError, notFound } from "../../lib/apiError.js";
import { normalizeApiError } from "../../lib/apiError.js";
import {
  DOCUMENT_INTELLIGENCE_SCHEMA_VERSION,
  analyzeDocument,
} from "./DocumentService.js";
import {
  attachSkillsToAnalysisResult,
  createDocumentSkillsOrchestrator,
  executeRequestedDocumentSkills,
} from "../../skills/documentIntelligenceAdapter.js";

export async function runDocumentIntelligencePipeline(input, options = {}) {
  const analyzer = options.analyzer ?? analyzeDocument;
  const startedAt = new Date().toISOString();
  const { data: run, error: insertError } = await input.client
    .from("document_analysis_runs")
    .insert({
      case_id: input.caseId,
      document_id: input.documentId ?? null,
      document_version_id: input.documentVersionId ?? null,
      requested_by: input.userId,
      source_mode: input.sourceMode,
      source_metadata: input.sourceMetadata ?? {},
      status: "processing",
      schema_version: DOCUMENT_INTELLIGENCE_SCHEMA_VERSION,
      started_at: startedAt,
    })
    .select("*")
    .single();

  if (insertError) {
    throw new ApiError(
      503,
      "ANALYSIS_RUN_CREATE_FAILED",
      "SafeSteps could not start the document analysis pipeline.",
      { cause: insertError },
    );
  }

  try {
    let result = await analyzer(input.text, options.analyzerOptions);

    const requestedSkills = input.skills ?? options.skills;
    if (requestedSkills) {
      try {
        const skillsOrchestrator =
          options.skillsOrchestrator ??
          createDocumentSkillsOrchestrator(options.skillHandlers);
        const skillOutputs = await executeRequestedDocumentSkills({
          text: input.text,
          documentId: input.documentId ?? null,
          caseId: input.caseId ?? null,
          skills: requestedSkills,
          orchestrator: skillsOrchestrator,
          context: { userId: input.userId },
        });
        result = attachSkillsToAnalysisResult(result, skillOutputs);
      } catch (skillError) {
        console.warn(
          "[document-pipeline] skills orchestration failed safely:",
          skillError?.message,
        );
        result = {
          ...result,
          skills: {
            status: "failed",
            error: {
              code: "SKILLS_ATTACHMENT_FAILED",
              message: skillError?.message || "Skills orchestration failed.",
            },
            decisionSupportOnly: true,
            humanReviewRequired: true,
            irreversibleActionsAllowed: false,
          },
        };
      }
    }

    const { data: completed, error: updateError } = await input.client
      .from("document_analysis_runs")
      .update({
        status: "completed",
        schema_version: result.schemaVersion,
        model: result.model,
        result,
        completed_at: new Date().toISOString(),
        error_code: null,
        error_message: null,
      })
      .eq("id", run.id)
      .select("*")
      .single();

    if (updateError) throw updateError;
    return completed;
  } catch (error) {
    const normalized = normalizeApiError(error);
    await input.client
      .from("document_analysis_runs")
      .update({
        status: "failed",
        error_code: normalized.code,
        error_message: normalized.expose ? normalized.message : "Document analysis failed.",
        completed_at: new Date().toISOString(),
      })
      .eq("id", run.id);
    throw error;
  }
}

export async function getDocumentAnalysisRun(client, analysisId, caseId) {
  const { data, error } = await client
    .from("document_analysis_runs")
    .select("*")
    .eq("id", analysisId)
    .eq("case_id", caseId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw notFound("The SafeSteps document analysis result was not found.");
  return data;
}

export async function listDocumentAnalysisRuns(client, documentId, caseId) {
  const { data, error } = await client
    .from("document_analysis_runs")
    .select("*")
    .eq("document_id", documentId)
    .eq("case_id", caseId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
