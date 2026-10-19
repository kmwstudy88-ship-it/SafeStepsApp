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
import { handlePrivilegedVideoReportAdmin } from "./handler.mjs";

Deno.serve((req: Request) => handlePrivilegedVideoReportAdmin(req, {
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
}));
