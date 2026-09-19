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
  requiredString,
  requiredUuid,
  response,
  writeAudit,
} from "../_shared/privileged.ts";

Deno.serve(async (req: Request) => {
  const cors = corsHeaders(req);
  if (!cors) return response({ error: "Origin not allowed" }, 403);

  const guarded = methodGuard(req, cors);
  if (guarded) return guarded;

  try {
    const { user, userClient, adminClient } = await authenticate(req);
    const body = parseBody(await req.json());

    const tenantId = requiredUuid(body, "tenantId");
    const organisationId = requiredUuid(body, "organisationId");
    const exportRequestId = requiredUuid(body, "exportRequestId");
    const idempotencyKey = requiredString(body, "idempotencyKey", 128);

    await assertAdminRole(userClient);
    await assertOrganisationTenantAccess(userClient, user, organisationId, tenantId);

    const existing = await findIdempotentAudit(adminClient, {
      idempotencyKey,
      actorUserId: user.id,
      action: "sensitive_export.validate_tenant_export",
      resourceType: "platform_tenant_export_request",
      resourceId: exportRequestId,
      caseId: null,
    });
    if (existing) return response({ ok: true, idempotent: true, auditId: existing.id }, 200, cors);

    const { data: approved, error } = await userClient.rpc("can_export_platform_tenant_data", {
      p_export_request_id: exportRequestId,
    });
    if (error || !approved) return response({ error: "Sensitive export request not approved" }, 403, cors);

    const audit = await writeAudit(adminClient, {
      actorUserId: user.id,
      action: "sensitive_export.validate_tenant_export",
      resourceType: "platform_tenant_export_request",
      resourceId: exportRequestId,
      details: { idempotency_key: idempotencyKey, tenant_id: tenantId, organisation_id: organisationId },
    });

    return response({ ok: true, exportApproved: true, auditId: audit.id }, 200, cors);
  } catch (error) {
    return errorResponse(error, cors);
  }
});
