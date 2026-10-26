import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  assertCaseRole,
  assertCaseTenant,
  authenticate,
  corsHeaders,
  errorResponse,
  findIdempotentAudit,
  methodGuard,
  optionalString,
  parseBody,
  requiredEnum,
  requiredString,
  requiredUuid,
  response,
  writeAudit,
} from "../_shared/privileged.ts";

const actions = ["decide_report_version", "release_report_version", "acknowledge_video_delivery"] as const;

Deno.serve(async (req: Request) => {
  const cors = corsHeaders(req);
  if (!cors) return response({ error: "Origin not allowed" }, 403);

  const guarded = methodGuard(req, cors);
  if (guarded) return guarded;

  try {
    const { user, userClient, adminClient } = await authenticate(req);
    const body = parseBody(await req.json());
    const action = requiredEnum(body, "action", actions);

    if (action === "decide_report_version") {
      const tenantId = requiredUuid(body, "tenantId");
      const caseId = requiredUuid(body, "caseId");
      const reportId = requiredUuid(body, "reportId");
      const reportVersionId = requiredUuid(body, "reportVersionId");
      const decision = requiredEnum(body, "decision", ["approved", "changes_requested", "rejected"] as const);
      const decisionReason = optionalString(body, "decisionReason", 1000) ?? "";
      const idempotencyKey = requiredString(body, "idempotencyKey", 128);

      await assertCaseRole(userClient, caseId, ["supervisor", "admin"]);
      await assertCaseTenant(userClient, caseId, tenantId);

      const existing = await findIdempotentAudit(adminClient, {
        idempotencyKey,
        actorUserId: user.id,
        action: "video_report_admin.decide_report_version",
        resourceType: "report",
        resourceId: reportId,
        caseId,
      });
      if (existing) return response({ ok: true, idempotent: true, auditId: existing.id }, 200, cors);

      const { data: approvalId, error } = await userClient.rpc("decide_case_report_version", {
        p_case_id: caseId,
        p_report_id: reportId,
        p_report_version_id: reportVersionId,
        p_decision: decision,
        p_decision_reason: decisionReason,
      });
      if (error) return response({ error: "Report decision failed" }, 400, cors);

      const audit = await writeAudit(adminClient, {
        caseId,
        actorUserId: user.id,
        action: "video_report_admin.decide_report_version",
        resourceType: "report",
        resourceId: reportId,
        details: { idempotency_key: idempotencyKey, decision },
      });

      return response({ ok: true, approvalId, auditId: audit.id }, 200, cors);
    }

    if (action === "release_report_version") {
      const tenantId = requiredUuid(body, "tenantId");
      const caseId = requiredUuid(body, "caseId");
      const reportId = requiredUuid(body, "reportId");
      const reportVersionId = requiredUuid(body, "reportVersionId");
      const renderedFileId = requiredUuid(body, "renderedFileId");
      const releaseNotes = optionalString(body, "releaseNotes", 1000) ?? "";
      const idempotencyKey = requiredString(body, "idempotencyKey", 128);

      await assertCaseRole(userClient, caseId, ["supervisor", "admin"]);
      await assertCaseTenant(userClient, caseId, tenantId);

      const existing = await findIdempotentAudit(adminClient, {
        idempotencyKey,
        actorUserId: user.id,
        action: "video_report_admin.release_report_version",
        resourceType: "report",
        resourceId: reportId,
        caseId,
      });
      if (existing) return response({ ok: true, idempotent: true, auditId: existing.id }, 200, cors);

      const { data: releaseEventId, error } = await userClient.rpc("release_case_report_version", {
        p_case_id: caseId,
        p_report_id: reportId,
        p_report_version_id: reportVersionId,
        p_rendered_file_id: renderedFileId,
        p_release_notes: releaseNotes,
      });
      if (error) return response({ error: "Report release failed" }, 400, cors);

      const audit = await writeAudit(adminClient, {
        caseId,
        actorUserId: user.id,
        action: "video_report_admin.release_report_version",
        resourceType: "report",
        resourceId: reportId,
        details: { idempotency_key: idempotencyKey },
      });

      return response({ ok: true, releaseEventId, auditId: audit.id }, 200, cors);
    }

    const tenantId = requiredUuid(body, "tenantId");
    const caseId = requiredUuid(body, "caseId");
    const deliveryId = requiredUuid(body, "deliveryId");
    const acknowledgementText = requiredString(body, "acknowledgementText", 1000);
    const idempotencyKey = requiredString(body, "idempotencyKey", 128);

    await assertCaseRole(userClient, caseId, ["supervisor", "admin"]);
    await assertCaseTenant(userClient, caseId, tenantId);

    const existing = await findIdempotentAudit(adminClient, {
      idempotencyKey,
      actorUserId: user.id,
      action: "video_report_admin.acknowledge_video_delivery",
      resourceType: "video_report_delivery",
      resourceId: deliveryId,
      caseId,
    });
    if (existing) return response({ ok: true, idempotent: true, auditId: existing.id }, 200, cors);

    const { data, error } = await userClient.rpc("acknowledge_video_report_delivery", {
      target_delivery_id: deliveryId,
      acknowledgement_text: acknowledgementText,
    });
    if (error || !data) return response({ error: "Video delivery acknowledgement failed" }, 400, cors);

    const acknowledgement = Array.isArray(data) ? data[0] : data;
    const acknowledgementId = acknowledgement && typeof acknowledgement === "object" && "id" in acknowledgement
      ? String((acknowledgement as Record<string, unknown>).id ?? "")
      : null;

    const audit = await writeAudit(adminClient, {
      caseId,
      actorUserId: user.id,
      action: "video_report_admin.acknowledge_video_delivery",
      resourceType: "video_report_delivery",
      resourceId: deliveryId,
      details: { idempotency_key: idempotencyKey },
    });

    return response({ ok: true, acknowledgementId, auditId: audit.id }, 200, cors);
  } catch (error) {
    return errorResponse(error, cors);
  }
});
