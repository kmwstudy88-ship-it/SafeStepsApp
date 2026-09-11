import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const jsonHeaders = { "Content-Type": "application/json", "Cache-Control": "no-store" };

function cors(req: Request) {
  const origin = req.headers.get("origin") ?? "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

Deno.serve(async (req: Request) => {
  const headers = cors(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...headers, ...jsonHeaders } });

  try {
    const authorization = req.headers.get("authorization") ?? "";
    const token = authorization.replace(/^Bearer\s+/i, "");
    if (!token) throw new Error("Authentication required");

    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(url, anon, { global: { headers: { Authorization: authorization } } });
    const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });

    const { data: authData, error: authError } = await userClient.auth.getUser(token);
    if (authError || !authData.user) throw new Error("Authentication failed");

    const body = await req.json();
    if (!body.caseId || !body.actorUserId || body.riskScore == null || !body.riskLevel) {
      throw new Error("caseId, actorUserId, riskScore, and riskLevel are required");
    }

    const escalationRequired = ["high", "critical"].includes(String(body.riskLevel).toLowerCase()) || Number(body.riskScore) >= 65;
    if (!escalationRequired) {
      return new Response(JSON.stringify({ ok: true, escalated: false, reason: "Risk score below escalation threshold" }), { headers: { ...headers, ...jsonHeaders } });
    }

    const payload = {
      risk_score: Number(body.riskScore),
      risk_level: body.riskLevel,
      analysis_id: body.analysisId ?? null,
      triggered_at: new Date().toISOString(),
      notes: body.notes ?? null,
    };

    const { data: eventRow, error: eventError } = await admin
      .from("events")
      .insert({
        case_id: body.caseId,
        analysis_id: body.analysisId ?? null,
        actor_user_id: body.actorUserId,
        event_type: "risk_escalation_triggered",
        event_payload: payload,
      })
      .select("id, case_id, analysis_id, created_at")
      .single();

    if (eventError) throw eventError;

    const { error: auditError } = await admin.from("audit_logs").insert({
      case_id: body.caseId,
      actor_user_id: body.actorUserId,
      action: "risk_escalation_triggered",
      resource_type: "risk_assessment",
      resource_id: body.analysisId ?? null,
      details: payload,
    });

    if (auditError) throw auditError;

    return new Response(JSON.stringify({ ok: true, escalated: true, event: eventRow }), { headers: { ...headers, ...jsonHeaders } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Risk escalation failed";
    return new Response(JSON.stringify({ ok: false, error: message }), { status: 400, headers: { ...headers, ...jsonHeaders } });
  }
});
