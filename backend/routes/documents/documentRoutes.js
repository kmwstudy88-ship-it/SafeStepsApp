import express from "express";
import multer from "multer";

import {
  DOCUMENT_INTELLIGENCE_MAX_TEXT_CHARS,
  DOCUMENT_INTELLIGENCE_SCHEMA_VERSION,
  analyzeDocument,
  documentIntelligenceSections,
} from "../../Services/DocumentIntelligence/DocumentService.js";
import {
  getDocumentAnalysisRun,
  listDocumentAnalysisRuns,
  runDocumentIntelligencePipeline,
} from "../../Services/DocumentIntelligence/DocumentPipeline.js";
import {
  DOCUMENT_UPLOAD_MAX_BYTES,
  DOCUMENT_UPLOAD_MIME_TYPES,
  uploadCaseDocument,
} from "../../Services/Documents/DocumentUploadService.js";
import { badRequest, serviceUnavailable } from "../../lib/apiError.js";
import {
  DOCUMENT_ROLES,
  requireAnyRole,
  requireCaseAccess,
} from "../../middleware/authorize.js";
import { requireAuthenticatedUser } from "../../middleware/requireAuthenticatedUser.js";

const router = express.Router();
const MAX_TEXT_BYTES = 2 * 1024 * 1024;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: DOCUMENT_UPLOAD_MAX_BYTES,
    files: 1,
    fields: 20,
  },
});

router.get("/intelligence/schema", (_req, res) => {
  res.json({
    schemaVersion: DOCUMENT_INTELLIGENCE_SCHEMA_VERSION,
    maxTextBytes: MAX_TEXT_BYTES,
    maxTextCharacters: DOCUMENT_INTELLIGENCE_MAX_TEXT_CHARS,
    maxFileBytes: DOCUMENT_UPLOAD_MAX_BYTES,
    supportedFileTypes: DOCUMENT_UPLOAD_MIME_TYPES,
    sections: documentIntelligenceSections(),
  });
});

router.post(
  "/upload",
  requireAuthenticatedUser,
  requireAnyRole(...DOCUMENT_ROLES),
  upload.single("file"),
  requireCaseAccess,
  async (req, res, next) => {
    try {
      if (!req.file) throw badRequest("Upload one document file in the file field.");

      const uploaded = await uploadCaseDocument({
        client: req.safeStepsAuth.supabase,
        userId: req.safeStepsAuth.user.id,
        roles: req.safeStepsAuth.roles,
        caseId: req.safeStepsCaseId,
        file: req.file,
        documentId: stringField(req.body?.documentId),
        documentType: stringField(req.body?.documentType) ?? "other",
        title: stringField(req.body?.title) ?? req.file.originalname,
      });

      res.status(201).json({
        data: {
          document: uploaded.document,
          version: uploaded.version,
        },
        meta: { requestId: req.id },
      });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/analyze",
  requireAuthenticatedUser,
  requireAnyRole(...DOCUMENT_ROLES),
  upload.single("file"),
  requireCaseAccess,
  async (req, res, next) => {
    try {
      if (process.env.SAFESTEPS_OPENAI_CONFIGURED !== "true") {
        throw serviceUnavailable("Set OPENAI_KEY or OPENAI_API_KEY before running document intelligence.");
      }

      const text = await documentTextFromRequest(req);

      if (req.safeStepsAuth.isLocalBypass) {
        const result = await analyzeDocument(text);
        res.json({
          source: sourceEnvelope(req, text),
          result,
        });
        return;
      }

      const uploaded = req.file
        ? await uploadCaseDocument({
            client: req.safeStepsAuth.supabase,
            userId: req.safeStepsAuth.user.id,
            roles: req.safeStepsAuth.roles,
            caseId: req.safeStepsCaseId,
            file: req.file,
            documentId: stringField(req.body?.documentId),
            documentType: stringField(req.body?.documentType) ?? "other",
            title: stringField(req.body?.title) ?? req.file.originalname,
          })
        : null;

      const analysis = await runDocumentIntelligencePipeline({
        client: req.safeStepsAuth.supabase,
        userId: req.safeStepsAuth.user.id,
        caseId: req.safeStepsCaseId,
        documentId: uploaded?.document.id ?? stringField(req.body?.documentId),
        documentVersionId: uploaded?.version.id ?? null,
        sourceMode: req.file ? "file" : "text",
        sourceMetadata: sourceEnvelope(req, text),
        text,
      });

      res.status(201).json({
        data: {
          source: sourceEnvelope(req, text),
          document: uploaded?.document ?? null,
          documentVersion: uploaded?.version ?? null,
          analysis,
        },
        meta: { requestId: req.id },
      });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/analyses/:analysisId",
  requireAuthenticatedUser,
  requireAnyRole(...DOCUMENT_ROLES),
  async (req, res, next) => {
    try {
      const analysis = await getDocumentAnalysisRun(
        req.safeStepsAuth.supabase,
        req.params.analysisId,
      );
      res.json({ data: { analysis }, meta: { requestId: req.id } });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/:documentId/analyses",
  requireAuthenticatedUser,
  requireAnyRole(...DOCUMENT_ROLES),
  async (req, res, next) => {
    try {
      const analyses = await listDocumentAnalysisRuns(
        req.safeStepsAuth.supabase,
        req.params.documentId,
      );
      res.json({ data: { analyses }, meta: { requestId: req.id } });
    } catch (error) {
      next(error);
    }
  },
);

export default router;

export async function documentTextFromRequest(req) {
  const bodyText = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (bodyText) {
    assertTextSize(bodyText);
    return bodyText;
  }

  if (!req.file) {
    throw badRequest("Send document text in the text field or upload a supported document file.");
  }

  const mimeType = req.file.mimetype ?? "";
  if (mimeType === "application/pdf" || req.file.originalname?.toLowerCase().endsWith(".pdf")) {
    return textFromPdf(req.file.buffer);
  }

  if (isTextLikeFile(mimeType, req.file.originalname)) {
    const text = req.file.buffer.toString("utf8").trim();
    assertTextSize(text);
    if (!text) throw badRequest("The uploaded document did not contain readable text.");
    return text;
  }

  throw badRequest("Unsupported document type. Use PDF, TXT, CSV, Markdown, JSON, or paste text.");
}

async function textFromPdf(buffer) {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });

  try {
    const parsed = await parser.getText();
    const text = parsed.text.trim();
    assertTextSize(text);
    if (!text) throw badRequest("The uploaded PDF did not contain extractable text.");
    return text;
  } finally {
    await parser.destroy();
  }
}

function assertTextSize(text) {
  if (Buffer.byteLength(text, "utf8") > MAX_TEXT_BYTES) {
    throw badRequest("Document text is too large for review. Submit an extract under 2 MB.");
  }
}

function isTextLikeFile(mimeType, fileName = "") {
  const lowerName = fileName.toLowerCase();
  return (
    mimeType.startsWith("text/") ||
    mimeType === "application/json" ||
    [".txt", ".csv", ".md", ".json"].some((extension) => lowerName.endsWith(extension))
  );
}

function sourceEnvelope(req, text) {
  return {
    mode: req.file ? "file" : "text",
    fileName: req.file?.originalname ?? null,
    mimeType: req.file?.mimetype ?? null,
    textLength: text.length,
  };
}

function stringField(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
