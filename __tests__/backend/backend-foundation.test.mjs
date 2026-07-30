import { afterEach, describe, expect, jest, test } from "@jest/globals";

import { ApiError, errorEnvelope } from "../../backend/lib/apiError.js";
import { redact } from "../../backend/lib/logger.js";
import {
  hasActiveCaseMembership,
  hasAnyRole,
} from "../../backend/middleware/authorize.js";
import { bearerToken } from "../../backend/middleware/requireAuthenticatedUser.js";
import { runDocumentIntelligencePipeline } from "../../backend/Services/DocumentIntelligence/DocumentPipeline.js";
import { uploadCaseDocument } from "../../backend/Services/Documents/DocumentUploadService.js";

describe("standard API errors and logging", () => {
  test("returns one stable error envelope with a request id", () => {
    const response = errorEnvelope(
      new ApiError(403, "ROLE_FORBIDDEN", "Role denied."),
      "request-123",
    );

    expect(response).toEqual({
      statusCode: 403,
      body: {
        error: {
          code: "ROLE_FORBIDDEN",
          message: "Role denied.",
          requestId: "request-123",
        },
      },
    });
  });

  test("does not expose internal errors or log secrets", () => {
    const response = errorEnvelope(new Error("database password leaked"), "request-456");
    expect(response.body.error.message).toBe("The SafeSteps request could not be completed.");
    expect(redact({ password: "secret", nested: { authorization: "Bearer token", ok: true } })).toEqual({
      password: "[REDACTED]",
      nested: { authorization: "[REDACTED]", ok: true },
    });
  });
});

describe("authentication and authorization boundaries", () => {
  test("parses only bearer authorization headers", () => {
    expect(bearerToken("Bearer valid-token")).toBe("valid-token");
    expect(bearerToken("Basic invalid")).toBeNull();
    expect(bearerToken(undefined)).toBeNull();
  });

  test("requires both an allowed role and active case membership", () => {
    expect(hasAnyRole(["parent"], ["parent", "caseworker"])).toBe(true);
    expect(hasAnyRole(["child"], ["parent", "caseworker"])).toBe(false);
    expect(
      hasActiveCaseMembership(
        [{ caseId: "case-1", membershipRole: "parent", status: "active" }],
        "case-1",
      ),
    ).toBe(true);
    expect(
      hasActiveCaseMembership(
        [{ caseId: "case-2", membershipRole: "parent", status: "active" }],
        "case-1",
      ),
    ).toBe(false);
  });
});

describe("document intelligence pipeline", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("persists a processing run and its completed result", async () => {
    const writes = [];
    const client = fakePipelineClient(writes);
    const result = {
      schemaVersion: "2026-07-15",
      model: "test-model",
      overallSummary: "Human review required.",
    };

    const completed = await runDocumentIntelligencePipeline(
      {
        client,
        userId: "user-1",
        caseId: "case-1",
        sourceMode: "text",
        sourceMetadata: { textLength: 45 },
        text: "Parent attended a review and provided supporting evidence.",
      },
      { analyzer: jest.fn(async () => result) },
    );

    expect(writes[0]).toMatchObject({
      operation: "insert",
      table: "document_analysis_runs",
      value: {
        case_id: "case-1",
        requested_by: "user-1",
        status: "processing",
      },
    });
    expect(writes[1]).toMatchObject({
      operation: "update",
      value: {
        status: "completed",
        model: "test-model",
        result,
      },
    });
    expect(completed.status).toBe("completed");
  });

  test("stores uploaded documents under the authenticated user's private storage prefix", async () => {
    const writes = [];
    const client = fakeUploadClient(writes);

    const uploaded = await uploadCaseDocument({
      client,
      userId: "11111111-1111-4111-8111-111111111111",
      roles: ["parent"],
      caseId: "22222222-2222-4222-8222-222222222222",
      file: {
        originalname: "service letter.pdf",
        mimetype: "application/pdf",
        buffer: Buffer.from("test document"),
      },
      documentType: "service_letter",
      title: "Service letter",
    });

    expect(writes.find((item) => item.operation === "storage.upload").path).toMatch(
      /^11111111-1111-4111-8111-111111111111\/case-documents\//,
    );
    expect(uploaded.version.version_number).toBe(1);
    expect(uploaded.storage.sha256).toHaveLength(64);
  });
});

function fakePipelineClient(writes) {
  let inserted;

  return {
    from(table) {
      return {
        insert(value) {
          writes.push({ operation: "insert", table, value });
          inserted = { id: "analysis-1", ...value };
          return {
            select() {
              return {
                async single() {
                  return { data: inserted, error: null };
                },
              };
            },
          };
        },
        update(value) {
          writes.push({ operation: "update", table, value });
          const updated = { ...inserted, ...value };
          const afterEq = {
            select() {
              return {
                async single() {
                  return { data: updated, error: null };
                },
              };
            },
          };
          return {
            eq() {
              return afterEq;
            },
          };
        },
      };
    },
  };
}

function fakeUploadClient(writes) {
  const document = { id: "document-1", case_id: "22222222-2222-4222-8222-222222222222" };

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
                    return { data: { id: "version-1", ...value }, error: null };
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
