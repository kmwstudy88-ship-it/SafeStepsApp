import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const jsonHeaders = { "Content-Type": "application/json", "Cache-Control": "no-store" };

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin");
  const allowed = (Deno.env.get("SAFESTEPS_ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((value: string) => value.trim())
    .filter(Boolean);
  if (origin && allowed.length > 0 && !allowed.includes(origin)) return null;
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function requireString(value: unknown, field: string) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`${field} is required`);
  return text;
}

Deno.serve(async (req: Request) => {
  const cors = corsHeaders(req);
  if (!cors) return new Response(JSON.stringify({ error: "Origin not allowed" }), { status: 403, headers: jsonHeaders });
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...cors, ...jsonHeaders } });

  try {
    const authorization = req.headers.get("authorization") ?? "";
    const token = authorization.replace(/^Bearer\s+/i, "");
    if (!token) throw new Error("Authentication required");

    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: authorization } },
    });

    const { data: authData, error: authError } = await userClient.auth.getUser(token);
    if (authError || !authData.user) throw new Error("Authentication failed");

    const body = await req.json();
    const action = requireString(body.action, "action");

    if (action === "decide_version") {
      const { data, error } = await userClient.rpc("decide_case_report_version", {
        p_case_id: requireString(body.caseId, "caseId"),
        p_report_id: requireString(body.reportId, "reportId"),
        p_report_version_id: requireString(body.reportVersionId, "reportVersionId"),
        p_decision: requireString(body.decision, "decision"),
        p_decision_reason: String(body.decisionReason ?? ""),
      });
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, action, approvalId: data }), { headers: { ...cors, ...jsonHeaders } });
    }

    if (action === "release_version") {
      const { data, error } = await userClient.rpc("release_case_report_version", {
        p_case_id: requireString(body.caseId, "caseId"),
        p_report_id: requireString(body.reportId, "reportId"),
        p_report_version_id: requireString(body.reportVersionId, "reportVersionId"),
        p_rendered_file_id: requireString(body.renderedFileId, "renderedFileId"),
        p_release_notes: String(body.releaseNotes ?? ""),
      });
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, action, releaseEventId: data }), { headers: { ...cors, ...jsonHeaders } });
    }

    throw new Error("Unsupported action");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    return new Response(JSON.stringify({ ok: false, error: message }), { status: 400, headers: { ...cors!, ...jsonHeaders } });
  }
});
