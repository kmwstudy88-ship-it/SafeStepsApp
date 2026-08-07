import { describe, expect, jest, test } from "@jest/globals";

import { runDocumentIntelligencePipeline } from "../../backend/Services/DocumentIntelligence/DocumentPipeline.js";
import { uploadCaseDocument } from "../../backend/Services/Documents/DocumentUploadService.js";

describe("Evidence V1 case-linked document chain", () => {
  test("carries case, document and version identity from upload into analysis", async () => {
    const writes = [];
    const client = fakeEvidenceClient(writes);
    const userId = "11111111-1111-4111-8111-111111111111";
    const caseId = "22222222-2222-4222-8222-222222222222";

    const uploaded = await uploadCaseDocument({
      client,
      userId,
      roles: ["parent"],
      caseId,
      file: {
        originalname: "service letter.pdf",
        mimetype: "application/pdf",
        buffer: Buffer.from("Parent attended the service and completed the requested work."),
      },
      documentType: "service_letter",
      title: "Service letter",
    });

    const analysisResult = {
      schemaVersion: "2026-07-15",
      model: "evidence-v1-test-model",
      overallSummary: "Human review required.",
    };

    const completed = await runDocumentIntelligencePipeline(
      {
        client,
        userId,
        caseId,
        documentId: uploaded.document.id,
        documentVersionId: uploaded.version.id,
        sourceMode: "uploaded_document",
        sourceMetadata: {
          fileName: uploaded.version.file_name,
          sha256: uploaded.storage.sha256,
        },
        text: "Parent attended the service and completed the requested work.",
      },
      { analyzer: jest.fn(async () => analysisResult) },
    );

    const uploadWrite = writes.find((entry) => entry.operation === "storage.upload");
    const documentWrite = writes.find(
      (entry) => entry.operation === "insert" && entry.table === "case_documents",
    );
    const versionWrite = writes.find(
      (entry) => entry.operation === "insert" && entry.table === "case_document_versions",
    );
    const analysisWrite = writes.find(
      (entry) => entry.operation === "insert" && entry.table === "document_analysis_runs",
    );

    expect(uploadWrite).toMatchObject({ bucket: "evidence" });
    expect(uploadWrite.path).toContain(`${userId}/case-documents/${caseId}/`);
    expect(documentWrite.value).toMatchObject({
      case_id: caseId,
      parent_user_id: userId,
      document_type: "service_letter",
    });
    expect(versionWrite.value).toMatchObject({
      document_id: uploaded.document.id,
      uploaded_by: userId,
      file_sha256: uploaded.storage.sha256,
    });
    expect(analysisWrite.value).toMatchObject({
      case_id: caseId,
      document_id: uploaded.document.id,
      document_version_id: uploaded.version.id,
      requested_by: userId,
      status: "processing",
    });
    expect(completed).toMatchObject({
      id: "analysis-1",
      case_id: caseId,
      document_id: uploaded.document.id,
      document_version_id: uploaded.version.id,
      status: "completed",
      model: "evidence-v1-test-model",
    });
  });
});

function fakeEvidenceClient(writes) {
  const document = {
    id: "document-1",
    case_id: "22222222-2222-4222-8222-222222222222",
  };
  let analysisRun;

  return {
    storage: {
      from(bucket) {
        return {
          async upload(path) {
            writes.push({ operation: "storage.upload", bucket, path });
            return { error: null };
          },
          async remove(paths) {
            writes.push({ operation: "storage.remove", bucket, paths });
            return { error: null };
          },
        };
      },
    },
    from(table) {
      if (table === "case_documents") {
        return {
          insert(value) {
            writes.push({ operation: "insert", table, value });
            return {
              select() {
                return {
                  async single() {
                    return { data: { ...document, ...value }, error: null };
                  },
                };
              },
            };
          },
        };
      }

      if (table === "case_document_versions") {
        return {
          select() {
            return {
              eq() {
                return {
                  order() {
                    return {
                      async limit() {
                        return { data: [], error: null };
                      },
                    };
                  },
                };
              },
            };
          },
          insert(value) {
            writes.push({ operation: "insert", table, value });
            return {
              select() {
                return {
                  async single() {
                    return {
                      data: { id: "version-1", ...value },
                      error: null,
                    };
                  },
                };
              },
            };
          },
        };
      }

      if (table === "document_analysis_runs") {
        return {
          insert(value) {
            writes.push({ operation: "insert", table, value });
            analysisRun = { id: "analysis-1", ...value };
            return {
              select() {
                return {
                  async single() {
                    return { data: analysisRun, error: null };
                  },
                };
              },
            };
          },
          update(value) {
            writes.push({ operation: "update", table, value });
            const updated = { ...analysisRun, ...value };
            return {
              eq() {
                return {
                  select() {
                    return {
                      async single() {
                        analysisRun = updated;
                        return { data: updated, error: null };
                      },
                    };
                  },
                };
              },
            };
          },
        };
      }

      throw new Error(`Unexpected table ${table}`);
    },
  };
}
