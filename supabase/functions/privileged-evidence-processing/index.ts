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
import { handlePrivilegedEvidenceProcessing } from "./handler.mjs";

Deno.serve((req: Request) => handlePrivilegedEvidenceProcessing(req, {
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
}));
