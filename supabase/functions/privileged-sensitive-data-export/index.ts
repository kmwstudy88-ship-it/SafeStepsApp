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
import { handlePrivilegedSensitiveDataExport } from "./handler.mjs";

Deno.serve((req: Request) => handlePrivilegedSensitiveDataExport(req, {
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
}));
