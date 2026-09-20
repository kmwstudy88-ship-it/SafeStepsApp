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
  optionalInteger,
  optionalString,
  parseBody,
  requiredEnum,
  requiredString,
  requiredUuid,
  response,
  writeAudit,
} from "../_shared/privileged.ts";

const actions = ["request_export", "request_correction", "prepare_delivery", "confirm_export"] as const;

Deno.serve(async (req: Request) => {
  const cors = corsHeaders(req);
  if (!cors) return response({ error: "Origin not allowed" }, 403);

  const guarded = methodGuard(req, cors);
  if (guarded) return guarded;

  try {
    const { user, userClient, adminClient } = await authenticate(req);
    const body = parseBody(await req.json());
    const action = requiredEnum(body, "action", actions);

    if (action === "request_export") {
      const tenantId = requiredUuid(body, "tenantId");
      const caseId = requiredUuid(body, "caseId");
      const releaseEventId = requiredUuid(body, "releaseEventId");
      const recipientId = requiredUuid(body, "recipientId");
      const authority = requiredString(body, "authority", 250);
      const purpose = requiredString(body, "purpose", 250);
      const expirySeconds = optionalInteger(body, "expirySeconds", 600, 60, 600);
      const idempotencyKey = requiredString(body, "idempotencyKey", 128);

      await assertCaseRole(userClient, caseId, ["caseworker", "supervisor", "admin", "court_viewer"]);
      await assertCaseTenant(userClient, caseId, tenantId);

      const existing = await findIdempotentAudit(adminClient, {
        idempotencyKey,
        actorUserId: user.id,
        action: "report_export.request_export",
        resourceType: "report_export",
        resourceId: releaseEventId,
        caseId,
      });
      if (existing) return response({ ok: true, idempotent: true, auditId: existing.id }, 200, cors);

      const { data: exportEventId, error } = await userClient.rpc("request_case_report_export", {
        p_case_id: caseId,
        p_release_event_id: releaseEventId,
        p_recipient_id: recipientId,
        p_authority: authority,
        p_purpose: purpose,
        p_expiry_seconds: expirySeconds,
      });

      if (error || !exportEventId) return response({ error: "Report export request failed" }, 400, cors);

      const audit = await writeAudit(adminClient, {
        caseId,
        actorUserId: user.id,
        action: "report_export.request_export",
        resourceType: "report_export",
        resourceId: String(exportEventId),
        details: { idempotency_key: idempotencyKey },
      });

      return response({ ok: true, exportEventId, auditId: audit.id }, 200, cors);
    }

    if (action === "request_correction") {
      const tenantId = requiredUuid(body, "tenantId");
      const caseId = requiredUuid(body, "caseId");
      const reportId = requiredUuid(body, "reportId");
      const correctionType = requiredString(body, "correctionType", 100);
      const description = requiredString(body, "description", 1000);
      const materialChange = optionalBoolean(body, "materialChange", false);
      const idempotencyKey = requiredString(body, "idempotencyKey", 128);

      await assertCaseRole(userClient, caseId, ["caseworker", "supervisor", "admin"]);
      await assertCaseTenant(userClient, caseId, tenantId);

      const existing = await findIdempotentAudit(adminClient, {
        idempotencyKey,
        actorUserId: user.id,
        action: "report_export.request_correction",
        resourceType: "report",
        resourceId: reportId,
        caseId,
      });
      if (existing) return response({ ok: true, idempotent: true, auditId: existing.id }, 200, cors);

      const { data: correctionId, error } = await userClient.rpc("request_case_report_correction", {
        p_case_id: caseId,
        p_report_id: reportId,
        p_correction_type: correctionType,
        p_description: description,
        p_material_change: materialChange,
      });
      if (error || !correctionId) return response({ error: "Report correction request failed" }, 400, cors);

      const audit = await writeAudit(adminClient, {
        caseId,
        actorUserId: user.id,
        action: "report_export.request_correction",
        resourceType: "report",
        resourceId: reportId,
        details: { idempotency_key: idempotencyKey, correction_id: correctionId },
      });

      return response({ ok: true, correctionId, auditId: audit.id }, 200, cors);
    }

    if (action === "prepare_delivery") {
      const tenantId = requiredUuid(body, "tenantId");
      const caseId = requiredUuid(body, "caseId");
      const releaseEventId = requiredUuid(body, "releaseEventId");
      const recipientId = requiredUuid(body, "recipientId");
      const expiresMinutes = optionalInteger(body, "expiresMinutes", 60, 5, 1440);
      const maxDownloads = optionalInteger(body, "maxDownloads", 1, 1, 10);
      const idempotencyKey = requiredString(body, "idempotencyKey", 128);

      await assertCaseRole(userClient, caseId, ["supervisor", "admin"]);
      await assertCaseTenant(userClient, caseId, tenantId);

      const existing = await findIdempotentAudit(adminClient, {
        idempotencyKey,
        actorUserId: user.id,
        action: "report_export.prepare_delivery",
        resourceType: "report_release",
        resourceId: releaseEventId,
        caseId,
      });
      if (existing) return response({ ok: true, idempotent: true, auditId: existing.id }, 200, cors);

      const { data, error } = await userClient.rpc("prepare_case_report_delivery", {
        p_case_id: caseId,
        p_release_event_id: releaseEventId,
        p_recipient_id: recipientId,
        p_expires_minutes: expiresMinutes,
        p_max_downloads: maxDownloads,
      });
      if (error) return response({ error: "Report delivery preparation failed" }, 400, cors);

      const challenge = Array.isArray(data) ? data[0] : data;
      if (!challenge || typeof challenge !== "object") {
        return response({ error: "Report delivery challenge unavailable" }, 400, cors);
      }

      const challengeRecord = challenge as Record<string, unknown>;
      const audit = await writeAudit(adminClient, {
        caseId,
        actorUserId: user.id,
        action: "report_export.prepare_delivery",
        resourceType: "report_release",
        resourceId: releaseEventId,
        details: { idempotency_key: idempotencyKey },
      });

      return response({
        ok: true,
        challengeId: challengeRecord.challenge_id ?? null,
        deliveryToken: challengeRecord.delivery_token ?? null,
        verificationCode: challengeRecord.verification_code ?? null,
        expiresAt: challengeRecord.expires_at ?? null,
        auditId: audit.id,
      }, 200, cors);
    }

    const exportEventId = requiredUuid(body, "exportEventId");
    const idempotencyKey = requiredString(body, "idempotencyKey", 128);

    const existing = await findIdempotentAudit(adminClient, {
      idempotencyKey,
      actorUserId: user.id,
      action: "report_export.confirm_export",
      resourceType: "report_export",
      resourceId: exportEventId,
      caseId: null,
    });
    if (existing) return response({ ok: true, idempotent: true, auditId: existing.id }, 200, cors);

    const { data: source, error: sourceError } = await adminClient
      .from("case_report_export_events")
      .select("id, case_id, release_event_id, report_id, report_version, recipient_id, rendered_file_id, authority, purpose, request_reference")
      .eq("id", exportEventId)
      .eq("requested_by", user.id)
      .single();

    if (sourceError || !source) return response({ error: "Export request not found" }, 404, cors);

    const { error: insertError } = await adminClient.from("case_report_export_events").insert({
      case_id: source.case_id,
      release_event_id: source.release_event_id,
      report_id: source.report_id,
      report_version: source.report_version,
      recipient_id: source.recipient_id,
      rendered_file_id: source.rendered_file_id,
      requested_by: user.id,
      authority: source.authority,
      purpose: source.purpose,
      action: "download_confirmed",
      outcome: "completed",
      request_reference: source.request_reference,
    });
    if (insertError) return response({ error: "Export confirmation failed" }, 400, cors);

    const caseId = typeof source.case_id === "string" ? source.case_id : null;
    const audit = await writeAudit(adminClient, {
      caseId,
      actorUserId: user.id,
      action: "report_export.confirm_export",
      resourceType: "report_export",
      resourceId: exportEventId,
      details: { idempotency_key: idempotencyKey },
    });

    return response({ ok: true, confirmed: true, auditId: audit.id }, 200, cors);
  } catch (error) {
    return errorResponse(error, cors);
  }
});
