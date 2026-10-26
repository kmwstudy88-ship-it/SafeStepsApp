import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const jsonHeaders = { "Content-Type": "application/json", "Cache-Control": "no-store" };

function withCors(req: Request) {
  const origin = req.headers.get("origin") ?? "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

Deno.serve(async (req: Request) => {
  const cors = withCors(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...cors, ...jsonHeaders } });

  try {
    const authorization = req.headers.get("authorization") ?? "";
    const token = authorization.replace(/^Bearer\s+/i, "");
    if (!token) throw new Error("Authentication required");

    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } });
    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    const { data: authData, error: authError } = await userClient.auth.getUser(token);
    if (authError || !authData.user) throw new Error("Authentication failed");

    const body = await req.json();
    const actorUserId = body.actorUserId;
    if (!actorUserId || !body.action || !body.resourceType) {
      throw new Error("actorUserId, action, and resourceType are required");
    }

    const { data, error } = await admin
      .from("audit_logs")
      .insert({
        case_id: body.caseId ?? null,
        actor_user_id: actorUserId,
        action: body.action,
        resource_type: body.resourceType,
        resource_id: body.resourceId ?? null,
        details: body.details ?? {},
      })
      .select("id, case_id, action, resource_type, created_at")
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, auditLog: data }), { headers: { ...cors, ...jsonHeaders } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create audit log entry";
    return new Response(JSON.stringify({ ok: false, error: message }), { status: 400, headers: { ...cors, ...jsonHeaders } });
  }
});
