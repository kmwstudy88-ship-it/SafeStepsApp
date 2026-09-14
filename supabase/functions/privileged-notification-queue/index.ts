import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  assertCaseRole,
  assertCaseTenant,
  authenticate,
  corsHeaders,
  errorResponse,
  findIdempotentAudit,
  methodGuard,
  parseBody,
  requiredEnum,
  requiredString,
  requiredUuid,
  response,
  writeAudit,
} from "../_shared/privileged.ts";

const actions = ["queue_video_notification", "queue_background_job"] as const;

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
    const idempotencyKey = requiredString(body, "idempotencyKey", 128);

    await assertCaseRole(userClient, caseId, ["caseworker", "supervisor", "admin", "clinician"]);
    await assertCaseTenant(userClient, caseId, tenantId);

    const eventType = action === "queue_video_notification" ? "video_notification_queued" : "background_job_queued";
    const resourceType = action === "queue_video_notification" ? "notification_queue" : "background_queue";
    const resourceId = action === "queue_video_notification"
      ? requiredUuid(body, "recipientUserId")
      : requiredString(body, "jobType", 100);

    const existing = await findIdempotentAudit(adminClient, {
      idempotencyKey,
      actorUserId: user.id,
      action: `queue.${action}`,
      resourceType,
      resourceId,
      caseId,
    });
    if (existing) return response({ ok: true, idempotent: true, auditId: existing.id }, 200, cors);

    const payload = action === "queue_video_notification"
      ? {
        notification_type: requiredString(body, "notificationType", 100),
        recipient_user_id: resourceId,
      }
      : {
        job_type: resourceId,
        priority: requiredEnum(body, "priority", ["low", "normal", "high", "urgent"] as const),
      };

    const { data: eventRow, error } = await adminClient
      .from("events")
      .insert({
        case_id: caseId,
        actor_user_id: user.id,
        event_type: eventType,
        event_payload: { ...payload, idempotency_key: idempotencyKey, requested_at: new Date().toISOString() },
      })
      .select("id, created_at")
      .single();

    if (error || !eventRow) return response({ error: "Queue submission failed" }, 400, cors);

    const audit = await writeAudit(adminClient, {
      caseId,
      actorUserId: user.id,
      action: `queue.${action}`,
      resourceType,
      resourceId,
      details: { idempotency_key: idempotencyKey, queue_event_id: eventRow.id },
    });

    return response({ ok: true, queueEventId: eventRow.id, auditId: audit.id }, 200, cors);
  } catch (error) {
    return errorResponse(error, cors);
  }
});
