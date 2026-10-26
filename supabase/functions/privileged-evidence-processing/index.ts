import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  assertCaseRole,
  assertCaseTenant,
  authenticate,
  corsHeaders,
  errorResponse,
  findIdempotentAudit,
  methodGuard,
  optionalBoolean,
  optionalString,
  parseBody,
  requiredEnum,
  requiredString,
  requiredUuid,
  response,
  writeAudit,
} from "../_shared/privileged.ts";

const actions = ["review_document_version", "queue_document_processing"] as const;

Deno.serve(async (req: Request) => {
  const cors = corsHeaders(req);
  if (!cors) return response({ error: "Origin not allowed" }, 403);

  const guarded = methodGuard(req, cors);
  if (guarded) return guarded;

  try {
    const { user, userClient, adminClient } = await authenticate(req);
    const body = parseBody(await req.json());
    const action = requiredEnum(body, "action", actions);
    const tenantId = requiredUuid(body, "tenantId");
    const caseId = requiredUuid(body, "caseId");

    await assertCaseRole(userClient, caseId, ["caseworker", "supervisor", "admin", "clinician"]);
    await assertCaseTenant(userClient, caseId, tenantId);

    if (action === "review_document_version") {
      const documentId = requiredUuid(body, "documentId");
      const documentVersionId = requiredUuid(body, "documentVersionId");
      const decision = requiredEnum(body, "decision", ["accepted", "needs_update", "excluded"] as const);
      const includeInReport = optionalBoolean(body, "includeInReport", false);
      const reviewNotes = optionalString(body, "reviewNotes", 2000) ?? "";
      const idempotencyKey = requiredString(body, "idempotencyKey", 128);

      const existing = await findIdempotentAudit(adminClient, {
        idempotencyKey,
        actorUserId: user.id,
        action: "evidence.review_document_version",
        resourceType: "case_document",
        resourceId: documentId,
        caseId,
      });
      if (existing) return response({ ok: true, idempotent: true, auditId: existing.id }, 200, cors);

      const { data: reviewEventId, error } = await userClient.rpc("review_case_document_version", {
        p_case_id: caseId,
        p_document_id: documentId,
        p_document_version_id: documentVersionId,
        p_decision: decision,
        p_include_in_report: includeInReport,
        p_review_notes: reviewNotes,
      });
      if (error || !reviewEventId) return response({ error: "Evidence review failed" }, 400, cors);

      const audit = await writeAudit(adminClient, {
        caseId,
        actorUserId: user.id,
        action: "evidence.review_document_version",
        resourceType: "case_document",
        resourceId: documentId,
        details: { idempotency_key: idempotencyKey, review_event_id: reviewEventId },
      });

      return response({ ok: true, reviewEventId, auditId: audit.id }, 200, cors);
    }

    const documentId = requiredUuid(body, "documentId");
    const idempotencyKey = requiredString(body, "idempotencyKey", 128);

    const existing = await findIdempotentAudit(adminClient, {
      idempotencyKey,
      actorUserId: user.id,
      action: "evidence.queue_document_processing",
      resourceType: "case_document",
      resourceId: documentId,
      caseId,
    });
    if (existing) return response({ ok: true, idempotent: true, auditId: existing.id }, 200, cors);

    const { data: eventRow, error: eventError } = await adminClient
      .from("events")
      .insert({
        case_id: caseId,
        document_id: documentId,
        actor_user_id: user.id,
        event_type: "document_processing_queued",
        event_payload: {
          source: "privileged-evidence-processing",
          requested_at: new Date().toISOString(),
          idempotency_key: idempotencyKey,
        },
      })
      .select("id, created_at")
      .single();

    if (eventError || !eventRow) return response({ error: "Document processing queue failed" }, 400, cors);

    const audit = await writeAudit(adminClient, {
      caseId,
      actorUserId: user.id,
      action: "evidence.queue_document_processing",
      resourceType: "case_document",
      resourceId: documentId,
      details: { idempotency_key: idempotencyKey, queue_event_id: eventRow.id },
    });

    return response({ ok: true, queueEventId: eventRow.id, auditId: audit.id }, 200, cors);
  } catch (error) {
    return errorResponse(error, cors);
  }
});
