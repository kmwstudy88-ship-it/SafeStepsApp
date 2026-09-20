import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  assertAdminRole,
  assertOrganisationTenantAccess,
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

const actions = ["activate_flow_version", "rollback_flow_version"] as const;

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
    const organisationId = requiredUuid(body, "organisationId");
    const targetId = requiredUuid(body, "targetId");
    const reason = requiredString(body, "reason", 1000);
    const idempotencyKey = requiredString(body, "idempotencyKey", 128);

    await assertAdminRole(userClient);
    await assertOrganisationTenantAccess(userClient, user, organisationId, tenantId);

    const auditAction = action === "activate_flow_version"
      ? "ai_governance.activate_flow_version"
      : "ai_governance.rollback_flow_version";

    const existing = await findIdempotentAudit(adminClient, {
      idempotencyKey,
      actorUserId: user.id,
      action: auditAction,
      resourceType: "personal_ai_flow_version",
      resourceId: targetId,
      caseId: null,
    });

    if (existing) return response({ ok: true, idempotent: true, auditId: existing.id }, 200, cors);

    const rpc = action === "activate_flow_version"
      ? "activate_personal_ai_flow_version"
      : "rollback_personal_ai_flow_version";
    const reasonKey = action === "activate_flow_version" ? "activation_reason" : "rollback_reason";

    const { data, error } = await userClient.rpc(rpc, {
      target_id: targetId,
      [reasonKey]: reason,
    });

    if (error || !data) return response({ error: "AI governance action failed" }, 400, cors);

    const row = Array.isArray(data) ? data[0] : data;
    const record = row && typeof row === "object" ? row as Record<string, unknown> : {};

    const audit = await writeAudit(adminClient, {
      actorUserId: user.id,
      action: auditAction,
      resourceType: "personal_ai_flow_version",
      resourceId: targetId,
      details: { idempotency_key: idempotencyKey, tenant_id: tenantId, organisation_id: organisationId },
    });

    return response({
      ok: true,
      flowId: record.flow_id ?? null,
      version: record.version ?? null,
      status: record.status ?? null,
      auditId: audit.id,
    }, 200, cors);
  } catch (error) {
    return errorResponse(error, cors);
  }
});
