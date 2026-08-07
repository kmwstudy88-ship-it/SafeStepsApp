import { describe, expect, jest, test } from "@jest/globals";

import {
  getDocumentAnalysisRun,
  listDocumentAnalysisRuns,
} from "../../backend/Services/DocumentIntelligence/DocumentPipeline.js";
import { requireCaseAccess } from "../../backend/middleware/authorize.js";

describe("Evidence V1 retrieval access", () => {
  test("requires an active membership for the caseId supplied on retrieval requests", () => {
    const next = jest.fn();
    const req = {
      params: {},
      body: {},
      query: { caseId: "case-1" },
      safeStepsAuth: {
        memberships: [{ caseId: "case-1", membershipRole: "parent", status: "active" }],
      },
    };

    requireCaseAccess(req, {}, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.safeStepsCaseId).toBe("case-1");
  });

  test("blocks a retrieval request for a case without active membership", () => {
    const next = jest.fn();
    const req = {
      params: {},
      body: {},
      query: { caseId: "case-2" },
      safeStepsAuth: {
        memberships: [{ caseId: "case-1", membershipRole: "parent", status: "active" }],
      },
    };

    requireCaseAccess(req, {}, next);

    expect(req.safeStepsCaseId).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 403,
      code: "CASE_ACCESS_FORBIDDEN",
    });
  });

  test("retrieves an analysis only when both analysis id and case id match", async () => {
    const rows = [
      { id: "analysis-1", case_id: "case-1", document_id: "document-1", status: "completed" },
      { id: "analysis-1", case_id: "case-2", document_id: "document-9", status: "completed" },
    ];
    const client = fakeReadClient(rows);

    await expect(getDocumentAnalysisRun(client, "analysis-1", "case-1")).resolves.toMatchObject({
      id: "analysis-1",
      case_id: "case-1",
      document_id: "document-1",
    });

    await expect(getDocumentAnalysisRun(client, "analysis-1", "case-3")).rejects.toMatchObject({
      statusCode: 404,
      code: "NOT_FOUND",
    });
  });

  test("lists analysis history only for the selected document inside the selected case", async () => {
    const rows = [
      { id: "analysis-1", case_id: "case-1", document_id: "document-1", created_at: "2026-08-08T00:00:00Z" },
      { id: "analysis-2", case_id: "case-1", document_id: "document-1", created_at: "2026-08-08T01:00:00Z" },
      { id: "analysis-3", case_id: "case-2", document_id: "document-1", created_at: "2026-08-08T02:00:00Z" },
      { id: "analysis-4", case_id: "case-1", document_id: "document-2", created_at: "2026-08-08T03:00:00Z" },
    ];
    const client = fakeReadClient(rows);

    const analyses = await listDocumentAnalysisRuns(client, "document-1", "case-1");

    expect(analyses.map((item) => item.id)).toEqual(["analysis-2", "analysis-1"]);
    expect(analyses.every((item) => item.case_id === "case-1")).toBe(true);
    expect(analyses.every((item) => item.document_id === "document-1")).toBe(true);
  });
});

function fakeReadClient(rows) {
  return {
    from(table) {
      if (table !== "document_analysis_runs") throw new Error(`Unexpected table ${table}`);
      return query(rows);
    },
  };
}

function query(rows) {
  let filtered = [...rows];

  const chain = {
    select() {
      return chain;
    },
    eq(column, value) {
      filtered = filtered.filter((row) => row[column] === value);
      return chain;
    },
    async maybeSingle() {
      return { data: filtered[0] ?? null, error: null };
    },
    async order(column, { ascending }) {
      const sorted = [...filtered].sort((a, b) => String(a[column]).localeCompare(String(b[column])));
      return { data: ascending ? sorted : sorted.reverse(), error: null };
    },
  };

  return chain;
}
