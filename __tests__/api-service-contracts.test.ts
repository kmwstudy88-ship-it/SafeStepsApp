import { assessmentRoutes } from "../lib/data/assessmentSystem";
import {
  apiSecurityTests,
  checkIdempotency,
  contractTestCases,
  coreApiRules,
  endpointContracts,
  errorResponse,
  internalApiDomains,
  mapErrorCodeToStatus,
  publicApiDomains,
  recommendedApiMigrations,
  requiredHeaders,
  success,
  uploadCompletionChecks,
  validateOptimisticConcurrency,
} from "../lib/engines/apiServiceContracts";

describe("apiServiceContracts", () => {
  it("defines public/internal API domains and required headers", () => {
    expect(publicApiDomains).toContain("/api/v1/assessments");
    expect(internalApiDomains).toContain("/internal/v1/events");
    expect(requiredHeaders).toContain("Idempotency-Key");
  });

  it("creates success and error envelopes without leaking internals", () => {
    expect(success({ data: { id: "session-1" }, requestId: "request-1", serverTime: "2026-07-21T00:00:00Z" })).toMatchObject({
      success: true,
      data: { id: "session-1" },
      meta: { request_id: "request-1", api_version: "v1" },
    });
    expect(errorResponse({ code: "ASSESSMENT_INVALID_STATE", message: "Invalid state.", requestId: "request-1" })).toMatchObject({
      success: false,
      error: { code: "ASSESSMENT_INVALID_STATE", message: "Invalid state." },
    });
  });

  it("maps stable error codes to HTTP status codes", () => {
    expect(mapErrorCodeToStatus("AUTH_UNAUTHENTICATED")).toBe(401);
    expect(mapErrorCodeToStatus("EVIDENCE_ACCESS_DENIED")).toBe(403);
    expect(mapErrorCodeToStatus("ASSESSMENT_NOT_FOUND")).toBe(404);
    expect(mapErrorCodeToStatus("ASSESSMENT_VERSION_CONFLICT")).toBe(409);
    expect(mapErrorCodeToStatus("VALIDATION_ERROR")).toBe(422);
  });

  it("enforces idempotency and optimistic concurrency", () => {
    expect(checkIdempotency({ requestHash: "abc" })).toEqual({ outcome: "new" });
    expect(checkIdempotency({
      requestHash: "def",
      existing: { userId: "u1", endpointCode: "submit", idempotencyKey: "key", requestHash: "abc", status: "completed" },
    })).toMatchObject({ outcome: "conflict", errorCode: "IDEMPOTENCY_KEY_REUSED" });
    expect(validateOptimisticConcurrency({ expectedVersion: 4, currentVersion: 5 })).toMatchObject({
      valid: false,
      errorCode: "ASSESSMENT_VERSION_CONFLICT",
    });
  });

  it("requires upload completion checks before evidence processing", () => {
    expect(uploadCompletionChecks({
      belongsToUser: true,
      notExpired: true,
      objectExists: true,
      sizeMatches: true,
      mimeAllowed: true,
      pathMatchesSession: true,
      notAlreadyCompleted: true,
      caseAccessValid: true,
      consentOrAuthorityRecorded: false,
      inQuarantine: true,
    })).toEqual({ complete: false, failures: ["consentOrAuthorityRecorded"] });
  });

  it("documents controlled endpoints, tests, migrations, rules, and route exposure", () => {
    expect(endpointContracts.find((endpoint) => endpoint.path.includes("/submit"))?.controlledEndpoint).toBe(true);
    expect(endpointContracts.find((endpoint) => endpoint.path.includes("/submit"))?.workflowEventsEmitted).toEqual(["assessment.submitted"]);
    expect(contractTestCases).toContain("reused key with different body");
    expect(apiSecurityTests).toContain("Child-only evidence requested by parent");
    expect(recommendedApiMigrations).toHaveLength(10);
    expect(coreApiRules).toContain("File uploads must enter quarantine first.");
    expect(
      assessmentRoutes.some((route) => route.href === "/assessment-system/api-service-contracts"),
    ).toBe(true);
  });
});
