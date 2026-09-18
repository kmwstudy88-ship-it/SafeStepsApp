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
    const userClient = createClient(url, anon, { global: { headers: { Authorization: authorization } } });

    const { data: authData, error: authError } = await userClient.auth.getUser(token);
    if (authError || !authData.user) throw new Error("Authentication failed");

    const body = await req.json();
    if (!body.caseId || body.riskScore == null || !body.riskLevel) {
      throw new Error("caseId, riskScore, and riskLevel are required");
    }

    const escalationRequired = ["high", "critical"].includes(String(body.riskLevel).toLowerCase()) || Number(body.riskScore) >= 65;
    if (!escalationRequired) {
      return new Response(JSON.stringify({ ok: true, escalated: false, reason: "Risk score below escalation threshold" }), { headers: { ...headers, ...jsonHeaders } });
    }

    const backendUrl = (Deno.env.get("SAFESTEPS_BACKEND_URL") ?? "http://localhost:3000").replace(/\/$/, "");
    const riskResponse = await fetch(`${backendUrl}/cases/${body.caseId}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
      },
      body: JSON.stringify({
        eventType: "external_risk_signal",
        eventSource: "edge_escalate_risk",
        note: body.notes ?? null,
        hard_flags: Array.isArray(body.hardFlags) ? body.hardFlags : [],
        doc_signals: Array.isArray(body.docSignals) ? body.docSignals : [],
        payload: {
          external_risk_signal: {
            risk_score: Number(body.riskScore),
            risk_level: body.riskLevel,
            analysis_id: body.analysisId ?? null,
            triggered_at: new Date().toISOString(),
            actor_auth_user_id: authData.user.id,
          },
        },
      }),
    });
    const riskBody = await riskResponse.json().catch(() => null);
    if (!riskResponse.ok) throw new Error(riskBody?.error?.message ?? `Risk escalation request failed (${riskResponse.status})`);

    return new Response(JSON.stringify({
      ok: true,
      escalated: true,
      snapshot: riskBody?.snapshot ?? null,
      alerts: riskBody?.alerts ?? [],
      tasks: riskBody?.tasks ?? [],
      human_review_required: true,
    }), { headers: { ...headers, ...jsonHeaders } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Risk escalation failed";
    return new Response(JSON.stringify({ ok: false, error: message }), { status: 400, headers: { ...headers, ...jsonHeaders } });
  }
});
