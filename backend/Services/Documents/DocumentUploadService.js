import { createHash, randomUUID } from "node:crypto";

import { ApiError, badRequest, notFound } from "../../lib/apiError.js";
import { STAFF_DOCUMENT_ROLES } from "../../middleware/authorize.js";

export const DOCUMENT_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
export const DOCUMENT_UPLOAD_MIME_TYPES = [
  "application/pdf",
  "text/plain",
  "text/csv",
  "text/markdown",
  "application/json",
];

const DOCUMENT_TYPES = [
  "tenancy_agreement",
  "centrelink_statement",
  "court_order",
  "service_letter",
  "medical",
  "school",
  "financial",
  "identity",
  "other",
];

export async function uploadCaseDocument(input) {
  const {
    client,
    userId,
    roles,
    caseId,
    file,
    documentId: requestedDocumentId,
    documentType = "other",
    title = file.originalname,
  } = input;

  if (!DOCUMENT_TYPES.includes(documentType)) {
    throw badRequest("documentType is not a supported SafeSteps document type.");
  }
  if (!supportedUpload(file)) {
    throw new ApiError(
      415,
      "UNSUPPORTED_MEDIA_TYPE",
      "Use PDF, TXT, CSV, Markdown, or JSON for document upload.",
    );
  }

  const document = requestedDocumentId
    ? await getDocument(client, requestedDocumentId, caseId)
    : await createDocument(client, {
        caseId,
        userId,
        roles,
        documentType,
        title: String(title).trim() || file.originalname,
      });

  const versionNumber = await nextVersionNumber(client, document.id);
  const fileName = safeFileName(file.originalname);
  const filePath = `${userId}/case-documents/${caseId}/${document.id}/v${versionNumber}-${randomUUID()}-${fileName}`;
  const fileSha256 = createHash("sha256").update(file.buffer).digest("hex");

  const { error: uploadError } = await client.storage.from("evidence").upload(filePath, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });

  if (uploadError) {
    throw new ApiError(503, "DOCUMENT_STORAGE_FAILED", "SafeSteps could not store the document.", {
      cause: uploadError,
    });
  }

  try {
    const { data: version, error: versionError } = await client
      .from("case_document_versions")
      .insert({
        document_id: document.id,
        version_number: versionNumber,
        file_path: filePath,
        file_name: file.originalname,
        mime_type: file.mimetype,
        file_sha256: fileSha256,
        uploaded_by: userId,
      })
      .select("*")
      .single();

    if (versionError) throw versionError;

    return {
      document,
      version,
      storage: {
        bucket: "evidence",
        path: filePath,
        sha256: fileSha256,
      },
    };
  } catch (error) {
    await client.storage.from("evidence").remove([filePath]);
    throw new ApiError(
      503,
      "DOCUMENT_REGISTRATION_FAILED",
      "The document was not registered in the SafeSteps case.",
      { cause: error },
    );
  }
}

async function createDocument(client, input) {
  const isStaff = input.roles.some((role) => STAFF_DOCUMENT_ROLES.includes(role));
  const { data, error } = await client
    .from("case_documents")
    .insert({
      case_id: input.caseId,
      parent_user_id: isStaff ? null : input.userId,
      worker_user_id: isStaff ? input.userId : null,
      document_type: input.documentType,
      title: input.title,
      status: "requested",
      created_by: input.userId,
    })
    .select("*")
    .single();

  if (error) {
    throw new ApiError(503, "DOCUMENT_CREATE_FAILED", "SafeSteps could not create the case document.", {
      cause: error,
    });
  }

  return data;
}

async function getDocument(client, documentId, caseId) {
  const { data, error } = await client
    .from("case_documents")
    .select("*")
    .eq("id", documentId)
    .eq("case_id", caseId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw notFound("The selected SafeSteps case document was not found.");
  return data;
}

async function nextVersionNumber(client, documentId) {
  const { data, error } = await client
    .from("case_document_versions")
    .select("version_number")
    .eq("document_id", documentId)
    .order("version_number", { ascending: false })
    .limit(1);

  if (error) throw error;
  return Number(data?.[0]?.version_number ?? 0) + 1;
}

function supportedUpload(file) {
  if (!file?.buffer || file.buffer.length === 0 || file.buffer.length > DOCUMENT_UPLOAD_MAX_BYTES) {
    return false;
  }
  const extension = file.originalname?.toLowerCase().split(".").pop();
  return (
    DOCUMENT_UPLOAD_MIME_TYPES.includes(file.mimetype) ||
    ["pdf", "txt", "csv", "md", "json"].includes(extension)
  );
}

function safeFileName(fileName) {
  const safe = String(fileName ?? "document")
    .normalize("NFKC")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .slice(-120);
  return safe || "document";
}
