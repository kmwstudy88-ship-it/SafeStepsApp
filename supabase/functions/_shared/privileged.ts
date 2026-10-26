import { createClient, type SupabaseClient, type User } from "npm:@supabase/supabase-js@2.57.4";

export const jsonHeaders = { "Content-Type": "application/json", "Cache-Control": "no-store" };
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type JsonRecord = Record<string, unknown>;

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function corsHeaders(req: Request) {
  const origin = req.headers.get("origin");
  const allowed = (Deno.env.get("SAFESTEPS_ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (origin && allowed.length > 0 && !allowed.includes(origin)) return null;

  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

export function methodGuard(req: Request, cors: Record<string, string>) {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return response({ error: "Method not allowed" }, 405, cors);
  }
  return null;
}

export function response(payload: JsonRecord, status = 200, cors: Record<string, string> = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...cors, ...jsonHeaders },
  });
}

export function parseBody(value: unknown): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpError(400, "Request body must be a JSON object");
  }
  return value as JsonRecord;
}

function env(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new HttpError(500, `Missing required environment variable: ${name}`);
  return value;
}

function extractBearer(req: Request) {
  const authorization = req.headers.get("authorization") ?? "";
  const token = authorization.replace(/^Bearer\s+/i, "").trim();
  if (!token) throw new HttpError(401, "Authentication required");
  return { authorization, token };
}

export async function authenticate(req: Request) {
  const { authorization, token } = extractBearer(req);
  const url = env("SUPABASE_URL");
  const anon = env("SUPABASE_ANON_KEY");
  const service = env("SUPABASE_SERVICE_ROLE_KEY");

  const userClient = createClient(url, anon, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const adminClient = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await userClient.auth.getUser(token);
  if (error || !data.user) throw new HttpError(401, "Authentication failed");

  return { user: data.user, userClient, adminClient };
}

export function requiredUuid(input: JsonRecord, key: string) {
  const value = input[key];
  if (typeof value !== "string" || !uuidPattern.test(value)) {
    throw new HttpError(400, `${key} must be a UUID`);
  }
  return value;
}

export function optionalUuid(input: JsonRecord, key: string) {
  const value = input[key];
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || !uuidPattern.test(value)) {
    throw new HttpError(400, `${key} must be a UUID when provided`);
  }
  return value;
}

export function requiredString(input: JsonRecord, key: string, maxLength = 5000) {
  const value = input[key];
  if (typeof value !== "string") throw new HttpError(400, `${key} must be a string`);
  const trimmed = value.trim();
  if (!trimmed) throw new HttpError(400, `${key} is required`);
  if (trimmed.length > maxLength) throw new HttpError(400, `${key} exceeds max length`);
  return trimmed;
}

export function optionalString(input: JsonRecord, key: string, maxLength = 5000) {
  const value = input[key];
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") throw new HttpError(400, `${key} must be a string when provided`);
  const trimmed = value.trim();
  if (trimmed.length > maxLength) throw new HttpError(400, `${key} exceeds max length`);
  return trimmed;
}

export function requiredEnum<T extends string>(input: JsonRecord, key: string, allowed: readonly T[]) {
  const value = input[key];
  if (typeof value !== "string") throw new HttpError(400, `${key} must be a string`);
  const normalized = value.trim() as T;
  if (!allowed.includes(normalized)) {
    throw new HttpError(400, `${key} must be one of: ${allowed.join(", ")}`);
  }
  return normalized;
}

export function optionalBoolean(input: JsonRecord, key: string, defaultValue = false) {
  const value = input[key];
  if (value === undefined || value === null) return defaultValue;
  if (typeof value !== "boolean") throw new HttpError(400, `${key} must be boolean when provided`);
  return value;
}

export function optionalInteger(input: JsonRecord, key: string, defaultValue: number, min: number, max: number) {
  const raw = input[key];
  if (raw === undefined || raw === null || raw === "") return defaultValue;
  const value = Number(raw);
  if (!Number.isInteger(value)) throw new HttpError(400, `${key} must be an integer`);
  if (value < min || value > max) throw new HttpError(400, `${key} must be between ${min} and ${max}`);
  return value;
}

export async function assertCaseRole(
  userClient: SupabaseClient,
  caseId: string,
  roles: string[],
) {
  const [{ data: activeMembership, error: membershipError }, { data: hasRole, error: roleError }] = await Promise.all([
    userClient.rpc("user_has_active_case_membership", { target_case_id: caseId }),
    userClient.rpc("user_has_case_role", { target_case_id: caseId, allowed_roles: roles }),
  ]);

  if (membershipError || roleError || !activeMembership || !hasRole) {
    throw new HttpError(403, "Case access denied");
  }
}

export async function assertCaseTenant(
  userClient: SupabaseClient,
  caseId: string,
  tenantId: string,
) {
  const { data, error } = await userClient
    .from("reunification_cases")
    .select("id")
    .eq("id", caseId)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (error || !data) throw new HttpError(403, "Tenant access denied for case");
}

export async function assertOrganisationTenantAccess(
  userClient: SupabaseClient,
  user: User,
  organisationId: string,
  tenantId: string,
) {
  const [{ data: isMember, error: membershipError }, { data: orgRow, error: orgError }] = await Promise.all([
    userClient.rpc("safesteps_is_active_member", {
      target_user_id: user.id,
      target_organisation_id: organisationId,
    }),
    userClient
      .from("organisations")
      .select("id")
      .eq("id", organisationId)
      .eq("tenant_id", tenantId)
      .maybeSingle(),
  ]);

  if (membershipError || !isMember || orgError || !orgRow) {
    throw new HttpError(403, "Organisation or tenant access denied");
  }
}

export async function assertAdminRole(userClient: SupabaseClient) {
  const { data, error } = await userClient.rpc("current_user_has_role", { role_name: "admin" });
  if (error || !data) throw new HttpError(403, "Administrator access required");
}

type IdempotencyCheck = {
  idempotencyKey: string;
  actorUserId: string;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  caseId?: string | null;
};

export async function findIdempotentAudit(
  adminClient: SupabaseClient,
  check: IdempotencyCheck,
) {
  let query = adminClient
    .from("audit_logs")
    .select("id, created_at")
    .eq("actor_user_id", check.actorUserId)
    .eq("action", check.action)
    .eq("resource_type", check.resourceType)
    .contains("details", { idempotency_key: check.idempotencyKey })
    .order("created_at", { ascending: false })
    .limit(1);

  if (check.caseId) query = query.eq("case_id", check.caseId);
  if (check.resourceId) query = query.eq("resource_id", check.resourceId);

  const { data, error } = await query;
  if (error) throw new HttpError(500, "Failed to evaluate idempotency");
  return data?.[0] ?? null;
}

type AuditInput = {
  caseId?: string | null;
  actorUserId: string;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  details?: JsonRecord;
};

export async function writeAudit(adminClient: SupabaseClient, input: AuditInput) {
  const { data, error } = await adminClient
    .from("audit_logs")
    .insert({
      case_id: input.caseId ?? null,
      actor_user_id: input.actorUserId,
      action: input.action,
      resource_type: input.resourceType,
      resource_id: input.resourceId ?? null,
      details: input.details ?? {},
    })
    .select("id, created_at")
    .single();

  if (error) throw new HttpError(500, "Failed to write audit record");
  return data;
}

export function errorResponse(error: unknown, cors: Record<string, string>) {
  if (error instanceof HttpError) return response({ error: error.message }, error.status, cors);
  return response({ error: "Request failed" }, 400, cors);
}
