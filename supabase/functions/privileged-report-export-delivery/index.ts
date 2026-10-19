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
  parseBody,
  requiredEnum,
  requiredString,
  requiredUuid,
  response,
  writeAudit,
} from "../_shared/privileged.ts";
import { handlePrivilegedReportExportDelivery } from "./handler.mjs";

Deno.serve((req: Request) => handlePrivilegedReportExportDelivery(req, {
  assertCaseRole,
  assertCaseTenant,
  authenticate,
  corsHeaders,
  errorResponse,
  findIdempotentAudit,
  methodGuard,
  optionalBoolean,
  optionalInteger,
  parseBody,
  requiredEnum,
  requiredString,
  requiredUuid,
  response,
  writeAudit,
}));
